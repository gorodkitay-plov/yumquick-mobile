import { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    StyleSheet, SafeAreaView, StatusBar, Alert,
    KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { reviewApi } from '../api';

export default function WriteReviewScreen({ route, navigation }) {
    const { orderId, restaurantName } = route.params;
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [courierRating, setCourierRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (restaurantRating === 0) {
            Alert.alert('Ошибка', 'Поставьте оценку ресторану');
            return;
        }
        setIsSubmitting(true);
        try {
            await reviewApi.create({
                orderId,
                restaurantRating,
                courierRating: courierRating || null,
                comment: comment.trim() || null,
            });
            Alert.alert('✅ Спасибо!', 'Ваш отзыв сохранён', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Ошибка', e.response?.data?.message ?? 'Не удалось отправить отзыв');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ value, onChange }) => (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => onChange(star)}>
                    <Text style={[styles.star, star <= value && styles.starFilled]}>
                        {star <= value ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Write a Review</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    <View style={styles.restaurantCard}>
                        <Text style={styles.restaurantEmoji}>🍽️</Text>
                        <Text style={styles.restaurantName}>{restaurantName}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Как вам ресторан?</Text>
                        <StarRating value={restaurantRating} onChange={setRestaurantRating} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Как вам курьер? (опционально)</Text>
                        <StarRating value={courierRating} onChange={setCourierRating} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Комментарий (опционально)</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Поделитесь впечатлениями..."
                            placeholderTextColor="#aaa"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F0' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    backIcon: { fontSize: 28, color: '#1A1A1A', marginTop: -2 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },

    scroll: { padding: 20, gap: 20 },

    restaurantCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    restaurantEmoji: { fontSize: 40 },
    restaurantName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

    section: { gap: 10 },
    sectionLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

    starsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
    star: { fontSize: 40, color: '#ddd' },
    starFilled: { color: '#FFB800' },

    commentInput: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 15, color: '#1A1A1A', borderWidth: 1.5, borderColor: '#F0E8DF', minHeight: 100, textAlignVertical: 'top' },

    submitBtn: { backgroundColor: '#FF6B00', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});