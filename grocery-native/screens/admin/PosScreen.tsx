import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { apiClient } from '../../services/api';

const HOLD_CART_KEY = 'posHeldCart_v1';

export default function PosScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [cashReceived, setCashReceived] = useState('');
  const [receiptRecipientName, setReceiptRecipientName] = useState('');
  const [receiptRecipientPhone, setReceiptRecipientPhone] = useState('');
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts();
      setProducts(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnitPrice = (item: any) => Number(item.sellingPrice ?? item.price ?? 0);
  const getUnitStock = (item: any) => Number(item.currentStock ?? item.quantity ?? 0);

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
      return;
    }
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find((item) => item.id === productId);
    if (!existing) return;
    if (existing.quantity > 1) {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)));
      return;
    }
    setCart(cart.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);
  const calculateItemsCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const clearCart = () => {
    setCart([]);
    setCashReceived('');
    setReceiptRecipientName('');
    setReceiptRecipientPhone('');
  };

  const holdCurrentCart = async () => {
    if (!cart.length) {
      Alert.alert('No cart to hold', 'Add products before holding this transaction.');
      return;
    }
    try {
      await AsyncStorage.setItem(
        HOLD_CART_KEY,
        JSON.stringify({ cart, paymentMethod, search, savedAt: new Date().toISOString() })
      );
      Alert.alert('Cart saved', 'This transaction is now held and can be resumed.');
    } catch (error) {
      Alert.alert('Save failed', 'Could not hold this transaction right now.');
    }
  };

  const resumeHeldCart = async () => {
    try {
      const held = await AsyncStorage.getItem(HOLD_CART_KEY);
      if (!held) {
        Alert.alert('No held cart', 'No saved transaction was found.');
        return;
      }
      const parsed = JSON.parse(held);
      setCart(Array.isArray(parsed.cart) ? parsed.cart : []);
      setPaymentMethod(parsed.paymentMethod === 'CARD' ? 'CARD' : 'CASH');
      setSearch(parsed.search || '');
      setShowCart(true);
      Alert.alert('Transaction resumed', 'Held transaction loaded into cart.');
    } catch (error) {
      Alert.alert('Resume failed', 'Could not load the held transaction.');
    }
  };

  const clearHeldCart = async () => {
    await AsyncStorage.removeItem(HOLD_CART_KEY);
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Camera permission required', 'Please allow camera access to scan barcodes.');
        return;
      }
    }
    setHasScanned(false);
    setShowScanner(true);
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (hasScanned || scannerLoading) return;
    setHasScanned(true);
    setScannerLoading(true);

    try {
      const response = await apiClient.getProductByBarcode(data);
      const product = response.data;
      if (!product?.id) throw new Error('No product found');
      addToCart(product);
      setSearch(data);
      setShowScanner(false);
      Alert.alert('Added to cart', `${product.name} was added from barcode scan.`);
    } catch (error) {
      Alert.alert('Not found', 'No product matched this barcode. You can scan again.');
      setHasScanned(false);
    } finally {
      setScannerLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setCheckoutLoading(true);
      const response = await apiClient.createSale({
        paymentMethod,
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        externalCustomerName: receiptRecipientName?.trim() || undefined,
        externalCustomerPhone: receiptRecipientPhone?.trim() || undefined,
      });
      const sale = response.data;
      setLastSaleReceipt({
        ...sale,
        receiptRecipientName,
        receiptRecipientPhone,
      });
      setShowReceipt(true);
      Alert.alert('Success', 'Sale completed successfully.');
      clearCart();
      await clearHeldCart();
      setShowCart(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process sale.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)
  );

  const smartSuggestions = useMemo(() => {
    if (!products.length) return [];
    const cartProductIds = new Set(cart.map((item) => item.id));
    const cartCategories = new Set(cart.map((item) => String(item.category || '').toLowerCase()).filter(Boolean));

    return products
      .filter((product) => !cartProductIds.has(product.id))
      .map((product) => {
        const stock = getUnitStock(product);
        const price = getUnitPrice(product);
        const cost = Number(product.cost ?? product.purchasePrice ?? 0);
        const margin = Math.max(0, price - cost);
        const categoryMatch = cartCategories.has(String(product.category || '').toLowerCase()) ? 3 : 0;
        const score = categoryMatch + Math.min(2, margin / 5) + (stock > 0 ? 1 : -1);
        return { product, score };
      })
      .filter(({ product }) => getUnitStock(product) > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ product }) => product);
  }, [cart, products]);

  const total = calculateTotal();
  const quickCashValues = useMemo(() => [total, total + 5, total + 10], [total]);
  const changeDue = paymentMethod === 'CASH' ? Math.max(0, Number(cashReceived || 0) - total) : 0;

  const formatReceiptDate = (date: string) => {
    if (!date) return new Date().toLocaleString();
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleString();
  };

  const receiptItems = useMemo(() => {
    if (!lastSaleReceipt?.items?.length) return [];
    return lastSaleReceipt.items;
  }, [lastSaleReceipt]);

  const buildReceiptText = () => {
    if (!lastSaleReceipt) return '';
    const lines = [
      'Baqaah Grocery Receipt',
      `Sale #${lastSaleReceipt.id ?? '-'}`,
      `Date: ${formatReceiptDate(lastSaleReceipt.createdAt)}`,
      `Payment: ${lastSaleReceipt.paymentMethod ?? paymentMethod}`,
      '',
      'Items:',
      ...receiptItems.map(
        (item: any) =>
          `- ${item.productName || 'Item'} x${item.quantity} = $${Number(item.total ?? 0).toFixed(2)}`
      ),
      '',
      `Subtotal: $${Number(lastSaleReceipt.subtotal ?? 0).toFixed(2)}`,
      `Discount: $${Number(lastSaleReceipt.discount ?? 0).toFixed(2)}`,
      `Total: $${Number(lastSaleReceipt.total ?? 0).toFixed(2)}`,
    ];

    if (lastSaleReceipt.receiptRecipientName) {
      lines.push(`Customer: ${lastSaleReceipt.receiptRecipientName}`);
    }
    if (lastSaleReceipt.receiptRecipientPhone) {
      lines.push(`Phone: ${lastSaleReceipt.receiptRecipientPhone}`);
    }

    lines.push('', 'Thank you for shopping with us.');
    return lines.join('\n');
  };

  const shareReceipt = async () => {
    if (!lastSaleReceipt) return;
    await Share.share({ message: buildReceiptText() });
  };

  const shareReceiptToWhatsApp = async () => {
    if (!lastSaleReceipt) return;
    const message = buildReceiptText();
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
      return;
    }
    await Share.share({ message });
    Alert.alert('WhatsApp not found', 'Shared with default share sheet instead.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terminal POS</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => setShowCart(true)}>
          <Icon name="cart-outline" size={18} color="#fff" />
          <Text style={styles.cartBtnText}>{calculateItemsCount()} items</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search product or scan barcode..."
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.scanBtn} onPress={openScanner}>
            <Icon name="barcode-scan" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.smartSection}>
        <View style={styles.smartHeader}>
          <Text style={styles.smartTitle}>Smart Boost</Text>
          <Text style={styles.smartSubtitle}>High-value picks for this transaction</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartList}>
          {smartSuggestions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.smartCard} onPress={() => addToCart(item)}>
              <Text style={styles.smartName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.smartMeta}>{item.category || 'General'}</Text>
              <View style={styles.smartFooter}>
                <Text style={styles.smartPrice}>${getUnitPrice(item).toFixed(2)}</Text>
                <View style={styles.smartAddPill}>
                  <Icon name="plus" size={14} color="#10b981" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {!smartSuggestions.length && (
            <View style={styles.smartEmpty}>
              <Text style={styles.smartEmptyText}>Add products to unlock smart suggestions</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
              <View style={styles.productIcon}>
                <Text style={styles.productInitial}>{item.name.charAt(0)}</Text>
              </View>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>${getUnitPrice(item).toFixed(2)}</Text>
              <Text style={styles.productStock}>Stock: {getUnitStock(item)}</Text>
              <View style={styles.addIndicator}>
                <Text style={styles.addText}>+</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={showCart} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Current Sale</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartList}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>
                    ${getUnitPrice(item).toFixed(2)} x {item.quantity}
                  </Text>
                </View>
                <View style={styles.qtyActions}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {cart.length === 0 && <Text style={styles.emptyCart}>Cart is empty</Text>}
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.sessionActions}>
              <TouchableOpacity style={styles.sessionActionBtn} onPress={holdCurrentCart}>
                <Icon name="pause-circle-outline" size={18} color="#475569" />
                <Text style={styles.sessionActionText}>Hold</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sessionActionBtn} onPress={resumeHeldCart}>
                <Icon name="play-circle-outline" size={18} color="#475569" />
                <Text style={styles.sessionActionText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sessionActionBtn} onPress={clearCart}>
                <Icon name="trash-can-outline" size={18} color="#ef4444" />
                <Text style={[styles.sessionActionText, styles.sessionActionDanger]}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentRow}>
              <TouchableOpacity
                style={[styles.paymentBtn, paymentMethod === 'CASH' && styles.paymentBtnActive]}
                onPress={() => setPaymentMethod('CASH')}
              >
                <Text style={[styles.paymentBtnText, paymentMethod === 'CASH' && styles.paymentBtnTextActive]}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentBtn, paymentMethod === 'CARD' && styles.paymentBtnActive]}
                onPress={() => setPaymentMethod('CARD')}
              >
                <Text style={[styles.paymentBtnText, paymentMethod === 'CARD' && styles.paymentBtnTextActive]}>Card</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'CASH' && (
              <View style={styles.cashBlock}>
                <Text style={styles.cashLabel}>Quick Cash</Text>
                <View style={styles.quickCashRow}>
                  {quickCashValues.map((value, index) => (
                    <TouchableOpacity
                      key={`${value}-${index}`}
                      style={styles.quickCashBtn}
                      onPress={() => setCashReceived(value.toFixed(2))}
                    >
                      <Text style={styles.quickCashBtnText}>${value.toFixed(2)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={cashReceived}
                  onChangeText={setCashReceived}
                  keyboardType="decimal-pad"
                  placeholder="Cash received"
                  style={styles.cashInput}
                />
                <View style={styles.changeRow}>
                  <Text style={styles.changeLabel}>Change Due</Text>
                  <Text style={styles.changeValue}>${changeDue.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <View style={styles.recipientBlock}>
              <Text style={styles.cashLabel}>Receipt Recipient (Optional)</Text>
              <TextInput
                value={receiptRecipientName}
                onChangeText={setReceiptRecipientName}
                placeholder="Customer name"
                style={styles.cashInput}
              />
              <TextInput
                value={receiptRecipientPhone}
                onChangeText={setReceiptRecipientPhone}
                placeholder="Customer phone"
                keyboardType="phone-pad"
                style={styles.cashInput}
              />
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, cart.length === 0 && styles.disabledBtn]}
              onPress={handleCheckout}
              disabled={cart.length === 0 || checkoutLoading}
            >
              {checkoutLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutBtnText}>Complete Sale</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showScanner} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Barcode</Text>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
              }}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Align barcode inside the frame</Text>
            </View>
          </View>

          <View style={styles.scannerFooter}>
            {scannerLoading ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <TouchableOpacity style={styles.rescanBtn} onPress={() => setHasScanned(false)}>
                <Text style={styles.rescanBtnText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showReceipt} animationType="slide" transparent>
        <View style={styles.receiptBackdrop}>
          <View style={styles.receiptModal}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Sale Receipt</Text>
              <TouchableOpacity onPress={() => setShowReceipt(false)}>
                <Icon name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.receiptBody}>
              <Text style={styles.receiptLine}>Sale #{lastSaleReceipt?.id ?? '-'}</Text>
              <Text style={styles.receiptLine}>Date: {formatReceiptDate(lastSaleReceipt?.createdAt)}</Text>
              <Text style={styles.receiptLine}>Payment: {lastSaleReceipt?.paymentMethod ?? paymentMethod}</Text>
              {lastSaleReceipt?.receiptRecipientName ? (
                <Text style={styles.receiptLine}>Customer: {lastSaleReceipt.receiptRecipientName}</Text>
              ) : null}
              {lastSaleReceipt?.receiptRecipientPhone ? (
                <Text style={styles.receiptLine}>Phone: {lastSaleReceipt.receiptRecipientPhone}</Text>
              ) : null}
              <Text style={styles.receiptSectionTitle}>Items</Text>
              {receiptItems.map((item: any) => (
                <View key={item.id ?? `${item.productName}-${item.quantity}`} style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemName}>{item.productName || 'Item'} x{item.quantity}</Text>
                  <Text style={styles.receiptItemTotal}>${Number(item.total ?? 0).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.receiptTotals}>
                <Text style={styles.receiptLine}>Subtotal: ${Number(lastSaleReceipt?.subtotal ?? 0).toFixed(2)}</Text>
                <Text style={styles.receiptLine}>Discount: ${Number(lastSaleReceipt?.discount ?? 0).toFixed(2)}</Text>
                <Text style={styles.receiptTotalLine}>Total: ${Number(lastSaleReceipt?.total ?? 0).toFixed(2)}</Text>
              </View>
            </ScrollView>
            <View style={styles.receiptActions}>
              <TouchableOpacity style={styles.receiptShareBtn} onPress={shareReceipt}>
                <Icon name="share-variant-outline" size={18} color="#0f172a" />
                <Text style={styles.receiptShareText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptWhatsAppBtn} onPress={shareReceiptToWhatsApp}>
                <Icon name="whatsapp" size={18} color="#fff" />
                <Text style={styles.receiptWhatsAppText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  cartBtn: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBtnText: { color: '#fff', fontWeight: '700' },
  searchContainer: { padding: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  scanBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartSection: { paddingHorizontal: 15, marginBottom: 10 },
  smartHeader: { marginBottom: 10 },
  smartTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  smartSubtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },
  smartList: { paddingBottom: 2 },
  smartCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  smartName: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  smartMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  smartFooter: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smartPrice: { color: '#10b981', fontSize: 15, fontWeight: '800' },
  smartAddPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartEmpty: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  smartEmptyText: { color: '#64748b', fontSize: 12 },
  row: { justifyContent: 'space-between', paddingHorizontal: 15 },
  productCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
    position: 'relative',
  },
  productIcon: {
    height: 80,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productInitial: { fontSize: 32, fontWeight: 'bold', color: '#10b981' },
  productName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginVertical: 2 },
  productStock: { fontSize: 11, color: '#9ca3af' },
  addIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  closeBtn: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  cartList: { flex: 1, padding: 20 },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cartItemName: { fontSize: 16, fontWeight: '600' },
  cartItemPrice: { fontSize: 14, color: '#6b7280' },
  qtyActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: 'bold' },
  qtyText: { fontSize: 16, fontWeight: 'bold' },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  sessionActions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sessionActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#fff',
  },
  sessionActionText: { color: '#475569', fontWeight: '700', fontSize: 12 },
  sessionActionDanger: { color: '#ef4444' },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  paymentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  paymentBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  paymentBtnText: { color: '#6b7280', fontWeight: '600' },
  paymentBtnTextActive: { color: '#fff' },
  cashBlock: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  cashLabel: { color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  quickCashRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickCashBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#e2e8f0' },
  quickCashBtnText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  cashInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    marginBottom: 10,
  },
  changeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  changeLabel: { color: '#64748b', fontSize: 13 },
  changeValue: { color: '#0f172a', fontWeight: '800', fontSize: 15 },
  recipientBlock: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 18, color: '#6b7280' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  checkoutBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 12, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#d1d5db' },
  emptyCart: { textAlign: 'center', marginTop: 50, color: '#9ca3af', fontSize: 16 },
  scannerContainer: { flex: 1, backgroundColor: '#0b1220' },
  scannerHeader: {
    paddingTop: 58,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  scannerTitle: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  cameraWrap: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  camera: { flex: 1 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame: {
    width: 260,
    height: 140,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanHint: {
    marginTop: 18,
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scannerFooter: { paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' },
  rescanBtn: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  rescanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  receiptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  receiptModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  receiptHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  receiptBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  receiptLine: {
    color: '#334155',
    fontSize: 13,
    marginBottom: 4,
  },
  receiptSectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  receiptItemName: {
    color: '#334155',
    fontSize: 13,
    flex: 1,
    paddingRight: 8,
  },
  receiptItemTotal: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  receiptTotals: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  receiptTotalLine: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  receiptShareBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  receiptShareText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  receiptWhatsAppBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  receiptWhatsAppText: {
    color: '#fff',
    fontWeight: '700',
  },
});
