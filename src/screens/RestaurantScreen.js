import { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { restaurantApi, cartApi } from '../api';
import { useCartStore } from '../store/cartStore';

export default function RestaurantScreen({ route, navigation }) {
    const { id, name } = route.params;
    const [menu, setMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchCart } = useCartStore();

    useEffect(() => {
        navigation.setOptions({ title: name, headerShown: true });
        restaurantApi.getMenu(id)
            .then(res => setMenu(res.data.data ?? []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const handleAddToCart = async (item) => {
        try {
            await cartApi.addItem({
                restaurantId: id,
                menuItemId: item.id,
                quantity: 1,
                options: []
            });
            await fetchCart();
            Alert.alert('✅', `${item.title} добавлен в корзину`);
        } catch (e) {
            Alert.alert('Ошибка', 'Не удалось добавить в корзину');
        }
    };

    if (isLoading) return <ActivityIndicator size="large" color="#FF6B35" style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={menu}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.section}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        {item.items?.map(menuItem => (
                            <View key={menuItem.id} style={styles.item}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{menuItem.title}</Text>
                                    <Text style={styles.itemDesc}>{menuItem.description}</Text>
                                    <Text style={styles.itemPrice}>₩{menuItem.price?.toLocaleString()}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => handleAddToCart(menuItem)}
                                >
                                    <Text style={styles.addBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Меню пусто</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    list: { padding: 16, gap: 16 },
    section: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
    categoryName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
    itemDesc: { fontSize: 13, color: '#999', marginBottom: 6 },
    itemPrice: { fontSize: 15, fontWeight: '700', color: '#FF6B35' },
    addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
    addBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', marginTop: -2 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { fontSize: 16, color: '#999' },
});