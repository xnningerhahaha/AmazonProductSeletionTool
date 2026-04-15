// Product Information Types
export interface ProductInfo {
  asin: string;              // ASIN码
  title: string;             // 产品标题
  imageUrl: string;          // 主图URL
  price: number;             // 价格
  currency: string;          // 货币单位
  rating: number;            // 评分 (0-5)
  reviewCount: number;       // 评论数量
  salesRank: number;         // 销售排名
  category: string;          // 产品类目
}

// Extended Product Information with Category Data
export interface ExtendedProductInfo extends ProductInfo {
  categoryData?: CategoryData;
  reviewAnalysis?: ReviewAnalysis;
}

// Category Data for Advanced Analysis
export interface CategoryData {
  topProducts: TopProduct[];
  priceDistribution: number[];
  newProducts: NewProduct[];
  adMetrics: AdMetrics;
  avgPrice: number;
  monopolyRate: number;
  survivalRate: number;
  homogeneity: number;
}

export interface TopProduct {
  asin: string;
  reviewCount: number;
  salesRank: number;
}

export interface NewProduct {
  asin: string;
  launchDate: string;
  reviewCount: number;
  salesRank: number;
}

export interface AdMetrics {
  adPositions: number;
  totalPositions: number;
  avgCPC: number;
}

export interface ReviewAnalysis {
  defectKeywords: Record<string, number>;
  totalReviews: number;
  defectRate: number;
}

// Analysis Result Types
export interface DimensionAnalysis {
  score: number;              // 维度评分 (0-100)
  level: string;              // 等级描述 (low/medium/high/critical)
  profitMargin?: string;      // 利润率（仅价格维度）
  description: string;        // 详细说明（中文）
  descriptionEn?: string;     // 详细说明（英文）
  details?: Record<string, any>; // 额外详情
}

export interface AnalysisResult {
  conclusion: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
  overallScore: number;
  dimensions: {
    demand: DimensionAnalysis;
    pricing: DimensionAnalysis;
    competition: DimensionAnalysis;
    monopoly: DimensionAnalysis;
    priceCollapse: DimensionAnalysis;
    reviewDefect: DimensionAnalysis;
    adDependency: DimensionAnalysis;
    homogeneity: DimensionAnalysis;
    survivalRate: DimensionAnalysis;
  };
  warnings?: string[];
  warningsEn?: string[];
  recommendations?: string[];
  recommendationsEn?: string[];
}

// API Request Types
export interface AnalyzeRequest {
  asin: string;
}

// API Response Types
export interface AnalyzeResponseData {
  productInfo: ProductInfo;
  analysis: AnalysisResult;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalyzeResponseData;
  error?: ErrorResponse;
}

// Error Types
export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}

export enum ErrorCode {
  INVALID_ASIN = 'INVALID_ASIN',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR'
}
