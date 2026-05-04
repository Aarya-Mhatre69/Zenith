import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import useAuthStore from '../../store/authStore';

const DEST_STORIES = [
  { id: '1', dest: 'Bali', photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=80&h=80&fit=crop', hasNew: true },
  { id: '2', dest: 'Tokyo', photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7483?w=80&h=80&fit=crop', hasNew: true },
  { id: '3', dest: 'Paris', photo: 'https://images.unsplash.com/photo-1499678779905-54e0b21a94e2?w=80&h=80&fit=crop', hasNew: false },
  { id: '4', dest: 'Santorini', photo: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=80&h=80&fit=crop', hasNew: true },
  { id: '5', dest: 'Kyoto', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=80&h=80&fit=crop', hasNew: false },
  { id: '6', dest: 'Marrakech', photo: 'https://images.unsplash.com/photo-1539020140153-5a0e2c1fc72e?w=80&h=80&fit=crop', hasNew: true },
  { id: '7', dest: 'Vietnam', photo: 'https://images.unsplash.com/photo-1540575467537-786dd4da2f1f?w=80&h=80&fit=crop', hasNew: false },
];

export default function StoryReel() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Your story */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('CreatePost')}>
        <View style={styles.yourStoryRing}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.storyImg} />
          ) : (
            <View style={[styles.storyImg, styles.storyFallback]}>
              <Text style={styles.fallbackLetter}>{user?.username?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.plusBadge}>
            <Ionicons name="add" size={12} color={colors.white} />
          </View>
        </View>
        <Text style={styles.label} numberOfLines={1}>Your story</Text>
      </TouchableOpacity>

      {DEST_STORIES.map((s) => (
        <TouchableOpacity key={s.id} style={styles.item} onPress={() => navigation.navigate('Explore', { destination: s.dest })}>
          <LinearGradient
            colors={s.hasNew ? [colors.primary, colors.accent] : [colors.neutral200, colors.neutral300 || colors.neutral200]}
            style={styles.ring}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
          >
            <Image source={{ uri: s.photo }} style={styles.storyImg} />
          </LinearGradient>
          <Text style={styles.label} numberOfLines={1}>{s.dest}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: 14 },
  item: { alignItems: 'center', width: 68 },
  ring: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', padding: 2.5 },
  yourStoryRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.neutral200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  storyImg: { width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, borderColor: colors.white },
  storyFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  fallbackLetter: { color: colors.primary, fontSize: 22, fontWeight: '700' },
  plusBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  label: { marginTop: 5, fontSize: typography.sizes.xs, color: colors.neutral500, textAlign: 'center' },
});
