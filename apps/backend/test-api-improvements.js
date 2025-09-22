/**
 * API改进测试脚本
 * 测试统一响应格式、版本控制、错误处理和限流功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// 测试用户登录
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.data.token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试统一响应格式
async function testUnifiedResponseFormat(token) {
  console.log('📋 测试统一响应格式...');

  try {
    const response = await axios.get(`${BASE_URL}/v1/projects?page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'API-Version': 'v1'
      }
    });

    const data = response.data;

    // 检查响应格式
    const requiredFields = ['success', 'data', 'message', 'timestamp', 'version'];
    const hasAllFields = requiredFields.every(field => field in data);

    if (hasAllFields) {
      console.log('✅ 统一响应格式正确');
      console.log(`   版本: ${data.version}`);
      console.log(`   时间戳: ${data.timestamp}`);
      console.log(`   请求ID: ${data.meta?.requestId || 'N/A'}`);
      console.log(`   处理时间: ${data.meta?.processingTime || 'N/A'}ms`);
    } else {
      console.log('❌ 响应格式不正确');
    }

    return hasAllFields;
  } catch (error) {
    console.error('❌ 统一响应格式测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试API版本控制
async function testApiVersioning(token) {
  console.log('\n🔄 测试API版本控制...');

  try {
    // 测试v1版本
    const v1Response = await axios.get(`${BASE_URL}/v1/projects?page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'API-Version': 'v1'
      }
    });

    console.log(`✅ v1版本响应: ${v1Response.data.version}`);

    // 测试不支持的版本
    try {
      await axios.get(`${BASE_URL}/v3/projects?page=1&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'API-Version': 'v3'
        }
      });
      console.log('❌ 应该拒绝不支持的版本');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.code === 'UNSUPPORTED_VERSION') {
        console.log('✅ 正确拒绝不支持的版本');
      } else {
        console.log('❌ 版本控制错误处理异常');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ API版本控制测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试错误处理
async function testErrorHandling(token) {
  console.log('\n🚫 测试错误处理...');

  try {
    // 测试404错误
    try {
      await axios.get(`${BASE_URL}/v1/projects/nonexistent-id`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ 应该返回404错误');
    } catch (error) {
      if (error.response?.status === 404 && error.response?.data?.error?.code === 'NOT_FOUND') {
        console.log('✅ 404错误处理正确');
      } else {
        console.log('❌ 404错误处理异常');
      }
    }

    // 测试未认证错误
    try {
      await axios.get(`${BASE_URL}/v1/projects?page=1&limit=5`);
      console.log('❌ 应该返回401错误');
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.error?.code === 'UNAUTHORIZED') {
        console.log('✅ 401错误处理正确');
      } else {
        console.log('❌ 401错误处理异常');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试请求限流
async function testRateLimiting(token) {
  console.log('\n⏱️ 测试请求限流...');

  try {
    const requests = [];
    const maxRequests = 10; // 测试限流

    // 发送多个并发请求
    for (let i = 0; i < maxRequests; i++) {
      requests.push(
        axios.get(`${BASE_URL}/v1/projects?page=1&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => error.response)
      );
    }

    const responses = await Promise.all(requests);

    // 检查限流响应头
    const successfulRequests = responses.filter(r => r && r.status === 200);
    const rateLimitedRequests = responses.filter(r => r && r.status === 429);

    console.log(`✅ 成功请求: ${successfulRequests.length}`);
    console.log(`✅ 限流请求: ${rateLimitedRequests.length}`);

    // 检查限流响应头
    if (successfulRequests.length > 0) {
      const headers = successfulRequests[0].headers;
      console.log(`   限流信息: ${headers['x-ratelimit-limit']}/${headers['x-ratelimit-remaining']}`);
    }

    return true;
  } catch (error) {
    console.error('❌ 请求限流测试失败:', error.message);
    return false;
  }
}

// 测试分页功能
async function testPagination(token) {
  console.log('\n📄 测试分页功能...');

  try {
    const response = await axios.get(`${BASE_URL}/v1/projects?page=1&limit=3`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;

    if (data.pagination) {
      console.log('✅ 分页信息正确');
      console.log(`   当前页: ${data.pagination.page}`);
      console.log(`   每页数量: ${data.pagination.limit}`);
      console.log(`   总数量: ${data.pagination.total}`);
      console.log(`   总页数: ${data.pagination.totalPages}`);
      console.log(`   有下一页: ${data.pagination.hasNext}`);
      console.log(`   有上一页: ${data.pagination.hasPrev}`);
    } else {
      console.log('❌ 分页信息缺失');
    }

    return !!data.pagination;
  } catch (error) {
    console.error('❌ 分页功能测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试搜索功能
async function testSearchFunctionality(token) {
  console.log('\n🔍 测试搜索功能...');

  try {
    // 测试搜索
    const searchResponse = await axios.get(`${BASE_URL}/v1/projects?search=测试&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 搜索功能正常: 找到 ${searchResponse.data.data.length} 个项目`);

    // 测试排序
    const sortResponse = await axios.get(`${BASE_URL}/v1/projects?sortBy=name&sortOrder=asc&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 排序功能正常: ${sortResponse.data.data.length} 个项目`);

    return true;
  } catch (error) {
    console.error('❌ 搜索功能测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试缓存功能
async function testCacheFunctionality(token) {
  console.log('\n💾 测试缓存功能...');

  try {
    const iterations = 3;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();

      const response = await axios.get(`${BASE_URL}/v1/projects?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const end = Date.now();
      times.push(end - start);

      // 检查缓存信息
      if (response.data.meta?.cacheHit !== undefined) {
        console.log(`   第${i + 1}次请求: ${end - start}ms (缓存命中: ${response.data.meta.cacheHit})`);
      } else {
        console.log(`   第${i + 1}次请求: ${end - start}ms`);
      }
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`✅ 平均响应时间: ${avgTime.toFixed(2)}ms`);

    return true;
  } catch (error) {
    console.error('❌ 缓存功能测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 主测试函数
async function runApiImprovementTests() {
  console.log('🚀 开始API改进测试...\n');

  // 1. 用户登录
  console.log('1. 用户登录');
  const token = await loginUser('user1@example.com', 'password123');
  if (!token) {
    console.log('❌ 用户登录失败，请确保测试用户存在');
    return;
  }
  authToken = token;
  console.log('✅ 用户登录成功\n');

  // 2. 测试统一响应格式
  await testUnifiedResponseFormat(token);

  // 3. 测试API版本控制
  await testApiVersioning(token);

  // 4. 测试错误处理
  await testErrorHandling(token);

  // 5. 测试请求限流
  await testRateLimiting(token);

  // 6. 测试分页功能
  await testPagination(token);

  // 7. 测试搜索功能
  await testSearchFunctionality(token);

  // 8. 测试缓存功能
  await testCacheFunctionality(token);

  console.log('\n🚀 API改进测试完成');
}

// 运行测试
runApiImprovementTests().catch(console.error);
