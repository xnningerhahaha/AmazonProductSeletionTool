import { useLanguage } from '../i18n/LanguageContext'

interface Props {
  warnings: string[]
}

export default function WarningList({ warnings }: Props) {
  const { t, tr } = useLanguage()
  if (!warnings || warnings.length === 0) return null

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">⚠️</span>
        <h3 className="font-bold text-yellow-900">{t.riskWarning}</h3>
      </div>
      <ul className="space-y-2">
        {warnings.map((warning, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
            <span className="mt-0.5">•</span>
            <span>{tr(warning)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
