import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./utils/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <SafeAreaProvider>
            <Stack>
                <Stack.Screen
                    name="(protected)"
                    options={{
                        headerShown: false,
                        animation: "none"
                    }}
                />
                <Stack.Screen
                    name="login"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="signup"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="onboard"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="register-medical"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
            </SafeAreaProvider>
        </AuthProvider>
    )
}