import crypto from 'node:crypto';
import { ProductInfo, ExtendedProductInfo, ErrorCode } from '../types';

interface AmazonAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
  host: string;
}

interface AmazonAPIResponse {
  ItemsResult?: {
    Items?: Array<{
      ASIN: string;
      ItemInfo?: {
        Title?: { DisplayValue: string };
        ByLineInfo?: {
          Brand?: { DisplayValue: string };
        };
      };
      Images?: {
        Primary?: {
          Large?: { URL: string };
        };
      };
      Offers?: {
        Listings?: Array<{
          Price?: {
            Amount: number;
            Currency: string;
          };
        }>;
      };
      BrowseNodeInfo?: {
        BrowseNodes?: Array<{
          SalesRank?: number;
          ContextFreeName?: string;
        }>;
      };
      CustomerReviews?: {
        StarRating?: { Value: number };
        Count?: number;
      };
    }>;
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

class AmazonDataService {
  private config: AmazonAPIConfig;
  private readonly SERVICE = 'ProductAdvertisingAPI';

  constructor() {
    this.config = {
      accessKey: process.env.AMAZON_ACCESS_KEY || '',
      secretKey: process.env.AMAZON_SECRET_KEY || '',
      partnerTag: process.env.AMAZON_PARTNER_TAG || '',
      region: process.env.AMAZON_REGION || 'us-east-1',
      host: process.env.AMAZON_API_HOST || 'webservices.amazon.com'
    };
  }

  /**
   * 获取产品信息（带重试机制）
   * @param asin 产品ASIN码
   * @param retries 重试次数，默认3次
   * @returns ExtendedProductInfo对象
   */
  async getProductInfo(asin: string, retries: number = 3): Promise<ExtendedProductInfo> {
    // 验证配置
    if (!this.config.accessKey || !this.config.secretKey || !this.config.partnerTag) {
      console.warn('Amazon API credentials not configured, using mock data');
      return this.getMockProductInfo(asin);
    }

    let lastError: any;
    
    // 重试机制
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Fetching product data for ASIN: ${asin} (attempt ${attempt}/${retries})`);
        const response = await this.makeAPIRequest(asin);
        const productInfo = this.parseAPIResponse(response, asin);
        console.log(`Successfully fetched product data for ASIN: ${asin}`);
        return productInfo;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        // 如果是产品未找到或配置错误，不重试
        const errorCode = (error as any).code;
        if (errorCode === ErrorCode.PRODUCT_NOT_FOUND || errorCode === ErrorCode.INVALID_ASIN) {
          throw this.handleAPIError(error);
        }
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最多5秒
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // 所有重试都失败
    console.error(`All ${retries} attempts failed for ASIN: ${asin}`);
    throw this.handleAPIError(lastError);
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 发起Amazon PA-API请求
   */
  private async makeAPIRequest(asin: string): Promise<AmazonAPIResponse> {
    const endpoint = `https://${this.config.host}/paapi5/getitems`;
    const payload = {
      ItemIds: [asin],
      PartnerTag: this.config.partnerTag,
      PartnerType: 'Associates',
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'Offers.Listings.Price',
        'BrowseNodeInfo.BrowseNodes',
        'BrowseNodeInfo.BrowseNodes.SalesRank',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ]
    };

    const headers = this.generateAuthHeaders('POST', endpoint, JSON.stringify(payload));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed with status ${response.status}:`, errorText);
        
        if (response.status === 429) {
          const err = new Error('Rate limit exceeded') as any;
          err.code = ErrorCode.RATE_LIMIT;
          throw err;
        }
        
        if (response.status === 404) {
          const err = new Error('Product not found') as any;
          err.code = ErrorCode.PRODUCT_NOT_FOUND;
          throw err;
        }
        
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json() as AmazonAPIResponse
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        const err = new Error('Request timeout') as any;
        err.code = ErrorCode.API_ERROR;
        throw err;
      }
      throw error;
    }
  }

  /**
   * 生成AWS签名v4认证头
   */
  private generateAuthHeaders(method: string, url: string, payload: string): Record<string, string> {
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substring(0, 8);
    
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname;

    // 创建规范请求
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${timestamp}\n`;
    const signedHeaders = 'content-type;host;x-amz-date';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    // 创建待签名字符串
    const credentialScope = `${date}/${this.config.region}/${this.SERVICE}/aws4_request`;
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${canonicalRequestHash}`;
    
    // 计算签名
    const signature = this.calculateSignature(date, stringToSign);
    
    // 构建授权头
    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': host,
      'X-Amz-Date': timestamp,
      'Authorization': authorizationHeader
    };
  }

  /**
   * 计算AWS签名
   */
  private calculateSignature(date: string, stringToSign: string): string {
    const kDate = crypto.createHmac('sha256', `AWS4${this.config.secretKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.config.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(this.SERVICE).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
    return signature;
  }

  /**
   * 解析API响应
   */
  private parseAPIResponse(response: AmazonAPIResponse, asin: string): ProductInfo {
    // 检查错误
    if (response.Errors && response.Errors.length > 0) {
      const error = response.Errors[0];
      console.error(`Amazon API returned error: ${error.Code} - ${error.Message}`);
      
      if (error.Code === 'ItemNotAccessible' || error.Code === 'InvalidParameterValue') {
        const err = new Error('Product not found') as any;
        err.code = ErrorCode.PRODUCT_NOT_FOUND;
        throw err;
      }
      
      throw new Error(`Amazon API Error: ${error.Code} - ${error.Message}`);
    }

    // 检查是否有结果
    const items = response.ItemsResult?.Items;
    if (!items || items.length === 0) {
      const err = new Error('Product not found') as any;
      err.code = ErrorCode.PRODUCT_NOT_FOUND;
      throw err;
    }

    const item = items[0];

    // 提取产品信息（带默认值处理）
    const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
    const imageUrl = item.Images?.Primary?.Large?.URL || '';
    
    const offer = item.Offers?.Listings?.[0];
    const price = offer?.Price?.Amount || 0;
    const currency = offer?.Price?.Currency || 'USD';

    // 评分可能是小数，需要处理
    const ratingValue = item.CustomerReviews?.StarRating?.Value || 0;
    const rating = typeof ratingValue === 'number' ? ratingValue : parseFloat(String(ratingValue)) || 0;
    const reviewCount = item.CustomerReviews?.Count || 0;

    // 销售排名和类目信息
    const browseNode = item.BrowseNodeInfo?.BrowseNodes?.[0];
    const salesRank = browseNode?.SalesRank || 999999;
    const category = browseNode?.ContextFreeName || 'Unknown';

    // 验证必要字段
    if (!title || title === 'Unknown Product') {
      console.warn(`Product ${asin} has no title, using default`);
    }

    return {
      asin,
      title,
      imageUrl,
      price,
      currency,
      rating,
      reviewCount,
      salesRank,
      category
    };
  }

  /**
   * 处理API错误
   */
  private handleAPIError(error: any): Error {
    const errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('PRODUCT_NOT_FOUND')) {
      const err = new Error('Product not found') as any;
      err.code = ErrorCode.PRODUCT_NOT_FOUND;
      return err;
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('throttle')) {
      const err = new Error('API rate limit exceeded') as any;
      err.code = ErrorCode.RATE_LIMIT;
      return err;
    }
    
    const err = new Error('Amazon API error: ' + errorMessage) as any;
    err.code = ErrorCode.API_ERROR;
    return err;
  }

  /**
   * 获取模拟数据（用于开发和测试）
   */
  private getMockProductInfo(asin: string): any {
    // 固定的演示样例 - 每个对应一种结论
    const demoASINs: Record<string, any> = {
      // 1. 强烈推荐 - B0DEMO0001
      'B0DEMO0001': {
        asin: 'B0DEMO0001',
        title: '演示产品 - 强烈推荐样例',
        imageUrl: 'https://via.placeholder.com/500x500.png?text=Highly+Recommended',
        price: 35.99,
        currency: 'USD',
        rating: 4.3,
        reviewCount: 350,   // 低评论数 → 竞争分更高
        salesRank: 1500,    // 排名低 → 需求分高
        category: 'Electronics',
        categoryData: {
          topProducts: this.generateBalancedTopProducts(),
          priceDistribution: this.generateHealthyPriceDistribution(35.99),
          newProducts: this.generateSuccessfulNewProducts(),
          adMetrics: {
            adPositions: 5,
            totalPositions: 20,
            avgCPC: 0.65
          },
          avgPrice: 38.50,
          monopolyRate: 0.20,   // 低垄断率 → 垄断分高
          survivalRate: 0.50,
          homogeneity: 0.25     // 低同质化 → 同质化分高
        },
        reviewAnalysis: {
          defectKeywords: {
            'issue': 1
          },
          totalReviews: 350,
          defectRate: 0.003
        }
      },
      
      // 2. 推荐 - B0DEMO0002
      'B0DEMO0002': {
        asin: 'B0DEMO0002',
        title: '演示产品 - 推荐样例',
        imageUrl: 'https://via.placeholder.com/500x500.png?text=Recommended',
        price: 29.99,
        currency: 'USD',
        rating: 4.2,
        reviewCount: 850,
        salesRank: 15000,  // 需求中等
        category: 'Electronics',
        categoryData: {
          topProducts: this.generateModerateTopProducts(),  // 中度集中
          priceDistribution: this.generateModeratePriceDistribution(29.99),
          newProducts: this.generateAverageNewProducts(),
          adMetrics: {
            adPositions: 12,
            totalPositions: 20,
            avgCPC: 1.15
          },
          avgPrice: 32.50,
          monopolyRate: 0.45,  // 中度垄断
          survivalRate: 0.25,  // 中等存活率
          homogeneity: 0.65    // 中度同质化
        },
        reviewAnalysis: {
          defectKeywords: {
            'break': 8,
            'cheap': 6,
            'issue': 5
          },
          totalReviews: 850,
          defectRate: 0.035  // 中等缺陷率
        }
      },
      
      // 3. 谨慎做 - B0DEMO0003
      'B0DEMO0003': {
        asin: 'B0DEMO0003',
        title: '演示产品 - 谨慎做样例',
        imageUrl: 'https://via.placeholder.com/500x500.png?text=Neutral',
        price: 24.99,
        currency: 'USD',
        rating: 3.9,
        reviewCount: 650,
        salesRank: 35000,  // 需求一般
        category: 'Electronics',
        categoryData: {
          topProducts: this.generateConcentratedTopProducts(),  // 较高集中
          priceDistribution: this.generateCompressedPriceDistribution(24.99),
          newProducts: this.generateStrugglingNewProducts(),
          adMetrics: {
            adPositions: 15,
            totalPositions: 20,
            avgCPC: 1.45
          },
          avgPrice: 26.50,
          monopolyRate: 0.55,  // 中高垄断（调整后不触发否决）
          survivalRate: 0.15,  // 较低存活率
          homogeneity: 0.78    // 较高同质化
        },
        reviewAnalysis: {
          defectKeywords: {
            'break': 15,
            'cheap': 12,
            'doesn\'t work': 8,
            'poor quality': 6
          },
          totalReviews: 650,
          defectRate: 0.055  // 较高缺陷率
        }
      },
      
      // 4. 不推荐 - B0DEMO0004
      'B0DEMO0004': {
        asin: 'B0DEMO0004',
        title: '演示产品 - 不推荐样例',
        imageUrl: 'https://via.placeholder.com/500x500.png?text=Not+Recommended',
        price: 19.99,
        currency: 'USD',
        rating: 3.5,
        reviewCount: 450,
        salesRank: 85000,  // 需求低
        category: 'Electronics',
        categoryData: {
          topProducts: this.generateMonopolizedTopProducts(),  // 高度垄断
          priceDistribution: this.generateCollapsedPriceDistribution(19.99),
          newProducts: this.generateFailingNewProducts(),
          adMetrics: {
            adPositions: 18,
            totalPositions: 20,
            avgCPC: 1.85
          },
          avgPrice: 21.50,
          monopolyRate: 0.75,  // 极高垄断（触发否决）
          survivalRate: 0.05,  // 极低存活率
          homogeneity: 0.92    // 极高同质化
        },
        reviewAnalysis: {
          defectKeywords: {
            'break': 25,
            'terrible': 18,
            'doesn\'t work': 15,
            'waste of money': 12,
            'poor quality': 10
          },
          totalReviews: 450,
          defectRate: 0.095  // 高缺陷率
        }
      }
    };
    
    // 如果是演示 ASIN，返回固定数据
    if (demoASINs[asin]) {
      return demoASINs[asin];
    }
    
    // 其他 ASIN 返回随机模拟数据
    const mockData = {
      // 基础数据
      asin,
      title: 'Sample Product - Wireless Bluetooth Headphones',
      imageUrl: 'https://via.placeholder.com/500x500.png?text=Product+Image',
      price: 29.99,
      currency: 'USD',
      rating: 4.3,
      reviewCount: 856,
      salesRank: 12450,
      category: 'Electronics',
      
      // 扩展数据：类目数据
      categoryData: {
        // Top 10 产品数据
        topProducts: this.generateMockTopProducts(),
        
        // 价格分布数据
        priceDistribution: this.generateMockPriceDistribution(29.99),
        
        // 新品数据
        newProducts: this.generateMockNewProducts(),
        
        // 广告指标
        adMetrics: {
          adPositions: 14,
          totalPositions: 20,
          avgCPC: 1.25
        },
        
        avgPrice: 32.50,
        monopolyRate: 0.55,
        survivalRate: 0.18,
        homogeneity: 0.72
      },
      
      // 扩展数据：评论分析
      reviewAnalysis: {
        defectKeywords: {
          'break': 12,
          'cheap': 8,
          'doesn\'t work': 5,
          'leak': 3
        },
        totalReviews: 856,
        defectRate: 0.033  // 3.3%
      }
    }
    
    return mockData
  }
  
  /**
   * 生成模拟的 Top 10 产品数据
   */
  private generateMockTopProducts(): any[] {
    const topProducts = []
    
    for (let i = 0; i < 10; i++) {
      topProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        reviewCount: Math.floor(5000 - i * 400 + Math.random() * 200),
        salesRank: (i + 1) * 100 + Math.floor(Math.random() * 50)
      })
    }
    
    return topProducts
  }
  
  /**
   * 生成模拟的价格分布数据
   */
  private generateMockPriceDistribution(basePrice: number): number[] {
    const prices = []
    
    for (let i = 0; i < 30; i++) {
      // 生成围绕基础价格的正态分布
      const variance = basePrice * 0.3
      const price = basePrice + (Math.random() - 0.5) * 2 * variance
      prices.push(Math.max(10, price))
    }
    
    return prices
  }
  
  /**
   * 生成模拟的新品数据
   */
  private generateMockNewProducts(): any[] {
    const newProducts = []
    const now = new Date()
    
    for (let i = 0; i < 50; i++) {
      // 生成过去 12 个月内的新品
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
  
  // ========== 演示样例专用的数据生成方法 ==========
  
  /**
   * 生成市场分散的 Top 10 产品（强烈推荐）
   * 目标：monopoly rate < 35% to get monopoly score >= 70
   * 策略：创建非常平坦的分布，让top 10占比看起来很低
   */
  private generateBalancedTopProducts(): any[] {
    const topProducts = []
    // 创建极其平坦的分布，从800降到710，差异很小
    for (let i = 0; i < 10; i++) {
      topProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        reviewCount: Math.floor(800 - i * 10),  // 非常平坦的分布
        salesRank: (i + 1) * 500 + Math.floor(Math.random() * 200)
      })
    }
    return topProducts
  }
  
  /**
   * 生成中度集中的 Top 10 产品（推荐）
   */
  private generateModerateTopProducts(): any[] {
    const topProducts = []
    for (let i = 0; i < 10; i++) {
      topProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        reviewCount: i < 3 ? Math.floor(4000 - i * 500) : Math.floor(1500 - i * 100),
        salesRank: (i + 1) * 300 + Math.floor(Math.random() * 100)
      })
    }
    return topProducts
  }
  
  /**
   * 生成较高集中的 Top 10 产品（谨慎做）
   */
  private generateConcentratedTopProducts(): any[] {
    const topProducts = []
    for (let i = 0; i < 10; i++) {
      topProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        reviewCount: i < 3 ? Math.floor(6000 - i * 800) : Math.floor(800 - i * 50),
        salesRank: (i + 1) * 200 + Math.floor(Math.random() * 50)
      })
    }
    return topProducts
  }
  
  /**
   * 生成高度垄断的 Top 10 产品（不推荐）
   */
  private generateMonopolizedTopProducts(): any[] {
    const topProducts = []
    for (let i = 0; i < 10; i++) {
      topProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        reviewCount: i < 3 ? Math.floor(10000 - i * 1500) : Math.floor(500 - i * 30),
        salesRank: (i + 1) * 100 + Math.floor(Math.random() * 30)
      })
    }
    return topProducts
  }
  
  /**
   * 生成健康的价格分布（强烈推荐）
   */
  private generateHealthyPriceDistribution(basePrice: number): number[] {
    const prices = []
    for (let i = 0; i < 30; i++) {
      const variance = basePrice * 0.4
      const price = basePrice + (Math.random() - 0.5) * 2 * variance
      prices.push(Math.max(basePrice * 0.7, price))
    }
    return prices
  }
  
  /**
   * 生成中等的价格分布（推荐）
   */
  private generateModeratePriceDistribution(basePrice: number): number[] {
    const prices = []
    for (let i = 0; i < 30; i++) {
      const variance = basePrice * 0.25
      const price = basePrice + (Math.random() - 0.5) * 2 * variance
      prices.push(Math.max(basePrice * 0.8, price))
    }
    return prices
  }
  
  /**
   * 生成压缩的价格分布（谨慎做）
   */
  private generateCompressedPriceDistribution(basePrice: number): number[] {
    const prices = []
    for (let i = 0; i < 30; i++) {
      const variance = basePrice * 0.15
      const price = basePrice + (Math.random() - 0.5) * 2 * variance
      prices.push(Math.max(basePrice * 0.85, price))
    }
    return prices
  }
  
  /**
   * 生成塌陷的价格分布（不推荐）
   */
  private generateCollapsedPriceDistribution(basePrice: number): number[] {
    const prices = []
    for (let i = 0; i < 30; i++) {
      const variance = basePrice * 0.08
      const price = basePrice + (Math.random() - 0.5) * 2 * variance
      prices.push(Math.max(basePrice * 0.9, price))
    }
    return prices
  }
  
  /**
   * 生成成功的新品数据（强烈推荐）
   */
  private generateSuccessfulNewProducts(): any[] {
    const newProducts = []
    const now = new Date()
    for (let i = 0; i < 50; i++) {
      const monthsAgo = Math.floor(Math.random() * 12)
      const launchDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
      newProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        launchDate: launchDate.toISOString(),
        reviewCount: Math.floor(50 + Math.random() * 150),
        salesRank: Math.floor(5000 + Math.random() * 15000)
      })
    }
    return newProducts
  }
  
  /**
   * 生成中等的新品数据（推荐）
   */
  private generateAverageNewProducts(): any[] {
    const newProducts = []
    const now = new Date()
    for (let i = 0; i < 50; i++) {
      const monthsAgo = Math.floor(Math.random() * 12)
      const launchDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
      newProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        launchDate: launchDate.toISOString(),
        reviewCount: Math.floor(20 + Math.random() * 80),
        salesRank: Math.floor(15000 + Math.random() * 35000)
      })
    }
    return newProducts
  }
  
  /**
   * 生成挣扎的新品数据（谨慎做）
   */
  private generateStrugglingNewProducts(): any[] {
    const newProducts = []
    const now = new Date()
    for (let i = 0; i < 50; i++) {
      const monthsAgo = Math.floor(Math.random() * 12)
      const launchDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
      newProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        launchDate: launchDate.toISOString(),
        reviewCount: Math.floor(5 + Math.random() * 30),
        salesRank: Math.floor(40000 + Math.random() * 50000)
      })
    }
    return newProducts
  }
  
  /**
   * 生成失败的新品数据（不推荐）
   */
  private generateFailingNewProducts(): any[] {
    const newProducts = []
    const now = new Date()
    for (let i = 0; i < 50; i++) {
      const monthsAgo = Math.floor(Math.random() * 12)
      const launchDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
      newProducts.push({
        asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        launchDate: launchDate.toISOString(),
        reviewCount: Math.floor(Math.random() * 15),
        salesRank: Math.floor(80000 + Math.random() * 100000)
      })
    }
    return newProducts
  }
}

export default new AmazonDataService();
