import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Modal,
    TextInput,
    Alert,
    StatusBar,
    Linking,
} from 'react-native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function MarketingScreen() {
    const [activeTab, setActiveTab] = useState<'BUNDLES' | 'CRM'>('BUNDLES');
    const [bundles, setBundles] = useState<any[]>([]);
    const [stagnantCustomers, setStagnantCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Bundle Form
    const [bundleName, setBundleName] = useState('');
    const [bundlePrice, setBundlePrice] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bData, cData] = await Promise.all([
                apiClient.getBundles(),
                apiClient.getStagnantCustomers(),
            ]);
            setBundles(bData || []);
            setStagnantCustomers(cData || []);
        } catch (error) {
            console.error('Failed to load marketing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBundle = async () => {
        if (!bundleName || !bundlePrice) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            setIsSaving(true);
            await apiClient.createBundle({
                name: bundleName,
                price: parseFloat(bundlePrice),
                active: true
            });
            setIsModalOpen(false);
            setBundleName('');
            setBundlePrice('');
            loadData();
            Alert.alert('Success', 'Bundle created successfully');
        } catch (err) {
            Alert.alert('Error', 'Failed to create bundle');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteBundle = (id: number) => {
        Alert.alert('Delete', 'Remove this bundle?', [
            { text: 'Cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await apiClient.deleteBundle(id);
                    loadData();
                }
            }
        ]);
    };

    const sendWhatsApp = (customer: any) => {
        const message = `Hello ${customer.name}! We missed you at the Grocery Store. Come back and get 10% off your next order! 🍎`;
        const url = `whatsapp://send?phone=${customer.phone}&text=${encodeURIComponent(message)}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Error', 'WhatsApp is not installed');
            }
        });
    };

    const renderBundle = ({ item }: any) => (
        <View style={styles.bundleCard}>
            <View style={styles.bundleInfo}>
                <Text style={styles.bundleTitle}>{item.name}</Text>
                <Text style={styles.bundleItems}>
                    {item.items?.length ? item.items.map((i: any) => i.product.name).join(', ') : 'Mixed promotional bundle'}
                </Text>
                <Text style={styles.bundlePrice}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteBundle(item.id)}>
                <Icon name="trash-can-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
        </View>
    );

    const renderCustomer = ({ item }: any) => (
        <View style={styles.crmCard}>
                <View style={styles.crmAvatar}>
                <Text style={styles.crmAvatarText}>{item.name?.charAt(0) || 'C'}</Text>
            </View>
            <View style={styles.crmInfo}>
                <Text style={styles.crmName}>{item.name}</Text>
                <Text style={styles.crmMeta}>
                    Last visited: {new Date(item.lastVisitAt || item.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.crmStats}>
                    <Text style={styles.crmStat}>Points: {item.loyaltyPoints}</Text>
                    <Text style={styles.crmStat}>Spent: ${item.totalPurchases?.toFixed(0) || 0}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.whatsappBtn} onPress={() => sendWhatsApp(item)}>
                <Icon name="whatsapp" size={24} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.topBar}>
                <Text style={styles.title}>Marketing & CRM</Text>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'BUNDLES' && styles.tabActive]}
                        onPress={() => setActiveTab('BUNDLES')}
                    >
                        <Text style={[styles.tabText, activeTab === 'BUNDLES' && styles.tabTextActive]}>Offer Bundles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'CRM' && styles.tabActive]}
                        onPress={() => setActiveTab('CRM')}
                    >
                        <Text style={[styles.tabText, activeTab === 'CRM' && styles.tabTextActive]}>Churn Control</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {activeTab === 'BUNDLES' ? (
                        <>
                            <FlatList
                                data={bundles}
                                renderItem={renderBundle}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.list}
                                ListHeaderComponent={
                                    <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
                                        <Icon name="plus-circle" size={20} color={COLORS.white} />
                                        <Text style={styles.createBtnText}>Create New Offer</Text>
                                    </TouchableOpacity>
                                }
                            />
                        </>
                    ) : (
                        <FlatList
                            data={stagnantCustomers}
                            renderItem={renderCustomer}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.list}
                            ListHeaderComponent={
                                <View style={styles.crmAlert}>
                                    <Text style={styles.crmAlertTitle}>Retention Alert! 🚨</Text>
                                    <Text style={styles.crmAlertDesc}>These customers haven't visited in 30+ days. Send them a nudge to bring them back.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            )}

            {/* Bundle Modal */}
            <Modal visible={isModalOpen} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Bundle Offer</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Bundle Name (e.g. Breakfast Combo)"
                            placeholderTextColor={COLORS.textDim}
                            value={bundleName}
                            onChangeText={setBundleName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Bundle Price ($)"
                            placeholderTextColor={COLORS.textDim}
                            keyboardType="numeric"
                            value={bundlePrice}
                            onChangeText={setBundlePrice}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBundle} disabled={isSaving}>
                                {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Bundle</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 14,
        marginRight: 20,
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
    bundleCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        alignItems: 'center',
    },
    bundleInfo: {
        flex: 1,
    },
    bundleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    bundleItems: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginVertical: 4,
    },
    bundlePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    deleteBtn: {
        padding: 10,
    },
    createBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        gap: 8,
    },
    createBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    crmCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        alignItems: 'center',
    },
    crmAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    crmAvatarText: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    crmInfo: {
        flex: 1,
    },
    crmName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    crmMeta: {
        fontSize: 12,
        color: COLORS.textDim,
        marginVertical: 2,
    },
    crmStats: {
        flexDirection: 'row',
        gap: 12,
    },
    crmStat: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    whatsappBtn: {
        backgroundColor: '#25D366',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    crmAlert: {
        backgroundColor: COLORS.surfaceHighlight,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    crmAlertTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.accent,
        marginBottom: 4,
    },
    crmAlertDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.xl,
        gap: 15,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: COLORS.textDim,
        fontWeight: '600',
    },
    saveBtn: {
        flex: 2,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveBtnText: {
        color: COLORS.white,
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
