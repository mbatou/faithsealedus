'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { dictionaries, type Dictionary, type Language } from '@/lib/dictionary';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'wedding-lang';

function detectInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'fr') return stored;
  const browser = window.navigator.language?.toLowerCase() ?? '';
  return browser.startsWith('fr') ? 'fr' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Resolve the preferred language after mount to avoid hydration mismatches.
  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'fr' : 'en');
  }, [lang, setLang]);

  const value: LanguageContextValue = {
    lang,
    setLang,
    toggle,
    t: dictionaries[lang],
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
