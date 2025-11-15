// API request and response types

import type {
  User,
  Escrow,
  Submission,
  AIVerificationResult,
  DisputeInfo,
  Message,
  Notification,
  Evidence,
  Milestone,
  UserSettings,
} from './models';

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// User API Types
// ============================================================================

export interface GetUserProfileRequest {
  address: string;
}

export interface GetUserProfileResponse extends ApiResponse<User> {}

export interface UpdateUserProfileRequest {
  name?: string;
  skills?: string[];
  avatar?: string;
}

export interface UpdateUserProfileResponse extends ApiResponse<User> {}

export interface UpdateUserSettingsRequest {
  settings: UserSettings;
}

export interface UpdateUserSettingsResponse extends ApiResponse<UserSettings> {}

// ============================================================================
// Escrow API Types
// ============================================================================

export interface CreateEscrowRequest {
  title: string;
  description: string;
  amount: number;
  currency: 'SOL' | 'USDC' | 'ZETA';
  deadline: Date;
  milestones: Omit<Milestone, 'id' | 'status' | 'submissionId' | 'amount'>[];
  freelancerAddress?: string;
}

export interface CreateEscrowResponse extends ApiResponse<Escrow> {}

export interface GetEscrowRequest {
  id: string;
}

export interface GetEscrowResponse extends ApiResponse<Escrow> {}

export interface ListEscrowsRequest {
  page?: number;
  limit?: number;
  status?: Escrow['status'];
  clientAddress?: string;
  freelancerAddress?: string;
  sortBy?: 'createdAt' | 'deadline' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface ListEscrowsResponse extends PaginatedResponse<Escrow> {}

export interface AcceptEscrowRequest {
  escrowId: string;
  freelancerAddress: string;
}

export interface AcceptEscrowResponse extends ApiResponse<Escrow> {}

export interface SubmitWorkRequest {
  escrowId: string;
  description: string;
  evidence: File[];
}

export interface SubmitWorkResponse extends ApiResponse<Submission> {}

export interface ReleaseFundsRequest {
  escrowId: string;
  milestoneId?: string;
}

export interface ReleaseFundsResponse extends ApiResponse<Escrow> {}

export interface OpenDisputeRequest {
  escrowId: string;
  reason: string;
  evidence?: File[];
}

export interface OpenDisputeResponse extends ApiResponse<DisputeInfo> {}

// ============================================================================
// AI Verification API Types
// ============================================================================

export interface VerifyWorkRequest {
  submissionId: string;
  escrowId: string;
  evidence: Evidence[];
  description: string;
}

export interface VerifyWorkResponse extends ApiResponse<AIVerificationResult> {}

// ============================================================================
// IPFS API Types
// ============================================================================

export interface UploadToIPFSRequest {
  file: File;
  metadata?: Record<string, any>;
}

export interface UploadToIPFSResponse extends ApiResponse<{
  ipfsHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}> {}

export interface GetFromIPFSRequest {
  ipfsHash: string;
}

export interface GetFromIPFSResponse extends ApiResponse<{
  url: string;
  metadata?: Record<string, any>;
}> {}

// ============================================================================
// zkMe KYC API Types
// ============================================================================

export interface InitializeKYCRequest {
  userAddress: string;
  chain: string;
}

export interface InitializeKYCResponse extends ApiResponse<{
  sessionId: string;
  widgetUrl: string;
}> {}

export interface GetKYCStatusRequest {
  userAddress: string;
}

export interface GetKYCStatusResponse extends ApiResponse<{
  status: 'pending' | 'verified' | 'rejected';
  level?: number;
  verifiedAt?: Date;
}> {}

export interface KYCWebhookPayload {
  sessionId: string;
  userAddress: string;
  status: 'verified' | 'rejected';
  level?: number;
  timestamp: Date;
}

// ============================================================================
// Chat API Types
// ============================================================================

export interface GetChatHistoryRequest {
  escrowId: string;
  page?: number;
  limit?: number;
}

export interface GetChatHistoryResponse extends PaginatedResponse<Message> {}

export interface SendMessageRequest {
  escrowId: string;
  content: string;
}

export interface SendMessageResponse extends ApiResponse<Message> {}

export interface MarkMessageReadRequest {
  messageId: string;
}

export interface MarkMessageReadResponse extends ApiResponse<{ success: boolean }> {}

// ============================================================================
// Notification API Types
// ============================================================================

export interface GetNotificationsRequest {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse extends PaginatedResponse<Notification> {}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface MarkNotificationReadResponse extends ApiResponse<{ success: boolean }> {}

// ============================================================================
// Wallet API Types
// ============================================================================

export interface ConnectWalletRequest {
  walletType: 'phantom' | 'metamask' | 'sui' | 'ton';
  chain: 'solana' | 'zetachain' | 'sui' | 'ton';
}

export interface ConnectWalletResponse extends ApiResponse<{
  address: string;
  balance: number;
  signature: string;
}> {}

export interface VerifyWalletSignatureRequest {
  address: string;
  signature: string;
  message: string;
}

export interface VerifyWalletSignatureResponse extends ApiResponse<{
  verified: boolean;
  token?: string;
}> {}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'WALLET_ERROR'
  | 'KYC_ERROR'
  | 'IPFS_ERROR'
  | 'AI_VERIFICATION_ERROR';
