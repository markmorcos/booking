import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  getAvailableSlotsForMonth,
  AvailabilitySlot,
  getUserAppointments,
} from "../../api/client";
import { Spacing } from "../../constants/theme";
import Calendar from "../../components/Calendar";
import DaySlots from "../../components/DaySlots";
import ScreenLayout from "../../components/layouts/ScreenLayout";
import { format } from "date-fns";

export default function HomeScreen() {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );

  // Group slots by date
  const slotsByDate = React.useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};

    slots.forEach((slot) => {
      const dateKey = slot.startsAt.split("T")[0]; // YYYY-MM-DD format

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(slot);
    });

    return grouped;
  }, [slots]);

  // Fetch both slots and appointments
  const fetchData = useCallback(
    async (showRefresh = false) => {
      try {
        if (!showRefresh) setLoading(true);

        // Fetch slots for the current month
        const slotsData = await getAvailableSlotsForMonth(currentMonth);
        setSlots(slotsData);

        // Fetch user appointments
        const appointmentsData = await getUserAppointments();
        setAppointments(appointmentsData);

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load calendar data. Please check your network connection and try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentMonth]
  );

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  // Handle month change
  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setSelectedDate(null);
  };

  // Handle day selection
  const handleDayPress = (date: string) => {
    setSelectedDate((prevDate) => (prevDate === date ? null : date));
  };

  // Handle slot selection
  const handleSelectSlot = (slot: AvailabilitySlot) => {
    router.push({
      pathname: "/booking",
      params: { slotId: slot.id },
    });
  };

  // Get slots for selected date
  const selectedDateSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];

  return (
    <ScreenLayout
      error={error}
      onRetry={() => fetchData()}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      scrollable={true}
      emptyText="No available slots found"
      emptySubText="Pull down to refresh and check again"
      loadingText="Loading appointment calendar..."
    >
      <View style={styles.container}>
        <Calendar
          availableSlots={slots}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          onDayPress={handleDayPress}
          selectedDate={selectedDate}
          isLoading={loading || refreshing}
        />

        <DaySlots
          date={selectedDate}
          slots={selectedDateSlots}
          onSelectSlot={handleSelectSlot}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  allDatesContainer: {
    paddingBottom: Spacing.lg,
  },
});
