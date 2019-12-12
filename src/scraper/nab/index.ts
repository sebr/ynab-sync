import debug from "debug";
import { Browser, Page } from "puppeteer-core";
import { ScrapedTransaction, Scraper } from "../scraper";
import { getTransactions } from "./getTransactions";

const log: debug.Debugger = debug("ynab-sync:scraper:nab");

class NabScraper extends Scraper {
  protected scrapeTransactions = async (browser: Browser): Promise<ScrapedTransaction[]> => {
    log(`Scraping ${this.account.name}`);

    const page = await this.openAccountPage(browser);

    const scrapedTxns: ScrapedTransaction[] = await page.evaluate(getTransactions);
    return scrapedTxns;
  };

  protected filterTransactions(txns: ScrapedTransaction[]): ScrapedTransaction[] {
    return txns.filter(txn => {
      return txn.payee !== "V3686 29/10 NAME-CHEAP COM PHOENIX";
    });
  }

  protected async openAccountPage(browser: Browser): Promise<Page> {
    const username = this.secrets.NAB_USERNAME;
    const password = this.secrets.NAB_PASSWORD;

    if (!username || !password) {
      return Promise.reject("No username or password configured");
    }

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.goto("https://ib.nab.com.au/nabib/index.jsp");

    await page.waitForSelector("#ib-user-text");
    await page.type(`input.ib-user-text[name='userid']`, username);
    await page.type(`input.ib-user-text[name='password']`, password);

    await Promise.all([page.waitForNavigation(), page.click(".cta a")]);
    await Promise.all([
      page.waitForNavigation(),
      page.click("#accountBalances_nonprimary_subaccounts .acctDetails a.accountNickname")
    ]);
    await page.waitForSelector(".content-container .transaction-history-table tbody");

    return page;
  }
}

export { NabScraper };
