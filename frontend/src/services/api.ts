import { AnalyzeRequest, AnalyzeResponse } from '../types';

// API基础URL配置 - 优先读取环境变量，fallback到生产域名
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.amazonai.online';

export const DEMO_DATA: AnalyzeResponse = {
  success: true,
  data: {
    productInfo: {
      asin: 'B08N5WRWNW',
      title: 'SanDisk 128GB Ultra microSDXC UHS-I Memory Card',
      imageUrl: 'https://via.placeholder.com/500x500.png?text=SanDisk+128GB',
      price: 29.99,
      currency: 'USD',
      rating: 4.7,
      reviewCount: 220603,
      salesRank: 3,
      category: 'Electronics',
    },
    analysis: {
      conclusion: 'recommended',
      overallScore: 72,
      dimensions: {
        demand: { score: 90, level: 'high', description: '销售排名极高，市场需求旺盛', descriptionEn: 'Very high sales rank, strong market demand' },
        pricing: { score: 65, level: 'medium', profitMargin: '35%', description: '价格适中，利润空间合理', descriptionEn: 'Moderate price with reasonable margin' },
        competition: { score: 55, level: 'medium', description: '竞争较激烈，需要差异化策略', descriptionEn: 'Competitive market, differentiation needed' },
        monopoly: { score: 60, level: 'medium', description: '头部垄断度中等', descriptionEn: 'Moderate top-seller concentration' },
        priceCollapse: { score: 70, level: 'medium', description: '价格较稳定', descriptionEn: 'Prices relatively stable' },
        reviewDefect: { score: 80, level: 'low', description: '产品质量良好，缺陷率低', descriptionEn: 'Good product quality, low defect rate' },
        adDependency: { score: 65, level: 'medium', description: '广告依赖度中等', descriptionEn: 'Moderate ad dependency' },
        homogeneity: { score: 55, level: 'medium', description: '同质化程度较高', descriptionEn: 'High product homogeneity' },
        survivalRate: { score: 45, level: 'medium', description: '新品存活率一般', descriptionEn: 'Average new product survival rate' },
      },
      warnings: ['竞争激烈，建议差异化切入'],
      recommendations: ['建议从细分品类切入', '重点优化产品图片和标题'],
    },
  },
};

/**
 * API错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 缓存管理器
 */
class CacheManager {
  private cache: Map<string, { data: AnalyzeResponse; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  set(key: string, data: AnalyzeResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): AnalyzeResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cacheManager = new CacheManager();

/**
 * 分析产品
 * @param asin - 产品ASIN码
 * @param useCache - 是否使用缓存，默认为true
 * @returns 分析结果
 */
export async function analyzeProduct(asin: string, useCache: boolean = true): Promise<AnalyzeResponse> {
  // 检查缓存
  if (useCache) {
    const cached = cacheManager.get(asin);
    if (cached) {
      console.log('Using cached data for ASIN:', asin);
      return cached;
    }
  }

  try {
    const requestBody: AnalyzeRequest = { asin };
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: AnalyzeResponse = await response.json();

    // 如果响应不成功，抛出错误
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error?.message || '请求失败',
        data.error?.code || 'UNKNOWN_ERROR',
        response.status
      );
    }

    // 缓存成功的响应
    if (useCache && data.success) {
      cacheManager.set(asin, data);
    }

    return data;
  } catch (error) {
    // 处理网络错误或其他异常
    if (error instanceof ApiError) {
      throw error;
    }

    // 网络错误或其他未知错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        '无法连接到服务器，请检查网络连接或稍后重试',
        'NETWORK_ERROR'
      );
    }

    throw new ApiError(
      '发生未知错误，请稍后重试',
      'UNKNOWN_ERROR'
    );
  }
}

/**
/**
 * 记录付费意向点击
 */
export async function recordUpgradeClick(asin: string, language: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/stats/upgrade-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin, language }),
    })
  } catch {
    // 静默失败，不影响用户体验
  }
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  cacheManager.clear();
}

/**
 * 健康检查
 * @returns 服务器状态
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    throw new ApiError(
      '无法连接到服务器',
      'NETWORK_ERROR'
    );
  }
}
