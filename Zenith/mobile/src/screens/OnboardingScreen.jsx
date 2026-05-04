import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius } from '../theme';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';

export default function OnboardingScreen() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!email || !password || (tab === 'register' && !username)) {
      toast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Something went wrong', 'error');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <LinearGradient colors={['#0D6E4F', '#1D9E75', '#2EC48D']} style={[styles.hero, { paddingTop: insets.top + 20 }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format' }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['transparent', 'rgba(13,110,79,0.85)']} style={StyleSheet.absoluteFill} />

          <View style={styles.heroContent}>
            <Text style={styles.logo}>Zenith</Text>
            <Text style={styles.tagline}>Discover. Plan. Travel Together.</Text>

            <View style={styles.heroStats}>
              {[['10K+', 'Travelers'], ['500+', 'Destinations'], ['2K+', 'Itineraries']].map(([val, lbl]) => (
                <View key={lbl} style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{val}</Text>
                  <Text style={styles.heroStatLbl}>{lbl}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Auth card */}
        <View style={styles.card}>
          {/* Tab toggle */}
          <View style={styles.tabs}>
            {['login', 'register'].map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'login' ? 'Log in' : 'Sign up'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'register' && (
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="your_username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="hello@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>{tab === 'login' ? 'Log in' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.legalText}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 340, justifyContent: 'flex-end' },
  heroContent: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  logo: { fontSize: 48, fontWeight: '800', color: colors.white, fontStyle: 'italic', marginBottom: 6 },
  tagline: { fontSize: typography.sizes.lg, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xl },
  heroStats: { flexDirection: 'row', gap: spacing['2xl'] },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: typography.sizes['2xl'], fontWeight: '800', color: colors.white },
  heroStatLbl: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  card: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -24, padding: spacing.xl, flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: colors.neutral100, borderRadius: radius.full, padding: 4, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.neutral400 },
  tabTextActive: { color: colors.neutral900 },
  inputWrap: { marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.neutral700, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.neutral200, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 13, fontSize: typography.sizes.md, color: colors.neutral900, backgroundColor: colors.neutral50 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: colors.white, fontSize: typography.sizes.lg, fontWeight: '700' },
  legalText: { textAlign: 'center', fontSize: typography.sizes.xs, color: colors.neutral400, marginTop: spacing.lg, lineHeight: 16 },
});
