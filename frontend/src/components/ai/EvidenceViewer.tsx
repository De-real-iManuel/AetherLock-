import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Evidence } from '@/types/models';
import { getIPFSUrl, downloadFromIPFS, formatFileSize } from '@/services/ipfs';
import { 
  File, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Archive, 
  Download, 
  ExternalLink,
  X,
  ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EvidenceViewerProps {
  evidence: Evidence[];
  className?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  evidence,
  className,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Check if file is previewable
  const isPreviewable = (fileType: string): boolean => {
    return fileType.startsWith('image/') || fileType === 'application/pdf';
  };

  // Handle file download
  const handleDownload = async (evidence: Evidence) => {
    try {
      setIsDownloading(evidence.id);
      await downloadFromIPFS(evidence.ipfsHash, evidence.fileName);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  // Handle preview
  const handlePreview = (evidence: Evidence) => {
    if (isPreviewable(evidence.fileType)) {
      setSelectedEvidence(evidence);
    }
  };

  // Get thumbnail or placeholder
  const getThumbnail = (evidence: Evidence): string | null => {
    if (evidence.thumbnail) {
      return evidence.thumbnail;
    }
    if (evidence.fileType.startsWith('image/')) {
      return getIPFSUrl(evidence.ipfsHash);
    }
    return null;
  };

  if (evidence.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <File className="w-12 h-12 mx-auto mb-3 text-slate-500" />
        <p className="text-slate-400">No evidence files uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-3', className)}>
        {evidence.map((item) => {
          const thumbnail = getThumbnail(item);
          const canPreview = isPreviewable(item.fileType);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-lg border border-primary-border bg-primary-surface/50 backdrop-blur-sm hover:border-accent-electric/50 transition-all duration-200"
            >
              {/* Thumbnail or Icon */}
              <div className="flex-shrink-0">
                {thumbnail ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-primary-surface border border-primary-border">
                    <img
                      src={thumbnail}
                      alt={item.fileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {canPreview && (
                      <button
                        onClick={() => handlePreview(item)}
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <ZoomIn className="w-6 h-6 text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary-surface border border-primary-border flex items-center justify-center text-accent-electric">
                    {getFileIcon(item.fileType)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate mb-1">
                  {item.fileName}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="font-mono truncate max-w-[200px]" title={item.ipfsHash}>
                    {item.ipfsHash.substring(0, 8)}...{item.ipfsHash.substring(item.ipfsHash.length - 6)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(item)}
                    title="Preview"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getIPFSUrl(item.ipfsHash), '_blank')}
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(item)}
                  loading={isDownloading === item.id}
                  disabled={isDownloading === item.id}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEvidence(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-primary-surface border border-primary-border rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-primary-border bg-primary-dark/50 backdrop-blur-sm">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {selectedEvidence.fileName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    IPFS: {selectedEvidence.ipfsHash}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(selectedEvidence)}
                    loading={isDownloading === selectedEvidence.id}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <button
                    onClick={() => setSelectedEvidence(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {selectedEvidence.fileType.startsWith('image/') && (
                  <img
                    src={getIPFSUrl(selectedEvidence.ipfsHash)}
                    alt={selectedEvidence.fileName}
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {selectedEvidence.fileType === 'application/pdf' && (
                  <iframe
                    src={getIPFSUrl(selectedEvidence.ipfsHash)}
                    className="w-full h-[calc(90vh-120px)] rounded-lg"
                    title={selectedEvidence.fileName}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
