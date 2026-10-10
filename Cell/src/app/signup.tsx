import React, { useContext, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './utils/AuthContext';
import { Link } from "expo-router";

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const authContext = useContext(AuthContext);

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        await authContext.signUp(email, password);
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
                        {/* Header Row */}
                        <View style={styles.headerRow}>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.title}>Create account</Text>
                                <Text style={styles.subtitleText}>
                                    Have an account?{' '}
                                    <Link style={styles.loginLink} href="/login">
                                        Login
                                    </Link>
                                </Text>
                            </View>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {/* Email */}
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

                            {/* Password */}
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.inputField}
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

                            {/* Confirm Password */}
                            <Text style={styles.inputLabel}>Confirm password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9E9E9E"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Password Rules Card */}
                            <View style={styles.rulesCard}>
                                <Text style={styles.rulesTitle}>Your password must have:</Text>
                                <Text style={styles.ruleItem}>• Minimum 8 characters</Text>
                                <Text style={styles.ruleItem}>• 1 upper case letter (A-Z)</Text>
                                <Text style={styles.ruleItem}>• 1 lower case letter (a-z)</Text>
                                <Text style={styles.ruleItem}>• 1 numeric character (0-9)</Text>
                            </View>

                            {/* Continue Button */}
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleSignUp}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.continueButtonText}>Continue</Text>
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
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    headerTextContainer: {
        flex: 1,
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
    loginLink: {
        fontWeight: '700',
        color: '#000000',
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
    inputWrapper: {
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
    inputField: {
        flex: 1,
        fontSize: 14,
        color: '#0D1117',
    },
    eyeIconContainer: {
        paddingLeft: 10,
    },
    rulesCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
        marginBottom: 36,
    },
    rulesTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0D1117',
        marginBottom: 12,
    },
    ruleItem: {
        fontSize: 13,
        color: '#4A5568',
        marginBottom: 8,
        lineHeight: 18,
    },
    continueButton: {
        backgroundColor: '#0B1C49',
        borderRadius: 28,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});