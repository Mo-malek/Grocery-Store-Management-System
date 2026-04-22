import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/api';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/Theme';

export default function HistoryScreen() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSales();
      const salesData = response.data?.content || response.data || [];
      setSales(salesData);
      const total = salesData.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
      setStats({ total, count: salesData.length });
    } catch (error) {
      console.error('Failed to load sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecipientName = (sale: any) =>
    sale.externalCustomerName || sale.customer?.name || sale.customer?.fullName || 'Walk-in';

  const getRecipientPhone = (sale: any) =>
    sale.externalCustomerPhone || sale.customer?.phone || '-';

  const getItems = (sale: any) => (Array.isArray(sale.items) ? sale.items : []);

  const showSaleDetails = (sale: any) => {
    const itemsText = getItems(sale)
      .map((item: any) => `${item.productName || 'Item'} x${item.quantity} = $${Number(item.total || 0).toFixed(2)}`)
      .join('\n');

    Alert.alert(
      `Sale #${sale.id}`,
      `Recipient: ${getRecipientName(sale)}\nPhone: ${getRecipientPhone(sale)}\nTotal: $${Number(sale.total || 0).toFixed(2)}\nPayment: ${sale.paymentMethod || 'CASH'}\n\nItems:\n${itemsText || '-'}`
    );
  };

  const renderSale = ({ item }: any) => (
    <TouchableOpacity style={styles.saleCard} onPress={() => showSaleDetails(item)}>
      <View style={styles.saleHeader}>
        <View>
          <Text style={styles.saleId}>Invoice #{item.id}</Text>
          <Text style={styles.saleDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.saleAmountContainer}>
          <Text style={styles.saleAmount}>${Number(item.total || 0).toFixed(2)}</Text>
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentText}>{item.paymentMethod || 'CASH'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.recipientBlock}>
        <Text style={styles.recipientLabel}>Recipient</Text>
        <Text style={styles.recipientName}>{getRecipientName(item)}</Text>
        <Text style={styles.recipientPhone}>{getRecipientPhone(item)}</Text>
      </View>

      <View style={styles.itemsBlock}>
        <Text style={styles.itemsTitle}>Items Sold</Text>
        {getItems(item).length ? (
          getItems(item).map((saleItem: any) => (
            <View
              key={saleItem.id?.toString() || `${saleItem.productName}-${saleItem.quantity}`}
              style={styles.itemRow}
            >
              <Text style={styles.itemName}>
                {saleItem.productName || 'Item'} x{saleItem.quantity}
              </Text>
              <Text style={styles.itemTotal}>${Number(saleItem.total || 0).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>-</Text>
        )}
      </View>

      <View style={styles.saleFooter}>
        <View style={styles.channelBadge}>
          <Text style={styles.channelText}>{item.saleChannel || 'POS'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Audit Log & History</Text>
        <View style={styles.statsBar}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Period Revenue</Text>
            <Text style={styles.statValue}>${stats.total.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Invoices</Text>
            <Text style={styles.statValue}>{stats.count}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={sales}
          renderItem={renderSale}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={loadSales}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="history" size={64} color={COLORS.surfaceLight} />
              <Text style={styles.emptyText}>No sales found in history</Text>
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: 20,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  saleCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  saleDate: {
    fontSize: 11,
    color: COLORS.textDim,
    marginTop: 2,
  },
  saleAmountContainer: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentBadge: {
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  paymentText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.glassBorder,
    marginVertical: 12,
  },
  recipientBlock: {
    marginBottom: 10,
  },
  recipientLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: COLORS.textDim,
    marginBottom: 3,
    letterSpacing: 1,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  recipientPhone: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemsBlock: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  itemsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
    paddingRight: 8,
  },
  itemTotal: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  noItems: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  saleFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  channelBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  channelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
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
