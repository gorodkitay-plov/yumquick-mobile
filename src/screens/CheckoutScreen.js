import { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, ActivityIndicator, Alert, StatusBar,
    TextInput, Modal
} from 'react-native';
import { useCartStore } from '../store/cartStore';
import { orderApi, userApi } from '../api';

export default function CheckoutScreen({ navigation }) {
    const { cart, clearCart } = useCartStore();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: 'HOME', detailAddress: '', lat: 37.4979, lng: 127.0276 });

    const subtotal = cart?.subtotal ?? 0;

    const loadAddresses = () => {
        userApi.getAddresses()
            .then(res => {
                const list = res.data.data ?? [];
                setAddresses(list);
                const def = list.find(a => a.isDefault) ?? list[0];
                if (def) setSelectedAddress(def);
            })
            .catch(() => {});
    };

    useEffect(() => { loadAddresses(); }, []);

    const handleAddAddress = async () => {
        if (!newAddress.detailAddress) {
            Alert.alert('Ошибка', 'Введите адрес');
            return;
        }
        try {
            await userApi.addAddress({
                label: newAddress.label,
                detailAddress: newAddress.detailAddress,
                lat: newAddress.lat,
                lng: newAddress.lng,
                setAsDefault: addresses.length === 0,
            });
            setShowAddModal(false);
            setNewAddress({ label: 'HOME', detailAddress: '', lat: 37.4979, lng: 127.0276 });
            loadAddresses();
        } catch {
            Alert.alert('Ошибка', 'Не удалось добавить адрес');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Ошибка', 'Выберите адрес доставки');
            return;
        }
        setIsLoading(true);
        try {
            const res = await orderApi.checkout({
                addressId: selectedAddress.id,
                notes: note,
            });
            const orderData = res.data.data;
            await clearCart();
            navigation.replace('Payment', {
                orderId: orderData.id,
                amount: orderData.total,
                orderName: 'YumQuick Order',
            });
        } catch (e) {
            Alert.alert('Ошибка', e.response?.data?.message ?? 'Не удалось оформить заказ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm Order</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Shipping Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>

                    {addresses.map(addr => (
                        <TouchableOpacity
                            key={addr.id}
                            style={[styles.addressCard, selectedAddress?.id === addr.id && styles.addressCardSelected]}
                            onPress={() => setSelectedAddress(addr)}
                        >
                            <View style={styles.addressIcon}>
                                <Text style={styles.addressIconText}>
                                    {addr.label === 'HOME' ? '🏠' : addr.label === 'WORK' ? '💼' : '📍'}
                                </Text>
                            </View>
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressLabel}>{addr.label}</Text>
                                <Text style={styles.addressDetail}>{addr.detailAddress}</Text>
                            </View>
                            <View style={[styles.radioOuter, selectedAddress?.id === addr.id && styles.radioOuterSelected]}>
                                {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.addAddressBtn} onPress={() => setShowAddModal(true)}>
                        <Text style={styles.addAddressIcon}>+</Text>
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        {cart?.items?.map(item => (
                            <View key={item.menuItemId} style={styles.summaryItem}>
                                <Text style={styles.summaryItemName}>{item.title}</Text>
                                <Text style={styles.summaryItemQty}>x{item.quantity}</Text>
                                <Text style={styles.summaryItemPrice}>₩{Number(item.totalPrice).toLocaleString()}</Text>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₩{Number(subtotal).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Note */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Note (optional)</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="Add delivery notes..."
                        placeholderTextColor="#aaa"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.orderBtn} onPress={handlePlaceOrder} disabled={isLoading}>
                    {isLoading
                        ? <ActivityIndicator color="#fff" />
                        : <>
                            <Text style={styles.orderBtnText}>Place Order</Text>
                            <Text style={styles.orderBtnPrice}>₩{Number(subtotal).toLocaleString()}</Text>
                        </>
                    }
                </TouchableOpacity>
            </View>

            {/* Add Address Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add New Address</Text>

                        <Text style={styles.inputLabel}>Type</Text>
                        <View style={styles.labelRow}>
                            {['HOME', 'WORK', 'CUSTOM'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.labelBtn, newAddress.label === type && styles.labelBtnActive]}
                                    onPress={() => setNewAddress({ ...newAddress, label: type })}
                                >
                                    <Text style={[styles.labelBtnText, newAddress.label === type && styles.labelBtnTextActive]}>
                                        {type === 'HOME' ? '🏠 Home' : type === 'WORK' ? '💼 Work' : '📍 Custom'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter full address..."
                            placeholderTextColor="#aaa"
                            value={newAddress.detailAddress}
                            onChangeText={v => setNewAddress({ ...newAddress, detailAddress: v })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress}>
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F0' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    backIcon: { fontSize: 28, color: '#1A1A1A', marginTop: -2 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
    section: { paddingHorizontal: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#F0E8DF' },
    addressCardSelected: { borderColor: '#FF6B00', backgroundColor: '#FFF8F0' },
    addressIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    addressIconText: { fontSize: 20 },
    addressInfo: { flex: 1 },
    addressLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    addressDetail: { fontSize: 12, color: '#888' },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
    radioOuterSelected: { borderColor: '#FF6B00' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B00' },
    addAddressBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#FF6B00', borderStyle: 'dashed' },
    addAddressIcon: { fontSize: 20, color: '#FF6B00', marginRight: 12 },
    addAddressText: { fontSize: 15, color: '#FF6B00', fontWeight: '600' },
    summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
    summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    summaryItemName: { flex: 1, fontSize: 14, color: '#1A1A1A' },
    summaryItemQty: { fontSize: 13, color: '#888', marginRight: 12 },
    summaryItemPrice: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    totalValue: { fontSize: 16, fontWeight: '700', color: '#FF6B00' },
    noteInput: { backgroundColor: '#fff', borderRadius: 16, padding: 14, fontSize: 14, color: '#1A1A1A', borderWidth: 1.5, borderColor: '#F0E8DF', minHeight: 80, textAlignVertical: 'top' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF8F0' },
    orderBtn: { backgroundColor: '#FF6B00', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    orderBtnPrice: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
    labelRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    labelBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' },
    labelBtnActive: { backgroundColor: '#FF6B00' },
    labelBtnText: { fontSize: 13, fontWeight: '600', color: '#888' },
    labelBtnTextActive: { color: '#fff' },
    modalInput: { backgroundColor: '#FFF8F0', borderRadius: 14, padding: 14, fontSize: 15, color: '#1A1A1A', borderWidth: 1.5, borderColor: '#F0E8DF', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#888' },
    saveBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#FF6B00', alignItems: 'center' },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});