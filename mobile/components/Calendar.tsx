import React, { useCallback } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";
import { format } from "date-fns";
import { AvailabilitySlot } from "../api/client";

interface CalendarProps {
  availableSlots: AvailabilitySlot[];
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onDayPress: (day: string) => void;
  selectedDate: string | null;
  isLoading: boolean;
}

export default function Calendar({
  availableSlots,
  currentMonth,
  onMonthChange,
  onDayPress,
  selectedDate,
  isLoading,
}: CalendarProps) {
  // Create a map of dates with slots for quick lookup
  const markedDates = React.useMemo(() => {
    const markedDatesObj: Record<string, any> = {};

    availableSlots.forEach((slot) => {
      const dateKey = slot.startsAt.split("T")[0];

      if (!markedDatesObj[dateKey]) {
        markedDatesObj[dateKey] = {
          marked: true,
          dotColor: Colors.primary,
        };
      }
    });

    if (selectedDate) {
      markedDatesObj[selectedDate] = {
        ...markedDatesObj[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
        dotColor: Colors.white,
      };
    }

    return markedDatesObj;
  }, [availableSlots, selectedDate]);

  const handleMonthChange = useCallback(
    (month: { dateString: string }) => {
      // Extract year and month from the date string (YYYY-MM-DD)
      const [year, monthNum] = month.dateString.split("-");
      onMonthChange(`${year}-${monthNum}`);
    },
    [onMonthChange]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Calendar</Text>
      <Text style={styles.subtitle}>
        {isLoading ? "Loading..." : format(new Date(currentMonth), "MMMM yyyy")}
      </Text>

      <View style={styles.calendarContainer}>
        <RNCalendar
          theme={{
            backgroundColor: Colors.card,
            calendarBackground: Colors.card,
            textSectionTitleColor: Colors.textLight,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: Colors.white,
            todayTextColor: Colors.primary,
            dayTextColor: Colors.text,
            textDisabledColor: Colors.textLight + "80", // 50% opacity
            dotColor: Colors.primary,
            selectedDotColor: Colors.white,
            arrowColor: Colors.primary,
            monthTextColor: Colors.text,
            indicatorColor: Colors.primary,
          }}
          markedDates={markedDates}
          onDayPress={(day: any) => onDayPress(day.dateString)}
          onMonthChange={handleMonthChange}
          firstDay={0}
          disableArrowLeft={isLoading}
          disableArrowRight={isLoading}
          disableAllTouchEventsForDisabledDays
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.primary }]}
          />
          <Text style={styles.legendText}>Available slots</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  calendarContainer: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
});
