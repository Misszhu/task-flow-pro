// API服务统一导出
export { AuthService } from './authService';
export { ProjectService } from './projectService';
export { TaskService } from './taskService';
export { HealthService } from './healthService';

// 重新导出HTTP客户端
export { httpClient } from '../httpClient';

// 重新导出配置和类型
export { API_CONFIG, API_ENDPOINTS } from 'src/config/api';
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  User,
  UpdateUserRequest,
  HealthCheck,
  DatabaseHealth,
  PaginatedResponse,
} from 'src/types/api';