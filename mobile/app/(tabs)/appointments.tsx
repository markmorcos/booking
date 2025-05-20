import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserAppointments, Appointment } from "../../api/client";
import AppointmentCard from "../../components/AppointmentCard";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (showRefresh = false) => {
    try {
      if (!showRefresh) setLoading(true);
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);

      if (!email) {
        setAppointments([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await getUserAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error("Error in fetchAppointments:", err);
      setError(
        "Failed to load appointments. Please check your network connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const handleRetry = () => {
    setError(null);
    fetchAppointments();
  };

  const showNetworkTroubleshooting = () => {
    const platform = Platform.OS === "ios" ? "iOS" : "Android";
    Alert.alert(
      "Network Troubleshooting",
      `Make sure that:\n\n1. Your ${platform} device is connected to the internet\n2. The backend server is running (Rails)\n3. Your device can reach the server\n\nIf using an emulator, make sure the server is running on the correct port (default: 3000).`,
      [{ text: "OK" }]
    );
  };

  const handleAppointmentCancel = (appointmentId: number) => {
    // Update the local state to mark the appointment as cancelled
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "cancelled" }
          : appointment
      )
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your appointments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Feather name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.helpButton]}
            onPress={showNetworkTroubleshooting}
          >
            <Text style={styles.buttonText}>Help</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!userEmail) {
    return (
      <View style={styles.centered}>
        <Feather name="user-x" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>No appointments found</Text>
        <Text style={styles.emptySubText}>
          Book an appointment first to see your bookings
        </Text>
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <View style={styles.centered}>
        <Feather name="calendar" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>No appointments found</Text>
        <Text style={styles.emptySubText}>
          You haven't booked any appointments yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onCancelSuccess={handleAppointmentCancel}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  errorText: {
    marginTop: Spacing.md,
    color: Colors.error,
    fontSize: FontSize.md,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginHorizontal: Spacing.xs,
  },
  helpButton: {
    backgroundColor: Colors.textLight,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  emptySubText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
  },
});
