import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert
} from 'react-native';
import { orderApi } from '../api';

const TABS = ['Active', 'Completed', 'Cancelled'];

const STATUS_MAP = {
  PENDING: { tab: 'Active', label: 'Ожидает', color: '#FF9500' },
  CONFIRMED: { tab: 'Active', label: 'Подтверждён', color: '#007AFF' },
  PREPARING: { tab: 'Active', label: 'Готовится', color: '#FF6B00' },
  READY_FOR_PICKUP: { tab: 'Active', label: 'Готов', color: '#34C759' },
  ON_THE_WAY: { tab: 'Active', label: 'В пути', color: '#007AFF' },
  DELIVERED: { tab: 'Completed', label: 'Доставлен', color: '#34C759' },
  CANCELLED: { tab: 'Cancelled', label: 'Отменён', color: '#FF3B30' },
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active');

  useEffect(() => {
    orderApi.getAll()
        .then(res => setOrders(res.data.data?.content ?? res.data.data ?? []))
        .catch(() => {})
        .finally(() => setIsLoading(false));
  }, []);

  const cancelOrder = async (orderId) => {
    Alert.alert(
        'Отменить заказ?',
        'Вы уверены что хотите отменить заказ?',
        [
          { text: 'Нет', style: 'cancel' },
          {
            text: 'Да, отменить',
            style: 'destructive',
            onPress: async () => {
              try {
                await orderApi.cancel(orderId);
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: 'CANCELLED' } : o
                ));
              } catch {
                Alert.alert('Ошибка', 'Не удалось отменить заказ');
              }
            },
          },
        ]
    );
  };

  const filteredOrders = orders.filter(o => {
    const map = STATUS_MAP[o.status];
    return map?.tab === activeTab;
  });

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>

        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
              <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
            <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
        ) : filteredOrders.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>You don't have any</Text>
              <Text style={styles.emptyTitle}>{activeTab.toLowerCase()} orders</Text>
              <Text style={styles.emptySubtitle}>at this time</Text>
            </View>
        ) : (
            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                  const status = STATUS_MAP[item.status] ?? { label: item.status, color: '#999' };
                  return (
                      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
                        <View style={styles.cardImageContainer}>
                          <Text style={styles.cardEmoji}>🍽️</Text>
                        </View>
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{item.restaurantName ?? 'Ресторан'}</Text>
                          <Text style={styles.cardDate}>
                            {new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.cardItems}>
                            {item.items?.length ?? 0} items · ₩{Number(item.total ?? 0).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.cardActions}>
                          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                          </View>
                          {activeTab === 'Completed' && (
                              <TouchableOpacity style={styles.reviewBtn}>
                                <Text style={styles.reviewBtnText}>Leave a review</Text>
                              </TouchableOpacity>
                          )}
                          {activeTab === 'Active' && (
                              <TouchableOpacity style={styles.trackBtn}>
                                <Text style={styles.trackBtnText}>Track Order</Text>
                              </TouchableOpacity>
                          )}
                          {activeTab === 'Active' && !['ON_THE_WAY', 'DELIVERED'].includes(item.status) && (
                              <TouchableOpacity
                                  style={styles.cancelBtn}
                                  onPress={() => cancelOrder(item.id)}
                              >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                              </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                  );
                }}
            />
        )}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },

  tabsContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, padding: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FF6B00' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#fff' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 14, color: '#888', marginTop: 4 },

  list: { paddingHorizontal: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardImageContainer: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardEmoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#888', marginBottom: 4 },
  cardItems: { fontSize: 12, color: '#888' },
  cardActions: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  reviewBtn: { backgroundColor: '#FFF0E6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  reviewBtnText: { fontSize: 11, color: '#FF6B00', fontWeight: '600' },
  trackBtn: { backgroundColor: '#FF6B00', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  trackBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  cancelBtn: { backgroundColor: '#FFE5E5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  cancelBtnText: { fontSize: 11, color: '#FF3B30', fontWeight: '600' },
});