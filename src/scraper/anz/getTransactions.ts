import { ScrapedTransaction } from "../scraper";

export const getTransactions = (): ScrapedTransaction[] => {
  const transactions = new Array<ScrapedTransaction>();

  let rows = document.querySelectorAll("#content-txn-hist-id .displayTable");

  if (!rows || !rows.length) {
    rows = document.querySelectorAll(".tabsContainerAcctTranAuth .displayTable");
  }

  if (!rows) {
    return transactions;
  }

  rows.forEach(row => {
    const dateNode = row.querySelector(".txn-history-date");
    if (!dateNode || !dateNode.textContent) {
      return;
    }
    const dateArr = dateNode.textContent
      .trim()
      .replace(/\s+/, " ")
      .replace(/\r?\n|\r/g, "")
      .trim()
      .split(" ");

    if (dateArr.length < 2) {
      return;
    }

    const day = dateArr[0];
    const month = dateArr[1].trim();
    const year = dateArr[2];

    const descriptionNode = row.querySelector(".txn-desc-pad") || row.querySelector(".acct-txn-desc");
    const amountNode = row.querySelector(".acct-txn-amt");
    if (!descriptionNode || !descriptionNode.textContent || !amountNode || !amountNode.textContent) {
      return;
    }
    const payee = descriptionNode.textContent.trim();

    const amount = amountNode.textContent.trim();

    transactions.push({
      day,
      month,
      year,
      payee,
      amount
    });
  });

  return transactions;
};
