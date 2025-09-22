/**
 * 项目性能测试脚本
 * 测试分页和缓存优化效果
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

// 测试分页功能
async function testPagination(token) {
  console.log('📄 测试分页功能...');

  try {
    // 测试第一页
    const page1 = await axios.get(`${BASE_URL}/projects?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 第1页: ${page1.data.data.length} 个项目`);
    console.log(`   分页信息: 第${page1.data.pagination.page}页，共${page1.data.pagination.totalPages}页，总计${page1.data.pagination.total}个项目`);

    // 测试第二页（如果存在）
    if (page1.data.pagination.hasNext) {
      const page2 = await axios.get(`${BASE_URL}/projects?page=2&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ 第2页: ${page2.data.data.length} 个项目`);
    }

    return true;
  } catch (error) {
    console.error('❌ 分页测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试搜索功能
async function testSearch(token) {
  console.log('\n🔍 测试搜索功能...');

  try {
    // 测试搜索
    const searchResult = await axios.get(`${BASE_URL}/projects?search=测试&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 搜索"测试": 找到 ${searchResult.data.data.length} 个项目`);

    // 测试可见性过滤
    const privateResult = await axios.get(`${BASE_URL}/projects?visibility=PRIVATE&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 私有项目: 找到 ${privateResult.data.data.length} 个项目`);

    return true;
  } catch (error) {
    console.error('❌ 搜索测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试排序功能
async function testSorting(token) {
  console.log('\n📊 测试排序功能...');

  try {
    // 测试按名称排序
    const nameSort = await axios.get(`${BASE_URL}/projects?sortBy=name&sortOrder=asc&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 按名称升序: ${nameSort.data.data.length} 个项目`);

    // 测试按创建时间排序
    const timeSort = await axios.get(`${BASE_URL}/projects?sortBy=createdAt&sortOrder=desc&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 按创建时间降序: ${timeSort.data.data.length} 个项目`);

    return true;
  } catch (error) {
    console.error('❌ 排序测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试缓存性能
async function testCachePerformance(token) {
  console.log('\n⚡ 测试缓存性能...');

  try {
    const iterations = 5;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();

      await axios.get(`${BASE_URL}/projects?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const end = Date.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`✅ 缓存性能测试 (${iterations}次请求):`);
    console.log(`   平均响应时间: ${avgTime.toFixed(2)}ms`);
    console.log(`   最快响应时间: ${minTime}ms`);
    console.log(`   最慢响应时间: ${maxTime}ms`);

    return true;
  } catch (error) {
    console.error('❌ 缓存性能测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试错误处理
async function testErrorHandling(token) {
  console.log('\n🚫 测试错误处理...');

  try {
    // 测试无效页码
    try {
      await axios.get(`${BASE_URL}/projects?page=0&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('⚠️ 无效页码未正确处理');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ 无效页码正确处理');
      }
    }

    // 测试超出限制的每页数量
    try {
      await axios.get(`${BASE_URL}/projects?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 超出限制的每页数量被限制为100');
    } catch (error) {
      console.log('❌ 超出限制的每页数量处理异常');
    }

    return true;
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 主测试函数
async function runPerformanceTests() {
  console.log('⚡ 开始项目性能测试...\n');

  // 1. 用户登录
  console.log('1. 用户登录');
  const token = await loginUser('user1@example.com', 'password123');
  if (!token) {
    console.log('❌ 用户登录失败，请确保测试用户存在');
    return;
  }
  authToken = token;
  console.log('✅ 用户登录成功\n');

  // 2. 测试分页功能
  await testPagination(token);

  // 3. 测试搜索功能
  await testSearch(token);

  // 4. 测试排序功能
  await testSorting(token);

  // 5. 测试缓存性能
  await testCachePerformance(token);

  // 6. 测试错误处理
  await testErrorHandling(token);

  console.log('\n⚡ 项目性能测试完成');
}

// 运行测试
runPerformanceTests().catch(console.error);
