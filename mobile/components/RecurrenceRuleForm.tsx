import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { RecurrenceRule } from '@/types';

interface RecurrenceRuleFormProps {
  initialValues?: Partial<RecurrenceRule>;
  onSubmit: (data: Omit<RecurrenceRule, 'id' | 'tenant_id'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function RecurrenceRuleForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: RecurrenceRuleFormProps) {
  const { t } = useTranslation();
  const [dayOfWeek, setDayOfWeek] = useState(initialValues?.day_of_week ?? 0);
  const [startTime, setStartTime] = useState(
    initialValues?.start_time ?? '09:00',
  );
  const [endTime, setEndTime] = useState(initialValues?.end_time ?? '17:00');
  const [slotDuration, setSlotDuration] = useState(
    String(initialValues?.slot_duration_minutes ?? 30),
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    initialValues?.effective_from ?? new Date().toISOString().split('T')[0],
  );
  const [effectiveUntil, setEffectiveUntil] = useState(
    initialValues?.effective_until ?? '',
  );

  const handleSubmit = () => {
    const duration = parseInt(slotDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert(t('common.error'), 'Invalid slot duration');
      return;
    }
    if (!startTime || !endTime) {
      Alert.alert(t('common.error'), 'Start and end time are required');
      return;
    }
    onSubmit({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: duration,
      effective_from: effectiveFrom,
      effective_until: effectiveUntil || undefined,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Day of Week Picker */}
      <Text style={styles.label}>{t('manage.dayOfWeek')}</Text>
      <View style={styles.dayRow}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, dayOfWeek === day && styles.dayButtonActive]}
            onPress={() => setDayOfWeek(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                dayOfWeek === day && styles.dayButtonTextActive,
              ]}
            >
              {t(`days.${day}`).substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Start Time */}
      <Text style={styles.label}>{t('manage.startTime')}</Text>
      <TextInput
        style={styles.input}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
      />

      {/* End Time */}
      <Text style={styles.label}>{t('manage.endTime')}</Text>
      <TextInput
        style={styles.input}
        value={endTime}
        onChangeText={setEndTime}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
      />

      {/* Slot Duration */}
      <Text style={styles.label}>{t('manage.slotDuration')}</Text>
      <TextInput
        style={styles.input}
        value={slotDuration}
        onChangeText={setSlotDuration}
        placeholder="30"
        keyboardType="numeric"
      />

      {/* Effective From */}
      <Text style={styles.label}>{t('manage.effectiveFrom')}</Text>
      <TextInput
        style={styles.input}
        value={effectiveFrom}
        onChangeText={setEffectiveFrom}
        placeholder="YYYY-MM-DD"
      />

      {/* Effective Until */}
      <Text style={styles.label}>{t('manage.effectiveUntil')}</Text>
      <TextInput
        style={styles.input}
        value={effectiveUntil}
        onChangeText={setEffectiveUntil}
        placeholder="YYYY-MM-DD"
      />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  dayButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dayButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
