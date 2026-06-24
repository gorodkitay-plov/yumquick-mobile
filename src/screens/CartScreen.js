import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useCartStore } from '../store/cartStore';

export default function CartScreen() {
  const { cart, isLoading, fetchCart, updateItem, clearCart } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  if (isLoading) return <ActivityIndicator size="large" color="#FF6B35" style={{ flex: 1 }} />;

  const items = cart?.items ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>🛒 Корзина</Text></View>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Корзина пуста</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.menuItemId}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.title}</Text>
                  <Text style={styles.itemPrice}>₩{item.unitPrice?.toLocaleString()}</Text>
                </View>
                <View style={styles.itemControls}>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => updateItem(item.menuItemId, item.quantity - 1)}>
                    <Text style={styles.controlText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => updateItem(item.menuItemId, item.quantity + 1)}>
                    <Text style={styles.controlText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Итого</Text>
              <Text style={styles.totalAmount}>₩{cart?.subtotal?.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert('Оформление заказа', 'Функция в разработке')}>
              <Text style={styles.checkoutText}>Оформить заказ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Очистить корзину</Text>
            </TouchableOpacity>
          </View>
        </>
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
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  list: { padding: 16, gap: 12 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#FF6B35', fontWeight: '600' },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  controlText: { fontSize: 18, color: '#1a1a1a', fontWeight: '500' },
  quantity: { fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  footer: { backgroundColor: '#fff', padding: 20, gap: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, color: '#666' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  checkoutBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  clearText: { textAlign: 'center', color: '#999', fontSize: 14 },
});
