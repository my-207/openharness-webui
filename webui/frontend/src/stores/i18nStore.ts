import { create } from 'zustand'
import zhCN from '../locales/zh-CN.json'
import en from '../locales/en.json'

export type Lang = 'zh-CN' | 'en'

const resources: Record<Lang, Record<string, string>> = {
  'zh-CN': zhCN,
  'en': en,
}

interface I18nState {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, fallback?: string) => string
}

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh-CN'
  const stored = localStorage.getItem('oh-lang') as Lang | null
  if (stored === 'zh-CN' || stored === 'en') return stored
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'
  return 'en'
}

function applyLang(lang: Lang) {
  localStorage.setItem('oh-lang', lang)
  document.documentElement.lang = lang === 'zh-CN' ? 'zh-CN' : 'en'
}

applyLang(getInitialLang())

export const useI18nStore = create<I18nState>((set, get) => ({
  lang: getInitialLang(),
  setLang: (lang) => {
    applyLang(lang)
    set({ lang })
  },
  t: (key: string, fallback?: string) => {
    const dict = resources[get().lang]
    if (!dict) return fallback ?? key
    return dict[key] ?? fallback ?? key
  },
}))

/** Hook to get translation function and current lang */
export function useTranslation() {
  const t = useI18nStore((s) => s.t)
  const lang = useI18nStore((s) => s.lang)
  const setLang = useI18nStore((s) => s.setLang)
  return { t, lang, setLang }
}
