import debug from "debug";
import { API, BulkResponse, BulkTransactions } from "ynab";
import { Account } from "./accounts";

const log: debug.Debugger = debug("ynab-sync:ynab");

const mockResponse = (): Promise<BulkResponse> =>
  Promise.resolve({
    data: {
      bulk: {
        transaction_ids: [],
        duplicate_import_ids: []
      }
    }
  });

const submitTransactions = async (
  account: Account,
  transactions: BulkTransactions,
  apiToken: string,
  dryRun: boolean = false
): Promise<BulkResponse> => {
  if (dryRun) {
    return mockResponse();
  }
  if (!apiToken) {
    return Promise.reject("No API token configured");
  }

  log(`Uploading ${transactions.transactions.length} transactions to '${account.name}`);
  // log(transactions);

  const ynabAPI = new API(apiToken);
  return ynabAPI.transactions.bulkCreateTransactions(account.budget_id, transactions).then(response => {
    log(`Data uploaded:
        ${response.data.bulk.transaction_ids.length} transactions
        ${response.data.bulk.duplicate_import_ids.length} ignored duplicates`);
    return response;
  });
};

export { submitTransactions };
