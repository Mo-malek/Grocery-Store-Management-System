import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function OrderManagementScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return COLORS.primary;
      case 'PREPARING': return COLORS.secondary;
      case 'PENDING': return COLORS.accent;
      case 'CANCELLED': return COLORS.danger;
      case 'OUT_FOR_DELIVERY': return '#8b5cf6';
      default: return COLORS.textMuted;
    }
  };

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status || 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>👤 {item.customer?.fullName || item.customer?.username || 'Walk-in Customer'}</Text>
        <Text style={styles.orderTotal}>Total: ${item.totalAmount?.toFixed(2)}</Text>
      </View>

      <View style={styles.actionRow}>
        {item.status !== 'DELIVERED' && item.status !== 'CANCELLED' && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: COLORS.secondary }]}
              onPress={() => updateStatus(item.id, 'PREPARING')}
            >
              <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>Prepare</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: COLORS.primary }]}
              onPress={() => updateStatus(item.id, 'DELIVERED')}
            >
              <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Deliver</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'PENDING' && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: COLORS.danger }]}
            onPress={() => updateStatus(item.id, 'CANCELLED')}
          >
            <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadOrders}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="clipboard-off-outline" size={64} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>No orders found</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  customerInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 14,
    color: COLORS.text,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 16,
    marginTop: SPACING.md,
  },
});
