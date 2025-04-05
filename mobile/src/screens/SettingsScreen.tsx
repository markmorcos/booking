import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Switch } from "react-native";
import {
  List,
  Divider,
  Button,
  Text,
  Dialog,
  Portal,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false);
  const [feedbackDialogVisible, setFeedbackDialogVisible] = useState(false);
  const [feedback, setFeedback] = useState("");

  const toggleNotifications = () => {
    setReceiveNotifications(!receiveNotifications);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const showAboutDialog = () => {
    setAboutDialogVisible(true);
  };

  const hideAboutDialog = () => {
    setAboutDialogVisible(false);
  };

  const showFeedbackDialog = () => {
    setFeedbackDialogVisible(true);
  };

  const hideFeedbackDialog = () => {
    setFeedbackDialogVisible(false);
    setFeedback("");
  };

  const submitFeedback = () => {
    // In a real app, this would send the feedback to a server
    Alert.alert("Thank You", "Your feedback has been submitted successfully.");
    hideFeedbackDialog();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>

          <List.Item
            title="Receive Notifications"
            description="Get notified about appointment updates"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={receiveNotifications}
                onValueChange={toggleNotifications}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Dark Mode"
            description="Use dark theme for the app"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch value={darkMode} onValueChange={toggleDarkMode} />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Support</List.Subheader>

          <List.Item
            title="Help Center"
            description="Get help with using the app"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={() =>
              Alert.alert("Help Center", "This feature is coming soon.")
            }
          />

          <Divider />

          <List.Item
            title="Send Feedback"
            description="Help us improve the app"
            left={(props) => <List.Icon {...props} icon="message" />}
            onPress={showFeedbackDialog}
          />

          <Divider />

          <List.Item
            title="Contact Us"
            description="Get in touch with our team"
            left={(props) => <List.Icon {...props} icon="email" />}
            onPress={() =>
              Alert.alert(
                "Contact Information",
                "Email: support@fr-youhanna-makin.com\nPhone: (123) 456-7890"
              )
            }
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>

          <List.Item
            title="About the App"
            description="Learn more about our service"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={showAboutDialog}
          />

          <Divider />

          <List.Item
            title="Terms & Privacy Policy"
            description="Read our terms and policies"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() =>
              Alert.alert(
                "Terms & Privacy Policy",
                "This feature is coming soon."
              )
            }
          />

          <Divider />

          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="cellphone" />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>

      <Portal>
        <Dialog visible={aboutDialogVisible} onDismiss={hideAboutDialog}>
          <Dialog.Title>About Fr. Youhanna Makin</Dialog.Title>
          <Dialog.Content>
            <Text>
              Fr. Youhanna Makin Appointment Booking is a mobile application
              designed to make scheduling appointments with Fr. Youhanna Makin
              easier and more convenient.
            </Text>
            <Text style={styles.dialogText}>
              This app allows users to view available slots, book appointments,
              and receive confirmations. Administrators can manage appointments
              and availability.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideAboutDialog}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={feedbackDialogVisible} onDismiss={hideFeedbackDialog}>
          <Dialog.Title>Send Feedback</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              We value your feedback! Please let us know how we can improve the
              app.
            </Text>
            <TextInput
              label="Your feedback"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={5}
              style={styles.feedbackInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideFeedbackDialog}>Cancel</Button>
            <Button onPress={submitFeedback} disabled={!feedback.trim()}>
              Submit
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dialogText: {
    marginTop: 8,
  },
  feedbackInput: {
    marginTop: 16,
  },
});

export default SettingsScreen;
