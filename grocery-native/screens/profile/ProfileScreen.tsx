import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const profileOptions = [
    { id: 1, title: 'My Orders', icon: '📦', action: () => {} },
    { id: 2, title: 'Saved Addresses', icon: '📍', action: () => {} },
    { id: 3, title: 'Payment Methods', icon: '💳', action: () => {} },
    { id: 4, title: 'Help & Support', icon: '🆘', action: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.fullName || user?.username || 'U').charAt(0)}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user?.fullName || user?.username || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || user?.username}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Profile Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {profileOptions.map((option) => (
          <TouchableOpacity key={option.id} style={styles.optionItem} onPress={option.action}>
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || user?.username || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoValue}>{user?.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since:</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  optionArrow: {
    fontSize: 18,
    color: '#d1d5db',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    marginHorizontal: 15,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 30,
  },
});
