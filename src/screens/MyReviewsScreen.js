import { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native';
import { reviewApi } from '../api';

export default function MyReviewsScreen({ navigation }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        reviewApi.getMy()
            .then(res => setReviews(res.data.data?.content ?? res.data.data ?? []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const StarRow = ({ rating }) => (
        <Text style={styles.stars}>
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </Text>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Reviews</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
            ) : reviews.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyEmoji}>⭐</Text>
                    <Text style={styles.emptyTitle}>No reviews yet</Text>
                    <Text style={styles.emptySubtitle}>Your reviews will appear here after you rate your orders</Text>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIcon}>
                                    <Text style={styles.cardIconText}>🍽️</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <StarRow rating={item.restaurantRating} />
                                    <Text style={styles.cardDate}>
                                        {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                            {item.comment && (
                                <Text style={styles.comment}>{item.comment}</Text>
                            )}
                            {item.courierRating && (
                                <View style={styles.courierRow}>
                                    <Text style={styles.courierLabel}>🛵 Курьер:</Text>
                                    <Text style={styles.courierStars}>{'★'.repeat(item.courierRating)}</Text>
                                </View>
                            )}
                        </View>
                    )}
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
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center' },
    cardIconText: { fontSize: 24 },
    stars: { fontSize: 20, color: '#FFB800', marginBottom: 4 },
    cardDate: { fontSize: 12, color: '#888' },
    comment: { fontSize: 14, color: '#444', lineHeight: 20 },
    courierRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    courierLabel: { fontSize: 13, color: '#888' },
    courierStars: { fontSize: 14, color: '#FFB800' },
});