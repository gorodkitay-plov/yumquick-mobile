import { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, ActivityIndicator, Alert, StatusBar,
    TextInput, Modal
} from 'react-native';
import { userApi } from '../api';
import AddressPickerMap from '../components/AddressPickerMap';

const BASE_URL = 'http://172.30.1.71:8080';
const DEFAULT_POS = { lat: 37.4979, lng: 127.0276 };

export default function AddressesScreen({ navigation }) {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ label: 'HOME', detailAddress: '', lat: DEFAULT_POS.lat, lng: DEFAULT_POS.lng });
    const [mapInitialPos, setMapInitialPos] = useState(DEFAULT_POS);

    const loadAddresses = () => {
        setIsLoading(true);
        userApi.getAddresses()
            .then(res => setAddresses(res.data.data ?? []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { loadAddresses(); }, []);

    const openAddModal = () => {
        setEditingId(null);
        setForm({ label: 'HOME', detailAddress: '', lat: DEFAULT_POS.lat, lng: DEFAULT_POS.lng });
        setMapInitialPos(DEFAULT_POS);
        setShowModal(true);
    };

    const openEditModal = (addr) => {
        setEditingId(addr.id);
        setForm({ label: addr.label, detailAddress: addr.detailAddress, lat: addr.lat, lng: addr.lng });
        setMapInitialPos({ lat: addr.lat ?? DEFAULT_POS.lat, lng: addr.lng ?? DEFAULT_POS.lng });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.detailAddress) {
            Alert.alert('Ошибка', 'Введите адрес');
            return;
        }
        try {
            if (editingId) {
                await userApi.updateAddress(editingId, {
                    label: form.label,
                    detailAddress: form.detailAddress,
                    lat: form.lat,
                    lng: form.lng,
                });
            } else {
                await userApi.addAddress({
                    label: form.label,
                    detailAddress: form.detailAddress,
                    lat: form.lat,
                    lng: form.lng,
                    setAsDefault: addresses.length === 0,
                });
            }
            setShowModal(false);
            loadAddresses();
        } catch {
            Alert.alert('Ошибка', 'Не удалось сохранить адрес');
        }
    };

    const handleDelete = (addr) => {
        Alert.alert(
            'Удалить адрес?',
            `${addr.label} — ${addr.detailAddress}`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userApi.deleteAddress(addr.id);
                            loadAddresses();
                        } catch {
                            Alert.alert('Ошибка', 'Не удалось удалить адрес');
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (addr) => {
        try {
            await userApi.setDefaultAddress(addr.id);
            loadAddresses();
        } catch {
            Alert.alert('Ошибка', 'Не удалось установить адрес по умолчанию');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Addresses</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#FF6B00" style={{ flex: 1 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    {addresses.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>📍</Text>
                            <Text style={styles.emptyText}>Адресов пока нет</Text>
                        </View>
                    ) : (
                        addresses.map(addr => (
                            <View key={addr.id} style={styles.addressCard}>
                                <View style={styles.addressIcon}>
                                    <Text style={styles.addressIconText}>
                                        {addr.label === 'HOME' ? '🏠' : addr.label === 'WORK' ? '💼' : '📍'}
                                    </Text>
                                </View>
                                <View style={styles.addressInfo}>
                                    <View style={styles.addressLabelRow}>
                                        <Text style={styles.addressLabel}>{addr.label}</Text>
                                        {addr.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>По умолчанию</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.addressDetail}>{addr.detailAddress}</Text>
                                </View>
                                <View style={styles.addressActions}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(addr)}>
                                        <Text style={styles.iconBtnText}>✏️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(addr)}>
                                        <Text style={styles.iconBtnText}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}

                    {addresses.some(a => !a.isDefault) && (
                        <Text style={styles.hint}>Нажмите на адрес чтобы сделать его адресом по умолчанию</Text>
                    )}

                    <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                        <Text style={styles.addBtnIcon}>+</Text>
                        <Text style={styles.addBtnText}>Add New Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>

                            <Text style={styles.inputLabel}>Type</Text>
                            <View style={styles.labelRow}>
                                {['HOME', 'WORK', 'CUSTOM'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.labelBtn, form.label === type && styles.labelBtnActive]}
                                        onPress={() => setForm({ ...form, label: type })}
                                    >
                                        <Text style={[styles.labelBtnText, form.label === type && styles.labelBtnTextActive]}>
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
                                value={form.detailAddress}
                                onChangeText={v => setForm({ ...form, detailAddress: v })}
                            />

                            <Text style={styles.inputLabel}>Location on map (drag to set position)</Text>
                            <View style={{ marginBottom: 20 }}>
                                <AddressPickerMap
                                    initialLat={mapInitialPos.lat}
                                    initialLng={mapInitialPos.lng}
                                    baseUrl={BASE_URL}
                                    onLocationChange={(lat, lng, address) => setForm(prev => ({
                                        ...prev,
                                        lat,
                                        lng,
                                        detailAddress: address || prev.detailAddress,
                                    }))}
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
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

    scroll: { padding: 16, gap: 10 },

    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
    emptyEmoji: { fontSize: 48 },
    emptyText: { fontSize: 15, color: '#999' },

    addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#F0E8DF' },
    addressIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    addressIconText: { fontSize: 20 },
    addressInfo: { flex: 1 },
    addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    addressLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    defaultBadge: { backgroundColor: '#FFF0E6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    defaultBadgeText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
    addressDetail: { fontSize: 12, color: '#888' },
    addressActions: { flexDirection: 'row', gap: 8 },
    iconBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
    iconBtnText: { fontSize: 14 },

    hint: { fontSize: 12, color: '#bbb', textAlign: 'center', marginBottom: 12 },

    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#FF6B00', borderStyle: 'dashed' },
    addBtnIcon: { fontSize: 20, color: '#FF6B00', marginRight: 12 },
    addBtnText: { fontSize: 15, color: '#FF6B00', fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
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