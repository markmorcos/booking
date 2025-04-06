import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  FontSize,
  Colors,
  Spacing,
  BorderRadius,
  Shadow,
} from "../constants/theme";
import {
  formatDate,
  formatTime,
  formatSlotDuration,
} from "../utils/dateFormatter";
import { AvailabilitySlot } from "../api/client";
import { Feather } from "@expo/vector-icons";

type SlotCardProps = {
  slot: AvailabilitySlot;
  onSelect: () => void;
};

export default function SlotCard({ slot, onSelect }: SlotCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.8}
      disabled={!slot.available}
    >
      <View style={[styles.card, !slot.available && styles.unavailable]}>
        <View style={styles.dateRow}>
          <Text style={styles.date}>{formatDate(slot.starts_at)}</Text>
          {!slot.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeInfo}>
            <Feather
              name="clock"
              size={16}
              color={Colors.primary}
              style={styles.icon}
            />
            <Text style={styles.time}>
              {formatTime(slot.starts_at)} - {formatTime(slot.ends_at)}
            </Text>
          </View>

          <Text style={styles.duration}>
            ({formatSlotDuration(slot.starts_at, slot.ends_at)})
          </Text>
        </View>

        {slot.available ? (
          <View style={styles.footer}>
            <Feather
              name="calendar"
              size={16}
              color={Colors.secondary}
              style={styles.icon}
            />
            <Text style={styles.bookNow}>Book this slot</Text>
          </View>
        ) : (
          <View style={styles.footer}>
            <Feather
              name="x-circle"
              size={16}
              color={Colors.textLight}
              style={styles.icon}
            />
            <Text style={styles.unavailableFooter}>Not available</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  unavailable: {
    borderLeftColor: Colors.textLight,
    opacity: 0.7,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  unavailableBadge: {
    backgroundColor: Colors.cancelled,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  unavailableText: {
    color: "white",
    fontSize: FontSize.xs,
    fontWeight: "500",
  },
  timeContainer: {
    marginBottom: Spacing.md,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  duration: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: 2,
    marginLeft: 24,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  bookNow: {
    color: Colors.secondary,
    fontWeight: "600",
  },
  unavailableFooter: {
    color: Colors.textLight,
  },
  icon: {
    marginRight: 8,
  },
});
