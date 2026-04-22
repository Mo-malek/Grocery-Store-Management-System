import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

export default function OrderDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getOrderById(orderId);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to load order details:', error);
            Alert.alert('Error', 'Could not load order details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            await apiClient.updateOrderStatus(orderId, newStatus);
            Alert.alert('Success', `Status updated to ${newStatus}`);
            loadOrderDetails();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Order Header */}
                <View style={styles.card}>
                    <View style={styles.orderMeta}>
                        <View>
                            <Text style={styles.orderLabel}>Order ID</Text>
                            <Text style={styles.orderId}>#{order?.id}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order?.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(order?.status) }]}>
                                {order?.status}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.metaRow}>
                        <Icon name="calendar-month" size={16} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>{format(new Date(order?.createdAt), 'PPP p')}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Icon name="account" size={16} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>
                                {order?.customer?.fullName || order?.customer?.username || 'Walk-in Customer'}
                            </Text>
                    </View>
                </View>

                {/* Status Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    <View style={styles.statusActions}>
                        {['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusBtn,
                                    order?.status === status && { backgroundColor: getStatusColor(status) },
                                    { borderColor: getStatusColor(status) }
                                ]}
                                onPress={() => updateStatus(status)}
                            >
                                <Text style={[
                                    styles.statusBtnText,
                                    order?.status === status ? { color: COLORS.white } : { color: getStatusColor(status) }
                                ]}>
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    <View style={styles.card}>
                        {order?.items?.map((item: any, index: number) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.productName}</Text>
                                    <Text style={styles.itemQty}>{item.quantity} x ${item.unitPrice.toFixed(2)}</Text>
                                </View>
                                <Text style={styles.itemTotal}>${(item.quantity * item.unitPrice).toFixed(2)}</Text>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>${order?.deliveryFee?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Address</Text>
                            <Text style={[styles.summaryValue, { maxWidth: '60%', textAlign: 'right' }]}>{order?.address}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total Amount</Text>
                            <Text style={[styles.summaryValue, styles.totalValue]}>${order?.totalAmount?.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Customer Note */}
                {order?.note && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Note</Text>
                        <View style={styles.card}>
                            <Text style={styles.noteText}>{order.note}</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.md,
    },
    orderMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderLabel: {
        ...TYPOGRAPHY.label,
        color: COLORS.textMuted,
        fontSize: 10,
    },
    orderId: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: SPACING.md,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginLeft: 10,
    },
    section: {
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        marginBottom: SPACING.md,
        fontSize: 16,
    },
    statusActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statusBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        minWidth: '45%',
        alignItems: 'center',
    },
    statusBtnText: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
    },
    itemQty: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    itemTotal: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    summaryValue: {
        color: COLORS.text,
        fontSize: 14,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    noteText: {
        color: COLORS.text,
        fontStyle: 'italic',
    },
});
