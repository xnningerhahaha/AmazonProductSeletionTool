import { AnalysisResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AnalysisConclusionProps {
  analysis: AnalysisResult;
}

export default function AnalysisConclusion({ analysis }: AnalysisConclusionProps) {
  const { t, tr } = useLanguage();

  const getConclusionConfig = (conclusion: AnalysisResult['conclusion']) => {
    const info = t.conclusions[conclusion] ?? t.conclusions.not_recommended;
    switch (conclusion) {
      case 'highly_recommended':
        return {
          bgColor: 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500',
          iconBg: 'bg-green-500',
          textColor: 'text-green-700',
          ...info,
          icon: (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'recommended':
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-700',
          ...info,
          icon: (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'neutral':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400',
          iconBg: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          ...info,
          icon: (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400',
          iconBg: 'bg-red-500',
          textColor: 'text-red-700',
          ...info,
          icon: (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
    }
  };

  const config = getConclusionConfig(analysis.conclusion);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 45) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mb-6 ${config.bgColor}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${config.textColor}`}>{config.title}</h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl sm:text-5xl font-bold text-gray-800">{analysis.overallScore}</div>
          <div className="text-gray-600 text-sm mt-1">{t.overallScore}</div>
          <div className="w-20 sm:w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getScoreColor(analysis.overallScore)}`}
              style={{ width: `${analysis.overallScore}%` }}
            />
          </div>
        </div>
      </div>

      {analysis.warnings && analysis.warnings.some(w => w.startsWith('VETO:')) && (
        <div className="mt-4 pt-4 border-t border-red-300">
          <div className="flex items-start gap-2 text-red-800">
            <span className="text-xl">⛔</span>
            <div className="flex-1">
              <p className="font-semibold">{t.vetoTriggered}</p>
              <p className="text-sm mt-1">
                {tr(analysis.warnings.find(w => w.startsWith('VETO:')) ?? '')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
