import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import SlotCalendar from '@/components/SlotCalendar';
import SlotList from '@/components/SlotList';
import { useSlots } from '@/hooks/useSlots';
import { useBookAppointment } from '@/hooks/useAppointments';
import { useLocale } from '@/contexts/LocaleContext';
import { toDateString, formatDate, formatTime } from '@/utils/date';
import type { AvailabilitySlot } from '@/types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthRange, setMonthRange] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const from = new Date(year, month, 1).toISOString().split('T')[0];
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
    return { from, to };
  });

  const {
    data: slots = [],
    isLoading,
    refetch,
    isRefetching,
  } = useSlots(monthRange.from, monthRange.to);

  const bookAppointment = useBookAppointment();

  const handleMonthChange = useCallback((year: number, month: number) => {
    const from = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const to = new Date(year, month, 0).toISOString().split('T')[0];
    setMonthRange({ from, to });
    setSelectedDate(null);
  }, []);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter(
      (slot) => toDateString(slot.starts_at) === selectedDate,
    );
  }, [slots, selectedDate]);

  const handleBookSlot = useCallback(
    (slot: AvailabilitySlot) => {
      const dateStr = formatDate(slot.starts_at, locale);
      const timeStr = formatTime(slot.starts_at, locale);

      Alert.alert(
        t('home.confirmBooking'),
        t('home.confirmBookingMessage', { date: dateStr, time: timeStr }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: () => {
              bookAppointment.mutate(
                { availability_slot_id: slot.id },
                {
                  onSuccess: () => {
                    Alert.alert(
                      t('common.success'),
                      t('home.bookingConfirmed'),
                    );
                    refetch();
                  },
                  onError: (error) => {
                    const message =
                      error instanceof Error
                        ? error.message
                        : t('common.error');
                    Alert.alert(t('common.error'), message);
                  },
                },
              );
            },
          },
        ],
      );
    },
    [t, locale, bookAppointment, refetch],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <SlotCalendar
          slots={slots}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={handleMonthChange}
        />

        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>
            {t('home.availableSlots')}
          </Text>
          {selectedDate ? (
            <SlotList
              slots={slotsForSelectedDate}
              isLoading={isLoading}
              onBookSlot={handleBookSlot}
              bookingSlotId={
                bookAppointment.isPending
                  ? (bookAppointment.variables?.availability_slot_id ?? null)
                  : null
              }
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {t('home.selectDate')}
              </Text>
            </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  slotsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  placeholder: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
