import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Text, ActivityIndicator } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AvailabilitySlot, RootStackParamList, AppointmentFormData } from '../types';
import { availabilitySlotService, appointmentService } from '../api/services';
import { format, parseISO } from 'date-fns';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;

const BookAppointmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { slotId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState<Partial<AppointmentFormData>>({
    availability_slot_id: slotId,
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

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
        if (foundSlot.booked) {
          setError('This slot is already booked');
        } else {
          setSlot(foundSlot);
        }
      } else {
        setError('Slot not found');
      }
    } catch (err) {
      setError('Failed to load slot details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AppointmentFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.name || formData.name.trim() === '') {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const response = await appointmentService.createAppointment(formData as AppointmentFormData);
      
      // Navigate to confirmation screen
      navigation.navigate('AppointmentConfirmation', { appointmentId: response.id });
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Failed to book appointment';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading slot details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  if (!slot) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Slot not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>Book an Appointment</Title>
        
        <View style={styles.slotInfo}>
          <Text style={styles.slotInfoText}>
            {format(parseISO(slot.start_time), 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={styles.slotInfoText}>
            {format(parseISO(slot.start_time), 'h:mm a')} - {format(parseISO(slot.end_time), 'h:mm a')}
          </Text>
        </View>

        <TextInput
          label="Full Name *"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          label="Email Address *"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          label="Notes (Optional)"
          value={formData.notes}
          onChangeText={(text) => handleChange('notes', text)}
          style={styles.input}
          multiline
          numberOfLines={4}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={submitting}
            disabled={submitting}
          >
            Book Appointment
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  slotInfo: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  slotInfoText: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});

export default BookAppointmentScreen; 