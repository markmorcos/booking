import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { useLocale } from '@/contexts/LocaleContext';
import type { AvailabilitySlot } from '@/types';
import { toDateString } from '@/utils/date';

interface SlotCalendarProps {
  slots: AvailabilitySlot[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export default function SlotCalendar({
  slots,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: SlotCalendarProps) {
  const { locale } = useLocale();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};

    // Mark dates that have available slots
    for (const slot of slots) {
      if (slot.is_available) {
        const dateStr = toDateString(slot.starts_at);
        marks[dateStr] = {
          ...marks[dateStr],
          marked: true,
          dotColor: '#2563EB',
        };
      }
    }

    // Mark selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#2563EB',
      };
    }

    return marks;
  }, [slots, selectedDate]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      onSelectDate(day.dateString);
    },
    [onSelectDate],
  );

  const handleMonthChange = useCallback(
    (month: DateData) => {
      const key = `${month.year}-${String(month.month).padStart(2, '0')}`;
      setCurrentMonth(key);
      onMonthChange?.(month.year, month.month);
    },
    [onMonthChange],
  );

  return (
    <View style={styles.container}>
      <Calendar
        key={`${locale}-${currentMonth}`}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        enableSwipeMonths
        theme={{
          todayTextColor: '#2563EB',
          arrowColor: '#2563EB',
          selectedDayBackgroundColor: '#2563EB',
          selectedDayTextColor: '#FFFFFF',
          dotColor: '#2563EB',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
