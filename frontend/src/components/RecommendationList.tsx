import { useLanguage } from '../i18n/LanguageContext'

interface RecommendationListProps {
  recommendations: string[]
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  const { t, tr } = useLanguage()
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border-2 border-blue-300">
      <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">💡</span>
        {t.professionalAdvice}
      </h2>
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const translated = tr(rec)
          const emojiMatch = translated.match(/^([\u{1F300}-\u{1FFFF}\u2600-\u27FF✅⚠️❌💡]+\s*)/u)
          const emoji = emojiMatch ? emojiMatch[1].trim() : '💡'
          const text = translated.replace(/^[\u{1F300}-\u{1FFFF}\u2600-\u27FF✅⚠️❌💡]+\s*/u, '').trim()
          return (
            <div key={index} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
              <p className="text-gray-700 leading-relaxed">{text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
