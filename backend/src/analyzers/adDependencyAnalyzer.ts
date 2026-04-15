import { BaseAnalyzer } from './baseAnalyzer'
import { DimensionAnalysis, ExtendedProductInfo } from '../types'
import { getCategoryConfig } from '../data/categoryData'

export class AdDependencyAnalyzer extends BaseAnalyzer {
  get name(): string { return 'adDependency' }

  analyze(productInfo: ExtendedProductInfo): DimensionAnalysis {
    const { category, salesRank, categoryData } = productInfo
    const categoryConfig = getCategoryConfig(category)

    let adDependency: number
    let avgCPC: number

    if (categoryData?.adMetrics) {
      adDependency = categoryData.adMetrics.adPositions / categoryData.adMetrics.totalPositions
      avgCPC = categoryData.adMetrics.avgCPC
    } else {
      adDependency = categoryConfig.adDependency
      avgCPC = categoryConfig.avgCPC
    }

    if (salesRank < 1000) adDependency = Math.min(1, adDependency * 1.2)
    else if (salesRank > 50000) adDependency = Math.max(0, adDependency * 0.8)

    const score = this.calculateScore(adDependency, avgCPC)
    const level = this.determineLevel(adDependency, avgCPC)
    const description = this.generateDescription(adDependency, avgCPC, level)
    const descriptionEn = this.generateDescriptionEn(adDependency, avgCPC, level)

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: {
        adDependency: `${Math.round(adDependency * 100)}%`,
        avgCPC: `$${avgCPC.toFixed(2)}`,
        estimatedMonthlyCost: `$${this.estimateMonthlyCost(avgCPC, salesRank)}`
      }
    }
  }

  private calculateScore(adDependency: number, avgCPC: number): number {
    let score = 100
    if (adDependency > 0.7) score -= 85
    else if (adDependency > 0.5) score -= 60
    else if (adDependency > 0.3) score -= 30
    else score -= 10
    if (avgCPC > 3.0) score -= 20
    else if (avgCPC > 1.5) score -= 10
    else if (avgCPC > 0.8) score -= 5
    return score
  }

  private determineLevel(adDependency: number, avgCPC: number): string {
    if (adDependency > 0.7 || avgCPC > 3.0) return 'critical'
    if (adDependency > 0.5 || avgCPC > 1.5) return 'high'
    if (adDependency > 0.3 || avgCPC > 0.8) return 'medium'
    return 'low'
  }

  private estimateMonthlyCost(avgCPC: number, salesRank: number): string {
    const clicks = salesRank < 1000 ? 3000 : salesRank < 5000 ? 1500 : salesRank < 20000 ? 800 : 300
    return (avgCPC * clicks).toFixed(0)
  }

  private generateDescription(adDependency: number, avgCPC: number, level: string): string {
    const d = Math.round(adDependency * 100)
    const c = avgCPC.toFixed(2)
    switch (level) {
      case 'critical': return `广告完全依赖(${d}%)，CPC高达$${c}，新卖家 = 给老卖家打工。没预算就别碰，这个类目需要持续烧钱才能维持销量`
      case 'high': return `广告高度依赖(${d}%)，CPC $${c}，前排几乎都是广告位，自然排名很弱。需要大量广告预算，现金流压力大`
      case 'medium': return `广告中度依赖(${d}%)，CPC $${c}，需要一定的广告投入才能获得曝光，但不是完全依赖广告`
      default: return `广告依赖度低(${d}%)，CPC $${c}，自然流量强，产品有较好的自然排名，广告成本可控，适合预算有限的卖家`
    }
  }

  private generateDescriptionEn(adDependency: number, avgCPC: number, level: string): string {
    const d = Math.round(adDependency * 100)
    const c = avgCPC.toFixed(2)
    switch (level) {
      case 'critical': return `Fully ad-dependent (${d}%), CPC $${c} — new sellers are essentially funding established ones. Don't enter without a big budget.`
      case 'high': return `Highly ad-dependent (${d}%), CPC $${c} — top spots are almost all ads, organic ranking is weak. Heavy ad spend required.`
      case 'medium': return `Moderately ad-dependent (${d}%), CPC $${c} — some ad investment needed for visibility, but not fully reliant on ads.`
      default: return `Low ad dependency (${d}%), CPC $${c} — strong organic traffic, good natural rankings, manageable ad costs. Suitable for budget-conscious sellers.`
    }
  }
}

export default new AdDependencyAnalyzer()
