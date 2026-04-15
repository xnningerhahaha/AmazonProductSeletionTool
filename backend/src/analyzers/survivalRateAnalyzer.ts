import { BaseAnalyzer } from './baseAnalyzer'
import { DimensionAnalysis, ExtendedProductInfo } from '../types'
import { getCategoryConfig } from '../data/categoryData'

export class SurvivalRateAnalyzer extends BaseAnalyzer {
  get name(): string { return 'survivalRate' }

  analyze(productInfo: ExtendedProductInfo): DimensionAnalysis {
    const { category, salesRank, categoryData } = productInfo
    const categoryConfig = getCategoryConfig(category)

    let survivalRate: number
    let newProductCount: number
    let successfulCount: number

    if (categoryData?.newProducts && categoryData.newProducts.length > 0) {
      const analysis = this.analyzeSurvivalRate(categoryData.newProducts)
      survivalRate = analysis.survivalRate
      newProductCount = analysis.newProductCount
      successfulCount = analysis.successfulCount
    } else {
      survivalRate = categoryConfig.survivalRate
      newProductCount = this.estimateNewProductCount(category)
      successfulCount = Math.round(newProductCount * survivalRate)
    }

    const score = this.calculateScore(survivalRate, salesRank)
    const level = this.determineLevel(survivalRate)
    const description = this.generateDescription(survivalRate, newProductCount, successfulCount, level)
    const descriptionEn = this.generateDescriptionEn(survivalRate, newProductCount, successfulCount, level)

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: {
        survivalRate: `${Math.round(survivalRate * 100)}%`,
        newProductCount,
        successfulCount,
        failureRate: `${Math.round((1 - survivalRate) * 100)}%`
      }
    }
  }

  private analyzeSurvivalRate(newProducts: any[]) {
    const newProductCount = newProducts.length
    const successfulCount = newProducts.filter(p => p.salesRank < 50000 || p.reviewCount > 50).length
    const survivalRate = newProductCount > 0 ? successfulCount / newProductCount : 0.25
    return { survivalRate, newProductCount, successfulCount }
  }

  private estimateNewProductCount(category: string): number {
    const map: Record<string, number> = {
      'Electronics': 150, 'Home & Kitchen': 120, 'Clothing, Shoes & Jewelry': 200,
      'Beauty & Personal Care': 180, 'Toys & Games': 100, 'Sports & Outdoors': 90,
      'Pet Supplies': 80, 'Office Products': 70, 'Automotive': 85, 'Books': 60
    }
    return map[category] || 100
  }

  private calculateScore(survivalRate: number, salesRank: number): number {
    let score = survivalRate > 0.3 ? 80 + (survivalRate - 0.3) * 50
      : survivalRate > 0.2 ? 60 + (survivalRate - 0.2) * 200
      : survivalRate > 0.1 ? 30 + (survivalRate - 0.1) * 300
      : survivalRate * 300
    if (salesRank < 10000) score += 10
    else if (salesRank > 100000) score -= 10
    return score
  }

  private determineLevel(survivalRate: number): string {
    if (survivalRate < 0.1) return 'critical'
    if (survivalRate < 0.2) return 'high'
    if (survivalRate < 0.3) return 'medium'
    return 'low'
  }

  private generateDescription(survivalRate: number, newProductCount: number, successfulCount: number, level: string): string {
    const r = Math.round(survivalRate * 100)
    const f = Math.round((1 - survivalRate) * 100)
    switch (level) {
      case 'critical': return `这是"尸横遍野型类目"(存活率${r}%)，近期有${newProductCount}个新品尝试，但只有${successfulCount}个活下来。${f}%的新品死亡，很多人尝试但没人活下来，强烈不建议新手进入`
      case 'high': return `新品死亡率极高(存活率${r}%)，近期${newProductCount}个新品中仅${successfulCount}个成功。这个类目对新卖家非常不友好，需要强大的资源和经验`
      case 'medium': return `新品存活有一定难度(存活率${r}%)，近期${newProductCount}个新品中有${successfulCount}个获得成功。需要一定实力和策略才能存活，不建议完全新手`
      default: return `新品有较好机会(存活率${r}%)，近期${newProductCount}个新品中有${successfulCount}个成功站稳脚跟。市场对新品相对友好，有机会通过努力获得成功`
    }
  }

  private generateDescriptionEn(survivalRate: number, newProductCount: number, successfulCount: number, level: string): string {
    const r = Math.round(survivalRate * 100)
    const f = Math.round((1 - survivalRate) * 100)
    switch (level) {
      case 'critical': return `Graveyard category (survival rate ${r}%) — ${newProductCount} new products tried, only ${successfulCount} survived. ${f}% failure rate. Strongly not recommended for newcomers.`
      case 'high': return `Extremely high new product failure rate (survival rate ${r}%) — only ${successfulCount} of ${newProductCount} new products succeeded. Very unfriendly to new sellers.`
      case 'medium': return `Moderate difficulty for new products (survival rate ${r}%) — ${successfulCount} of ${newProductCount} new products succeeded. Requires strategy and resources.`
      default: return `Good opportunity for new products (survival rate ${r}%) — ${successfulCount} of ${newProductCount} new products established themselves. Market is relatively welcoming to newcomers.`
    }
  }
}

export default new SurvivalRateAnalyzer()
