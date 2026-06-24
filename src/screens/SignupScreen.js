import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isLoading } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password) { Alert.alert('Ошибка', 'Заполните все поля'); return; }
    if (password !== confirmPassword) { Alert.alert('Ошибка', 'Пароли не совпадают'); return; }
    if (password.length < 8) { Alert.alert('Ошибка', 'Пароль минимум 8 символов'); return; }
    const result = await signup(name, email, password);
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
            <Text style={styles.logoSubtitle}>Create your account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardSubtitle}>Fill in your details below</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput style={styles.input} placeholder="John Smith" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput style={styles.input} placeholder="example@email.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone (optional)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput style={styles.input} placeholder="+82 10-0000-0000" placeholderTextColor="#aaa" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={styles.input} placeholder="Min. 8 characters" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor="#aaa" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
              </View>
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={isLoading}>
              {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.signupBtnText}>Sign Up</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
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

  signupBtn: { backgroundColor: '#FF6B00', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#888' },
  footerLink: { fontSize: 14, color: '#FF6B00', fontWeight: '700' },
});