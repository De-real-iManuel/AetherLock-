const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { Web3Storage } = require('web3.storage');
const crypto = require('crypto');
const ed25519 = require('ed25519');

class AIVerificationService {
  constructor() {
    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    this.web3Storage = new Web3Storage({ 
      token: process.env.WEB3_STORAGE_TOKEN 
    });

    // Load AI agent keypair
    const privateKeyBase58 = process.env.AI_AGENT_PRIVATE_KEY;
    if (!privateKeyBase58) {
      throw new Error('AI_AGENT_PRIVATE_KEY environment variable required');
    }
    
    this.keyPair = this.loadKeyPair(privateKeyBase58);
  }

  loadKeyPair(privateKeyBase58) {
    // Convert base58 private key to keypair
    const privateKey = Buffer.from(privateKeyBase58, 'base64');
    const publicKey = ed25519.publicKeyCreate(privateKey);
    
    return {
      privateKey,
      publicKey: Buffer.from(publicKey)
    };
  }

  async uploadEvidence(files) {
    try {
      const fileObjects = files.map(file => new File([file.buffer], file.originalname, {
        type: file.mimetype
      }));

      const cid = await this.web3Storage.put(fileObjects);
      const evidenceHash = crypto.createHash('sha256').update(cid).digest();

      return {
        ipfsHash: cid,
        evidenceHash: Array.from(evidenceHash),
        files: fileObjects.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        }))
      };
    } catch (error) {
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  async analyzeEvidence(escrowId, taskDescription, evidenceFiles) {
    try {
      // Prepare evidence analysis prompt
      const prompt = this.buildAnalysisPrompt(taskDescription, evidenceFiles);
      
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const response = await this.bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return this.parseAIResponse(responseBody.content[0].text);
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(taskDescription, evidenceFiles) {
    return `
You are an AI verification agent for AetherLock escrow protocol. Analyze the provided evidence to determine if the task has been completed satisfactorily.

Task Description: ${taskDescription}

Evidence Files:
${evidenceFiles.map(f => `- ${f.name} (${f.type}, ${f.size} bytes)`).join('\n')}

Instructions:
1. Carefully analyze all provided evidence
2. Determine if the evidence demonstrates task completion
3. Consider quality, completeness, and adherence to requirements
4. Provide a confidence score (0-100)
5. Give a clear boolean result (COMPLETED or NOT_COMPLETED)

Response format:
RESULT: [COMPLETED/NOT_COMPLETED]
CONFIDENCE: [0-100]
REASONING: [Brief explanation of your decision]
`;
  }

  parseAIResponse(responseText) {
    const lines = responseText.split('\n');
    let result = false;
    let confidence = 0;
    let reasoning = '';

    for (const line of lines) {
      if (line.startsWith('RESULT:')) {
        result = line.includes('COMPLETED') && !line.includes('NOT_COMPLETED');
      } else if (line.startsWith('CONFIDENCE:')) {
        confidence = parseInt(line.split(':')[1].trim()) || 0;
      } else if (line.startsWith('REASONING:')) {
        reasoning = line.split(':')[1].trim();
      }
    }

    // Require minimum 70% confidence for positive verification
    if (confidence < 70) {
      result = false;
    }

    return {
      result,
      confidence,
      reasoning,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  async signVerificationResult(escrowId, result, evidenceHash, timestamp) {
    // Create verification message payload
    const message = Buffer.concat([
      Buffer.from(escrowId, 'hex'),
      Buffer.from([result ? 1 : 0]),
      Buffer.from(evidenceHash),
      Buffer.from(new Uint8Array(new BigUint64Array([BigInt(timestamp)]).buffer))
    ]);

    // Sign with Ed25519
    const signature = ed25519.sign(message, this.keyPair.privateKey);

    return {
      signature: Array.from(signature),
      message: Array.from(message),
      publicKey: Array.from(this.keyPair.publicKey)
    };
  }

  async processVerification(escrowId, taskDescription, evidenceFiles) {
    try {
      // 1. Upload evidence to IPFS
      const uploadResult = await this.uploadEvidence(evidenceFiles);
      
      // 2. Analyze evidence with AI
      const analysis = await this.analyzeEvidence(escrowId, taskDescription, uploadResult.files);
      
      // 3. Sign the verification result
      const signature = await this.signVerificationResult(
        escrowId,
        analysis.result,
        uploadResult.evidenceHash,
        analysis.timestamp
      );

      return {
        escrowId,
        result: analysis.result,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        evidenceHash: uploadResult.evidenceHash,
        ipfsHash: uploadResult.ipfsHash,
        timestamp: analysis.timestamp,
        signature: signature.signature,
        publicKey: signature.publicKey
      };
    } catch (error) {
      throw new Error(`Verification processing failed: ${error.message}`);
    }
  }

  getPublicKey() {
    return Array.from(this.keyPair.publicKey);
  }
}

module.exports = AIVerificationService;