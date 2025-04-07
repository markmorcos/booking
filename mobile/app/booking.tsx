import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  getAvailableSlots,
  createAppointment,
  BookingFormData,
  AvailabilitySlot,
} from "../api/client";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";
import { formatDateTime, formatSlotDuration } from "../utils/dateFormatter";
import { Feather } from "@expo/vector-icons";

export default function BookingScreen() {
  const router = useRouter();
  const { slotId } = useLocalSearchParams();
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    bookingName: "",
    bookingEmail: "",
    bookingPhone: "",
    availabilitySlotId: Number(slotId),
  });

  const [formErrors, setFormErrors] = useState({
    bookingName: "",
    bookingEmail: "",
  });

  useEffect(() => {
    const fetchSlotDetails = async () => {
      try {
        setLoading(true);
        const slots = await getAvailableSlots();
        const selectedSlot = slots.find((s) => s.id === slotId);

        if (!selectedSlot) {
          setError("Slot not found or no longer available");
          return;
        }

        if (!selectedSlot.available) {
          setError("This slot is no longer available");
          return;
        }

        setSlot(selectedSlot);

        const savedEmail = await AsyncStorage.getItem("userEmail");
        if (savedEmail) {
          setFormData((prev) => ({ ...prev, bookingEmail: savedEmail }));
        }
      } catch (err) {
        setError("Failed to load slot details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlotDetails();
  }, [slotId]);

  const validateForm = (): boolean => {
    const errors = {
      bookingName: "",
      bookingEmail: "",
    };

    let isValid = true;

    // Validate name
    if (!formData.bookingName.trim()) {
      errors.bookingName = "Name is required";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.bookingEmail.trim()) {
      errors.bookingEmail = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.bookingEmail)) {
      errors.bookingEmail = "Please enter a valid email";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const result = await createAppointment(formData);

      Alert.alert(
        "Booking Successful",
        "Your appointment has been submitted and is pending confirmation.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/appointments") }]
      );
    } catch (error) {
      Alert.alert(
        "Booking Failed",
        "There was a problem booking your appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading slot details...</Text>
      </View>
    );
  }

  if (error || !slot) {
    return (
      <View style={styles.centered}>
        <Feather name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || "An error occurred"}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Book Appointment",
          headerStyle: {
            backgroundColor: Colors.card,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.slotInfoCard}>
          <Text style={styles.sectionTitle}>Selected Time Slot</Text>
          <Text style={styles.dateTime}>{formatDateTime(slot.startsAt)}</Text>
          <Text style={styles.duration}>
            Duration: {slot.durationMinutes} minutes
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Your Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.bookingName ? styles.inputError : null,
              ]}
              placeholder="Enter your full name"
              value={formData.bookingName}
              onChangeText={(text) =>
                setFormData({ ...formData, bookingName: text })
              }
            />
            {formErrors.bookingName ? (
              <Text style={styles.errorMessage}>{formErrors.bookingName}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.bookingEmail ? styles.inputError : null,
              ]}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.bookingEmail}
              onChangeText={(text) =>
                setFormData({ ...formData, bookingEmail: text })
              }
            />
            {formErrors.bookingEmail ? (
              <Text style={styles.errorMessage}>{formErrors.bookingEmail}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={formData.bookingPhone}
              onChangeText={(text) =>
                setFormData({ ...formData, bookingPhone: text })
              }
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          * By submitting this form, you agree to the booking terms and
          conditions.
        </Text>
      </ScrollView>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
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
    marginBottom: Spacing.md,
    color: Colors.error,
    fontSize: FontSize.md,
    textAlign: "center",
  },
  slotInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  dateTime: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: "500",
  },
  duration: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorMessage: {
    color: Colors.error,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
  },
  submitButtonText: {
    color: "white",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  disclaimer: {
    color: Colors.textLight,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  backButtonText: {
    color: "white",
    fontSize: FontSize.md,
    fontWeight: "500",
  },
});
