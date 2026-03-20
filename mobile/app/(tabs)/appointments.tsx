import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentCard from '@/components/AppointmentCard';
import type { AppointmentStatus } from '@/types';

type FilterTab = 'all' | AppointmentStatus;

const USER_TABS: FilterTab[] = ['all', 'pending', 'confirmed', 'completed'];
const ADMIN_TABS: FilterTab[] = [
  'all',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
];

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filters =
    activeTab === 'all' ? undefined : { status: activeTab as AppointmentStatus };

  const {
    data: appointments = [],
    isLoading,
    refetch,
    isRefetching,
  } = useAppointments(filters);

  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  const getTabLabel = (tab: FilterTab): string => {
    if (tab === 'all') return t('appointments.all');
    if (tab === 'no_show') return t('appointments.noShow');
    return t(`appointments.${tab}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.activeTab]}
              onPress={() => setActiveTab(item)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item && styles.activeTabText,
                ]}
              >
                {getTabLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Appointments List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                {t('appointments.noAppointments')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
