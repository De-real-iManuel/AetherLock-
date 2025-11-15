import axios from 'axios';
import FormData from 'form-data';

class MultiModalService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyDRpmslRI-KjdvPlkjGCrfgpI3Tuhc3-g4';
    this.geminiModel = 'gemini-2.0-flash';
    this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Analyze image evidence using Gemini Vision
   */
  async analyzeImage(imageBuffer, context) {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `Analyze this image as evidence for an escrow transaction:
Context: ${context}

Provide analysis in JSON:
{
  "description": "what the image shows",
  "relevance": 0-100,
  "authenticity": 0-100,
  "qualityScore": 0-100,
  "detectedObjects": ["object1", "object2"],
  "verificationStatus": "verified/suspicious/unclear",
  "reasoning": "detailed explanation"
}`;

      const response = await axios.post(
        `${this.geminiUrl}/${this.geminiModel}:generateContent`,
        {
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.geminiKey
          }
        }
      );

      const text = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        description: 'Image uploaded',
        relevance: 50,
        authenticity: 50,
        qualityScore: 50,
        detectedObjects: [],
        verificationStatus: 'unclear',
        reasoning: 'Unable to analyze image'
      };
    }
  }

  /**
   * Extract text from documents (OCR simulation)
   */
  async extractDocumentText(fileBuffer, fileName) {
    try {
      const base64Doc = fileBuffer.toString('base64');
      
      const prompt = `Extract and analyze text from this document:
Filename: ${fileName}

Provide extraction in JSON:
{
  "extractedText": "full text content",
  "documentType": "invoice/contract/receipt/other",
  "keyInformation": {"field": "value"},
  "confidence": 0-100,
  "relevantData": ["data1", "data2"]
}`;

      const response = await axios.post(
        `${this.geminiUrl}/${this.geminiModel}:generateContent`,
        {
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'application/pdf', data: base64Doc } }
            ]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.geminiKey
          }
        }
      );

      const text = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
      console.error('Document extraction failed:', error);
      return {
        extractedText: 'Document uploaded',
        documentType: 'unknown',
        keyInformation: {},
        confidence: 50,
        relevantData: []
      };
    }
  }

  /**
   * Analyze video evidence (frame-by-frame)
   */
  async analyzeVideo(videoBuffer, context) {
    try {
      // Extract key frames (simplified - in production use ffmpeg)
      const frames = await this.extractKeyFrames(videoBuffer);
      
      const frameAnalyses = await Promise.all(
        frames.map(frame => this.analyzeImage(frame, context))
      );

      return {
        totalFrames: frames.length,
        frameAnalyses,
        overallScore: this.calculateAverageScore(frameAnalyses),
        timeline: this.generateTimeline(frameAnalyses),
        verificationStatus: this.determineVideoStatus(frameAnalyses)
      };
    } catch (error) {
      console.error('Video analysis failed:', error);
      return {
        totalFrames: 0,
        frameAnalyses: [],
        overallScore: 50,
        timeline: [],
        verificationStatus: 'unclear'
      };
    }
  }

  /**
   * Comprehensive multi-modal evidence analysis
   */
  async analyzeAllEvidence(files, context) {
    const analyses = [];

    for (const file of files) {
      let analysis;
      
      if (file.mimetype.includes('image')) {
        analysis = await this.analyzeImage(file.buffer, context);
        analysis.type = 'image';
      } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
        analysis = await this.extractDocumentText(file.buffer, file.originalname);
        analysis.type = 'document';
      } else if (file.mimetype.includes('video')) {
        analysis = await this.analyzeVideo(file.buffer, context);
        analysis.type = 'video';
      } else {
        analysis = {
          type: 'unknown',
          fileName: file.originalname,
          size: file.size,
          status: 'uploaded'
        };
      }

      analysis.fileName = file.originalname;
      analysis.fileSize = file.size;
      analyses.push(analysis);
    }

    return {
      totalFiles: files.length,
      analyses,
      overallScore: this.calculateOverallScore(analyses),
      recommendation: this.generateRecommendation(analyses),
      crossReferenceResults: this.crossReferenceEvidence(analyses)
    };
  }

  /**
   * Cross-reference evidence for consistency
   */
  crossReferenceEvidence(analyses) {
    const imageData = analyses.filter(a => a.type === 'image');
    const docData = analyses.filter(a => a.type === 'document');
    
    return {
      consistencyScore: this.checkConsistency(imageData, docData),
      conflicts: this.findConflicts(analyses),
      supportingEvidence: this.findSupporting(analyses)
    };
  }

  /**
   * Helper methods
   */
  calculateAverageScore(analyses) {
    if (analyses.length === 0) return 0;
    const sum = analyses.reduce((acc, a) => acc + (a.qualityScore || 0), 0);
    return Math.round(sum / analyses.length);
  }

  calculateOverallScore(analyses) {
    if (analyses.length === 0) return 0;
    const scores = analyses.map(a => a.relevance || a.qualityScore || 50);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  generateTimeline(frameAnalyses) {
    return frameAnalyses.map((frame, index) => ({
      timestamp: index,
      description: frame.description,
      score: frame.qualityScore
    }));
  }

  determineVideoStatus(frameAnalyses) {
    const avgAuth = this.calculateAverageScore(frameAnalyses);
    if (avgAuth > 70) return 'verified';
    if (avgAuth < 40) return 'suspicious';
    return 'unclear';
  }

  generateRecommendation(analyses) {
    const avgScore = this.calculateOverallScore(analyses);
    if (avgScore > 75) return 'Strong evidence - recommend approval';
    if (avgScore > 50) return 'Moderate evidence - request additional proof';
    return 'Weak evidence - recommend rejection';
  }

  checkConsistency(imageData, docData) {
    // Simplified consistency check
    return imageData.length > 0 && docData.length > 0 ? 80 : 50;
  }

  findConflicts(analyses) {
    return analyses.filter(a => a.verificationStatus === 'suspicious');
  }

  findSupporting(analyses) {
    return analyses.filter(a => a.verificationStatus === 'verified');
  }

  async extractKeyFrames(videoBuffer) {
    // Simplified - return empty array
    // In production, use ffmpeg to extract frames
    return [];
  }
}

export default MultiModalService;
export { MultiModalService };