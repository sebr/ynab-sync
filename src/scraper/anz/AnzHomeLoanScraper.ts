import debug from "debug";
import { Browser } from "puppeteer-core";
import { ScrapedTransaction } from "../scraper";
import AnzAccountScraper from "./AnzAccountScraper";
import { getTransactions } from "./getTransactions";

export const log: debug.Debugger = debug("ynab-sync:scraper:anz:homeloan");

export default class AnzHomeLoanScraper extends AnzAccountScraper {
  protected scrapeTransactions = async (browser: Browser): Promise<ScrapedTransaction[]> => {
    log(`Scraping ${this.account.name}`);
    try {
      const page = await this.openAccountPage(browser);
      await Promise.all([page.waitForNavigation(), page.click("#li_tab1")]);
      const scrapedTxns: ScrapedTransaction[] = await page.evaluate(getTransactions);
      return scrapedTxns;
    } catch (e) {
      log(e);
      return new Array<ScrapedTransaction>();
    }
  };
}
