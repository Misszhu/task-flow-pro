import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from 'src/config/api';
import { ApiResponse, ApiError, RequestConfig } from 'src/types/api';

// 扩展AxiosRequestConfig类型
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

class HttpClient {
  private instance: AxiosInstance;
  private retryCount = 0;

  constructor() {
    this.instance = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    })

    this.setupInterceptors();
  }

  // 设置请求和响应拦截
  setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证 token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加时间戳
        config.metadata = {
          startTime: Date.now(),
        }

        console.log(`🚀 [HTTP Request] ${config.method?.toUpperCase()} ${config.url}`);

        return config
      },
      (error: AxiosError) => {
        console.error('❌ [HTTP Request Error]', error);
        return Promise.reject(error);
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.log(`✅ [HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);

        // 重置重试计数
        this.retryCount = 0;
        return response;
      },
      async (error: AxiosError) => {
        const duration = Date.now() - (error.config?.metadata?.startTime || 0);
        console.error(`❌ [HTTP Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status} (${duration}ms)`);

        // 处理认证错误
        if (error.response?.status === 401) {
          await this.handleAuthError()
          return Promise.reject(error);
        }
        // 处理重试逻辑
        if (this.shouldRetry(error) && error.config) {
          return this.retryRequest(error.config);
        }
        return Promise.reject(error);
      }
    )
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 处理认证错误
  private async handleAuthError(): Promise<void> {
    // 清除本地存储的 token
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // 可以在这里触发登出逻辑
    // 例如：dispatch(logout());
  }

  // 检查是否应该重试请求
  private shouldRetry(error: AxiosError): boolean {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    const isRetryableStatus = error.response?.status && retryableStatusCodes.includes(error.response.status);
    const isNetworkError = !error.response;
    const hasRetriesLeft = this.retryCount < API_CONFIG.RETRY.MAX_RETRIES;

    return (isRetryableStatus || isNetworkError) && hasRetriesLeft;
  }

  // 重试请求
  private async retryRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
    this.retryCount++;
    const delay = API_CONFIG.RETRY.RETRY_DELAY * Math.pow(2, this.retryCount - 1);

    console.log(`🔄 [HTTP Retry] Attempt ${this.retryCount}/${API_CONFIG.RETRY.MAX_RETRIES} after ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));

    return this.instance.request(config);
  }

  // 格式化错误信息
  private formatError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      success: false,
      error: error.message || '请求失败',
      statusCode: error.response?.status || 500,
    }

    if (error.response?.data) {
      const responseData = error.response.data as any;
      apiError.message = responseData.message || responseData.error;
    }

    return apiError;
  }

  // GET 请求
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, this.mergeConfig(config));

    return response.data;
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, this.mergeConfig(config));
    return response.data;
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, this.mergeConfig(config));
    return response.data;
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, this.mergeConfig(config));
    return response.data;
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, this.mergeConfig(config));
    return response.data;
  }

  // 合并配置
  private mergeConfig(config?: RequestConfig): AxiosRequestConfig {
    return {
      timeout: config?.timeout || API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.HEADERS,
        ...config?.headers,
      },
      params: config?.params,
    }
  }

  // 设置认证 token
  setAuthToken(token: string): void {
    this.instance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // 清除认证 token
  clearAuthToken(): void {
    delete this.instance.defaults.headers.Authorization;
  }

  // 获取 axios 实例（用于特殊需求）
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建单例实例
export const httpClient = new HttpClient();

// 导出类型
export type { RequestConfig };