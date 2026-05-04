import React, { createContext, useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, typography } from '../../theme';

const ToastContext = createContext(null);

const TYPE_STYLES = {
  success: { bg: colors.primary, icon: '✓' },
  error: { bg: colors.danger, icon: '✕' },
  info: { bg: colors.neutral700, icon: 'ℹ' },
  save: { bg: colors.purple, icon: '🔖' },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const show = (message, type = 'info', duration = 2800) => {
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const style = toast ? TYPE_STYLES[toast.type] || TYPE_STYLES.info : null;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            { bottom: insets.bottom + 90, backgroundColor: style.bg },
            { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
        >
          <Text style={styles.icon}>{style.icon}</Text>
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { color: colors.white, fontSize: 14, fontWeight: '700' },
  message: { color: colors.white, fontSize: typography.sizes.md, fontWeight: '600', flex: 1 },
});
