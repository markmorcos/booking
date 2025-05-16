import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: { paddingBottom: 5 },
        headerStyle: {
          backgroundColor: Colors.card,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Booking",
          tabBarLabel: "Slots",
          tabBarIcon: ({ color }: any) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "My Appointments",
          tabBarLabel: "Appointments",
          tabBarIcon: ({ color }: any) => (
            <Feather name="list" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
