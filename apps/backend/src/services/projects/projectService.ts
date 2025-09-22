import { prisma } from '../../lib/prisma';
import { ProjectPermissionService } from './projectPermissionService';
import { ProjectCacheService } from '../cache/cacheService';
import { ProjectSearchOptions, PaginationResult } from '../../types/pagination';

export interface CreateProjectData {
  name: string;
  ownerId: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  description?: string;
  deadline?: Date | null;
}

export class ProjectService {
  private cacheService = new ProjectCacheService();

  // 获取用户有权限访问的项目列表（带分页和搜索）
  async getAllProjects(userId: string, options: Partial<ProjectSearchOptions> = {}): Promise<PaginationResult<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      visibility,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // 检查缓存
    const cacheKey = { userId, ...options };
    const cachedResult = this.cacheService.getUserProjects(userId, cacheKey);
    if (cachedResult) {
      return cachedResult as unknown as PaginationResult<any>;
    }

    // 构建查询条件
    const where: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    };

    // 添加搜索条件
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // 添加可见性过滤
    if (visibility) {
      where.visibility = visibility;
    }

    // 计算偏移量
    const skip = (page - 1) * limit;

    // 并行执行查询和计数
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const result: PaginationResult<any> = {
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    // 缓存结果
    this.cacheService.setUserProjects(userId, result.data, cacheKey);

    return result;
  }

  // 创建新项目
  async createProject(data: CreateProjectData) {
    return await prisma.project.create({
      data: {
        name: data.name,
        ownerId: data.ownerId,
        visibility: data.visibility || 'PRIVATE',
        description: data.description,
        deadline: data.deadline
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 根据ID获取项目
  async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  // 添加项目成员
  async addProjectMember(projectId: string, userId: string, role: 'VIEWER' | 'COLLABORATOR' | 'MANAGER') {
    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new Error('项目不存在');
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查是否已经是成员
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    if (existingMember) {
      throw new Error('用户已经是项目成员');
    }

    return await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 获取项目成员列表
  async getProjectMembers(projectId: string) {
    return await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 更新项目成员角色
  async updateProjectMemberRole(projectId: string, userId: string, role: 'VIEWER' | 'COLLABORATOR' | 'MANAGER') {
    return await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 移除项目成员
  async removeProjectMember(projectId: string, userId: string) {
    return await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });
  }

  // 检查用户是否可以管理项目成员
  async canManageMembers(userId: string, projectId: string): Promise<boolean> {
    return await ProjectPermissionService.canManageMembers(userId, projectId);
  }

  // 检查用户是否可以编辑项目
  async canEditProject(userId: string, projectId: string): Promise<boolean> {
    return await ProjectPermissionService.canEditProject(userId, projectId);
  }

  // 检查用户是否可以删除项目
  async canDeleteProject(userId: string, projectId: string): Promise<boolean> {
    return await ProjectPermissionService.canDeleteProject(userId, projectId);
  }
}
