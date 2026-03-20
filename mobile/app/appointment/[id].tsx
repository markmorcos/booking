import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  useAppointment,
  useCancelAppointment,
  useConfirmAppointment,
  useCompleteAppointment,
  useMarkNoShow,
} from '@/hooks/useAppointments';
import StatusBadge from '@/components/StatusBadge';
import LoadingScreen from '@/components/LoadingScreen';
import { formatDate, formatTimeRange } from '@/utils/date';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const { data: appointment, isLoading, refetch } = useAppointment(id);
  const cancelMutation = useCancelAppointment();
  const confirmMutation = useConfirmAppointment();
  const completeMutation = useCompleteAppointment();
  const noShowMutation = useMarkNoShow();

  const handleCancel = useCallback(() => {
    if (!appointment) return;
    Alert.prompt
      ? Alert.prompt(
          t('appointments.cancelAppointment'),
          t('appointments.cancelReason'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.confirm'),
              style: 'destructive',
              onPress: (reason?: string) => {
                cancelMutation.mutate(
                  { id: appointment.id, cancel_reason: reason },
                  {
                    onSuccess: () => {
                      Alert.alert(
                        t('common.success'),
                        t('appointments.cancelSuccess'),
                      );
                      refetch();
                    },
                  },
                );
              },
            },
          ],
          'plain-text',
        )
      : Alert.alert(
          t('appointments.cancelAppointment'),
          t('appointments.cancelConfirm'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.confirm'),
              style: 'destructive',
              onPress: () => {
                cancelMutation.mutate(
                  { id: appointment.id },
                  {
                    onSuccess: () => {
                      Alert.alert(
                        t('common.success'),
                        t('appointments.cancelSuccess'),
                      );
                      refetch();
                    },
                  },
                );
              },
            },
          ],
        );
  }, [appointment, t, cancelMutation, refetch]);

  const handleConfirm = useCallback(() => {
    if (!appointment) return;
    confirmMutation.mutate(appointment.id, {
      onSuccess: () => {
        Alert.alert(t('common.success'), t('appointments.confirmSuccess'));
        refetch();
      },
    });
  }, [appointment, confirmMutation, t, refetch]);

  const handleComplete = useCallback(() => {
    if (!appointment) return;
    completeMutation.mutate(appointment.id, {
      onSuccess: () => {
        Alert.alert(t('common.success'), t('appointments.completeSuccess'));
        refetch();
      },
    });
  }, [appointment, completeMutation, t, refetch]);

  const handleNoShow = useCallback(() => {
    if (!appointment) return;
    noShowMutation.mutate(appointment.id, {
      onSuccess: () => {
        Alert.alert(t('common.success'), t('appointments.noShowSuccess'));
        refetch();
      },
    });
  }, [appointment, noShowMutation, t, refetch]);

  if (isLoading || !appointment) {
    return <LoadingScreen />;
  }

  const slot = appointment.slot;
  const dateText = slot ? formatDate(slot.starts_at, locale) : '';
  const timeText = slot
    ? formatTimeRange(slot.starts_at, slot.ends_at, locale)
    : '';

  const canCancel =
    appointment.status === 'pending' || appointment.status === 'confirmed';
  const canConfirm = isAdmin && appointment.status === 'pending';
  const canComplete = isAdmin && appointment.status === 'confirmed';
  const canNoShow = isAdmin && appointment.status === 'confirmed';

  const isMutating =
    cancelMutation.isPending ||
    confirmMutation.isPending ||
    completeMutation.isPending ||
    noShowMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('appointments.status')}</Text>
          <StatusBadge status={appointment.status} />
        </View>

        {/* Date & Time */}
        {slot && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointments.dateTime')}</Text>
            <Text style={styles.value}>{dateText}</Text>
            <Text style={styles.subValue}>{timeText}</Text>
          </View>
        )}

        {/* Patient (Admin Only) */}
        {isAdmin && appointment.user && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointments.patient')}</Text>
            <Text style={styles.value}>{appointment.user.name}</Text>
            <Text style={styles.subValue}>{appointment.user.email}</Text>
            {appointment.user.phone && (
              <Text style={styles.subValue}>{appointment.user.phone}</Text>
            )}
          </View>
        )}

        {/* Notes */}
        {appointment.notes ? (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointments.notes')}</Text>
            <Text style={styles.value}>{appointment.notes}</Text>
          </View>
        ) : null}

        {/* Cancel Reason */}
        {appointment.cancel_reason ? (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointments.reason')}</Text>
            <Text style={styles.value}>{appointment.cancel_reason}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          {canConfirm && (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={isMutating}
            >
              {confirmMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {t('appointments.confirmAppointment')}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {canComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleComplete}
              disabled={isMutating}
            >
              {completeMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {t('appointments.completeAppointment')}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {canNoShow && (
            <TouchableOpacity
              style={[styles.actionButton, styles.noShowButton]}
              onPress={handleNoShow}
              disabled={isMutating}
            >
              {noShowMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {t('appointments.markNoShow')}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isMutating}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {t('appointments.cancelAppointment')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  subValue: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2563EB',
  },
  completeButton: {
    backgroundColor: '#059669',
  },
  noShowButton: {
    backgroundColor: '#7C3AED',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
  },
});
