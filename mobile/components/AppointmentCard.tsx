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
        <Text style={styles.name}>{appointment.booking_name}</Text>
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
            {formatDate(appointment.availability_slot.starts_at)}
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
            {formatTime(appointment.availability_slot.starts_at)} -{" "}
            {formatTime(appointment.availability_slot.ends_at)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather
            name="mail"
            size={16}
            color={Colors.primary}
            style={styles.icon}
          />
          <Text style={styles.detailText}>{appointment.booking_email}</Text>
        </View>

        {appointment.booking_phone && (
          <View style={styles.detailRow}>
            <Feather
              name="phone"
              size={16}
              color={Colors.primary}
              style={styles.icon}
            />
            <Text style={styles.detailText}>{appointment.booking_phone}</Text>
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
