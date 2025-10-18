import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

export const analyzeEscrowRisk = async (escrowData) => {
  const prompt = `Analyze this escrow transaction for risk factors:
  
Buyer Offer: ${escrowData.buyerOffer}
Seller Handle: ${escrowData.sellerHandle}
Transaction Amount: ${escrowData.amount}

Provide a risk score (0-100) and brief analysis focusing on:
- Transaction legitimacy
- Fraud indicators
- Recommended actions

Format response as JSON: {"riskScore": number, "analysis": "string", "recommendation": "string"}`;

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return JSON.parse(responseBody.content[0].text);
  } catch (error) {
    console.error('Bedrock analysis failed:', error);
    return {
      riskScore: 50,
      analysis: 'Unable to analyze - using default risk assessment',
      recommendation: 'Proceed with standard escrow protocols'
    };
  }
};

export const resolveDispute = async (disputeDetails) => {
  const prompt = `As an AI mediator, analyze this escrow dispute and provide resolution:

Dispute Details: ${disputeDetails.description}
Buyer Claim: ${disputeDetails.buyerClaim}
Seller Response: ${disputeDetails.sellerResponse}
Evidence: ${disputeDetails.evidence}

Provide fair resolution as JSON: {"resolution": "string", "favoredParty": "buyer|seller|split", "reasoning": "string"}`;

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return JSON.parse(responseBody.content[0].text);
  } catch (error) {
    console.error('Dispute resolution failed:', error);
    return {
      resolution: 'Manual review required',
      favoredParty: 'split',
      reasoning: 'AI analysis unavailable - requires human intervention'
    };
  }
};