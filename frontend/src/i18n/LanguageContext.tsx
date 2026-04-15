import { createContext, useContext, useState, ReactNode } from 'react'
import { Language, translations, Translations } from './translations'

interface LanguageContextType {
  language: Language
  t: Translations
  toggleLanguage: () => void
  tr: (key: string) => string  // translate a backend key
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }

  // Translate a backend-generated key like 'VETO:MONOPOLY' or 'REC:HIGHLY_1'
  const tr = (key: string): string => {
    const dict = translations[language] as Record<string, any>
    return dict[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], toggleLanguage, tr }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
