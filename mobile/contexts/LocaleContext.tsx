import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { useTranslation } from 'react-i18next';
import { getStoredLanguage, storeLanguage } from '@/i18n';

interface LocaleState {
  locale: string;
  isRTL: boolean;
  toggleLanguage: () => Promise<void>;
  setLocale: (lang: string) => Promise<void>;
}

const LocaleContext = createContext<LocaleState>({
  locale: 'ar',
  isRTL: true,
  toggleLanguage: async () => {},
  setLocale: async () => {},
});

export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [locale, setLocaleState] = useState(i18n.language ?? 'ar');
  const isRTL = locale === 'ar';

  useEffect(() => {
    (async () => {
      const storedLang = await getStoredLanguage();
      if (storedLang !== i18n.language) {
        await i18n.changeLanguage(storedLang);
        setLocaleState(storedLang);
      }
      // Set RTL based on stored language
      const shouldBeRTL = storedLang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
      }
    })();
  }, [i18n]);

  const setLocale = useCallback(
    async (lang: string) => {
      await i18n.changeLanguage(lang);
      await storeLanguage(lang);
      setLocaleState(lang);

      const shouldBeRTL = lang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
        // Need to reload for RTL to take effect
        try {
          await Updates.reloadAsync();
        } catch {
          // In development, Updates.reloadAsync may not be available
          // The user will need to restart the app manually
        }
      }
    },
    [i18n],
  );

  const toggleLanguage = useCallback(async () => {
    const newLang = locale === 'ar' ? 'en' : 'ar';
    await setLocale(newLang);
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({
      locale,
      isRTL,
      toggleLanguage,
      setLocale,
    }),
    [locale, isRTL, toggleLanguage, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
