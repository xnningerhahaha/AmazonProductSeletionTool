import { useLanguage } from '../i18n/LanguageContext'

interface UpgradeModalProps {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { language } = useLanguage()
  const isZh = language === 'zh'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isZh ? '感谢你的支持！' : 'Thanks for your interest!'}
        </h2>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {isZh
            ? '深度报告功能正在开发中，你的意向已被记录。功能上线后我们会第一时间通知你！'
            : 'The premium report feature is under development. Your interest has been noted — we\'ll notify you when it launches!'}
        </p>
        <div className="bg-blue-50 rounded-lg p-3 mb-5 text-sm text-blue-700">
          {isZh ? '🚀 预计功能包含：竞品深度对比、选品优化路径、利润测算模型' : '🚀 Planned features: competitor deep-dive, optimization roadmap, profit calculator'}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {isZh ? '好的，期待上线！' : 'Got it, looking forward to it!'}
        </button>
      </div>
    </div>
  )
}
