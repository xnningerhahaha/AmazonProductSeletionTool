import { BaseAnalyzer } from './baseAnalyzer'
import { DimensionAnalysis, ExtendedProductInfo } from '../types'
import { getCategoryConfig } from '../data/categoryData'

/**
 * 头部垄断度分析器
 * 
 * 第一性原理：如果销量已经被少数人吃完了，后来者只能靠烧钱和运气
 * 
 * 评分规则：
 * - Top 10 占比 < 40%: 80-100 分 (市场分散，机会大)
 * - Top 10 占比 40-60%: 40-79 分 (中度集中，高风险)
 * - Top 10 占比 > 60%: 0-39 分 (强烈排雷，已被垄断)
 */
export class MonopolyAnalyzer extends BaseAnalyzer {
  get name(): string {
    return 'monopoly'
  }

  analyze(productInfo: ExtendedProductInfo): DimensionAnalysis {
    const { category, categoryData } = productInfo

    // 获取类目配置
    const categoryConfig = getCategoryConfig(category)

    // 计算头部垄断率
    let monopolyRate: number

    if (categoryData?.monopolyRate !== undefined && categoryData.monopolyRate > 0) {
      // 优先使用明确提供的垄断率数据
      monopolyRate = categoryData.monopolyRate
    } else if (categoryData?.topProducts && categoryData.topProducts.length > 0) {
      // 否则从 Top 10 产品数据计算
      monopolyRate = this.calculateMonopolyRate(categoryData.topProducts)
    } else {
      // 最后使用类目平均数据
      monopolyRate = categoryConfig.monopolyRate
    }

    // 计算分数
    const score = this.calculateScore(monopolyRate)

    // 确定等级
    const level = this.determineLevel(monopolyRate)

    // 生成描述
    const description = this.generateDescription(monopolyRate, level)

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn: level === 'critical'
        ? `Severe market monopoly (${Math.round(monopolyRate * 100)}%) — market is saturated by a few sellers. New entrants can only compete by burning cash. Strongly not recommended.`
        : level === 'high'
        ? `High market concentration (${Math.round(monopolyRate * 100)}%) — top 10 sellers dominate most of the market. Hard to break through without strong resources and differentiation.`
        : level === 'medium'
        ? `Moderate market concentration (${Math.round(monopolyRate * 100)}%) — top sellers have an edge, but differentiation and refined operations can still win market share.`
        : `Fragmented market (${Math.round(monopolyRate * 100)}%) — no dominant players, good entry opportunity for new sellers.`,
      details: {
        monopolyRate: Math.round(monopolyRate * 100),
        top10Share: `${Math.round(monopolyRate * 100)}%`
      }
    }
  }

  /**
   * 计算头部垄断率
   * @param topProducts Top 10 产品列表
   * @returns 垄断率 (0-1)
   */
  private calculateMonopolyRate(topProducts: any[]): number {
    if (topProducts.length === 0) return 0.5

    // 使用评论数作为销量代理指标
    const top10ReviewSum = topProducts
      .slice(0, 10)
      .reduce((sum, product) => sum + (product.reviewCount || 0), 0)

    // 估算总市场评论数（假设 Top 10 + 其他产品）
    // 这里使用一个简化的估算：Top 10 通常占市场的 40-70%
    const estimatedTotalReviews = top10ReviewSum / 0.55 // 假设 Top 10 占 55%

    const monopolyRate = top10ReviewSum / estimatedTotalReviews

    return Math.min(1, Math.max(0, monopolyRate))
  }

  /**
   * 根据垄断率计算分数
   * @param monopolyRate 垄断率 (0-1)
   * @returns 分数 (0-100)
   */
  private calculateScore(monopolyRate: number): number {
    if (monopolyRate > 0.6) {
      // 强烈排雷：0-39 分
      return 20 - (monopolyRate - 0.6) * 50
    } else if (monopolyRate > 0.4) {
      // 高风险：40-79 分
      return 80 - (monopolyRate - 0.4) * 200
    } else {
      // 可继续看：80-100 分
      return 80 + (0.4 - monopolyRate) * 50
    }
  }

  /**
   * 确定风险等级
   * @param monopolyRate 垄断率 (0-1)
   * @returns 等级
   */
  private determineLevel(monopolyRate: number): string {
    if (monopolyRate > 0.6) return 'critical'  // 极高风险
    if (monopolyRate > 0.4) return 'high'      // 高风险
    if (monopolyRate > 0.25) return 'medium'   // 中等风险
    return 'low'                                // 低风险
  }

  /**
   * 生成描述文本
   * @param monopolyRate 垄断率
   * @param level 等级
   * @returns 描述文本
   */
  private generateDescription(monopolyRate: number, level: string): string {
    const percentage = Math.round(monopolyRate * 100)

    switch (level) {
      case 'critical':
        return `头部垄断严重(${percentage}%)，这个品不是没人做，是已经被做死了。后来者只能靠烧钱和运气，强烈不建议进入`
      
      case 'high':
        return `头部集中度较高(${percentage}%)，前 10 名卖家吃掉了大部分市场份额，新手很难突围，需要强大的资源和差异化策略`
      
      case 'medium':
        return `市场集中度适中(${percentage}%)，头部卖家有一定优势，但仍有机会通过差异化和精细化运营获得市场份额`
      
      case 'low':
      default:
        return `市场相对分散(${percentage}%)，没有明显的垄断者，新卖家有较好的进入机会，适合尝试`
    }
  }
}

export default new MonopolyAnalyzer()
