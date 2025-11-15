import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Toast notification helper (lazy loaded to avoid circular dependencies)
let toastNotification: any = null;
const getToast = async () => {
  if (!toastNotification) {
    const { useNotification } = await import('@/hooks/useNotification');
    toastNotification = useNotification;
  }
  return toastNotification();
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Helper function to check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  // Retry on network errors
  if (!error.response) return true;
  
  // Retry on 5xx server errors
  const status = error.response.status;
  return status >= 500 && status < 600;
};

// Helper function to calculate retry delay with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create Axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config: any) => {
    // Add wallet signature to headers if available
    const walletAddress = localStorage.getItem('walletAddress');
    const walletSignature = localStorage.getItem('walletSignature');
    
    if (walletAddress && walletSignature) {
      config.headers['X-Wallet-Address'] = walletAddress;
      config.headers['X-Wallet-Signature'] = walletSignature;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error: any) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Get toast notification helper
    const toast = await getToast();
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const message = (error.response.data as any)?.message || error.message;

      // Handle 401 Unauthorized - redirect to auth
      if (statusCode === 401) {
        console.error('[API] Unauthorized - clearing auth data');
        toast.error('Authentication Required', 'Please connect your wallet to continue');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletSignature');
        
        // Delay redirect to allow toast to show
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }

      // Handle 403 Forbidden
      if (statusCode === 403) {
        console.error('[API] Forbidden - insufficient permissions');
        toast.error('Access Denied', 'You do not have permission to perform this action');
      }

      // Handle 404 Not Found
      if (statusCode === 404) {
        console.error('[API] Resource not found');
        toast.error('Not Found', 'The requested resource could not be found');
      }

      // Handle 429 Rate Limit
      if (statusCode === 429) {
        console.error('[API] Rate limit exceeded');
        toast.warning('Rate Limit Exceeded', 'Please wait a moment before trying again');
      }

      // Handle 500 Server Error
      if (statusCode >= 500) {
        console.error('[API] Server error');
        toast.error('Server Error', 'An error occurred on the server. Please try again later');
      }

      // Handle 400 Bad Request
      if (statusCode === 400) {
        console.error('[API] Bad request');
        toast.error('Invalid Request', message);
      }

      throw new APIError(message, statusCode, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('[API] No response received', error.request);
      toast.error('Network Error', 'Unable to connect to the server. Please check your connection');
      throw new APIError('Network error - no response from server');
    } else {
      // Error in request setup
      console.error('[API] Request setup error', error.message);
      toast.error('Request Error', error.message);
      throw new APIError(error.message);
    }
  }
);

// Retry wrapper for API requests
const withRetry = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retryCount = 0
): Promise<AxiosResponse<T>> => {
  try {
    return await requestFn();
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Check if we should retry
    if (retryCount < MAX_RETRIES && isRetryableError(axiosError)) {
      const delay = getRetryDelay(retryCount);
      
      if (import.meta.env.DEV) {
        console.log(`[API Retry] Attempt ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return withRetry(requestFn, retryCount + 1);
    }
    
    // No more retries or not retryable, throw the error
    throw error;
  }
};

// Generic HTTP methods
export const api = {
  /**
   * GET request with automatic retry
   */
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await withRetry(() => apiClient.get<T>(url, config));
    return response.data;
  },

  /**
   * POST request with automatic retry
   */
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await withRetry(() => apiClient.post<T>(url, data, config));
    return response.data;
  },

  /**
   * PUT request with automatic retry
   */
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await withRetry(() => apiClient.put<T>(url, data, config));
    return response.data;
  },

  /**
   * DELETE request with automatic retry
   */
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await withRetry(() => apiClient.delete<T>(url, config));
    return response.data;
  },

  /**
   * PATCH request with automatic retry
   */
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await withRetry(() => apiClient.patch<T>(url, data, config));
    return response.data;
  },
};

// Export the axios instance for advanced usage
export default apiClient;
