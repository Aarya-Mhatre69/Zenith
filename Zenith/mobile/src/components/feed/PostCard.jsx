import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography, shadows, spacing } from '../../theme';
import api from '../../lib/api';

export default function PostCard({ post, onLikeToggle }) {
  const navigation = useNavigation();
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  const photo = post.photos?.[0] || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop&auto=format`;

  const handleLike = async () => {
    const prev = liked;
    setLiked(!prev);
    setLikeCount((c) => c + (prev ? -1 : 1));
    try {
      await api.post(`/posts/${post.id}/like`);
      onLikeToggle?.(post.id, !prev, likeCount + (prev ? -1 : 1));
    } catch {
      setLiked(prev);
      setLikeCount((c) => c + (prev ? 1 : -1));
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => navigation.navigate('PostDetail', { id: post.id })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay} />
        <View style={styles.destinationBadge}>
          <Text style={styles.destinationText}>📍 {post.destination}</Text>
        </View>
        {post.travelStyle?.length > 0 && (
          <View style={styles.styleBadge}>
            <Text style={styles.styleText}>{post.travelStyle[0]}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.authorRow}>
          {post.author?.avatarUrl ? (
            <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>{post.author?.username?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { username: post.author?.username })}>
            <Text style={styles.username}>@{post.author?.username}</Text>
          </TouchableOpacity>
          <Text style={styles.duration}>· {post.duration}d</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>

        {post.hashtags?.length > 0 && (
          <View style={styles.tagsRow}>
            {post.hashtags.slice(0, 3).map((tag) => (
              <TouchableOpacity key={tag} onPress={() => navigation.navigate('HashtagFeed', { tag })}>
                <Text style={styles.tag}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={handleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.danger : colors.neutral400} />
            <Text style={styles.statText}>{likeCount}</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Ionicons name="bookmark-outline" size={17} color={colors.neutral400} />
            <Text style={styles.statText}>{post._count?.saves || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.neutral400} />
            <Text style={styles.statText}>{post._count?.comments || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: 14, ...shadows.md, overflow: 'hidden' },
  imageContainer: { height: 200, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  destinationBadge: { position: 'absolute', bottom: 10, left: 12 },
  destinationText: { color: 'rgba(255,255,255,0.9)', fontSize: typography.sizes.base, fontWeight: '600' },
  styleBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(29,158,117,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  styleText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: '700' },
  body: { padding: 14 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: colors.primary, fontSize: typography.sizes.sm, fontWeight: '700' },
  username: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.neutral700 },
  duration: { fontSize: typography.sizes.sm, color: colors.neutral400 },
  title: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.neutral900, marginBottom: 8, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  tag: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: typography.sizes.base, color: colors.neutral500 },
});
