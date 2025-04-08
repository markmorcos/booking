import { Platform } from "react-native";

export const Colors = {
  border: "#e0e0e0",
  white: "#ffffff",
  primary: "#3157dc",
  primaryDark: "#1e3b9e",
  secondary: "#8cc63f",
  background: "#f9f9f9",
  card: "#ffffff",
  text: "#333333",
  textLight: "#888888",
  error: "#e53935",
  success: "#4caf50",
  warning: "#ff9800",
  pending: "#2196f3",
  cancelled: "#9e9e9e",
  completed: "#4caf50",
  noShow: "#e53935",
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const Shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return Colors.pending;
    case "confirmed":
      return Colors.primary;
    case "cancelled":
      return Colors.cancelled;
    case "completed":
      return Colors.completed;
    case "no_show":
      return Colors.noShow;
    default:
      return Colors.textLight;
  }
};

export const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
};
