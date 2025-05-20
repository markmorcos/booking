import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors, Spacing, FontSize } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Feather name="alert-circle" size={80} color={Colors.textLight} />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>
          Sorry, the page you are looking for doesn't exist.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.buttonText}>Go to home screen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
