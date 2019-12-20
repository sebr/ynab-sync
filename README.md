# YNAB-SYNC

## Get started

1. Sign up to YNAB
2. Register for an API key
3. Create a budget & accounts - one per tracking accounts
4. Copy `accounts-sample.json` --> `accounts.json` and complete

## Running locally

```
$> npm install
$> serverless dynamodb install
$> serverless dynamodb start
$> serverless invoke local -f sync
```

## Todo

1. Dynamic naming of s3 bucket
2. Loading account & secrets data into dynamo
3. Automagic provisioning of SSM key

```

```
