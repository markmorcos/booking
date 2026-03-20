import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AppointmentStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  no_show: { bg: '#F3E8FF', text: '#6B21A8' },
};

const STATUS_KEYS: Record<AppointmentStatus, string> = {
  pending: 'appointments.pending',
  confirmed: 'appointments.confirmed',
  cancelled: 'appointments.cancelled',
  completed: 'appointments.completed',
  no_show: 'appointments.noShow',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  const label = t(STATUS_KEYS[status] ?? 'appointments.pending');

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
