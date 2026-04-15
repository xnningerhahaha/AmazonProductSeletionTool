# Amazon 产品选品分析 - 评分规则文档

## 📋 文档说明

本文档详细记录了 Amazon 产品选品分析系统的所有评分规则和判定逻辑。

**重要**：每次修改评分规则时，必须同步更新本文档。

**最后更新**: 2026-02-05

---

## ⚠️ 重要说明：数据来源

### 当前系统的数据完整度

系统使用 **Amazon Product Advertising API 5.0**，但该 API 的能力有限：

| 数据类型 | API 支持 | 准确度 | 说明 |
|----------|----------|--------|------|
| ✅ 销售排名 | 完全支持 | 高 | 需求分析 |
| ✅ 价格 | 完全支持 | 高 | 价格分析 |
| ✅ 评论数/评分 | 完全支持 | 高 | 竞争分析 |
| ⚠️ 标题 | 部分支持 | 中 | 同质化分析（仅单个产品） |
| ❌ Top 10 数据 | 不支持 | 低 | 头部垄断度（使用估算） |
| ❌ 价格分布 | 不支持 | 低 | 价格带塌陷（使用估算） |
| ❌ 评论文本 | 不支持 | 低 | 评论缺陷（基于评分估算） |
| ❌ 广告数据 | 不支持 | 低 | 广告依赖（使用估算） |
| ❌ 新品数据 | 不支持 | 低 | 新品存活率（使用估算） |

**总体数据完整度**: 约 **33%** 来自真实 API，**67%** 基于估算

### 系统模式

- **演示模式**（未配置 API）：所有数据都是模拟生成
- **真实模式**（已配置 API）：33% 真实数据 + 67% 估算数据

### 提升数据准确度的方案

要获取完整的真实数据，需要：
1. **爬虫方案**：爬取 Amazon 页面（可能违反 TOS）
2. **第三方服务**：使用 Jungle Scout、Helium 10 等（$50-$200/月）
3. **长期追踪**：建立自己的数据库（需要时间积累）

详见：[DATA_SOURCE_ANALYSIS.md](./DATA_SOURCE_ANALYSIS.md)

---

## 🎯 综合评分体系

### 权重配置

9个维度的权重分配（总计100%）：

| 维度 | 权重 | 说明 |
|------|------|------|
| 头部垄断度 | 25% | 最重要的维度 |
| 需求分析 | 15% | 市场需求评估 |
| 价格分析 | 10% | 利润空间评估 |
| 竞争分析 | 10% | 竞争激烈程度 |
| 价格带塌陷 | 10% | 价格竞争程度 |
| 评论缺陷 | 10% | 产品质量问题 |
| 广告依赖 | 8% | 广告成本评估 |
| 同质化 | 7% | 产品差异化程度 |
| 新品存活率 | 5% | 新品成功概率 |

**配置文件**: `backend/src/data/categoryData.ts`

```typescript
export const analysisWeights = {
  demand: 0.15,
  pricing: 0.10,
  competition: 0.10,
  monopoly: 0.25,
  priceCollapse: 0.10,
  reviewDefect: 0.10,
  adDependency: 0.08,
  homogeneity: 0.07,
  survivalRate: 0.05
}
```

### 综合评分计算

```
综合评分 = Σ(各维度评分 × 对应权重)
```

**实现文件**: `backend/src/services/analysisService.ts`

---

## 🏆 最终结论判定

### 判定规则

| 结论 | 条件 | 说明 |
|------|------|------|
| ✅ 强烈推荐 | 综合评分 ≥ 75 **且** 头部垄断度 ≥ 60 | 优质选品机会 |
| 👍 推荐 | 综合评分 ≥ 60 **且** 头部垄断度 ≥ 40 | 有一定机会 |
| ⚠️ 谨慎做 | 综合评分 ≥ 45 | 风险和收益并存 |
| ❌ 不推荐 | 综合评分 < 45 **或** 触发一票否决 | 不建议进入 |

**实现代码**:
```typescript
function determineConclusion(overallScore: number, monopolyScore: number) {
  if (overallScore >= 75 && monopolyScore >= 60) {
    return 'highly_recommended'
  } else if (overallScore >= 60 && monopolyScore >= 40) {
    return 'recommended'
  } else if (overallScore >= 45) {
    return 'neutral'
  } else {
    return 'not_recommended'
  }
}
```

### 一票否决机制

以下情况会触发一票否决，直接判定为"不推荐"，且综合评分强制降至39分以下：

| 触发条件 | 说明 |
|----------|------|
| 头部垄断度 < 20分 | 市场已被少数卖家垄断 |
| 价格带塌陷 < 20分 | 价格带已塌陷，无利润空间 |
| 新品存活率 < 15分 | 新品死亡率极高（尸横遍野） |
| 评论缺陷 < 25分 **且** level='critical' | 产品存在严重质量问题 |

**实现文件**: `backend/src/services/analysisService.ts`

---

## 📊 各维度评分规则

### 1. 头部垄断度 (Monopoly) - 权重 25%

**第一性原理**: 如果销量已经被少数人吃完了，后来者只能靠烧钱和运气

**数据来源**: Top 10 产品的评论数占比 / categoryData.monopolyRate

**API 支持**: ❌ Amazon PA-API 5.0 **不支持**
- 无法获取类目 Top 10 产品列表
- 需要爬虫或第三方服务（Jungle Scout、Helium 10）

**当前实现**:
- 优先使用 `categoryData.monopolyRate`（如果明确提供）
- 其次从 Top 10 产品评论数计算（`top10ReviewSum / estimatedTotal`）
- 最后使用类目平均垄断率估算（准确度：低）

**评分规则**:

| 垄断率 | 评分范围 | 风险等级 | 说明 |
|--------|----------|----------|------|
| < 40% | 80-100分 | low | 市场分散，机会大 |
| 40-60% | 40-79分 | high | 中度集中，高风险 |
| > 60% | 0-39分 | critical | 强烈排雷，已被垄断 |

**计算公式**:
```typescript
if (monopolyRate > 0.6) {
  score = 20 - (monopolyRate - 0.6) * 50  // 0-39分
} else if (monopolyRate > 0.4) {
  score = 80 - (monopolyRate - 0.4) * 200  // 40-79分
} else {
  score = 80 + (0.4 - monopolyRate) * 50  // 80-100分
}
```

**实现文件**: `backend/src/analyzers/monopolyAnalyzer.ts`

---

### 2. 需求分析 (Demand) - 权重 15%

**数据来源**: 销售排名 (BSR - Best Sellers Rank)

**API 支持**: ✅ Amazon PA-API 5.0 **完全支持**
- `BrowseNodeInfo.BrowseNodes.SalesRank`

**当前实现**:
- 演示模式：使用模拟排名
- 真实模式：从 API 获取真实排名（准确度：高）

**评分规则**:

| 销售排名 | 评分 | 风险等级 | 说明 |
|----------|------|----------|------|
| < 10,000 | 90分 | low | 需求旺盛，不愁卖 |
| 10,000-50,000 | 65分 | medium | 需求适中，每天有人买 |
| 50,000-100,000 | 40分 | high | 需求较低，卖得慢 |
| > 100,000 | 20分 | critical | 需求很低，积压库存 |

**实现文件**: `backend/src/analyzers/demandAnalyzer.ts`

---

### 3. 价格分析 (Pricing) - 权重 10%

**数据来源**: 产品价格

**API 支持**: ✅ Amazon PA-API 5.0 **完全支持**
- `Offers.Listings.Price`

**当前实现**:
- 演示模式：使用模拟价格
- 真实模式：从 API 获取真实价格（准确度：高）

**评分规则**:

| 价格区间 | 评分 | 利润率估算 | 说明 |
|----------|------|------------|------|
| < $15 | 40分 | 40-60% | 利润空间有限，靠走量 |
| $15-$50 | 70分 | 40-60% | 利润适中，不多不少 |
| $50-$100 | 85分 | 40-60% | 利润可观，卖一个顶几个 |
| > $100 | 75分 | 40-60% | 利润高但压资金 |

**利润率计算**:
```
预估成本 = 价格 × (40%-60%)
利润率 = (价格 - 成本) / 价格 × 100%
```

**实现文件**: `backend/src/analyzers/priceAnalyzer.ts`

---

### 4. 竞争分析 (Competition) - 权重 10%

**数据来源**: 评论数量 + 评分

**API 支持**: ✅ Amazon PA-API 5.0 **完全支持**
- `CustomerReviews.Count` (评论数)
- `CustomerReviews.StarRating` (评分)

**当前实现**:
- 演示模式：使用模拟数据
- 真实模式：从 API 获取真实数据（准确度：高）

**评分规则**:

| 评论数 | 评分基础 | 评分调整（基于评分） |
|--------|----------|---------------------|
| < 100 | +50分 | 评分<3.5: +40分<br>评分3.5-4.5: +25分<br>评分>4.5: +10分 |
| 100-1000 | +30分 | 同上 |
| > 1000 | +10分 | 同上 |

**风险等级**:
- low: 评论 < 100
- medium: 评论 100-1000
- high: 评论 > 1000

**实现文件**: `backend/src/analyzers/competitionAnalyzer.ts`

---

### 5. 价格带塌陷 (Price Collapse) - 权重 10%

**第一性原理**: 当产品没有价格锚点，竞争就会变成"谁活得更惨"

**数据来源**: 价格分布数据

**API 支持**: ❌ Amazon PA-API 5.0 **不支持**
- 无法获取类目价格分布统计
- 需要爬虫或第三方服务（Keepa、CamelCamelCamel）

**当前实现**:
- 演示模式：生成模拟价格分布
- 真实模式：基于单个产品价格估算（准确度：低）

**评分规则**:

| 价格区间 | 评分范围 | 风险等级 | 说明 |
|----------|----------|----------|------|
| > $10 | 80-100分 | low | 价格分散，有溢价空间 |
| $5-$10 | 50-79分 | medium | 价格较集中 |
| $2-$5 | 20-49分 | high | 价格高度集中 |
| < $2 | 0-19分 | critical | 价格带塌陷，排雷 |

**计算逻辑**:
```typescript
let score = 50

// 价格区间越大，分数越高
if (priceRange > 10) score += 40
else if (priceRange > 5) score += 25
else if (priceRange > 2) score += 10
else score -= 30

// 集中度越低，分数越高
if (concentration < 0.3) score += 10
else if (concentration > 0.6) score -= 20

// 标准差越大，分数越高
if (priceStd > 5) score += 10
else if (priceStd < 2) score -= 10
```

**实现文件**: `backend/src/analyzers/priceCollapseAnalyzer.ts`

---

### 6. 评论缺陷 (Review Defect) - 权重 10%

**第一性原理**: 重复出现的问题，最终一定会被放大

**数据来源**: 评论中的缺陷关键词

**API 支持**: ❌ Amazon PA-API 5.0 **不支持**
- PA-API 5.0 不提供评论文本内容
- 需要爬虫或 Amazon Review API

**当前实现**:
- 演示模式：生成模拟缺陷数据
- 真实模式：基于评分估算缺陷率（准确度：中低）

**评分规则**:

| 缺陷率 | 缺陷种类 | 评分范围 | 风险等级 | 说明 |
|--------|----------|----------|----------|------|
| < 5% | 0-1种 | 80-100分 | low | 产品质量稳定 |
| 5-10% | 1-2种 | 60-79分 | medium | 轻微缺陷，可改进 |
| 10-20% | 3-5种 | 30-59分 | high | 中度缺陷，高风险 |
| > 20% | >5种 | 0-29分 | critical | 严重缺陷，排雷 |

**计算逻辑**:
```typescript
let score = 90

// 根据缺陷率扣分
if (defectRate > 0.20) score -= 70
else if (defectRate > 0.10) score -= 50
else if (defectRate > 0.05) score -= 25
else score -= 5

// 根据缺陷种类数扣分
score -= defectCount * 5

// 根据评分调整
if (rating < 3.5) score -= 20
else if (rating < 4.0) score -= 10
```

**缺陷关键词分类**:
- quality: break, broke, broken, cheap, flimsy, poor quality
- function: doesn't work, not working, stopped working, defective
- durability: leak, leaking, fall apart, wear out, tear, rip
- safety: dangerous, unsafe, fire hazard, smell, toxic
- delivery: damaged, missing parts, wrong item, incomplete

**实现文件**: `backend/src/analyzers/reviewDefectAnalyzer.ts`

---

### 7. 广告依赖度 (Ad Dependency) - 权重 8%

**第一性原理**: 靠广告活着的产品，本质是"买销量"

**数据来源**: 广告位占比 + 平均CPC

**API 支持**: ❌ Amazon PA-API 5.0 **不支持**
- 无法获取广告相关数据
- 需要爬虫或 Amazon Advertising API（仅限自己的广告）

**当前实现**:
- 演示模式：生成模拟广告数据
- 真实模式：使用类目平均值估算（准确度：低）

**评分规则**:

| 广告依赖度 | 评分范围 | 风险等级 | 说明 |
|------------|----------|----------|------|
| < 30% | 80-100分 | low | 自然流量强 |
| 30-50% | 50-79分 | medium | 中度依赖 |
| 50-70% | 20-49分 | high | 高度依赖 |
| > 70% | 0-19分 | critical | 完全依赖，排雷 |

**计算逻辑**:
```typescript
let score = 100

// 根据广告依赖度扣分
if (adDependency > 0.7) score -= 85
else if (adDependency > 0.5) score -= 60
else if (adDependency > 0.3) score -= 30
else score -= 10

// 根据CPC成本扣分
if (avgCPC > 3.0) score -= 20
else if (avgCPC > 1.5) score -= 10
else if (avgCPC > 0.8) score -= 5
```

**月度广告成本估算**:
```typescript
// 根据销售排名估算每月点击量
if (salesRank < 1000) monthlyClicks = 3000
else if (salesRank < 5000) monthlyClicks = 1500
else if (salesRank < 20000) monthlyClicks = 800
else monthlyClicks = 300

monthlyCost = avgCPC × monthlyClicks
```

**实现文件**: `backend/src/analyzers/adDependencyAnalyzer.ts`

---

### 8. 同质化程度 (Homogeneity) - 权重 7%

**第一性原理**: 当你说不出"为什么是你"，平台也说不出

**数据来源**: 标题分析 + 价格集中度

**API 支持**: ⚠️ Amazon PA-API 5.0 **部分支持**
- 可获取单个产品标题和价格
- 无法获取竞品列表进行对比

**当前实现**:
- 演示模式：生成模拟同质化数据
- 真实模式：分析单个产品标题 + 类目平均值（准确度：中）

**评分规则**:

| 同质化程度 | 评分范围 | 风险等级 | 说明 |
|------------|----------|----------|------|
| < 40% | 80-100分 | low | 差异化明显 |
| 40-60% | 60-79分 | medium | 轻微同质化 |
| 60-80% | 30-59分 | high | 中度同质化 |
| > 80% | 0-29分 | critical | 严重同质化，排雷 |

**计算逻辑**:
```typescript
// 同质化越低，分数越高
if (homogeneity < 0.4) {
  score = 90 - homogeneity * 25
} else if (homogeneity < 0.6) {
  score = 70 - (homogeneity - 0.4) * 100
} else if (homogeneity < 0.8) {
  score = 50 - (homogeneity - 0.6) * 100
} else {
  score = 30 - (homogeneity - 0.8) * 100
}
```

**通用词汇列表** (用于判断标题同质化):
- wireless, bluetooth, portable, rechargeable, waterproof
- premium, professional, high quality, durable, lightweight
- compact, adjustable, universal, multi-function, upgraded

**实现文件**: `backend/src/analyzers/homogeneityAnalyzer.ts`

---

### 9. 新品存活率 (Survival Rate) - 权重 5%

**第一性原理**: 真正危险的品，是"很多人尝试，但没人活下来"

**数据来源**: 近12个月新品数据

**API 支持**: ❌ Amazon PA-API 5.0 **不支持**
- 无法获取产品上架时间
- 无法查询新品列表
- 需要长期追踪或第三方服务（Jungle Scout、Helium 10）

**当前实现**:
- 演示模式：生成模拟新品数据
- 真实模式：使用类目平均存活率估算（准确度：低）

**评分规则**:

| 存活率 | 评分范围 | 风险等级 | 说明 |
|--------|----------|----------|------|
| > 30% | 80-100分 | low | 新品有机会 |
| 20-30% | 60-79分 | medium | 中等难度 |
| 10-20% | 30-59分 | high | 高难度 |
| < 10% | 0-29分 | critical | 尸横遍野，排雷 |

**成功标准**:
- 销售排名 < 50,000 **或**
- 评论数 > 50

**计算逻辑**:
```typescript
// 根据存活率计算基础分数
if (survivalRate > 0.3) {
  score = 80 + (survivalRate - 0.3) * 50
} else if (survivalRate > 0.2) {
  score = 60 + (survivalRate - 0.2) * 200
} else if (survivalRate > 0.1) {
  score = 30 + (survivalRate - 0.1) * 300
} else {
  score = survivalRate * 300
}

// 根据当前产品排名调整
if (salesRank < 10000) score += 10
else if (salesRank > 100000) score -= 10
```

**实现文件**: `backend/src/analyzers/survivalRateAnalyzer.ts`

---

## 🎨 风险等级定义

所有维度使用统一的风险等级体系：

| 等级 | 英文标识 | 说明 | 颜色标识 |
|------|----------|------|----------|
| 低风险 | low | 指标良好，风险可控 | 绿色 |
| 中等风险 | medium | 有一定风险，需要注意 | 黄色 |
| 高风险 | high | 风险较大，需要谨慎 | 橙色 |
| 极高风险 | critical | 风险极高，强烈不建议 | 红色 |

---

## 📝 修改记录

### 2026-02-05
- 创建初始版本
- 记录所有9个维度的评分规则
- 记录综合评分和结论判定逻辑
- 记录一票否决机制
- **添加数据来源说明**：为每个维度标注 API 支持情况和准确度
- **添加数据完整度总览**：说明当前系统的数据来源限制
- 创建配套文档 `DATA_SOURCE_ANALYSIS.md`

---

## 🔧 如何修改规则

### 修改步骤

1. **修改代码**
   - 修改对应分析器文件 (`backend/src/analyzers/*.ts`)
   - 或修改权重配置 (`backend/src/data/categoryData.ts`)
   - 或修改结论判定逻辑 (`backend/src/services/analysisService.ts`)

2. **更新本文档**
   - 在对应章节更新评分规则
   - 更新计算公式和代码示例
   - 在"修改记录"中添加变更说明

3. **测试验证**
   - 使用演示 ASIN 测试 (B0DEMO0001-B0DEMO0004)
   - 确保评分结果符合预期
   - 更新 ASIN_EXAMPLES.md 中的预期结果

### 相关文件

| 文件 | 说明 |
|------|------|
| `SCORING_RULES.md` | 本文档 - 评分规则总览 |
| `backend/src/analyzers/*.ts` | 各维度分析器实现 |
| `backend/src/services/analysisService.ts` | 综合评分和结论判定 |
| `backend/src/data/categoryData.ts` | 权重配置和类目数据 |
| `ASIN_EXAMPLES.md` | 演示 ASIN 和预期结果 |

---

## 📚 参考资料

- [需求文档](./kiro/specs/amazon-product-analyzer/requirements.md)
- [设计文档](./.kiro/specs/amazon-product-analyzer/design.md)
- [高级分析规则](./ADVANCED_ANALYSIS_RULES.md)
- [演示 ASIN 说明](./ASIN_EXAMPLES.md)

---

**维护者**: 开发团队  
**联系方式**: 通过 GitHub Issues 反馈问题
