import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useCartStore } from '../../store/authStore';
import { apiClient } from '../../services/api';

export default function CatalogScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadCategories(), loadProducts()]);
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.getStorefrontCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async (category?: string) => {
    try {
      const response = await apiClient.getStorefrontProducts(0, 50, category);
      // Backend might return page object or array
      const data = response.data?.content || response.data || [];
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCategories(), loadProducts(selectedCategory || undefined)]);
    setRefreshing(false);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    loadProducts(category || undefined);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  const renderProduct = ({ item }: any) => (
    <View style={styles.productCard}>
      <View style={styles.productImage}>
        <Text style={styles.productEmoji}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category || 'General'}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Market</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search fresh groceries..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryBtn, !selectedCategory && styles.categoryBtnActive]}
            onPress={() => handleCategorySelect(null)}
          >
            <Text style={[styles.categoryBtnText, !selectedCategory && styles.categoryBtnTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text style={[styles.categoryBtnText, selectedCategory === cat && styles.categoryBtnTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>No products found</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={() => handleCategorySelect(null)}>
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  categoryWrapper: {
    paddingVertical: 15,
  },
  categoryScroll: {
    paddingHorizontal: 15,
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryBtnText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  productImage: {
    height: 120,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 50,
    color: '#10b981',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    height: 40,
  },
  productCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
  },
  resetBtn: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  resetBtnText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
});
