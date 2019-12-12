import { ScrapedTransaction } from "../scraper";

export const getTransactions = (): ScrapedTransaction[] => {
  const transactions = new Array<ScrapedTransaction>();

  document.querySelectorAll("div[name=transactionsHistory] tr[name=DataContainer]").forEach(row => {
    const dateNode = row.querySelector("div[name=Transaction_TransactionDate]");

    if (!dateNode || !dateNode.textContent) {
      return;
    }
    const dateArr = dateNode.textContent.trim().split(" ");

    const day = dateArr[0];
    const month = dateArr[1];
    const year = dateArr[2];

    const descriptionNode = row.querySelector("div[name=Transaction_TransactionDescription]");
    const amountNode = row.querySelector("div[name=Transaction_Amount]");
    if (!descriptionNode || !descriptionNode.textContent || !amountNode || !amountNode.textContent) {
      return;
    }
    const payee = descriptionNode.textContent;

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
