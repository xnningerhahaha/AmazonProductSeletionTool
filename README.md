# 亚马逊选品分析系统

一个帮助卖家分析亚马逊产品市场潜力的工具，提供需求分析、价格分析和竞争分析。

**在线演示**: https://amazon-product-seletion-tool.vercel.app/

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 本地开发启动

#### 1. 克隆项目

```bash
git clone <your-repo-url>
cd amazon-product-analyzer
```

#### 2. 启动后端

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 Amazon API 凭证

# 启动开发服务器
npm run dev
```

后端将在 `http://localhost:5000` 运行

#### 3. 启动前端（新终端窗口）

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量（可选，默认已配置）
cp .env.example .env

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 运行

#### 4. 访问应用

打开浏览器访问: `http://localhost:5173`

## 获取 Amazon API 凭证

1. 访问 [Amazon Associates Program](https://affiliate-program.amazon.com/)
2. 注册或登录账号
3. 前往 [API Credentials](https://affiliate-program.amazon.com/assoc_credentials/home)
4. 获取以下信息：
   - Access Key (访问密钥)
   - Secret Key (密钥)
   - Partner Tag (合作伙伴标签)

5. 将这些信息填入 `backend/.env` 文件：

```bash
AMAZON_ACCESS_KEY=你的访问密钥
AMAZON_SECRET_KEY=你的密钥
AMAZON_PARTNER_TAG=你的合作伙伴标签
```

## 项目结构

```
amazon-product-analyzer/
├── backend/              # 后端 API (Express + TypeScript)
│   ├── src/
│   │   ├── server.ts    # 服务器入口
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── analyzers/   # 分析器
│   │   └── utils/       # 工具函数
│   └── package.json
│
├── frontend/            # 前端应用 (React + TypeScript + Vite)
│   ├── src/
│   │   ├── App.tsx      # 主应用组件
│   │   ├── components/  # UI 组件
│   │   ├── services/    # API 服务
│   │   └── types/       # TypeScript 类型
│   └── package.json
│
└── README.md
```

## 可用命令

### 后端命令

```bash
npm run dev          # 启动开发服务器（热重载）
npm run build        # 构建生产版本
npm start            # 运行生产版本
npm test             # 运行测试
npm run lint         # 代码检查
```

### 前端命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
npm test             # 运行测试
npm run lint         # 代码检查
```

## 功能特性

- ✅ **需求分析**: 评估产品市场需求和销量潜力
- ✅ **价格分析**: 分析价格定位和利润空间
- ✅ **竞争分析**: 评估市场竞争程度和进入难度
- ✅ **综合评分**: 基于多维度数据的产品评分
- ✅ **实时数据**: 从 Amazon API 获取最新产品信息

## 测试

### 运行所有测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

### 运行集成测试

```bash
cd backend
npm test -- integration
```

## 部署

详细的生产环境部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署选项

1. **Vercel (前端)** - 推荐用于前端部署
2. **Railway/Render (后端)** - 简单的后端部署
3. **Docker** - 使用 `docker-compose up` 一键部署
4. **自托管** - 使用 PM2 + Nginx

## 环境变量

### 后端 (.env)

```bash
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

AMAZON_ACCESS_KEY=你的访问密钥
AMAZON_SECRET_KEY=你的密钥
AMAZON_PARTNER_TAG=你的合作伙伴标签
AMAZON_REGION=us-east-1
AMAZON_API_HOST=webservices.amazon.com
```

### 前端 (.env)

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## 故障排查

### 后端无法启动

1. 检查 Node.js 版本: `node --version` (需要 18+)
2. 检查端口占用: `lsof -i :5000`
3. 检查环境变量是否正确配置
4. 查看错误日志

### 前端无法连接后端

1. 确认后端已启动并运行在 `http://localhost:5000`
2. 检查 `frontend/.env` 中的 `VITE_API_BASE_URL`
3. 检查浏览器控制台的网络请求

### Amazon API 错误

1. 确认 API 凭证正确
2. 检查 API 配额是否用完
3. 确认 ASIN 格式正确（10位字符）

## 技术栈

### 后端
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **Vitest** - 测试框架

### 前端
- **React** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Vitest** - 测试框架

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

ISC

## 支持

如有问题，请查看：
- [部署指南](./DEPLOYMENT.md)
- [测试文档](./TESTING.md)
- 项目 Issues
