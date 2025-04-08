import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Appointment, cancelAppointment } from "../api/client";
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
  onCancelSuccess?: (appointmentId: number) => void;
}

export default function AppointmentCard({
  appointment,
  onCancelSuccess,
}: AppointmentCardProps) {
  const handleCancel = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
              if (onCancelSuccess) {
                onCancelSuccess(appointment.id);
              }
              Alert.alert(
                "Appointment Cancelled",
                "Your appointment has been cancelled successfully."
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to cancel the appointment. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Don't show cancel button for already cancelled, completed, or no-show appointments
  const canCancel =
    appointment.status !== "cancelled" &&
    appointment.status !== "completed" &&
    appointment.status !== "no_show";

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

        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Feather
              name="x-circle"
              size={16}
              color={Colors.white}
              style={styles.cancelIcon}
            />
            <Text style={styles.cancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
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
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  cancelIcon: {
    marginRight: 8,
  },
});
