import S3 from "aws-sdk/clients/s3";
import debug from "debug";
import moment from "moment";

export const log: debug.Debugger = debug("ynab-sync:util:s3");

const BUCKET = process.env.BUCKET;

const mimeTypes = {
  png: "image/png",
  jpg: "image/jpg",
  json: "application/json",
  text: "text/plain"
};

export async function uploadScreenshot(accountName: string, buffer: Buffer): Promise<string> {
  return uploadToS3(`${accountName}-screenshot.png`, buffer);
}

export async function uploadTransactions(accountName: string, transactions: object): Promise<string> {
  return uploadToS3(`${accountName}-txns.json`, JSON.stringify(transactions, null, 2));
}

async function uploadToS3(filenamePrefix: string, body: Buffer | string): Promise<string> {
  if (!BUCKET) {
    log("No bucket provided");
    return Promise.reject("No bucket provided");
  }

  const s3 = new S3({
    apiVersion: "2006-03-01"
  });

  const extension = filenamePrefix.split(".").pop();
  const contentType = extension ? mimeTypes[extension] : mimeTypes.text;

  const key = `${moment().format()}-${filenamePrefix}`;

  const { Location } = await s3
    .upload({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ACL: "authenticated-read",
      ContentType: contentType,
      ContentDisposition: "inline"
    })
    .promise();

  log(Location);

  const expiry = 60 * 60 * 5; // 5 hour expiry

  try {
    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: BUCKET,
      Key: key,
      Expires: expiry
    });
    return signedUrl;
  } catch (e) {
    log(`Error getting signed url`, e);
  }
  return Location;
}
