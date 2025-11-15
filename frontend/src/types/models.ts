// Core data models for AetherLock platform

/**
 * User Model
 * Represents a platform user (client or freelancer)
 */
export interface User {
  id: string;
  address: string;
  name?: string;
  role: 'client' | 'freelancer' | null;
  trustScore: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycLevel?: number;
  skills?: string[];
  completedJobs: number;
  successRate: number;
  totalEarned?: number;
  totalSpent?: number;
  joinedAt: Date;
  avatar?: string;
}

/**
 * Escrow Model
 * Represents an escrow agreement between client and freelancer
 */
export interface Escrow {
  id: string;
  onChainId?: string;
  title: string;
  description: string;
  amount: number;
  currency: 'SOL' | 'USDC' | 'ZETA';
  status: 'pending' | 'active' | 'ai_reviewing' | 'completed' | 'disputed' | 'cancelled';
  clientAddress: string;
  freelancerAddress?: string;
  createdAt: Date;
  deadline: Date;
  milestones: Milestone[];
  submissions: Submission[];
  aiVerification?: AIVerificationResult;
  disputeInfo?: DisputeInfo;
  ipfsHash?: string;
}

/**
 * Submission Model
 * Represents work submitted by a freelancer
 */
export interface Submission {
  id: string;
  escrowId: string;
  freelancerAddress: string;
  description: string;
  evidence: Evidence[];
  submittedAt: Date;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
}

/**
 * Milestone Model
 * Represents a subdivision of an escrow with specific deliverables
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  amount: number;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  submissionId?: string;
}

/**
 * Evidence Model
 * Represents files uploaded to IPFS as proof of work
 */
export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  ipfsHash: string;
  uploadedAt: Date;
  thumbnail?: string;
}

/**
 * AI Verification Result Model
 * Contains the results of AI-powered work verification
 */
export interface AIVerificationResult {
  passed: boolean;
  confidence: number; // 0-100
  feedback: string;
  timestamp: Date;
  analysisDetails: {
    qualityScore: number;
    completenessScore: number;
    accuracyScore: number;
    suggestions: string[];
  };
}

/**
 * Dispute Info Model
 * Contains information about an escrow dispute
 */
export interface DisputeInfo {
  id: string;
  escrowId: string;
  initiatedBy: 'client' | 'freelancer';
  reason: string;
  evidence: Evidence[];
  status: 'open' | 'under_review' | 'resolved';
  resolution?: string;
  resolvedAt?: Date;
  deadline: Date;
}

/**
 * Notification Model
 * Represents a user notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: 'escrow_created' | 'work_submitted' | 'ai_verified' | 'funds_released' | 'dispute_opened' | 'message_received';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

/**
 * Message Model
 * Represents a chat message between client and freelancer
 */
export interface Message {
  id: string;
  escrowId: string;
  senderId: string;
  senderRole: 'client' | 'freelancer';
  content: string;
  timestamp: Date;
  read: boolean;
}

/**
 * Blockchain Stats Model
 * Contains live statistics from various blockchain networks
 */
export interface BlockchainStats {
  solana: {
    tps: number;
    blockHeight: number;
    status: 'online' | 'degraded' | 'offline';
  };
  zetachain: {
    status: 'online' | 'offline';
    connectedChains: number;
  };
  ipfs: {
    uptime: number;
    status: 'online' | 'offline';
  };
  ai: {
    model: string;
    status: 'active' | 'inactive';
    responseTime: number;
  };
}

/**
 * Wallet Info Model
 * Contains information about a connected wallet
 */
export interface WalletInfo {
  address: string;
  chain: 'solana' | 'zetachain' | 'sui' | 'ton';
  balance: number;
  walletType: 'phantom' | 'metamask' | 'sui' | 'ton';
  isConnected: boolean;
}

/**
 * User Settings Model
 * Contains user preferences and settings
 */
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  theme: 'dark' | 'light';
}
