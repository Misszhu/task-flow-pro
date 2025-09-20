import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/authService';
import { ResponseUtil } from '../../utils/response';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest
} from '@task-flow-pro/shared-types';

export class AuthController {
  /**
   * 用户注册
   * @route POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name }: RegisterRequest = req.body;

      // 验证必填字段
      if (!email || !password || !name) {
        ResponseUtil.error(res, '邮箱、密码和姓名都是必填字段', 400);
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        ResponseUtil.error(res, '邮箱格式不正确', 400);
        return;
      }

      // 验证密码长度
      if (password.length < 6) {
        ResponseUtil.error(res, '密码长度至少6位', 400);
        return;
      }

      const result = await AuthService.register({ email, password, name });

      ResponseUtil.created(res, result, '注册成功');
    } catch (error) {
      ResponseUtil.error(res, error instanceof Error ? error.message : '注册失败', 400);
    }
  }

  /**
   * 用户登录
   * @route POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // 验证必填字段
      if (!email || !password) {
        ResponseUtil.error(res, '邮箱和密码都是必填字段', 400);
        return;
      }

      const result = await AuthService.login({ email, password });

      ResponseUtil.success(res, result, '登录成功');
    } catch (error) {
      ResponseUtil.unauthorized(res, error instanceof Error ? error.message : '登录失败');
    }
  }

  /**
   * 刷新token
   * @route POST /api/auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        ResponseUtil.error(res, 'refresh token是必填字段', 400);
        return;
      }

      const result = await AuthService.refreshToken({ refreshToken });

      ResponseUtil.success(res, result, 'Token刷新成功');
    } catch (error) {
      ResponseUtil.unauthorized(res, error instanceof Error ? error.message : 'Token刷新失败');
    }
  }

  /**
   * 获取当前用户信息
   * @route GET /api/auth/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const user = await AuthService.getUserById(req.user.userId);

      if (!user) {
        ResponseUtil.notFound(res, '用户不存在');
        return;
      }

      ResponseUtil.success(res, user, '获取用户信息成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取用户信息失败');
    }
  }

  /**
   * 用户登出
   * @route POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // 由于JWT是无状态的，登出主要是客户端删除token
    // 这里可以添加token黑名单逻辑（可选）
    ResponseUtil.success(res, null, '登出成功');
  }
}
