import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StatusBar,
    Alert,
} from 'react-native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function ProcurementScreen() {
    const [activeTab, setActiveTab] = useState<'REORDER' | 'PRICE'>('REORDER');
    const [reorderSuggestions, setReorderSuggestions] = useState<any[]>([]);
    const [priceSuggestions, setPriceSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [reorder, price] = await Promise.all([
                apiClient.getReorderSuggestions(),
                apiClient.getPriceOptimizationSuggestions(),
            ]);
            setReorderSuggestions(reorder || []);
            setPriceSuggestions(price || []);
        } catch (error) {
            console.error('Failed to load procurement data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyPrice = (p: any) => {
        Alert.alert(
            'Update Price',
            `Change price for ${p.productName} to $${p.suggestedPrice}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    onPress: async () => {
                        try {
                            const res = await apiClient.getProductById(p.productId);
                            const product = res.data;
                            product.price = p.suggestedPrice;
                            await apiClient.updateProduct(p.productId, product);
                            setPriceSuggestions(priceSuggestions.filter(s => s.productId !== p.productId));
                            Alert.alert('Success', 'Price updated successfully');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to update price');
                        }
                    }
                }
            ]
        );
    };

    const getStatusInfo = (s: any) => {
        const days = s.daysUntilOut;
        if (days < 1) return { label: 'Out of Stock', color: COLORS.danger, icon: 'alert-circle' };
        if (days < 3) return { label: 'Critical', color: COLORS.danger, icon: 'alert-decagram' };
        if (days < 7) return { label: 'Low Stock', color: COLORS.accent, icon: 'alert-outline' };
        return { label: 'Stable', color: COLORS.primary, icon: 'check-decagram' };
    };

    const renderReorderItem = ({ item }: any) => {
        const status = getStatusInfo(item);
        return (
            <View style={styles.recordCard}>
                <View style={styles.recordHeader}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <Icon name={status.icon as any} size={14} color={status.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Current Stock</Text>
                        <Text style={styles.metricValue}>{item.currentStock} {item.unit}</Text>
                    </View>
                    <View style={[styles.metricItem, { alignItems: 'center' }]}>
                        <Text style={styles.metricLabel}>Daily Speed</Text>
                        <Text style={styles.metricValue}>{item.dailyVelocity} / day</Text>
                    </View>
                    <View style={[styles.metricItem, { alignItems: 'flex-end' }]}>
                        <Text style={styles.metricLabel}>Suggested</Text>
                        <Text style={[styles.metricValue, { color: COLORS.primary }]}>+ {item.suggestedReorderQuantity}</Text>
                    </View>
                </View>

                <View style={styles.alertBar}>
                    <Icon name="clock-outline" size={14} color={status.color} />
                    <Text style={[styles.alertText, { color: status.color }]}>
                        {item.daysUntilOut < 1 ? 'Needs replenishment immediately' : `Estimated out of stock in ${item.daysUntilOut} days`}
                    </Text>
                </View>
            </View>
        );
    };

    const renderPriceSuggestion = ({ item }: any) => (
        <View style={styles.priceCard}>
            <View style={styles.priceInfo}>
                <View style={styles.priceTagRow}>
                    <View style={[styles.reasonBadge, { backgroundColor: item.reason === 'EXPIRING_SOON' ? COLORS.danger + '20' : COLORS.accent + '20' }]}>
                        <Text style={[styles.reasonText, { color: item.reason === 'EXPIRING_SOON' ? COLORS.danger : COLORS.accent }]}>
                            {item.reason === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Slow Moving'}
                        </Text>
                    </View>
                    <Text style={styles.productName}>{item.productName}</Text>
                </View>
                <Text style={styles.priceMsg}>{item.message}</Text>
                <View style={styles.priceComparison}>
                    <View>
                        <Text style={styles.priceSubLabel}>Current</Text>
                        <Text style={styles.currentPrice}>${item.currentPrice.toFixed(2)}</Text>
                    </View>
                    <Icon name="arrow-right-thick" size={20} color={COLORS.textDim} />
                    <View>
                        <Text style={styles.priceSubLabel}>AI Suggests</Text>
                        <Text style={styles.suggestedPrice}>${item.suggestedPrice.toFixed(2)}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={() => applyPrice(item)}>
                <Text style={styles.applyBtnText}>Apply Now</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.topBar}>
                <Text style={styles.title}>Procurement Intelligence</Text>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'REORDER' && styles.tabActive]}
                        onPress={() => setActiveTab('REORDER')}
                    >
                        <Text style={[styles.tabText, activeTab === 'REORDER' && styles.tabTextActive]}>Restock Advice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'PRICE' && styles.tabActive]}
                        onPress={() => setActiveTab('PRICE')}
                    >
                        <Text style={[styles.tabText, activeTab === 'PRICE' && styles.tabTextActive]}>Price Optimizer</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'REORDER' ? reorderSuggestions : priceSuggestions}
                    renderItem={activeTab === 'REORDER' ? renderReorderItem : renderPriceSuggestion}
                    keyExtractor={(item) => item.productId.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Icon name="brain" size={64} color={COLORS.surfaceLight} />
                            <Text style={styles.emptyText}>No suggestions available yet</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={loadData}
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
    topBar: {
        paddingTop: 60,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
        paddingHorizontal: SPACING.lg,
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDim,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    list: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    recordCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.sm,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: 12,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metricItem: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 10,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    alertBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceHighlight,
        padding: 10,
        borderRadius: 8,
    },
    alertText: {
        fontSize: 12,
        marginLeft: 8,
        fontWeight: '500',
    },
    priceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.md,
    },
    priceInfo: {
        flex: 1,
    },
    priceTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    reasonBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    reasonText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    priceMsg: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
        marginBottom: 15,
    },
    priceComparison: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    priceSubLabel: {
        fontSize: 10,
        color: COLORS.textDim,
        marginBottom: 2,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    suggestedPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    applyBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        ...SHADOWS.sm,
    },
    applyBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
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
