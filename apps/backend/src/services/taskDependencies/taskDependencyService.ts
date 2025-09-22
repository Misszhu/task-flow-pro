import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateDependencyData {
  predecessorId: string;
  successorId: string;
}

export interface DependencyFilters {
  taskId?: string;
  type?: 'predecessors' | 'successors';
}

export interface DependencyInfo {
  id: string;
  predecessorId: string;
  successorId: string;
  createdAt: Date;
  predecessor: {
    id: string;
    title: string;
    status: string;
    priority: string;
  };
  successor: {
    id: string;
    title: string;
    status: string;
    priority: string;
  };
}

export interface DependencyStats {
  totalDependencies: number;
  blockedTasks: number;
  criticalPath: string[];
  circularDependencies: string[];
}

export class TaskDependencyService {
  /**
   * 创建任务依赖关系
   */
  static async createDependency(data: CreateDependencyData): Promise<DependencyInfo> {
    // 验证任务是否存在
    const [predecessor, successor] = await Promise.all([
      prisma.task.findUnique({
        where: { id: data.predecessorId },
        select: { id: true, title: true, status: true, priority: true }
      }),
      prisma.task.findUnique({
        where: { id: data.successorId },
        select: { id: true, title: true, status: true, priority: true }
      })
    ]);

    if (!predecessor) {
      throw new Error('前置任务不存在');
    }

    if (!successor) {
      throw new Error('后置任务不存在');
    }

    // 检查是否已存在相同的依赖关系
    const existingDependency = await prisma.taskDependency.findUnique({
      where: {
        predecessorId_successorId: {
          predecessorId: data.predecessorId,
          successorId: data.successorId
        }
      }
    });

    if (existingDependency) {
      throw new Error('依赖关系已存在');
    }

    // 检查是否会创建循环依赖
    await this.checkCircularDependency(data.predecessorId, data.successorId);

    // 创建依赖关系
    const dependency = await prisma.taskDependency.create({
      data: {
        predecessorId: data.predecessorId,
        successorId: data.successorId
      },
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    return dependency as unknown as DependencyInfo;
  }

  /**
   * 获取任务的依赖关系
   */
  static async getTaskDependencies(
    taskId: string,
    type: 'predecessors' | 'successors' = 'predecessors'
  ): Promise<DependencyInfo[]> {
    const where = type === 'predecessors'
      ? { successorId: taskId }
      : { predecessorId: taskId };

    const dependencies = await prisma.taskDependency.findMany({
      where,
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return dependencies as unknown as DependencyInfo[];
  }

  /**
   * 获取所有依赖关系
   */
  static async getAllDependencies(filters: DependencyFilters = {}): Promise<DependencyInfo[]> {
    const where: any = {};

    if (filters.taskId) {
      where.OR = [
        { predecessorId: filters.taskId },
        { successorId: filters.taskId }
      ];
    }

    const dependencies = await prisma.taskDependency.findMany({
      where,
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return dependencies as unknown as DependencyInfo[];
  }

  /**
   * 删除依赖关系
   */
  static async deleteDependency(dependencyId: string): Promise<void> {
    const dependency = await prisma.taskDependency.findUnique({
      where: { id: dependencyId }
    });

    if (!dependency) {
      throw new Error('依赖关系不存在');
    }

    await prisma.taskDependency.delete({
      where: { id: dependencyId }
    });
  }

  /**
   * 检查循环依赖
   */
  static async checkCircularDependency(
    predecessorId: string,
    successorId: string
  ): Promise<void> {
    // 使用深度优先搜索检查循环依赖
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = await this.dfsCheckCycle(successorId, predecessorId, visited, recursionStack);

    if (hasCycle) {
      throw new Error('创建此依赖关系会导致循环依赖');
    }
  }

  /**
   * 深度优先搜索检查循环依赖
   */
  private static async dfsCheckCycle(
    currentTaskId: string,
    targetTaskId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): Promise<boolean> {
    if (recursionStack.has(currentTaskId)) {
      return true; // 发现循环
    }

    if (visited.has(currentTaskId)) {
      return false; // 已经访问过，无循环
    }

    visited.add(currentTaskId);
    recursionStack.add(currentTaskId);

    // 获取当前任务的所有前置任务
    const dependencies = await prisma.taskDependency.findMany({
      where: { successorId: currentTaskId },
      select: { predecessorId: true }
    });

    for (const dep of dependencies) {
      if (dep.predecessorId === targetTaskId) {
        return true; // 发现循环
      }

      const hasCycle = await this.dfsCheckCycle(
        dep.predecessorId,
        targetTaskId,
        visited,
        recursionStack
      );

      if (hasCycle) {
        return true;
      }
    }

    recursionStack.delete(currentTaskId);
    return false;
  }

  /**
   * 获取被阻塞的任务
   */
  static async getBlockedTasks(taskId?: string): Promise<any[]> {
    const where: any = {};

    if (taskId) {
      where.successorId = taskId;
    }

    const blockedDependencies = await prisma.taskDependency.findMany({
      where,
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            completedAt: true
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    // 过滤出被阻塞的任务（前置任务未完成）
    const blockedTasks = blockedDependencies
      .filter(dep => dep.predecessor.status !== 'COMPLETED')
      .map(dep => ({
        blockedTask: dep.successor,
        blockingTask: dep.predecessor,
        dependencyId: dep.id
      }));

    return blockedTasks;
  }

  /**
   * 获取关键路径
   */
  static async getCriticalPath(projectId?: string): Promise<string[]> {
    // 获取所有任务
    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        predecessors: {
          select: { predecessorId: true }
        }
      }
    });

    // 构建任务图
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const graph = new Map<string, string[]>();

    // 初始化图
    tasks.forEach(task => {
      graph.set(task.id, []);
    });

    // 添加边
    for (const task of tasks) {
      for (const dep of task.predecessors) {
        const predecessors = graph.get(dep.predecessorId) || [];
        predecessors.push(task.id);
        graph.set(dep.predecessorId, predecessors);
      }
    }

    // 使用拓扑排序找到最长路径
    const criticalPath = this.findLongestPath(graph, taskMap);
    return criticalPath;
  }

  /**
   * 找到最长路径（关键路径）
   */
  private static findLongestPath(
    graph: Map<string, string[]>,
    taskMap: Map<string, any>
  ): string[] {
    const visited = new Set<string>();
    const longestPath: string[] = [];
    let maxLength = 0;

    const dfs = (taskId: string, currentPath: string[]): void => {
      if (visited.has(taskId)) {
        return;
      }

      visited.add(taskId);
      currentPath.push(taskId);

      const neighbors = graph.get(taskId) || [];
      if (neighbors.length === 0) {
        // 叶子节点
        if (currentPath.length > maxLength) {
          maxLength = currentPath.length;
          longestPath.length = 0;
          longestPath.push(...currentPath);
        }
      } else {
        for (const neighbor of neighbors) {
          dfs(neighbor, [...currentPath]);
        }
      }

      visited.delete(taskId);
    };

    // 从所有入度为0的节点开始
    const inDegree = new Map<string, number>();
    for (const [taskId, neighbors] of graph) {
      inDegree.set(taskId, 0);
    }

    for (const neighbors of graph.values()) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
      }
    }

    const startNodes = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([taskId, _]) => taskId);

    for (const startNode of startNodes) {
      dfs(startNode, []);
    }

    return longestPath;
  }

  /**
   * 获取依赖关系统计
   */
  static async getDependencyStats(projectId?: string): Promise<DependencyStats> {
    const where: any = {};
    if (projectId) {
      where.OR = [
        { predecessor: { projectId } },
        { successor: { projectId } }
      ];
    }

    const [totalDependencies, blockedTasks, criticalPath, circularDependencies] = await Promise.all([
      prisma.taskDependency.count({ where }),
      this.getBlockedTasks(),
      this.getCriticalPath(projectId),
      this.findCircularDependencies()
    ]);

    return {
      totalDependencies,
      blockedTasks: blockedTasks.length,
      criticalPath,
      circularDependencies
    };
  }

  /**
   * 查找循环依赖
   */
  static async findCircularDependencies(): Promise<string[]> {
    const allDependencies = await prisma.taskDependency.findMany({
      select: {
        id: true,
        predecessorId: true,
        successorId: true
      }
    });

    const graph = new Map<string, string[]>();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularDeps: string[] = [];

    // 构建图
    for (const dep of allDependencies) {
      const predecessors = graph.get(dep.successorId) || [];
      predecessors.push(dep.predecessorId);
      graph.set(dep.successorId, predecessors);
    }

    // 检查每个节点是否有循环
    for (const taskId of graph.keys()) {
      if (!visited.has(taskId)) {
        this.dfsFindCycle(taskId, graph, visited, recursionStack, circularDeps);
      }
    }

    return circularDeps;
  }

  /**
   * 深度优先搜索查找循环
   */
  private static dfsFindCycle(
    taskId: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    circularDeps: string[]
  ): void {
    if (recursionStack.has(taskId)) {
      circularDeps.push(taskId);
      return;
    }

    if (visited.has(taskId)) {
      return;
    }

    visited.add(taskId);
    recursionStack.add(taskId);

    const predecessors = graph.get(taskId) || [];
    for (const predecessor of predecessors) {
      this.dfsFindCycle(predecessor, graph, visited, recursionStack, circularDeps);
    }

    recursionStack.delete(taskId);
  }

  /**
   * 批量创建依赖关系
   */
  static async createBulkDependencies(dependencies: CreateDependencyData[]): Promise<DependencyInfo[]> {
    const results: DependencyInfo[] = [];

    for (const dep of dependencies) {
      try {
        const result = await this.createDependency(dep);
        results.push(result);
      } catch (error) {
        console.error(`创建依赖关系失败: ${dep.predecessorId} -> ${dep.successorId}`, error);
        // 继续处理其他依赖关系
      }
    }

    return results;
  }

  /**
   * 清理无效的依赖关系
   */
  static async cleanupInvalidDependencies(): Promise<number> {
    // 查找指向不存在任务的依赖关系
    const invalidDeps = await prisma.taskDependency.findMany({
      where: {
        OR: [
          { predecessor: { is: null } },
          { successor: { is: null } }
        ]
      }
    });

    const deleteCount = invalidDeps.length;

    if (deleteCount > 0) {
      await prisma.taskDependency.deleteMany({
        where: {
          id: {
            in: invalidDeps.map(dep => dep.id)
          }
        }
      });
    }

    return deleteCount;
  }
}