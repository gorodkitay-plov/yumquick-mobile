import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, SafeAreaView, ScrollView,
  StatusBar
} from 'react-native';
import { restaurantApi } from '../api';
import { useAuthStore } from '../store/authStore';

const COLORS = {
  primary: '#FF6B00',
  background: '#FFF8F0',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#888888',
};

const CATEGORIES = [
  { id: '1', name: 'Snacks', emoji: '🍟' },
  { id: '2', name: 'Meal', emoji: '🍱' },
  { id: '3', name: 'Vegan', emoji: '🥗' },
  { id: '4', name: 'Dessert', emoji: '🍰' },
  { id: '5', name: 'Drinks', emoji: '🧃' },
];

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Здарова Андрей';
    if (hour < 18) return 'Похавать зашел, А?';
    return 'Хватит!';
  };

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const res = await restaurantApi.getAll();
      setRestaurants(res.data.data?.content ?? res.data.data ?? []);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  useEffect(() => { loadRestaurants(); }, []);

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.subGreeting}>Rise And Shine! It's Meal Time</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Text style={styles.iconText}>🛒</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Text style={styles.iconText}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search food..."
                placeholderTextColor="#aaa"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer} style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
                <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemSelected]}
                    onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryName, selectedCategory === cat.id && styles.categoryNameSelected]}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerSmall}>Experience our</Text>
              <Text style={styles.bannerBig}>delicious new dish</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>30% OFF</Text>
              </View>
            </View>
            <Text style={styles.bannerEmoji}>🍕</Text>
          </View>

          {/* Best Sellers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Best Seller</Text>
              <TouchableOpacity><Text style={styles.viewAll}>View All →</Text></TouchableOpacity>
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ padding: 20 }} />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {restaurants.map(item => (
                      <TouchableOpacity
                          key={item.id}
                          style={styles.hCard}
                          onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
                      >
                        <View style={styles.hCardImage}>
                          <Text style={styles.hCardEmoji}>🍽️</Text>
                        </View>
                        <Text style={styles.hCardName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.hCardPrice}>от ₩{Number(item.minOrder).toLocaleString()}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>
            )}
          </View>

          {/* Recommend */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommend</Text>
            </View>
            {restaurants.map(item => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })}
                >
                  <View style={styles.cardImageContainer}>
                    <Text style={styles.cardEmoji}>🍽️</Text>
                    {item.deliveryFee === 0 && (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>Free Delivery</Text>
                        </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardRating}>⭐ {item.rating?.toFixed(1) ?? '0.0'}</Text>
                      <Text style={styles.cardDot}>·</Text>
                      <Text style={styles.cardDelivery}>🕐 {item.estimatedDeliveryMinutes ?? 30} мин</Text>
                      <Text style={styles.cardDot}>·</Text>
                      <Text style={styles.cardFee}>{Number(item.deliveryFee) > 0 ? `₩${Number(item.deliveryFee).toLocaleString()}` : 'Бесплатно'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  subGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  categoriesScroll: { marginTop: 16 },
  categoriesContainer: { paddingHorizontal: 16, gap: 12, paddingVertical: 4 },
  categoryItem: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, minWidth: 70, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  categoryItemSelected: { backgroundColor: '#FF6B00' },
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: 11, color: '#888', fontWeight: '500' },
  categoryNameSelected: { color: '#fff' },
  banner: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#FF6B00', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerContent: { flex: 1 },
  bannerSmall: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  bannerBig: { fontSize: 18, fontWeight: '700', color: '#fff', marginVertical: 4 },
  discountBadge: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  discountText: { color: '#FF6B00', fontWeight: '700', fontSize: 13 },
  bannerEmoji: { fontSize: 56 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  viewAll: { fontSize: 13, color: '#FF6B00', fontWeight: '600' },
  horizontalList: { gap: 12, paddingRight: 4 },
  hCard: { width: 120, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  hCardImage: { height: 90, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center' },
  hCardEmoji: { fontSize: 36 },
  hCardName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', paddingHorizontal: 10, paddingTop: 8 },
  hCardPrice: { fontSize: 11, color: '#888', paddingHorizontal: 10, paddingBottom: 10, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardImageContainer: { height: 130, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 52 },
  freeBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF6B00', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  freeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardContent: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardRating: { fontSize: 12, color: '#666' },
  cardDot: { color: '#ddd' },
  cardDelivery: { fontSize: 12, color: '#666' },
  cardFee: { fontSize: 12, color: '#666' },
});