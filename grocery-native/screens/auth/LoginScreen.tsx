import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your credentials');
      return;
    }

    try {
      await login(username, password);
    } catch (err: any) {
      // Error handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Background Decorative Elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🛒</Text>
          </View>
          <Text style={styles.title}>Baqa'ah</Text>
          <Text style={styles.subtitle}>Management Portal</Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Admin username"
                placeholderTextColor={COLORS.textDim}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textDim}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}> Create Admin Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo Mode</Text>
          <Text style={styles.demoText}>Use admin / password to explore</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary + '15',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary + '10',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  glassCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: COLORS.danger + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  eyeBtn: {
    padding: SPACING.sm,
  },
  eyeIcon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  demoBox: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight + '30',
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: COLORS.textDim,
  },
});
