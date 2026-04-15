# 前后端集成测试指南

## 已完成的集成工作

### 1. 前端API服务配置 ✅
- 创建了 `frontend/src/services/api.ts` 文件
- 实现了 `analyzeProduct()` 函数用于调用后端API
- 实现了 `healthCheck()` 函数用于检查服务器状态
- 配置了API基础URL（通过环境变量 `VITE_API_BASE_URL`）
- 添加了完整的错误处理（网络错误、API错误等）

### 2. 前端环境变量配置 ✅
- 创建了 `frontend/.env` 文件
- 创建了 `frontend/.env.example` 文件
- 配置了 `VITE_API_BASE_URL=http://localhost:5000`
- 更新了 `frontend/src/vite-env.d.ts` 添加环境变量类型定义

### 3. 前端App组件集成 ✅
- 更新了 `frontend/src/App.tsx` 集成API调用
- 实现了完整的数据流：输入 → API → 分析 → 展示
- 添加了 `ProductReport` 组件的显示逻辑
- 实现了"新建分析"功能，可以返回首页
- 添加了完整的错误处理和重试机制

### 4. 后端CORS配置 ✅
- 后端已配置CORS中间件
- 允许前端URL（http://localhost:5173）跨域访问
- 通过环境变量 `FRONTEND_URL` 配置

### 5. 后端API路由 ✅
- 已实现 `/api/analyze` POST路由
- 已实现 `/health` GET路由用于健康检查
- 完整的错误处理和响应格式

## 测试步骤

### 前置条件
确保已安装依赖：
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 步骤1: 启动后端服务器
```bash
cd backend
npm run dev
```

预期输出：
```
🚀 Server is running on port 5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:5173
```

### 步骤2: 启动前端开发服务器
在新的终端窗口中：
```bash
cd frontend
npm run dev
```

预期输出：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 步骤3: 测试完整数据流

1. **打开浏览器访问** http://localhost:5173/

2. **测试有效ASIN输入**
   - 输入有效的ASIN（例如：B08N5WRWNW）
   - 点击"选品分析"按钮
   - 应该看到加载指示器
   - 应该看到完整的产品报告（包括产品信息、分析结论、详细分析）

3. **测试无效ASIN**
   - 输入无效的ASIN（例如：123）
   - 输入框应该显示错误提示
   - "选品分析"按钮应该被禁用

4. **测试错误场景**
   - 停止后端服务器
   - 尝试分析产品
   - 应该看到网络错误提示："无法连接到服务器，请检查网络连接或稍后重试"
   - 点击"重试"按钮应该重新发起请求

5. **测试新建分析功能**
   - 在显示报告后，点击"新建分析"或"返回首页"按钮
   - 应该返回到输入界面
   - 输入框应该被清空

### 步骤4: 验证API响应

使用curl或Postman测试后端API：

```bash
# 测试健康检查
curl http://localhost:5000/health

# 测试分析API（有效ASIN）
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":"B08N5WRWNW"}'

# 测试分析API（无效ASIN）
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":"123"}'
```

### 步骤5: 检查浏览器控制台

打开浏览器开发者工具（F12），检查：
- Network标签：查看API请求和响应
- Console标签：查看日志输出，不应该有错误

## 已验证的错误场景

### 1. INVALID_ASIN（无效ASIN格式）
- 前端验证：输入框实时验证
- 后端验证：返回400状态码和错误信息

### 2. PRODUCT_NOT_FOUND（产品不存在）
- 后端返回404状态码
- 前端显示："未找到该产品，请检查ASIN是否正确"

### 3. API_ERROR（API调用失败）
- 后端返回502状态码
- 前端显示："亚马逊API调用失败，请稍后重试"

### 4. NETWORK_ERROR（网络错误）
- 前端捕获fetch错误
- 显示："无法连接到服务器，请检查网络连接或稍后重试"

### 5. SERVER_ERROR（服务器错误）
- 后端返回500状态码
- 前端显示："服务器内部错误，请稍后重试"

## 跨域问题处理

后端已配置CORS中间件：
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))
```

如果遇到跨域问题：
1. 检查后端 `.env` 文件中的 `FRONTEND_URL` 配置
2. 检查浏览器控制台的CORS错误信息
3. 确保后端服务器正在运行

## 配置文件总结

### 前端配置
- `frontend/.env`: API基础URL配置
- `frontend/src/services/api.ts`: API调用服务
- `frontend/src/App.tsx`: 主应用组件，集成API调用

### 后端配置
- `backend/.env`: 服务器端口、CORS配置
- `backend/src/server.ts`: Express服务器配置
- `backend/src/routes/analyze.ts`: 分析API路由

## 集成完成确认清单

- [x] 配置前端API基础URL
- [x] 创建API服务模块
- [x] 更新App组件集成API调用
- [x] 实现完整数据流（输入 → API → 分析 → 展示）
- [x] 配置后端CORS
- [x] 处理所有错误场景
- [x] 实现重试机制
- [x] 实现新建分析功能
- [x] 添加环境变量配置
- [x] 添加TypeScript类型定义

## 下一步

集成已完成！现在可以：
1. 按照上述测试步骤验证集成
2. 继续实现任务11（优化用户体验）
3. 继续实现任务12（测试和质量保证）
