import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from './logger';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_APP_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request', { method: config.method, url: config.url });
        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', { status: response.status, url: response.config.url });
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      logger.error('API Error', error, {
        status: error.response.status,
        url: error.config?.url,
      });
    } else if (error.request) {
      logger.error('No response received', error, { url: error.config?.url });
    } else {
      logger.error('Request setup error', error);
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  private formatError(error: unknown): ApiResponse<never> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: String(error.response?.status),
      };
    }
    return {
      success: false,
      error: 'An unknown error occurred',
    };
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
