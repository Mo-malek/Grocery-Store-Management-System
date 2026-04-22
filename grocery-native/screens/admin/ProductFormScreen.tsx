import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function ProductFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editingProduct = route.params?.product;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '',
    minStock: '5',
    category: '',
    barcode: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        purchasePrice: (editingProduct.purchasePrice ?? editingProduct.cost ?? '')?.toString() || '',
        sellingPrice: (editingProduct.sellingPrice ?? editingProduct.price ?? '')?.toString() || '',
        currentStock: (editingProduct.currentStock ?? editingProduct.quantity ?? '')?.toString() || '',
        minStock: editingProduct.minStock?.toString() || '5',
        category: editingProduct.category || '',
        barcode: editingProduct.barcode || '',
      });
    }
  }, [editingProduct]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.sellingPrice || !formData.currentStock) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Selling Price, Stock)');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category || null,
        barcode: formData.barcode || null,
        purchasePrice: parseFloat(formData.purchasePrice || formData.sellingPrice || '0'),
        sellingPrice: parseFloat(formData.sellingPrice),
        currentStock: parseInt(formData.currentStock, 10),
        minStock: parseInt(formData.minStock || '5', 10),
        active: true,
      };

      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, payload);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await apiClient.createProduct(payload);
        Alert.alert('Success', 'Product created successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Save product failed:', error);
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Organic Bananas"
              placeholderTextColor={COLORS.textDim}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Fruits"
              placeholderTextColor={COLORS.textDim}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Purchase Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textDim}
                keyboardType="decimal-pad"
                value={formData.purchasePrice}
                onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
              />
            </View>
            <View style={[styles.col, { marginLeft: 12 }]}>
              <Text style={styles.label}>Selling Price ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textDim}
                keyboardType="decimal-pad"
                value={formData.sellingPrice}
                onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Current Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textDim}
                keyboardType="number-pad"
                value={formData.currentStock}
                onChangeText={(text) => setFormData({ ...formData, currentStock: text })}
              />
            </View>
            <View style={[styles.col, { marginLeft: 12 }]}>
              <Text style={styles.label}>Min Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                placeholderTextColor={COLORS.textDim}
                keyboardType="number-pad"
                value={formData.minStock}
                onChangeText={(text) => setFormData({ ...formData, minStock: text })}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Barcode</Text>
            <View style={styles.barcodeContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Scan or enter barcode"
                placeholderTextColor={COLORS.textDim}
                value={formData.barcode}
                onChangeText={(text) => setFormData({ ...formData, barcode: text })}
              />
              <TouchableOpacity style={styles.scanBtn}>
                <Icon name="barcode-scan" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Product details..."
              placeholderTextColor={COLORS.textDim}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.lg,
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  col: {
    flex: 1,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanBtn: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
