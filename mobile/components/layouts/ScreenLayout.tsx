import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";

interface ScreenLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyText?: string;
  emptySubText?: string;
  emptyIcon?: string;
  loadingText?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
}

export default function ScreenLayout({
  children,
  isLoading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyText = "No data found",
  emptySubText = "Pull down to refresh and check again",
  emptyIcon = "calendar",
  loadingText = "Loading...",
  refreshing = false,
  onRefresh,
  scrollable = false,
}: ScreenLayoutProps) {
  const showNetworkTroubleshooting = () => {
    const platform = Platform.OS === "ios" ? "iOS" : "Android";
    Alert.alert(
      "Network Troubleshooting",
      `Make sure that:\n\n1. Your ${platform} device is connected to the internet\n2. The backend server is running (Rails)\n3. Your device can reach the server\n\nIf using an emulator, make sure the server is running on the correct port (default: 3000).`,
      [{ text: "OK" }]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Feather name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
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

  if (isEmpty) {
    return (
      <View style={styles.centered}>
        <Feather
          name={emptyIcon as "calendar"}
          size={48}
          color={Colors.textLight}
        />
        <Text style={styles.emptyText}>{emptyText}</Text>
        <Text style={styles.emptySubText}>{emptySubText}</Text>
      </View>
    );
  }

  if (scrollable && onRefresh) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
