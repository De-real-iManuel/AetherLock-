const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const crypto = require('crypto');
const ipfsService = require('../../services/ipfsService');

class AIVerificationService {
  constructor() {
    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async uploadEvidence(files) {
    try {
      const uploadResults = await Promise.all(
        files.map(file => ipfsService.uploadFile(file.buffer, file.originalname))
      );

      const cid = uploadResults[0].IpfsHash;
      const evidenceHash = crypto.createHash('sha256').update(cid).digest();

      return {
        ipfsHash: cid,
        evidenceHash: Array.from(evidenceHash),
        files: uploadResults.map((r, i) => ({
          name: files[i].originalname,
          size: files[i].size,
          type: files[i].mimetype,
          ipfsHash: r.IpfsHash
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
    const message = Buffer.concat([
      Buffer.from(escrowId, 'hex'),
      Buffer.from([result ? 1 : 0]),
      Buffer.from(evidenceHash),
      Buffer.from(new Uint8Array(new BigUint64Array([BigInt(timestamp)]).buffer))
    ]);

    const signature = crypto.createHash('sha256').update(message).digest();

    return {
      signature: Array.from(signature),
      message: Array.from(message)
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
        signature: signature.signature
      };
    } catch (error) {
      throw new Error(`Verification processing failed: ${error.message}`);
    }
  }

}

module.exports = AIVerificationService;