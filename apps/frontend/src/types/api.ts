// API 响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp?: string;
  // TODO 后端增加 statusCode 字段
  statusCode?: number;
}

// API 错误响应
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  timestamp?: string;
  statusCode?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 请求配置类型
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 认证相关类型
// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// 认证响应
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  deadline: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
}

// 创建项目请求
export interface CreateProjectRequest {
  name: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

// 更新项目请求
export type UpdateProjectRequest = Partial<CreateProjectRequest>;

// 项目成员类型
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'VIEWER' | 'COLLABORATOR' | 'MANAGER';
  joinAt: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// 角色
export type Role = 'VIEWER' | 'COLLABORATOR' | 'MANAGER';

// 添加成员请求
export interface AddMemberRequest {
  userId: string;
  role: Role;
}

// 更新成员角色请求
export interface UpdateMemberRoleRequest {
  role: Role;
}

// 移除成员请求
export interface RemoveMemberRequest {
  userId: string;
}

// 任务状态
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// 任务优先级
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// 任务相关类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
}

// 创建任务请求
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  dueDate?: string;
}

// 更新任务请求
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

// 更新任务状态请求
export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

// 分配任务请求
export interface AssignTaskRequest {
  assigneeId: string;
}

// 更新任务优先级请求
export interface UpdateTaskPriorityRequest {
  priority: TaskPriority;
}

// 更新任务截止日期请求
export interface UpdateTaskDueDateRequest {
  dueDate: string;
}

// 删除任务请求
export interface DeleteTaskRequest {
  id: string;
}

// 搜索任务请求
export interface SearchTaskRequest {
  search: string;
}

// 按截止日期筛选任务请求
export interface FilterTaskByDueDateRequest {
  dueDateFrom: string;
  dueDateTo: string;
}

// 任务过滤器
export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  creatorId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// 用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
}

export interface DeleteUserRequest {
  id: string;
}

export type HealthCheckStatus = 'healthy' | 'unhealthy';

// 健康检查类型
export interface HealthCheck {
  status: HealthCheckStatus;
  timestamp: string;
  // 运行时间
  uptime: string;
  version: string;
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  timestamp: string;
  responseTime: number;
}