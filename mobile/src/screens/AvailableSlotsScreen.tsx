import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AvailabilitySlot, RootStackParamList } from '../types';
import { availabilitySlotService } from '../api/services';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

type Props = NativeStackScreenProps<RootStackParamList, 'AvailableSlots'>;

const AvailableSlotsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const weekEnd = endOfWeek(currentWeekStart);
      const availableSlots = await availabilitySlotService.getSlots(currentWeekStart, weekEnd);
      setSlots(availableSlots);
    } catch (err) {
      setError('Failed to load available slots. Please try again.');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [currentWeekStart]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleSlotPress = (slot: AvailabilitySlot) => {
    navigation.navigate('SlotDetails', { slotId: slot.id });
  };

  const renderSlot = ({ item }: { item: AvailabilitySlot }) => {
    const startTime = parseISO(item.start_time);
    const endTime = parseISO(item.end_time);
    
    return (
      <Card 
        style={styles.card} 
        mode="outlined"
        onPress={() => handleSlotPress(item)}
      >
        <Card.Content>
          <Title>{format(startTime, 'EEEE, MMMM d, yyyy')}</Title>
          <Paragraph>
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.weekSelector}>
        <Button
          mode="outlined"
          onPress={handlePreviousWeek}
          icon="chevron-left"
        >
          Previous
        </Button>
        <Text style={styles.weekText}>
          {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart), 'MMM d, yyyy')}
        </Text>
        <Button
          mode="outlined"
          onPress={handleNextWeek}
          icon="chevron-right"
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          Next
        </Button>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading available slots...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchSlots} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available slots for this week.</Text>
        </View>
      ) : (
        <FlatList
          data={slots}
          renderItem={renderSlot}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AvailableSlotsScreen; 