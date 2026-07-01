import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from './src/store/authStore';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import OrderConfirmedScreen from './src/screens/OrderConfirmedScreen';
import SplashScreen from './src/screens/SplashScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import WriteReviewScreen from './src/screens/WriteReviewScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import MyReviewsScreen from './src/screens/MyReviewsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#FF6B00', tabBarInactiveTintColor: '#999', headerShown: false, tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0E8DF', height: 60, paddingBottom: 8 } }}>
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Корзина', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text> }} />
            <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Заказы', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text> }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [showSplash, setShowSplash] = useState(false);

    usePushNotifications();
    useEffect(() => { checkAuth(); }, []);

    useEffect(() => {
        if (isAuthenticated) setShowSplash(true);
    }, [isAuthenticated]);

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
                        <Stack.Screen name="Checkout" component={CheckoutScreen} />
                        <Stack.Screen name="Payment" component={PaymentScreen} />
                        <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
                        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="Addresses" component={AddressesScreen} />
                        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
                        <Stack.Screen name="Favourites" component={FavoritesScreen} />
                        <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}