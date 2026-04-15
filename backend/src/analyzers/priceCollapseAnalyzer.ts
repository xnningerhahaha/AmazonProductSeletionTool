import { BaseAnalyzer } from './baseAnalyzer'
import { DimensionAnalysis, ExtendedProductInfo } from '../types'
import { getCategoryConfig } from '../data/categoryData'

export class PriceCollapseAnalyzer extends BaseAnalyzer {
  get name(): string { return 'priceCollapse' }

  analyze(productInfo: ExtendedProductInfo): DimensionAnalysis {
    const { price, category, categoryData } = productInfo
    const categoryConfig = getCategoryConfig(category)

    let priceDistribution: number[]
    if (categoryData?.priceDistribution && categoryData.priceDistribution.length > 0) {
      priceDistribution = categoryData.priceDistribution
    } else {
      priceDistribution = this.generateMockPriceDistribution(categoryConfig.priceRange)
    }

    const priceRange = Math.max(...priceDistribution) - Math.min(...priceDistribution)
    const priceStd = this.calculateStandardDeviation(priceDistribution)
    const concentration = this.calculatePriceConcentration(price, priceDistribution)
    const score = this.calculateScore(priceRange, priceStd, concentration)
    const level = this.determineLevel(priceRange, concentration)
    const description = this.generateDescription(priceRange, concentration, level)
    const descriptionEn = this.generateDescriptionEn(priceRange, concentration, level)
    const avgPrice = (priceDistribution.reduce((a, b) => a + b, 0) / priceDistribution.length).toFixed(2)

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: {
        priceRange: `$${priceRange.toFixed(2)}`,
        concentration: `${Math.round(concentration * 100)}%`,
        avgPrice: `$${avgPrice}`
      }
    }
  }

  private generateMockPriceDistribution(priceRange: [number, number]): number[] {
    const prices: number[] = []
    const [min, max] = priceRange
    for (let i = 0; i < 20; i++) {
      const randomFactor = (Math.random() + Math.random() + Math.random()) / 3
      prices.push(min + (max - min) * randomFactor)
    }
    return prices
  }

  private calculatePriceConcentration(currentPrice: number, priceDistribution: number[]): number {
    if (priceDistribution.length === 0) return 0.5
    const lowerBound = currentPrice * 0.9
    const upperBound = currentPrice * 1.1
    const countInRange = priceDistribution.filter(p => p >= lowerBound && p <= upperBound).length
    return countInRange / priceDistribution.length
  }

  private calculateScore(priceRange: number, priceStd: number, concentration: number): number {
    let score = 50
    if (priceRange > 10) score += 40
    else if (priceRange > 5) score += 25
    else if (priceRange > 2) score += 10
    else score -= 30
    if (concentration < 0.3) score += 10
    else if (concentration > 0.6) score -= 20
    if (priceStd > 5) score += 10
    else if (priceStd < 2) score -= 10
    return score
  }

  private determineLevel(priceRange: number, concentration: number): string {
    if (priceRange < 2 || concentration > 0.7) return 'critical'
    if (priceRange < 5 || concentration > 0.5) return 'high'
    if (priceRange < 10) return 'medium'
    return 'low'
  }

  private generateDescription(priceRange: number, concentration: number, level: string): string {
    const r = priceRange.toFixed(2)
    const c = Math.round(concentration * 100)
    switch (level) {
      case 'critical': return `价格带已塌陷(区间$${r}，集中度${c}%)，价格已经卷到没有利润空间，广告一开就亏，新人无退路，强烈不建议进入`
      case 'high': return `价格高度集中(区间$${r}，集中度${c}%)，竞争已经白热化，只能拼成本和广告，利润空间极小`
      case 'medium': return `价格较为集中(区间$${r}，集中度${c}%)，有一定价格竞争，但仍有差异化定价的空间`
      default: return `价格分散(区间$${r}，集中度${c}%)，市场有明显的价格梯度，存在溢价空间，可以通过差异化获得更高利润`
    }
  }

  private generateDescriptionEn(priceRange: number, concentration: number, level: string): string {
    const r = priceRange.toFixed(2)
    const c = Math.round(concentration * 100)
    switch (level) {
      case 'critical': return `Price collapse (range $${r}, concentration ${c}%) — no profit margin left, ads run at a loss. Strongly avoid.`
      case 'high': return `Highly concentrated pricing (range $${r}, concentration ${c}%) — race to the bottom, minimal profit margin.`
      case 'medium': return `Moderately concentrated pricing (range $${r}, concentration ${c}%) — some competition, but differentiated pricing is still possible.`
      default: return `Dispersed pricing (range $${r}, concentration ${c}%) — clear price tiers, premium pricing achievable through differentiation.`
    }
  }
}

export default new PriceCollapseAnalyzer()
