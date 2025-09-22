import { ProjectMembership } from '../projects/projectPermissionService';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟默认过期时间

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      expiresAt
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 删除匹配模式的缓存
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount
    };
  }
}

// 项目权限缓存服务
export class ProjectCacheService {
  private cache = CacheService.getInstance();
  private readonly TTL = {
    MEMBERSHIP: 5 * 60 * 1000, // 5分钟
    PROJECT_LIST: 2 * 60 * 1000, // 2分钟
    PROJECT_DETAIL: 10 * 60 * 1000, // 10分钟
  };

  /**
   * 缓存项目成员关系
   */
  setProjectMembership(projectId: string, userId: string, membership: ProjectMembership | null): void {
    const key = `project:${projectId}:user:${userId}:membership`;
    this.cache.set(key, membership, this.TTL.MEMBERSHIP);
  }

  /**
   * 获取项目成员关系
   */
  getProjectMembership(projectId: string, userId: string): ProjectMembership | null {
    const key = `project:${projectId}:user:${userId}:membership`;
    return this.cache.get(key);
  }

  /**
   * 缓存用户项目列表
   */
  setUserProjects(userId: string, projects: any[], options: any): void {
    const key = `user:${userId}:projects:${JSON.stringify(options)}`;
    this.cache.set(key, projects, this.TTL.PROJECT_LIST);
  }

  /**
   * 获取用户项目列表
   */
  getUserProjects(userId: string, options: any): any[] | null {
    const key = `user:${userId}:projects:${JSON.stringify(options)}`;
    return this.cache.get(key);
  }

  /**
   * 缓存项目详情
   */
  setProjectDetail(projectId: string, project: any): void {
    const key = `project:${projectId}:detail`;
    this.cache.set(key, project, this.TTL.PROJECT_DETAIL);
  }

  /**
   * 获取项目详情
   */
  getProjectDetail(projectId: string): any | null {
    const key = `project:${projectId}:detail`;
    return this.cache.get(key);
  }

  /**
   * 清除项目相关缓存
   */
  clearProjectCache(projectId: string): void {
    // 清除项目详情缓存
    this.cache.delete(`project:${projectId}:detail`);

    // 清除项目成员关系缓存
    this.cache.deletePattern(`project:${projectId}:user:.*:membership`);

    // 清除用户项目列表缓存（因为项目信息可能已变更）
    this.cache.deletePattern(`user:.*:projects:.*`);
  }

  /**
   * 清除用户相关缓存
   */
  clearUserCache(userId: string): void {
    // 清除用户项目列表缓存
    this.cache.deletePattern(`user:${userId}:projects:.*`);

    // 清除用户成员关系缓存
    this.cache.deletePattern(`project:.*:user:${userId}:membership`);
  }

  /**
   * 清除所有项目缓存
   */
  clearAllProjectCache(): void {
    this.cache.deletePattern(`project:.*`);
    this.cache.deletePattern(`user:.*:projects:.*`);
  }
}
