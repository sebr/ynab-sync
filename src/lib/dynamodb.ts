import * as DynamoDB from "aws-sdk/clients/dynamodb";

interface DynamoOptionsInterface {
  region: string;
  endpoint?: string;
}

const opts = (): DynamoOptionsInterface => {
  const options: DynamoOptionsInterface = {
    region: process.env.AWS_REGION || "ap-southeast-2"
  };
  // connect to local DB if running offline
  if (process.env.IS_OFFLINE || process.env.NODE_ENV === "test") {
    options.endpoint = "http://localhost:8000";
  }
  return options;
};

export function client() {
  return new DynamoDB.DocumentClient(opts());
}
