import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/contexts/LocaleContext';

export default function LanguageToggle() {
  const { locale, toggleLanguage } = useLocale();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, locale === 'en' && styles.activeButton]}
        onPress={locale === 'en' ? undefined : toggleLanguage}
        activeOpacity={locale === 'en' ? 1 : 0.7}
      >
        <Text style={[styles.text, locale === 'en' && styles.activeText]}>
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, locale === 'ar' && styles.activeButton]}
        onPress={locale === 'ar' ? undefined : toggleLanguage}
        activeOpacity={locale === 'ar' ? 1 : 0.7}
      >
        <Text style={[styles.text, locale === 'ar' && styles.activeText]}>
          AR
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  activeButton: {
    backgroundColor: '#2563EB',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
