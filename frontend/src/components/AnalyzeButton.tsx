import { useLanguage } from '../i18n/LanguageContext';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
}

export default function AnalyzeButton({ onClick, disabled, loading = false }: AnalyzeButtonProps) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 text-lg font-medium rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] min-w-[120px] ${
        disabled || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg active:scale-95'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {t.analyzing}
        </span>
      ) : (
        t.analyzeButton
      )}
    </button>
  );
}
