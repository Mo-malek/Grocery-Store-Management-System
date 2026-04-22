import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading, error } = useAuthStore();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        username: username || email,
        email,
        phone,
        fullName: `${firstName} ${lastName}`.trim(),
        password,
      });
      Alert.alert('Success', 'Account created successfully');
      navigation.navigate('Login');
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
        <View style={styles.bgCircle1} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Join Baqa'ah</Text>
          <Text style={styles.subtitle}>Start managing your store today</Text>
        </View>

        <View style={styles.formCard}>
          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={20} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor={COLORS.textDim}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor={COLORS.textDim}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor={COLORS.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 234 567 890"
              placeholderTextColor={COLORS.textDim}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textDim}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textDim}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
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
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.secondary + '10',
  },
  header: {
    marginTop: 40,
    marginBottom: SPACING.xl,
  },
  backBtn: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.lg,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.md,
    color: COLORS.text,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
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
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
