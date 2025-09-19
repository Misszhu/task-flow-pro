#!/usr/bin/env node

/**
 * API文档生成器
 * 支持多种格式的文档生成
 */

const fs = require('fs');
const path = require('path');

class DocGenerator {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.routesPath = path.join(this.projectRoot, 'src', 'routes');
    this.outputPath = path.join(this.projectRoot, 'docs');
  }

  // 创建输出目录
  ensureOutputDir() {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  // 扫描路由文件
  scanRouteFiles() {
    const routes = [];
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
          routes.push(filePath);
        }
      });
    };
    scanDir(this.routesPath);
    return routes;
  }

  // 提取Swagger注释
  extractSwaggerComments(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const swaggerComments = [];
    const lines = content.split('\n');

    let inComment = false;
    let comment = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('/**') && line.includes('@swagger')) {
        inComment = true;
        comment = line + '\n';
      } else if (inComment) {
        comment += line + '\n';
        if (line.trim().endsWith('*/')) {
          swaggerComments.push(comment);
          comment = '';
          inComment = false;
        }
      }
    }

    return swaggerComments;
  }

  // 生成OpenAPI规范
  generateOpenAPISpec() {
    const routes = this.scanRouteFiles();
    let openAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'Task Flow Pro API',
        version: '1.0.0',
        description: '任务流程管理系统API文档'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: '开发环境'
        }
      ],
      paths: {},
      components: {
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', description: '错误信息' },
              details: { type: 'string', description: '详细错误信息' }
            }
          }
        }
      }
    };

    // 处理每个路由文件
    routes.forEach(routeFile => {
      const comments = this.extractSwaggerComments(routeFile);
      console.log(`📁 处理文件: ${path.relative(this.projectRoot, routeFile)}`);
      console.log(`  找到 ${comments.length} 个Swagger注释`);
    });

    return openAPISpec;
  }

  // 生成Markdown文档
  generateMarkdownDoc() {
    const routes = this.scanRouteFiles();
    let markdown = `# Task Flow Pro API 文档

## 快速开始

### 基础信息
- **Base URL**: \`http://localhost:3001\`
- **Content-Type**: \`application/json\`
- **API Version**: v1

### 访问文档
- **Swagger UI**: http://localhost:3001/api-docs
- **API文档**: 本文档

## 接口列表

`;

    routes.forEach(routeFile => {
      const relativePath = path.relative(this.projectRoot, routeFile);
      markdown += `### ${relativePath}\n\n`;

      const comments = this.extractSwaggerComments(routeFile);
      comments.forEach(comment => {
        // 这里可以解析Swagger注释并转换为Markdown
        markdown += `\`\`\`yaml\n${comment}\n\`\`\`\n\n`;
      });
    });

    return markdown;
  }

  // 生成所有文档
  generateAll() {
    console.log('🚀 开始生成API文档...\n');

    this.ensureOutputDir();

    // 生成OpenAPI规范
    console.log('📝 生成OpenAPI规范...');
    const openAPISpec = this.generateOpenAPISpec();
    fs.writeFileSync(
      path.join(this.outputPath, 'openapi.json'),
      JSON.stringify(openAPISpec, null, 2)
    );
    console.log('✅ OpenAPI规范已生成');

    // 生成Markdown文档
    console.log('📄 生成Markdown文档...');
    const markdown = this.generateMarkdownDoc();
    fs.writeFileSync(
      path.join(this.outputPath, 'API.md'),
      markdown
    );
    console.log('✅ Markdown文档已生成');

    console.log('\n🎉 文档生成完成！');
    console.log(`📁 输出目录: ${this.outputPath}`);
  }
}

// 运行生成器
if (require.main === module) {
  const generator = new DocGenerator();
  generator.generateAll();
}

module.exports = DocGenerator;
