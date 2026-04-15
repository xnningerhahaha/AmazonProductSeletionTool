import { BaseAnalyzer } from './baseAnalyzer'
import { ExtendedProductInfo, DimensionAnalysis } from '../types'

export class CompetitionAnalyzer extends BaseAnalyzer {
  get name(): string { return 'competition' }

  analyze(product: ExtendedProductInfo): DimensionAnalysis {
    const { reviewCount, rating } = product
    let score = 0
    let level = ''
    let description = ''
    let descriptionEn = ''

    if (reviewCount < 100) {
      score += 50; level = 'low'
    } else if (reviewCount <= 1000) {
      score += 30; level = 'medium'
    } else {
      score += 10; level = 'high'
    }

    if (rating < 3.5) {
      score += 40
    } else if (rating <= 4.5) {
      score += 25
    } else {
      score += 10
    }

    if (reviewCount < 100 && rating < 4.0) {
      description = `评论才${reviewCount}条，评分${rating.toFixed(1)}星，竞争小，现在进入正是好时机！`
      descriptionEn = `Only ${reviewCount} reviews, ${rating.toFixed(1)} stars — low competition, great time to enter!`
    } else if (reviewCount > 1000 && rating > 4.5) {
      description = `评论${reviewCount}条，评分${rating.toFixed(1)}星，对手又多又强，新手很难打得过`
      descriptionEn = `${reviewCount} reviews, ${rating.toFixed(1)} stars — strong, established competitors; tough for newcomers`
    } else if (reviewCount > 500 && rating > 4.3) {
      description = `评论${reviewCount}条，评分${rating.toFixed(1)}星，竞争适中，需要找到差异化才有机会`
      descriptionEn = `${reviewCount} reviews, ${rating.toFixed(1)} stars — moderate competition, differentiation needed`
    } else if (rating < 3.5) {
      description = `现有产品评分才${rating.toFixed(1)}星，做得不咋样，你有机会做得更好抢市场`
      descriptionEn = `Existing products only rate ${rating.toFixed(1)} stars — room to do better and capture market share`
    } else if (rating <= 4.5) {
      description = `现有产品评分${rating.toFixed(1)}星，中规中矩，还有改进空间，可以试试`
      descriptionEn = `Products rate ${rating.toFixed(1)} stars — average quality, room for improvement`
    } else {
      description = `现有产品评分${rating.toFixed(1)}星，做得很好了，你得拿出真本事才能抢到客户`
      descriptionEn = `Products rate ${rating.toFixed(1)} stars — high quality bar, need real differentiation to compete`
    }

    return {
      score: this.clampScore(score),
      level,
      description,
      descriptionEn,
      details: { reviewCount, rating }
    }
  }
}

export default new CompetitionAnalyzer()
