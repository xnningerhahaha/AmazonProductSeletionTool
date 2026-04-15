# 数据来源分析文档

## 📋 概述

本文档详细说明系统中各个分析维度的数据来源、Amazon API 的能力和限制，以及当前的实现方案。

**最后更新**: 2026-02-05

---

## 🔍 当前实现状态

### 系统模式

系统支持两种模式：

| 模式 | 说明 | 数据来源 |
|------|------|----------|
| **演示模式** | 未配置 Amazon API | 模拟数据（随机生成） |
| **真实模式** | 已配置 Amazon API | Amazon Product Advertising API 5.0 |

**判断逻辑**: 检查环境变量 `AMAZON_ACCESS_KEY`、`AMAZON_SECRET_KEY`、`AMAZON_PARTNER_TAG` 是否配置

**实现文件**: `backend/src/services/amazonDataService.ts`

---

## 📊 Amazon Product Advertising API 5.0 能力分析

### API 可以直接提供的数据

| 数据项 | API 支持 | 获取方式 | 说明 |
|--------|----------|----------|------|
| ✅ ASIN | 是 | 直接获取 | 产品唯一标识 |
| ✅ 标题 | 是 | ItemInfo.Title | 产品标题 |
| ✅ 图片 | 是 | Images.Primary | 产品主图 |
| ✅ 价格 | 是 | Offers.Listings.Price | 当前售价 |
| ✅ 评分 | 是 | CustomerReviews.StarRating | 平均评分 |
| ✅ 评论数 | 是 | CustomerReviews.Count | 总评论数 |
| ✅ 销售排名 | 是 | BrowseNodeInfo.BrowseNodes.SalesRank | BSR 排名 |
| ✅ 类目 | 是 | BrowseNodeInfo.BrowseNodes | 产品类目 |
| ✅ 品牌 | 是 | ItemInfo.ByLineInfo.Brand | 品牌信息 |

**结论**: Amazon PA-API 5.0 可以提供**单个产品**的基础信息。

### API 无法直接提供的数据

| 数据项 | API 支持 | 原因 | 当前解决方案 |
|--------|----------|------|--------------|
| ❌ Top 10 产品列表 | 否 | API 不提供类目 Top 产品查询 | 需要爬虫或第三方服务 |
| ❌ 价格分布数据 | 否 | API 不提供类目价格统计 | 需要爬虫或第三方服务 |
| ❌ 评论详细内容 | 否 | PA-API 5.0 不提供评论文本 | 需要爬虫或 Amazon Review API |
| ❌ 缺陷关键词 | 否 | 需要分析评论文本 | 需要爬虫 + NLP 分析 |
| ❌ 广告位数据 | 否 | API 不提供广告相关数据 | 需要爬虫或 Amazon Advertising API |
| ❌ 新品数据 | 否 | API 不提供时间序列数据 | 需要爬虫或第三方服务 |
| ❌ 竞品列表 | 否 | API 不提供相关产品查询 | 需要爬虫或搜索 API |

**结论**: Amazon PA-API 5.0 **无法提供**高级分析所需的大部分数据。

---

## 🎯 各维度数据来源详解

### 1. 头部垄断度 (Monopoly)

**所需数据**: Top 10 产品的评论数

**Amazon API 能力**:
- ❌ **不支持** - PA-API 5.0 不提供类目 Top 产品查询
- ❌ **不支持** - 无法获取 Best Sellers 列表

**真实获取方案**:
1. **爬虫方案**: 爬取 Amazon Best Sellers 页面
   - URL: `https://www.amazon.com/Best-Sellers-{category}/zgbs/{category}`
   - 提取 Top 10 产品的 ASIN 和评论数
   - 需要处理反爬虫机制

2. **第三方服务**: 使用 Jungle Scout、Helium 10 等工具的 API
   - 提供类目 Top 产品数据
   - 需要付费订阅

**当前实现**:
```typescript
// 演示模式：生成模拟数据
private generateBalancedTopProducts(): any[] {
  const topProducts = []
  for (let i = 0; i < 10; i++) {
    topProducts.push({
      asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      reviewCount: Math.floor(2000 - i * 150),
      salesRank: (i + 1) * 500 + Math.floor(Math.random() * 200)
    })
  }
  return topProducts
}

// 真实模式：使用类目平均值估算
monopolyRate = categoryConfig.monopolyRate  // 0.5-0.7
```

---

### 2. 需求分析 (Demand)

**所需数据**: 销售排名 (BSR)

**Amazon API 能力**:
- ✅ **支持** - `BrowseNodeInfo.BrowseNodes.SalesRank`

**真实获取方案**:
```typescript
const browseNode = item.BrowseNodeInfo?.BrowseNodes?.[0]
const salesRank = browseNode?.SalesRank || 999999
```

**当前实现**: ✅ 完全支持

---

### 3. 价格分析 (Pricing)

**所需数据**: 产品价格

**Amazon API 能力**:
- ✅ **支持** - `Offers.Listings.Price`

**真实获取方案**:
```typescript
const offer = item.Offers?.Listings?.[0]
const price = offer?.Price?.Amount || 0
const currency = offer?.Price?.Currency || 'USD'
```

**当前实现**: ✅ 完全支持

---

### 4. 竞争分析 (Competition)

**所需数据**: 评论数量 + 评分

**Amazon API 能力**:
- ✅ **支持** - `CustomerReviews.Count` 和 `CustomerReviews.StarRating`

**真实获取方案**:
```typescript
const rating = item.CustomerReviews?.StarRating?.Value || 0
const reviewCount = item.CustomerReviews?.Count || 0
```

**当前实现**: ✅ 完全支持

---

### 5. 价格带塌陷 (Price Collapse)

**所需数据**: 类目内产品的价格分布

**Amazon API 能力**:
- ❌ **不支持** - PA-API 5.0 不提供类目价格统计

**真实获取方案**:
1. **爬虫方案**: 爬取类目搜索结果页面
   - 提取 20-50 个产品的价格
   - 计算价格区间和标准差

2. **第三方服务**: 使用 Keepa、CamelCamelCamel 等价格追踪服务
   - 提供历史价格和价格分布数据

**当前实现**:
```typescript
// 演示模式：生成模拟价格分布
private generateMockPriceDistribution(priceRange: [number, number]): number[] {
  const prices: number[] = []
  const [min, max] = priceRange
  for (let i = 0; i < 20; i++) {
    const randomFactor = (Math.random() + Math.random() + Math.random()) / 3
    const price = min + (max - min) * randomFactor
    prices.push(price)
  }
  return prices
}

// 真实模式：使用类目平均值估算
// 无法获取真实价格分布，只能基于单个产品价格估算
```

---

### 6. 评论缺陷 (Review Defect)

**所需数据**: 评论文本中的缺陷关键词

**Amazon API 能力**:
- ❌ **不支持** - PA-API 5.0 **不提供评论文本内容**
- ⚠️ **部分支持** - 只提供评分和总数

**真实获取方案**:
1. **爬虫方案**: 爬取产品评论页面
   - URL: `https://www.amazon.com/product-reviews/{ASIN}`
   - 提取评论文本
   - 使用 NLP 分析缺陷关键词

2. **Amazon Review API**: 使用 Amazon 的评论 API（需要特殊权限）

**当前实现**:
```typescript
// 演示模式：基于评分估算缺陷率
private estimateDefectsFromRating(rating: number): { defectRate: number } {
  if (rating >= 4.5) return { defectRate: 0.03 }
  else if (rating >= 4.0) return { defectRate: 0.08 }
  else if (rating >= 3.5) return { defectRate: 0.15 }
  else if (rating >= 3.0) return { defectRate: 0.25 }
  else return { defectRate: 0.40 }
}

// 真实模式：需要爬虫获取评论文本
// 当前无法实现真实的缺陷关键词分析
```

---

### 7. 广告依赖度 (Ad Dependency)

**所需数据**: 广告位占比 + 平均 CPC

**Amazon API 能力**:
- ❌ **不支持** - PA-API 5.0 不提供广告相关数据
- ⚠️ **需要其他 API** - Amazon Advertising API（需要卖家账号）

**真实获取方案**:
1. **爬虫方案**: 爬取搜索结果页面
   - 识别广告位（Sponsored 标签）
   - 统计广告位占比

2. **Amazon Advertising API**: 
   - 需要 Amazon Seller Central 账号
   - 可以获取 CPC、展示量等数据
   - 但只能获取自己的广告数据，无法获取竞品数据

**当前实现**:
```typescript
// 演示模式：使用类目平均值
adDependency = categoryConfig.adDependency  // 0.4-0.7
avgCPC = categoryConfig.avgCPC  // $0.6-$1.85

// 真实模式：无法获取真实广告数据
// 只能使用类目平均值估算
```

---

### 8. 同质化程度 (Homogeneity)

**所需数据**: 标题分析 + 价格集中度

**Amazon API 能力**:
- ✅ **部分支持** - 可以获取单个产品的标题和价格
- ❌ **不支持** - 无法获取竞品列表进行对比

**真实获取方案**:
1. **爬虫方案**: 爬取搜索结果页面
   - 提取 20-50 个相似产品
   - 分析标题相似度
   - 计算价格集中度

2. **NLP 分析**: 对标题进行文本分析
   - 提取关键词
   - 计算通用词汇占比

**当前实现**:
```typescript
// 演示模式：基于标题和类目平均值估算
private analyzeTitleHomogeneity(title: string): number {
  const genericWords = ['wireless', 'bluetooth', 'portable', ...]
  const lowerTitle = title.toLowerCase()
  const genericCount = genericWords.filter(word => lowerTitle.includes(word)).length
  return Math.min(1, genericCount / 5)
}

// 真实模式：只能分析单个产品标题
// 无法与竞品对比，准确度有限
```

---

### 9. 新品存活率 (Survival Rate)

**所需数据**: 近 12 个月新品数据

**Amazon API 能力**:
- ❌ **不支持** - PA-API 5.0 不提供产品上架时间
- ❌ **不支持** - 无法查询新品列表

**真实获取方案**:
1. **爬虫方案**: 定期爬取类目产品
   - 记录新出现的 ASIN
   - 追踪其评论数和排名变化
   - 需要长期数据积累

2. **第三方服务**: 使用 Jungle Scout、Helium 10 等
   - 提供新品追踪功能
   - 提供存活率统计

**当前实现**:
```typescript
// 演示模式：生成模拟新品数据
private generateMockNewProducts(): any[] {
  const newProducts = []
  const now = new Date()
  for (let i = 0; i < 50; i++) {
    const monthsAgo = Math.floor(Math.random() * 12)
    const launchDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    newProducts.push({
      asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      launchDate: launchDate.toISOString(),
      reviewCount: Math.floor(Math.random() * 100),
      salesRank: Math.floor(20000 + Math.random() * 80000)
    })
  }
  return newProducts
}

// 真实模式：使用类目平均值估算
survivalRate = categoryConfig.survivalRate  // 0.15-0.35
```

---

## 📈 数据获取能力总结

### Amazon PA-API 5.0 能提供的数据

| 维度 | 数据完整度 | 说明 |
|------|------------|------|
| 需求分析 | ✅ 100% | 销售排名完全支持 |
| 价格分析 | ✅ 100% | 价格完全支持 |
| 竞争分析 | ✅ 100% | 评论数和评分完全支持 |
| 同质化 | ⚠️ 30% | 只能分析单个产品标题 |
| 头部垄断度 | ❌ 0% | 无法获取 Top 10 数据 |
| 价格带塌陷 | ❌ 0% | 无法获取价格分布 |
| 评论缺陷 | ❌ 0% | 无法获取评论文本 |
| 广告依赖 | ❌ 0% | 无法获取广告数据 |
| 新品存活率 | ❌ 0% | 无法获取新品数据 |

**总体数据完整度**: 约 **33%**

### 需要额外数据源的维度

| 数据类型 | 获取方案 | 难度 | 成本 |
|----------|----------|------|------|
| Top 10 产品 | 爬虫 / 第三方服务 | 中 | 中-高 |
| 价格分布 | 爬虫 / 第三方服务 | 中 | 中 |
| 评论文本 | 爬虫 / Review API | 高 | 中-高 |
| 广告数据 | 爬虫 / Advertising API | 高 | 高 |
| 新品数据 | 长期追踪 / 第三方服务 | 高 | 高 |

---

## 🛠️ 实现方案建议

### 方案 1: 纯 Amazon PA-API（当前方案）

**优点**:
- 合法合规
- 稳定可靠
- 成本低（免费）

**缺点**:
- 数据完整度只有 33%
- 高级分析维度只能用估算值
- 分析准确度有限

**适用场景**: 
- MVP 阶段
- 演示和测试
- 预算有限

### 方案 2: PA-API + 爬虫

**优点**:
- 数据完整度可达 80-90%
- 分析准确度高
- 成本可控

**缺点**:
- 需要处理反爬虫
- 维护成本高
- 可能违反 Amazon TOS

**适用场景**:
- 正式产品
- 需要高准确度
- 有技术团队维护

### 方案 3: PA-API + 第三方服务

**优点**:
- 数据完整度可达 90-100%
- 合法合规
- 维护成本低

**缺点**:
- 成本高（$50-$200/月）
- 依赖第三方服务
- 数据更新可能有延迟

**适用场景**:
- 商业产品
- 预算充足
- 追求稳定性

**推荐服务**:
- Jungle Scout API
- Helium 10 API
- Keepa API
- DataHawk API

### 方案 4: 混合方案（推荐）

**实现策略**:
1. **基础数据**: 使用 Amazon PA-API
   - 需求分析（销售排名）
   - 价格分析（价格）
   - 竞争分析（评论数、评分）

2. **高级数据**: 使用第三方服务或爬虫
   - 头部垄断度（Top 10 数据）
   - 价格带塌陷（价格分布）
   - 评论缺陷（评论文本）

3. **估算数据**: 使用类目平均值
   - 广告依赖度
   - 新品存活率

**优点**:
- 平衡成本和准确度
- 灵活可扩展
- 风险分散

---

## 📝 当前系统的数据策略

### 演示模式（未配置 API）

所有数据都是**模拟生成**的：

```typescript
// 固定演示 ASIN (B0DEMO0001-B0DEMO0004)
// 返回精心设计的固定数据

// 其他 ASIN
// 返回随机生成的模拟数据
```

**用途**: 
- 系统演示
- 功能测试
- 用户体验评估

### 真实模式（已配置 API）

**可用数据**（33%）:
- ✅ 销售排名（需求分析）
- ✅ 价格（价格分析）
- ✅ 评论数和评分（竞争分析）
- ✅ 标题（同质化分析 - 部分）

**估算数据**（67%）:
- ⚠️ 头部垄断度（使用类目平均值）
- ⚠️ 价格带塌陷（基于单个产品价格估算）
- ⚠️ 评论缺陷（基于评分估算）
- ⚠️ 广告依赖度（使用类目平均值）
- ⚠️ 同质化（基于标题分析 - 部分）
- ⚠️ 新品存活率（使用类目平均值）

**准确度**: 
- 基础维度（33%）: 高准确度
- 高级维度（67%）: 中低准确度（基于估算）

---

## 🎯 改进路线图

### 短期（1-3个月）

1. **优化估算算法**
   - 改进基于评分的缺陷率估算
   - 优化类目平均值的准确度
   - 添加更多类目配置

2. **增加数据验证**
   - 对比估算值和真实值（如果有）
   - 调整估算公式

### 中期（3-6个月）

1. **集成第三方服务**
   - 评估 Jungle Scout、Helium 10 等服务
   - 集成 API 获取高级数据
   - 提升数据完整度到 80%+

2. **实现简单爬虫**
   - 爬取 Best Sellers 页面（Top 10）
   - 爬取搜索结果（价格分布）
   - 处理反爬虫机制

### 长期（6-12个月）

1. **建立数据库**
   - 长期追踪产品数据
   - 积累历史数据
   - 计算真实的新品存活率

2. **NLP 分析**
   - 爬取评论文本
   - 实现缺陷关键词提取
   - 情感分析

3. **机器学习**
   - 训练预测模型
   - 提高估算准确度
   - 个性化推荐

---

## 📚 相关文档

- [SCORING_RULES.md](./SCORING_RULES.md) - 评分规则详解
- [DEPLOYMENT.md](./DEPLOYMENT.md) - API 配置说明
- [INTEGRATION.md](./INTEGRATION.md) - 系统集成文档

---

**维护者**: 开发团队  
**最后更新**: 2026-02-05
