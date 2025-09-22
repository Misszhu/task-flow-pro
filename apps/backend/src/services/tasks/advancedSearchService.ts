import { PrismaClient } from '@prisma/client';
import {
  AdvancedSearchRequest,
  SearchHistory,
  SearchSuggestion,
  Task,
  PaginatedResponse
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class AdvancedSearchService {
  /**
   * 执行高级搜索
   */
  static async searchTasks(
    request: AdvancedSearchRequest,
    userId: string
  ): Promise<PaginatedResponse<Task>> {
    const {
      query,
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = request;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 文本搜索
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    // 基础筛选
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    // 日期筛选
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          id: { in: filters.tags }
        }
      };
    }

    // 附件筛选
    if (filters.hasAttachments !== undefined) {
      if (filters.hasAttachments) {
        where.attachments = { some: {} };
      } else {
        where.attachments = { none: {} };
      }
    }

    // 评论筛选
    if (filters.hasComments !== undefined) {
      if (filters.hasComments) {
        where.comments = { some: {} };
      } else {
        where.comments = { none: {} };
      }
    }

    // 子任务筛选
    if (filters.hasSubtasks !== undefined) {
      if (filters.hasSubtasks) {
        where.subtasks = { some: {} };
      } else {
        where.subtasks = { none: {} };
      }
    }

    // 逾期筛选
    if (filters.isOverdue) {
      where.OR = [
        ...(where.OR || []),
        {
          dueDate: {
            lt: new Date()
          },
          status: {
            not: 'COMPLETED'
          }
        }
      ];
    }

    // 构建排序
    const orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    } else if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder;
    } else if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    }

    // 获取总数
    const total = await prisma.task.count({ where });

    // 获取任务列表
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        project: true,
        tags: true,
        comments: {
          select: { id: true },
          take: 1
        },
        subtasks: {
          select: { id: true },
          take: 1
        },
        attachments: {
          select: { id: true },
          take: 1
        }
      }
    });

    // 保存搜索历史
    if (query || Object.keys(filters).length > 0) {
      await this.saveSearchHistory(userId, query || '', JSON.stringify(filters));
    }

    return {
      data: tasks as unknown as Task[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取搜索建议
   */
  static async getSearchSuggestions(
    query: string,
    userId: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    if (query.length < 2) {
      return suggestions;
    }

    // 任务建议
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, title: true, description: true },
      take: 5
    });

    tasks.forEach(task => {
      suggestions.push({
        type: 'task',
        id: task.id,
        title: task.title,
        description: task.description || undefined
      });
    });

    // 项目建议
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, description: true },
      take: 3
    });

    projects.forEach(project => {
      suggestions.push({
        type: 'project',
        id: project.id,
        title: project.name,
        description: project.description || undefined
      });
    });

    // 用户建议
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, email: true },
      take: 3
    });

    users.forEach(user => {
      suggestions.push({
        type: 'user',
        id: user.id,
        title: user.name || user.email,
        description: user.email
      });
    });

    // 标签建议
    const tags = await prisma.taskTag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: { id: true, name: true },
      take: 3
    });

    tags.forEach(tag => {
      suggestions.push({
        type: 'tag',
        id: tag.id,
        title: tag.name
      });
    });

    return suggestions.slice(0, limit);
  }

  /**
   * 获取搜索历史
   */
  static async getSearchHistory(
    userId: string,
    limit: number = 10
  ): Promise<SearchHistory[]> {
    const histories = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return histories as unknown as SearchHistory[];
  }

  /**
   * 保存搜索历史
   */
  static async saveSearchHistory(
    userId: string,
    query: string,
    filters: string
  ): Promise<void> {
    // 检查是否已存在相同的搜索
    const existing = await prisma.searchHistory.findFirst({
      where: {
        userId,
        query,
        filters
      }
    });

    if (!existing) {
      await prisma.searchHistory.create({
        data: {
          userId,
          query,
          filters
        }
      });
    }
  }

  /**
   * 清除搜索历史
   */
  static async clearSearchHistory(userId: string): Promise<void> {
    await prisma.searchHistory.deleteMany({
      where: { userId }
    });
  }

  /**
   * 获取热门搜索
   */
  static async getPopularSearches(limit: number = 10): Promise<{
    query: string;
    count: number;
  }[]> {
    const popularSearches = await prisma.searchHistory.groupBy({
      by: ['query'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    return popularSearches.map(item => ({
      query: item.query,
      count: item._count.id
    }));
  }

  /**
   * 获取搜索统计
   */
  static async getSearchStats(userId: string): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    mostSearched: string;
  }> {
    const [totalSearches, uniqueQueries, mostSearched] = await Promise.all([
      prisma.searchHistory.count({ where: { userId } }),
      prisma.searchHistory.groupBy({
        by: ['query'],
        where: { userId },
        _count: { id: true }
      }),
      prisma.searchHistory.groupBy({
        by: ['query'],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1
      })
    ]);

    return {
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      mostSearched: mostSearched[0]?.query || ''
    };
  }

  /**
   * 全局搜索（跨所有实体）
   */
  static async globalSearch(
    query: string,
    userId: string,
    limit: number = 20
  ): Promise<{
    tasks: Task[];
    projects: any[];
    users: any[];
    tags: any[];
  }> {
    const [tasks, projects, users, tags] = await Promise.all([
      this.searchTasks({ query, limit: Math.ceil(limit / 4) }, userId),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, name: true, description: true, createdAt: true },
        take: Math.ceil(limit / 4)
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, name: true, email: true, createdAt: true },
        take: Math.ceil(limit / 4)
      }),
      prisma.taskTag.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        select: { id: true, name: true, color: true, createdAt: true },
        take: Math.ceil(limit / 4)
      })
    ]);

    return {
      tasks: tasks.data,
      projects: projects as any[],
      users: users as any[],
      tags: tags as any[]
    };
  }
}
