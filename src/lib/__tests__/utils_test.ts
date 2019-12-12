import MockDate from "mockdate";
import { ScrapedTransaction, ScraperType } from "../../scraper/scraper";
import { Account } from "../accounts";
import ImportIds from "../ImportIds";
import * as utils from "../utils";

describe("Utils Test", () => {
  describe("#convertToAmount", () => {
    [
      { i: "", o: 0 },
      { i: "$5.00", o: 5000 },
      { i: "$06.06", o: 6060 },
      { i: "-$5.00", o: -5000 },
      { i: "- $5.00", o: -5000 },
      { i: "$5.00 ", o: 5000 },
      { i: "$5.00    ", o: 5000 },
      { i: "-$5.00 ", o: -5000 },
      { i: "   -$5.00 ", o: -5000 },
      { i: "   -$5.00", o: -5000 },
      { i: "$ 1649761.34", o: 1649761340 },
      { i: "$1,649,761.34", o: 1649761340 },
      { i: "$ 1,649,761.34", o: 1649761340 },
      { i: "-$ 1,649,761.34", o: -1649761340 },
      { i: "   +     $1,000.00 ", o: 1000000 },
      { i: "    -minus    $1,870.00 ", o: -1870000 },
      { i: "-$513.06", o: -513060 } // Floating point bug --> -513059.99999999994
    ].forEach(({ i, o }) => {
      test(`Input '${i}' string returns ${o}`, () => {
        expect(utils.convertToAmount(i)).toBe(o);
      });
    });
  });

  describe("#sanitizePayee", () => {
    [
      { i: "    pay friend    ", o: "pay friend" },
      { i: "ANZ M-BANKING FUNDS TFER TRANSFER 236255 FROM 392178835", o: "392178835" },
      { i: "PAYMENT TO COOL STUFF 3100742", o: "COOL STUFF 3100742" },
      { i: "ANZ INTERNET BANKING BPAY 28 DEGREES MC {849123}", o: "28 DEGREES MC {849123}" },
      { i: "ANZ INTERNET BANKING PAYMENT 298909 TO Guybrush Threepwood", o: "Guybrush Threepwood" }
    ].forEach(({ i, o }) => {
      test(`Input '${i}' string sanitizes to ${o}`, () => {
        expect(utils.sanitizePayee(i)).toBe(o);
      });
    });
  });

  describe("#toYnabTxn", () => {
    const accountOption: Account = {
      type: "account",
      id: "123",
      budget_id: "xyz",
      name: "My Account",
      username: "username",
      password: "password",
      scraperType: ScraperType.ANZ_CHECKING
    };

    beforeEach(() => {
      MockDate.set("2019-01-20");
    });

    afterEach(() => {
      MockDate.reset();
    });

    test(`Passes sanity test`, () => {
      const idCreator = new ImportIds();
      idCreator.create = jest.fn().mockReturnValue("id");
      const scrapedTxn: ScrapedTransaction = {
        amount: "$100.50",
        day: "15",
        month: "Jan",
        year: "2019",
        payee: "Captian Haddock"
      };

      const ynabTxn = utils.toYnabTxn({ account: accountOption, txn: scrapedTxn, idCreator });

      expect(ynabTxn).toMatchObject({
        account_id: "123",
        date: "2019-01-15",
        amount: 100500,
        cleared: "cleared",
        payee_name: "Captian Haddock",
        import_id: "id"
      });
    });

    const baseScrapedTxn = {
      amount: "$100.50",
      payee: "Captian Haddock"
    };

    [
      {
        // prettier-ignore
        i: { day: "5", month: "Jan", year: "2019" },
        o: "2019-01-05"
      },
      {
        i: { day: "05", month: "Jan", year: "2019" },
        o: "2019-01-05"
      },
      {
        i: { day: "5", month: "Jan" },
        o: "2019-01-05"
      },
      {
        i: { day: "5", month: "Dec" },
        o: "2018-12-05"
      },
      {
        i: { day: "05", month: "Jan", year: "19" },
        o: "2019-01-05"
      },
      {
        i: { day: "5", month: "Jan", year: "19" },
        o: "2019-01-05"
      }
    ].forEach(({ i, o }) => {
      test(`Date '${i.day}-${i.month}-${i.year}' resolves to ${o}`, () => {
        const idCreator = new ImportIds();
        idCreator.create = jest.fn().mockReturnValue("id");
        const scrapedTxn: ScrapedTransaction = {
          ...baseScrapedTxn,
          day: i.day,
          month: i.month,
          year: i.year
        };

        const ynabTxn = utils.toYnabTxn({ account: accountOption, txn: scrapedTxn, idCreator });

        expect(ynabTxn).toMatchObject({
          date: o
        });
      });
    });
  });
});
