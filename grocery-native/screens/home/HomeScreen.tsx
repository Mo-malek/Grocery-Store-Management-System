import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../services/api';
import { useCartStore } from '../../store/authStore';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, offersRes, statsRes] = await Promise.allSettled([
        apiClient.getStorefrontProducts(0, 8),
        apiClient.getStorefrontOffers(),
        apiClient.getDashboardStats()
      ]);

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data.content || productsRes.value.data || []);
      }
      if (offersRes.status === 'fulfilled') {
        setOffers(offersRes.value.data || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
      }
    >
      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Baqa'ah Market</Text>
          <Text style={styles.bannerSubtitle}>Freshness delivered to your doorstep</Text>
        </View>
        <Text style={styles.bannerEmoji}>🥦</Text>
      </View>

      {/* Offers Section */}
      {offers.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScroll}>
            {offers.map((offer: any) => (
              <TouchableOpacity key={offer.id} style={styles.offerCard}>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>{offer.discount}% OFF</Text>
                </View>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>{offer.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Stats (Only if admin/manager or specifically requested) */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProducts || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.lowStockCount || 0}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${stats.totalSalesToday?.toFixed(0) || 0}</Text>
            <Text style={styles.statLabel}>Today Sales</Text>
          </View>
        </View>
      )}

      {/* Featured Products */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {products.length > 0 ? (
          <View style={styles.productsGrid}>
            {products.map((product: any) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.productImageText}>{product.name.charAt(0)}</Text>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category || 'General'}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>${product.price?.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddToCart(product)}
                  >
                    <Text style={styles.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.noProducts}>No products available</Text>
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('Catalog')}
        >
          <Text style={styles.actionButtonText}>🛒 Start Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.actionButtonTextSecondary}>📦 Track Orders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  banner: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerEmoji: {
    fontSize: 60,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAll: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 14,
  },
  offersScroll: {
    paddingRight: 15,
    gap: 12,
  },
  offerCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  offerBadge: {
    backgroundColor: '#fee2e2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  offerBadgeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  productImagePlaceholder: {
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#10b981',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    height: 34,
  },
  productCategory: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noProducts: {
    color: '#9ca3af',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 30,
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  footer: {
    height: 20,
  },
});
