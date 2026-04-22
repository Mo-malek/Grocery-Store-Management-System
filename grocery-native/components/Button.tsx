import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return '#10b981';
    return '#fff';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        (loading || disabled) && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
