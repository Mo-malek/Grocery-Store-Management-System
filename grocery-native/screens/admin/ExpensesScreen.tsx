import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    StatusBar,
} from 'react-native';
import apiClient from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const CATEGORIES = [
    { id: 'RENT', label: 'Rent', icon: 'home-city-outline' },
    { id: 'ELECTRICITY', label: 'Electricity', icon: 'lightning-bolt-outline' },
    { id: 'SALARY', label: 'Salary', icon: 'account-cash-outline' },
    { id: 'MAINTENANCE', label: 'Maintenance', icon: 'tools' },
    { id: 'OTHER', label: 'Other', icon: 'dots-horizontal-circle-outline' },
];

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('OTHER');

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getExpenses();
            setExpenses(data || []);
        } catch (error) {
            console.error('Failed to load expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        if (!description.trim() || !amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please provide a description and valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            await apiClient.addExpense({
                description: description.trim(),
                amount: parseFloat(amount),
                category,
            });
            Alert.alert('Success', 'Expense recorded successfully');
            setIsModalOpen(false);
            setDescription('');
            setAmount('');
            setCategory('OTHER');
            loadExpenses();
        } catch (error) {
            Alert.alert('Error', 'Failed to save expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.deleteExpense(id);
                            setExpenses(expenses.filter(e => e.id !== id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete expense');
                        }
                    }
                }
            ]
        );
    };

    const getTotalAmount = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const getCategoryStats = () => {
        const stats: any = {};
        expenses.forEach(e => {
            stats[e.category] = (stats[e.category] || 0) + e.amount;
        });
        return stats;
    };

    const renderExpense = ({ item }: any) => {
        const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[4];
        return (
            <View style={styles.expenseCard}>
                <View style={styles.expenseIcon}>
                    <Icon name={cat.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDesc}>{item.description}</Text>
                    <Text style={styles.expenseMeta}>
                        {new Date(item.createdAt).toLocaleDateString()} • {cat.label}
                    </Text>
                </View>
                <View style={styles.expenseAction}>
                    <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Icon name="delete-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const stats = getCategoryStats();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Store Expenses</Text>
                    <Text style={styles.headerSubtitle}>Manage your operating costs</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
                    <Icon name="plus" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Expenses</Text>
                    <Text style={styles.summaryValue}>${getTotalAmount().toFixed(2)}</Text>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.catStatCard}>
                            <Text style={styles.catStatLabel}>{item.label}</Text>
                            <Text style={styles.catStatValue}>${(stats[item.id] || 0).toFixed(0)}</Text>
                        </View>
                    )}
                    style={styles.statsList}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={expenses}
                    renderItem={renderExpense}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Icon name="cash-remove" size={64} color={COLORS.surfaceLight} />
                            <Text style={styles.emptyText}>No expenses recorded</Text>
                        </View>
                    }
                />
            )}

            {/* Add Expense Modal */}
            <Modal visible={isModalOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Expense</Text>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                <Icon name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Rent, Electricity, Cleaning..."
                                placeholderTextColor={COLORS.textDim}
                                value={description}
                                onChangeText={setDescription}
                            />

                            <Text style={styles.label}>Amount ($)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textDim}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />

                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.catBtn,
                                            category === cat.id && styles.catBtnActive
                                        ]}
                                        onPress={() => setCategory(cat.id)}
                                    >
                                        <Icon
                                            name={cat.icon as any}
                                            size={20}
                                            color={category === cat.id ? COLORS.white : COLORS.textMuted}
                                        />
                                        <Text style={[
                                            styles.catBtnText,
                                            category === cat.id && styles.catBtnTextActive
                                        ]}>{cat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
                                onPress={handleAddExpense}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.saveBtnText}>Record Expense</Text>
                                )}
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
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    headerSubtitle: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    summaryContainer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    summaryCard: {
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: SPACING.md,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.danger,
        marginTop: 4,
    },
    statsList: {
        marginTop: 5,
    },
    catStatCard: {
        backgroundColor: COLORS.surfaceHighlight,
        padding: 10,
        borderRadius: 12,
        marginRight: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    catStatLabel: {
        fontSize: 10,
        color: COLORS.textDim,
        marginBottom: 2,
    },
    catStatValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    list: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    expenseIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseDesc: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    expenseMeta: {
        fontSize: 12,
        color: COLORS.textDim,
        marginTop: 2,
    },
    expenseAction: {
        alignItems: 'flex-end',
        gap: 8,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.danger,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SPACING.xl,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    form: {
        gap: SPACING.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        fontSize: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: SPACING.md,
    },
    catBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        backgroundColor: COLORS.background,
        gap: 6,
    },
    catBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    catBtnText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    catBtnTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: SPACING.lg,
        ...SHADOWS.md,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
