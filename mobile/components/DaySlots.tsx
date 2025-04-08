import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AvailabilitySlot } from "../api/client";
import SlotCard from "./SlotCard";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";
import { formatDate } from "../utils/dateFormatter";

interface DaySlotsProps {
  date: string | null;
  slots: AvailabilitySlot[];
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export default function DaySlots({ date, slots, onSelectSlot }: DaySlotsProps) {
  if (!date) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Start by selecting a date</Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>No slots available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>{formatDate(date)}</Text>
      <FlatList
        data={slots}
        renderItem={({ item }) => (
          <SlotCard slot={item} onSelect={() => onSelectSlot(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  dateHeader: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  placeholder: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
