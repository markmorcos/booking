import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import RecurrenceRuleForm from '@/components/RecurrenceRuleForm';
import {
  useRecurrenceRules,
  useCreateRecurrenceRule,
  useDeleteRecurrenceRule,
  useMaterializeSlots,
} from '@/hooks/useRecurrenceRules';
import type { RecurrenceRule } from '@/types';

export default function ManageScreen() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showMaterialize, setShowMaterialize] = useState(false);
  const [materializeFrom, setMaterializeFrom] = useState('');
  const [materializeTo, setMaterializeTo] = useState('');

  const {
    data: rules = [],
    isLoading,
    refetch,
    isRefetching,
  } = useRecurrenceRules();

  const createRule = useCreateRecurrenceRule();
  const deleteRule = useDeleteRecurrenceRule();
  const materialize = useMaterializeSlots();

  const handleCreateRule = (
    data: Omit<RecurrenceRule, 'id' | 'tenant_id'>,
  ) => {
    createRule.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        Alert.alert(t('common.success'), t('manage.ruleCreated'));
      },
      onError: (error) => {
        const msg =
          error instanceof Error ? error.message : t('common.error');
        Alert.alert(t('common.error'), msg);
      },
    });
  };

  const handleDeleteRule = (id: string) => {
    Alert.alert(t('manage.deleteRule'), t('manage.deleteRuleConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteRule.mutate(id, {
            onSuccess: () => {
              Alert.alert(t('common.success'), t('manage.ruleDeleted'));
            },
          });
        },
      },
    ]);
  };

  const handleMaterialize = () => {
    if (!materializeFrom || !materializeTo) {
      Alert.alert(t('common.error'), 'Please fill in both dates');
      return;
    }
    materialize.mutate(
      { from: materializeFrom, to: materializeTo },
      {
        onSuccess: (result) => {
          setShowMaterialize(false);
          setMaterializeFrom('');
          setMaterializeTo('');
          Alert.alert(
            t('common.success'),
            t('manage.materializeSuccess'),
          );
        },
        onError: (error) => {
          const msg =
            error instanceof Error ? error.message : t('common.error');
          Alert.alert(t('common.error'), msg);
        },
      },
    );
  };

  const renderRule = ({ item }: { item: RecurrenceRule }) => (
    <View style={styles.ruleCard}>
      <View style={styles.ruleInfo}>
        <Text style={styles.ruleDay}>{t(`days.${item.day_of_week}`)}</Text>
        <Text style={styles.ruleTime}>
          {item.start_time} - {item.end_time}
        </Text>
        <Text style={styles.ruleDuration}>
          {item.slot_duration_minutes} {t('manage.slotDuration').toLowerCase()}
        </Text>
        <Text style={styles.ruleEffective}>
          {t('manage.effectiveFrom')}: {item.effective_from}
          {item.effective_until
            ? ` | ${t('manage.effectiveUntil')}: ${item.effective_until}`
            : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRule(item.id)}
      >
        <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={rules}
        keyExtractor={(item) => item.id}
        renderItem={renderRule}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>
              {t('manage.recurringSchedule')}
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowForm(true)}
              >
                <Text style={styles.addButtonText}>
                  {t('manage.createRule')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.materializeButton}
                onPress={() => setShowMaterialize(true)}
              >
                <Text style={styles.materializeButtonText}>
                  {t('manage.materializeSlots')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('manage.noRules')}</Text>
          </View>
        }
      />

      {/* Create Rule Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('manage.createRule')}</Text>
          </View>
          <RecurrenceRuleForm
            onSubmit={handleCreateRule}
            onCancel={() => setShowForm(false)}
            isSubmitting={createRule.isPending}
          />
        </SafeAreaView>
      </Modal>

      {/* Materialize Modal */}
      <Modal
        visible={showMaterialize}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('manage.materializeSlots')}
            </Text>
          </View>
          <View style={styles.materializeForm}>
            <Text style={styles.label}>{t('manage.materializeFrom')}</Text>
            <TextInput
              style={styles.input}
              value={materializeFrom}
              onChangeText={setMaterializeFrom}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.label}>{t('manage.materializeTo')}</Text>
            <TextInput
              style={styles.input}
              value={materializeTo}
              onChangeText={setMaterializeTo}
              placeholder="YYYY-MM-DD"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => {
                  setShowMaterialize(false);
                  setMaterializeFrom('');
                  setMaterializeTo('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  materialize.isPending && styles.disabledButton,
                ]}
                onPress={handleMaterialize}
                disabled={materialize.isPending}
              >
                {materialize.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>
                    {t('common.confirm')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  materializeButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  materializeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ruleTime: {
    fontSize: 14,
    color: '#2563EB',
    marginTop: 2,
  },
  ruleDuration: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  ruleEffective: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  materializeForm: {
    paddingVertical: 16,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelModalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmModalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6EE7B7',
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
