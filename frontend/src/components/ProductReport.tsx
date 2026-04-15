import { AnalyzeResponseData } from '../types';
import ProductBasicInfo from './ProductBasicInfo';
import AnalysisConclusion from './AnalysisConclusion';
import AnalysisDetails from './AnalysisDetails';
import UpgradeModal from './UpgradeModal';
import { useLanguage } from '../i18n/LanguageContext';
import { recordUpgradeClick } from '../services/api';
import { useState } from 'react';

interface ProductReportProps {
  data: AnalyzeResponseData;
  onNewAnalysis?: () => void;
}

export default function ProductReport({ data, onNewAnalysis }: ProductReportProps) {
  const { t, language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleUpgradeClick = () => {
    recordUpgradeClick(data.productInfo.asin, language)
    setShowModal(true)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t.reportTitle}</h1>
        {onNewAnalysis && (
          <button
            onClick={onNewAnalysis}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex items-center justify-center gap-2 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.newAnalysis}
          </button>
        )}
      </div>

      <ProductBasicInfo productInfo={data.productInfo} />
      <AnalysisConclusion analysis={data.analysis} />
      <AnalysisDetails analysis={data.analysis} />

      {/* 付费意向按钮 */}
      <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 text-center">
        <p className="text-sm text-amber-700 mb-1 font-medium">
          {language === 'zh' ? '想要更深入的分析？' : 'Want a deeper analysis?'}
        </p>
        <p className="text-xs text-amber-600 mb-4">
          {language === 'zh'
            ? '包含竞品对比、选品优化路径、利润测算模型'
            : 'Includes competitor comparison, optimization roadmap, profit calculator'}
        </p>
        <button
          onClick={handleUpgradeClick}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
        >
          {language === 'zh' ? '🔓 获取深度报告 ¥1' : '🔓 Get Premium Report $1'}
        </button>
      </div>

      {onNewAnalysis && (
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            onClick={onNewAnalysis}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors duration-200 touch-manipulation"
          >
            {t.backHome}
          </button>
        </div>
      )}

      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
