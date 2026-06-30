import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { userApi } from '../api';
import { useAuthStore } from '../store/authStore';

export default function EditProfileScreen({ navigation }) {
    const { user, setUser } = useAuthStore();
    const [name, setName] = useState(user?.name ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Ошибка', 'Введите имя');
            return;
        }
        setIsSaving(true);
        try {
            const res = await userApi.updateMe({ name: name.trim(), phone: phone.trim() || null });
            setUser(res.data.data);
            Alert.alert('✅', 'Профиль обновлён', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch {
            Alert.alert('Ошибка', 'Не удалось обновить профиль');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {name?.charAt(0)?.toUpperCase() ?? '?'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Имя</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Введите имя"
                            placeholderTextColor="#bbb"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.input, styles.inputDisabled]}>
                            <Text style={styles.disabledText}>{user?.email}</Text>
                        </View>
                        <Text style={styles.hint}>Email нельзя изменить</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Телефон</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="010-1234-5678"
                            placeholderTextColor="#bbb"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveBtnText}>{isSaving ? 'Сохранение...' : 'Сохранить'}</Text>
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

    avatarSection: { alignItems: 'center', marginBottom: 8 },
    avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 36, color: '#fff', fontWeight: '700' },

    field: { gap: 8 },
    label: { fontSize: 13, fontWeight: '600', color: '#888' },
    input: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A1A', borderWidth: 1.5, borderColor: '#F0E8DF' },
    inputDisabled: { backgroundColor: '#F5F5F5', justifyContent: 'center' },
    disabledText: { fontSize: 15, color: '#999' },
    hint: { fontSize: 12, color: '#bbb' },

    saveBtn: { backgroundColor: '#FF6B00', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 12 },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});