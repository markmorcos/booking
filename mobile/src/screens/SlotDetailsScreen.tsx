import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AvailabilitySlot, RootStackParamList } from '../types';
import { availabilitySlotService } from '../api/services';
import { format, parseISO } from 'date-fns';

type Props = NativeStackScreenProps<RootStackParamList, 'SlotDetails'>;

const SlotDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { slotId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);

  useEffect(() => {
    fetchSlotDetails();
  }, [slotId]);

  const fetchSlotDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all slots and find the one with matching ID
      const slots = await availabilitySlotService.getSlots();
      const foundSlot = slots.find(s => s.id === slotId);
      
      if (foundSlot) {
        setSlot(foundSlot);
      } else {
        setError('Slot not found');
      }
    } catch (err) {
      setError('Failed to load slot details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigation.navigate('BookAppointment', { slotId });
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = parseISO(dateTimeStr);
    return format(date, 'EEEE, MMMM d, yyyy h:mm a');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading slot details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchSlotDetails}>Try Again</Button>
      </View>
    );
  }

  if (!slot) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Slot not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Appointment Slot Details</Title>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Paragraph>{format(parseISO(slot.start_time), 'EEEE, MMMM d, yyyy')}</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Time:</Text>
            <Paragraph>
              {format(parseISO(slot.start_time), 'h:mm a')} - {format(parseISO(slot.end_time), 'h:mm a')}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Paragraph>{slot.booked ? 'Booked' : 'Available'}</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Duration:</Text>
            <Paragraph>
              {Math.round((new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / (1000 * 60))} minutes
            </Paragraph>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
          {!slot.booked && (
            <Button mode="contained" onPress={handleBookAppointment}>
              Book This Slot
            </Button>
          )}
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 80,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default SlotDetailsScreen; 