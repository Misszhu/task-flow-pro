#!/usr/bin/env node

console.log('🚀 开始生成API文档...\n');

// 检查路由文件
const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '..', 'src', 'routes');
const outputPath = path.join(__dirname, '..', 'docs');

// 创建输出目录
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
  console.log('📁 创建输出目录:', outputPath);
}

// 扫描路由文件
function scanRoutes(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...scanRoutes(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  });

  return files;
}

const routeFiles = scanRoutes(routesPath);
console.log(`📁 找到 ${routeFiles.length} 个路由文件:`);
routeFiles.forEach(file => {
  console.log(`  - ${path.relative(path.join(__dirname, '..'), file)}`);
});

// 生成简单的API列表
let apiList = '# API接口列表\n\n';
apiList += '## 基础信息\n';
apiList += '- **Base URL**: `http://localhost:3001`\n';
apiList += '- **Content-Type**: `application/json`\n\n';

apiList += '## 接口列表\n\n';

routeFiles.forEach(file => {
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  apiList += `### ${relativePath}\n\n`;

  // 读取文件内容
  const content = fs.readFileSync(file, 'utf8');

  // 提取路由定义
  const routeMatches = content.match(/router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g);
  if (routeMatches) {
    routeMatches.forEach(match => {
      const method = match.match(/router\.(get|post|put|delete|patch)/)[1].toUpperCase();
      const path = match.match(/['"`]([^'"`]+)['"`]/)[1];
      apiList += `- **${method}** \`${path}\`\n`;
    });
  }

  apiList += '\n';
});

// 写入文件
fs.writeFileSync(path.join(outputPath, 'API_LIST.md'), apiList);
console.log('✅ 生成API列表文档');

console.log('\n🎉 文档生成完成！');
console.log(`📁 输出目录: ${outputPath}`);
console.log('📄 生成的文件:');
console.log('  - API_LIST.md - API接口列表');
console.log('\n💡 提示: 访问 http://localhost:3001/api-docs 查看完整的Swagger文档');
