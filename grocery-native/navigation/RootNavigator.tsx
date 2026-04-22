import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING } from '../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CatalogScreen from '../screens/storefront/CatalogScreen';
import CartScreen from '../screens/storefront/CartScreen';
import CheckoutScreen from '../screens/storefront/CheckoutScreen';
import OrdersScreen from '../screens/storefront/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PosScreen from '../screens/admin/PosScreen';
import InventoryScreen from '../screens/admin/InventoryScreen';
import DashboardScreen from '../screens/admin/DashboardScreen';
import CategoryListScreen from '../screens/admin/CategoryListScreen';
import ProductFormScreen from '../screens/admin/ProductFormScreen';
import OrderManagementScreen from '../screens/admin/OrderManagementScreen';
import CustomerManagementScreen from '../screens/admin/CustomerManagementScreen';
import OrderDetailScreen from '../screens/admin/OrderDetailScreen';
import ExpensesScreen from '../screens/admin/ExpensesScreen';
import ProcurementScreen from '../screens/admin/ProcurementScreen';
import MarketingScreen from '../screens/admin/MarketingScreen';
import HistoryScreen from '../screens/admin/HistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const STAFF_ROUTES = [
  { name: 'Dashboard', label: 'Home', icon: 'view-dashboard', group: 'Core' },
  { name: 'AdminOrders', label: 'Orders', icon: 'clipboard-list', group: 'Core' },
  { name: 'Inventory', label: 'Stock', icon: 'package-variant-closed', group: 'Operations' },
  { name: 'Categories', label: 'Cats', icon: 'shape', group: 'Operations' },
  { name: 'Customers', label: 'Users', icon: 'account-group', group: 'Operations' },
  { name: 'POS', label: 'POS', icon: 'calculator', group: 'Operations' },
  { name: 'Expenses', label: 'Costs', icon: 'cash-multiple', group: 'Management' },
  { name: 'Procurement', label: 'Buy', icon: 'chart-bell-curve-cumulative', group: 'Management' },
  { name: 'Marketing', label: 'CRM', icon: 'bullhorn-outline', group: 'Management' },
  { name: 'History', label: 'Logs', icon: 'history', group: 'Management' },
  { name: 'Profile', label: 'Profile', icon: 'account-cog', group: 'Account' },
] as const;

const getRouteLabel = (name?: string) => {
  return STAFF_ROUTES.find((route) => route.name === name)?.label || 'Portal';
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function StorefrontTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Catalog') iconName = 'storefront';
          else if (route.name === 'Cart') iconName = 'cart';
          else if (route.name === 'Orders') iconName = 'clipboard-text-outline';
          else if (route.name === 'Profile') iconName = 'account';
          return <Icon name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Shop' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function StorefrontStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StorefrontMain" component={StorefrontTabs} />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: true,
          title: 'Checkout',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
        }}
      />
    </Stack.Navigator>
  );
}

function PortalSideBar({ state, navigation, sidebarWidth, collapsed, onToggle }: BottomTabBarProps & {
  sidebarWidth: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const groupedRoutes = useMemo(() => {
    return STAFF_ROUTES.reduce<Record<string, typeof STAFF_ROUTES[number][]>>((acc, route) => {
      acc[route.group] = acc[route.group] || [];
      acc[route.group].push(route);
      return acc;
    }, {});
  }, []);

  return (
    <View style={[styles.sidebar, { width: sidebarWidth }]}>
      <View style={styles.sidebarHeader}>
        <View>
          <Text style={styles.sidebarBrand}>Portal</Text>
          {!collapsed && <Text style={styles.sidebarSub}>Baqa'ah store</Text>}
        </View>
        <TouchableOpacity
          onPress={onToggle}
          style={styles.collapseBtn}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedRoutes).map(([groupName, routes]) => (
          <View key={groupName} style={styles.groupBlock}>
            {!collapsed && <Text style={styles.groupLabel}>{groupName}</Text>}
            {routes.map((routeConfig) => {
              const routeIndex = state.routes.findIndex((route) => route.name === routeConfig.name);
              if (routeIndex === -1) return null;
              const route = state.routes[routeIndex];
              const focused = state.index === routeIndex;
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={[styles.sidebarItem, focused && styles.sidebarItemActive]}
                >
                  <Icon
                    name={routeConfig.icon as any}
                    size={22}
                    color={focused ? COLORS.primary : COLORS.textMuted}
                  />
                  {!collapsed && (
                    <Text style={[styles.sidebarLabel, focused && styles.sidebarLabelActive]}>
                      {routeConfig.label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function PortalTopBar({ state, navigation, expanded, onToggle }: BottomTabBarProps & {
  expanded: boolean;
  onToggle: () => void;
}) {
  const groupedRoutes = useMemo(() => {
    return STAFF_ROUTES.reduce<Record<string, typeof STAFF_ROUTES[number][]>>((acc, route) => {
      acc[route.group] = acc[route.group] || [];
      acc[route.group].push(route);
      return acc;
    }, {});
  }, []);

  return (
    <View style={styles.mobileChrome}>
      <View style={styles.mobileHeader}>
        <View style={styles.mobileTitleWrap}>
          <Text style={styles.mobileTitle}>{getRouteLabel(state.routes[state.index]?.name)}</Text>
          <Text style={styles.sidebarSub}>Baqa'ah store portal</Text>
        </View>
        <View style={styles.mobileActions}>
          <TouchableOpacity onPress={() => navigation.navigate('POS')} style={styles.mobileActionBtn}>
            <Icon name="calculator-variant-outline" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Inventory')} style={styles.mobileActionBtn}>
            <Icon name="package-variant-closed" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggle} style={styles.mobileActionBtn}>
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.mobilePill}>
            <Icon name="storefront-outline" size={18} color={COLORS.primary} />
            <Text style={styles.mobilePillText}>Live</Text>
          </View>
        </View>
      </View>
      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileNavScroll}
        >
          {Object.entries(groupedRoutes).flatMap(([, routes]) =>
            routes.map((routeConfig) => {
              const routeIndex = state.routes.findIndex((route) => route.name === routeConfig.name);
              if (routeIndex === -1) return null;
              const route = state.routes[routeIndex];
              const focused = state.index === routeIndex;
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={[styles.mobileNavItem, focused && styles.mobileNavItemActive]}
                >
                  <Icon
                    name={routeConfig.icon as any}
                    size={18}
                    color={focused ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.mobileNavLabel, focused && styles.sidebarLabelActive]}>
                    {routeConfig.label}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

function StaffTabs() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const [collapsed, setCollapsed] = useState(isCompact);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (isCompact) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
      setMobileExpanded(false);
    }
  }, [isCompact]);

  const sidebarWidth = collapsed ? 88 : isCompact ? 88 : 164;
  const topHeight = isCompact ? (mobileExpanded ? 170 : 112) : 0;

  return (
    <Tab.Navigator
      tabBar={(props) =>
        isCompact ? (
          <PortalTopBar
            {...props}
            expanded={mobileExpanded}
            onToggle={() => setMobileExpanded((current) => !current)}
          />
        ) : (
          <PortalSideBar
            {...props}
            sidebarWidth={sidebarWidth}
            collapsed={collapsed}
            onToggle={() => setCollapsed((current) => !current)}
          />
        )
      }
      sceneContainerStyle={[
        styles.staffScene,
        isCompact ? { paddingTop: topHeight } : { paddingLeft: sidebarWidth },
      ]}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="AdminOrders" component={OrderManagementScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Stock' }} />
      <Tab.Screen name="Categories" component={CategoryListScreen} options={{ title: 'Categories' }} />
      <Tab.Screen name="Customers" component={CustomerManagementScreen} options={{ title: 'Users' }} />
      <Tab.Screen name="POS" component={PosScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Procurement" component={ProcurementScreen} />
      <Tab.Screen name="Marketing" component={MarketingScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMain" component={StaffTabs} />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{
          headerShown: true,
          title: 'Product Details',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailScreen}
        options={{
          headerShown: true,
          title: 'Order Status',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
        }}
      />
      <Stack.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          headerShown: true,
          title: 'Expense Management',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
        }}
      />
      <Stack.Screen
        name="Procurement"
        component={ProcurementScreen}
        options={{
          headerShown: true,
          title: 'Procurement Intelligence',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
        }}
      />
      <Stack.Screen
        name="Marketing"
        component={MarketingScreen}
        options={{
          headerShown: true,
          title: 'Marketing & CRM',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerShown: true,
          title: 'Audit Logs',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: COLORS.primary,
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, token } = useAuthStore();
  const role = user?.role?.toUpperCase();
  const isCustomer = role === 'CUSTOMER';

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : !isCustomer ? (
        <AdminStack />
      ) : (
        <StorefrontStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  staffScene: {
    backgroundColor: COLORS.background,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 164,
    backgroundColor: '#0f172a',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    paddingTop: 52,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: 4,
  },
  sidebarBrand: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sidebarSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sidebarScroll: {
    paddingBottom: 20,
  },
  groupBlock: {
    marginBottom: 8,
  },
  groupLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  sidebarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  sidebarLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 12,
  },
  sidebarLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  mobileChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingTop: 52,
    zIndex: 20,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  mobileTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  mobileTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  mobileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mobilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  mobilePillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mobileNavScroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: 8,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  mobileNavItemActive: {
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  mobileNavLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
