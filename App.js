import 'react-native-gesture-handler';
import { useEffect } from 'react';
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#FF6B35', tabBarInactiveTintColor: '#999', headerShown: false }}>
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Корзина', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text> }} />
            <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Заказы', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text> }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => { checkAuth(); }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
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