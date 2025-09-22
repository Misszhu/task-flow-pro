import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@task-flow-pro/shared-types';

export interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set<roomIds>

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`用户 ${socket.user?.userId} 已连接，Socket ID: ${socket.id}`);

      // 记录用户连接
      if (socket.user?.userId) {
        this.connectedUsers.set(socket.user.userId, socket.id);
      }

      // 加入用户房间
      this.joinUserRooms(socket);

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`用户 ${socket.user?.userId} 已断开连接`);
        if (socket.user?.userId) {
          this.connectedUsers.delete(socket.user.userId);
          this.userRooms.delete(socket.user.userId);
        }
      });

      // 处理加入房间
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`用户 ${socket.user?.userId} 加入房间: ${roomId}`);

        if (socket.user?.userId) {
          if (!this.userRooms.has(socket.user.userId)) {
            this.userRooms.set(socket.user.userId, new Set());
          }
          this.userRooms.get(socket.user.userId)!.add(roomId);
        }
      });

      // 处理离开房间
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`用户 ${socket.user?.userId} 离开房间: ${roomId}`);

        if (socket.user?.userId) {
          const rooms = this.userRooms.get(socket.user.userId);
          if (rooms) {
            rooms.delete(roomId);
          }
        }
      });

      // 处理自定义事件
      socket.on('custom-event', (data: any) => {
        console.log(`用户 ${socket.user?.userId} 发送自定义事件:`, data);
        // 可以在这里处理自定义事件
      });
    });
  }

  /**
   * 加入用户相关房间
   */
  private joinUserRooms(socket: AuthenticatedSocket): void {
    if (!socket.user?.userId) return;

    // 加入用户个人房间
    socket.join(`user:${socket.user.userId}`);

    // 可以在这里加入其他默认房间，比如项目房间等
  }

  /**
   * 发送事件给特定用户
   */
  public sendToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 发送事件给房间
   */
  public sendToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 广播事件给所有连接的用户
   */
  public broadcast(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 发送任务相关事件
   */
  public sendTaskEvent(event: string, taskId: string, data: any, excludeUserId?: string): void {
    const roomId = `task:${taskId}`;
    const eventData = {
      taskId,
      ...data,
      timestamp: new Date().toISOString()
    };

    if (excludeUserId) {
      // 发送给房间内除了指定用户外的所有用户
      this.io.to(roomId).except(`user:${excludeUserId}`).emit(event, eventData);
    } else {
      this.io.to(roomId).emit(event, eventData);
    }
  }

  /**
   * 发送项目相关事件
   */
  public sendProjectEvent(event: string, projectId: string, data: any, excludeUserId?: string): void {
    const roomId = `project:${projectId}`;
    const eventData = {
      projectId,
      ...data,
      timestamp: new Date().toISOString()
    };

    if (excludeUserId) {
      this.io.to(roomId).except(`user:${excludeUserId}`).emit(event, eventData);
    } else {
      this.io.to(roomId).emit(event, eventData);
    }
  }

  /**
   * 发送通知事件
   */
  public sendNotification(userId: string, notification: any): void {
    this.sendToUser(userId, 'notification', notification);
  }

  /**
   * 发送任务状态更新事件
   */
  public sendTaskStatusUpdate(taskId: string, task: any, userId: string): void {
    this.sendTaskEvent('task-status-updated', taskId, {
      task,
      updatedBy: userId
    }, userId);
  }

  /**
   * 发送任务分配事件
   */
  public sendTaskAssigned(taskId: string, task: any, assigneeId: string, assignedBy: string): void {
    // 发送给被分配者
    this.sendToUser(assigneeId, 'task-assigned', {
      taskId,
      task,
      assignedBy
    });

    // 发送给项目房间
    if (task.projectId) {
      this.sendProjectEvent('task-assigned', task.projectId, {
        taskId,
        task,
        assigneeId,
        assignedBy
      }, assignedBy);
    }
  }

  /**
   * 发送任务评论事件
   */
  public sendTaskComment(taskId: string, comment: any, userId: string): void {
    this.sendTaskEvent('task-commented', taskId, {
      comment,
      commentedBy: userId
    }, userId);
  }

  /**
   * 发送时间跟踪事件
   */
  public sendTimeTrackingEvent(taskId: string, timeEntry: any, userId: string, action: 'started' | 'stopped'): void {
    this.sendTaskEvent('time-tracking', taskId, {
      timeEntry,
      action,
      userId
    }, userId);
  }

  /**
   * 发送文件上传事件
   */
  public sendFileUploadEvent(taskId: string, attachment: any, userId: string): void {
    this.sendTaskEvent('file-uploaded', taskId, {
      attachment,
      uploadedBy: userId
    }, userId);
  }

  /**
   * 发送依赖关系事件
   */
  public sendDependencyEvent(taskId: string, dependency: any, userId: string, action: 'created' | 'deleted'): void {
    this.sendTaskEvent('dependency-updated', taskId, {
      dependency,
      action,
      updatedBy: userId
    }, userId);
  }

  /**
   * 获取连接统计
   */
  public getConnectionStats(): {
    totalConnections: number;
    connectedUsers: number;
    activeRooms: number;
  } {
    return {
      totalConnections: this.io.sockets.sockets.size,
      connectedUsers: this.connectedUsers.size,
      activeRooms: this.io.sockets.adapter.rooms.size
    };
  }

  /**
   * 获取在线用户列表
   */
  public getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * 检查用户是否在线
   */
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * 获取用户所在的房间
   */
  public getUserRooms(userId: string): string[] {
    const rooms = this.userRooms.get(userId);
    return rooms ? Array.from(rooms) : [];
  }

  /**
   * 强制断开用户连接
   */
  public disconnectUser(userId: string): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    }
  }

  /**
   * 获取 Socket.IO 实例
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
