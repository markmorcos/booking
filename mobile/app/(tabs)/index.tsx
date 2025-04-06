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
import { useRouter } from "expo-router";
import { getAvailableSlots, AvailabilitySlot } from "../../api/client";
import SlotCard from "../../components/SlotCard";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";

export default function AvailableSlotsScreen() {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSlots = useCallback(async (showRefresh = false) => {
    try {
      if (!showRefresh) setLoading(true);
      const data = await getAvailableSlots();
      setSlots(data);
      setError(null);
    } catch (err) {
      console.error("Error in fetchSlots:", err);
      setError(
        "Failed to load available slots. Please check your network connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSlots(true);
  };

  const handleRetry = () => {
    setError(null);
    fetchSlots();
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    router.push({
      pathname: "/booking",
      params: { slotId: slot.id },
    });
  };

  const showNetworkTroubleshooting = () => {
    const platform = Platform.OS === "ios" ? "iOS" : "Android";
    Alert.alert(
      "Network Troubleshooting",
      `Make sure that:\n\n1. Your ${platform} device is connected to the internet\n2. The backend server is running (Rails)\n3. Your device can reach the server\n\nIf using an emulator, make sure the server is running on the correct port (default: 3000).`,
      [{ text: "OK" }]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading available slots...</Text>
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

  if (slots.length === 0) {
    return (
      <View style={styles.centered}>
        <Feather name="calendar" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>No available slots found</Text>
        <Text style={styles.emptySubText}>
          Pull down to refresh and check again
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={slots}
        renderItem={({ item }) => (
          <SlotCard slot={item} onSelect={() => handleSelectSlot(item)} />
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
