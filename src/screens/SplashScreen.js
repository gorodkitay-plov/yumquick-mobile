import { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';

export default function SplashScreen({ onFinish }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF6B00" />
            <Image
                source={require('../../assets/boss.jpeg')}
                style={styles.bossPhoto}
                resizeMode="cover"
            />
            <Text style={styles.title}>YumQuick</Text>
            <Text style={styles.subtitle}>Delivering for you 😄</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
    bossPhoto: { width: 160, height: 160, borderRadius: 80, marginBottom: 24, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
    title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});