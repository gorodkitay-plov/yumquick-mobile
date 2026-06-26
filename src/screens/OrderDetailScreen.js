import { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert
} from 'react-native';
import { orderApi } from '../api';
import { useOrderTracking } from '../hooks/useOrderTracking';
import MapView from '../components/MapView';

const STATUS_MAP = {
    PENDING: { label: 'Ожидает', color: '#FF9500', emoji: '⏳' },
    CONFIRMED: { label: 'Подтверждён', color: '#007AFF', emoji: '✅' },
    PREPARING: { label: 'Готовится', color: '#FF6B00', emoji: '👨‍🍳' },
    READY_FOR_PICKUP: { label: 'Готов', color: '#34C759', emoji: '📦' },
    ON_THE_WAY: { label: 'В пути', color: '#007AFF', emoji: '🛵' },
    DELIVERED: { label: 'Доставлен', color: '#34C759', emoji: '🎉' },
    CANCELLED: { label: 'Отменён', color: '#FF3B30', emoji: '❌' },
};

const CANCEL_ALLOWED = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'];
const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ON_THE_WAY', 'DELIVERED'];

export default function OrderDetailScreen({ route, navigation }) {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { location, connected } = useOrderTracking(orderId);

    useEffect(() => {
        orderApi.getById(orderId)
            .then(res => setOrder(res.data.data))
            .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить заказ'))
            .finally(() => setIsLoading(false));
    }, [orderId]);

    const cancelOrder = () => {
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
                            setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
                        } catch {
                            Alert.alert('Ошибка', 'Не удалось отменить заказ');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (!order) return null;

    const status = STATUS_MAP[order.status] ?? { label: order.status, color: '#999', emoji: '📋' };
    const canCancel = CANCEL_ALLOWED.includes(order.status);
    const currentStepIndex = STATUS_STEPS.indexOf(order.status);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Status card */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusEmoji}>{status.emoji}</Text>
                    <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                    <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                            day: '2-digit', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                    <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                </View>

                {/* Progress + Map */}
                {order.status !== 'CANCELLED' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📍 Статус заказа</Text>
                        <View style={styles.progressContainer}>
                            {STATUS_STEPS.map((step, index) => {
                                const s = STATUS_MAP[step];
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <View key={step} style={styles.stepRow}>
                                        <View style={styles.stepLeft}>
                                            <View style={[
                                                styles.stepDot,
                                                isCompleted && { backgroundColor: s.color },
                                                isCurrent && styles.stepDotCurrent,
                                            ]}>
                                                <Text style={styles.stepDotText}>{isCompleted ? '✓' : ''}</Text>
                                            </View>
                                            {index < STATUS_STEPS.length - 1 && (
                                                <View style={[styles.stepLine, isCompleted && index < currentStepIndex && { backgroundColor: '#34C759' }]} />
                                            )}
                                        </View>
                                        <View style={styles.stepInfo}>
                                            <Text style={[styles.stepLabel, isCurrent && { color: s.color, fontWeight: '700' }]}>
                                                {s.emoji} {s.label}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Map */}
                        <MapView
                            deliveryLat={order.deliveryLat}
                            deliveryLng={order.deliveryLng}
                            courierLat={location?.lat}
                            courierLng={location?.lng}
                        />

                        {order.status === 'ON_THE_WAY' && (
                            <View style={styles.trackingHeader}>
                                <Text style={styles.trackingTitle}>🛵 Курьер в пути</Text>
                                <View style={[styles.liveDot, { backgroundColor: connected ? '#34C759' : '#FF3B30' }]} />
                            </View>
                        )}
                    </View>
                )}

                {/* Delivery address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Адрес доставки</Text>
                    <Text style={styles.sectionValue}>{order.deliveryAddress}</Text>
                    {order.notes ? <Text style={styles.sectionNote}>Заметка: {order.notes}</Text> : null}
                </View>

                {/* Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍽️ Состав заказа</Text>
                    {order.items?.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemQty}>{item.quantity}×</Text>
                            <Text style={styles.itemName}>{item.title}</Text>
                            <Text style={styles.itemPrice}>₩{Number(item.itemTotal).toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                {/* Price breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Итого</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Сумма заказа</Text>
                        <Text style={styles.priceValue}>₩{Number(order.subtotal).toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Доставка</Text>
                        <Text style={styles.priceValue}>₩{Number(order.deliveryFee).toLocaleString()}</Text>
                    </View>
                    {order.discount > 0 && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Скидка</Text>
                            <Text style={[styles.priceValue, { color: '#34C759' }]}>-₩{Number(order.discount).toLocaleString()}</Text>
                        </View>
                    )}
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Итого</Text>
                        <Text style={styles.totalValue}>₩{Number(order.total).toLocaleString()}</Text>
                    </View>
                </View>

                {canCancel && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={cancelOrder}>
                        <Text style={styles.cancelBtnText}>Отменить заказ</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F0' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    backIcon: { fontSize: 28, color: '#1A1A1A', marginTop: -2 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
    scroll: { padding: 16, gap: 16 },
    statusCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    statusEmoji: { fontSize: 48 },
    restaurantName: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 14, fontWeight: '700' },
    orderDate: { fontSize: 13, color: '#888' },
    orderId: { fontSize: 12, color: '#bbb' },
    section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    sectionValue: { fontSize: 14, color: '#444' },
    sectionNote: { fontSize: 13, color: '#888', fontStyle: 'italic' },
    progressContainer: { gap: 0 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 48 },
    stepLeft: { alignItems: 'center', width: 32 },
    stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
    stepDotCurrent: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FF6B00' },
    stepDotText: { fontSize: 10, color: '#fff', fontWeight: '700' },
    stepLine: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginVertical: 2 },
    stepInfo: { flex: 1, paddingLeft: 12, paddingTop: 2 },
    stepLabel: { fontSize: 13, color: '#888', paddingBottom: 16 },
    trackingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    trackingTitle: { fontSize: 14, fontWeight: '700', color: '#007AFF' },
    liveDot: { width: 10, height: 10, borderRadius: 5 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemQty: { fontSize: 14, fontWeight: '700', color: '#FF6B00', width: 24 },
    itemName: { flex: 1, fontSize: 14, color: '#1A1A1A' },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    priceLabel: { fontSize: 14, color: '#888' },
    priceValue: { fontSize: 14, color: '#1A1A1A' },
    totalRow: { borderTopWidth: 1, borderTopColor: '#F0E8DF', paddingTop: 10, marginTop: 4 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    totalValue: { fontSize: 16, fontWeight: '800', color: '#FF6B00' },
    cancelBtn: { backgroundColor: '#FF3B30', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 24 },
    cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});