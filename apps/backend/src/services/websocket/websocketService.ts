import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@task-flow-pro/shared-types';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: JwtPayload;
}

export interface SocketRooms {
  [userId: string]: string[];
}

export interface NotificationData {
  type: string;
  title: string;
  content: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  timestamp: Date;
}

export interface TaskUpdateData {
  taskId: string;
  projectId?: string;
  updates: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  updatedBy: string;
  timestamp: Date;
}

export interface ProjectUpdateData {
  projectId: string;
  updates: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  updatedBy: string;
  timestamp: Date;
}

export class WebSocketService {
  private io: SocketIOServer;
  private rooms: SocketRooms = {};

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
    // 认证中间件
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
        socket.userId = decoded.userId;
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
      console.log(`用户 ${socket.userId} 已连接`);

      // 加入用户房间
      this.joinUserRoom(socket);

      // 处理加入项目房间
      socket.on('join-project', (projectId: string) => {
        this.joinProjectRoom(socket, projectId);
      });

      // 处理离开项目房间
      socket.on('leave-project', (projectId: string) => {
        this.leaveProjectRoom(socket, projectId);
      });

      // 处理加入任务房间
      socket.on('join-task', (taskId: string) => {
        this.joinTaskRoom(socket, taskId);
      });

      // 处理离开任务房间
      socket.on('leave-task', (taskId: string) => {
        this.leaveTaskRoom(socket, taskId);
      });

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`用户 ${socket.userId} 已断开连接`);
        this.leaveAllRooms(socket);
      });

      // 处理错误
      socket.on('error', (error) => {
        console.error(`Socket 错误 (用户 ${socket.userId}):`, error);
      });
    });
  }

  /**
   * 加入用户房间
   */
  private joinUserRoom(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);

    if (!this.rooms[socket.userId]) {
      this.rooms[socket.userId] = [];
    }
    this.rooms[socket.userId].push(userRoom);

    console.log(`用户 ${socket.userId} 加入房间 ${userRoom}`);
  }

  /**
   * 加入项目房间
   */
  private joinProjectRoom(socket: AuthenticatedSocket, projectId: string): void {
    if (!socket.userId) return;

    const projectRoom = `project:${projectId}`;
    socket.join(projectRoom);

    if (!this.rooms[socket.userId]) {
      this.rooms[socket.userId] = [];
    }
    if (!this.rooms[socket.userId].includes(projectRoom)) {
      this.rooms[socket.userId].push(projectRoom);
    }

    console.log(`用户 ${socket.userId} 加入项目房间 ${projectRoom}`);
  }

  /**
   * 离开项目房间
   */
  private leaveProjectRoom(socket: AuthenticatedSocket, projectId: string): void {
    if (!socket.userId) return;

    const projectRoom = `project:${projectId}`;
    socket.leave(projectRoom);

    if (this.rooms[socket.userId]) {
      this.rooms[socket.userId] = this.rooms[socket.userId].filter(room => room !== projectRoom);
    }

    console.log(`用户 ${socket.userId} 离开项目房间 ${projectRoom}`);
  }

  /**
   * 加入任务房间
   */
  private joinTaskRoom(socket: AuthenticatedSocket, taskId: string): void {
    if (!socket.userId) return;

    const taskRoom = `task:${taskId}`;
    socket.join(taskRoom);

    if (!this.rooms[socket.userId]) {
      this.rooms[socket.userId] = [];
    }
    if (!this.rooms[socket.userId].includes(taskRoom)) {
      this.rooms[socket.userId].push(taskRoom);
    }

    console.log(`用户 ${socket.userId} 加入任务房间 ${taskRoom}`);
  }

  /**
   * 离开任务房间
   */
  private leaveTaskRoom(socket: AuthenticatedSocket, taskId: string): void {
    if (!socket.userId) return;

    const taskRoom = `task:${taskId}`;
    socket.leave(taskRoom);

    if (this.rooms[socket.userId]) {
      this.rooms[socket.userId] = this.rooms[socket.userId].filter(room => room !== taskRoom);
    }

    console.log(`用户 ${socket.userId} 离开任务房间 ${taskRoom}`);
  }

  /**
   * 离开所有房间
   */
  private leaveAllRooms(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    if (this.rooms[socket.userId]) {
      this.rooms[socket.userId].forEach(room => {
        socket.leave(room);
      });
      delete this.rooms[socket.userId];
    }
  }

  /**
   * 发送通知给用户
   */
  public sendNotificationToUser(userId: string, notification: NotificationData): void {
    const userRoom = `user:${userId}`;
    this.io.to(userRoom).emit('notification', notification);
    console.log(`发送通知给用户 ${userId}:`, notification.title);
  }

  /**
   * 发送通知给项目成员
   */
  public sendNotificationToProject(projectId: string, notification: NotificationData): void {
    const projectRoom = `project:${projectId}`;
    this.io.to(projectRoom).emit('project-notification', notification);
    console.log(`发送项目通知到 ${projectId}:`, notification.title);
  }

  /**
   * 发送任务更新通知
   */
  public sendTaskUpdate(taskId: string, update: TaskUpdateData): void {
    const taskRoom = `task:${taskId}`;
    this.io.to(taskRoom).emit('task-update', update);
    console.log(`发送任务更新到 ${taskId}:`, update.updates.map(u => u.field).join(', '));
  }

  /**
   * 发送项目更新通知
   */
  public sendProjectUpdate(projectId: string, update: ProjectUpdateData): void {
    const projectRoom = `project:${projectId}`;
    this.io.to(projectRoom).emit('project-update', update);
    console.log(`发送项目更新到 ${projectId}:`, update.updates.map(u => u.field).join(', '));
  }

  /**
   * 发送实时协作更新
   */
  public sendCollaborationUpdate(room: string, data: any): void {
    this.io.to(room).emit('collaboration-update', data);
    console.log(`发送协作更新到房间 ${room}`);
  }

  /**
   * 发送系统消息
   */
  public sendSystemMessage(message: string, targetRoom?: string): void {
    if (targetRoom) {
      this.io.to(targetRoom).emit('system-message', { message, timestamp: new Date() });
    } else {
      this.io.emit('system-message', { message, timestamp: new Date() });
    }
    console.log(`发送系统消息: ${message}`);
  }

  /**
   * 获取在线用户数量
   */
  public getOnlineUserCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * 获取房间信息
   */
  public getRoomInfo(): { rooms: SocketRooms; totalConnections: number } {
    return {
      rooms: this.rooms,
      totalConnections: this.io.sockets.sockets.size
    };
  }

  /**
   * 断开指定用户的连接
   */
  public disconnectUser(userId: string): void {
    const userRoom = `user:${userId}`;
    this.io.to(userRoom).emit('force-disconnect', { reason: 'Account deactivated' });

    // 找到并断开该用户的所有连接
    this.io.sockets.sockets.forEach((socket: AuthenticatedSocket) => {
      if (socket.userId === userId) {
        socket.disconnect(true);
      }
    });
  }

  /**
   * 广播消息给所有连接的用户
   */
  public broadcast(message: string, data?: any): void {
    this.io.emit('broadcast', { message, data, timestamp: new Date() });
    console.log(`广播消息: ${message}`);
  }

  /**
   * 获取 Socket.IO 实例
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
