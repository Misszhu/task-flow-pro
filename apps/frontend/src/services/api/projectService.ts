import { httpClient } from 'src/services/httpClient';
import { API_ENDPOINTS } from 'src/config/api';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  PaginatedResponse,
  ApiResponse,
} from 'src/types/api';

// 项目服务
export class ProjectService {
  // 获取用户有权限访问的项目列表（带分页和搜索）
  static async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Project>>> {
    return httpClient.get<PaginatedResponse<Project>>(API_ENDPOINTS.PROJECTS.LIST, { params });
  }

  // 获取单个项目
  static async getProject(id: string): Promise<ApiResponse<Project>> {
    return httpClient.get<Project>(API_ENDPOINTS.PROJECTS.GET(id));
  }

  // 创建项目
  static async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return httpClient.post<Project>(
      API_ENDPOINTS.PROJECTS.CREATE,
      projectData
    )
  }

  // 更新项目
  static async updateProject(id: string, projectData: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    return httpClient.put<Project>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      projectData
    )
  }

  // 删除项目
  static async deleteProject(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.PROJECTS.DELETE(id));
  }

  // 获取项目成员
  static async getProjectMembers(projectId: string): Promise<ApiResponse<ProjectMember[]>> {
    return httpClient.get<ProjectMember[]>(API_ENDPOINTS.PROJECTS.MEMBERS(projectId));
  }

  // 添加项目成员
  static async addProjectMember(
    projectId: string,
    memberData: AddMemberRequest
  ): Promise<ApiResponse<ProjectMember>> {
    return httpClient.post<ProjectMember>(
      API_ENDPOINTS.PROJECTS.ADD_MEMBER(projectId),
      memberData
    )
  }

  // 更新项目成员角色
  static async updateProjectMemberRole(projectId: string, userId: string, role: string): Promise<ApiResponse<ProjectMember>> {
    return httpClient.put<ProjectMember>(API_ENDPOINTS.PROJECTS.UPDATE_MEMBER(projectId, userId), { role });
  }

  // 更新项目成员角色
  static async updateProjectMember(
    projectId: string,
    userId: string,
    memberData: UpdateMemberRoleRequest
  ): Promise<ApiResponse<ProjectMember>> {
    return httpClient.put<ProjectMember>(
      API_ENDPOINTS.PROJECTS.UPDATE_MEMBER(projectId, userId),
      memberData
    );
  }

  // 移除项目成员
  static async removeProjectMember(
    projectId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(
      API_ENDPOINTS.PROJECTS.REMOVE_MEMBER(projectId, userId)
    );
  }
}