import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentConfirmation'>;

const AppointmentConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId } = route.params;

  const handleHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AvailableSlots' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <IconButton
            icon="check-circle"
            size={80}
            iconColor="#4CAF50"
          />
        </View>

        <Title style={styles.title}>Appointment Confirmed!</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>
              Your appointment request has been submitted successfully. 
            </Text>
            
            <Text style={styles.message}>
              You will receive an email confirmation shortly with the details of your appointment.
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.detailLabel}>Appointment ID:</Text>
            <Text style={styles.detailValue}>{appointmentId}</Text>
            
            <View style={styles.note}>
              <Text style={styles.noteText}>
                <Text style={styles.noteTitle}>Note: </Text>
                Fr. Youhanna Makin will review your request and confirm the appointment. If there are any issues, you will be contacted via the email address you provided.
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleHome}
            style={styles.button}
          >
            Return to Home
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailValue: {
    marginBottom: 16,
  },
  note: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  noteTitle: {
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    padding: 4,
  },
});

export default AppointmentConfirmationScreen;
