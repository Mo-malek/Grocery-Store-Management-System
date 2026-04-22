import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { apiClient } from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import { getProductImage } from '../../constants/AssetMap';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - SPACING.lg * 3) / 2;

export default function InventoryScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const initialCategory = route?.params?.category || '';

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalValue: 0,
  });

  const loadInventory = useCallback(async () => {
    try {
      const response = await apiClient.getProducts();
      const productsData = response.data?.content || response.data || [];
      setProducts(productsData);

      applyFilters(productsData, search);
      calculateStats(productsData);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    if (isFocused) {
      loadInventory();
    }
  }, [isFocused, initialCategory, loadInventory]);

  const calculateStats = (data: any[]) => {
    if (Array.isArray(data)) {
      const lowStockCount = data.filter((p: any) => (p.currentStock ?? p.quantity ?? 0) < 10).length;
      const totalValue = data.reduce((sum: number, p: any) => {
        const stock = p.currentStock ?? p.quantity ?? 0;
        const price = p.sellingPrice ?? p.price ?? 0;
        return sum + price * stock;
      }, 0);
      setStats({
        totalProducts: data.length,
        lowStockCount,
        totalValue,
      });
    }
  };

  const applyFilters = (data: any[], queryText: string) => {
    let filtered = data;

    if (initialCategory) {
      filtered = filtered.filter((p: any) => p.category === initialCategory);
    }

    if (queryText) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(queryText.toLowerCase()) ||
        product.category?.toLowerCase().includes(queryText.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    applyFilters(products, text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInventory();
  };

  const renderProduct = ({ item }: { item: any }) => {
    const productImage = getProductImage(item.name);
    const stock = item.currentStock ?? item.quantity ?? 0;
    const price = item.sellingPrice ?? item.price ?? 0;
    const isLowStock = stock < 10;
    const isOutOfStock = stock <= 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductForm', { product: item })}
      >
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image source={productImage} style={styles.productImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          {isLowStock && (
            <View style={[styles.badge, { backgroundColor: isOutOfStock ? COLORS.danger : COLORS.accent }]}>
              <Text style={styles.badgeText}>{isOutOfStock ? 'OUT' : 'LOW'}</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{item.category || 'General'}</Text>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${Number(price).toFixed(2)}</Text>
            <View style={styles.stockBox}>
              <Icon name="package-variant-closed" size={12} color={COLORS.textMuted} />
              <Text style={styles.stockCount}>{stock}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSubtitle}>{stats.totalProducts} Total Items</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ProductForm')}
        >
          <Icon name="plus" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Value</Text>
          <Text style={styles.statValue}>${stats.totalValue.toFixed(0)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Low Stock</Text>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{stats.lowStockCount}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products or categories..."
            placeholderTextColor={COLORS.textDim}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={18} color={COLORS.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="package-variant" size={64} color={COLORS.surfaceLight} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          ) : null
        }
      />

      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.glassBorder,
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  imageContainer: {
    height: 120,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  productInfo: {
    padding: SPACING.md,
  },
  productCategory: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  stockBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.textDim,
    marginTop: 4,
  },
});
