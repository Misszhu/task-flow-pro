/**
 * 新 API 功能测试脚本
 * 测试通知系统、文件上传和时间跟踪 API
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let testTaskId = '';
let testProjectId = '';

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
      name: 'API测试项目',
      description: '用于测试新API功能',
      visibility: 'PRIVATE'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.id;
  } catch (error) {
    console.error('创建测试项目失败:', error.response?.data || error.message);
    return null;
  }
}

// 创建测试任务
async function createTestTask(token, projectId) {
  try {
    const response = await axios.post(`${BASE_URL}/tasks`, {
      title: 'API测试任务',
      description: '用于测试新API功能的任务',
      projectId: projectId,
      priority: 'MEDIUM'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.id;
  } catch (error) {
    console.error('创建测试任务失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试通知系统 API
async function testNotificationAPIs(token) {
  console.log('\n🔔 测试通知系统 API...');

  try {
    // 1. 获取通知列表
    console.log('1. 获取通知列表...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取通知列表成功:', notificationsResponse.data.data.data.length, '条通知');

    // 2. 获取未读通知数量
    console.log('2. 获取未读通知数量...');
    const unreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 未读通知数量:', unreadResponse.data.data.unreadCount);

    // 3. 获取通知统计
    console.log('3. 获取通知统计...');
    const statsResponse = await axios.get(`${BASE_URL}/notifications/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 通知统计:', statsResponse.data.data);

    return true;
  } catch (error) {
    console.error('❌ 通知系统 API 测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试文件上传 API
async function testFileUploadAPIs(token, taskId) {
  console.log('\n📎 测试文件上传 API...');

  try {
    // 创建测试文件
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, '这是一个测试文件内容\n用于测试文件上传功能');

    // 1. 单文件上传
    console.log('1. 单文件上传...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));

    const uploadResponse = await axios.post(`${BASE_URL}/files/tasks/${taskId}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ 单文件上传成功:', uploadResponse.data.data.originalName);

    // 2. 获取任务附件列表
    console.log('2. 获取任务附件列表...');
    const attachmentsResponse = await axios.get(`${BASE_URL}/files/tasks/${taskId}/attachments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 附件列表:', attachmentsResponse.data.data.length, '个附件');

    // 3. 获取附件详情
    const attachmentId = uploadResponse.data.data.id;
    console.log('3. 获取附件详情...');
    const detailResponse = await axios.get(`${BASE_URL}/files/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 附件详情:', detailResponse.data.data.originalName);

    // 4. 获取附件统计
    console.log('4. 获取附件统计...');
    const statsResponse = await axios.get(`${BASE_URL}/files/stats?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 附件统计:', statsResponse.data.data);

    // 5. 下载附件
    console.log('5. 下载附件...');
    const downloadResponse = await axios.get(`${BASE_URL}/files/attachments/${attachmentId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });
    console.log('✅ 下载附件成功，文件大小:', downloadResponse.data.length, '字节');

    // 6. 删除附件
    console.log('6. 删除附件...');
    const deleteResponse = await axios.delete(`${BASE_URL}/files/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 删除附件成功');

    // 清理测试文件
    fs.unlinkSync(testFilePath);

    return true;
  } catch (error) {
    console.error('❌ 文件上传 API 测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试时间跟踪 API
async function testTimeTrackingAPIs(token, taskId) {
  console.log('\n⏱️ 测试时间跟踪 API...');

  try {
    // 1. 开始时间跟踪
    console.log('1. 开始时间跟踪...');
    const startResponse = await axios.post(`${BASE_URL}/time-tracking/start`, {
      taskId: taskId,
      description: '测试时间跟踪'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 开始时间跟踪成功:', startResponse.data.data.id);

    const timeEntryId = startResponse.data.data.id;

    // 等待几秒钟
    console.log('等待 3 秒钟...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 2. 停止时间跟踪
    console.log('2. 停止时间跟踪...');
    const stopResponse = await axios.patch(`${BASE_URL}/time-tracking/${timeEntryId}/stop`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 停止时间跟踪成功，持续时间:', stopResponse.data.data.duration, '分钟');

    // 3. 获取时间记录列表
    console.log('3. 获取时间记录列表...');
    const entriesResponse = await axios.get(`${BASE_URL}/time-tracking?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 时间记录列表:', entriesResponse.data.data.data.length, '条记录');

    // 4. 获取时间跟踪统计
    console.log('4. 获取时间跟踪统计...');
    const statsResponse = await axios.get(`${BASE_URL}/time-tracking/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 时间跟踪统计:', statsResponse.data.data);

    // 5. 获取任务时间统计
    console.log('5. 获取任务时间统计...');
    const taskStatsResponse = await axios.get(`${BASE_URL}/time-tracking/tasks/${taskId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 任务时间统计:', taskStatsResponse.data.data);

    // 6. 创建手动时间记录
    console.log('6. 创建手动时间记录...');
    const manualEntryResponse = await axios.post(`${BASE_URL}/time-tracking`, {
      taskId: taskId,
      description: '手动创建的时间记录',
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
      endTime: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 手动时间记录创建成功:', manualEntryResponse.data.data.id);

    // 7. 更新时间记录
    console.log('7. 更新时间记录...');
    const updateResponse = await axios.put(`${BASE_URL}/time-tracking/${manualEntryResponse.data.data.id}`, {
      description: '更新后的时间记录描述'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 时间记录更新成功');

    // 8. 删除时间记录
    console.log('8. 删除时间记录...');
    const deleteResponse = await axios.delete(`${BASE_URL}/time-tracking/${manualEntryResponse.data.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 时间记录删除成功');

    return true;
  } catch (error) {
    console.error('❌ 时间跟踪 API 测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试新实现的 API 功能...\n');

  // 登录
  console.log('🔐 用户登录...');
  authToken = await loginUser('test@example.com', 'password123');
  if (!authToken) {
    console.error('❌ 登录失败，请确保服务器运行并创建了测试用户');
    return;
  }
  console.log('✅ 登录成功');

  // 创建测试项目
  console.log('\n📁 创建测试项目...');
  testProjectId = await createTestProject(authToken);
  if (!testProjectId) {
    console.error('❌ 创建测试项目失败');
    return;
  }
  console.log('✅ 测试项目创建成功:', testProjectId);

  // 创建测试任务
  console.log('\n📋 创建测试任务...');
  testTaskId = await createTestTask(authToken, testProjectId);
  if (!testTaskId) {
    console.error('❌ 创建测试任务失败');
    return;
  }
  console.log('✅ 测试任务创建成功:', testTaskId);

  // 运行各项测试
  const results = {
    notifications: await testNotificationAPIs(authToken),
    fileUpload: await testFileUploadAPIs(authToken, testTaskId),
    timeTracking: await testTimeTrackingAPIs(authToken, testTaskId)
  };

  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log('================================');
  console.log(`通知系统 API: ${results.notifications ? '✅ 通过' : '❌ 失败'}`);
  console.log(`文件上传 API: ${results.fileUpload ? '✅ 通过' : '❌ 失败'}`);
  console.log(`时间跟踪 API: ${results.timeTracking ? '✅ 通过' : '❌ 失败'}`);
  console.log('================================');

  const allPassed = Object.values(results).every(result => result);
  if (allPassed) {
    console.log('\n🎉 所有 API 测试通过！新功能已成功实现。');
  } else {
    console.log('\n⚠️ 部分 API 测试失败，请检查错误信息。');
  }
}

// 运行测试
runTests().catch(console.error);
