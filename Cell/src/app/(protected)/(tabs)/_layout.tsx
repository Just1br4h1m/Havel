import { Tabs } from "expo-router";
import { House, Settings, Tablets } from 'lucide-react-native';

export default function TabsLayout() {
    return (
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
                    tabBarIcon: ({ color, size }) => (
                        <House size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="medications"
                options={{
                    tabBarLabel: 'Medications',
                    tabBarIcon: ({ color, size }) => (
                        <Tablets size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Settings size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}