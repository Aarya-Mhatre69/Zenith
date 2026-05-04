import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import PostCard from '../components/feed/PostCard';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { colors, typography, spacing, radius, shadows } from '../theme';

const TIER_COLORS = {
  Explorer: colors.primary,
  Adventurer: colors.accent,
  Globetrotter: colors.purple,
  Legend: '#F59E0B',
};

function getTier(score) {
  if (score >= 5000) return 'Legend';
  if (score >= 1000) return 'Globetrotter';
  if (score >= 200) return 'Adventurer';
  return 'Explorer';
}

const TABS = ['Posts', 'Itineraries', 'Saved'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = route.params || {};
  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [following, setFollowing] = useState(false);

  const isOwn = !username || username === currentUser?.username || username === 'me';

  const load = async () => {
    setLoading(true);
    try {
      const targetUsername = isOwn ? currentUser?.username : username;
      const profileData = await api.get(`/users/profile/${targetUsername}`);
      setProfile(profileData);
      setFollowing(profileData.isFollowing || false);

      const [p, i, s] = await Promise.all([
        api.get(`/users/${profileData.id}/posts`),
        api.get(`/users/${profileData.id}/itineraries`),
        isOwn ? api.get(`/users/${profileData.id}/saved`) : Promise.resolve([]),
      ]);
      setPosts(p || []);
      setItineraries(i || []);
      setSaved(s || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [username]);

  const handleFollow = async () => {
    setFollowing((f) => !f);
    try {
      await api.post(`/users/${profile.id}/follow`);
    } catch {
      setFollowing((f) => !f);
    }
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const tier = getTier(profile?.travelScore || 0);
  const tierColor = TIER_COLORS[tier];

  const savedItins = saved.filter((s) => s.itinerary).map((s) => s.itinerary);
  const savedPosts = saved.filter((s) => s.post).map((s) => s.post);

  const renderContent = () => {
    if (activeTab === 'Posts') {
      if (posts.length === 0) return <View style={styles.empty}><Text style={styles.emptyIcon}>📸</Text><Text style={styles.emptyText}>No posts yet</Text></View>;
      return posts.map((p) => <PostCard key={p.id} post={p} />);
    }
    if (activeTab === 'Itineraries') {
      if (itineraries.length === 0) return <View style={styles.empty}><Text style={styles.emptyIcon}>🗺️</Text><Text style={styles.emptyText}>No itineraries yet</Text></View>;
      return (
        <View style={styles.grid}>
          {itineraries.map((itin) => (
            <View key={itin.id} style={styles.gridItem}>
              <ItineraryCard itinerary={itin} showAuthor={false} compact />
            </View>
          ))}
        </View>
      );
    }
    if (activeTab === 'Saved') {
      if (savedItins.length === 0 && savedPosts.length === 0) return <View style={styles.empty}><Text style={styles.emptyIcon}>🔖</Text><Text style={styles.emptyText}>Nothing saved yet</Text></View>;
      return (
        <View>
          {savedItins.length > 0 && savedItins.map((itin) => <ItineraryCard key={itin.id} itinerary={itin} compact />)}
          {savedPosts.length > 0 && savedPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={[1]}
        keyExtractor={() => 'p'}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={() => (
          <View>
            {/* Nav bar */}
            <View style={styles.navBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.neutral700} />
              </TouchableOpacity>
              <Text style={styles.navTitle}>@{profile?.username}</Text>
              {isOwn ? (
                <TouchableOpacity onPress={logout} style={styles.navBtn}>
                  <Ionicons name="log-out-outline" size={22} color={colors.neutral700} />
                </TouchableOpacity>
              ) : <View style={styles.navBtn} />}
            </View>

            {/* Profile header */}
            <View style={styles.profileHeader}>
              <View style={[styles.avatarWrap, { borderColor: tierColor }]}>
                {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={[styles.avatarLetter, { color: tierColor }]}>{profile?.username?.[0]?.toUpperCase()}</Text>
                  </View>
                )}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.displayName}>{profile?.username}</Text>
                <View style={[styles.tierBadge, { backgroundColor: tierColor + '20' }]}>
                  <Text style={[styles.tierText, { color: tierColor }]}>✦ {tier}</Text>
                </View>
                {profile?.bio && <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>}
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { value: posts.length, label: 'Posts' },
                { value: profile?._count?.followers || 0, label: 'Followers' },
                { value: profile?._count?.following || 0, label: 'Following' },
              ].map((s, i) => (
                <View key={s.label} style={[styles.stat, i < 2 && styles.statBorder]}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {isOwn ? (
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('MyTrips')}>
                  <Text style={styles.editBtnText}>My Trips</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.followBtn, following && styles.followingBtn]} onPress={handleFollow}>
                  <Text style={[styles.followBtnText, following && { color: colors.neutral700 }]}>
                    {following ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {(isOwn ? TABS : TABS.slice(0, 2)).map((tab, idx) => (
                <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                  <View style={[styles.tabLine, activeTab === tab && styles.tabLineActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        renderItem={() => <View style={styles.content}>{renderContent()}</View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  center: { alignItems: 'center', justifyContent: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.white },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.neutral900 },
  profileHeader: { flexDirection: 'row', padding: spacing.xl, gap: 16, backgroundColor: colors.white },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 40 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 28, fontWeight: '700' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  displayName: { fontSize: typography.sizes.xl, fontWeight: '800', color: colors.neutral900, marginBottom: 4 },
  tierBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, marginBottom: 6 },
  tierText: { fontSize: typography.sizes.xs, fontWeight: '700' },
  bio: { fontSize: typography.sizes.base, color: colors.neutral500, lineHeight: 18 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.neutral100 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderRightWidth: 1, borderRightColor: colors.neutral100 },
  statValue: { fontSize: typography.sizes.xl, fontWeight: '800', color: colors.neutral900 },
  statLabel: { fontSize: typography.sizes.xs, color: colors.neutral400, marginTop: 2 },
  actions: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.white },
  editBtn: { borderWidth: 1.5, borderColor: colors.neutral200, borderRadius: radius.full, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.neutral700 },
  followBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 11, alignItems: 'center' },
  followingBtn: { backgroundColor: colors.neutral100 },
  followBtnText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.white },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral200 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.neutral400 },
  tabTextActive: { color: colors.primary },
  tabLine: { height: 2.5, width: '50%', backgroundColor: 'transparent', marginTop: 8, borderRadius: 2 },
  tabLineActive: { backgroundColor: colors.primary },
  content: { padding: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: typography.sizes.lg, color: colors.neutral400 },
});
