/**
 * 项目安全性测试脚本
 * 测试项目权限验证和成员管理权限控制
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let projectId = '';
let userId1 = '';
let userId2 = '';

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

// 创建测试项目
async function createTestProject(token) {
  try {
    const response = await axios.post(`${BASE_URL}/projects`, {
      name: '安全测试项目',
      description: '用于测试项目权限的项目',
      visibility: 'PRIVATE'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.id;
  } catch (error) {
    console.error('创建项目失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试获取项目列表（应该只返回用户有权限的项目）
async function testGetAllProjects(token, expectedCount) {
  try {
    const response = await axios.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ 获取项目列表成功，返回 ${response.data.data.length} 个项目`);
    if (response.data.data.length === expectedCount) {
      console.log('✅ 项目列表权限过滤正常');
    } else {
      console.log('❌ 项目列表权限过滤异常');
    }
    return response.data.data;
  } catch (error) {
    console.error('❌ 获取项目列表失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试访问无权限的项目
async function testAccessUnauthorizedProject(token, projectId) {
  try {
    const response = await axios.get(`${BASE_URL}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ 应该无法访问无权限的项目');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ 正确阻止了无权限访问');
    } else {
      console.log('❌ 错误处理异常:', error.response?.data || error.message);
    }
  }
}

// 测试成员管理权限
async function testMemberManagement(token, projectId, targetUserId) {
  try {
    // 尝试添加成员
    const response = await axios.post(`${BASE_URL}/projects/${projectId}/members`, {
      userId: targetUserId,
      role: 'VIEWER'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 添加成员成功');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ 正确阻止了无权限的成员管理操作');
    } else {
      console.log('❌ 成员管理权限验证异常:', error.response?.data || error.message);
    }
  }
}

// 主测试函数
async function runSecurityTests() {
  console.log('🔒 开始项目安全性测试...\n');

  // 1. 用户1登录并创建项目
  console.log('1. 用户1登录并创建项目');
  const token1 = await loginUser('user1@example.com', 'password123');
  if (!token1) {
    console.log('❌ 用户1登录失败，请确保测试用户存在');
    return;
  }
  authToken = token1;

  projectId = await createTestProject(token1);
  if (!projectId) {
    console.log('❌ 创建测试项目失败');
    return;
  }
  console.log(`✅ 创建项目成功，项目ID: ${projectId}\n`);

  // 2. 测试项目列表权限过滤
  console.log('2. 测试项目列表权限过滤');
  const projects1 = await testGetAllProjects(token1, 1);
  console.log('');

  // 3. 用户2登录并尝试访问项目
  console.log('3. 用户2尝试访问无权限的项目');
  const token2 = await loginUser('user2@example.com', 'password123');
  if (token2) {
    await testAccessUnauthorizedProject(token2, projectId);
    console.log('');

    // 4. 测试成员管理权限
    console.log('4. 测试成员管理权限');
    await testMemberManagement(token2, projectId, 'some-user-id');
    console.log('');

    // 5. 用户2获取项目列表（应该为空）
    console.log('5. 用户2获取项目列表');
    await testGetAllProjects(token2, 0);
  } else {
    console.log('⚠️ 用户2登录失败，跳过相关测试');
  }

  console.log('\n🔒 项目安全性测试完成');
}

// 运行测试
runSecurityTests().catch(console.error);
