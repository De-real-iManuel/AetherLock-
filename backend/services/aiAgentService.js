import axios from 'axios';

class AIAgentService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyDRpmslRI-KjdvPlkjGCrfgpI3Tuhc3-g4';
    this.geminiModel = 'gemini-2.0-flash';
    this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async callGemini(prompt) {
    const response = await axios.post(
      `${this.geminiUrl}/${this.geminiModel}:generateContent`,
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.geminiKey
        }
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  }

  async mediateDispute(dispute) {
    const { buyerClaim, sellerResponse, evidence } = dispute;

    const buyerAgent = await this.runAgent('buyer', {
      claim: buyerClaim,
      evidence: evidence.buyer
    });

    const sellerAgent = await this.runAgent('seller', {
      response: sellerResponse,
      evidence: evidence.seller
    });

    const mediator = await this.runAgent('mediator', {
      buyerArgument: buyerAgent.argument,
      sellerArgument: sellerAgent.argument,
      allEvidence: evidence
    });

    return {
      buyerPosition: buyerAgent,
      sellerPosition: sellerAgent,
      mediation: mediator,
      recommendedSplit: mediator.split,
      confidence: mediator.confidence,
      reasoning: mediator.reasoning
    };
  }

  async runAgent(agentType, context) {
    const prompts = {
      buyer: `You are a buyer's advocate in an escrow dispute. 
Buyer's claim: ${context.claim}
Evidence: ${JSON.stringify(context.evidence)}
Provide a strong argument for why the buyer deserves a refund. Be specific and cite evidence.`,

      seller: `You are a seller's advocate in an escrow dispute.
Seller's response: ${context.response}
Evidence: ${JSON.stringify(context.evidence)}
Provide a strong argument for why the seller deserves payment. Be specific and cite evidence.`,

      mediator: `You are an impartial mediator in an escrow dispute.
Buyer's argument: ${context.buyerArgument}
Seller's argument: ${context.sellerArgument}
All evidence: ${JSON.stringify(context.allEvidence)}

Analyze both sides and propose a fair resolution. Respond in JSON format:
{
  "split": {"buyer": 0-100, "seller": 0-100},
  "confidence": 0-100,
  "reasoning": "detailed explanation",
  "keyFactors": ["factor1", "factor2"]
}`
    };

    try {
      const text = await this.callGemini(prompts[agentType]);
      
      if (agentType === 'mediator') {
        return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
      }
      
      return { argument: text, agent: agentType };
    } catch (error) {
      console.error(`Agent ${agentType} failed:`, error);
      return this.fallbackAgent(agentType);
    }
  }

  async predictRisk(escrowData) {
    const prompt = `Analyze this escrow transaction and predict risk:
Amount: $${escrowData.amount}
Description: ${escrowData.description}
Buyer Trust Score: ${escrowData.buyerTrustScore || 50}
Seller Trust Score: ${escrowData.sellerTrustScore || 50}

Respond in JSON:
{
  "riskScore": 0-100,
  "successProbability": 0-100,
  "riskFactors": ["factor1", "factor2"],
  "recommendations": ["rec1", "rec2"],
  "dynamicFee": 5-15
}`;

    try {
      const text = await this.callGemini(prompt);
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
      console.error('Risk prediction failed:', error);
      return {
        riskScore: 50,
        successProbability: 70,
        riskFactors: ['Unable to analyze'],
        recommendations: ['Proceed with caution'],
        dynamicFee: 10
      };
    }
  }

  async generateContract(projectDescription) {
    const prompt = `Generate escrow contract terms from this description:
"${projectDescription}"

Create detailed terms in JSON:
{
  "title": "contract title",
  "milestones": [{"name": "milestone", "percentage": 0-100, "criteria": "completion criteria"}],
  "deliverables": ["deliverable1", "deliverable2"],
  "timeline": "estimated timeline",
  "paymentTerms": "payment structure",
  "disputeTerms": "dispute resolution process",
  "refundPolicy": "refund conditions"
}`;

    try {
      const text = await this.callGemini(prompt);
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
      console.error('Contract generation failed:', error);
      return null;
    }
  }

  async analyzeSentiment(messages) {
    const prompt = `Analyze sentiment in these chat messages:
${messages.map(m => `${m.sender}: ${m.content}`).join('\n')}

Respond in JSON:
{
  "overallSentiment": "positive/neutral/negative",
  "frustrationLevel": 0-100,
  "satisfactionLevel": 0-100,
  "escalationNeeded": true/false,
  "keyIssues": ["issue1", "issue2"],
  "recommendation": "action to take"
}`;

    try {
      const text = await this.callGemini(prompt);
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        overallSentiment: 'neutral',
        frustrationLevel: 0,
        satisfactionLevel: 50,
        escalationNeeded: false,
        keyIssues: [],
        recommendation: 'Continue monitoring'
      };
    }
  }

  async explainDecision(verificationResult, evidence) {
    const prompt = `Explain this AI verification decision in simple terms:
Result: ${verificationResult.passed ? 'PASSED' : 'FAILED'}
Confidence: ${verificationResult.confidence}%
Evidence: ${JSON.stringify(evidence)}

Provide explanation in JSON:
{
  "summary": "one sentence summary",
  "keyFactors": [{"factor": "name", "impact": "positive/negative", "weight": 0-100}],
  "evidenceBreakdown": [{"type": "evidence type", "score": 0-100, "reasoning": "why"}],
  "alternativeOutcomes": [{"scenario": "what if", "probability": 0-100}],
  "recommendations": ["what to improve"]
}`;

    try {
      const text = await this.callGemini(prompt);
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
      console.error('Explanation generation failed:', error);
      return null;
    }
  }

  fallbackAgent(agentType) {
    if (agentType === 'mediator') {
      return {
        split: { buyer: 50, seller: 50 },
        confidence: 50,
        reasoning: 'Unable to analyze - defaulting to 50/50 split',
        keyFactors: ['Analysis unavailable']
      };
    }
    return {
      argument: 'Unable to generate argument',
      agent: agentType
    };
  }
}

export default AIAgentService;
export { AIAgentService };