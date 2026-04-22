import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '../services/api';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 12;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  style,
}) => {
  const price = Number(product.sellingPrice ?? product.price ?? 0);
  const stock = product.currentStock ?? product.quantity ?? 0;
  const purchasePrice = Number(product.purchasePrice ?? product.cost ?? 0);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl || product.image || 'https://via.placeholder.com/200' }}
          style={styles.image}
        />
        {stock <= 5 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.category}>{product.category}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>${price.toLocaleString()}</Text>
          {purchasePrice > 0 && purchasePrice < price && (
            <Text style={styles.discount}>
              Save {Math.round(((price - purchasePrice) / price) * 100)}%
            </Text>
          )}
        </View>

        {onAddToCart && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 6,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  discount: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
