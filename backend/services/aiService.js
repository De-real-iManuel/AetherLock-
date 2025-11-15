import axios from 'axios';

class AIService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.claudeKey = process.env.CLAUDE_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.timeout = 30000; // 30 second timeout
  }

  /**
   * Verify work submission with evidence analysis
   * Returns AIVerificationResult format
   */
  async verifyWork(escrowData, submissionData, evidenceFiles) {
    try {
      const prompt = this.buildVerificationPrompt(escrowData, submissionData);
      const evidenceDescription = this.buildEvidenceDescription(evidenceFiles);
      
      let result;
      try {
        result = await this.tryGemini(prompt, evidenceDescription);
      } catch (error) {
        console.log('Gemini failed, trying Claude:', error.message);
        try {
          result = await this.tryClaude(prompt, evidenceDescription);
        } catch (error2) {
          console.log('Claude failed, trying OpenAI:', error2.message);
          result = await this.tryOpenAI(prompt, evidenceDescription);
        }
      }

      // Parse and format into AIVerificationResult
      return this.formatVerificationResult(result);
    } catch (error) {
      console.error('All AI services failed:', error);
      throw new Error('AI verification failed: ' + error.message);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async verifyDeliverable(prompt, evidence) {
    try {
      return await this.tryGemini(prompt, evidence);
    } catch (error) {
      console.log('Gemini failed, trying Claude:', error.message);
      try {
        return await this.tryClaude(prompt, evidence);
      } catch (error2) {
        console.log('Claude failed, trying OpenAI:', error2.message);
        return await this.tryOpenAI(prompt, evidence);
      }
    }
  }

  /**
   * Build comprehensive verification prompt
   */
  buildVerificationPrompt(escrowData, submissionData) {
    return `You are an AI work verification system. Analyze if the submitted work meets the requirements.

ESCROW DETAILS:
Title: ${escrowData.title}
Description: ${escrowData.description}
Requirements: ${escrowData.milestones?.map(m => `- ${m.title}: ${m.description}`).join('\n') || 'No specific milestones'}

SUBMISSION:
Description: ${submissionData.description}
Files Submitted: ${submissionData.evidence?.length || 0} files

Analyze the submission and respond in JSON format with:
{
  "passed": boolean (true if work meets requirements),
  "confidence": number (0-100, your confidence in the assessment),
  "feedback": "string (detailed feedback for both parties)",
  "qualityScore": number (0-100, overall quality of work),
  "completenessScore": number (0-100, how complete the work is),
  "accuracyScore": number (0-100, how accurate/correct the work is),
  "suggestions": ["array", "of", "improvement", "suggestions"]
}`;
  }

  /**
   * Build evidence description from files
   */
  buildEvidenceDescription(evidenceFiles) {
    if (!evidenceFiles || evidenceFiles.length === 0) {
      return 'No evidence files provided';
    }

    return evidenceFiles.map((file, idx) => 
      `File ${idx + 1}: ${file.fileName} (${file.fileType}) - IPFS: ${file.ipfsHash}`
    ).join('\n');
  }

  /**
   * Format AI response into AIVerificationResult
   */
  formatVerificationResult(rawResult) {
    const timestamp = new Date();
    
    return {
      passed: rawResult.passed || false,
      confidence: Math.min(100, Math.max(0, rawResult.confidence || 0)),
      feedback: rawResult.feedback || 'No feedback provided',
      timestamp,
      analysisDetails: {
        qualityScore: Math.min(100, Math.max(0, rawResult.qualityScore || 0)),
        completenessScore: Math.min(100, Math.max(0, rawResult.completenessScore || 0)),
        accuracyScore: Math.min(100, Math.max(0, rawResult.accuracyScore || 0)),
        suggestions: Array.isArray(rawResult.suggestions) ? rawResult.suggestions : []
      }
    };
  }

  async tryGemini(prompt, evidence) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`,
        {
          contents: [{
            parts: [{
              text: `${prompt}\n\nEvidence:\n${evidence}`
            }]
          }]
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid Gemini API response format');
      }

      const text = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from Gemini response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Gemini API timeout');
      }
      if (error.response?.status === 429) {
        throw new Error('Gemini API rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid Gemini API key');
      }
      throw error;
    }
  }

  async tryClaude(prompt, evidence) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `${prompt}\n\nEvidence:\n${evidence}`
          }]
        },
        {
          timeout: this.timeout,
          headers: {
            'x-api-key': this.claudeKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );

      if (!response.data?.content?.[0]?.text) {
        throw new Error('Invalid Claude API response format');
      }

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from Claude response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Claude API timeout');
      }
      if (error.response?.status === 429) {
        throw new Error('Claude API rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid Claude API key');
      }
      throw error;
    }
  }

  async tryOpenAI(prompt, evidence) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{
            role: 'user',
            content: `${prompt}\n\nEvidence:\n${evidence}`
          }],
          response_format: { type: 'json_object' }
        },
        {
          timeout: this.timeout,
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid OpenAI API response format');
      }

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('OpenAI API timeout');
      }
      if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key');
      }
      throw error;
    }
  }
}

export default AIService;
export { AIService };
