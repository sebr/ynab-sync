import debug from "debug";
import { Browser } from "puppeteer-core";
import { ScrapedTransaction } from "../scraper";
import AnzAccountScraper from "./AnzAccountScraper";
import { getTransactions } from "./getTransactions";

export const log: debug.Debugger = debug("ynab-sync:scraper:anz:checking");

export default class AnzCheckingAccountScraper extends AnzAccountScraper {
  protected scrapeTransactions = async (browser: Browser): Promise<ScrapedTransaction[]> => {
    log(`Scraping ${this.account.name}`);
    try {
      const page = await this.openAccountPage(browser);
      const scrapedTxns: ScrapedTransaction[] = await page.evaluate(getTransactions);
      return scrapedTxns;
    } catch (e) {
      log(e);
      return new Array<ScrapedTransaction>();
    }
  };
}
