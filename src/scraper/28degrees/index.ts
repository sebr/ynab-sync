import debug from "debug";
import { Browser, Page } from "puppeteer-core";
import { uploadScreenshot } from "../../lib/s3";
import { ScrapedTransaction, Scraper } from "../scraper";
import { getTransactions } from "./getTransactions";

const log: debug.Debugger = debug("ynab-sync:scraper:28degrees");

class TwentyEightDegreesScraper extends Scraper {
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

  protected async openAccountPage(browser: Browser): Promise<Page> {
    const { username, password } = this.account;

    if (!username || !password) {
      return Promise.reject("No username or password configured");
    }

    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto("https://28degrees-online.latitudefinancial.com.au/access/login");

      await page.waitForSelector("#AccessToken_Username");
      await page.type("#AccessToken_Username", username);
      await page.type("#AccessToken_Password", password);

      await Promise.all([page.waitForNavigation(), page.click("#login-submit")]);
    } catch (e) {
      log(e);
      const imageData = await page.screenshot({ fullPage: true, encoding: "binary" });
      const url = await uploadScreenshot(this.account.name, imageData);
      log(url);
      throw new Error(url);
    }

    return page;
  }
}

export { TwentyEightDegreesScraper };
