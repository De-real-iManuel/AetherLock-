import axios, { AxiosProgressEvent } from 'axios';

// IPFS Configuration
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// File size limit: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// IPFS upload result
export interface IPFSUploadResult {
  ipfsHash: string;
  fileName: string;
  fileSize: number;
  timestamp: string;
  pinataUrl: string;
  gatewayUrl: string;
}

// Upload progress callback
export type UploadProgressCallback = (progress: number) => void;

// IPFS error class
export class IPFSError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'IPFSError';
  }
}

/**
 * Validate file size
 */
const validateFileSize = (file: File): void => {
  if (file.size > MAX_FILE_SIZE) {
    throw new IPFSError(
      `File size exceeds maximum limit of 100MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      'FILE_TOO_LARGE'
    );
  }
};

/**
 * Validate file type (basic validation)
 */
const validateFileType = (file: File): void => {
  // Allow common file types
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    // Archives
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Code
    'text/javascript',
    'application/json',
    'text/html',
    'text/css',
  ];

  if (!allowedTypes.includes(file.type) && file.type !== '') {
    console.warn(`File type ${file.type} may not be supported`);
  }
};

/**
 * Upload file to IPFS via Pinata
 */
export const uploadToIPFS = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<IPFSUploadResult> => {
  try {
    // Validate file
    validateFileSize(file);
    validateFileType(file);

    // Check if Pinata credentials are configured
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new IPFSError(
        'Pinata credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY',
        'MISSING_CREDENTIALS'
      );
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
        fileType: file.type,
      },
    });
    formData.append('pinataMetadata', metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };

    // Use JWT if available, otherwise use API key/secret
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const timestamp = response.data.Timestamp;

    return {
      ipfsHash,
      fileName: file.name,
      fileSize: file.size,
      timestamp,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      gatewayUrl: `${PINATA_GATEWAY}/ipfs/${ipfsHash}`,
    };
  } catch (error: any) {
    if (error instanceof IPFSError) {
      throw error;
    }

    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.details || error.response.data?.message || error.message;

      if (status === 401) {
        throw new IPFSError('Invalid Pinata credentials', 'INVALID_CREDENTIALS');
      }
      if (status === 403) {
        throw new IPFSError('Pinata access forbidden', 'ACCESS_FORBIDDEN');
      }
      if (status === 429) {
        throw new IPFSError('Rate limit exceeded. Please try again later', 'RATE_LIMIT');
      }

      throw new IPFSError(message, 'UPLOAD_FAILED');
    }

    // Network error
    if (error.request) {
      throw new IPFSError('Network error - could not reach Pinata', 'NETWORK_ERROR');
    }

    throw new IPFSError(error.message || 'Failed to upload file to IPFS', 'UNKNOWN_ERROR');
  }
};

/**
 * Upload multiple files to IPFS
 */
export const uploadMultipleToIPFS = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<IPFSUploadResult[]> => {
  const results: IPFSUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadToIPFS(file, (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });
    results.push(result);
  }

  return results;
};

/**
 * Get file from IPFS using hash
 */
export const getFromIPFS = async (ipfsHash: string): Promise<Blob> => {
  try {
    if (!ipfsHash) {
      throw new IPFSError('IPFS hash is required', 'MISSING_HASH');
    }

    // Try Pinata gateway first
    const gatewayUrl = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    
    const response = await axios.get(gatewayUrl, {
      responseType: 'blob',
      timeout: 30000, // 30 seconds
    });

    return response.data;
  } catch (error: any) {
    // Try fallback gateway
    try {
      const fallbackUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      const response = await axios.get(fallbackUrl, {
        responseType: 'blob',
        timeout: 30000,
      });
      return response.data;
    } catch (fallbackError) {
      throw new IPFSError(
        `Failed to retrieve file from IPFS: ${ipfsHash}`,
        'RETRIEVAL_FAILED'
      );
    }
  }
};

/**
 * Get file URL from IPFS hash
 */
export const getIPFSUrl = (ipfsHash: string, useGateway: 'pinata' | 'ipfs' = 'pinata'): string => {
  if (!ipfsHash) {
    throw new IPFSError('IPFS hash is required', 'MISSING_HASH');
  }

  if (useGateway === 'pinata') {
    return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
  }

  return `https://ipfs.io/ipfs/${ipfsHash}`;
};

/**
 * Download file from IPFS
 */
export const downloadFromIPFS = async (ipfsHash: string, fileName?: string): Promise<void> => {
  try {
    const blob = await getFromIPFS(ipfsHash);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || ipfsHash;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new IPFSError(
      error.message || 'Failed to download file from IPFS',
      'DOWNLOAD_FAILED'
    );
  }
};

/**
 * Check if file exists on IPFS
 */
export const checkIPFSFile = async (ipfsHash: string): Promise<boolean> => {
  try {
    const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    const response = await axios.head(url, { timeout: 10000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Get user-friendly error message
 */
export const getIPFSErrorMessage = (error: IPFSError): string => {
  switch (error.code) {
    case 'FILE_TOO_LARGE':
      return error.message;
    case 'MISSING_CREDENTIALS':
      return 'IPFS service not configured';
    case 'INVALID_CREDENTIALS':
      return 'Invalid IPFS credentials';
    case 'ACCESS_FORBIDDEN':
      return 'Access to IPFS service forbidden';
    case 'RATE_LIMIT':
      return 'Upload rate limit exceeded. Please try again later';
    case 'UPLOAD_FAILED':
      return 'Failed to upload file to IPFS';
    case 'NETWORK_ERROR':
      return 'Network error - could not reach IPFS service';
    case 'MISSING_HASH':
      return 'IPFS hash is required';
    case 'RETRIEVAL_FAILED':
      return 'Failed to retrieve file from IPFS';
    case 'DOWNLOAD_FAILED':
      return 'Failed to download file';
    default:
      return error.message || 'An unknown IPFS error occurred';
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
