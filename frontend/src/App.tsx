import { useState, useCallback, useEffect } from 'react';
import AsinInput from './components/AsinInput';
import AnalyzeButton from './components/AnalyzeButton';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ProductReport from './components/ProductReport';
import { analyzeProduct, ApiError, DEMO_DATA } from './services/api';
import { AnalyzeResponseData } from './types';
import { useLanguage } from './i18n/LanguageContext';

function App() {
  const { t, language, toggleLanguage } = useLanguage();
  const [asin, setAsin] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<AnalyzeResponseData | null>(null);

  // 记录页面访问
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.amazonai.online'
    fetch(`${apiBase}/api/stats/visit`, {
      method: 'POST',
    }).catch(() => {})
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    setReportData(null);
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.amazonai.online'
    fetch(`${apiBase}/api/stats/analyze-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin }),
    }).catch(() => {})
    try {
      const response = await analyzeProduct(asin);
      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        setError(response.error?.message || t.analysisFailed);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.unknownError);
      }
    } finally {
      setLoading(false);
    }
  }, [asin, isValid, t]);

  const handleDemo = useCallback(() => {
    if (DEMO_DATA.data) setReportData(DEMO_DATA.data);
  }, []);

  const handleRetry = useCallback(() => {
    setError('');
    handleAnalyze();
  }, [handleAnalyze]);

  const handleNewAnalysis = useCallback(() => {
    setAsin('');
    setIsValid(false);
    setError('');
    setReportData(null);
  }, []);

  // Language toggle button (shown on all pages)
  const langButton = (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-all duration-200 flex items-center gap-1.5"
      aria-label="Switch language"
    >
      <span className="text-base">{language === 'zh' ? '🇨🇳' : '🇺🇸'}</span>
      <span>{language === 'zh' ? '中文' : 'EN'}</span>
    </button>
  );

  if (reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {langButton}
        <ProductReport data={reportData} onNewAnalysis={handleNewAnalysis} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {langButton}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {t.appTitle}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {t.appSubtitle}
        </p>

        <div className="flex flex-col items-center gap-4 mt-12">
          <AsinInput
            value={asin}
            onChange={setAsin}
            onValidationChange={setIsValid}
          />

          <AnalyzeButton
            onClick={handleAnalyze}
            disabled={!isValid || loading}
          />

          <button
            onClick={handleDemo}
            className="text-sm text-gray-400 underline hover:text-gray-600"
          >
            {language === 'zh' ? '查看演示报告' : 'View Demo Report'}
          </button>

          {loading && (
            <div className="mt-8">
              <LoadingSpinner message={t.loadingMessage} />
            </div>
          )}

          {error && (
            <div className="mt-8 w-full max-w-2xl">
              <ErrorMessage message={error} onRetry={handleRetry} />
            </div>
          )}

          {!loading && !error && (
            <div className="mt-12 w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {t.guideTitle}
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                {[t.guide1, t.guide2, t.guide3, t.guide4].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
