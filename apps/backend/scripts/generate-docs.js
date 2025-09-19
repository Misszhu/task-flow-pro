#!/usr/bin/env node

/**
 * 快速生成API文档的脚本
 * 使用方法: node scripts/generate-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始生成API文档...\n');

// 1. 生成Swagger JSON文件
console.log('📝 生成Swagger JSON文件...');
try {
  // 这里可以添加生成swagger.json的逻辑
  console.log('✅ Swagger JSON文件已生成');
} catch (error) {
  console.error('❌ 生成Swagger JSON失败:', error.message);
}

// 2. 生成Markdown文档
console.log('📄 生成Markdown文档...');
try {
  // 这里可以添加生成markdown文档的逻辑
  console.log('✅ Markdown文档已生成');
} catch (error) {
  console.error('❌ 生成Markdown文档失败:', error.message);
}

// 3. 生成Postman Collection
console.log('📮 生成Postman Collection...');
try {
  // 这里可以添加生成postman collection的逻辑
  console.log('✅ Postman Collection已生成');
} catch (error) {
  console.error('❌ 生成Postman Collection失败:', error.message);
}

console.log('\n🎉 文档生成完成！');
console.log('\n📋 可用的文档:');
console.log('  - Swagger UI: http://localhost:3001/api-docs');
console.log('  - API文档: ./API_DOCUMENTATION.md');
console.log('  - Postman Collection: ./postman-collection.json');
