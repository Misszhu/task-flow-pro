import { httpClient } from 'src/services/httpClient';
import { API_ENDPOINTS } from 'src/config/api';
import {
  HealthCheck,
  DatabaseHealth,
  ApiResponse,
} from 'src/types/api';

// 健康检查服务类
export class HealthService {
  // 检查API健康状态
  static async checkHealth(): Promise<ApiResponse<HealthCheck>> {
    return httpClient.get<HealthCheck>(API_ENDPOINTS.HEALTH.CHECK);
  }

  // 检查数据库连接
  static async checkDatabase(): Promise<ApiResponse<DatabaseHealth>> {
    return httpClient.get<DatabaseHealth>(API_ENDPOINTS.HEALTH.DB_TEST);
  }

  // 综合健康检查
  static async fullHealthCheck(): Promise<{
    api: ApiResponse<HealthCheck>;
    database: ApiResponse<DatabaseHealth>;
  }> {
    const [apiHealth, dbHealth] = await Promise.all([
      this.checkHealth(),
      this.checkDatabase(),
    ]);

    return {
      api: apiHealth,
      database: dbHealth,
    };
  }
}