import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class HealthController {
  // 健康检查
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  }

  // 测试数据库连接
  async testDatabase(req: Request, res: Response): Promise<void> {
    try {
      await prisma.$connect();
      res.json({ message: '数据库连接成功' });
    } catch (error) {
      res.status(500).json({ error: '数据库连接失败', details: error });
    }
  }
}
