import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import PostCard from '../components/feed/PostCard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { colors, typography, spacing, radius } from '../theme';

const TABS = ['Created', 'Saved', 'AI Trips'];

function EmptyState({ icon, title, body, cta, onCta }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {cta && <TouchableOpacity style={styles.emptyCta} onPress={onCta}><Text style={styles.emptyCtaText}>{cta}</Text></TouchableOpacity>}
    </View>
  );
}

export default function MyTripsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('Created');
  const [itineraries, setItineraries] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [itin, saves] = await Promise.all([
        api.get(`/users/${user.id}/itineraries`),
        api.get(`/users/${user.id}/saved`),
      ]);
      setItineraries(itin || []);
      setSaved(saves || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const aiTrips = itineraries.filter((i) => i.isAiGenerated);
  const myTrips = itineraries.filter((i) => !i.isAiGenerated);
  const savedItins = saved.filter((s) => s.itinerary).map((s) => s.itinerary);
  const savedPosts = saved.filter((s) => s.post).map((s) => s.post);

  const renderContent = () => {
    if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;

    if (activeTab === 'Created') {
      if (myTrips.length === 0) return <EmptyState icon="🗺️" title="No trips created yet" body="Plan your first adventure or clone one." cta="Plan a Trip" onCta={() => navigation.navigate('PlanTrip')} />;
      return (
        <View style={styles.grid}>
          {myTrips.map((itin) => (
            <View key={itin.id} style={styles.gridItem}>
              <ItineraryCard itinerary={itin} showAuthor={false} compact />
            </View>
          ))}
        </View>
      );
    }

    if (activeTab === 'Saved') {
      if (savedItins.length === 0 && savedPosts.length === 0) return <EmptyState icon="🔖" title="Nothing saved yet" body="Bookmark itineraries and posts to find them here." cta="Explore Feed" onCta={() => navigation.navigate('Explore')} />;
      return (
        <View>
          {savedItins.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Saved Itineraries</Text>
              {savedItins.map((itin) => <ItineraryCard key={itin.id} itinerary={itin} />)}
            </>
          )}
          {savedPosts.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Saved Posts</Text>
              {savedPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </>
          )}
        </View>
      );
    }

    if (activeTab === 'AI Trips') {
      if (aiTrips.length === 0) return <EmptyState icon="✨" title="No AI trips yet" body="Let AI build a personalized itinerary for you." cta="Generate with AI" onCta={() => navigation.navigate('PlanTrip')} />;
      return (
        <View>
          <View style={styles.aiBanner}>
            <Text style={styles.aiBannerText}>✨ These were AI-generated — tap any to view, clone, or customize.</Text>
          </View>
          {aiTrips.map((itin) => <ItineraryCard key={itin.id} itinerary={itin} showAuthor={false} />)}
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity style={styles.planBtn} onPress={() => navigation.navigate('PlanTrip')}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.planBtnText}>Plan Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      {!loading && (
        <View style={styles.stats}>
          {[
            { value: itineraries.length, label: 'Created', color: colors.primary },
            { value: aiTrips.length, label: 'AI Trips', color: colors.purple },
            { value: savedItins.length, label: 'Saved', color: colors.accent },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statItem, i < 2 && styles.statBorder]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            <View style={[styles.tabUnderline, activeTab === tab && styles.tabUnderlineActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={[1]}
        keyExtractor={() => 'content'}
        renderItem={() => <View style={styles.content}>{renderContent()}</View>}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      />

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { bottom: 24 + (insets.bottom || 0) }]} onPress={() => navigation.navigate('PlanTrip')}>
        <Text style={styles.fabIcon}>✨</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.white },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.neutral900, fontStyle: 'italic' },
  planBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  planBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.base },
  stats: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: colors.neutral50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.neutral100, marginTop: spacing.md },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder: { borderRightWidth: 1, borderRightColor: colors.neutral100 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: typography.sizes.xs, color: colors.neutral400, fontWeight: '500', marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral200, marginTop: spacing.md },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabText: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.neutral400 },
  tabTextActive: { color: colors.primary },
  tabUnderline: { height: 2.5, width: '60%', backgroundColor: 'transparent', marginTop: 8, borderRadius: 2 },
  tabUnderlineActive: { backgroundColor: colors.primary },
  content: { padding: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  aiBanner: { backgroundColor: colors.primaryLight, padding: 12, borderRadius: radius.md, marginBottom: 14, borderWidth: 1, borderColor: colors.primary100 },
  aiBannerText: { fontSize: typography.sizes.base, color: colors.primaryDark, lineHeight: 18 },
  sectionLabel: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.neutral900, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.neutral700, marginBottom: 8 },
  emptyBody: { fontSize: typography.sizes.md, color: colors.neutral400, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyCta: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.full },
  emptyCtaText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.md },
  fab: { position: 'absolute', right: spacing.xl, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabIcon: { fontSize: 22 },
});
