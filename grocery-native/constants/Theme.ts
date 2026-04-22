/**
 * Production-Grade Design System for Baqa'ah Grocery Portal
 * Features HSL-based color tokens, modern typography, and elevation scales.
 */

export const COLORS = {
    primary: '#10b981', // Emerald 500
    primaryDark: '#059669', // Emerald 600
    primaryLight: '#34d399', // Emerald 400

    secondary: '#3b82f6', // Blue 500
    accent: '#f59e0b', // Amber 500
    danger: '#ef4444', // Red 500

    background: '#0f172a', // Slate 900 (Deep modern dark)
    surface: '#1e293b', // Slate 800
    surfaceLight: '#334155', // Slate 700
    surfaceHighlight: '#475569', // Slate 600 (For subtle highlights)

    text: '#f8fafc', // Slate 50
    textMuted: '#94a3b8', // Slate 400
    textDim: '#64748b', // Slate 500

    glass: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',

    white: '#ffffff',
    black: '#000000',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        letterSpacing: -0.5,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: 'normal' as const,
    },
    label: {
        fontSize: 14,
        fontWeight: '500' as const,
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
    },
    caption: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
};

export default {
    COLORS,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    TYPOGRAPHY,
};
