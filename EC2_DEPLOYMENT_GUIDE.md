# 🚀 AegisCloud EC2 Deployment Guide

Follow these exact steps once you have SSH'd into your fresh EC2 instance.

## Step 1: Clone the Repository
Clone your project onto the EC2 instance.
```bash
git clone <your-repo-url> aegiscloud
cd aegiscloud
```

## Step 2: Set up Environment Variables
Before running the deployment script, you must configure the backend `.env` file so the Node.js server knows your secrets and AWS resources.

```bash
cd backend
nano .env
```
Paste the following into the `.env` file and replace the placeholders with your actual values:

```env
# Server Configuration
PORT=8080
JWT_SECRET=super_secret_jwt_key_here
APP_BASE_URL=http://your-ec2-ip-or-domain.com

# Resend Email Configuration (For OTPs and Invites)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY

# AWS Configuration
AWS_REGION=eu-north-1
AWS_S3_EVIDENCE_BUCKET=aegiscloud-evidence-vault-eu-990a3a63
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

Return to the root directory:
```bash
cd ..
```

## Step 3: Run the Deployment Script
We created an automated script that installs Nginx, Node.js, and PM2, builds your React frontend, and starts everything up automatically.

```bash
# Ensure the script is executable
chmod +x deploy/deploy.sh

# Run the deployment
./deploy/deploy.sh
```

## Step 4: AWS Permissions (Crucial Step)
Since the Node.js backend needs to read/write to DynamoDB and upload files to S3, the EC2 instance must have permissions to access those services.

**Do NOT hardcode your AWS Access Keys in the `.env` file.** Instead, use IAM roles (this is AWS Best Practice):
1. Go to the AWS Console -> **IAM** -> **Roles**.
2. Create a new Role for **EC2**.
3. Attach the following policies:
   - `AmazonDynamoDBFullAccess` (Or scope it to just your 6 AegisCloud tables)
   - `AmazonS3FullAccess` (Or scope it to just `aegiscloud-evidence-vault-eu-990a3a63`)
4. Go to the **EC2 Console**, select your Instance -> **Actions** -> **Security** -> **Modify IAM Role**, and attach the role you just created.

*Note: Our backend code (`db.js`) is specifically written to automatically detect this IAM Role via the AWS SDK default credential provider chain!*

## Step 5: Test the Application!
Open your browser and navigate to the **Public IPv4 DNS** or **Public IPv4 Address** of your EC2 instance:
`http://<your-ec2-ip>`

You should immediately see the AegisCloud login screen!
