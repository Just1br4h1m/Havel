import { Stack, Tabs } from "expo-router";
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TabsLayout() {
    return(
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#0B1C49',
                tabBarInactiveTintColor: 'gray',
                tabBarActiveBackgroundColor: "transparent",
                headerShadowVisible: false,
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}