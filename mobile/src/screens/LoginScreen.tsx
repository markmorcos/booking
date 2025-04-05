import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { TextInput, Button, Title, Text, Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, LoginCredentials } from "../types";
import { authService } from "../api/services";
import client from "../api/client";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!credentials.email || !credentials.password) {
        setError("Please enter both email and password");
        setSnackbarVisible(true);
        return;
      }

      const response = await authService.login(credentials);

      // Store the token for future requests
      await client.setToken(response.token);

      // Navigate to admin section
      navigation.reset({
        index: 0,
        routes: [{ name: "MyAppointments" }],
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors
        ? err.response.data.errors.join(", ")
        : "Invalid email or password";
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            {/* Add your logo here */}
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Title style={styles.title}>Admin Login</Title>

          <TextInput
            label="Email"
            value={credentials.email}
            onChangeText={(text) => handleChange("email", text)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={credentials.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          >
            Login
          </Button>

          <Button
            onPress={() => navigation.navigate("AvailableSlots")}
            style={styles.backButton}
          >
            Back to Booking
          </Button>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: "OK",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 16,
  },
});

export default LoginScreen;
