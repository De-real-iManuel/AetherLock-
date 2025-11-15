// Component prop types

import type { ReactNode } from 'react';
import type {
  User,
  Escrow,
  Submission,
  Milestone,
  Evidence,
  AIVerificationResult,
  DisputeInfo,
  Message,
  WalletInfo,
} from './models';

// ============================================================================
// Common Component Props
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: Error | string | null;
  onRetry?: () => void;
}

// ============================================================================
// Layout Component Props
// ============================================================================

export interface NavbarProps extends BaseComponentProps {
  user?: User;
  wallet?: WalletInfo;
  onWalletConnect?: () => void;
  onWalletDisconnect?: () => void;
  unreadNotifications?: number;
}

export interface FooterProps extends BaseComponentProps {
  showSocialLinks?: boolean;
  showLegalLinks?: boolean;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'client' | 'freelancer';
}

// ============================================================================
// Wallet Component Props
// ============================================================================

export interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => Promise<void>;
}

export interface WalletButtonProps extends BaseComponentProps {
  wallet?: WalletInfo;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

// ============================================================================
// KYC Component Props
// ============================================================================

export interface ZkMeKYCWidgetProps {
  userAddress: string;
  chain: string;
  onComplete: (status: 'verified' | 'rejected') => void;
  onClose: () => void;
  autoTrigger?: boolean;
}

export interface KYCStatusBadgeProps extends BaseComponentProps {
  status: 'pending' | 'verified' | 'rejected';
  level?: number;
  showDetails?: boolean;
}

// ============================================================================
// Auth Component Props
// ============================================================================

export interface RoleSelectionCardProps extends BaseComponentProps {
  role: 'client' | 'freelancer';
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
  onSelect: (role: 'client' | 'freelancer') => void;
  isSelected?: boolean;
}

// ============================================================================
// Escrow Component Props
// ============================================================================

export interface EscrowCreationWizardProps {
  onComplete: (escrow: Escrow) => void;
  onCancel: () => void;
  initialData?: Partial<Escrow>;
}

export interface EscrowStatusCardProps extends BaseComponentProps {
  escrow: Escrow;
  userRole: 'client' | 'freelancer';
  onViewDetails: () => void;
  onSubmitWork?: () => void;
  onRelease?: () => void;
  onDispute?: () => void;
}

export interface EscrowTableProps extends BaseComponentProps {
  escrows: Escrow[];
  onRowClick: (escrow: Escrow) => void;
  sortBy?: 'title' | 'amount' | 'deadline' | 'status';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  isLoading?: boolean;
}

export interface MilestoneListProps extends BaseComponentProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
  showProgress?: boolean;
}

export interface MilestoneCardProps extends BaseComponentProps {
  milestone: Milestone;
  onClick?: () => void;
  showActions?: boolean;
}

// ============================================================================
// Submission Component Props
// ============================================================================

export interface SubmissionFormProps {
  escrowId: string;
  onSubmit: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  onCancel: () => void;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface EvidenceViewerProps extends BaseComponentProps {
  evidence: Evidence[];
  aiAnalysis?: AIVerificationResult;
  onDownload: (evidence: Evidence) => void;
  onPreview: (evidence: Evidence) => void;
}

export interface FileUploadProps extends BaseComponentProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFileSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
  isUploading?: boolean;
  progress?: number;
}

// ============================================================================
// AI Verification Component Props
// ============================================================================

export interface AIVerificationCardProps extends BaseComponentProps {
  result: AIVerificationResult;
  escrowId: string;
  onAccept?: () => void;
  onDispute?: () => void;
  showActions?: boolean;
}

export interface ConfidenceMeterProps extends BaseComponentProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export interface AnalysisDetailsProps extends BaseComponentProps {
  details: AIVerificationResult['analysisDetails'];
  showSuggestions?: boolean;
}

// ============================================================================
// Dispute Component Props
// ============================================================================

export interface DisputeFormProps {
  escrowId: string;
  onSubmit: (dispute: Omit<DisputeInfo, 'id' | 'status' | 'deadline'>) => Promise<void>;
  onCancel: () => void;
}

export interface DisputeTimerProps extends BaseComponentProps {
  deadline: Date;
  onExpire?: () => void;
  showWarning?: boolean;
}

export interface DisputeCardProps extends BaseComponentProps {
  dispute: DisputeInfo;
  onViewDetails?: () => void;
}

// ============================================================================
// Chat Component Props
// ============================================================================

export interface ChatInterfaceProps extends BaseComponentProps {
  escrowId: string;
  currentUserId: string;
  currentUserRole: 'client' | 'freelancer';
  onClose?: () => void;
}

export interface MessageBubbleProps extends BaseComponentProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export interface ChatInputProps extends BaseComponentProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export interface UnreadIndicatorProps extends BaseComponentProps {
  count: number;
  maxDisplay?: number;
}

// ============================================================================
// Dashboard Component Props
// ============================================================================

export interface DashboardStatsProps extends BaseComponentProps {
  stats: {
    totalEscrows?: number;
    activeEscrows?: number;
    completedEscrows?: number;
    totalAmount?: number;
    successRate?: number;
  };
  userRole: 'client' | 'freelancer';
}

export interface TransactionChartProps extends BaseComponentProps {
  data: Array<{
    date: Date;
    amount: number;
  }>;
  dateRange?: '7d' | '30d' | '90d' | 'all';
  onDateRangeChange?: (range: string) => void;
}

export interface ActivityFeedProps extends BaseComponentProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    icon?: ReactNode;
  }>;
  maxItems?: number;
}

export interface EarningsSummaryProps extends BaseComponentProps {
  totalEarned: number;
  pendingPayments: number;
  successRate: number;
  currency?: string;
}

// ============================================================================
// Landing Page Component Props
// ============================================================================

export interface HeroSectionProps extends BaseComponentProps {
  onGetStarted: () => void;
  stats?: {
    solanaTPS?: number;
    zetachainStatus?: string;
    ipfsUptime?: number;
    aiStatus?: string;
  };
}

export interface HowItWorksSectionProps extends BaseComponentProps {
  steps: Array<{
    title: string;
    description: string;
    icon: ReactNode;
  }>;
}

export interface WhyAetherLockSectionProps extends BaseComponentProps {
  features: Array<{
    title: string;
    description: string;
    icon: ReactNode;
  }>;
}

export interface TestimonialsSectionProps extends BaseComponentProps {
  testimonials: Array<{
    name: string;
    role: string;
    avatar?: string;
    rating: number;
    text: string;
  }>;
  autoScroll?: boolean;
  scrollInterval?: number;
}

// ============================================================================
// Animation Component Props
// ============================================================================

export interface ParticleBackgroundProps extends BaseComponentProps {
  particleCount?: number;
  particleColor?: string;
  connectionDistance?: number;
  mouseInteraction?: boolean;
}

export interface NeonGridProps extends BaseComponentProps {
  gridSize?: number;
  glowColor?: string;
  animated?: boolean;
}

export interface HolographicCardProps extends BaseComponentProps {
  glowColor?: string;
  hoverScale?: number;
  tiltEffect?: boolean;
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  fullWidth?: boolean;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  hoverable?: boolean;
  glassmorphism?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}

export interface ToastProps extends BaseComponentProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export interface SpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface ProgressBarProps extends BaseComponentProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  color?: string;
  animated?: boolean;
}

export interface TabsProps extends BaseComponentProps {
  tabs: Array<{
    id: string;
    label: string;
    content: ReactNode;
    icon?: ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export interface AccordionProps extends BaseComponentProps {
  items: Array<{
    id: string;
    title: string;
    content: ReactNode;
  }>;
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

// ============================================================================
// Settings Component Props
// ============================================================================

export interface SettingsPageProps extends BaseComponentProps {
  user: User;
  onUpdateProfile: (data: Partial<User>) => Promise<void>;
  onUpdateSettings: (settings: any) => Promise<void>;
}

export interface NotificationPreferencesProps extends BaseComponentProps {
  preferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  onChange: (preferences: any) => void;
}

export interface ThemeSwitcherProps extends BaseComponentProps {
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}
