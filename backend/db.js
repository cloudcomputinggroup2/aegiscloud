const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { execSync } = require('child_process');

function getSSOCredentials() {
  try {
    const credsJson = execSync('aws configure export-credentials --profile default', { encoding: 'utf-8' });
    const creds = JSON.parse(credsJson);
    return {
      accessKeyId: creds.AccessKeyId,
      secretAccessKey: creds.SecretAccessKey,
      sessionToken: creds.SessionToken,
      expiration: new Date(creds.Expiration)
    };
  } catch (err) {
    console.warn('⚠️ Could not load AWS SSO credentials via CLI. Falling back to default provider.', err.message);
    return null;
  }
}

const customCreds = getSSOCredentials();
const clientParams = { region: process.env.AWS_REGION || 'eu-north-1' };
if (customCreds) {
  clientParams.credentials = customCreds;
}

const client = new DynamoDBClient(clientParams);
const docClient = DynamoDBDocumentClient.from(client);

async function get(tableName, key) {
  const params = { TableName: tableName, Key: key };
  const { Item } = await docClient.send(new GetCommand(params));
  return Item;
}

async function put(tableName, item) {
  const params = { TableName: tableName, Item: item };
  await docClient.send(new PutCommand(params));
  return item;
}

async function remove(tableName, key) {
  const params = { TableName: tableName, Key: key };
  await docClient.send(new DeleteCommand(params));
}

async function scan(tableName, filterExpression, expressionAttributeValues) {
  const params = { TableName: tableName };
  if (filterExpression) params.FilterExpression = filterExpression;
  if (expressionAttributeValues) params.ExpressionAttributeValues = expressionAttributeValues;
  
  const { Items } = await docClient.send(new ScanCommand(params));
  return Items || [];
}

async function query(tableName, keyConditionExpression, expressionAttributeValues) {
  const params = { 
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };
  const { Items } = await docClient.send(new QueryCommand(params));
  return Items || [];
}

module.exports = { get, put, remove, scan, query, clientParams };
