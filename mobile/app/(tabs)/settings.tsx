import React, { useCallback, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useUpdateProfile } from '@/hooks/useUsers';
import LanguageToggle from '@/components/LanguageToggle';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user, signOut, refreshProfile } = useAuth();
  const { locale } = useLocale();

  const [phone, setPhone] = useState(user?.phone ?? '');
  const [notifyEmail, setNotifyEmail] = useState(user?.notify_email ?? true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(
    user?.notify_whatsapp ?? false,
  );
  const [notifyPush, setNotifyPush] = useState(user?.notify_push ?? true);

  const updateProfile = useUpdateProfile();

  const handleSave = useCallback(() => {
    updateProfile.mutate(
      {
        phone: phone || undefined,
        locale,
        notify_email: notifyEmail,
        notify_whatsapp: notifyWhatsapp,
        notify_push: notifyPush,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), t('settings.saveSuccess'));
          refreshProfile();
        },
        onError: (error) => {
          const msg =
            error instanceof Error ? error.message : t('common.error');
          Alert.alert(t('common.error'), msg);
        },
      },
    );
  }, [
    phone,
    locale,
    notifyEmail,
    notifyWhatsapp,
    notifyPush,
    updateProfile,
    t,
    refreshProfile,
  ]);

  const handleSignOut = useCallback(() => {
    Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  }, [t, signOut]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.name')}</Text>
            <Text style={styles.readonlyValue}>{user?.name ?? ''}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.email')}</Text>
            <Text style={styles.readonlyValue}>{user?.email ?? ''}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.phone')}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('settings.phonePlaceholder')}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.languageRow}>
            <LanguageToggle />
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.notifications')}
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {t('settings.emailNotifications')}
            </Text>
            <Switch
              value={notifyEmail}
              onValueChange={setNotifyEmail}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={notifyEmail ? '#2563EB' : '#F9FAFB'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {t('settings.whatsappNotifications')}
            </Text>
            <Switch
              value={notifyWhatsapp}
              onValueChange={setNotifyWhatsapp}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={notifyWhatsapp ? '#2563EB' : '#F9FAFB'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {t('settings.pushNotifications')}
            </Text>
            <Switch
              value={notifyPush}
              onValueChange={setNotifyPush}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={notifyPush ? '#2563EB' : '#F9FAFB'}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            updateProfile.isPending && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={updateProfile.isPending}
        >
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  readonlyValue: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  languageRow: {
    alignItems: 'flex-start',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
  },
});
