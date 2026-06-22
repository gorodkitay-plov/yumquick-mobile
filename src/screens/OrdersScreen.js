import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { orderApi } from '../api';

const STATUS_LABELS = {
  PENDING: { label: 'Ожидает', color: '#FF9500' },
  CONFIRMED: { label: 'Подтверждён', color: '#007AFF' },
  PREPARING: { label: 'Готовится', color: '#FF6B35' },
  READY_FOR_PICKUP: { label: 'Готов', color: '#34C759' },
  ON_THE_WAY: { label: 'В пути', color: '#007AFF' },
  DELIVERED: { label: 'Доставлен', color: '#34C759' },
  CANCELLED: { label: 'Отменён', color: '#FF3B30' },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderApi.getAll()
      .then(res => setOrders(res.data.data?.content ?? res.data.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <ActivityIndicator size="large" color="#FF6B35" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>📋 Мои заказы</Text></View>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>Заказов ещё нет</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = STATUS_LABELS[item.status] ?? { label: item.status, color: '#999' };
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.restaurantName}>{item.restaurantName ?? 'Ресторан'}</Text>
                  <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.items}>{item.items?.map(i => i.titleSnapshot).join(', ')}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</Text>
                  <Text style={styles.total}>₩{item.total?.toLocaleString()}</Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 16, color: '#999' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  restaurantName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  items: { fontSize: 13, color: '#666', marginBottom: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 13, color: '#999' },
  total: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
});
