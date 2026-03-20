import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from './StatusBadge';
import type { Appointment } from '@/types';
import { formatDate, formatTimeRange } from '@/utils/date';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const { isAdmin } = useAuth();

  const handlePress = () => {
    router.push(`/appointment/${appointment.id}`);
  };

  const slot = appointment.slot;
  const dateText = slot ? formatDate(slot.starts_at, locale) : '';
  const timeText = slot
    ? formatTimeRange(slot.starts_at, slot.ends_at, locale)
    : '';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <StatusBadge status={appointment.status} />
      </View>
      {slot && (
        <View style={styles.details}>
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.timeText}>{timeText}</Text>
        </View>
      )}
      {isAdmin && appointment.user && (
        <View style={styles.userRow}>
          <Text style={styles.userName}>{appointment.user.name}</Text>
          <Text style={styles.userEmail}>{appointment.user.email}</Text>
        </View>
      )}
      {appointment.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {appointment.notes}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  details: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  notes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
