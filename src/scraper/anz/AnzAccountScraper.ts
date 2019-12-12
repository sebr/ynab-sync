import debug from "debug";
import { Browser, Page } from "puppeteer-core";
import { uploadScreenshot } from "../../lib/s3";
import { Scraper } from "../scraper";

const log: debug.Debugger = debug("ynab-sync:scraper:anz");

export default class AnzAccountScraper extends Scraper {
  protected scroll(page: Page) {
    return page.evaluate(_ => {
      window.scrollBy(0, 10000);
    });
  }

  protected async openAccountPage(browser: Browser): Promise<Page> {
    log(`Opening account page: ${this.account.name}`);
    const username = this.secrets.ANZ_BANK_USERNAME;
    const password = this.secrets.ANZ_BANK_PASSWORD;
    if (!username || !password) {
      log(`No credentials`);
      return Promise.reject("No username or password configured");
    }
    if (!this.account.selector) {
      log(`No account selector`);
      return Promise.reject("Anz accounts require the `selector` attribute");
    }
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto("https://www.anz.com/INETBANK/login.asp");

      await page.type("#crn", username);
      await page.type("#Password", password);
      await Promise.all([page.waitForNavigation(), page.click("#SignonButton")]);

      await Promise.all([page.waitForNavigation(), page.click(this.account.selector)]);
    } catch (e) {
      log(`Caught exception from 'openAccountPage'`);
      const imageData = await page.screenshot({ fullPage: true, encoding: "binary" });
      const url = await uploadScreenshot(this.account.name, imageData);
      log(url);
    }
    return page;
  }
}
