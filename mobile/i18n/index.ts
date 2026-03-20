import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import ar from './ar.json';

const LANGUAGE_KEY = '@booking_language';

export async function getStoredLanguage(): Promise<string> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang ?? 'ar';
  } catch {
    return 'ar';
  }
}

export async function storeLanguage(lang: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // silently fail
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
