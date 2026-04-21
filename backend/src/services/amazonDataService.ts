import { ExtendedProductInfo, ErrorCode } from '../types/index.js';

const RAINFOREST_API_KEY = process.env.RAINFOREST_API_KEY || '';
const RAINFOREST_BASE = 'https://api.rainforestapi.com/request';

class AmazonDataService {
  async getProductInfo(asin: string): Promise<ExtendedProductInfo> {
    if (!RAINFOREST_API_KEY) {
      console.warn('RAINFOREST_API_KEY not configured, using mock data');
      return this.getMockData(asin);
    }

    try {
      // 并行请求：产品详情 + 搜索结果（竞品数据）
      const [productRes, searchRes] = await Promise.all([
        fetch(`${RAINFOREST_BASE}?api_key=${RAINFOREST_API_KEY}&type=product&asin=${asin}&amazon_domain=amazon.com`),
        fetch(`${RAINFOREST_BASE}?api_key=${RAINFOREST_API_KEY}&type=search&search_term=${asin}&amazon_domain=amazon.com`)
      ]);

      const [productData, searchData] = await Promise.all([
        productRes.json() as Promise<any>,
        searchRes.json() as Promise<any>
      ]);

      if (!productData.product) {
        const err = new Error('Product not found') as any;
        err.code = ErrorCode.PRODUCT_NOT_FOUND;
        throw err;
      }

      return this.parseData(asin, productData.product, searchData.search_results || []);
    } catch (error: any) {
      if (error.code === ErrorCode.PRODUCT_NOT_FOUND) throw error;
      const err = new Error('API error: ' + error.message) as any;
      err.code = ErrorCode.API_ERROR;
      throw err;
    }
  }

  private parseData(asin: string, product: any, searchResults: any[]): ExtendedProductInfo {
    // 基础产品信息
    const price = product.buybox_winner?.price?.value || product.price?.value || 0;
    const bsr = product.bestsellers_rank?.[0];
    const salesRank = bsr?.rank || 999999;
    const category = bsr?.category || product.categories?.[0]?.name || 'Unknown';

    // 竞品数据（搜索结果前30个）
    const competitors = searchResults.slice(0, 30);
    const prices = competitors
      .map((r: any) => r.price?.value || r.prices?.[0]?.value)
      .filter((p: any) => p > 0) as number[];

    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : price;

    // 广告依赖
    const sponsored = competitors.filter((r: any) => r.is_sponsored).length;
    const adMetrics = {
      adPositions: sponsored,
      totalPositions: competitors.length || 20,
      avgCPC: 1.0 // Rainforest 不提供 CPC，用默认值
    };

    // Top 10 产品（按评论数排序）
    const topProducts = competitors
      .filter((r: any) => r.ratings_total > 0)
      .sort((a: any, b: any) => (b.ratings_total || 0) - (a.ratings_total || 0))
      .slice(0, 10)
      .map((r: any, i: number) => ({
        asin: r.asin,
        reviewCount: r.ratings_total || 0,
        salesRank: (i + 1) * 200
      }));

    // 垄断率：Top10评论数 / 总评论数
    const totalReviews = competitors.reduce((s: number, r: any) => s + (r.ratings_total || 0), 0);
    const top10Reviews = topProducts.reduce((s, r) => s + r.reviewCount, 0);
    const monopolyRate = totalReviews > 0 ? top10Reviews / totalReviews : 0.5;

    // 新品（评论数 < 100 的产品视为新品）
    const newProducts = competitors
      .filter((r: any) => r.ratings_total < 100 && r.ratings_total >= 0)
      .map((r: any, i: number) => ({
        asin: r.asin,
        launchDate: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
        reviewCount: r.ratings_total || 0,
        salesRank: 20000 + i * 1000
      }));

    // 评论缺陷分析（从产品评分估算）
    const rating = product.rating || 0;
    const defectRate = rating > 0 ? Math.max(0, (5 - rating) * 0.02) : 0.05;
    const reviewAnalysis = {
      defectKeywords: {} as Record<string, number>,
      totalReviews: product.ratings_total || 0,
      defectRate
    };

    return {
      asin,
      title: product.title || 'Unknown Product',
      imageUrl: product.main_image?.link || '',
      price,
      currency: 'USD',
      rating,
      reviewCount: product.ratings_total || 0,
      salesRank,
      category,
      categoryData: {
        topProducts,
        priceDistribution: prices,
        newProducts,
        adMetrics,
        avgPrice,
        monopolyRate,
        survivalRate: newProducts.length > 0
          ? newProducts.filter(p => p.reviewCount >= 10).length / newProducts.length
          : 0.3,
        homogeneity: adMetrics.adPositions / (adMetrics.totalPositions || 20)
      },
      reviewAnalysis
    };
  }

  private getMockData(asin: string): ExtendedProductInfo {
    return {
      asin,
      title: 'Sample Product',
      imageUrl: 'https://via.placeholder.com/500x500.png?text=Product+Image',
      price: 29.99,
      currency: 'USD',
      rating: 4.3,
      reviewCount: 856,
      salesRank: 12450,
      category: 'Electronics',
      categoryData: {
        topProducts: Array.from({ length: 10 }, (_, i) => ({
          asin: `B0MOCK${i}`,
          reviewCount: 5000 - i * 400,
          salesRank: (i + 1) * 100
        })),
        priceDistribution: Array.from({ length: 30 }, () => 20 + Math.random() * 20),
        newProducts: Array.from({ length: 20 }, (_, i) => ({
          asin: `B0NEW${i}`,
          launchDate: new Date(Date.now() - i * 30 * 24 * 3600 * 1000).toISOString(),
          reviewCount: Math.floor(Math.random() * 80),
          salesRank: 20000 + i * 2000
        })),
        adMetrics: { adPositions: 14, totalPositions: 20, avgCPC: 1.25 },
        avgPrice: 32.5,
        monopolyRate: 0.55,
        survivalRate: 0.18,
        homogeneity: 0.72
      },
      reviewAnalysis: {
        defectKeywords: { break: 12, cheap: 8 },
        totalReviews: 856,
        defectRate: 0.033
      }
    };
  }
}

export default new AmazonDataService();
