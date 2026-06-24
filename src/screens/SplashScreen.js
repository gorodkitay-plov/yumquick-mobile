import { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export default function SplashScreen({ onFinish }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF6B00" />
            <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🍔</Text>
            </View>
            <Text style={styles.title}>YumQuick</Text>
            <Text style={styles.subtitle}>Deliver Favorite Food!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
    logoCircle: { width: 120, height: 120, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    logoEmoji: { fontSize: 64 },
    title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});