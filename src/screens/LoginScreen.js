import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Ошибка', 'Введите email и пароль'); return; }
    const result = await login(email, password);
    if (!result.success) Alert.alert('Ошибка', result.message);
  };

  return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍔</Text>
            </View>
            <Text style={styles.logoTitle}>YumQuick</Text>
            <Text style={styles.logoSubtitle}>Deliver Favorite Food!</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log In</Text>
            <Text style={styles.cardSubtitle}>Welcome back!</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email or Mobile Number</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
              {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.loginBtnText}>Log In</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>🇬</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  logoEmoji: { fontSize: 40 },
  logoTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  logoSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  cardTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  cardSubtitle: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 24 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8F0', borderRadius: 14, paddingHorizontal: 14, height: 52, borderWidth: 1.5, borderColor: '#F0E8DF' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, color: '#FF6B00', fontWeight: '600' },

  loginBtn: { backgroundColor: '#FF6B00', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#F0E8DF' },
  dividerText: { fontSize: 13, color: '#aaa', marginHorizontal: 12 },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF8F0', borderRadius: 14, height: 48, borderWidth: 1.5, borderColor: '#F0E8DF' },
  socialIcon: { fontSize: 20 },
  socialText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#888' },
  footerLink: { fontSize: 14, color: '#FF6B00', fontWeight: '700' },
});