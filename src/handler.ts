import SecretsManager from "aws-sdk/clients/secretsmanager";
import chromium from "chrome-aws-lambda";
import debug from "debug";
import "source-map-support/register";
import { BulkTransactions } from "ynab";
import { Account, getAccounts } from "./lib/accounts";
import ImportIds from "./lib/ImportIds";
import { notify } from "./lib/pushover";
import { uploadTransactions } from "./lib/s3";
import { Secrets } from "./lib/secrets";
import { toYnabTxn } from "./lib/utils";
import { submitTransactions } from "./lib/ynab";
import { TwentyEightDegreesScraper } from "./scraper/28degrees";
import { AnzCheckingAccountScraper, AnzCreditCardScraper, AnzHomeLoanScraper } from "./scraper/anz";
import { NabScraper } from "./scraper/nab";
import { Scraper, ScraperType } from "./scraper/scraper";

const log: debug.Debugger = debug("ynab-sync:main");

interface ScrapeReport {
  account: Account;
  importedTransactions: string[];
  ignoredTransactions: string[];
}

interface SummaryReport {
  accounts: number;
  importCount: number;
  ignoreCount: number;
}

async function runJob({ account, secrets }: { account: Account; secrets: Secrets }): Promise<ScrapeReport | null> {
  log(`Scraping: ${account.name}`);

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.IS_LOCAL ? "" : await chromium.executablePath,
    headless: process.env.IS_LOCAL ? false : chromium.headless
  });

  try {
    const scraper: Scraper | null = createScraper(account, secrets);

    if (!scraper) {
      return Promise.reject(`No scraper configured for type ${account.scraperType}`);
    }

    const scrapedTxns = await scraper.scrape(browser);

    if (scrapedTxns.length === 0) {
      log(`No scraped transactions for ${account.name}`);
      return null;
    }

    const idCreator = new ImportIds();

    const ynabTxns = scrapedTxns.map(txn => toYnabTxn({ account, txn, idCreator }));

    const txns: BulkTransactions = {
      transactions: ynabTxns
    };

    if (account.debug) {
      const url = await uploadTransactions(account.name, {
        scrapedTransactions: scrapedTxns,
        ynabTransactions: ynabTxns
      });
      log(`Transaction debugging: ${url}`);
    }

    const dryRun = true; // fixme

    const results = await submitTransactions(account, txns, secrets.YNAB_API_TOKEN, dryRun);
    return {
      account,
      importedTransactions: results.data.bulk.transaction_ids,
      ignoredTransactions: results.data.bulk.duplicate_import_ids
    };
  } catch (e) {
    log(`Error:`, e);
  } finally {
    await browser.close();
  }

  return {
    account,
    importedTransactions: [],
    ignoredTransactions: []
  };
}

function createScraper(account: Account, secrets: any) {
  let scraper: Scraper | null = null;
  if (account.scraperType === ScraperType.ANZ_CHECKING) {
    scraper = new AnzCheckingAccountScraper({ secrets, account });
  } else if (account.scraperType === ScraperType.ANZ_HOME_LOAN) {
    scraper = new AnzHomeLoanScraper({ secrets, account });
  } else if (account.scraperType === ScraperType.ANZ_CREDIT_CARD) {
    scraper = new AnzCreditCardScraper({ secrets, account });
  } else if (account.scraperType === ScraperType.TWENTY_EIGHT_DEGREES) {
    scraper = new TwentyEightDegreesScraper({ secrets, account });
  } else if (account.scraperType === ScraperType.NAB) {
    scraper = new NabScraper({ secrets, account });
  }
  return scraper;
}

async function processAccounts({
  accounts,
  secrets
}: {
  accounts: Account[];
  secrets: Secrets;
}): Promise<SummaryReport> {
  const results: ScrapeReport[] = [];

  for (const account of accounts) {
    try {
      const jobResult = await runJob({ account, secrets });
      debug(`${account.name}:
      ${jobResult}`);
      if (jobResult) {
        results.push(jobResult);
      }
    } catch (e) {
      log(`**** Failed to run job for ${account.name}`);
      log(e);
    }
  }

  const res: SummaryReport = results.reduce(
    (accumulator, value) => {
      log(`${value.account.name}:
    ${value.importedTransactions.length} transactions
    ${value.ignoredTransactions.length} ignored duplicates`);
      return {
        accounts: accumulator.accounts + 1,
        importCount: accumulator.importCount + value.importedTransactions.length,
        ignoreCount: accumulator.ignoreCount + value.ignoredTransactions.length
      };
    },
    {
      accounts: 0,
      importCount: 0,
      ignoreCount: 0
    }
  );

  const notificationMessage = `${res.accounts} accounts scraped
${res.importCount} transactions imported
${res.ignoreCount} transactions ignored`;

  log(notificationMessage);
  try {
    if (!process.env.IS_LOCAL && secrets.PUSHOVER_USER && secrets.PUSHOVER_TOKEN) {
      await notify({
        title: "YNAB Sync",
        message: notificationMessage,
        user: secrets.PUSHOVER_USER,
        token: secrets.PUSHOVER_TOKEN
      });
    }
  } catch (e) {
    log(`Unable to send notification`);
    log(e);
  }
  return res;
}

async function decryptSecrets(): Promise<Secrets> {
  const secretId = process.env.SECRET_ID;
  if (!secretId) {
    return Promise.reject(`No SSM secret id provided`);
  }

  const secretsManager = new SecretsManager();

  const secrets = await secretsManager
    .getSecretValue({
      SecretId: secretId
    })
    .promise();

  const decryptedSecrets = JSON.parse(String(secrets.SecretString));
  return decryptedSecrets;
}

export async function sync(event: any): Promise<SummaryReport> {
  const secrets = await decryptSecrets();
  let accounts = await getAccounts(secrets);
  console.log(accounts);
  if (event && event.account_id) {
    accounts = accounts.filter(a => a.id === event.account_id);
    console.log(`Filter accounts with condition: ${JSON.stringify(event)}`);
  }
  return processAccounts({ accounts, secrets });
}
