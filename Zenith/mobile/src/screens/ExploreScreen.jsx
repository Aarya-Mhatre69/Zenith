import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import PostCard from '../components/feed/PostCard';
import api from '../lib/api';
import { colors, typography, spacing, radius, shadows } from '../theme';

const FILTERS = ['All', 'Adventure', 'Culture', 'Food', 'Relaxation', 'Nature', 'Nightlife'];
const DESTINATIONS = [
  { name: 'Bali', photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=140&fit=crop' },
  { name: 'Tokyo', photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7483?w=200&h=140&fit=crop' },
  { name: 'Paris', photo: 'https://images.unsplash.com/photo-1499678779905-54e0b21a94e2?w=200&h=140&fit=crop' },
  { name: 'Santorini', photo: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&h=140&fit=crop' },
  { name: 'Marrakech', photo: 'https://images.unsplash.com/photo-1539020140153-5a0e2c1fc72e?w=200&h=140&fit=crop' },
  { name: 'Kyoto', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=140&fit=crop' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim() && activeFilter === 'All') {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      doSearch();
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeFilter]);

  const doSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (activeFilter !== 'All') params.set('travelStyle', activeFilter.toUpperCase());
      const data = await api.get(`/posts?${params.toString()}&limit=20`);
      setResults(data.posts || data);
    } catch {}
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.neutral400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations, trips..."
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={colors.neutral400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={searched ? results : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          item.days_data ? <ItineraryCard itinerary={item} /> : <PostCard post={item} />
        )}
        ListHeaderComponent={() => (
          <View>
            {/* Filter chips */}
            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(i) => i}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  onPress={() => setActiveFilter(f)}
                  style={[styles.chip, activeFilter === f && styles.chipActive]}
                >
                  <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              )}
            />

            {!searched && (
              <>
                <Text style={styles.sectionTitle}>Popular Destinations</Text>
                <FlatList
                  horizontal
                  data={DESTINATIONS}
                  keyExtractor={(d) => d.name}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12 }}
                  renderItem={({ item: d }) => (
                    <TouchableOpacity
                      style={styles.destCard}
                      onPress={() => { setQuery(d.name); }}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: d.photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      <View style={styles.destOverlay} />
                      <Text style={styles.destName}>{d.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
        )}
        ListEmptyComponent={() =>
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : searched ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyBody}>Try a different search or filter</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  topBar: { backgroundColor: colors.white, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral100 },
  title: { fontSize: typography.sizes['3xl'], fontWeight: '800', color: colors.neutral900, fontStyle: 'italic', marginBottom: 12 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.neutral100, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchIcon: { flexShrink: 0 },
  searchInput: { flex: 1, fontSize: typography.sizes.md, color: colors.neutral900 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.neutral100 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.neutral500 },
  chipTextActive: { color: colors.white },
  sectionTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.neutral900, paddingHorizontal: spacing.xl, marginBottom: 12, marginTop: 4 },
  destCard: { width: 150, height: 100, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end', padding: 10, ...shadows.sm },
  destOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  destName: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.md },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.neutral700, marginBottom: 6 },
  emptyBody: { fontSize: typography.sizes.md, color: colors.neutral400 },
});
