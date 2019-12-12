import moment from "moment";
import { SaveTransaction } from "ynab";
import { ScrapedTransaction } from "../scraper/scraper";
import { Account } from "./accounts";
import { ImportIdCreator } from "./ImportIds";

const _MAX_PAYEE_LENGTH = 50;

export function sanitizePayee(payee: string): string {
  let result = payee.trim();
  result = result.replace(/\s+/g, " ");
  result = result.replace(/POS AUTHORISATION\s+/g, " ");
  result = result.replace(/ANZ INTERNET BANKING FUNDS TFER TRANSFER (\d+ )?(TO|FROM)\s+/, "");
  result = result.replace(/ANZ INTERNET BANKING PAYMENT (\d+ )?(TO|FROM)\s/, "");
  result = result.replace(/ANZ INTERNET BANKING BPAY\s+/, "");
  result = result.replace(/ANZ M-BANKING PAYMENT TRANSFER (\d+ )?(TO|FROM)\s+/, "");
  result = result.replace(/ANZ M-BANKING FUNDS TFER TRANSFER (\d+ )?(TO|FROM)\s+/, "");
  result = result.replace(/ANZ M-BANKING PAYMENT\s+/, "");
  result = result.replace(/PAYMENT (TO|FROM)\s+/, "");
  result = result.replace(/TRANSFER (TO|FROM)\s+/, "");
  result = result.replace(/Card Used \d+/gi, "");
  result = result.trim();

  if (result.length > _MAX_PAYEE_LENGTH) {
    // console.log("Payee too long, truncating", result);
    result = result.slice(0, _MAX_PAYEE_LENGTH);
  }

  return result;
}

export function convertToAmount(amountStr: string): number {
  return Number((Number(amountStr.replace(/[^0-9\.-]+/g, "")) * 1000).toFixed(0));
}

export function toYnabTxn({
  account,
  txn,
  idCreator
}: {
  account: Account;
  txn: ScrapedTransaction;
  idCreator: ImportIdCreator;
}): SaveTransaction {
  const payeeName = sanitizePayee(txn.payee);
  const amount = convertToAmount(txn.amount);

  const year = txn.year || new Date().getFullYear();
  const m = moment(`${txn.day} ${txn.month} ${year}`, ["D MMM YYYY", "D MMM YY"]);
  if (m.isAfter()) {
    m.subtract(1, "year");
  }

  const date = m.format("YYYY-MM-DD");

  const importId = idCreator.create(amount, date);

  return {
    account_id: account.id,
    date,
    amount,
    payee_name: payeeName,
    cleared: SaveTransaction.ClearedEnum.Cleared,
    import_id: importId
  };
}

export function delay(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
