import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/contexts/LocaleContext';
import type { AvailabilitySlot } from '@/types';
import { formatTimeRange } from '@/utils/date';

interface SlotListProps {
  slots: AvailabilitySlot[];
  isLoading: boolean;
  onBookSlot: (slot: AvailabilitySlot) => void;
  bookingSlotId?: string | null;
}

export default function SlotList({
  slots,
  isLoading,
  onBookSlot,
  bookingSlotId,
}: SlotListProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('home.noSlots')}</Text>
      </View>
    );
  }

  const availableSlots = slots.filter((s) => s.is_available);

  if (availableSlots.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('home.noSlots')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={availableSlots}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isBooking = bookingSlotId === item.id;
        return (
          <View style={styles.slotCard}>
            <Text style={styles.timeText}>
              {formatTimeRange(item.starts_at, item.ends_at, locale)}
            </Text>
            <TouchableOpacity
              style={[styles.bookButton, isBooking && styles.bookingButton]}
              onPress={() => onBookSlot(item)}
              disabled={isBooking}
            >
              {isBooking ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.bookButtonText}>
                  {t('home.bookSlot')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      }}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  list: {
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  bookButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookingButton: {
    backgroundColor: '#93C5FD',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
