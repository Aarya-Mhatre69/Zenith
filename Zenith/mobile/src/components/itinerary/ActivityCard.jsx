import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography, shadows } from '../../theme';

const TIME_COLORS = {
  MORNING: { bg: '#FEF9C3', text: '#854D0E' },
  AFTERNOON: { bg: '#FFEDD5', text: '#C2410C' },
  EVENING: { bg: '#EDE9FE', text: '#5B21B6' },
};

export default function ActivityCard({ activity, index }) {
  const tc = TIME_COLORS[activity.timeOfDay] || TIME_COLORS.MORNING;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        {index < 10 && <View style={styles.connector} />}
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{activity.emoji || '📍'}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>{activity.name}</Text>
              <View style={[styles.timeBadge, { backgroundColor: tc.bg }]}>
                <Text style={[styles.timeText, { color: tc.text }]}>{activity.timeOfDay}</Text>
              </View>
            </View>
            {activity.location && (
              <Text style={styles.location} numberOfLines={1}>📍 {activity.location}</Text>
            )}
          </View>
        </View>

        {activity.description && (
          <Text style={styles.description} numberOfLines={2}>{activity.description}</Text>
        )}

        <View style={styles.footer}>
          {activity.duration && (
            <View style={styles.footerChip}>
              <Text style={styles.footerChipText}>⏱ {activity.duration}</Text>
            </View>
          )}
          {activity.estimatedCost > 0 && (
            <View style={styles.footerChip}>
              <Text style={styles.footerChipText}>💵 ${activity.estimatedCost}</Text>
            </View>
          )}
        </View>

        {activity.tips && (
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 {activity.tips}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', marginBottom: 12 },
  left: { alignItems: 'center', marginRight: 12 },
  indexCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  indexText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: '700' },
  connector: { width: 2, flex: 1, backgroundColor: colors.neutral100, marginTop: 4, minHeight: 20 },
  body: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, ...shadows.sm },
  header: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  emoji: { fontSize: 24, width: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 },
  name: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.neutral900, flex: 1 },
  timeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, flexShrink: 0 },
  timeText: { fontSize: typography.sizes.xs, fontWeight: '700' },
  location: { fontSize: typography.sizes.sm, color: colors.neutral500 },
  description: { fontSize: typography.sizes.base, color: colors.neutral700, lineHeight: 18, marginBottom: 8 },
  footer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  footerChip: { backgroundColor: colors.neutral50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  footerChipText: { fontSize: typography.sizes.sm, color: colors.neutral700, fontWeight: '500' },
  tipBox: { backgroundColor: '#FFFBEB', padding: 8, borderRadius: radius.sm, borderLeftWidth: 3, borderLeftColor: colors.warning },
  tipText: { fontSize: typography.sizes.sm, color: '#92400E', lineHeight: 16 },
});
