import { httpClient } from 'src/services/httpClient';
import { API_ENDPOINTS } from 'src/config/api';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  PaginatedResponse,
  ApiResponse,
  TaskStatus,
  TaskPriority,
} from 'src/types/api';

// 任务服务类
export class TaskService {
  // 获取所有任务
  static async getTasks(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return httpClient.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.LIST, { params });
  }

  // 获取项目任务
  static async getProjectTasks(
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      assigneeId?: string;
      search?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return httpClient.get<PaginatedResponse<Task>>(
      API_ENDPOINTS.TASKS.BY_PROJECT(projectId),
      { params }
    );
  }

  // 获取单个任务
  static async getTask(id: string): Promise<ApiResponse<Task>> {
    return httpClient.get<Task>(API_ENDPOINTS.TASKS.GET(id));
  }

  // 创建任务
  static async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return httpClient.post<Task>(API_ENDPOINTS.TASKS.CREATE, taskData);
  }

  // 更新任务
  static async updateTask(id: string, taskData: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return httpClient.put<Task>(
      API_ENDPOINTS.TASKS.UPDATE(id),
      taskData
    );
  }

  // 删除任务
  static async deleteTask(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.TASKS.DELETE(id));
  }

  // 更新任务状态
  static async updateTaskStatus(
    id: string,
    status: TaskStatus
  ): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { status });
  }

  // 分配任务
  static async assignTask(
    id: string,
    assigneeId: string
  ): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { assigneeId });
  }

  // 取消分配任务
  static async unassignTask(id: string): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { assigneeId: undefined });
  }
}