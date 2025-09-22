import { Request, Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { TaskTemplateService } from '../../services/taskTemplates/taskTemplateService';
import { RequestContext } from '../../types/api';

export class TaskTemplateController {
  /**
   * 创建任务模板
   */
  static async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { name, description, title, content, isPublic } = req.body;

      if (!name || !title) {
        ApiResponseUtil.badRequest(res, '缺少模板名称或标题参数', req.context);
        return;
      }

      const template = await TaskTemplateService.createTemplate({
        name,
        description,
        title,
        content,
        isPublic: isPublic || false,
        createdBy: userId
      });

      ApiResponseUtil.success(
        res,
        template,
        '创建任务模板成功',
        201,
        req.context
      );
    } catch (error) {
      console.error('创建任务模板失败:', error);
      ApiResponseUtil.serverError(
        res,
        '创建任务模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取任务模板列表
   */
  static async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const {
        page = 1,
        limit = 20,
        isPublic,
        createdBy,
        search
      } = req.query;

      const filters = {
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        createdBy: createdBy as string,
        search: search as string
      };

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100)
      };

      const result = await TaskTemplateService.getTemplates(filters, pagination);

      ApiResponseUtil.success(
        res,
        result,
        '获取任务模板列表成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取任务模板列表失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取任务模板列表失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取单个任务模板
   */
  static async getTemplateById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { templateId } = req.params;

      if (!templateId) {
        ApiResponseUtil.badRequest(res, '缺少模板ID参数', req.context);
        return;
      }

      const template = await TaskTemplateService.getTemplateById(templateId);

      ApiResponseUtil.success(
        res,
        template,
        '获取任务模板成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取任务模板失败:', error);
      if (error instanceof Error && error.message === '任务模板不存在') {
        ApiResponseUtil.notFound(res, '任务模板不存在', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '获取任务模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 更新任务模板
   */
  static async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { templateId } = req.params;

      if (!templateId) {
        ApiResponseUtil.badRequest(res, '缺少模板ID参数', req.context);
        return;
      }

      const { name, description, title, content, isPublic } = req.body;

      const updateData = {
        name,
        description,
        title,
        content,
        isPublic
      };

      const template = await TaskTemplateService.updateTemplate(
        templateId,
        updateData,
        userId
      );

      ApiResponseUtil.success(
        res,
        template,
        '更新任务模板成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('更新任务模板失败:', error);
      if (error instanceof Error && error.message === '任务模板不存在') {
        ApiResponseUtil.notFound(res, '任务模板不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权修改此任务模板') {
        ApiResponseUtil.forbidden(res, '无权修改此任务模板', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '更新任务模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 删除任务模板
   */
  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { templateId } = req.params;

      if (!templateId) {
        ApiResponseUtil.badRequest(res, '缺少模板ID参数', req.context);
        return;
      }

      await TaskTemplateService.deleteTemplate(templateId, userId);

      ApiResponseUtil.success(
        res,
        null,
        '删除任务模板成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('删除任务模板失败:', error);
      if (error instanceof Error && error.message === '任务模板不存在') {
        ApiResponseUtil.notFound(res, '任务模板不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权删除此任务模板') {
        ApiResponseUtil.forbidden(res, '无权删除此任务模板', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '删除任务模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 从模板创建任务
   */
  static async createTaskFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { templateId, projectId, assigneeId, customizations } = req.body;

      if (!templateId) {
        ApiResponseUtil.badRequest(res, '缺少模板ID参数', req.context);
        return;
      }

      const task = await TaskTemplateService.createTaskFromTemplate({
        templateId,
        projectId,
        assigneeId,
        customizations
      }, userId);

      ApiResponseUtil.success(
        res,
        task,
        '从模板创建任务成功',
        201,
        req.context
      );
    } catch (error) {
      console.error('从模板创建任务失败:', error);
      if (error instanceof Error && error.message === '任务模板不存在') {
        ApiResponseUtil.notFound(res, '任务模板不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权使用此任务模板') {
        ApiResponseUtil.forbidden(res, '无权使用此任务模板', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '从模板创建任务失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 复制任务模板
   */
  static async copyTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { templateId } = req.params;

      if (!templateId) {
        ApiResponseUtil.badRequest(res, '缺少模板ID参数', req.context);
        return;
      }

      const template = await TaskTemplateService.copyTemplate(templateId, userId);

      ApiResponseUtil.success(
        res,
        template,
        '复制任务模板成功',
        201,
        req.context
      );
    } catch (error) {
      console.error('复制任务模板失败:', error);
      if (error instanceof Error && error.message === '任务模板不存在') {
        ApiResponseUtil.notFound(res, '任务模板不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权复制此任务模板') {
        ApiResponseUtil.forbidden(res, '无权复制此任务模板', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '复制任务模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取用户的模板
   */
  static async getUserTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const {
        page = 1,
        limit = 20
      } = req.query;

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100)
      };

      const result = await TaskTemplateService.getUserTemplates(userId, pagination);

      ApiResponseUtil.success(
        res,
        result,
        '获取用户模板成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取用户模板失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取用户模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取公共模板
   */
  static async getPublicTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const {
        page = 1,
        limit = 20
      } = req.query;

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100)
      };

      const result = await TaskTemplateService.getPublicTemplates(pagination);

      ApiResponseUtil.success(
        res,
        result,
        '获取公共模板成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取公共模板失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取公共模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 搜索模板
   */
  static async searchTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const {
        q: searchTerm,
        page = 1,
        limit = 20,
        isPublic,
        createdBy
      } = req.query;

      if (!searchTerm) {
        ApiResponseUtil.badRequest(res, '缺少搜索关键词', req.context);
        return;
      }

      const filters = {
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        createdBy: createdBy as string
      };

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100)
      };

      const result = await TaskTemplateService.searchTemplates(
        searchTerm as string,
        filters,
        pagination
      );

      ApiResponseUtil.success(
        res,
        result,
        '搜索模板成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('搜索模板失败:', error);
      ApiResponseUtil.serverError(
        res,
        '搜索模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取模板统计
   */
  static async getTemplateStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { userId: filterUserId } = req.query;

      const stats = await TaskTemplateService.getTemplateStats(
        filterUserId as string
      );

      ApiResponseUtil.success(
        res,
        stats,
        '获取模板统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取模板统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取模板统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 批量创建模板
   */
  static async createBulkTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { templates } = req.body;

      if (!Array.isArray(templates) || templates.length === 0) {
        ApiResponseUtil.badRequest(res, '模板数组不能为空', req.context);
        return;
      }

      // 为每个模板添加创建者ID
      const templatesWithCreator = templates.map(template => ({
        ...template,
        createdBy: userId
      }));

      const results = await TaskTemplateService.createBulkTemplates(templatesWithCreator);

      ApiResponseUtil.success(
        res,
        {
          created: results.length,
          total: templates.length,
          templates: results
        },
        `成功创建 ${results.length}/${templates.length} 个模板`,
        201,
        req.context
      );
    } catch (error) {
      console.error('批量创建模板失败:', error);
      ApiResponseUtil.serverError(
        res,
        '批量创建模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 清理未使用的模板
   */
  static async cleanupUnusedTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { daysThreshold = 30 } = req.body;

      const deletedCount = await TaskTemplateService.cleanupUnusedTemplates(
        parseInt(daysThreshold)
      );

      ApiResponseUtil.success(
        res,
        { deletedCount },
        `清理了 ${deletedCount} 个未使用的模板`,
        200,
        req.context
      );
    } catch (error) {
      console.error('清理未使用模板失败:', error);
      ApiResponseUtil.serverError(
        res,
        '清理未使用模板失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }
}