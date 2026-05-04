import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../lib/api';
import { colors, typography, spacing, radius, shadows } from '../theme';

const DAY_COLORS = ['#1D9E75', '#E8784A', '#7F77DD', '#F59E0B', '#3B82F6', '#EC4899', '#10B981'];
const BALI_REGION = { latitude: -8.4095, longitude: 115.1889, latitudeDelta: 0.15, longitudeDelta: 0.15 };

function spreadAround(center, index, total) {
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
  const r = 0.025 + (index % 3) * 0.015;
  return {
    latitude: center.latitude + r * Math.cos(angle),
    longitude: center.longitude + r * Math.sin(angle) * 1.3,
  };
}

async function geocode(destination) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`, { headers: { 'User-Agent': 'ZenithTravel/1.0' } });
    const data = await res.json();
    if (data.length > 0) return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon), latitudeDelta: 0.12, longitudeDelta: 0.12 };
  } catch {}
  return null;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const itineraryId = route.params?.itineraryId;
  const isRouteMode = !!itineraryId;

  const mapRef = useRef(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const [itinerary, setItinerary] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [region, setRegion] = useState(BALI_REGION);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [activeDay, setActiveDay] = useState(-1);

  useEffect(() => {
    if (!itineraryId) return;
    setLoadingRoute(true);
    api.get(`/itineraries/${itineraryId}`)
      .then(async (data) => {
        setItinerary(data);
        const center = await geocode(data.destination);
        const fallback = center || BALI_REGION;
        setRegion(fallback);

        const totalActivities = (data.days_data || []).reduce((s, d) => s + (d.activities?.length || 0), 0);
        const centerCoord = { latitude: fallback.latitude, longitude: fallback.longitude };
        let gi = 0;
        const all = [];
        (data.days_data || []).forEach((day) => {
          (day.activities || []).forEach((act) => {
            const pos = (act.lat && act.lng)
              ? { latitude: act.lat, longitude: act.lng }
              : spreadAround(centerCoord, gi, totalActivities);
            all.push({ ...act, ...pos, dayNumber: day.dayNumber, dayIndex: day.dayNumber - 1, globalIndex: gi });
            gi++;
          });
        });
        setWaypoints(all);
      })
      .catch(() => {})
      .finally(() => setLoadingRoute(false));
  }, [itineraryId]);

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 0 : 1;
    setSheetExpanded(!sheetExpanded);
    Animated.spring(sheetAnim, { toValue, useNativeDriver: false, tension: 60, friction: 10 }).start();
  };

  const visibleWaypoints = activeDay === -1 ? waypoints : waypoints.filter((w) => w.dayIndex === activeDay);
  const polylineCoords = visibleWaypoints.map((w) => ({ latitude: w.latitude, longitude: w.longitude }));

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} region={region} showsUserLocation showsCompass={false}>
        {visibleWaypoints.map((wp) => (
          <Marker
            key={wp.id}
            coordinate={{ latitude: wp.latitude, longitude: wp.longitude }}
            title={wp.name}
            description={`Day ${wp.dayNumber} · ${wp.timeOfDay}`}
          >
            <View style={[styles.pin, { backgroundColor: DAY_COLORS[wp.dayIndex % DAY_COLORS.length] }]}>
              <Text style={styles.pinText}>{wp.globalIndex + 1}</Text>
            </View>
          </Marker>
        ))}
        {polylineCoords.length > 1 && (
          <Polyline coordinates={polylineCoords} strokeColor={colors.primary} strokeWidth={3} lineDashPattern={[8, 5]} />
        )}
      </MapView>

      {/* Top overlay */}
      <View style={[styles.topOverlay, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.neutral700} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.neutral400} />
          <Text style={styles.searchBarText} numberOfLines={1}>
            {isRouteMode ? (itinerary?.destination || 'Loading...') : 'Search on map...'}
          </Text>
        </View>
      </View>

      {/* Day pills */}
      {isRouteMode && itinerary?.days_data?.length > 0 && (
        <View style={[styles.dayPills, { top: insets.top + 66 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.xl }}>
            <TouchableOpacity
              style={[styles.pill, activeDay === -1 && { backgroundColor: colors.primary }]}
              onPress={() => setActiveDay(-1)}
            >
              <Text style={[styles.pillText, activeDay === -1 && { color: colors.white }]}>All Days</Text>
            </TouchableOpacity>
            {itinerary.days_data.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pill, activeDay === i && { backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }]}
                onPress={() => setActiveDay(i)}
              >
                <Text style={[styles.pillText, activeDay === i && { color: colors.white }]}>Day {day.dayNumber}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 420] }) }]}>
        <TouchableOpacity style={styles.sheetHandle} onPress={toggleSheet}>
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {isRouteMode ? (
          <>
            {loadingRoute ? (
              <View style={styles.sheetLoading}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.sheetLoadingText}>Loading route...</Text>
              </View>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle} numberOfLines={1}>{itinerary?.title}</Text>
                  <Text style={styles.sheetSubtitle}>{waypoints.length} stops · {itinerary?.days} days · {itinerary?.destination}</Text>
                </View>
                <FlatList
                  data={visibleWaypoints}
                  keyExtractor={(w) => w.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: spacing.xl }}
                  renderItem={({ item: wp }) => (
                    <View style={styles.waypointRow}>
                      <View style={[styles.wpPin, { backgroundColor: DAY_COLORS[wp.dayIndex % DAY_COLORS.length] }]}>
                        <Text style={styles.wpPinText}>{wp.globalIndex + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.wpTitleRow}>
                          <Text style={styles.wpName} numberOfLines={1}>{wp.emoji} {wp.name}</Text>
                          {wp.estimatedCost > 0 && <Text style={styles.wpCost}>${wp.estimatedCost}</Text>}
                        </View>
                        <Text style={[styles.wpDay, { color: DAY_COLORS[wp.dayIndex % DAY_COLORS.length] }]}>Day {wp.dayNumber} · {wp.timeOfDay}{wp.duration ? ` · ${wp.duration}` : ''}</Text>
                        {wp.location && <Text style={styles.wpLocation} numberOfLines={1}>📍 {wp.location}</Text>}
                      </View>
                    </View>
                  )}
                />
                <View style={{ padding: spacing.xl, paddingTop: 8 }}>
                  <TouchableOpacity style={styles.backItinBtn} onPress={() => navigation.navigate('ItineraryDetail', { id: itineraryId })}>
                    <Text style={styles.backItinBtnText}>← Back to Itinerary</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        ) : (
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Nearby Spots</Text>
            <Text style={styles.sheetSubtitle}>Explore places around you</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topOverlay: { position: 'absolute', left: spacing.xl, right: spacing.xl, flexDirection: 'row', gap: 10, alignItems: 'center' },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 11, gap: 8, ...shadows.md },
  searchBarText: { flex: 1, fontSize: typography.sizes.md, color: colors.neutral500 },
  dayPills: { position: 'absolute', left: 0, right: 0 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.white, ...shadows.sm },
  pillText: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.neutral700 },
  pin: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white, ...shadows.sm },
  pinText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadows.lg },
  sheetHandle: { paddingVertical: 10, alignItems: 'center' },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.neutral200 },
  sheetHeader: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  sheetTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.neutral900, marginBottom: 2 },
  sheetSubtitle: { fontSize: typography.sizes.base, color: colors.neutral400 },
  sheetLoading: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.xl },
  sheetLoadingText: { fontSize: typography.sizes.md, color: colors.neutral400 },
  waypointRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.neutral100, alignItems: 'flex-start' },
  wpPin: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  wpPinText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  wpTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  wpName: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.neutral900, flex: 1 },
  wpCost: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary },
  wpDay: { fontSize: typography.sizes.sm, fontWeight: '600', marginBottom: 2 },
  wpLocation: { fontSize: typography.sizes.sm, color: colors.neutral400 },
  backItinBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 13, alignItems: 'center' },
  backItinBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.md },
});
