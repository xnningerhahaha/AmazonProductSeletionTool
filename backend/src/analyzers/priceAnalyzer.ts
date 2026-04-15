import { BaseAnalyzer } from './baseAnalyzer'
import { ExtendedProductInfo, DimensionAnalysis } from '../types'

export class PriceAnalyzer extends BaseAnalyzer {
  get name(): string { return 'pricing' }

  analyze(product: ExtendedProductInfo): DimensionAnalysis {
    const { price, currency } = product
    const estimatedCostLow = price * 0.4
    const estimatedCostHigh = price * 0.6
    const profitMarginLow = ((price - estimatedCostHigh) / price) * 100
    const profitMarginHigh = ((price - estimatedCostLow) / price) * 100

    let score = 0
    let profitMargin = ''
    let description = ''
    let descriptionEn = ''

    if (price < 15) {
      score = 40
      profitMargin = `${profitMarginLow.toFixed(0)}-${profitMarginHigh.toFixed(0)}%`
      description = `单价才$${price.toFixed(2)}，利润率${profitMargin}，赚不了几个钱，得靠走量才能活`
      descriptionEn = `Price $${price.toFixed(2)}, margin ${profitMargin} — thin margins, need high volume to survive`
    } else if (price <= 50) {
      score = 70
      profitMargin = `${profitMarginLow.toFixed(0)}-${profitMarginHigh.toFixed(0)}%`
      description = `单价$${price.toFixed(2)}，利润率${profitMargin}，每单能赚点钱，不多不少刚刚好`
      descriptionEn = `Price $${price.toFixed(2)}, margin ${profitMargin} — decent per-unit profit, solid middle ground`
    } else if (price <= 100) {
      score = 85
      profitMargin = `${profitMarginLow.toFixed(0)}-${profitMarginHigh.toFixed(0)}%`
      description = `单价$${price.toFixed(2)}，利润率${profitMargin}，每单利润可观，卖一个顶好几个`
      descriptionEn = `Price $${price.toFixed(2)}, margin ${profitMargin} — good per-unit profit, each sale counts`
    } else {
      score = 75
      profitMargin = `${profitMarginLow.toFixed(0)}-${profitMarginHigh.toFixed(0)}%`
      description = `单价$${price.toFixed(2)}，利润率${profitMargin}，利润很高，但压资金，卖不动就砸手里了`
      descriptionEn = `Price $${price.toFixed(2)}, margin ${profitMargin} — high profit but ties up capital; slow sales = stuck inventory`
    }

    return {
      score: this.clampScore(score),
      level: this.getLevel(score),
      profitMargin,
      description,
      descriptionEn,
      details: {
        price: `$${price.toFixed(2)}`,
        currency,
        estimatedCost: `$${estimatedCostLow.toFixed(2)}-$${estimatedCostHigh.toFixed(2)}`
      }
    }
  }
}

export default new PriceAnalyzer()
