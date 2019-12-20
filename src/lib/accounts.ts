import { ScraperType } from "../scraper/scraper";
import * as dynamodb from "./dynamodb";
import { decryptValue, Secrets } from "./secrets";

export declare interface Account {
  type: "account";
  id: string;
  budget_id: string;
  name: string;
  scraperType: ScraperType;
  username: string;
  password: string;
  selector?: string;
  debug?: boolean;
}

export declare interface Budget {
  budget_id: string;
  name: string;
  accounts: Account[];
}

const getAccounts = async (secrets: Secrets): Promise<Account[]> => {
  const TableName = process.env.DYNAMODB_TABLE;
  if (!TableName) {
    return Promise.reject("No dynamodb table name provided");
  }

  const params = {
    TableName,
    FilterExpression: "#type = :value",
    ExpressionAttributeNames: {
      "#type": "type"
    },
    ExpressionAttributeValues: {
      ":value": { S: "account" }
    }
  };

  const result = await dynamodb
    .client()
    .scan(params)
    .promise();

  let accounts = new Array<Account>();
  if (result && result.Items) {
    accounts = result.Items.map(i => {
      const scraperType: ScraperType = (ScraperType as any)[i.scraperType];
      const a: Account = {
        type: "account",
        id: i.id,
        budget_id: i.budget_id,
        name: i.name,
        username: decryptValue(i.username, secrets.ENCRYPTION_KEY),
        password: decryptValue(i.password, secrets.ENCRYPTION_KEY),
        scraperType,
        selector: i.selector,
        debug: i.debug
      };
      return a;
    });
  }
  return Promise.resolve(accounts);
};

// const loadAccounts = async (accounts: Account[]) => {
//   const TableName = process.env.DYNAMODB_TABLE;
//   if (!TableName) {
//     return Promise.reject("No dynamodb table name provided");
//   }

//   const params = {
//     TableName,
//     FilterExpression: "#type = :value",
//     ExpressionAttributeNames: {
//       "#type": "type"
//     },
//     ExpressionAttributeValues: {
//       ":value": { S: "account" }
//     }
//   };

//   const result = await dynamodb
//     .client()
//     .put(params)
//     .promise();
// }

export { getAccounts };
