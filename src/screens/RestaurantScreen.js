import { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView, StatusBar
} from 'react-native';
import { restaurantApi, cartApi } from '../api';
import { useCartStore } from '../store/cartStore';

export default function RestaurantScreen({ route, navigation }) {
    const { id, name } = route.params;
    const [menu, setMenu] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { fetchCart, cart } = useCartStore();

    const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        Promise.all([
            restaurantApi.getMenu(id),
            restaurantApi.getById(id),
        ]).then(([menuRes, restRes]) => {
            const categories = menuRes.data.data ?? [];
            setMenu(categories);
            setRestaurant(restRes.data.data);
            if (categories.length > 0) setSelectedCategory(categories[0].id);
        }).catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const handleAddToCart = async (item) => {
        try {
            await cartApi.addItem({ restaurantId: id, menuItemId: item.id, quantity: 1, options: [] });
            await fetchCart();
            Alert.alert('✅', `${item.title} добавлен в корзину`);
        } catch {
            Alert.alert('Ошибка', 'Не удалось добавить в корзину');
        }
    };

    const allItems = selectedCategory
        ? (menu.find(c => c.id === selectedCategory)?.items ?? [])
        : menu.flatMap(c => c.items ?? []);

    if (isLoading) return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
                <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                    <Text style={styles.cartIcon}>🛒</Text>
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Restaurant info */}
            {restaurant && (
                <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantImageContainer}>
                        <Text style={styles.restaurantEmoji}>🍽️</Text>
                    </View>
                    <View style={styles.restaurantMeta}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaItem}>⭐ {restaurant.rating?.toFixed(1) ?? '0.0'}</Text>
                            <Text style={styles.metaDot}>·</Text>
                            <Text style={styles.metaItem}>🕐 {restaurant.estimatedDeliveryMinutes ?? 30} мин</Text>
                            <Text style={styles.metaDot}>·</Text>
                            <Text style={styles.metaItem}>
                                {Number(restaurant.deliveryFee) > 0 ? `₩${Number(restaurant.deliveryFee).toLocaleString()}` : 'Free delivery'}
                            </Text>
                        </View>
                        <Text style={styles.minOrder}>Мин. заказ ₩{Number(restaurant.minOrder).toLocaleString()}</Text>
                    </View>
                </View>
            )}

            {/* Category tabs */}
            {menu.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60, flexShrink: 1 }} contentContainerStyle={styles.tabs}>
                    {menu.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.tab, selectedCategory === cat.id && styles.tabActive]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <Text style={[styles.tabText, selectedCategory === cat.id && styles.tabTextActive]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Menu items */}
            <FlatList
                data={allItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>🍽️</Text>
                        <Text style={styles.emptyText}>Меню пусто</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                        <View style={styles.menuItemImage}>
                            <Text style={styles.menuItemEmoji}>🍔</Text>
                        </View>
                        <View style={styles.menuItemInfo}>
                            <Text style={styles.menuItemName}>{item.title}</Text>
                            {item.description && (
                                <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                            )}
                            <Text style={styles.menuItemPrice}>₩{Number(item.price).toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => handleAddToCart(item)}
                        >
                            <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F0' },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF8F0' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    backIcon: { fontSize: 28, color: '#1A1A1A', marginTop: -2 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginHorizontal: 8 },
    cartBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
    cartIcon: { fontSize: 18 },
    cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#fff', borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FF6B00' },
    cartBadgeText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },

    restaurantInfo: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    restaurantImageContainer: { height: 120, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center' },
    restaurantEmoji: { fontSize: 52 },
    restaurantMeta: { padding: 14 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    metaItem: { fontSize: 13, color: '#666' },
    metaDot: { color: '#ddd' },
    minOrder: { fontSize: 12, color: '#999' },

    tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, alignItems: 'flex-start' },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#eee' },
    tabActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
    tabText: { fontSize: 13, fontWeight: '600', color: '#888' },
    tabTextActive: { color: '#fff' },

    list: { paddingHorizontal: 16, paddingBottom: 24 },
    menuItem: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    menuItemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    menuItemEmoji: { fontSize: 36 },
    menuItemInfo: { flex: 1 },
    menuItemName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    menuItemDesc: { fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 16 },
    menuItemPrice: { fontSize: 16, fontWeight: '700', color: '#FF6B00' },
    addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
    addBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', marginTop: -2 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyEmoji: { fontSize: 48, marginBottom: 8 },
    emptyText: { fontSize: 16, color: '#999' },
});