/**
 * 类目基础数据配置
 * 用于高级分析维度的评估
 */

export interface CategoryConfig {
  avgPrice: number;           // 平均价格
  priceRange: [number, number]; // 价格区间
  monopolyRate: number;       // 头部垄断率 (0-1)
  survivalRate: number;       // 新品存活率 (0-1)
  adDependency: number;       // 广告依赖度 (0-1)
  avgCPC: number;             // 平均 CPC
  homogeneity: number;        // 同质化程度 (0-1)
  defectRate: number;         // 平均缺陷率 (0-1)
}

export const categoryData: Record<string, CategoryConfig> = {
  'Electronics': {
    avgPrice: 35.99,
    priceRange: [10, 200],
    monopolyRate: 0.65,
    survivalRate: 0.15,
    adDependency: 0.70,
    avgCPC: 1.85,
    homogeneity: 0.75,
    defectRate: 0.12
  },
  
  'Home & Kitchen': {
    avgPrice: 24.99,
    priceRange: [5, 100],
    monopolyRate: 0.45,
    survivalRate: 0.28,
    adDependency: 0.45,
    avgCPC: 0.95,
    homogeneity: 0.60,
    defectRate: 0.08
  },
  
  'Sports & Outdoors': {
    avgPrice: 32.50,
    priceRange: [8, 150],
    monopolyRate: 0.50,
    survivalRate: 0.25,
    adDependency: 0.55,
    avgCPC: 1.20,
    homogeneity: 0.65,
    defectRate: 0.10
  },
  
  'Toys & Games': {
    avgPrice: 19.99,
    priceRange: [5, 80],
    monopolyRate: 0.55,
    survivalRate: 0.20,
    adDependency: 0.60,
    avgCPC: 1.40,
    homogeneity: 0.70,
    defectRate: 0.15
  },
  
  'Beauty & Personal Care': {
    avgPrice: 18.99,
    priceRange: [5, 60],
    monopolyRate: 0.60,
    survivalRate: 0.18,
    adDependency: 0.65,
    avgCPC: 1.60,
    homogeneity: 0.80,
    defectRate: 0.09
  },
  
  'Clothing, Shoes & Jewelry': {
    avgPrice: 22.99,
    priceRange: [8, 100],
    monopolyRate: 0.40,
    survivalRate: 0.30,
    adDependency: 0.50,
    avgCPC: 0.85,
    homogeneity: 0.85,
    defectRate: 0.11
  },
  
  'Books': {
    avgPrice: 14.99,
    priceRange: [5, 40],
    monopolyRate: 0.35,
    survivalRate: 0.35,
    adDependency: 0.40,
    avgCPC: 0.60,
    homogeneity: 0.50,
    defectRate: 0.05
  },
  
  'Pet Supplies': {
    avgPrice: 21.99,
    priceRange: [6, 80],
    monopolyRate: 0.48,
    survivalRate: 0.26,
    adDependency: 0.52,
    avgCPC: 1.10,
    homogeneity: 0.68,
    defectRate: 0.10
  },
  
  'Office Products': {
    avgPrice: 16.99,
    priceRange: [5, 70],
    monopolyRate: 0.52,
    survivalRate: 0.22,
    adDependency: 0.58,
    avgCPC: 1.25,
    homogeneity: 0.72,
    defectRate: 0.08
  },
  
  'Automotive': {
    avgPrice: 28.99,
    priceRange: [8, 120],
    monopolyRate: 0.58,
    survivalRate: 0.20,
    adDependency: 0.62,
    avgCPC: 1.50,
    homogeneity: 0.70,
    defectRate: 0.13
  },
  
  // 默认配置（未知类目）
  'Unknown': {
    avgPrice: 25.00,
    priceRange: [10, 100],
    monopolyRate: 0.50,
    survivalRate: 0.25,
    adDependency: 0.55,
    avgCPC: 1.20,
    homogeneity: 0.65,
    defectRate: 0.10
  }
}

/**
 * 获取类目配置
 * @param category 类目名称
 * @returns 类目配置
 */
export function getCategoryConfig(category: string): CategoryConfig {
  return categoryData[category] || categoryData['Unknown']
}

/**
 * 负面关键词列表
 * 用于评论缺陷分析
 */
export const defectKeywords = {
  quality: ['break', 'broke', 'broken', 'cheap', 'flimsy', 'poor quality', 'low quality', 'terrible quality'],
  function: ['doesn\'t work', 'not working', 'stopped working', 'defective', 'malfunction', 'failed', 'useless'],
  durability: ['leak', 'leaking', 'fall apart', 'wear out', 'tear', 'rip', 'crack'],
  safety: ['dangerous', 'unsafe', 'fire hazard', 'smell', 'toxic', 'burn'],
  delivery: ['damaged', 'missing parts', 'wrong item', 'incomplete', 'broken on arrival']
}

/**
 * 分析权重配置
 */
export const analysisWeights = {
  demand: 0.15,           // 需求分析 15%
  pricing: 0.10,          // 价格分析 10%
  competition: 0.10,      // 竞争分析 10%
  monopoly: 0.25,         // 头部垄断度 25% (最重要)
  priceCollapse: 0.10,    // 价格带塌陷 10%
  reviewDefect: 0.10,     // 评论缺陷 10%
  adDependency: 0.08,     // 广告依赖 8%
  homogeneity: 0.07,      // 同质化 7%
  survivalRate: 0.05      // 存活率 5%
}
