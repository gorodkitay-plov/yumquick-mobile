import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, StatusBar } from 'react-native';
import { useAuthStore } from '../store/authStore';

const MENU_ITEMS = [
  { id: 'orders', icon: '📋', label: 'My Orders' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'address', icon: '📍', label: 'Delivery Address' },
  { id: 'payment', icon: '💳', label: 'Payment Methods' },
  { id: 'contact', icon: '💬', label: 'Contact Us' },
  { id: 'help', icon: '❓', label: 'Help & FAQs' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleMenuItem = (id) => {
    if (id === 'profile') {
      navigation.navigate('EditProfile');
      return;
    }
    if (id === 'orders') {
      navigation.navigate('Main', { screen: 'Orders' });
      return;
    }
    if (id === 'address') {
      navigation.navigate('Addresses');
      return;
    }
    Alert.alert('Coming Soon', 'This feature is in development');
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
                    onPress={() => handleMenuItem(item.id)}
                >
                  <View style={styles.menuIconContainer}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },

  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },

  userCard: {
    marginHorizontal: 16, marginTop: 8, backgroundColor: '#fff',
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 26, color: '#fff', fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  userEmail: { fontSize: 13, color: '#888', marginTop: 2 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { fontSize: 16 },

  menuCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuIconContainer: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  menuArrow: { fontSize: 22, color: '#ccc' },

  logoutBtn: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff',
    borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FF6B00',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  logoutIcon: { fontSize: 18, marginRight: 12 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#FF6B00' },
});