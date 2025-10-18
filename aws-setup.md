# AWS Services Setup for AetherLock

## Required AWS Services

### 1. Amazon Bedrock Setup
```bash
# Enable Bedrock models in AWS Console
# Go to Amazon Bedrock > Model access
# Request access to:
# - Anthropic Claude 3 Haiku
# - Anthropic Claude 3 Sonnet
```

### 2. Amazon QLDB Setup
```bash
# Create QLDB Ledger
aws qldb create-ledger \
  --name AetherLockLedger \
  --permissions-mode STANDARD

# Create tables (run in QLDB console)
CREATE TABLE EscrowTransactions;
CREATE INDEX ON EscrowTransactions (transactionId);
CREATE INDEX ON EscrowTransactions (buyerAddress);
```

### 3. IAM Permissions
Create IAM user with these policies:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow", 
      "Action": [
        "qldb:SendCommand",
        "qldb:ExecuteStatement"
      ],
      "Resource": "arn:aws:qldb:*:*:ledger/AetherLockLedger"
    }
  ]
}
```

### 4. Environment Variables
Copy `.env.example` to `.env` and fill in:
```
REACT_APP_AWS_ACCESS_KEY_ID=your_key_here
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_here
REACT_APP_AWS_REGION=us-east-1
REACT_APP_QLDB_LEDGER_NAME=AetherLockLedger
```

## Demo Features Now Available

✅ **AI Risk Analysis** - Real-time fraud detection using Bedrock
✅ **Immutable Logging** - All transactions recorded in QLDB  
✅ **Dispute Resolution** - AI-powered mediation system
✅ **Trust Scoring** - Dynamic risk assessment
✅ **Audit Trail** - Cryptographically verified transaction history

## Cost Estimate (Demo Usage)
- Bedrock: ~$0.01 per analysis
- QLDB: ~$0.001 per transaction
- Total demo cost: <$5 for hackathon