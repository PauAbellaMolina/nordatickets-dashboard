import { I18n } from 'i18n-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { AvailableLocales, dict } from './translations/translation';

type LanguageContextProps = {
  i18n: I18n | null;
  setLanguage: (locale: AvailableLocales) => void;
};

type LanguageProviderProps = {
  children: React.ReactNode;
};

export const LanguageContext = createContext<LanguageContextProps>({
  i18n: null,
  setLanguage: () => {}
});
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguageProvider = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [i18n, setI18n] = useState<I18n | null>(null);

  const storeLocaleCookie = (locale: AvailableLocales) => {
    if (!locale || !i18n) return;
    i18n.locale = locale;
    try {
      localStorage.setItem('locale', locale);
    } catch (e) {
      console.error('Error storing locale cookie', e);
    }
  };

  const setLanguage = (locale: AvailableLocales) => {
    storeLocaleCookie(locale);
  };

  const getLocaleFromCookie = () => {
    const i18n = new I18n(dict);
    try {
      const value = localStorage.getItem('locale');
      if (value !== null) {
        i18n.locale = value as AvailableLocales;
        setI18n(i18n);
      } else {
        i18n.locale = AvailableLocales.CA;
        try {
          localStorage.setItem('locale', AvailableLocales.CA);
        } catch (e) {
          console.error('Error storing locale cookie', e);
        }
        setI18n(i18n);
      }
    } catch (e) {
      i18n.locale = AvailableLocales.CA;
      setI18n(i18n);
    }
  };

  useEffect(() => {
    getLocaleFromCookie();
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        i18n,
        setLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};