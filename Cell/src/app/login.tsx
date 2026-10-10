import React, { useState, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './utils/AuthContext';
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const authContext = useContext(AuthContext);
    const router = useRouter();
    
    const handleLogin = async () => {
        if (email && password) {
            await authContext.logIn(email, password);
            router.push('/');
        }
    };

    return (
        <View style={styles.background}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Top Banner Box with Settings Gear */}
                        <View style={styles.bannerContainer}>
                        </View>

                        {/* Heading Section */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Login</Text>
                            <Text style={styles.subtitleText}>
                                Don’t have an account?{' '}
                                <Link style={styles.createOneLink} href="/signup">
                                    Create one
                                </Link>
                            </Text>
                        </View>

                        {/* Input Form */}
                        <View style={styles.formContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email address"
                                placeholderTextColor="#9E9E9E"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9E9E9E"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.forgotPasswordButton}>
                                <Link style={styles.forgotPasswordText} href='/register-medical'>Forgot Password?</Link>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.loginButtonText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
    },
    bannerContainer: {
        height: 220,
        backgroundColor: '#EAECEF',
        borderRadius: 24,
        marginBottom: 32,
        position: 'relative',
    },
    headerContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0D1117',
        marginBottom: 6,
    },
    subtitleText: {
        fontSize: 14,
        color: '#6E737B',
    },
    createOneLink: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '700',
    },
    formContainer: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0D1117',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#0D1117',
        marginBottom: 20,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        fontSize: 14,
        color: '#0D1117',
    },
    eyeIconContainer: {
        paddingLeft: 10,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-start',
        marginBottom: 36,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#0D1117',
    },
    loginButton: {
        backgroundColor: '#0B1C49',
        borderRadius: 28,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});