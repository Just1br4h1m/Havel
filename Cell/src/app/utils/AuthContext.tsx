import {createContext, useContext, useState, PropsWithChildren, useEffect} from "react";
import {SplashScreen, useRouter} from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage.native";
import {Platform} from "react-native";

type AuthState = {
    isLoggedIn: boolean;
    isReady: boolean;
    logIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string) => Promise<boolean>;
    logOut: () => void;
}

const BASE_URL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:5008/api'
        : 'http://localhost:5008/api';

const apiEndpoint = BASE_URL;
const authStorageKey = "auth";

export const AuthContext = createContext<AuthState>({
    isLoggedIn: false,
    isReady: false,
    logIn: async () => false,
    signUp: async () => false,
    logOut: () => {}
});

export function AuthProvider({ children }: PropsWithChildren) {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    
    const router = useRouter();
    
    const isAuthenticated = !!token;
    
    const storeAuthState = async (newState: { isLoggedIn: boolean }) => {
        try {
            const jsonValue = JSON.stringify(newState);
            await SecureStore.setItem(authStorageKey, jsonValue);
        } catch (e) {
            console.log("Error saving", e);
        }
    }
    const logIn = async (email: string, password: string): Promise<boolean> => {
        try {
            setIsReady(false);

            const response = await fetch(`${apiEndpoint}/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();

                await Promise.all([
                    SecureStore.setItem('authToken', data.accessToken),
                    SecureStore.setItem('refreshToken', data.refreshToken),
                ]);

                setToken(data.AccessToken);
                setRefreshToken(data.RefreshToken);
                setIsLoggedIn(true);
                await storeAuthState({ isLoggedIn: true });
                
                return true;
            }

            return false;
        } catch (error) {
            console.log("Error logging in", error);
            return false;
        } finally {
            setIsReady(true);
        }
    }
    
    const signUp = async (email: string, password: string): Promise<boolean> => {
        try {
            setIsReady(false);
            
            const response = await fetch(`${apiEndpoint}/auth/register`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
            });
            
            if (response.ok) {
                await logIn(email, password);
                router.replace('/onboard');
                return true;
            }
            
            return false;
        } catch (error) {
            console.log("Error creating in", error);
        } finally {
            setIsReady(true);
        }
    }

    const logOut = () => {
        setIsLoggedIn(false);
        setToken(null);
        setRefreshToken(null);
        storeAuthState({ isLoggedIn: false });
        router.replace("/login");
    }
    
    useEffect(() => {
        const getAuthFromStorage = async () => {
            try {
                const [storedAuthToken, storedRefreshToken] = await Promise.all([
                    SecureStore.getItem('authToken'),
                    SecureStore.getItem('refreshToken'),
                ]);
                
                if (storedAuthToken && storedRefreshToken)
                {
                    setToken(storedAuthToken);
                    setRefreshToken(storedRefreshToken);
                    setIsLoggedIn(true);
                }
                
            } catch (e) {
                console.log("Error getting auth from storage", e);
            }
            setIsReady(true);
        };
        getAuthFromStorage();
    }, []);
    
    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync();
        }
    }, [isReady]);
    
    return (
        <AuthContext.Provider value={{ isReady, isLoggedIn, logIn, signUp, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}