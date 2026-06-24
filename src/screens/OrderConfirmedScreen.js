import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function OrderConfirmedScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🎉</Text>
                </View>
                <Text style={styles.title}>¡Order Confirmed!</Text>
                <Text style={styles.subtitle}>Your order has been placed{'\n'}successfully</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>🕐 Estimated delivery time</Text>
                    <Text style={styles.infoValue}>25 - 35 minutes</Text>
                </View>

                <Text style={styles.supportText}>
                    If you have any questions reach directly to our customer support
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.trackBtn}
                    onPress={() => navigation.replace('Main', { screen: 'Orders' })}
                >
                    <Text style={styles.trackBtnText}>Track Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.replace('Main', { screen: 'Home' })}
                >
                    <Text style={styles.homeBtnText}>Return Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F0' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    icon: { fontSize: 56 },
    title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    infoText: { fontSize: 14, color: '#888', marginBottom: 8 },
    infoValue: { fontSize: 20, fontWeight: '700', color: '#FF6B00' },
    supportText: { fontSize: 13, color: '#aaa', textAlign: 'center', lineHeight: 20 },
    footer: { padding: 16, gap: 12 },
    trackBtn: { backgroundColor: '#FF6B00', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    homeBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0E8DF' },
    homeBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600' },
});