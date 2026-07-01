import { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native';
import { favoriteApi } from '../api';

export default function FavoritesScreen({ navigation }) {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFavorites = () => {
        setIsLoading(true);
        favoriteApi.getAll()
            .then(res => setFavorites(res.data.data?.content ?? res.data.data ?? []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadFavorites);
        return unsubscribe;
    }, [navigation]);

    const handleRemove = async (restaurantId) => {
        try {
            await favoriteApi.remove(restaurantId);
            setFavorites(prev => prev.filter(f => f.restaurant.id !== restaurantId));
        } catch {}
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favourites</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
            ) : favorites.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyEmoji}>❤️</Text>
                    <Text style={styles.emptyTitle}>No favourites yet</Text>
                    <Text style={styles.emptySubtitle}>Add restaurants to favourites by tapping the heart icon</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const r = item.restaurant;
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('Restaurant', { id: r.id, name: r.name })}
                            >
                                <View style={styles.cardImage}>
                                    <Text style={styles.cardEmoji}>🍽️</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardName}>{r.name}</Text>
                                    <Text style={styles.cardDesc} numberOfLines={1}>{r.description}</Text>
                                    <View style={styles.cardMeta}>
                                        <Text style={styles.metaItem}>⭐ {r.rating?.toFixed(1) ?? '0.0'}</Text>
                                        <Text style={styles.metaDot}>·</Text>
                                        <Text style={styles.metaItem}>🕐 {r.estimatedDeliveryMinutes ?? 30} мин</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(r.id)}>
                                    <Text style={styles.removeIcon}>❤️</Text>
                                </TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    backIcon: { fontSize: 28, color: '#1A1A1A', marginTop: -2 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
    emptyEmoji: { fontSize: 64, marginBottom: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },

    list: { padding: 16, gap: 12 },
    card: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    cardImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardEmoji: { fontSize: 32 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#888', marginBottom: 6 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaItem: { fontSize: 12, color: '#666' },
    metaDot: { color: '#ddd' },
    removeBtn: { padding: 8 },
    removeIcon: { fontSize: 22 },
});