# 快速启动指南

## 方法一：使用启动脚本（推荐）

### macOS/Linux

```bash
./start.sh
```

### Windows

双击运行 `start.bat` 或在命令行中执行：

```cmd
start.bat
```

## 方法二：手动启动

### 1. 启动后端

打开终端，执行：

```bash
cd backend
npm install          # 首次运行需要安装依赖
cp .env.example .env # 首次运行需要配置环境变量
npm run dev
```

**重要**: 编辑 `backend/.env` 文件，填入你的 Amazon API 凭证：

```bash
AMAZON_ACCESS_KEY=你的访问密钥
AMAZON_SECRET_KEY=你的密钥
AMAZON_PARTNER_TAG=你的合作伙伴标签
```

### 2. 启动前端

打开新的终端窗口，执行：

```bash
cd frontend
npm install  # 首次运行需要安装依赖
npm run dev
```

### 3. 访问应用

打开浏览器访问: **http://localhost:5173**

## 获取 Amazon API 凭证

1. 访问 [Amazon Associates Program](https://affiliate-program.amazon.com/)
2. 注册或登录账号
3. 前往 [API Credentials](https://affiliate-program.amazon.com/assoc_credentials/home)
4. 获取 Access Key、Secret Key 和 Partner Tag
5. 填入 `backend/.env` 文件

## 测试应用

在浏览器中输入一个 Amazon ASIN（例如：B08N5WRWNW）进行测试。

ASIN 是 Amazon 产品的唯一标识符，可以在产品页面 URL 中找到。

## 常见问题

### 端口被占用

如果 5000 或 5173 端口被占用，可以修改：

- 后端端口: 编辑 `backend/.env` 中的 `PORT`
- 前端端口: 编辑 `frontend/vite.config.ts` 中的 `server.port`

### 依赖安装失败

尝试清除缓存后重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

### API 请求失败

1. 检查后端是否正常运行（访问 http://localhost:5000/health）
2. 检查 Amazon API 凭证是否正确
3. 查看浏览器控制台和后端终端的错误信息

## 下一步

- 查看 [README.md](./README.md) 了解项目详情
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解生产部署
- 查看 [TESTING.md](./TESTING.md) 了解测试说明
