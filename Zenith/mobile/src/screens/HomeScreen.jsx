import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/feed/PostCard';
import StoryReel from '../components/feed/StoryReel';
import useFeedStore from '../store/feedStore';
import useAuthStore from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { colors, typography, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { posts, loading, hasMore, filter, fetchPosts, loadMore, setFilter, updatePostLike, prependPost } = useFeedStore();
  const user = useAuthStore((s) => s.user);

  useSocket({
    'post:liked': ({ postId, likeCount }) => updatePostLike(postId, false, likeCount),
    'feed:new_post': (post) => prependPost(post),
  });

  useEffect(() => { fetchPosts(); }, []);

  const renderHeader = () => (
    <View>
      <StoryReel />
      {/* Filter toggle */}
      <View style={styles.filterRow}>
        {['recent', 'trending'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'recent' ? '🕐 Recent' : '🔥 Trending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return <View style={{ height: 20 }} />;
    return loading && posts.length > 0 ? (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    ) : null;
  };

  const renderEmpty = () =>
    !loading ? (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🌍</Text>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyBody}>Be the first to share a trip!</Text>
      </View>
    ) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Zenith</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Map')} style={styles.iconBtn}>
            <Ionicons name="map-outline" size={22} color={colors.neutral700} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { username: user?.username })} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.neutral700} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} onLikeToggle={updatePostLike} />}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={loading && posts.length > 0} onRefresh={fetchPosts} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral100 },
  logoText: { fontSize: 24, fontWeight: '800', color: colors.primary, fontStyle: 'italic' },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.neutral100 },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.neutral500 },
  filterChipTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 20 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.neutral900, marginBottom: 8 },
  emptyBody: { fontSize: typography.sizes.md, color: colors.neutral400 },
});
