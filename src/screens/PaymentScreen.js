import { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';
import { api } from '../api';

const TOSS_CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
const BASE_URL = 'http://172.30.1.27:8080';

export default function PaymentScreen({ route, navigation }) {
    const { orderId, amount, orderName } = route.params;
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [idempotencyKey, setIdempotencyKey] = useState(null);

    useEffect(() => {
        initPayment();
    }, []);

    const initPayment = async () => {
        try {
            const res = await api.post('/payments/init', {
                orderId,
                provider: 'TOSS',
            });
            const { idempotencyKey: key, amount: amt } = res.data.data;
            setIdempotencyKey(key);

            const successUrl = `${BASE_URL}/payment/success`;
            const failUrl = `${BASE_URL}/payment/fail`;

            const url = `${BASE_URL}/payment.html?` +
                `clientKey=${TOSS_CLIENT_KEY}` +
                `&orderId=${key}` +
                `&amount=${amt}` +
                `&orderName=${encodeURIComponent(orderName)}` +
                `&successUrl=${encodeURIComponent(successUrl)}` +
                `&failUrl=${encodeURIComponent(failUrl)}`;

            setPaymentUrl(url);
        } catch (e) {
            Alert.alert('Ошибка', 'Не удалось инициализировать оплату');
            navigation.goBack();
        }
    };

    const handleNavigationChange = async (navState) => {
        const { url } = navState;
        if (!url) return;

        if (url.includes('/payment/success')) {
            const queryString = url.split('?')[1];
            if (!queryString) return;
            const params = Object.fromEntries(
                queryString.split('&').map(p => {
                    const [k, v] = p.split('=');
                    return [k, decodeURIComponent(v || '')];
                })
            );
            const paymentKey = params.paymentKey;

            if (paymentKey && idempotencyKey) {
                try {
                    await api.post('/payments/confirm', {
                        providerTxId: paymentKey,  // было paymentKey: paymentKey
                        idempotencyKey,
                        amount,
                    });
                    navigation.replace('OrderConfirmed');
                } catch {
                    Alert.alert('Ошибка', 'Не удалось подтвердить оплату');
                    navigation.goBack();
                }
            }
        }

        if (url.includes('/payment/fail')) {
            Alert.alert('Оплата отменена', 'Попробуйте снова');
            navigation.goBack();
        }
    };

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ERROR') {
                Alert.alert('Ошибка оплаты', data.message);
            }
        } catch {}
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            {!paymentUrl ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#FF6B00" />
                    <Text style={styles.loadingText}>Preparing payment...</Text>
                </View>
            ) : (
                <WebView
                    source={{ uri: paymentUrl }}
                    onNavigationStateChange={handleNavigationChange}
                    onMessage={handleMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    renderLoading={() => (
                        <ActivityIndicator size="large" color="#FF6B00" style={styles.webviewLoader} />
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
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    loadingText: { fontSize: 15, color: '#888' },
    webviewLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});