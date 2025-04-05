import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Appointment, RootStackParamList } from "../types";
import { appointmentService } from "../api/services";
import { format, parseISO } from "date-fns";

type Props = NativeStackScreenProps<RootStackParamList, "AppointmentDetails">;

const AppointmentDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.getAppointment(appointmentId);
      setAppointment(response);
    } catch (err) {
      setError("Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: "confirmed" | "cancelled") => {
    try {
      setUpdating(true);

      if (!appointment) return;

      // Confirm with user before changing status
      await new Promise<void>((resolve, reject) => {
        Alert.alert(
          `${status === "confirmed" ? "Confirm" : "Cancel"} Appointment`,
          `Are you sure you want to ${
            status === "confirmed" ? "confirm" : "cancel"
          } this appointment?`,
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => reject(),
            },
            {
              text: "Yes",
              onPress: () => resolve(),
            },
          ]
        );
      });

      const updatedAppointment =
        await appointmentService.updateAppointmentStatus(appointmentId, status);
      setAppointment(updatedAppointment);

      Alert.alert(
        "Success",
        `Appointment ${
          status === "confirmed" ? "confirmed" : "cancelled"
        } successfully.`
      );
    } catch (err) {
      // If user cancelled the alert, don't show error
      if (err) {
        setError(`Failed to update appointment status`);
      }
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "rgba(76, 175, 80, 0.2)";
      case "cancelled":
        return "rgba(244, 67, 54, 0.2)";
      default:
        return "rgba(255, 152, 0, 0.2)";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading appointment details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchAppointmentDetails}>
          Try Again
        </Button>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Appointment not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title>Appointment Details</Title>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(appointment.status) },
                ]}
              >
                {appointment.status.toUpperCase()}
              </Chip>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Slot Information</Text>
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text>
                  {format(
                    parseISO(appointment.slot.start_time),
                    "EEEE, MMMM d, yyyy"
                  )}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Time:</Text>
                <Text>
                  {format(parseISO(appointment.slot.start_time), "h:mm a")} -{" "}
                  {format(parseISO(appointment.slot.end_time), "h:mm a")}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Duration:</Text>
                <Text>
                  {Math.round(
                    (new Date(appointment.slot.end_time).getTime() -
                      new Date(appointment.slot.start_time).getTime()) /
                      (1000 * 60)
                  )}{" "}
                  minutes
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.label}>Name:</Text>
                <Text>{appointment.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Email:</Text>
                <Text>{appointment.email}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text>{appointment.phone}</Text>
              </View>
            </View>

            {appointment.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Divider style={styles.divider} />
                <Paragraph>{appointment.notes}</Paragraph>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appointment Information</Text>
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.label}>ID:</Text>
                <Text>{appointment.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Created:</Text>
                <Text>
                  {format(
                    parseISO(appointment.created_at),
                    "MMMM d, yyyy h:mm a"
                  )}
                </Text>
              </View>
            </View>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
            >
              Back
            </Button>

            {appointment.status === "pending" && (
              <>
                <Button
                  mode="contained"
                  onPress={() => handleUpdateStatus("confirmed")}
                  loading={updating}
                  disabled={updating}
                  style={[styles.actionButton, styles.confirmButton]}
                >
                  Confirm
                </Button>

                <Button
                  mode="contained"
                  onPress={() => handleUpdateStatus("cancelled")}
                  loading={updating}
                  disabled={updating}
                  style={[styles.actionButton, styles.cancelButton]}
                >
                  Cancel
                </Button>
              </>
            )}
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusChip: {
    borderRadius: 4,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    width: 80,
    marginRight: 8,
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
});

export default AppointmentDetailsScreen;
