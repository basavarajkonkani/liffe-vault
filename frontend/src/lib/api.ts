import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include credentials (cookies, authorization headers) in CORS requests
});

// Request interceptor to attach JWT token to headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (using the same key as authStore)
    const token = localStorage.getItem('lifevault_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || error.response.data?.message;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          toast({
            title: 'Authentication Error',
            description: errorMessage || 'Your session has expired. Please login again.',
            variant: 'destructive',
          });
          // Clear token and redirect to login (using the same keys as authStore)
          localStorage.removeItem('lifevault_token');
          localStorage.removeItem('lifevault_user');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden - permission denied
          toast({
            title: 'Permission Denied',
            description: errorMessage || 'You do not have permission to perform this action.',
            variant: 'destructive',
          });
          break;

        case 429:
          // Rate limit exceeded
          toast({
            title: 'Too Many Requests',
            description: errorMessage || 'Too many requests. Please try again later.',
            variant: 'destructive',
          });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast({
            title: 'Server Error',
            description: errorMessage || 'Server error. Please try again later.',
            variant: 'destructive',
          });
          break;

        default:
          // Other errors
          toast({
            title: 'Error',
            description: errorMessage || 'An error occurred. Please try again.',
            variant: 'destructive',
          });
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      toast({
        title: 'Request Timeout',
        description: 'The request took too long. Please try again.',
        variant: 'destructive',
      });
    } else if (error.message === 'Network Error') {
      // Network error
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive',
      });
    } else {
      // Generic error
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
