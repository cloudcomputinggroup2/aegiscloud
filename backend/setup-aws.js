const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, CreateBucketCommand, PutBucketCorsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const region = 'us-east-1'; // Defaulting to us-east-1
const dbClient = new DynamoDBClient({ region });
const s3Client = new S3Client({ region });

const BUCKET_NAME = `aegiscloud-evidence-vault-${crypto.randomBytes(4).toString('hex')}`;

const tables = [
  { TableName: 'AegisCloud_Users', KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
  { TableName: 'AegisCloud_Orgs', KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
  { TableName: 'AegisCloud_Incidents', KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
  { TableName: 'AegisCloud_Invites', KeySchema: [{ AttributeName: 'token', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'token', AttributeType: 'S' }] },
  { TableName: 'AegisCloud_Tokens', KeySchema: [{ AttributeName: 'token', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'token', AttributeType: 'S' }] },
  { TableName: 'AegisCloud_OtpSessions', KeySchema: [{ AttributeName: 'sessionId', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'sessionId', AttributeType: 'S' }] }
];

async function setup() {
  console.log('🚀 Starting AWS Infrastructure Provisioning...\n');

  // 1. Create S3 Bucket
  try {
    console.log(`📦 Creating S3 Bucket: ${BUCKET_NAME}`);
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    console.log('✅ Bucket created.');

    // Configure CORS for S3
    console.log('🔧 Configuring CORS for S3...');
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
            AllowedOrigins: ['*'], // In production, restrict this to app domain
            ExposeHeaders: ['ETag']
          }
        ]
      }
    }));
    console.log('✅ CORS configured.');
    
    // Output bucket name to .env
    const fs = require('fs');
    fs.appendFileSync('.env', `\nAWS_S3_EVIDENCE_BUCKET=${BUCKET_NAME}\nAWS_REGION=${region}\n`);
    console.log(`💾 Saved bucket name to .env`);

  } catch (err) {
    if (err.name === 'BucketAlreadyExists' || err.name === 'BucketAlreadyOwnedByYou') {
      console.log('⚠️ Bucket already exists.');
    } else {
      console.error('❌ Failed to create bucket:', err);
    }
  }

  // 2. Create DynamoDB Tables
  for (const t of tables) {
    try {
      console.log(`📊 Checking table: ${t.TableName}`);
      await dbClient.send(new DescribeTableCommand({ TableName: t.TableName }));
      console.log(`✅ Table ${t.TableName} already exists.`);
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') {
        console.log(`🔨 Creating table: ${t.TableName}`);
        await dbClient.send(new CreateTableCommand({
          TableName: t.TableName,
          KeySchema: t.KeySchema,
          AttributeDefinitions: t.AttributeDefinitions,
          BillingMode: 'PAY_PER_REQUEST'
        }));
        console.log(`✅ Table ${t.TableName} creation initiated.`);
      } else {
        console.error(`❌ Failed checking/creating table ${t.TableName}:`, err);
      }
    }
  }

  console.log('\n🎉 AWS Setup Complete! Wait ~30 seconds for DynamoDB tables to become active.');
}

setup();
