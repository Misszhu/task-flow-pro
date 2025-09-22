import { Request, Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { TimeTrackingService } from '../../services/timeTracking/timeTrackingService';
import { RequestContext } from '../../types/api';

export class TimeTrackingController {
  /**
   * 创建时间记录
   */
  static async createTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId, description, startTime, endTime } = req.body;

      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      if (!startTime) {
        ApiResponseUtil.badRequest(res, '缺少开始时间参数', req.context);
        return;
      }

      const timeEntry = await TimeTrackingService.createTimeEntry({
        taskId,
        userId,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined
      });

      ApiResponseUtil.success(
        res,
        timeEntry,
        '创建时间记录成功',
        201,
        req.context
      );
    } catch (error) {
      console.error('创建时间记录失败:', error);
      if (error instanceof Error && error.message === '任务不存在') {
        ApiResponseUtil.notFound(res, '任务不存在', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '创建时间记录失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取时间记录列表
   */
  static async getTimeEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const {
        page = 1,
        limit = 20,
        taskId,
        userId: filterUserId,
        dateFrom,
        dateTo,
        isRunning
      } = req.query;

      const filters = {
        taskId: taskId as string,
        userId: filterUserId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        isRunning: isRunning === 'true' ? true : isRunning === 'false' ? false : undefined
      };

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100)
      };

      const result = await TimeTrackingService.getTimeEntries(filters, pagination);

      ApiResponseUtil.success(
        res,
        result,
        '获取时间记录列表成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取时间记录列表失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取时间记录列表失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取单个时间记录
   */
  static async getTimeEntryById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { timeEntryId } = req.params;
      if (!timeEntryId) {
        ApiResponseUtil.badRequest(res, '缺少时间记录ID参数', req.context);
        return;
      }

      const timeEntry = await TimeTrackingService.getTimeEntryById(timeEntryId);

      ApiResponseUtil.success(
        res,
        timeEntry,
        '获取时间记录成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取时间记录失败:', error);
      if (error instanceof Error && error.message === '时间记录不存在') {
        ApiResponseUtil.notFound(res, '时间记录不存在', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '获取时间记录失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 更新时间记录
   */
  static async updateTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { timeEntryId } = req.params;
      if (!timeEntryId) {
        ApiResponseUtil.badRequest(res, '缺少时间记录ID参数', req.context);
        return;
      }

      const { description, startTime, endTime } = req.body;

      const updateData: any = {};
      if (description !== undefined) updateData.description = description;
      if (startTime !== undefined) updateData.startTime = new Date(startTime);
      if (endTime !== undefined) updateData.endTime = new Date(endTime);

      const timeEntry = await TimeTrackingService.updateTimeEntry(
        timeEntryId,
        updateData,
        userId
      );

      ApiResponseUtil.success(
        res,
        timeEntry,
        '更新时间记录成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('更新时间记录失败:', error);
      if (error instanceof Error && error.message === '时间记录不存在') {
        ApiResponseUtil.notFound(res, '时间记录不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权修改此时间记录') {
        ApiResponseUtil.forbidden(res, '无权修改此时间记录', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '更新时间记录失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 删除时间记录
   */
  static async deleteTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { timeEntryId } = req.params;
      if (!timeEntryId) {
        ApiResponseUtil.badRequest(res, '缺少时间记录ID参数', req.context);
        return;
      }

      await TimeTrackingService.deleteTimeEntry(timeEntryId, userId);

      ApiResponseUtil.success(
        res,
        null,
        '删除时间记录成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('删除时间记录失败:', error);
      if (error instanceof Error && error.message === '时间记录不存在') {
        ApiResponseUtil.notFound(res, '时间记录不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权删除此时间记录') {
        ApiResponseUtil.forbidden(res, '无权删除此时间记录', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '删除时间记录失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 开始时间跟踪
   */
  static async startTimeTracking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId, description } = req.body;

      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      const timeEntry = await TimeTrackingService.startTimeTracking(
        taskId,
        userId,
        description
      );

      ApiResponseUtil.success(
        res,
        timeEntry,
        '开始时间跟踪成功',
        201,
        req.context
      );
    } catch (error) {
      console.error('开始时间跟踪失败:', error);
      if (error instanceof Error && error.message === '任务不存在') {
        ApiResponseUtil.notFound(res, '任务不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '已有运行中的时间记录，请先停止当前记录') {
        ApiResponseUtil.badRequest(res, '已有运行中的时间记录，请先停止当前记录', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '开始时间跟踪失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 停止时间跟踪
   */
  static async stopTimeTracking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { timeEntryId } = req.params;
      if (!timeEntryId) {
        ApiResponseUtil.badRequest(res, '缺少时间记录ID参数', req.context);
        return;
      }

      const timeEntry = await TimeTrackingService.stopTimeTracking(timeEntryId, userId);

      ApiResponseUtil.success(
        res,
        timeEntry,
        '停止时间跟踪成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('停止时间跟踪失败:', error);
      if (error instanceof Error && error.message === '时间记录不存在') {
        ApiResponseUtil.notFound(res, '时间记录不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权操作此时间记录') {
        ApiResponseUtil.forbidden(res, '无权操作此时间记录', req.context);
        return;
      }
      if (error instanceof Error && error.message === '时间记录已经停止') {
        ApiResponseUtil.badRequest(res, '时间记录已经停止', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '停止时间跟踪失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取当前运行中的时间记录
   */
  static async getRunningTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const runningEntry = await TimeTrackingService.getRunningTimeEntry(userId);

      ApiResponseUtil.success(
        res,
        runningEntry,
        '获取运行中的时间记录成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取运行中的时间记录失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取运行中的时间记录失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取时间跟踪统计
   */
  static async getTimeTrackingStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId, dateFrom, dateTo } = req.query;

      const stats = await TimeTrackingService.getTimeTrackingStats(
        userId,
        taskId as string,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );

      ApiResponseUtil.success(
        res,
        stats,
        '获取时间跟踪统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取时间跟踪统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取时间跟踪统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取任务时间统计
   */
  static async getTaskTimeStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.params;
      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      const stats = await TimeTrackingService.getTaskTimeStats(taskId);

      ApiResponseUtil.success(
        res,
        stats,
        '获取任务时间统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取任务时间统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取任务时间统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }
}
