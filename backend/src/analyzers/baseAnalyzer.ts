import { DimensionAnalysis, ExtendedProductInfo } from '../types'

/**
 * 基础分析器抽象类
 * 所有分析器都应继承此类
 */
export abstract class BaseAnalyzer {
  /**
   * 分析器名称
   */
  abstract get name(): string

  /**
   * 执行分析
   * @param productInfo 产品信息
   * @returns 分析结果
   */
  abstract analyze(productInfo: ExtendedProductInfo): DimensionAnalysis

  /**
   * 根据分数确定等级
   * @param score 分数 (0-100)
   * @returns 等级 (low/medium/high/critical)
   */
  protected getLevel(score: number): string {
    if (score >= 80) return 'low'      // 低风险
    if (score >= 60) return 'medium'   // 中等风险
    if (score >= 40) return 'high'     // 高风险
    return 'critical'                   // 极高风险
  }

  /**
   * 限制分数在 0-100 范围内
   * @param score 原始分数
   * @returns 限制后的分数
   */
  protected clampScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * 计算标准差
   * @param values 数值数组
   * @returns 标准差
   */
  protected calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    
    return Math.sqrt(variance)
  }

  /**
   * 计算百分位数
   * @param values 数值数组
   * @param percentile 百分位 (0-100)
   * @returns 百分位数值
   */
  protected calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    
    return sorted[Math.max(0, index)]
  }
}
