import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    StatusBar,
} from 'react-native';
import { apiClient } from '../../services/api';
import { format } from 'date-fns';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            const response = await apiClient.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const managerInsights = useMemo(() => {
        if (!stats) return [];
        const insights = [
            {
                id: 'orders',
                icon: 'clipboard-alert-outline',
                color: COLORS.accent,
                title: 'Pending Queue',
                value: `${stats.onlineTransactionCountToday || 0} orders`,
                action: 'Open Orders',
                target: 'AdminOrders',
                critical: (stats.onlineTransactionCountToday || 0) > 10,
            },
            {
                id: 'stock',
                icon: 'package-variant-minus',
                color: COLORS.danger,
                title: 'Stock Alerts',
                value: `${stats.outOfStockCount || 0} out of stock`,
                action: 'Review Stock',
                target: 'Inventory',
                critical: (stats.outOfStockCount || 0) > 0,
            },
            {
                id: 'performance',
                icon: 'cash-register',
                color: COLORS.primary,
                title: 'Transactions',
                value: `${stats.transactionCountToday || 0} today`,
                action: 'Go POS',
                target: 'POS',
                critical: false,
            },
        ];

        return insights.sort((a, b) => Number(b.critical) - Number(a.critical));
    }, [stats]);

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const StatCard = ({ title, value, icon, color, subValue, trend }: any) => (
        <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                    <Icon name={icon} size={24} color={color} />
                </View>
                {trend && (
                    <View style={styles.trendBadge}>
                        <Text style={styles.trendText}>+12%</Text>
                    </View>
                )}
            </View>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.topBar, { paddingTop: 60 }]}>
                <View>
                    <Text style={styles.greeting}>Good Morning,</Text>
                    <Text style={styles.brand}>Admin Portal</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                    <Icon name="account-circle-outline" size={32} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* KPI Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Today's Sales"
                        value={`$${stats?.totalSalesToday?.toFixed(2) || '0.00'}`}
                        icon="currency-usd"
                        color={COLORS.primary}
                        trend="+8%"
                        subValue={`${stats?.transactionCountToday || 0} Transactions`}
                    />
                    <StatCard
                        title="Avg Basket"
                        value={`$${stats?.averageBasketSize?.toFixed(2) || '0.00'}`}
                        icon="basket-outline"
                        color={COLORS.secondary}
                    />
                    <StatCard
                        title="Pending Orders"
                        value={stats?.onlineTransactionCountToday || 0}
                        icon="clock-outline"
                        color={COLORS.accent}
                        subValue="Need processing"
                    />
                    <StatCard
                        title="Estimated Profit"
                        value={`$${stats?.estimatedProfitToday?.toFixed(2) || '0.00'}`}
                        icon="trending-up"
                        color="#8b5cf6"
                    />
                </View>

                <View style={styles.insightSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Manager Insights</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightScroll}>
                        {managerInsights.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.insightCard, item.critical && styles.insightCardCritical]}
                                onPress={() => navigation.navigate(item.target)}
                            >
                                <View style={styles.insightTop}>
                                    <View style={[styles.insightIconWrap, { backgroundColor: item.color + '1a' }]}>
                                        <Icon name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    {item.critical && <Text style={styles.insightFlag}>Hot</Text>}
                                </View>
                                <Text style={styles.insightTitle}>{item.title}</Text>
                                <Text style={styles.insightValue}>{item.value}</Text>
                                <View style={styles.insightAction}>
                                    <Text style={styles.insightActionText}>{item.action}</Text>
                                    <Icon name="arrow-right" size={14} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Sales Chart (Custom Bar Chart) */}
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Weekly Sales Trend</Text>
                    <View style={styles.chartContainer}>
                        <View style={styles.chartBars}>
                            {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                                <View key={i} style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: height * 1.5, backgroundColor: i === 3 ? COLORS.primary : COLORS.surfaceLight }]} />
                                    <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Inventory Status */}
                <View style={styles.alertSection}>
                    <Text style={styles.sectionTitle}>Inventory Health</Text>
                    <View style={styles.healthCard}>
                        <View style={styles.healthInfo}>
                            <Text style={styles.healthTitle}>Store Health Score</Text>
                            <Text style={styles.healthScore}>{stats?.storeHealthScore || 92}%</Text>
                        </View>
                        <View style={styles.healthProgress}>
                            <View style={[styles.progressBar, { width: '92%' }]} />
                        </View>
                    </View>

                    <View style={styles.alertActions}>
                        <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Inventory')}>
                            <Icon name="alert-circle-outline" size={24} color={COLORS.danger} />
                            <Text style={styles.alertCount}>{stats?.outOfStockCount || 0}</Text>
                            <Text style={styles.alertLabel}>Out of Stock</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Inventory')}>
                            <Icon name="calendar-clock" size={24} color={COLORS.accent} />
                            <Text style={styles.alertCount}>{stats?.expiringSoonCount || 0}</Text>
                            <Text style={styles.alertLabel}>Expiring Soon</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Administrative Quick Actions */}
                <View style={styles.alertSection}>
                    <Text style={styles.sectionTitle}>Administrative Hub</Text>
                    <View style={styles.statsGrid}>
                        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Expenses')}>
                            <Icon name="cash-multiple" size={24} color={COLORS.danger} />
                            <Text style={styles.statLabel}>Expenses</Text>
                            <Text style={styles.statValue}>Manage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Procurement')}>
                            <Icon name="chart-bell-curve-cumulative" size={24} color={COLORS.primary} />
                            <Text style={styles.statLabel}>Procurement</Text>
                            <Text style={styles.statValue}>Intelligence</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Marketing')}>
                            <Icon name="bullhorn-outline" size={24} color={COLORS.secondary} />
                            <Text style={styles.statLabel}>Marketing</Text>
                            <Text style={styles.statValue}>CRM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('History')}>
                            <Icon name="clipboard-text-clock-outline" size={24} color={COLORS.accent} />
                            <Text style={styles.statLabel}>Audit Log</Text>
                            <Text style={styles.statValue}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.recentSales}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {stats?.recentSales?.length > 0 ? (
                        stats.recentSales.map((sale: any, index: number) => (
                            <View key={sale.id || index} style={styles.saleItem}>
                                    <View style={styles.saleAvatar}>
                                        <Text style={styles.avatarText}>
                                            {(sale.externalCustomerName || sale.customer?.fullName || 'Walk-in').charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.saleInfo}>
                                    <Text style={styles.saleCustomer}>{sale.externalCustomerName || sale.customer?.fullName || 'Walk-in Customer'}</Text>
                                    <Text style={styles.saleTime}>{format(new Date(sale.createdAt), 'HH:mm')}</Text>
                                </View>
                                    <View style={styles.saleAmountContainer}>
                                        <Text style={styles.saleAmount}>${sale.total?.toFixed(2)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: sale.saleChannel === 'ONLINE' ? COLORS.secondary + '20' : COLORS.primary + '20' }]}>
                                        <Text style={[styles.statusText, { color: sale.saleChannel === 'ONLINE' ? COLORS.secondary : COLORS.primary }]}>
                                            {sale.saleChannel || 'POS'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptySales}>
                            <Text style={styles.emptyText}>No sales recorded today yet.</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    greeting: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    brand: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: (width - 30) / 2 - 10,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.md,
    },
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    trendText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statSubValue: {
        fontSize: 10,
        color: COLORS.textDim,
        marginTop: 4,
    },
    chartSection: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    insightSection: {
        marginBottom: SPACING.xl,
    },
    insightScroll: {
        paddingRight: SPACING.md,
    },
    insightCard: {
        width: 210,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.md,
        marginRight: SPACING.sm,
    },
    insightCardCritical: {
        borderColor: COLORS.accent + 'aa',
        backgroundColor: COLORS.surfaceHighlight,
    },
    insightTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    insightIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightFlag: {
        fontSize: 11,
        color: COLORS.accent,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    insightTitle: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginBottom: 4,
    },
    insightValue: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '800',
    },
    insightAction: {
        marginTop: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    insightActionText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    chartContainer: {
        height: 180,
        justifyContent: 'flex-end',
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    barWrapper: {
        alignItems: 'center',
    },
    bar: {
        width: 20,
        borderRadius: 10,
    },
    barLabel: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 8,
    },
    alertSection: {
        marginBottom: SPACING.xl,
    },
    healthCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    healthInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    healthTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    healthScore: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    healthProgress: {
        height: 8,
        backgroundColor: COLORS.background,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    alertActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    alertCard: {
        width: (width - 50) / 2,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    alertCount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginVertical: 4,
    },
    alertLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    recentSales: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    seeAll: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    saleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    saleAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    saleInfo: {
        flex: 1,
    },
    saleCustomer: {
        color: COLORS.text,
        fontWeight: '600',
    },
    saleTime: {
        color: COLORS.textDim,
        fontSize: 12,
        marginTop: 2,
    },
    saleAmountContainer: {
        alignItems: 'flex-end',
    },
    saleAmount: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptySales: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textDim,
        fontStyle: 'italic',
    },
});
