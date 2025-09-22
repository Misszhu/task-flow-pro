// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 任务相关类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId?: string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // 协作功能
  parentId?: string;
  // 关联数据
  assignee?: UserWithoutPassword;
  creator?: UserWithoutPassword;
  project?: Project;
  parent?: Task;
  subtasks?: Task[];
  comments?: TaskComment[];
  tags?: TaskTag[];
  activities?: TaskActivity[];
}

export interface TaskWithoutRelations {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId?: string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 统一响应结构
export interface StandardResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
  timestamp?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'USER';
  iat?: number;
  exp?: number;
}

// 任务相关请求类型
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId?: string;
  assigneeId?: string;
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: Date;
}

export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  creatorId?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface UpdateTaskStatusRequest {
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

// 任务评论相关类型
export interface TaskComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorId: string;
  author?: UserWithoutPassword;
}

export interface CreateTaskCommentRequest {
  content: string;
}

export interface UpdateTaskCommentRequest {
  content: string;
}

// 任务标签相关类型
export interface TaskTag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTaskTagRequest {
  name?: string;
  color?: string;
}

export interface AssignTaskTagRequest {
  tagIds: string[];
}

// 子任务相关类型
export interface CreateSubtaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: Date;
}

// 任务活动日志相关类型
export interface TaskActivity {
  id: string;
  action: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  taskId: string;
  userId: string;
  user?: UserWithoutPassword;
}

export interface TaskActivityFilters {
  taskId?: string;
  userId?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ==================== Phase 3 高级功能类型 ====================

// 任务依赖关系
export interface TaskDependency {
  id: string;
  createdAt: Date;
  predecessorId: string;
  successorId: string;
  predecessor?: Task;
  successor?: Task;
}

export interface CreateTaskDependencyRequest {
  predecessorId: string;
  successorId: string;
}

// 时间跟踪
export interface TimeEntry {
  id: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // 持续时间（分钟）
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
  user?: UserWithoutPassword;
}

export interface CreateTimeEntryRequest {
  description?: string;
  startTime: Date;
  endTime?: Date;
}

export interface UpdateTimeEntryRequest {
  description?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface TimeEntryFilters {
  taskId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// 文件附件
export interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  uploadedBy: string;
  uploader?: UserWithoutPassword;
}

export interface UploadAttachmentRequest {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

// 通知
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_COMMENTED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'DEPENDENCY_BLOCKED' | 'DEPENDENCY_UNBLOCKED' | 'SYSTEM';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  userId: string;
  taskId?: string;
  task?: Task;
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_COMMENTED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'DEPENDENCY_BLOCKED' | 'DEPENDENCY_UNBLOCKED' | 'SYSTEM';
  userId: string;
  taskId?: string;
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// 任务模板
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  title: string;
  content?: string; // JSON格式的模板内容
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creator?: UserWithoutPassword;
}

export interface CreateTaskTemplateRequest {
  name: string;
  description?: string;
  title: string;
  content?: string;
  isPublic?: boolean;
}

export interface UpdateTaskTemplateRequest {
  name?: string;
  description?: string;
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export interface TaskTemplateFilters {
  name?: string;
  isPublic?: boolean;
  createdBy?: string;
}

// 高级搜索
export interface AdvancedSearchRequest {
  query?: string;
  filters?: {
    projectId?: string;
    assigneeId?: string;
    creatorId?: string;
    status?: string[];
    priority?: string[];
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    hasAttachments?: boolean;
    hasComments?: boolean;
    hasSubtasks?: boolean;
    isOverdue?: boolean;
  };
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters?: string; // JSON格式的筛选条件
  createdAt: Date;
  userId: string;
}

export interface SearchSuggestion {
  type: 'task' | 'project' | 'user' | 'tag';
  id: string;
  title: string;
  description?: string;
}

// 项目相关请求类型
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}
