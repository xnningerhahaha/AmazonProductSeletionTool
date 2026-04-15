# 测试文档

本文档说明如何运行项目的测试套件。

## 测试框架

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架，它是一个快速的单元测试框架，与 Vite 完美集成。

## 安装依赖

在运行测试之前，需要先安装测试相关的依赖：

### 后端测试依赖

```bash
cd backend
npm install --save-dev vitest @vitest/ui
```

### 前端测试依赖

```bash
cd frontend
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

## 运行测试

### 后端测试

```bash
cd backend

# 运行所有测试（单次运行）
npm test

# 监听模式（自动重新运行）
npm run test:watch

# 使用UI界面运行测试
npm run test:ui
```

### 前端测试

```bash
cd frontend

# 运行所有测试（单次运行）
npm test

# 监听模式（自动重新运行）
npm run test:watch

# 使用UI界面运行测试
npm run test:ui
```

## 测试覆盖范围

### 后端单元测试

- **验证器测试** (`backend/src/utils/validators.test.ts`)
  - ASIN格式验证
  - ASIN标准化

- **分析器测试**
  - 竞争分析器 (`backend/src/analyzers/competitionAnalyzer.test.ts`)
  - 价格分析器 (`backend/src/analyzers/priceAnalyzer.test.ts`)
  - 需求分析器 (`backend/src/analyzers/demandAnalyzer.test.ts`)

- **服务测试**
  - 综合分析服务 (`backend/src/services/analysisService.test.ts`)

### 后端集成测试

- **API路由测试** (`backend/src/routes/analyze.integration.test.ts`)
  - 请求验证
  - 错误处理
  
- **数据服务测试** (`backend/src/services/amazonDataService.integration.test.ts`)
  - 产品数据获取
  - 错误场景处理

- **完整流程测试** (`backend/src/integration/fullFlow.integration.test.ts`)
  - 端到端分析流程
  - 不同产品场景

### 前端测试

- **工具函数测试** (`frontend/src/utils/validators.test.ts`)
  - ASIN验证
  - 错误消息生成

- **组件测试**
  - ASIN输入组件 (`frontend/src/components/AsinInput.test.tsx`)
  - 分析按钮组件 (`frontend/src/components/AnalyzeButton.test.tsx`)
  - 错误消息组件 (`frontend/src/components/ErrorMessage.test.tsx`)
  - 加载指示器组件 (`frontend/src/components/LoadingSpinner.test.tsx`)

- **API服务测试** (`frontend/src/services/api.test.ts`)
  - API调用
  - 缓存机制
  - 错误处理

## 测试结构

### 单元测试

单元测试专注于测试单个函数或组件的功能，不依赖外部服务。

示例：
```typescript
describe('validateAsin', () => {
  it('should validate correct ASIN format', () => {
    expect(validateAsin('B08N5WRWNW')).toBe(true);
  });
});
```

### 集成测试

集成测试验证多个模块协同工作的情况。

示例：
```typescript
describe('Full Analysis Flow', () => {
  it('should complete full analysis from ASIN to result', async () => {
    const productInfo = await getProductInfo('B08N5WRWNW');
    const analysis = analyzeProduct(productInfo);
    expect(analysis.conclusion).toBeDefined();
  });
});
```

### 组件测试

组件测试验证React组件的渲染和交互行为。

示例：
```typescript
describe('AsinInput Component', () => {
  it('should call onChange when input changes', () => {
    const handleChange = vi.fn();
    render(<AsinInput value="" onChange={handleChange} />);
    fireEvent.change(input, { target: { value: 'B08N5WRWNW' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
```

## 测试最佳实践

1. **保持测试简单** - 每个测试应该只验证一个行为
2. **使用描述性的测试名称** - 测试名称应该清楚地说明测试的内容
3. **避免测试实现细节** - 测试应该关注行为而不是实现
4. **使用真实数据** - 避免使用mock数据，除非必要
5. **保持测试独立** - 测试之间不应该有依赖关系

## 故障排除

### 测试失败

如果测试失败，请检查：
1. 所有依赖是否已正确安装
2. 环境变量是否正确配置
3. 测试数据是否有效

### 性能问题

如果测试运行缓慢：
1. 使用 `--run` 标志进行单次运行
2. 使用 `--reporter=dot` 减少输出
3. 考虑并行运行测试

## 持续集成

测试可以集成到CI/CD流程中：

```yaml
# GitHub Actions 示例
- name: Run Backend Tests
  run: |
    cd backend
    npm test

- name: Run Frontend Tests
  run: |
    cd frontend
    npm test
```

## 注意事项

- 后端测试在没有配置Amazon API凭证时会使用模拟数据
- 前端组件测试需要jsdom环境来模拟浏览器
- 集成测试可能需要更长的运行时间

## 更多信息

- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [React Testing 最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
