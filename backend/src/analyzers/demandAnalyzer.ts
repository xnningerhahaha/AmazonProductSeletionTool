import { BaseAnalyzer } from './baseAnalyzer'
import { ExtendedProductInfo, DimensionAnalysis } from '../types'

/**
 * 需求分析器
 * 基于销售排名评估市场需求
 */
export class DemandAnalyzer extends BaseAnalyzer {
  get name(): string {
    return 'demand'
  }

  analyze(product: ExtendedProductInfo): DimensionAnalysis {
    const { salesRank, category } = product

    let score = 0
    let level = ''
    let description = ''

    // 基于BSR (Best Sellers Rank) 评估需求
    if (salesRank < 10000) {
      score = 90
      level = 'low'
      description = `排名前1万(#${salesRank.toLocaleString()})，这个品有人买！市场需求旺盛，不愁卖不出去`
    } else if (salesRank <= 50000) {
      score = 65
      level = 'medium'
      description = `排名5万内(#${salesRank.toLocaleString()})，需求还行，每天都有人买，但不算爆款`
    } else if (salesRank <= 100000) {
      score = 40
      level = 'high'
      description = `排名10万内(#${salesRank.toLocaleString()})，需求一般，卖得比较慢，需要靠推广才能出单`
    } else {
      score = 20
      level = 'critical'
      description = `排名很靠后(#${salesRank.toLocaleString()})，基本没什么人买，放着也是积压库存`
    }

    // 添加类目信息
    if (category) {
      description += `。类目: ${category}`
    }

    let descriptionEn = ''
    if (salesRank < 10000) {
      descriptionEn = `Ranked top 10K (#${salesRank.toLocaleString()}), strong demand — this product sells well. Category: ${category}`
    } else if (salesRank <= 50000) {
      descriptionEn = `Ranked within 50K (#${salesRank.toLocaleString()}), decent demand with daily sales, but not a bestseller. Category: ${category}`
    } else if (salesRank <= 100000) {
      descriptionEn = `Ranked within 100K (#${salesRank.toLocaleString()}), slow-moving product that needs promotion to generate sales. Category: ${category}`
    } else {
      descriptionEn = `Ranked very low (#${salesRank.toLocaleString()}), barely any buyers — likely to sit as dead inventory. Category: ${category}`
    }

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: {
        salesRank,
        category
      }
    }
  }
}

export default new DemandAnalyzer()
