import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, typography } from '../../theme';

const VARIANTS = {
  primary: { bg: colors.primary, text: colors.white, border: 'transparent' },
  accent: { bg: colors.accent, text: colors.white, border: 'transparent' },
  ghost: { bg: 'transparent', text: colors.primary, border: colors.neutral200 },
  outline: { bg: 'transparent', text: colors.neutral700, border: colors.neutral200 },
  danger: { bg: colors.danger, text: colors.white, border: 'transparent' },
};

export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style, textStyle, size = 'md' }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isSmall = size === 'sm';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        isSmall ? styles.sm : styles.md,
        { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border === 'transparent' ? 0 : 1.5 },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[styles.text, isSmall ? styles.textSm : styles.textMd, { color: v.text }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
  sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  text: { fontWeight: '700' },
  textMd: { fontSize: typography.sizes.md },
  textSm: { fontSize: typography.sizes.base },
  disabled: { opacity: 0.5 },
});
