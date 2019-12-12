import debug from "debug";
import { Browser } from "puppeteer-core";
import { delay } from "../../lib/utils";
import { ScrapedTransaction } from "../scraper";
import AnzAccountScraper from "./AnzAccountScraper";
import { getTransactions } from "./getTransactions";

export const log: debug.Debugger = debug("ynab-sync:scraper:anz:credit");

export default class AnzCreditCardScraper extends AnzAccountScraper {
  protected scrapeTransactions = async (browser: Browser): Promise<ScrapedTransaction[]> => {
    log(`Scraping ${this.account.name}`);
    try {
      log(`Opening account page: ${this.account.name}`);
      const page = await this.openAccountPage(browser);

      await Promise.all([page.waitFor(5000), page.click("#li_tab2")]);

      await this.scroll(page);
      await delay(500);
      await this.scroll(page);
      await delay(500);
      await this.scroll(page);
      await delay(500);
      await this.scroll(page);
      await delay(500);
      await this.scroll(page);

      const scrapedTxns: ScrapedTransaction[] = await page.evaluate(getTransactions);
      return scrapedTxns;
    } catch (e) {
      log(e);
      return new Array<ScrapedTransaction>();
    }
  };
}
