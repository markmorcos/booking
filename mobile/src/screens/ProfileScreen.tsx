import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Text, Avatar, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import client from "../api/client";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  // In a real app, this would come from a global auth state
  const user = {
    name: "Admin User",
    email: "admin@fr-youhanna-makin.com",
    role: "Administrator",
  };

  const handleLogout = async () => {
    // Clear token
    await client.clearToken();

    // Navigate to login
    navigation.reset({
      index: 0,
      routes: [{ name: "AvailableSlots" }],
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.avatarContainer}>
          <Avatar.Text size={80} label={getInitials(user.name)} />
        </View>

        <Card.Content>
          <Title style={styles.name}>{user.name}</Title>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Role:</Text>
              <Text>{user.role}</Text>
            </View>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Settings")}
          >
            Settings
          </Button>

          <Button mode="contained" onPress={handleLogout}>
            Log Out
          </Button>
        </Card.Actions>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  name: {
    textAlign: "center",
    fontSize: 24,
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    width: 80,
  },
  actions: {
    justifyContent: "space-around",
    marginTop: 32,
  },
});

export default ProfileScreen;
