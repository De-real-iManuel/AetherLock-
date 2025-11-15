import express from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { 
  signVerificationPayload, 
  createVerificationPayload,
  generateEvidenceHash 
} from '../utils/crypto.js';
import { initializeKeyPair } from './keys.js';

const router = express.Router();

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Extract key requirements and keywords from task description
 * @param {string} taskDescription - Task description text
 * @returns {Array} Array of extracted keywords
 */
function extractTaskKeywords(taskDescription) {
  const text = taskDescription.toLowerCase();
  const keywords = [];
  
  // Technical keywords
  const techKeywords = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java', 'rust', 'solana',
    'smart contract', 'blockchain', 'api', 'database', 'frontend', 'backend', 'ui', 'ux',
    'component', 'function', 'class', 'method', 'test', 'deploy', 'build', 'install', 'domain',
    'authentication', 'authorization', 'login', 'signup', 'form', 'validation', 'responsive'
  ];
  
  // Action keywords
  const actionKeywords = [
    'create', 'build', 'develop', 'implement', 'design', 'write', 'code', 'test', 'deploy',
    'fix', 'update', 'modify', 'integrate', 'connect', 'setup', 'configure', 'optimize'
  ];
  
  // Check for technical keywords
  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // Check for action keywords
  actionKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // Extract quoted requirements
  const quotedMatches = taskDescription.match(/"([^"]+)"/g);
  if (quotedMatches) {
    quotedMatches.forEach(match => {
      keywords.push(match.replace(/"/g, ''));
    });
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Assess task complexity based on description
 * @param {string} taskDescription - Task description text
 * @returns {string} Complexity level (simple, moderate, complex, advanced)
 */
function assessTaskComplexity(taskDescription) {
  const text = taskDescription.toLowerCase();
  const wordCount = text.split(' ').length;
  
  let complexityScore = 0;
  
  // Word count factor
  if (wordCount > 50) complexityScore += 2;
  else if (wordCount > 20) complexityScore += 1;
  
  // Technical complexity indicators
  const complexIndicators = [
    'integration', 'authentication', 'database', 'api', 'smart contract', 'blockchain',
    'deployment', 'testing', 'optimization', 'security', 'scalability', 'architecture'
  ];
  
  complexIndicators.forEach(indicator => {
    if (text.includes(indicator)) complexityScore += 1;
  });
  
  // Multiple technology stack
  const techCount = (text.match(/react|vue|angular|python|java|rust|solana|typescript/g) || []).length;
  if (techCount > 2) complexityScore += 2;
  else if (techCount > 1) complexityScore += 1;
  
  // Determine complexity level
  if (complexityScore >= 6) return 'advanced';
  if (complexityScore >= 4) return 'complex';
  if (complexityScore >= 2) return 'moderate';
  return 'simple';
}

/**
 * Process evidence files for AI analysis
 * @param {Array} evidence - Array of evidence items with file data
 * @returns {Array} Processed evidence with extracted content
 */
async function processEvidenceFiles(evidence) {
  const processedEvidence = [];

  for (const item of evidence) {
    const processed = {
      type: item.type || item.mimetype || 'unknown',
      filename: item.filename || item.originalname || 'unnamed',
      size: item.size || 0,
      hash: item.hash || item.content_hash,
      description: item.description || 'No description provided',
      ipfs_url: item.ipfs_url,
      content_analysis: null
    };

    // Extract content based on file type for AI analysis
    if (item.type && item.type.startsWith('image/')) {
      processed.content_analysis = {
        file_type: 'image',
        analysis_note: 'Image evidence - visual content analysis required',
        dimensions: item.dimensions || 'unknown',
        format: item.type.split('/')[1]
      };
    } else if (item.type === 'application/pdf') {
      processed.content_analysis = {
        file_type: 'document',
        analysis_note: 'PDF document - text and structure analysis required',
        pages: item.pages || 'unknown'
      };
    } else if (item.type === 'text/plain' || item.type === 'application/json') {
      processed.content_analysis = {
        file_type: 'text',
        analysis_note: 'Text content - direct content analysis possible',
        encoding: 'utf-8'
      };
    } else if (item.type && item.type.startsWith('video/')) {
      processed.content_analysis = {
        file_type: 'video',
        analysis_note: 'Video evidence - frame and audio analysis required',
        duration: item.duration || 'unknown',
        format: item.type.split('/')[1]
      };
    } else {
      processed.content_analysis = {
        file_type: 'other',
        analysis_note: 'Unknown file type - limited analysis capability',
        mime_type: item.type
      };
    }

    processedEvidence.push(processed);
  }

  return processedEvidence;
}

/**
 * Create deterministic scoring system for task completion
 * @param {string} taskDescription - Task requirements
 * @param {Array} processedEvidence - Processed evidence files
 * @param {Object} aiAnalysis - AI analysis result
 * @returns {Object} Scoring result with boolean determination
 */
function createDeterministicScore(taskDescription, processedEvidence, aiAnalysis) {
  let score = 0;
  const maxScore = 100;
  const factors = [];

  // Extract task metadata for enhanced scoring
  const taskKeywords = extractTaskKeywords(taskDescription);
  const taskComplexity = assessTaskComplexity(taskDescription);

  // Factor 1: Evidence quantity with complexity adjustment (0-20 points)
  const evidenceCount = processedEvidence.length;
  const complexityMultiplier = {
    'simple': 1.0,
    'moderate': 1.2,
    'complex': 1.5,
    'advanced': 2.0
  }[taskComplexity] || 1.0;
  
  const expectedFiles = Math.ceil(taskKeywords.length * complexityMultiplier);
  const quantityScore = Math.min((evidenceCount / Math.max(expectedFiles, 1)) * 20, 20);
  score += quantityScore;
  factors.push(`Evidence quantity: ${evidenceCount} files, expected ~${expectedFiles} (${quantityScore.toFixed(1)}/20 points)`);

  // Factor 2: Evidence diversity and relevance (0-18 points)
  const uniqueTypes = new Set(processedEvidence.map(e => e.content_analysis?.file_type)).size;
  const hasImages = processedEvidence.some(e => e.content_analysis?.file_type === 'image');
  const hasCode = processedEvidence.some(e => e.content_analysis?.file_type === 'text');
  const hasDocuments = processedEvidence.some(e => e.content_analysis?.file_type === 'document');
  
  let diversityScore = Math.min(uniqueTypes * 4, 12);
  if (hasImages && (taskDescription.toLowerCase().includes('screenshot') || taskDescription.toLowerCase().includes('image'))) {
    diversityScore += 3;
  }
  if (hasCode && (taskDescription.toLowerCase().includes('code') || taskDescription.toLowerCase().includes('programming'))) {
    diversityScore += 3;
  }
  diversityScore = Math.min(diversityScore, 18);
  score += diversityScore;
  factors.push(`Evidence diversity: ${uniqueTypes} types, bonus features (${diversityScore}/18 points)`);

  // Factor 3: File size and quality (0-12 points)
  const totalSize = processedEvidence.reduce((sum, e) => sum + (e.size || 0), 0);
  const avgSize = totalSize / Math.max(processedEvidence.length, 1);
  
  let sizeScore = 0;
  if (totalSize > 1000) {
    // Reward substantial evidence but not excessive files
    sizeScore = Math.min((totalSize / 100000) * 8, 8);
    
    if (avgSize > 10000 && avgSize < 2000000) {
      sizeScore += 4;
    }
  }
  sizeScore = Math.min(sizeScore, 12);
  score += sizeScore;
  factors.push(`File quality: ${totalSize} bytes total, avg ${Math.round(avgSize)} bytes (${sizeScore.toFixed(1)}/12 points)`);

  // Factor 4: AI confidence with keyword matching (0-35 points)
  const baseAiScore = (aiAnalysis.confidence || 0) * 30;
  let keywordBonus = 0;
  
  if (aiAnalysis.keyword_match_score !== undefined) {
    keywordBonus = aiAnalysis.keyword_match_score * 5;
  }
  
  const aiScore = Math.min(baseAiScore + keywordBonus, 35);
  score += aiScore;
  factors.push(`AI analysis: ${(aiAnalysis.confidence || 0).toFixed(2)} confidence + keyword match bonus (${aiScore.toFixed(1)}/35 points)`);

  // Factor 5: Task-evidence alignment (0-15 points)
  let alignmentScore = 0;
  
  // Check if evidence types match task requirements
  if (taskDescription.toLowerCase().includes('screenshot') && hasImages) {
    alignmentScore += 5;
  }
  if (taskDescription.toLowerCase().includes('code') && hasCode) {
    alignmentScore += 5;
  }
  if (taskDescription.toLowerCase().includes('document') && hasDocuments) {
    alignmentScore += 3;
  }
  
  // Bonus for comprehensive evidence on complex tasks
  if (taskComplexity === 'complex' || taskComplexity === 'advanced') {
    if (uniqueTypes >= 2) alignmentScore += 2;
  }
  
  alignmentScore = Math.min(alignmentScore, 15);
  score += alignmentScore;
  factors.push(`Task alignment: evidence matches requirements (${alignmentScore}/15 points)`);

  // Apply AI agreement requirement
  const threshold = parseFloat(process.env.VERIFICATION_CONFIDENCE_THRESHOLD) || 70;

  const aiAgreement = aiAnalysis.completed || aiAnalysis.result;
  const scoreThresholdMet = score >= threshold;
  const passed = scoreThresholdMet && aiAgreement;

  // Risk assessment
  const riskFactors = [];
  if (!aiAgreement) riskFactors.push('AI analysis indicates task not completed');
  if (evidenceCount < 1) riskFactors.push('No evidence provided');
  if (totalSize < 1000) riskFactors.push('Evidence files too small');
  if (aiAnalysis.confidence < 0.5) riskFactors.push('Low AI confidence score');

  return {
    total_score: Math.round(score),
    max_score: maxScore,
    percentage: Math.round((score / maxScore) * 100),
    threshold: threshold,
    passed,
    factors,
    ai_agreement: aiAgreement,
    task_complexity: taskComplexity,
    keyword_count: taskKeywords.length,
    risk_factors: riskFactors,
    final_decision: passed ? 'TASK_COMPLETED' : 'TASK_INCOMPLETE',
    confidence_level: score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'LOW'
  };
}

/**
 * Download and analyze IPFS content for evidence validation
 * @param {string} ipfsCid - IPFS content identifier
 * @param {string} filename - Original filename for context
 * @returns {Object} Content analysis result
 */
async function analyzeIPFSContent(ipfsCid, filename) {
  try {
    const response = await fetch(`https://${ipfsCid}.ipfs.w3s.link/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS content: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'unknown';
    const contentSize = parseInt(response.headers.get('content-length') || '0');
    
    let contentAnalysis = {
      accessible: true,
      content_type: contentType,
      size: contentSize,
      analysis_notes: []
    };

    // Analyze based on content type
    if (contentType.startsWith('image/')) {
      contentAnalysis.analysis_notes.push('Image file successfully accessible on IPFS');
      contentAnalysis.analysis_notes.push(`Image format: ${contentType}`);
      if (contentSize > 100000) {
        contentAnalysis.analysis_notes.push('High-quality image with substantial file size');
      }
    } else if (contentType.startsWith('text/') || contentType.includes('json')) {
      const textContent = await response.text();
      contentAnalysis.text_length = textContent.length;
      contentAnalysis.analysis_notes.push(`Text content with ${textContent.length} characters`);
      
      // Basic code detection
      if (textContent.includes('function') || textContent.includes('class') || textContent.includes('import')) {
        contentAnalysis.analysis_notes.push('Contains code-like content');
      }
    } else if (contentType === 'application/pdf') {
      contentAnalysis.analysis_notes.push('PDF document accessible on IPFS');
    }

    return contentAnalysis;
  } catch (error) {
    console.warn(`Failed to analyze IPFS content ${ipfsCid}:`, error.message);
    return {
      accessible: false,
      error: error.message,
      analysis_notes: ['Failed to access content on IPFS']
    };
  }
}

/**
 * Analyze task completion using AWS Bedrock AI with enhanced evidence processing
 * @param {string} taskDescription - Description of the task to verify
 * @param {Array} evidence - Array of evidence items (files, screenshots, etc.)
 * @returns {Object} AI analysis result with confidence score
 */
async function analyzeTaskCompletion(taskDescription, evidence) {
  try {
    console.log(`🔍 Processing ${evidence.length} evidence files for AI analysis...`);
    
    // Process evidence files for better AI understanding
    const processedEvidence = await processEvidenceFiles(evidence);
    
    // Analyze IPFS content accessibility for evidence with IPFS URLs
    for (const item of processedEvidence) {
      if (item.ipfs_url && item.ipfs_url.includes('.ipfs.w3s.link')) {
        try {
          const cidMatch = item.ipfs_url.match(/https:\/\/([^.]+)\.ipfs\.w3s\.link\/(.+)/);
          if (cidMatch) {
            const [, cid, filename] = cidMatch;
            const ipfsAnalysis = await analyzeIPFSContent(cid, filename);
            item.ipfs_analysis = ipfsAnalysis;
          }
        } catch (error) {
          console.warn('IPFS analysis failed:', error.message);
          item.ipfs_analysis = { accessible: false, error: error.message };
        }
      }
    }
    
    // Prepare detailed evidence summary for AI analysis
    const evidenceSummary = processedEvidence.map(item => ({
      filename: item.filename,
      type: item.type,
      size: item.size,
      content_analysis: item.content_analysis,
      description: item.description,
      hash: item.hash?.substring(0, 16) + '...' // Truncate hash for readability
    }));

    // Extract key requirements from task description for focused analysis
    const taskKeywords = extractTaskKeywords(taskDescription);
    const complexityLevel = assessTaskComplexity(taskDescription);

    // Create enhanced AI prompt for task verification with improved context
    const prompt = `
You are an AI verification agent for the AetherLock escrow protocol. Your job is to analyze evidence and determine if a task has been completed successfully.

TASK DESCRIPTION:
${taskDescription}

EXTRACTED TASK KEYWORDS: ${taskKeywords.join(', ')}
TASK COMPLEXITY LEVEL: ${complexityLevel}

EVIDENCE PROVIDED (${processedEvidence.length} files):
${JSON.stringify(evidenceSummary, null, 2)}

ANALYSIS INSTRUCTIONS:
1. Carefully analyze each piece of evidence against the specific task requirements
2. Consider the file types, sizes, and content analysis notes
3. Pay special attention to the extracted keywords and complexity level
4. Determine if the evidence collectively demonstrates task completion
5. Provide a confidence score between 0.0 and 1.0 based on evidence quality and relevance
6. Be thorough but fair - require clear evidence but don't be overly strict
7. Consider if the evidence quality matches the task complexity

EVALUATION CRITERIA:
- Evidence relevance to task requirements and keywords
- Quality and completeness of submitted files
- Logical consistency between task description and evidence
- Sufficient proof of work completion
- Evidence quality appropriate for task complexity
- File diversity and comprehensiveness

SCORING GUIDELINES:
- 0.9-1.0: Excellent evidence, clearly demonstrates completion
- 0.7-0.8: Good evidence, likely demonstrates completion
- 0.5-0.6: Moderate evidence, some concerns about completeness
- 0.3-0.4: Weak evidence, significant doubts about completion
- 0.0-0.2: Poor evidence, does not demonstrate completion

Respond in JSON format:
{
  "completed": boolean,
  "confidence": number,
  "explanation": "detailed explanation of your decision",
  "evidence_analysis": "analysis of each evidence file's contribution",
  "missing_evidence": "what additional evidence would strengthen the case (if any)",
  "risk_factors": "any concerns or red flags identified",
  "keyword_match_score": number,
  "complexity_assessment": "how well evidence matches task complexity"
}

Be objective and thorough in your evaluation. Only mark as completed if there is convincing evidence of task completion.
`;

    const modelId = process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
    
    console.log(`🤖 Sending analysis request to AWS Bedrock (${modelId})...`);
    
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        temperature: 0.1, // Low temperature for consistent analysis
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Parse AI response
    let aiResult;
    try {
      const aiText = responseBody.content[0].text;
      console.log('🧠 AI Response received, parsing...');
      aiResult = JSON.parse(aiText);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.log('Raw AI response:', responseBody.content[0].text);
      
      // Attempt to extract JSON from response if it's wrapped in text
      const jsonMatch = responseBody.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiResult = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          aiResult = {
            completed: false,
            confidence: 0.1,
            explanation: 'AI analysis failed - JSON parsing error',
            evidence_analysis: 'Unable to process evidence due to parsing error',
            missing_evidence: 'N/A',
            risk_factors: 'AI response parsing failed'
          };
        }
      } else {
        aiResult = {
          completed: false,
          confidence: 0.1,
          explanation: 'AI analysis failed - no valid JSON found in response',
          evidence_analysis: 'Unable to process evidence due to response format error',
          missing_evidence: 'N/A',
          risk_factors: 'AI response format invalid'
        };
      }
    }

    // Validate and normalize AI result
    const normalizedResult = {
      completed: Boolean(aiResult.completed),
      confidence: Math.min(Math.max(parseFloat(aiResult.confidence) || 0, 0), 1),
      explanation: aiResult.explanation || 'No explanation provided',
      evidence_analysis: aiResult.evidence_analysis || 'No analysis provided',
      missing_evidence: aiResult.missing_evidence || 'None specified',
      risk_factors: aiResult.risk_factors || 'None identified'
    };

    // Create deterministic scoring
    const scoringResult = createDeterministicScore(taskDescription, processedEvidence, normalizedResult);

    console.log(`📊 AI Analysis: ${normalizedResult.completed ? 'PASS' : 'FAIL'} (confidence: ${normalizedResult.confidence})`);
    console.log(`🎯 Deterministic Score: ${scoringResult.total_score}/${scoringResult.max_score} (${scoringResult.percentage}%)`);

    return {
      success: true,
      result: scoringResult.passed,
      confidence: normalizedResult.confidence,
      explanation: normalizedResult.explanation,
      evidence_analysis: normalizedResult.evidence_analysis,
      missing_evidence: normalizedResult.missing_evidence,
      risk_factors: normalizedResult.risk_factors,
      scoring: scoringResult,
      model_used: modelId,
      evidence_processed: processedEvidence.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ AWS Bedrock analysis error:', error);
    
    // Fallback analysis when AI is unavailable
    return {
      success: false,
      result: false,
      confidence: 0.0,
      explanation: 'AI verification service unavailable - task marked as incomplete for safety',
      evidence_analysis: 'Could not analyze evidence due to service error',
      missing_evidence: 'AI service unavailable',
      risk_factors: 'Service unavailability',
      scoring: {
        total_score: 0,
        max_score: 100,
        percentage: 0,
        passed: false,
        factors: ['AI service unavailable'],
        final_decision: 'SERVICE_ERROR'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * POST /api/verification/verify
 * Main verification endpoint that processes task completion
 */
router.post('/verify', async (req, res) => {
  try {
    const { 
      escrow_id, 
      task_description, 
      evidence = [],
      metadata = {} 
    } = req.body;

    // Validate required fields
    if (!escrow_id || !task_description) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: escrow_id and task_description',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    console.log(`🤖 Processing verification for escrow: ${escrow_id}`);
    console.log(`📋 Task: ${task_description}`);
    console.log(`📁 Evidence items: ${evidence.length}`);

    // Generate evidence hash
    const evidenceData = JSON.stringify(evidence.sort((a, b) => (a.hash || '').localeCompare(b.hash || '')));
    const evidenceHash = generateEvidenceHash(evidenceData);

    // Perform AI analysis (with demo mode support)
    const aiAnalysis = process.env.MOCK_AI_RESPONSES === 'true' 
      ? {
          success: true,
          result: true,
          confidence: 0.85 + Math.random() * 0.1,
          explanation: 'Demo mode: Task appears to be completed based on evidence analysis',
          evidence_analysis: 'Demo mode: Evidence files processed successfully',
          model_used: 'demo-mode-mock',
          evidence_processed: evidence.length
        }
      : await analyzeTaskCompletion(task_description, evidence);
    
    // Apply confidence threshold
    const confidenceThreshold = parseFloat(process.env.VERIFICATION_CONFIDENCE_THRESHOLD) || 0.8;
    const finalResult = aiAnalysis.success && 
                       aiAnalysis.result && 
                       aiAnalysis.confidence >= confidenceThreshold;

    console.log(`🎯 AI Result: ${aiAnalysis.result}, Confidence: ${aiAnalysis.confidence}`);
    console.log(`✅ Final Result: ${finalResult} (threshold: ${confidenceThreshold})`);

    // Create verification payload
    const verificationPayload = createVerificationPayload(
      escrow_id,
      finalResult,
      evidenceHash,
      aiAnalysis.confidence
    );

    // Sign the verification payload
    const keyPair = initializeKeyPair();
    const signedVerification = signVerificationPayload(verificationPayload, keyPair.secretKey);

    // Prepare response
    const response = {
      success: true,
      data: {
        verification: {
          escrow_id,
          result: finalResult,
          evidence_hash: evidenceHash,
          confidence_score: aiAnalysis.confidence,
          timestamp: verificationPayload.timestamp,
          agent_version: verificationPayload.agent_version
        },
        signature: signedVerification.signature,
        message: signedVerification.message,
        message_hash: signedVerification.messageHash,
        ai_analysis: {
          explanation: aiAnalysis.explanation,
          evidence_analysis: aiAnalysis.evidence_analysis,
          model_used: aiAnalysis.model_used,
          confidence_threshold: confidenceThreshold,
          threshold_met: aiAnalysis.confidence >= confidenceThreshold
        },
        metadata: {
          evidence_count: evidence.length,
          processing_time: new Date().toISOString(),
          agent_id: 'aetherlock-ai-agent'
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Verification processing failed',
        code: 'VERIFICATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

/**
 * POST /api/verification/mock
 * Mock verification endpoint for testing (development only)
 */
router.post('/mock', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Mock endpoint not available in production',
        code: 'PRODUCTION_RESTRICTION'
      }
    });
  }

  try {
    const { 
      escrow_id, 
      result = true, 
      confidence = 0.95,
      evidence_hash = 'mock_evidence_hash_' + Date.now()
    } = req.body;

    if (!escrow_id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required field: escrow_id',
          code: 'MISSING_ESCROW_ID'
        }
      });
    }

    // Create mock verification payload
    const verificationPayload = createVerificationPayload(
      escrow_id,
      result,
      evidence_hash,
      confidence
    );

    // Sign the verification payload
    const keyPair = initializeKeyPair();
    const signedVerification = signVerificationPayload(verificationPayload, keyPair.secretKey);

    res.json({
      success: true,
      data: {
        verification: verificationPayload,
        signature: signedVerification.signature,
        message: signedVerification.message,
        message_hash: signedVerification.messageHash,
        mock: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Mock verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Mock verification failed',
        code: 'MOCK_VERIFICATION_ERROR'
      }
    });
  }
});

/**
 * GET /api/verification/status/:escrow_id
 * Get verification status for an escrow (if stored)
 */
router.get('/status/:escrow_id', (req, res) => {
  const { escrow_id } = req.params;
  
  // This would typically query a database
  // For now, return a placeholder response
  res.json({
    success: true,
    data: {
      escrow_id,
      status: 'pending',
      message: 'Verification status tracking not yet implemented',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;