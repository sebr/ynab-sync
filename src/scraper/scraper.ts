import { Browser } from "puppeteer-core";
import { Account } from "../lib/accounts";
import { Secrets } from "../lib/secrets";

export enum ScraperType {
  ANZ_CHECKING,
  ANZ_CREDIT_CARD,
  ANZ_HOME_LOAN,
  NAB,
  TWENTY_EIGHT_DEGREES
}

export interface ScrapedTransaction {
  day: string;
  month: string;
  year?: string;
  payee: string;
  amount: string;
}

export class Scraper {
  protected secrets: Secrets;
  protected account: Account;

  constructor({ secrets, account }: { secrets: Secrets; account: Account }) {
    this.secrets = secrets;
    this.account = account;
  }

  public async scrape(browser: Browser): Promise<ScrapedTransaction[]> {
    const txns = await this.scrapeTransactions(browser);
    return this.filterTransactions(txns);
  }

  // @ts-ignore: no-unused-variable
  protected scrapeTransactions(browser: Browser): Promise<ScrapedTransaction[]> {
    throw new Error("Implementation missing");
  }

  protected filterTransactions(txns: ScrapedTransaction[]): ScrapedTransaction[] {
    return txns;
  }
}
