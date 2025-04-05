import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { RootStackParamList } from './types';

// Import screens once created
import AvailableSlotsScreen from './screens/AvailableSlotsScreen';
import SlotDetailsScreen from './screens/SlotDetailsScreen';
import BookAppointmentScreen from './screens/BookAppointmentScreen';
import AppointmentConfirmationScreen from './screens/AppointmentConfirmationScreen';
import MyAppointmentsScreen from './screens/MyAppointmentsScreen';
import AppointmentDetailsScreen from './screens/AppointmentDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';

// Create the navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Main App component
const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="AvailableSlots" screenOptions={{ headerShown: true }}>
            {/* Public screens */}
            <Stack.Screen 
              name="AvailableSlots" 
              component={AvailableSlotsScreen} 
              options={{ title: 'Available Appointment Slots' }} 
            />
            <Stack.Screen 
              name="SlotDetails" 
              component={SlotDetailsScreen} 
              options={{ title: 'Slot Details' }} 
            />
            <Stack.Screen 
              name="BookAppointment" 
              component={BookAppointmentScreen} 
              options={{ title: 'Book Appointment' }} 
            />
            <Stack.Screen 
              name="AppointmentConfirmation" 
              component={AppointmentConfirmationScreen} 
              options={{ title: 'Appointment Confirmation' }} 
            />
            
            {/* Protected screens */}
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ title: 'Admin Login' }} 
            />
            <Stack.Screen 
              name="MyAppointments" 
              component={MyAppointmentsScreen} 
              options={{ title: 'My Appointments' }} 
            />
            <Stack.Screen 
              name="AppointmentDetails" 
              component={AppointmentDetailsScreen} 
              options={{ title: 'Appointment Details' }} 
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Profile' }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App; 