import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, typography, shadows } from '../../theme';

const DEST_PHOTOS = {
  bali: '1537996194471-e657df975ab4',
  kyoto: '1493976040374-85c8e12f0c0e',
  paris: '1499678779905-54e0b21a94e2',
  marrakech: '1539020140153-5a0e2c1fc72e',
  santorini: '1570077188670-e3a8d69ac5ff',
  bangkok: '1528360983277-13d401cdc186',
  tokyo: '1542051841857-5f90071e7483',
  vietnam: '1540575467537-786dd4da2f1f',
  venice: '1516483638261-f4dbaf036963',
  iceland: '1523531294919-4bcd7c65d49c',
  amsterdam: '1560969184-10fe8719e047',
};

function getPhoto(destination, id) {
  const key = destination?.toLowerCase();
  const photoId = Object.entries(DEST_PHOTOS).find(([k]) => key?.includes(k))?.[1] || '1476514525535-07fb3b4ae5f1';
  return `https://images.unsplash.com/photo-${photoId}?w=600&h=400&fit=crop&auto=format&sig=${id}`;
}

const BUDGET_COLORS = {
  BACKPACKER: '#9AA0A6',
  BUDGET: colors.primary,
  MID_RANGE: colors.accent,
  LUXURY: colors.purple,
};

export default function ItineraryCard({ itinerary, showAuthor = true, compact = false }) {
  const navigation = useNavigation();
  const photo = getPhoto(itinerary.destination, itinerary.id);
  const budgetColor = BUDGET_COLORS[itinerary.budget] || BUDGET_COLORS.MID_RANGE;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compact}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ItineraryDetail', { id: itinerary.id })}
      >
        <View style={styles.compactImg}>
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={styles.overlay} />
          {itinerary.isAiGenerated && (
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>✨ AI</Text></View>
          )}
          <View style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
            <Text style={styles.compactTitle} numberOfLines={1}>{itinerary.title}</Text>
            <Text style={styles.compactDest}>📍 {itinerary.destination}</Text>
          </View>
        </View>
        <View style={styles.compactFooter}>
          <Text style={styles.compactDays}>🗓 {itinerary.days}d</Text>
          <Text style={[styles.budgetLabel, { color: budgetColor }]}>{itinerary.budget?.replace('_', ' ')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => navigation.navigate('ItineraryDetail', { id: itinerary.id })}
    >
      <View style={styles.fullImg}>
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.overlay} />
        {itinerary.isAiGenerated && (
          <View style={styles.aiBadgeFull}><Text style={styles.aiBadgeText}>✨ AI Generated</Text></View>
        )}
        <View style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
          <Text style={styles.destLabel}>📍 {itinerary.destination}</Text>
          <Text style={styles.fullTitle} numberOfLines={2}>{itinerary.title}</Text>
        </View>
      </View>

      <View style={styles.fullFooter}>
        {showAuthor && itinerary.author && (
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>{itinerary.author.username?.[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.authorName}>@{itinerary.author.username}</Text>
          </View>
        )}
        <View style={styles.statsRow}>
          {[
            { icon: '🗓', value: `${itinerary.days}d` },
            { icon: '💵', value: itinerary.estimatedCost ? `$${itinerary.estimatedCost.toLocaleString()}` : '—' },
            { icon: '⭐', value: itinerary.rating?.toFixed(1) || '4.8' },
            { icon: '🔖', value: `${itinerary._count?.saves ?? itinerary.saveCount ?? 0}` },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: 14, ...shadows.md, overflow: 'hidden' },
  compact: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadows.sm },
  compactImg: { height: 130, position: 'relative' },
  fullImg: { height: 185, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  aiBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(29,158,117,0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  aiBadgeFull: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(29,158,117,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  aiBadgeText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: '700' },
  compactTitle: { color: colors.white, fontSize: typography.sizes.md, fontWeight: '700' },
  compactDest: { color: 'rgba(255,255,255,0.85)', fontSize: typography.sizes.sm },
  compactFooter: { padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compactDays: { fontSize: typography.sizes.base, fontWeight: '600' },
  budgetLabel: { fontSize: typography.sizes.sm, fontWeight: '600' },
  destLabel: { color: 'rgba(255,255,255,0.85)', fontSize: typography.sizes.sm, marginBottom: 4 },
  fullTitle: { color: colors.white, fontSize: 17, fontWeight: '700', lineHeight: 22 },
  fullFooter: { padding: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  authorAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '700' },
  authorName: { fontSize: typography.sizes.sm, color: colors.neutral700 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statBorder: { borderRightWidth: 1, borderRightColor: colors.neutral100 },
  statIcon: { fontSize: 14 },
  statValue: { fontSize: typography.sizes.sm, fontWeight: '600', marginTop: 2, color: colors.neutral700 },
});
