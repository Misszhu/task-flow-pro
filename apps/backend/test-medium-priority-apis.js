/**
 * 中优先级 API 测试脚本
 * 测试任务依赖关系、任务模板和实时通信功能
 */

const axios = require('axios');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'http://localhost:3001';
let authToken = '';
let testUserId = '';
let testProjectId = '';
let testTaskId1 = '';
let testTaskId2 = '';
let testTemplateId = '';
let testDependencyId = '';
let socket = null;

// --- 辅助函数 ---
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    authToken = response.data.data.token;
    testUserId = response.data.data.user.id;
    console.log(`✅ 用户 ${email} 登录成功，获取到Token。`);
    return authToken;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return null;
  }
}

async function createTestProject() {
  try {
    const response = await axios.post(`${BASE_URL}/projects`, {
      name: `Test Project ${Date.now()}`,
      description: 'Project for medium priority API testing',
      visibility: 'PRIVATE'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testProjectId = response.data.data.id;
    console.log(`✅ 创建测试项目成功: ${testProjectId}`);
    return testProjectId;
  } catch (error) {
    console.error('❌ 创建测试项目失败:', error.response?.data || error.message);
    return null;
  }
}

async function createTestTasks() {
  try {
    // 创建第一个任务
    const response1 = await axios.post(`${BASE_URL}/tasks`, {
      title: `Test Task 1 ${Date.now()}`,
      description: 'First task for dependency testing',
      projectId: testProjectId,
      priority: 'MEDIUM'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testTaskId1 = response1.data.data.id;

    // 创建第二个任务
    const response2 = await axios.post(`${BASE_URL}/tasks`, {
      title: `Test Task 2 ${Date.now()}`,
      description: 'Second task for dependency testing',
      projectId: testProjectId,
      priority: 'HIGH'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testTaskId2 = response2.data.data.id;

    console.log(`✅ 创建测试任务成功: ${testTaskId1}, ${testTaskId2}`);
    return { testTaskId1, testTaskId2 };
  } catch (error) {
    console.error('❌ 创建测试任务失败:', error.response?.data || error.message);
    return null;
  }
}

// --- 任务依赖关系 API 测试 ---
async function testTaskDependencyApis() {
  console.log('\n--- 🔗 测试任务依赖关系 API ---');

  // 1. 创建依赖关系
  try {
    const response = await axios.post(`${BASE_URL}/task-dependencies`, {
      predecessorId: testTaskId1,
      successorId: testTaskId2
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testDependencyId = response.data.data.id;
    console.log('✅ 创建依赖关系成功:', testDependencyId);
  } catch (error) {
    console.error('❌ 创建依赖关系失败:', error.response?.data || error.message);
  }

  // 2. 获取任务的依赖关系
  try {
    const response = await axios.get(`${BASE_URL}/task-dependencies/tasks/${testTaskId2}?type=predecessors`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取任务依赖关系成功:', response.data.data.length, '个前置任务');
  } catch (error) {
    console.error('❌ 获取任务依赖关系失败:', error.response?.data || error.message);
  }

  // 3. 获取被阻塞的任务
  try {
    const response = await axios.get(`${BASE_URL}/task-dependencies/blocked`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取被阻塞的任务成功:', response.data.data.length, '个被阻塞的任务');
  } catch (error) {
    console.error('❌ 获取被阻塞的任务失败:', error.response?.data || error.message);
  }

  // 4. 获取关键路径
  try {
    const response = await axios.get(`${BASE_URL}/task-dependencies/critical-path?projectId=${testProjectId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取关键路径成功:', response.data.data.criticalPath);
  } catch (error) {
    console.error('❌ 获取关键路径失败:', error.response?.data || error.message);
  }

  // 5. 获取依赖关系统计
  try {
    const response = await axios.get(`${BASE_URL}/task-dependencies/stats?projectId=${testProjectId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取依赖关系统计成功:', response.data.data);
  } catch (error) {
    console.error('❌ 获取依赖关系统计失败:', error.response?.data || error.message);
  }

  // 6. 检查循环依赖
  try {
    const response = await axios.get(`${BASE_URL}/task-dependencies/circular`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 检查循环依赖成功:', response.data.data.circularDependencies);
  } catch (error) {
    console.error('❌ 检查循环依赖失败:', error.response?.data || error.message);
  }

  // 7. 删除依赖关系
  if (testDependencyId) {
    try {
      const response = await axios.delete(`${BASE_URL}/task-dependencies/${testDependencyId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ 删除依赖关系成功');
    } catch (error) {
      console.error('❌ 删除依赖关系失败:', error.response?.data || error.message);
    }
  }
}

// --- 任务模板 API 测试 ---
async function testTaskTemplateApis() {
  console.log('\n--- 📋 测试任务模板 API ---');

  // 1. 创建任务模板
  try {
    const response = await axios.post(`${BASE_URL}/task-templates`, {
      name: `Test Template ${Date.now()}`,
      description: 'A test template for API testing',
      title: 'Test Task Template',
      content: JSON.stringify({
        priority: 'MEDIUM',
        description: 'This is a template-generated task'
      }),
      isPublic: false
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testTemplateId = response.data.data.id;
    console.log('✅ 创建任务模板成功:', testTemplateId);
  } catch (error) {
    console.error('❌ 创建任务模板失败:', error.response?.data || error.message);
  }

  // 2. 获取任务模板列表
  try {
    const response = await axios.get(`${BASE_URL}/task-templates?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取任务模板列表成功:', response.data.data.data.length, '个模板');
  } catch (error) {
    console.error('❌ 获取任务模板列表失败:', error.response?.data || error.message);
  }

  // 3. 获取用户的模板
  try {
    const response = await axios.get(`${BASE_URL}/task-templates/my?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取用户模板成功:', response.data.data.data.length, '个模板');
  } catch (error) {
    console.error('❌ 获取用户模板失败:', error.response?.data || error.message);
  }

  // 4. 搜索模板
  try {
    const response = await axios.get(`${BASE_URL}/task-templates/search?q=test&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 搜索模板成功:', response.data.data.data.length, '个结果');
  } catch (error) {
    console.error('❌ 搜索模板失败:', error.response?.data || error.message);
  }

  // 5. 从模板创建任务
  if (testTemplateId) {
    try {
      const response = await axios.post(`${BASE_URL}/task-templates/create-task`, {
        templateId: testTemplateId,
        projectId: testProjectId,
        customizations: {
          title: 'Custom Task from Template',
          priority: 'HIGH'
        }
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ 从模板创建任务成功:', response.data.data.id);
    } catch (error) {
      console.error('❌ 从模板创建任务失败:', error.response?.data || error.message);
    }
  }

  // 6. 复制模板
  if (testTemplateId) {
    try {
      const response = await axios.post(`${BASE_URL}/task-templates/${testTemplateId}/copy`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ 复制模板成功:', response.data.data.id);
    } catch (error) {
      console.error('❌ 复制模板失败:', error.response?.data || error.message);
    }
  }

  // 7. 获取模板统计
  try {
    const response = await axios.get(`${BASE_URL}/task-templates/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取模板统计成功:', response.data.data);
  } catch (error) {
    console.error('❌ 获取模板统计失败:', error.response?.data || error.message);
  }

  // 8. 删除模板
  if (testTemplateId) {
    try {
      const response = await axios.delete(`${BASE_URL}/task-templates/${testTemplateId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ 删除模板成功');
    } catch (error) {
      console.error('❌ 删除模板失败:', error.response?.data || error.message);
    }
  }
}

// --- WebSocket 实时通信测试 ---
async function testWebSocketApis() {
  console.log('\n--- 🔌 测试 WebSocket 实时通信 API ---');

  // 1. 获取连接信息
  try {
    const response = await axios.get(`${BASE_URL}/websocket/connection-info`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取连接信息成功:', response.data.data);
  } catch (error) {
    console.error('❌ 获取连接信息失败:', error.response?.data || error.message);
  }

  // 2. 获取在线统计
  try {
    const response = await axios.get(`${BASE_URL}/websocket/online-stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取在线统计成功:', response.data.data);
  } catch (error) {
    console.error('❌ 获取在线统计失败:', error.response?.data || error.message);
  }

  // 3. 发送测试消息
  try {
    const response = await axios.post(`${BASE_URL}/websocket/test-message`, {
      message: 'Hello from API test!',
      targetRoom: `user:${testUserId}`
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 发送测试消息成功');
  } catch (error) {
    console.error('❌ 发送测试消息失败:', error.response?.data || error.message);
  }

  // 4. 发送通知给用户
  try {
    const response = await axios.post(`${BASE_URL}/websocket/send-notification`, {
      targetUserId: testUserId,
      type: 'TASK_CREATED',
      title: 'Test Notification',
      content: 'This is a test notification from API',
      taskId: testTaskId1
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 发送通知成功');
  } catch (error) {
    console.error('❌ 发送通知失败:', error.response?.data || error.message);
  }

  // 5. 发送项目通知
  try {
    const response = await axios.post(`${BASE_URL}/websocket/send-project-notification`, {
      projectId: testProjectId,
      type: 'PROJECT_UPDATED',
      title: 'Project Update',
      content: 'The project has been updated',
      taskId: testTaskId1
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 发送项目通知成功');
  } catch (error) {
    console.error('❌ 发送项目通知失败:', error.response?.data || error.message);
  }

  // 6. 发送任务更新通知
  try {
    const response = await axios.post(`${BASE_URL}/websocket/send-task-update`, {
      taskId: testTaskId1,
      projectId: testProjectId,
      updates: [
        {
          field: 'status',
          oldValue: 'PENDING',
          newValue: 'IN_PROGRESS'
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 发送任务更新通知成功');
  } catch (error) {
    console.error('❌ 发送任务更新通知失败:', error.response?.data || error.message);
  }

  // 7. 发送项目更新通知
  try {
    const response = await axios.post(`${BASE_URL}/websocket/send-project-update`, {
      projectId: testProjectId,
      updates: [
        {
          field: 'name',
          oldValue: 'Old Project Name',
          newValue: 'Updated Project Name'
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 发送项目更新通知成功');
  } catch (error) {
    console.error('❌ 发送项目更新通知失败:', error.response?.data || error.message);
  }

  // 8. 广播消息
  try {
    const response = await axios.post(`${BASE_URL}/websocket/broadcast`, {
      message: 'System maintenance scheduled',
      data: { maintenanceTime: '2024-01-01T00:00:00Z' }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 广播消息成功');
  } catch (error) {
    console.error('❌ 广播消息失败:', error.response?.data || error.message);
  }
}

// --- WebSocket 连接测试 ---
async function testWebSocketConnection() {
  console.log('\n--- 🔌 测试 WebSocket 连接 ---');

  return new Promise((resolve) => {
    try {
      socket = io(WS_URL, {
        auth: {
          token: authToken
        }
      });

      socket.on('connect', () => {
        console.log('✅ WebSocket 连接成功');

        // 加入用户房间
        socket.emit('join-project', testProjectId);
        console.log('✅ 加入项目房间成功');

        // 监听通知
        socket.on('notification', (data) => {
          console.log('📨 收到通知:', data);
        });

        socket.on('project-notification', (data) => {
          console.log('📨 收到项目通知:', data);
        });

        socket.on('task-update', (data) => {
          console.log('📨 收到任务更新:', data);
        });

        socket.on('project-update', (data) => {
          console.log('📨 收到项目更新:', data);
        });

        socket.on('system-message', (data) => {
          console.log('📨 收到系统消息:', data);
        });

        socket.on('broadcast', (data) => {
          console.log('📨 收到广播消息:', data);
        });

        // 等待一段时间后断开连接
        setTimeout(() => {
          socket.disconnect();
          console.log('✅ WebSocket 连接已断开');
          resolve();
        }, 5000);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket 连接失败:', error.message);
        resolve();
      });

    } catch (error) {
      console.error('❌ WebSocket 连接测试失败:', error.message);
      resolve();
    }
  });
}

// --- 清理函数 ---
async function cleanup() {
  console.log('\n--- 🧹 清理测试数据 ---');

  if (testTaskId1) {
    try {
      await axios.delete(`${BASE_URL}/tasks/${testTaskId1}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ 删除测试任务 ${testTaskId1} 成功`);
    } catch (error) {
      console.error(`❌ 删除测试任务 ${testTaskId1} 失败:`, error.response?.data || error.message);
    }
  }

  if (testTaskId2) {
    try {
      await axios.delete(`${BASE_URL}/tasks/${testTaskId2}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ 删除测试任务 ${testTaskId2} 成功`);
    } catch (error) {
      console.error(`❌ 删除测试任务 ${testTaskId2} 失败:`, error.response?.data || error.message);
    }
  }

  if (testProjectId) {
    try {
      await axios.delete(`${BASE_URL}/projects/${testProjectId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ 删除测试项目 ${testProjectId} 成功`);
    } catch (error) {
      console.error(`❌ 删除测试项目 ${testProjectId} 失败:`, error.response?.data || error.message);
    }
  }
}

// --- 运行所有测试 ---
async function runAllTests() {
  const email = 'test@example.com'; // 请确保此用户存在或注册一个
  const password = 'password123';

  const token = await loginUser(email, password);
  if (!token) {
    console.error('无法继续测试，请检查登录凭据。');
    return;
  }

  await createTestProject();
  const tasks = await createTestTasks();

  if (!testProjectId || !tasks) {
    console.error('无法创建必要的测试资源，终止测试。');
    return;
  }

  await testTaskDependencyApis();
  await testTaskTemplateApis();
  await testWebSocketApis();
  await testWebSocketConnection();

  await cleanup();
  console.log('\n--- 🎉 所有中优先级 API 测试完成 ---');
}

runAllTests();
