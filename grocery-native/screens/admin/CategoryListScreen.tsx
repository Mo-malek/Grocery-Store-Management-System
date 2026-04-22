import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');

export default function CategoryListScreen({ navigation }: any) {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await apiClient.getProductCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('fruit') || n.includes('veg')) return '🍎';
        if (n.includes('dairy') || n.includes('milk')) return '🥛';
        if (n.includes('meat') || n.includes('poultry')) return '🍖';
        if (n.includes('bakery') || n.includes('bread')) return '🍞';
        if (n.includes('beverage') || n.includes('drink')) return '🥤';
        if (n.includes('snack')) return '🍿';
        if (n.includes('frozen')) return '❄️';
        return '📦';
    };

    const renderCategory = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Inventory', { category: item })}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.categoryEmoji}>{getCategoryIcon(item)}</Text>
            </View>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item}</Text>
                <Text style={styles.viewLink}>View Products →</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Product Categories</Text>
            </View>

            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.listContainer}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📂</Text>
                        <Text style={styles.emptyText}>No categories found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    listContainer: {
        padding: 10,
    },
    row: {
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - 30) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryEmoji: {
        fontSize: 30,
    },
    categoryInfo: {
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    viewLink: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
        marginTop: 6,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
    },
});
