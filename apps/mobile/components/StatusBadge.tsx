import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getStatusColor, getStatusText } from "../constants/theme";
import { FontSize, BorderRadius, Spacing } from "../constants/theme";

type StatusBadgeProps = {
  status: string;
  size?: "small" | "normal";
};

export default function StatusBadge({
  status,
  size = "normal",
}: StatusBadgeProps) {
  const backgroundColor = getStatusColor(status);
  const displayText = getStatusText(status);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === "small" ? styles.smallBadge : {},
      ]}
    >
      <Text style={[styles.text, size === "small" ? styles.smallText : {}]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.round,
    alignSelf: "flex-start",
  },
  smallBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
  },
  text: {
    color: "white",
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  smallText: {
    fontSize: FontSize.xs,
  },
});
