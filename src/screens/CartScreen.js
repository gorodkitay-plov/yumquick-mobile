import { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { useCartStore } from '../store/cartStore';

export default function CartScreen({ navigation }) {
  const { cart, isLoading, fetchCart, updateItem, clearCart } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  const handleCheckout = () => {
    Alert.alert('Оформление заказа', 'Функция в разработке');
  };

  if (isLoading) return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
      </SafeAreaView>
  );

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 Cart</Text>
          {items.length > 0 && (
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>Want to add something?</Text>
              <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.browseBtnText}>Browse Restaurants</Text>
              </TouchableOpacity>
            </View>
        ) : (
            <>
              {cart?.restaurantName && (
                  <View style={styles.restaurantBanner}>
                    <Text style={styles.restaurantIcon}>🏪</Text>
                    <Text style={styles.restaurantName}>{cart.restaurantName}</Text>
                  </View>
              )}

              <FlatList
                  data={items}
                  keyExtractor={(item) => item.menuItemId}
                  contentContainerStyle={styles.list}
                  renderItem={({ item }) => (
                      <View style={styles.item}>
                        <View style={styles.itemImageContainer}>
                          <Text style={styles.itemEmoji}>🍽️</Text>
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.title}</Text>
                          <Text style={styles.itemPrice}>₩{Number(item.unitPrice).toLocaleString()}</Text>
                        </View>
                        <View style={styles.itemControls}>
                          <TouchableOpacity style={styles.controlBtn} onPress={() => updateItem(item.menuItemId, item.quantity - 1)}>
                            <Text style={styles.controlText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantity}>{item.quantity}</Text>
                          <TouchableOpacity style={[styles.controlBtn, styles.controlBtnActive]} onPress={() => updateItem(item.menuItemId, item.quantity + 1)}>
                            <Text style={[styles.controlText, styles.controlTextActive]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                  )}
                  ListFooterComponent={
                    <View style={styles.summary}>
                      <Text style={styles.summaryTitle}>Order Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₩{Number(subtotal).toLocaleString()}</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₩{Number(subtotal).toLocaleString()}</Text>
                      </View>
                    </View>
                  }
              />

              <View style={styles.footer}>
                <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                  <Text style={styles.checkoutText}>Place Order</Text>
                  <Text style={styles.checkoutPrice}>₩{Number(subtotal).toLocaleString()}</Text>
                </TouchableOpacity>
              </View>
            </>
        )}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  clearText: { fontSize: 14, color: '#FF6B00', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: '#888' },
  browseBtn: { marginTop: 16, backgroundColor: '#FF6B00', borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  restaurantBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, padding: 12, gap: 10 },
  restaurantIcon: { fontSize: 20 },
  restaurantName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  list: { paddingHorizontal: 16, paddingBottom: 8 },
  item: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  itemImageContainer: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemEmoji: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#FF6B00' },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  controlBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  controlBtnActive: { backgroundColor: '#FF6B00' },
  controlText: { fontSize: 18, color: '#1A1A1A', fontWeight: '600' },
  controlTextActive: { color: '#fff' },
  quantity: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center', color: '#1A1A1A' },
  summary: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginTop: 8, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#FF6B00' },
  footer: { padding: 16, backgroundColor: '#FFF8F0' },
  checkoutBtn: { backgroundColor: '#FF6B00', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  checkoutPrice: { color: '#fff', fontSize: 16, fontWeight: '700' },
});