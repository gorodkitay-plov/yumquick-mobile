import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, SafeAreaView } from 'react-native';
import { restaurantApi } from '../api';

function RestaurantCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardImage}>
        <Text style={styles.cardEmoji}>🍽️</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardRating}>⭐ {item.rating?.toFixed(1) ?? '0.0'}</Text>
          <Text style={styles.cardDot}>·</Text>
          <Text style={styles.cardDelivery}>{item.estimatedDeliveryMinutes ?? 30} мин</Text>
          <Text style={styles.cardDot}>·</Text>
          <Text style={styles.cardFee}>{item.deliveryFee > 0 ? `₩${item.deliveryFee?.toLocaleString()}` : 'Бесплатно'}</Text>
        </View>
        <Text style={styles.cardMin}>Мин. заказ ₩{item.minOrder?.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  useEffect(() => { loadRestaurants(); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍔 YumQuick</Text>
        <Text style={styles.headerSub}>Доставка еды</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Поиск ресторанов..." value={search} onChangeText={setSearch} returnKeyType="search" />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF6B35" style={styles.loader} />
      ) : restaurants.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Рестораны не найдены</Text></View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard item={item} onPress={() => navigation.navigate('Restaurant', { id: item.id, name: item.name })} />
          )}
          contentContainerStyle={styles.list}
          onRefresh={loadRestaurants}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  headerSub: { fontSize: 14, color: '#999', marginTop: 2 },
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  searchInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, fontSize: 15 },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardImage: { height: 120, backgroundColor: '#fff3ee', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 48 },
  cardContent: { padding: 14 },
  cardName: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardRating: { fontSize: 13, color: '#666' },
  cardDot: { color: '#ccc' },
  cardDelivery: { fontSize: 13, color: '#666' },
  cardFee: { fontSize: 13, color: '#666' },
  cardMin: { fontSize: 12, color: '#999' },
});
