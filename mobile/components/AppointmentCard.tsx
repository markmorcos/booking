import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appointment } from "../api/client";
import {
  FontSize,
  Colors,
  Spacing,
  BorderRadius,
  Shadow,
} from "../constants/theme";
import { formatDate, formatTime } from "../utils/dateFormatter";
import StatusBadge from "./StatusBadge";
import { Feather } from "@expo/vector-icons";

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatusBadge status={appointment.status} />
        <Text style={styles.name}>{appointment.bookingName}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Feather
            name="calendar"
            size={16}
            color={Colors.primary}
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            {formatDate(appointment.availabilitySlot.startsAt)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather
            name="clock"
            size={16}
            color={Colors.primary}
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            {formatTime(appointment.availabilitySlot.startsAt)} -{" "}
            {formatTime(appointment.availabilitySlot.endsAt)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather
            name="mail"
            size={16}
            color={Colors.primary}
            style={styles.icon}
          />
          <Text style={styles.detailText}>{appointment.bookingEmail}</Text>
        </View>

        {appointment.bookingPhone && (
          <View style={styles.detailRow}>
            <Feather
              name="phone"
              size={16}
              color={Colors.primary}
              style={styles.icon}
            />
            <Text style={styles.detailText}>{appointment.bookingPhone}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    textAlign: "right",
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
});
