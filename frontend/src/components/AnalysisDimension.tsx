import React from 'react'
import { DimensionAnalysis } from '../types'
import { useLanguage } from '../i18n/LanguageContext'

// Detail key translations
const DETAIL_KEY_ZH: Record<string, string> = {
  salesRank: '销售排名', category: '类目', price: '价格', currency: '货币',
  estimatedCost: '预估成本', reviewCount: '评论数', rating: '评分',
  monopolyRate: '垄断率', top10Share: 'Top10占比',
  priceRange: '价格区间', concentration: '集中度', avgPrice: '均价',
  adDependency: '广告依赖', avgCPC: '平均CPC', estimatedMonthlyCost: '月均广告费',
  homogeneity: '同质化率', differentiationPotential: '差异化潜力',
  survivalRate: '存活率', newProductCount: '新品数量', successfulCount: '成功数量', failureRate: '失败率',
  defectRate: '缺陷率', defectCount: '缺陷种类', topDefects: '主要缺陷',
}

const DETAIL_KEY_EN: Record<string, string> = {
  salesRank: 'Sales Rank', category: 'Category', price: 'Price', currency: 'Currency',
  estimatedCost: 'Est. Cost', reviewCount: 'Reviews', rating: 'Rating',
  monopolyRate: 'Monopoly Rate', top10Share: 'Top 10 Share',
  priceRange: 'Price Range', concentration: 'Concentration', avgPrice: 'Avg Price',
  adDependency: 'Ad Dependency', avgCPC: 'Avg CPC', estimatedMonthlyCost: 'Est. Monthly Ad Cost',
  homogeneity: 'Homogeneity', differentiationPotential: 'Diff. Potential',
  survivalRate: 'Survival Rate', newProductCount: 'New Products', successfulCount: 'Successful', failureRate: 'Failure Rate',
  defectRate: 'Defect Rate', defectCount: 'Defect Types', topDefects: 'Top Defects',
}

function translateDetailKey(key: string, language: string): string {
  const map = language === 'en' ? DETAIL_KEY_EN : DETAIL_KEY_ZH
  return map[key] ?? key
}

interface Props {
  title: string
  dimension: DimensionAnalysis
  icon: string
  isImportant?: boolean
}

const AnalysisDimension: React.FC<Props> = ({ title, dimension, icon, isImportant = false }) => {
  const { t, language } = useLanguage()
  const { score, level, description, descriptionEn } = dimension

  // Use English description if available and language is English
  const displayDescription = language === 'en' && descriptionEn ? descriptionEn : description

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'low': return t.levelLow
      case 'medium': return t.levelMedium
      case 'high': return t.levelHigh
      case 'critical': return t.levelCritical
      default: return level
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${isImportant ? 'border-2 border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className={`font-semibold ${isImportant ? 'text-red-900' : 'text-gray-900'}`}>
              {title}
              {isImportant && <span className="ml-2 text-xs text-red-600">🔴 {t.levelKey}</span>}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full border ${getLevelColor(level)}`}>
              {getLevelText(level)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
            {score}
          </div>
          <div className="text-xs text-gray-500">{t.score}</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{displayDescription}</p>

      {dimension.details && Object.keys(dimension.details).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(dimension.details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-500">{translateDetailKey(key, language)}:</span>
                <span className="font-medium text-gray-700">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisDimension
