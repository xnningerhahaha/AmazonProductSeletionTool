import { Router, Request, Response } from 'express';
import amazonDataService from '../services/amazonDataService';
import { analyzeProduct } from '../services/analysisService';
import { AnalyzeRequest, AnalyzeResponse, ErrorCode } from '../types';
import { validateAsin, normalizeAsin } from '../utils/validators';

const router = Router();

/**
 * POST /api/analyze
 * 分析指定ASIN的产品
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { asin } = req.body as AnalyzeRequest;

    // 验证ASIN格式
    if (!validateAsin(asin)) {
      const response: AnalyzeResponse = {
        success: false,
        error: {
          code: ErrorCode.INVALID_ASIN,
          message: 'ASIN格式无效。ASIN必须是10位字母数字组合。'
        }
      };
      res.status(400).json(response);
      return;
    }

    // 标准化ASIN（转大写并去除空格）
    const normalizedAsin = normalizeAsin(asin);
    
    console.log(`Starting analysis for ASIN: ${normalizedAsin}`);

    // 调用数据获取服务
    const productInfo = await amazonDataService.getProductInfo(normalizedAsin);
    
    // 调用分析服务
    const analysis = analyzeProduct(productInfo);
    
    console.log(`Analysis completed for ASIN: ${normalizedAsin} - ${analysis.conclusion}`);

    // 返回格式化的响应
    const response: AnalyzeResponse = {
      success: true,
      data: {
        productInfo,
        analysis
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error in analyze route:', error);
    
    // 处理不同类型的错误
    let statusCode = 500;
    let errorCode = ErrorCode.SERVER_ERROR;
    let errorMessage = '服务器内部错误，请稍后重试。';

    // 根据错误代码设置响应
    if (error.code) {
      switch (error.code) {
        case ErrorCode.PRODUCT_NOT_FOUND:
          statusCode = 404;
          errorCode = ErrorCode.PRODUCT_NOT_FOUND;
          errorMessage = '未找到该产品，请检查ASIN是否正确。';
          break;
        case ErrorCode.API_ERROR:
          statusCode = 502;
          errorCode = ErrorCode.API_ERROR;
          errorMessage = '亚马逊API调用失败，请稍后重试。';
          break;
        case ErrorCode.RATE_LIMIT:
          statusCode = 429;
          errorCode = ErrorCode.RATE_LIMIT;
          errorMessage = 'API调用频率超限，请稍后重试。';
          break;
        case ErrorCode.INVALID_ASIN:
          statusCode = 400;
          errorCode = ErrorCode.INVALID_ASIN;
          errorMessage = 'ASIN格式无效。';
          break;
      }
    }

    const response: AnalyzeResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    };

    res.status(statusCode).json(response);
  }
});

export default router;
