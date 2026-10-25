import { createContext, useContext, useMemo, useState } from 'react'
import { translations, languages } from './translations'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en')

  const value = useMemo(() => {
    const t = translations[lang] ?? translations.en
    return {
      lang,
      setLang,
      languages,
      t,
    }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider')
  return ctx
}

export function useT() {
  return useI18n().t
}
