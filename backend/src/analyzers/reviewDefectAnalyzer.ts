import { BaseAnalyzer } from './baseAnalyzer'
import { DimensionAnalysis, ExtendedProductInfo } from '../types'
import { getCategoryConfig } from '../data/categoryData'

export class ReviewDefectAnalyzer extends BaseAnalyzer {
  get name(): string { return 'reviewDefect' }

  analyze(productInfo: ExtendedProductInfo): DimensionAnalysis {
    const { rating, category, reviewAnalysis } = productInfo
    const categoryConfig = getCategoryConfig(category)

    let defectRate: number
    let defectCount: number
    let topDefects: string[] = []

    if (reviewAnalysis?.defectKeywords) {
      const analysis = this.analyzeDefects(reviewAnalysis.defectKeywords, reviewAnalysis.totalReviews)
      defectRate = analysis.defectRate
      defectCount = analysis.defectCount
      topDefects = analysis.topDefects
    } else {
      const estimation = this.estimateDefectsFromRating(rating, categoryConfig.defectRate)
      defectRate = estimation.defectRate
      defectCount = estimation.defectCount
    }

    const score = this.calculateScore(defectRate, defectCount, rating)
    const level = this.determineLevel(defectRate, defectCount)
    const description = this.generateDescription(defectRate, defectCount, topDefects, level, rating)
    const descriptionEn = this.generateDescriptionEn(defectRate, defectCount, topDefects, level, rating)

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: {
        defectRate: `${Math.round(defectRate * 100)}%`,
        defectCount,
        topDefects: topDefects.slice(0, 3),
        rating
      }
    }
  }

  private analyzeDefects(defectKeywordsData: Record<string, number>, totalReviews: number) {
    const totalDefectMentions = Object.values(defectKeywordsData).reduce((sum, count) => sum + count, 0)
    const defectRate = Math.min(1, totalDefectMentions / totalReviews)
    const defectCount = Object.keys(defectKeywordsData).filter(key => defectKeywordsData[key] > 0).length
    const topDefects = Object.entries(defectKeywordsData)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .filter(([_, count]) => count > 0)
      .map(([keyword, count]) => `${keyword} (${count}次)`)
    return { defectRate, defectCount, topDefects }
  }

  private estimateDefectsFromRating(rating: number, categoryAvgDefectRate: number) {
    let defectRate = rating >= 4.5 ? 0.03 : rating >= 4.0 ? 0.08 : rating >= 3.5 ? 0.15 : rating >= 3.0 ? 0.25 : 0.40
    defectRate = (defectRate + categoryAvgDefectRate) / 2
    const defectCount = defectRate > 0.20 ? 5 : defectRate > 0.10 ? 3 : defectRate > 0.05 ? 1 : 0
    return { defectRate, defectCount }
  }

  private calculateScore(defectRate: number, defectCount: number, rating: number): number {
    let score = 90
    if (defectRate > 0.20) score -= 70
    else if (defectRate > 0.10) score -= 50
    else if (defectRate > 0.05) score -= 25
    else score -= 5
    score -= defectCount * 5
    if (rating < 3.5) score -= 20
    else if (rating < 4.0) score -= 10
    return score
  }

  private determineLevel(defectRate: number, defectCount: number): string {
    if (defectRate > 0.20 || defectCount > 5) return 'critical'
    if (defectRate > 0.10 || defectCount > 3) return 'high'
    if (defectRate > 0.05 || defectCount > 1) return 'medium'
    return 'low'
  }

  private generateDescription(defectRate: number, _defectCount: number, topDefects: string[], level: string, rating: number): string {
    const ratePct = Math.round(defectRate * 100)
    const defectsStr = topDefects.length > 0 ? `主要问题：${topDefects.join('、')}` : ''
    switch (level) {
      case 'critical': return `严重质量问题(缺陷率${ratePct}%)，这是"迟早会爆"的雷。${defectsStr}。新卖家没有容错空间，一次翻车 listing 直接废，强烈不建议`
      case 'high': return `存在明显质量问题(缺陷率${ratePct}%)，即便整体评分${rating}分不算太低，但隐藏的质量问题会持续困扰。${defectsStr}。高风险`
      case 'medium': return `有轻微质量问题(缺陷率${ratePct}%)，${defectsStr || '部分用户反馈产品存在小瑕疵'}。需要注意品控，可以通过改进产品质量来提升竞争力`
      default: return `产品质量稳定(缺陷率${ratePct}%)，评分${rating}分，用户反馈良好，没有明显的集中性质量问题，可以放心进入`
    }
  }

  private generateDescriptionEn(defectRate: number, _defectCount: number, topDefects: string[], level: string, rating: number): string {
    const ratePct = Math.round(defectRate * 100)
    const defectsStr = topDefects.length > 0 ? `Top issues: ${topDefects.join(', ')}` : ''
    switch (level) {
      case 'critical': return `Serious quality issues (defect rate ${ratePct}%) — a ticking time bomb. ${defectsStr}. No room for error as a new seller. Strongly not recommended.`
      case 'high': return `Noticeable quality issues (defect rate ${ratePct}%), despite a ${rating}-star rating. ${defectsStr}. High risk.`
      case 'medium': return `Minor quality issues (defect rate ${ratePct}%). ${defectsStr || 'Some users report small defects'}. Improve quality control to stay competitive.`
      default: return `Stable product quality (defect rate ${ratePct}%), ${rating} stars, positive user feedback with no concentrated quality issues. Safe to enter.`
    }
  }
}

export default new ReviewDefectAnalyzer()
