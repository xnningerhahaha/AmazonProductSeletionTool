import { AnalysisResult } from '../types'
import AnalysisDimension from './AnalysisDimension'
import WarningList from './WarningList'
import RecommendationList from './RecommendationList'
import { useLanguage } from '../i18n/LanguageContext'

interface AnalysisDetailsProps {
  analysis: AnalysisResult
}

export default function AnalysisDetails({ analysis }: AnalysisDetailsProps) {
  const { t } = useLanguage()
  const { dimensions, warnings, recommendations } = analysis

  return (
    <div className="space-y-6">
      {warnings && warnings.length > 0 && <WarningList warnings={warnings} />}

      {/* 关键维度 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔴</span>
          {t.keyDimensions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnalysisDimension title={t.dimMonopoly} dimension={dimensions.monopoly} icon="👑" isImportant={true} />
          <AnalysisDimension title={t.dimPriceCollapse} dimension={dimensions.priceCollapse} icon="💰"
            isImportant={dimensions.priceCollapse.level === 'critical' || dimensions.priceCollapse.level === 'high'} />
          <AnalysisDimension title={t.dimSurvivalRate} dimension={dimensions.survivalRate} icon="🌱"
            isImportant={dimensions.survivalRate.level === 'critical' || dimensions.survivalRate.level === 'high'} />
        </div>
      </div>

      {/* 基础维度 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          {t.basicDimensions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnalysisDimension title={t.dimDemand} dimension={dimensions.demand} icon="📈" />
          <AnalysisDimension title={t.dimPricing} dimension={dimensions.pricing} icon="💵" />
          <AnalysisDimension title={t.dimCompetition} dimension={dimensions.competition} icon="⚔️" />
        </div>
      </div>

      {/* 深度分析 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          {t.deepAnalysis}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnalysisDimension title={t.dimReviewDefect} dimension={dimensions.reviewDefect} icon="⭐" />
          <AnalysisDimension title={t.dimAdDependency} dimension={dimensions.adDependency} icon="📢" />
          <AnalysisDimension title={t.dimHomogeneity} dimension={dimensions.homogeneity} icon="🔄" />
        </div>
      </div>

      {/* 专业建议 */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationList recommendations={recommendations} />
      )}

      {/* 维度说明 */}
      <details className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 border border-gray-200">
        <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2">
          <span>📖</span>
          <span>{t.dimensionExplanation}</span>
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
          {[
            t.dimExplMonopoly, t.dimExplDemand, t.dimExplPriceCollapse,
            t.dimExplReviewDefect, t.dimExplCompetition, t.dimExplPricing,
            t.dimExplAdDependency, t.dimExplHomogeneity, t.dimExplSurvivalRate,
          ].map((expl, i) => {
            const [bold, ...rest] = expl.split(':')
            return (
              <div key={i}>
                <strong className="text-gray-700">{bold}:</strong>{rest.join(':')}
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400 pl-6">{t.dimensionNote}</p>
      </details>
    </div>
  )
}
