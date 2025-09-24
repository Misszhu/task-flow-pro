import { httpClient } from "../httpClient";
import { API_ENDPOINTS } from "src/config/api";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "src/types/api";

// 认证类服务
export class AuthService {
  // 用户登录
  static async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await httpClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    // 保存 token 到本地存储
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // 设置 httpClient 的请求头
      httpClient.setAuthToken(response.data.token);
    }

    return response;
  }

  // 用户注册
  static async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await httpClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);


    // 保存token到本地存储
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // 设置HTTP客户端的认证头
      httpClient.setAuthToken(response.data.token);
    }

    return response;
  }

  // TODO Promise<ApiResponse<AuthResponse>>
  // 刷新 token
  static async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await httpClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });

    // 更新token
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // 更新HTTP客户端的认证头
      httpClient.setAuthToken(response.data.token);
    }

    return response;
  }

  // 登出
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);

      return response;
    } catch (error) { }
    finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // 清除HTTP客户端的认证头
      httpClient.clearAuthToken()
    }

    return { success: true, data: undefined };
  }

  // 获取用户信息
  static async getProfile(): Promise<ApiResponse<User>> {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  }

  // 检查是否认证
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // 获取当前token
  static getToken(): string | null {
    return localStorage.getItem('token');
  }
}