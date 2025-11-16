import { useState, useEffect } from 'react';
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

type Language = 'es' | 'en';

let currentLanguage: Language = (localStorage.getItem('language') as Language) || 'es';
const listeners: Set<() => void> = new Set();

const getNested = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const i18n = {
  get language(): Language {
    return currentLanguage;
  },

  changeLanguage: (lang: Language) => {
    if (lang === currentLanguage) return;
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    listeners.forEach(listener => listener());
  },

  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  t: (key: string, options?: { [key: string]: string | number | undefined }): string => {
    const langResources = resources[currentLanguage]?.translation;
    let translation = getNested(langResources, key);

    if (typeof translation !== 'string') {
      console.warn(`Translation key '${key}' not found for language '${currentLanguage}'.`);
      const enResources = resources.en.translation;
      translation = getNested(enResources, key);
      if (typeof translation !== 'string') {
        return key;
      }
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation!.replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }

    return translation;
  }
};

export const useTranslation = () => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const forceUpdate = () => setTick(tick => tick + 1);
        const unsubscribe = i18n.subscribe(forceUpdate);
        return unsubscribe;
    }, []);

    return {
        t: i18n.t,
        i18n,
    };
};