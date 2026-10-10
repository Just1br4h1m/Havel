import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {Platform} from "react-native";

const BASE_URL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:5008/api'
        : 'http://localhost:5008/api';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const token = await SecureStore.getItemAsync('authToken');
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if (!refreshToken || !token) {
                    throw new Error('Tokens missing from SecureStore');
                }

                const decoded = jwtDecode(token);
                const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    userId: userId,
                    refreshToken: refreshToken,
                });

                const newAccessToken = response.data.accessToken;

                await SecureStore.setItemAsync('authToken', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token is expired or invalid:', refreshError);

                await SecureStore.deleteItemAsync('authToken');
                await SecureStore.deleteItemAsync('refreshToken');
                
                router.replace('/login');

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;