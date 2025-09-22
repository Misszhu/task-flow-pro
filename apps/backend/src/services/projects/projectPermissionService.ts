import { prisma } from '../../lib/prisma';
import { MemberRole } from '@prisma/client';
import { ProjectCacheService } from '../cache/cacheService';

export interface ProjectMembership {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectAccessResult {
  hasAccess: boolean;
  role?: 'OWNER' | MemberRole;
  membership?: ProjectMembership;
  project?: {
    id: string;
    name: string;
    ownerId: string;
  };
}

export class ProjectPermissionService {
  private static cacheService = new ProjectCacheService();

  /**
   * 检查用户是否有权限访问项目
   */
  static async checkProjectAccess(
    userId: string,
    projectId: string,
    requiredRole?: MemberRole
  ): Promise<ProjectAccessResult> {
    try {
      // 首先尝试从缓存获取成员关系
      let membership = this.cacheService.getProjectMembership(projectId, userId);

      if (!membership) {
        // 缓存未命中，从数据库查询
        membership = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId
            }
          }
        });

        // 将结果存入缓存
        this.cacheService.setProjectMembership(projectId, userId, membership);
      }

      if (membership) {
        // 检查角色权限
        if (requiredRole && !this.hasRequiredRole(membership.role, requiredRole)) {
          return {
            hasAccess: false,
            role: membership.role,
            membership
          };
        }

        return {
          hasAccess: true,
          role: membership.role,
          membership
        };
      }

      // 如果不是成员，检查是否是项目所有者
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          ownerId: true
        }
      });

      if (!project) {
        return { hasAccess: false };
      }

      if (project.ownerId === userId) {
        // 项目所有者拥有最高权限
        return {
          hasAccess: true,
          role: 'OWNER',
          project
        };
      }

      return { hasAccess: false };
    } catch (error) {
      console.error('Error checking project access:', error);
      return { hasAccess: false };
    }
  }

  /**
   * 检查用户是否可以管理项目成员
   */
  static async canManageMembers(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const access = await this.checkProjectAccess(userId, projectId);

    if (!access.hasAccess) {
      return false;
    }

    // 项目所有者或MANAGER角色可以管理成员
    return access.role === 'OWNER' || access.role === 'MANAGER';
  }

  /**
   * 检查用户是否可以编辑项目
   */
  static async canEditProject(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const access = await this.checkProjectAccess(userId, projectId);

    if (!access.hasAccess) {
      return false;
    }

    // 项目所有者、MANAGER或COLLABORATOR可以编辑项目
    return access.role === 'OWNER' ||
      access.role === 'MANAGER' ||
      access.role === 'COLLABORATOR';
  }

  /**
   * 检查用户是否可以删除项目
   */
  static async canDeleteProject(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const access = await this.checkProjectAccess(userId, projectId);

    // 只有项目所有者可以删除项目
    return access.hasAccess && access.role === 'OWNER';
  }

  /**
   * 获取用户有权限访问的项目列表
   */
  static async getUserAccessibleProjects(userId: string) {
    return await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
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
            tasks: true,
            members: true
          }
        }
      }
    });
  }

  /**
   * 检查角色权限层级
   */
  private static hasRequiredRole(userRole: MemberRole, requiredRole: MemberRole): boolean {
    const roleHierarchy: Record<MemberRole, number> = {
      VIEWER: 1,
      COLLABORATOR: 2,
      MANAGER: 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * 获取用户在项目中的角色
   */
  static async getUserProjectRole(userId: string, projectId: string): Promise<'OWNER' | MemberRole | null> {
    const access = await this.checkProjectAccess(userId, projectId);
    return access.role || null;
  }
}
