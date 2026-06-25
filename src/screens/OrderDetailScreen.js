import { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert
} from 'react-native';
import { orderApi } from '../api';

const STATUS_MAP = {
    PENDING: { label: 'Ожидает', color: '#FF9500' },
    CONFIRMED: { label: 'Подтверждён', color: '#007AFF' },
    PREPARING: { label: 'Готовится', color: '#FF6B00' },
    READY_FOR_PICKUP: { label: 'Готов', color: '#34C759' },
    ON_THE_WAY: { label: 'В пути', color: '#007AFF' },
    DELIVERED: { label: 'Доставлен', color: '#34C759' },
    CANCELLED: { label: 'Отменён', color: '#FF3B30' },
};

const CANCEL_ALLOWED = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'];

export default function OrderDetailScreen({ route, navigation }) {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const status = STATUS_MAP[order.status] ?? { label: order.status, color: '#999' };
    const canCancel = CANCEL_ALLOWED.includes(order.status);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            {/* Header */}
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

                {/* Cancel button */}
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
    restaurantName: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 14, fontWeight: '700' },
    orderDate: { fontSize: 13, color: '#888' },
    orderId: { fontSize: 12, color: '#bbb' },

    section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    sectionValue: { fontSize: 14, color: '#444' },
    sectionNote: { fontSize: 13, color: '#888', fontStyle: 'italic' },

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