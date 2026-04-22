# 📱 Grocery Store React Native App

Complete mobile app for iOS and Android using **React Native** with **Expo**.

## ✨ Features

- ✅ **Authentication** - Login & Register
- ✅ **Customer Portal** - Browse products, cart, checkout, orders
- ✅ **Admin/POS** - Point of sale, inventory management
- ✅ **Offline Support** - AsyncStorage for persistence
- ✅ **Mobile Optimized** - Touch-friendly UI
- ✅ **API Integration** - All 70+ backend endpoints

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd grocery-native
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Run on Device

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**Or scan QR code with Expo Go app on your phone:**
- Android: Google Play Store - "Expo Go"
- iPhone: App Store - "Expo Go"

## 📱 Testing on Your Phone

### Option 1: Expo Go (Easiest)
```bash
npm start
# Scan QR code with Expo Go app on your phone
```

### Option 2: Physical Device
1. **Connect to same WiFi** as your computer
2. **Get your IP:**
   ```powershell
   ipconfig
   # Look for IPv4 Address
   ```

3. **Update API URL** in `services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR-IP:8080/api';
   ```

4. **Run:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
grocery-native/
├── App.tsx                    # Main app component
├── app.json                   # Expo config
├── package.json              # Dependencies
├── index.js                  # Entry point
├── services/
│   └── api.ts               # API client
├── store/
│   └── authStore.ts         # State management
├── navigation/
│   └── RootNavigator.tsx   # Navigation structure
└── screens/
    ├── auth/
    │   ├── LoginScreen.tsx
    │   └── RegisterScreen.tsx
    ├── home/
    │   └── HomeScreen.tsx
    ├── storefront/
    │   ├── CatalogScreen.tsx
    │   ├── CartScreen.tsx
    │   ├── CheckoutScreen.tsx
    │   └── OrdersScreen.tsx
    ├── profile/
    │   └── ProfileScreen.tsx
    └── admin/
        ├── PosScreen.tsx
        └── InventoryScreen.tsx
```

## 🔐 Default Credentials

```
Username: admin
Password: password
```

## 📋 Available Scripts

```bash
npm start       # Start Expo server
npm run android # Run on Android
npm run ios     # Run on iPhone
npm run web     # Run in web browser
npm run eject   # Eject from Expo
```

## 🔌 Backend Configuration

Update API URL in `services/api.ts`:

```typescript
// For Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:8080/api';

// For Physical Device (same WiFi):
const API_BASE_URL = 'http://192.168.x.x:8080/api';

// For iOS Simulator:
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📱 Supported Platforms

- ✅ **Android** (Physical device & emulator)
- ✅ **iPhone/iPad** (Physical device & simulator)
- ✅ **Web** Browser

## 🆘 Troubleshooting

### Port Already in Use
```bash
npm start -- --port 8081
```

### Clear Cache
```bash
npm start -- --clear
```

### Connection Issues
1. Ensure computer and phone are on **same WiFi**
2. Check firewall settings
3. Verify backend is running on `http://localhost:8080`

## 🎯 Navigation Tabs

### Customer (Role: CUSTOMER)
- Home
- Shop (Catalog)
- Cart
- Orders
- Profile

### Admin (Role: ADMIN/MANAGER)
- POS (Point of Sale)
- Inventory
- Profile

## 📲 Install as Native App

After testing, build native apps:

```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios
```

Requires: `npm install -g eas-cli`

## ✅ Testing Checklist

- [ ] Login works
- [ ] Products display on home screen
- [ ] Cart functionality works
- [ ] Navigation between tabs works
- [ ] Logout works
- [ ] Forms submit correctly
- [ ] API calls reach backend
- [ ] Touch gestures work smoothly

## 📞 Support

- **Expo Docs:** https://docs.expo.dev
- **React Native:** https://reactnative.dev
- **Navigation:** https://reactnavigation.org

---

**Happy coding! 📱✨**
