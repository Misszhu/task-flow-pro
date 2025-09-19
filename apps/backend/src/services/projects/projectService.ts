import { prisma } from '../../lib/prisma';

export interface CreateProjectData {
  name: string;
  ownerId: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  description?: string;
  deadline?: Date | null;
}

export class ProjectService {
  // 获取所有项目
  async getAllProjects() {
    return await prisma.project.findMany({
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
}
