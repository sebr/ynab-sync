import { ScrapedTransaction } from "../scraper";

export const getTransactions = (): ScrapedTransaction[] => {
  const transactions = new Array<ScrapedTransaction>();

  document.querySelectorAll(".transaction-history-table tbody tr:not(.hidden)").forEach(row => {
    const dateNode = row.querySelector("td.transaction-date");
    if (!dateNode || !dateNode.textContent) {
      return;
    }
    const dateArr = dateNode.textContent.trim().split(" ");

    const day = dateArr[0];
    const month = dateArr[1];
    const year = dateArr[2];

    const descriptionNode = row.querySelector("td.narrative .narrative-section .narrative");
    if (!descriptionNode || !descriptionNode.textContent) {
      return;
    }
    const payee = descriptionNode.textContent;

    let amountNode = row.querySelector("td.debit");
    if (!amountNode || !amountNode.textContent || !amountNode.textContent.trim()) {
      amountNode = row.querySelector("td.credit");
    }
    if (!amountNode || !amountNode.textContent) {
      return;
    }

    const amount = amountNode.textContent;

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
