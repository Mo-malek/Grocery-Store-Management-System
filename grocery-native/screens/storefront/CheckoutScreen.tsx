import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore, useAuthStore } from '../../store/authStore';
import apiClient from '../../services/api';

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { items, total, clear } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  useEffect(() => {
    setFullName(user?.fullName || user?.username || '');
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
  }, [user]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing information', 'Please fill in your name, phone, and delivery address.');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await apiClient.createOrder(orderData);

      Alert.alert(
        "Success",
        "Your order has been placed successfully!",
        [{ text: "OK", onPress: () => {
          clear();
          navigation.navigate('Orders');
        }}]
      );
    } catch (error: any) {
      console.error('Order placement failed:', error);
      Alert.alert("Error", error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.infoCard}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#9ca3af"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Delivery address"
            placeholderTextColor="#9ca3af"
            multiline
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          {items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (10%)</Text>
            <Text style={styles.totalValue}>${(total * 0.1).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>${(total * 1.1).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderBtn, loading && styles.disabledBtn]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderBtnText}>Place Order</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  addressInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#4b5563',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  placeOrderBtn: {
    backgroundColor: '#10b981',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  placeOrderBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 40,
  },
});
