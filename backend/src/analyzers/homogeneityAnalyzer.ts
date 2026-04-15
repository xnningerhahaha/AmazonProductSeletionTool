import { BaseAnalyzer } from './baseAnalyzer'
import { DimensionAnalysis, ExtendedProductInfo } from '../types'
import { getCategoryConfig } from '../data/categoryData'

export class HomogeneityAnalyzer extends BaseAnalyzer {
  get name(): string { return 'homogeneity' }

  analyze(productInfo: ExtendedProductInfo): DimensionAnalysis {
    const { title, price, category, categoryData } = productInfo
    const categoryConfig = getCategoryConfig(category)

    const homogeneity = categoryData
      ? this.calculateHomogeneity(title, price, categoryData)
      : categoryConfig.homogeneity

    const score = this.calculateScore(homogeneity)
    const level = this.determineLevel(homogeneity)
    const description = this.generateDescription(homogeneity, level, category)
    const descriptionEn = this.generateDescriptionEn(homogeneity, level, category)

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: {
        homogeneity: `${Math.round(homogeneity * 100)}%`,
        category,
        differentiationPotential: this.getDifferentiationPotential(homogeneity)
      }
    }
  }

  private calculateHomogeneity(title: string, price: number, categoryData: any): number {
    let homogeneity = 0.5
    if (categoryData.priceDistribution?.length > 0) {
      homogeneity += this.calculatePriceConcentration(price, categoryData.priceDistribution) * 0.3
    }
    homogeneity += this.analyzeTitleHomogeneity(title) * 0.4
    homogeneity += categoryData.homogeneity * 0.3
    return Math.min(1, Math.max(0, homogeneity))
  }

  private calculatePriceConcentration(currentPrice: number, priceDistribution: number[]): number {
    if (priceDistribution.length === 0) return 0.5
    const lower = currentPrice * 0.85
    const upper = currentPrice * 1.15
    return priceDistribution.filter(p => p >= lower && p <= upper).length / priceDistribution.length
  }

  private analyzeTitleHomogeneity(title: string): number {
    const genericWords = ['wireless', 'bluetooth', 'portable', 'rechargeable', 'waterproof',
      'premium', 'professional', 'high quality', 'durable', 'lightweight',
      'compact', 'adjustable', 'universal', 'multi-function', 'upgraded']
    const lowerTitle = title.toLowerCase()
    return Math.min(1, genericWords.filter(w => lowerTitle.includes(w)).length / 5)
  }

  private calculateScore(homogeneity: number): number {
    if (homogeneity < 0.4) return 90 - homogeneity * 25
    if (homogeneity < 0.6) return 70 - (homogeneity - 0.4) * 100
    if (homogeneity < 0.8) return 50 - (homogeneity - 0.6) * 100
    return 30 - (homogeneity - 0.8) * 100
  }

  private determineLevel(homogeneity: number): string {
    if (homogeneity > 0.8) return 'critical'
    if (homogeneity > 0.6) return 'high'
    if (homogeneity > 0.4) return 'medium'
    return 'low'
  }

  private getDifferentiationPotential(homogeneity: number): string {
    if (homogeneity > 0.8) return '极低 - 市场已饱和'
    if (homogeneity > 0.6) return '较低 - 需要创新'
    if (homogeneity > 0.4) return '中等 - 有改进空间'
    return '较高 - 可深耕细分'
  }

  private generateDescription(homogeneity: number, level: string, category: string): string {
    const pct = Math.round(homogeneity * 100)
    switch (level) {
      case 'critical': return `严重同质化(${pct}%)，产品高度雷同，图片、文案、功能几乎一致。不是你不会做，是根本没位置给你。只能拼价格和广告，强烈不建议`
      case 'high': return `中度同质化(${pct}%)，${category}类目竞争激烈，产品差异化不明显。需要找到独特卖点或细分市场，否则很难突围`
      case 'medium': return `轻微同质化(${pct}%)，市场有一定竞争，但仍有差异化空间。可以通过产品改进、包装升级、服务优化等方式建立竞争优势`
      default: return `差异化明显(${pct}%)，产品有独特卖点或定位，在${category}类目中有明显区分度。可以通过强化差异化优势获得市场份额`
    }
  }

  private generateDescriptionEn(homogeneity: number, level: string, category: string): string {
    const pct = Math.round(homogeneity * 100)
    switch (level) {
      case 'critical': return `Severe homogeneity (${pct}%) — products are nearly identical in images, copy, and features. No room for you. Only price and ad wars. Strongly not recommended.`
      case 'high': return `Moderate homogeneity (${pct}%) — ${category} is highly competitive with little differentiation. Need a unique angle or niche to break through.`
      case 'medium': return `Mild homogeneity (${pct}%) — some competition, but differentiation is still possible through product improvements, packaging, or service.`
      default: return `Clear differentiation (${pct}%) — product has a unique angle in ${category}. Strengthen your differentiators to capture market share.`
    }
  }
}

export default new HomogeneityAnalyzer()
