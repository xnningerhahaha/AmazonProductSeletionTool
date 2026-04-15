import { useState, ChangeEvent } from 'react';
import { validateAsin, getAsinValidationError } from '../utils/validators';
import { useLanguage } from '../i18n/LanguageContext';

interface AsinInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  onClear?: () => void;
}

export default function AsinInput({ value, onChange, onValidationChange, onClear }: AsinInputProps) {
  const { t } = useLanguage();
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().trim();
    onChange(newValue);
    const validationError = getAsinValidationError(newValue);
    setError(validationError);
    const isValid = validateAsin(newValue);
    if (onValidationChange) onValidationChange(isValid);
  };

  const handleBlur = () => setTouched(true);

  const handleClear = () => {
    onChange('');
    setError('');
    setTouched(false);
    if (onValidationChange) onValidationChange(false);
    if (onClear) onClear();
  };

  const showError = touched && error && value.length > 0;

  return (
    <div className="w-full max-w-md">
      <label htmlFor="asin-input" className="block text-sm font-medium text-gray-700 mb-2">
        {t.asinLabel}
      </label>
      <div className="relative">
        <input
          id="asin-input"
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t.asinPlaceholder}
          maxLength={10}
          className={`w-full px-4 py-3 pr-12 text-lg border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            showError
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t.clearInput}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {showError && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-sm text-gray-500">{t.asinHint}</p>
    </div>
  );
}
