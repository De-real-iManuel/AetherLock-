import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { uploadToIPFS, formatFileSize, getIPFSErrorMessage, IPFSError } from '@/services/ipfs';
import { Evidence } from '@/types/models';
import { Upload, X, File, Image, Video, FileText, Archive, CheckCircle, AlertCircle } from 'lucide-react';

interface SubmissionFormProps {
  escrowId: string;
  onSubmit: (data: SubmissionData) => Promise<void>;
  onCancel?: () => void;
}

export interface SubmissionData {
  description: string;
  evidence: Evidence[];
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  ipfsHash?: string;
  error?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  escrowId,
  onSubmit,
  onCancel,
}) => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 100MB limit (${formatFileSize(file.size)})`;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileUploadState[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        newFiles.push({
          file,
          progress: 0,
          status: 'pending',
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Remove file
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files to IPFS
  const uploadFiles = async (): Promise<Evidence[]> => {
    const evidence: Evidence[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileState = files[i];
      
      if (fileState.status === 'completed' && fileState.ipfsHash) {
        // Already uploaded
        evidence.push({
          id: `${Date.now()}-${i}`,
          fileName: fileState.file.name,
          fileType: fileState.file.type,
          ipfsHash: fileState.ipfsHash,
          uploadedAt: new Date(),
        });
        continue;
      }

      try {
        // Update status to uploading
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'uploading', progress: 0 };
          return updated;
        });

        // Upload to IPFS
        const result = await uploadToIPFS(fileState.file, (progress) => {
          setFiles((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], progress };
            return updated;
          });
        });

        // Update status to completed
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'completed',
            progress: 100,
            ipfsHash: result.ipfsHash,
          };
          return updated;
        });

        evidence.push({
          id: `${Date.now()}-${i}`,
          fileName: fileState.file.name,
          fileType: fileState.file.type,
          ipfsHash: result.ipfsHash,
          uploadedAt: new Date(),
        });
      } catch (err) {
        const errorMessage = err instanceof IPFSError 
          ? getIPFSErrorMessage(err)
          : 'Failed to upload file';

        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: errorMessage,
          };
          return updated;
        });

        throw new Error(`Failed to upload ${fileState.file.name}: ${errorMessage}`);
      }
    }

    return evidence;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!description.trim()) {
      setError('Please provide a description of your work');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one file as evidence');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload files to IPFS
      const evidence = await uploadFiles();

      // Submit the form
      await onSubmit({
        description: description.trim(),
        evidence,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit work');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Work Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work you've completed and how it meets the requirements..."
            className={cn(
              "w-full min-h-[120px] rounded-md border bg-primary-surface/50 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-electric focus-visible:border-accent-electric transition-all duration-200 resize-y",
              "border-primary-border hover:border-accent-electric/50"
            )}
            disabled={isSubmitting}
          />
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Evidence Files *
          </label>
          
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-accent-electric bg-accent-electric/10"
                : "border-primary-border hover:border-accent-electric/50 bg-primary-surface/30"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
              disabled={isSubmitting}
            />
            
            <Upload className="w-12 h-12 mx-auto mb-4 text-accent-electric" />
            <p className="text-white font-medium mb-1">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-slate-400">
              Images, documents, videos, archives (max 100MB per file)
            </p>
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2"
              >
                {files.map((fileState, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm",
                      fileState.status === 'error'
                        ? "bg-status-failed/10 border-status-failed"
                        : fileState.status === 'completed'
                        ? "bg-status-verified/10 border-status-verified"
                        : "bg-primary-surface/50 border-primary-border"
                    )}
                  >
                    {/* File Icon */}
                    <div className="flex-shrink-0 text-accent-electric">
                      {getFileIcon(fileState.file.type)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {fileState.file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(fileState.file.size)}
                      </p>

                      {/* Progress Bar */}
                      {fileState.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="h-1 bg-primary-border rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-accent-electric to-accent-cyan"
                              initial={{ width: 0 }}
                              animate={{ width: `${fileState.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Uploading... {fileState.progress}%
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {fileState.status === 'error' && fileState.error && (
                        <p className="text-xs text-status-failed mt-1">
                          {fileState.error}
                        </p>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {fileState.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-status-verified" />
                      )}
                      {fileState.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-status-failed" />
                      )}
                      {fileState.status === 'pending' && !isSubmitting && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400 hover:text-white" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-status-failed/10 border border-status-failed"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-status-failed flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-failed">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || files.length === 0 || !description.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Work'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
