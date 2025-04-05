import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  ActivityIndicator,
  FAB,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Appointment, RootStackParamList } from "../types";
import { appointmentService } from "../api/services";
import { format, parseISO } from "date-fns";

type Props = NativeStackScreenProps<RootStackParamList, "MyAppointments">;

const MyAppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else if (!refresh && !hasMorePages) {
        return;
      } else {
        setLoading(true);
      }

      setError(null);

      const currentPage = refresh ? 1 : page;
      const response = await appointmentService.getAppointments(currentPage);

      const newAppointments = response.data;

      if (refresh) {
        setAppointments(newAppointments);
      } else {
        setAppointments([...appointments, ...newAppointments]);
      }

      setHasMorePages(currentPage < response.meta.total_pages);
      if (!refresh) {
        setPage(currentPage + 1);
      }
    } catch (err) {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchAppointments(true);
  };

  const handleViewAppointment = (appointmentId: number) => {
    navigation.navigate("AppointmentDetails", { appointmentId });
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    return (
      <Card style={styles.card} onPress={() => handleViewAppointment(item.id)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.name}</Title>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>

          <Paragraph style={styles.dateTime}>
            {format(parseISO(item.slot.start_time), "EEEE, MMMM d, yyyy")}
          </Paragraph>
          <Paragraph style={styles.dateTime}>
            {format(parseISO(item.slot.start_time), "h:mm a")} -{" "}
            {format(parseISO(item.slot.end_time), "h:mm a")}
          </Paragraph>

          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text>{item.email}</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text>{item.phone}</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => handleViewAppointment(item.id)}>
            View Details
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "rgba(76, 175, 80, 0.2)";
      case "cancelled":
        return "rgba(244, 67, 54, 0.2)";
      default:
        return "rgba(255, 152, 0, 0.2)";
    }
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
        <Text style={styles.footerText}>Loading more appointments...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => fetchAppointments(true)}>
            Try Again
          </Button>
        </View>
      )}

      {!error && (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Title style={styles.header}>My Appointments</Title>
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No appointments found</Text>
              </View>
            ) : null
          }
          ListFooterComponent={renderFooter}
          onEndReached={() => fetchAppointments()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="calendar-plus"
        onPress={() => navigation.navigate("Settings")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    margin: 16,
    fontSize: 24,
  },
  listContent: {
    padding: 8,
    paddingBottom: 80,
  },
  card: {
    marginHorizontal: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusChip: {
    borderRadius: 4,
  },
  dateTime: {
    marginBottom: 4,
  },
  contactInfo: {
    flexDirection: "row",
    marginTop: 8,
  },
  contactLabel: {
    fontWeight: "bold",
    marginRight: 8,
    width: 60,
  },
  footer: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MyAppointmentsScreen;
