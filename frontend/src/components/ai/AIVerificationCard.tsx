import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AIVerificationResult } from '@/types/models';
import { ConfidenceMeter } from './ConfidenceMeter';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Target,
  Award,
  Lightbulb,
  Clock
} from 'lucide-react';

interface AIVerificationCardProps {
  result: AIVerificationResult;
  escrowId: string;
  onAccept?: () => void;
  onDispute?: () => void;
  showActions?: boolean;
  className?: string;
}

export const AIVerificationCard: React.FC<AIVerificationCardProps> = ({
  result,
  escrowId,
  onAccept,
  onDispute,
  showActions = true,
  className,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  const handleAccept = async () => {
    if (!onAccept) return;
    try {
      setIsAccepting(true);
      await onAccept();
    } catch (error) {
      console.error('Failed to accept:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDispute = async () => {
    if (!onDispute) return;
    try {
      setIsDisputing(true);
      await onDispute();
    } catch (error) {
      console.error('Failed to dispute:', error);
    } finally {
      setIsDisputing(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border backdrop-blur-sm overflow-hidden',
        result.passed
          ? 'bg-status-verified/5 border-status-verified'
          : 'bg-status-failed/5 border-status-failed',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-primary-border bg-primary-surface/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div
              className={cn(
                'p-3 rounded-lg',
                result.passed
                  ? 'bg-status-verified/20 text-status-verified'
                  : 'bg-status-failed/20 text-status-failed'
              )}
            >
              {result.passed ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            {/* Status Text */}
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {result.passed ? 'Work Verified' : 'Verification Failed'}
              </h3>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTimestamp(result.timestamp)}
              </p>
            </div>
          </div>

          {/* Confidence Meter */}
          <ConfidenceMeter
            value={result.confidence}
            size="sm"
            showLabel={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* AI Feedback */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-electric" />
            AI Analysis
          </h4>
          <p className="text-white leading-relaxed">{result.feedback}</p>
        </div>

        {/* Detailed Scores */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Detailed Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quality Score */}
            <div className="p-4 rounded-lg bg-primary-surface/50 border border-primary-border">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-accent-electric" />
                <span className="text-xs font-medium text-slate-400">Quality</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {result.analysisDetails.qualityScore}
                </span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-primary-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-electric to-accent-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.analysisDetails.qualityScore}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Completeness Score */}
            <div className="p-4 rounded-lg bg-primary-surface/50 border border-primary-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent-cyan" />
                <span className="text-xs font-medium text-slate-400">Completeness</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {result.analysisDetails.completenessScore}
                </span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-primary-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.analysisDetails.completenessScore}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>

            {/* Accuracy Score */}
            <div className="p-4 rounded-lg bg-primary-surface/50 border border-primary-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent-purple" />
                <span className="text-xs font-medium text-slate-400">Accuracy</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {result.analysisDetails.accuracyScore}
                </span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-primary-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-purple to-accent-electric"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.analysisDetails.accuracyScore}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        {result.analysisDetails.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent-electric" />
              {result.passed ? 'Recommendations' : 'Suggestions for Improvement'}
            </h4>
            <ul className="space-y-2">
              {result.analysisDetails.suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary-surface/50 border border-primary-border"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-electric/20 text-accent-electric flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-300 flex-1">{suggestion}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (onAccept || onDispute) && (
          <div className="pt-4 border-t border-primary-border">
            <div className="flex flex-col sm:flex-row gap-3">
              {onAccept && (
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  loading={isAccepting}
                  disabled={isAccepting || isDisputing}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Release Funds
                </Button>
              )}
              {onDispute && (
                <Button
                  variant="outline"
                  onClick={handleDispute}
                  loading={isDisputing}
                  disabled={isAccepting || isDisputing}
                  className="flex-1"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Open Dispute
                </Button>
              )}
            </div>
            {!result.passed && (
              <p className="text-xs text-slate-400 mt-3 text-center">
                You can accept the work despite the AI verification result, or open a dispute for review
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
