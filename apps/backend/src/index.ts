import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Task Flow Pro Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 测试数据库连接
app.get('/api/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: '数据库连接成功' });
  } catch (error) {
    res.status(500).json({ error: '数据库连接失败', details: error });
  }
});

// 项目相关API
// 获取所有项目
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
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
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: '获取项目列表失败', details: error });
  }
});

// 创建新项目
app.post('/api/projects', async (req, res) => {
  try {
    const { name, ownerId, visibility = 'PRIVATE', description, deadline } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        ownerId,
        visibility,
        description,
        deadline: deadline ? new Date(deadline) : null
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

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: '创建项目失败', details: error });
  }
});

// 获取单个项目
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
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

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '获取项目失败', details: error });
  }
});

// 项目成员相关API
// 添加项目成员
app.post('/api/projects/:projectId/members', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role = 'VIEWER' } = req.body;

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
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
      return res.status(400).json({ error: '用户已经是项目成员' });
    }

    const member = await prisma.projectMember.create({
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

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: '添加项目成员失败', details: error });
  }
});

// 获取项目成员列表
app.get('/api/projects/:projectId/members', async (req, res) => {
  try {
    const { projectId } = req.params;

    const members = await prisma.projectMember.findMany({
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

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: '获取项目成员失败', details: error });
  }
});

// 更新项目成员角色
app.put('/api/projects/:projectId/members/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const member = await prisma.projectMember.update({
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

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: '更新成员角色失败', details: error });
  }
});

// 移除项目成员
app.delete('/api/projects/:projectId/members/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    res.json({ message: '成员已移除' });
  } catch (error) {
    res.status(500).json({ error: '移除成员失败', details: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
