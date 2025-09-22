import { Request, Response } from 'express';
import { ResponseUtil } from '../../utils/response';
import { CacheService } from '../../services/cache/cacheService';
import { ProjectCacheService } from '../../services/cache/cacheService';

export class CacheController {
  private cacheService = CacheService.getInstance();
  private projectCacheService = new ProjectCacheService();

  // 获取缓存统计信息
  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.cacheService.getStats();
      ResponseUtil.success(res, stats, '获取缓存统计信息成功');
    } catch (error) {
      console.error('获取缓存统计信息失败:', error);
      ResponseUtil.serverError(res, '获取缓存统计信息失败');
    }
  }

  // 清空所有缓存
  async clearAllCache(req: Request, res: Response): Promise<void> {
    try {
      this.cacheService.clear();
      ResponseUtil.success(res, null, '清空所有缓存成功');
    } catch (error) {
      console.error('清空所有缓存失败:', error);
      ResponseUtil.serverError(res, '清空所有缓存失败');
    }
  }

  // 清空项目相关缓存
  async clearProjectCache(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      if (projectId) {
        this.projectCacheService.clearProjectCache(projectId);
        ResponseUtil.success(res, null, `清空项目 ${projectId} 相关缓存成功`);
      } else {
        this.projectCacheService.clearAllProjectCache();
        ResponseUtil.success(res, null, '清空所有项目缓存成功');
      }
    } catch (error) {
      console.error('清空项目缓存失败:', error);
      ResponseUtil.serverError(res, '清空项目缓存失败');
    }
  }

  // 清空用户相关缓存
  async clearUserCache(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId) {
        ResponseUtil.badRequest(res, '缺少用户ID参数');
        return;
      }

      this.projectCacheService.clearUserCache(userId);
      ResponseUtil.success(res, null, `清空用户 ${userId} 相关缓存成功`);
    } catch (error) {
      console.error('清空用户缓存失败:', error);
      ResponseUtil.serverError(res, '清空用户缓存失败');
    }
  }

  // 预热缓存
  async warmupCache(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      // 预热用户项目列表缓存
      const { ProjectService } = await import('../../services/projects/projectService');
      const projectService = new ProjectService();

      // 预加载第一页数据
      await projectService.getAllProjects(req.user.userId, { page: 1, limit: 20 });

      ResponseUtil.success(res, null, '缓存预热成功');
    } catch (error) {
      console.error('缓存预热失败:', error);
      ResponseUtil.serverError(res, '缓存预热失败');
    }
  }
}
