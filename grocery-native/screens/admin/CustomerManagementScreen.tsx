import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StatusBar,
  Alert,
} from 'react-native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function CustomerManagementScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCustomers();
      setCustomers(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const renderCustomer = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0) || 'C'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.phone || 'No phone on file'}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Orders</Text>
          <Text style={styles.statValue}>{item.totalPurchases || 0}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Points</Text>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{item.loyaltyPoints || 0}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>${(item.totalPurchases || 0).toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            if (item.phone) {
              Linking.openURL(`tel:${item.phone}`);
            } else {
              Alert.alert('No phone number', 'This customer does not have a phone number on file.');
            }
          }}
        >
          <Icon name="phone-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            Alert.alert(
              'Customer Summary',
              `Total purchases: ${item.totalPurchases || 0}\nLoyalty points: ${item.loyaltyPoints || 0}`
            )
          }
        >
          <Icon name="history" size={16} color={COLORS.text} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.title}>Customer Directory</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.textDim} />
          <TextInput
            style={styles.input}
            placeholder="Search by name or email..."
            placeholderTextColor={COLORS.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="account-off-outline" size={64} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  searchSection: {
    padding: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    fontSize: 16,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.glassBorder,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 16,
    marginTop: SPACING.md,
  },
});
