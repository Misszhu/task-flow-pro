import { PrismaClient } from '@prisma/client';
import {
  CreateTaskDependencyRequest,
  TaskDependency,
  Task,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class TaskDependencyService {
  /**
   * 创建任务依赖关系
   */
  static async createDependency(data: CreateTaskDependencyRequest): Promise<TaskDependency> {
    // 检查是否存在循环依赖
    await this.checkCircularDependency(data.predecessorId, data.successorId);

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

    return dependency as unknown as TaskDependency;
  }

  /**
   * 获取任务的前置依赖
   */
  static async getPredecessors(
    taskId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskDependency>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const total = await prisma.taskDependency.count({
      where: { successorId: taskId }
    });

    const dependencies = await prisma.taskDependency.findMany({
      where: { successorId: taskId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    return {
      data: dependencies as unknown as TaskDependency[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取任务的后置依赖
   */
  static async getSuccessors(
    taskId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskDependency>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const total = await prisma.taskDependency.count({
      where: { predecessorId: taskId }
    });

    const dependencies = await prisma.taskDependency.findMany({
      where: { predecessorId: taskId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    return {
      data: dependencies as unknown as TaskDependency[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 删除依赖关系
   */
  static async deleteDependency(dependencyId: string): Promise<void> {
    await prisma.taskDependency.delete({
      where: { id: dependencyId }
    });
  }

  /**
   * 检查循环依赖
   */
  static async checkCircularDependency(predecessorId: string, successorId: string): Promise<void> {
    if (predecessorId === successorId) {
      throw new Error('任务不能依赖自己');
    }

    // 检查是否存在从successor到predecessor的路径
    const hasPath = await this.hasPath(successorId, predecessorId);
    if (hasPath) {
      throw new Error('创建此依赖关系会导致循环依赖');
    }
  }

  /**
   * 检查是否存在从startTask到endTask的路径
   */
  private static async hasPath(startTaskId: string, endTaskId: string): Promise<boolean> {
    const visited = new Set<string>();
    const queue = [startTaskId];

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!;

      if (currentTaskId === endTaskId) {
        return true;
      }

      if (visited.has(currentTaskId)) {
        continue;
      }

      visited.add(currentTaskId);

      // 获取当前任务的所有后继任务
      const successors = await prisma.taskDependency.findMany({
        where: { predecessorId: currentTaskId },
        select: { successorId: true }
      });

      for (const successor of successors) {
        if (!visited.has(successor.successorId)) {
          queue.push(successor.successorId);
        }
      }
    }

    return false;
  }

  /**
   * 获取被阻塞的任务（前置任务未完成）
   */
  static async getBlockedTasks(): Promise<Task[]> {
    const blockedTasks = await prisma.task.findMany({
      where: {
        status: {
          in: ['TODO', 'IN_PROGRESS']
        },
        predecessors: {
          some: {
            predecessor: {
              status: {
                not: 'COMPLETED'
              }
            }
          }
        }
      },
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
        predecessors: {
          include: {
            predecessor: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true
              }
            }
          }
        }
      }
    });

    return blockedTasks as unknown as Task[];
  }

  /**
   * 检查任务是否可以开始（所有前置任务都已完成）
   */
  static async canTaskStart(taskId: string): Promise<boolean> {
    const incompletePredecessors = await prisma.taskDependency.count({
      where: {
        successorId: taskId,
        predecessor: {
          status: {
            not: 'COMPLETED'
          }
        }
      }
    });

    return incompletePredecessors === 0;
  }

  /**
   * 获取依赖链（从根任务到叶子任务）
   */
  static async getDependencyChain(taskId: string): Promise<Task[]> {
    const visited = new Set<string>();
    const chain: Task[] = [];

    const buildChain = async (currentTaskId: string) => {
      if (visited.has(currentTaskId)) {
        return;
      }

      visited.add(currentTaskId);

      // 获取当前任务
      const task = await prisma.task.findUnique({
        where: { id: currentTaskId },
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
          project: true
        }
      });

      if (task) {
        chain.push(task as unknown as Task);
      }

      // 递归处理所有后继任务
      const successors = await prisma.taskDependency.findMany({
        where: { predecessorId: currentTaskId },
        select: { successorId: true }
      });

      for (const successor of successors) {
        await buildChain(successor.successorId);
      }
    };

    await buildChain(taskId);
    return chain;
  }
}
