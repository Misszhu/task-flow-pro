import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserWithoutPassword,
  JwtPayload,
  RefreshTokenRequest
} from '@task-flow-pro/shared-types';
import { config } from '../../config';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * 用户注册
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name } = data;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    });

    // 生成JWT token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: this.excludePassword(user),
      token,
      refreshToken
    };
  }

  /**
   * 用户登录
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 生成JWT token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: this.excludePassword(user),
      token,
      refreshToken
    };
  }

  /**
   * 刷新token
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<{ token: string }> {
    const { refreshToken } = data;

    try {
      // 验证refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      // 生成新的access token
      const token = this.generateToken(user);

      return { token };
    } catch (error) {
      throw new Error('无效的refresh token');
    }
  }

  /**
   * 验证JWT token
   */
  static async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('无效的token');
    }
  }

  /**
   * 根据ID获取用户信息
   */
  static async getUserById(userId: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    return user ? this.excludePassword(user) : null;
  }

  /**
   * 生成JWT token
   */
  private static generateToken(user: any): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * 生成refresh token
   */
  private static generateRefreshToken(user: any): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn
    });
  }

  /**
   * 移除密码字段
   */
  private static excludePassword(user: any): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
