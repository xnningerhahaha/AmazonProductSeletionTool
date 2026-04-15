# 高级分析引擎实施计划

## 概述

将现有的 3 维度分析扩展到 9 维度，增加 6 个高级评估规则。

## 实施阶段

### 阶段 1：架构准备（1-2 天）

**目标**: 重构代码架构，支持可扩展的分析器

**任务**:
1. 创建统一的分析器接口
2. 重构现有的 3 个分析器
3. 更新类型定义
4. 准备测试框架

**文件修改**:
- `backend/src/types/index.ts` - 添加新的类型定义
- `backend/src/analyzers/baseAnalyzer.ts` - 创建基础分析器类
- `backend/src/services/analysisService.ts` - 重构服务层

---

### 阶段 2：实现头部垄断度分析（优先级最高）

**目标**: 实现最重要的"头部垄断度"分析

**数据需求**:
- Top 10 产品数据
- 各产品评论数（作为销量代理指标）

**实现方案**:

**方案 A：基于现有数据估算（推荐）**
```javascript
// 使用评论数作为销量代理指标
monopolyScore = calculateMonopolyFromReviews(categoryData)
```

**方案 B：扩展 API 调用**
```javascript
// 调用类目 Best Sellers API 获取 Top 10
topProducts = await getTopProducts(category)
```

**评分逻辑**:
```javascript
function analyzeMonopoly(productData, categoryData) {
  const top10ReviewSum = categoryData.top10.reduce((sum, p) => sum + p.reviewCount, 0)
  const totalReviewSum = categoryData.totalReviewCount
  const concentration = top10ReviewSum / totalReviewSum
  
  if (concentration > 0.6) {
    return { score: 20, level: 'critical', message: '这个品不是没人做，是已经被做死了' }
  } else if (concentration > 0.4) {
    return { score: 50, level: 'high', message: '头部卖家吃掉了大部分市场' }
  } else {
    return { score: 85, level: 'low', message: '市场相对分散，还有机会' }
  }
}
```

**文件创建**:
- `backend/src/analyzers/monopolyAnalyzer.ts`
- `backend/src/analyzers/monopolyAnalyzer.test.ts`

---

### 阶段 3：实现价格带塌陷分析

**目标**: 检测价格竞争是否已经白热化

**数据需求**:
- 同类产品价格列表（至少 20-50 个）
- 价格分布统计

**实现方案**:

**方案 A：基于搜索结果（需要扩展 API）**
```javascript
// 搜索同类产品
const similarProducts = await searchProducts(category, keywords)
const prices = similarProducts.map(p => p.price)
const priceRange = Math.max(...prices) - Math.min(...prices)
```

**方案 B：基于类目数据（简化版）**
```javascript
// 使用预设的类目价格区间数据
const categoryPriceData = getCategoryPriceData(category)
```

**评分逻辑**:
```javascript
function analyzePriceCollapse(price, categoryPrices) {
  const priceStd = calculateStandardDeviation(categoryPrices)
  const priceRange = Math.max(...categoryPrices) - Math.min(...categoryPrices)
  
  if (priceRange < 2) {
    return { score: 15, level: 'critical', message: '价格已经卷到没有利润空间' }
  } else if (priceRange < 5) {
    return { score: 40, level: 'high', message: '价格高度集中，竞争激烈' }
  } else if (priceRange < 10) {
    return { score: 65, level: 'medium', message: '价格较集中' }
  } else {
    return { score: 90, level: 'low', message: '价格分散，有溢价空间' }
  }
}
```

**文件创建**:
- `backend/src/analyzers/priceCollapseAnalyzer.ts`
- `backend/src/analyzers/priceCollapseAnalyzer.test.ts`

---

### 阶段 4：实现评论集中缺陷分析

**目标**: 识别产品的隐藏质量问题

**数据需求**:
- 评论文本内容（PA-API 不提供）

**实现方案**:

**方案 A：使用第三方评论 API**
```javascript
// 需要额外的评论抓取服务
const reviews = await getProductReviews(asin)
const defects = analyzeReviewDefects(reviews)
```

**方案 B：基于评分分布估算（简化版）**
```javascript
// 使用评分分布推测质量问题
function estimateDefects(rating, reviewCount) {
  if (rating < 4.0) return { score: 30, hasDefects: true }
  if (rating < 4.3) return { score: 60, hasDefects: false }
  return { score: 90, hasDefects: false }
}
```

**评分逻辑**:
```javascript
function analyzeReviewDefects(reviews) {
  const defectKeywords = {
    quality: ['break', 'broke', 'broken', 'cheap', 'flimsy'],
    function: ['doesn\'t work', 'not working', 'stopped working'],
    durability: ['leak', 'leaking', 'fall apart']
  }
  
  const defectCounts = countDefectKeywords(reviews, defectKeywords)
  const defectRate = defectCounts.total / reviews.length
  
  if (defectRate > 0.2) {
    return { score: 20, level: 'critical', message: '严重质量问题，一票否决' }
  } else if (defectRate > 0.1) {
    return { score: 45, level: 'high', message: '这是迟早会爆的雷' }
  } else if (defectRate > 0.05) {
    return { score: 70, level: 'medium', message: '有轻微质量问题' }
  } else {
    return { score: 90, level: 'low', message: '产品质量稳定' }
  }
}
```

**文件创建**:
- `backend/src/analyzers/reviewDefectAnalyzer.ts`
- `backend/src/analyzers/reviewDefectAnalyzer.test.ts`

---

### 阶段 5：实现广告依赖度分析

**目标**: 评估类目的广告竞争程度

**数据需求**:
- 搜索结果页广告位数据
- CPC 成本数据

**实现方案**:

**方案 A：基于类目预设数据（推荐）**
```javascript
// 使用预设的类目广告数据
const categoryAdData = {
  'Electronics': { avgCPC: 1.5, adRatio: 0.6 },
  'Home & Kitchen': { avgCPC: 0.8, adRatio: 0.4 },
  // ...
}
```

**方案 B：实时抓取（需要额外开发）**
```javascript
// 抓取搜索结果页
const searchResults = await scrapeSearchResults(keywords)
const adPositions = countAdPositions(searchResults)
```

**评分逻辑**:
```javascript
function analyzeAdDependency(category, salesRank) {
  const categoryData = getCategoryAdData(category)
  const adDependency = categoryData.adRatio
  const cpc = categoryData.avgCPC
  
  if (adDependency > 0.7 || cpc > 3.0) {
    return { score: 15, level: 'critical', message: '新卖家 = 给老卖家打工' }
  } else if (adDependency > 0.5 || cpc > 1.5) {
    return { score: 40, level: 'high', message: '需要持续烧钱才能维持销量' }
  } else if (adDependency > 0.3 || cpc > 0.8) {
    return { score: 65, level: 'medium', message: '中度依赖广告' }
  } else {
    return { score: 90, level: 'low', message: '自然流量强，广告成本可控' }
  }
}
```

**文件创建**:
- `backend/src/analyzers/adDependencyAnalyzer.ts`
- `backend/src/analyzers/adDependencyAnalyzer.test.ts`

---

### 阶段 6：实现同质化程度分析

**目标**: 评估产品差异化程度

**数据需求**:
- 同类产品列表
- 产品图片、标题、描述

**实现方案**:

**方案 A：基于文本相似度（推荐）**
```javascript
// 分析标题和描述的相似度
const similarity = calculateTextSimilarity(product.title, competitorTitles)
```

**方案 B：基于类目特征（简化版）**
```javascript
// 使用类目预设的同质化程度
const categoryHomogeneity = {
  'Phone Cases': 0.85,  // 高度同质化
  'Bluetooth Speakers': 0.65,
  'Kitchen Gadgets': 0.45
}
```

**评分逻辑**:
```javascript
function analyzeHomogeneity(product, competitors) {
  const titleSimilarity = calculateAvgSimilarity(product.title, competitors.map(c => c.title))
  const priceSimilarity = calculatePriceCluster(product.price, competitors.map(c => c.price))
  
  const homogeneity = (titleSimilarity * 0.6 + priceSimilarity * 0.4)
  
  if (homogeneity > 0.8) {
    return { score: 20, level: 'critical', message: '不是你不会做，是根本没位置给你' }
  } else if (homogeneity > 0.6) {
    return { score: 45, level: 'high', message: '产品高度同质化，只能拼价格' }
  } else if (homogeneity > 0.4) {
    return { score: 70, level: 'medium', message: '有一定差异化空间' }
  } else {
    return { score: 90, level: 'low', message: '差异化明显，有独特卖点' }
  }
}
```

**文件创建**:
- `backend/src/analyzers/homogeneityAnalyzer.ts`
- `backend/src/analyzers/homogeneityAnalyzer.test.ts`

---

### 阶段 7：实现新品存活率分析

**目标**: 评估新品在该类目的成功概率

**数据需求**:
- 新品列表（上架时间 < 12 个月）
- 新品销量数据

**实现方案**:

**方案 A：基于类目历史数据（推荐）**
```javascript
// 使用预设的类目新品存活率数据
const categorySurvivalRate = {
  'Electronics': 0.15,  // 15% 存活率
  'Home & Kitchen': 0.25,
  'Sports': 0.35
}
```

**方案 B：实时统计（需要数据库）**
```javascript
// 统计近 12 个月的新品数据
const newProducts = await getNewProducts(category, 12)
const survivors = newProducts.filter(p => p.salesRank < 50000)
const survivalRate = survivors.length / newProducts.length
```

**评分逻辑**:
```javascript
function analyzeSurvivalRate(category, salesRank) {
  const survivalRate = getCategorySurvivalRate(category)
  
  if (survivalRate < 0.1) {
    return { score: 15, level: 'critical', message: '这是尸横遍野型类目' }
  } else if (survivalRate < 0.2) {
    return { score: 40, level: 'high', message: '新品死亡率极高' }
  } else if (survivalRate < 0.3) {
    return { score: 65, level: 'medium', message: '新品需要实力才能存活' }
  } else {
    return { score: 85, level: 'low', message: '新品有机会' }
  }
}
```

**文件创建**:
- `backend/src/analyzers/survivalRateAnalyzer.ts`
- `backend/src/analyzers/survivalRateAnalyzer.test.ts`

---

### 阶段 8：整合所有分析器

**目标**: 更新分析服务，整合所有 9 个分析器

**任务**:
1. 更新 `analysisService.ts`
2. 实现综合评分算法
3. 实现一票否决机制
4. 更新返回数据结构

**综合评分实现**:
```javascript
function calculateOverallScore(analyses) {
  const weights = {
    demand: 0.15,
    pricing: 0.10,
    competition: 0.10,
    monopoly: 0.25,        // 最重要
    priceCollapse: 0.10,
    reviewDefect: 0.10,
    adDependency: 0.08,
    homogeneity: 0.07,
    survivalRate: 0.05
  }
  
  let score = 0
  for (const [key, weight] of Object.entries(weights)) {
    score += analyses[key].score * weight
  }
  
  // 一票否决
  if (analyses.monopoly.score < 20) return 0
  if (analyses.priceCollapse.score < 20) return 0
  if (analyses.survivalRate.score < 15) return 0
  
  return Math.round(score)
}
```

---

### 阶段 9：更新前端展示

**目标**: 在前端展示所有 9 个维度的分析结果

**任务**:
1. 更新类型定义
2. 创建新的分析卡片组件
3. 优化布局和视觉设计
4. 添加详细说明和建议

**UI 设计**:
```
┌─────────────────────────────────────┐
│  综合评分: 63 分                     │
│  结论: 不推荐 ⚠️                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🔴 头部垄断度: 35 分 (高风险)       │
│  "这个品不是没人做，是已经被做死了"   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  需求分析: 65 分                     │
│  价格分析: 70 分                     │
│  竞争分析: 55 分                     │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 数据准备

### 类目基础数据

创建类目数据配置文件：

```javascript
// backend/src/data/categoryData.ts
export const categoryData = {
  'Electronics': {
    avgPrice: 35.99,
    priceRange: [10, 200],
    monopolyRate: 0.65,
    survivalRate: 0.15,
    adDependency: 0.70,
    avgCPC: 1.85,
    homogeneity: 0.75
  },
  'Home & Kitchen': {
    avgPrice: 24.99,
    priceRange: [5, 100],
    monopolyRate: 0.45,
    survivalRate: 0.28,
    adDependency: 0.45,
    avgCPC: 0.95,
    homogeneity: 0.60
  },
  // ... 更多类目
}
```

### 演示数据扩展

更新演示模式数据：

```javascript
// backend/src/services/amazonDataService.ts
private getMockProductInfo(asin: string): ExtendedProductInfo {
  return {
    // 基础数据
    asin,
    title: 'Sample Product',
    price: 29.99,
    rating: 4.3,
    reviewCount: 856,
    salesRank: 12450,
    category: 'Electronics',
    
    // 扩展数据
    categoryData: {
      topProducts: generateMockTopProducts(),
      priceDistribution: generateMockPrices(),
      newProducts: generateMockNewProducts(),
      adMetrics: {
        adPositions: 7,
        totalPositions: 20,
        avgCPC: 1.25
      }
    },
    
    reviewAnalysis: {
      defectKeywords: {
        'break': 12,
        'cheap': 8,
        'doesn\'t work': 5
      },
      totalReviews: 856
    }
  }
}
```

---

## 测试计划

### 单元测试

每个分析器都需要完整的单元测试：

```javascript
describe('MonopolyAnalyzer', () => {
  it('should detect high monopoly (>60%)', () => {
    const result = analyzeMonopoly(mockHighMonopolyData)
    expect(result.score).toBeLessThan(30)
    expect(result.level).toBe('critical')
  })
  
  it('should detect medium monopoly (40-60%)', () => {
    const result = analyzeMonopoly(mockMediumMonopolyData)
    expect(result.score).toBeBetween(40, 60)
    expect(result.level).toBe('high')
  })
  
  it('should detect low monopoly (<40%)', () => {
    const result = analyzeMonopoly(mockLowMonopolyData)
    expect(result.score).toBeGreaterThan(70)
    expect(result.level).toBe('low')
  })
})
```

### 集成测试

测试完整的分析流程：

```javascript
describe('Full Analysis Flow', () => {
  it('should analyze product with all 9 dimensions', async () => {
    const result = await analyzeProduct('B08N5WRWNW')
    
    expect(result.analysis).toHaveProperty('demand')
    expect(result.analysis).toHaveProperty('pricing')
    expect(result.analysis).toHaveProperty('competition')
    expect(result.analysis).toHaveProperty('monopoly')
    expect(result.analysis).toHaveProperty('priceCollapse')
    expect(result.analysis).toHaveProperty('reviewDefect')
    expect(result.analysis).toHaveProperty('adDependency')
    expect(result.analysis).toHaveProperty('homogeneity')
    expect(result.analysis).toHaveProperty('survivalRate')
    
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.conclusion).toBeOneOf(['highly_recommended', 'recommended', 'neutral', 'not_recommended'])
  })
})
```

---

## 时间估算

- 阶段 1（架构准备）: 1-2 天
- 阶段 2（头部垄断度）: 2-3 天
- 阶段 3（价格带塌陷）: 2-3 天
- 阶段 4（评论缺陷）: 2-3 天
- 阶段 5（广告依赖）: 1-2 天
- 阶段 6（同质化）: 2-3 天
- 阶段 7（存活率）: 1-2 天
- 阶段 8（整合）: 2-3 天
- 阶段 9（前端）: 3-4 天

**总计**: 16-25 天（约 3-5 周）

---

## 优先级建议

### MVP（最小可行产品）- 1 周

实现最关键的 3 个高级维度：
1. ✅ 头部垄断度（最重要）
2. ✅ 价格带塌陷
3. ✅ 新品存活率

### 完整版 - 3-4 周

实现所有 9 个维度

---

## 下一步行动

1. **Review 这份文档**，确认评估规则和实施方案
2. **决定实施范围**：MVP 还是完整版
3. **准备数据**：确定使用真实 API 还是演示数据
4. **开始开发**：从头部垄断度分析器开始

需要我开始实施吗？
