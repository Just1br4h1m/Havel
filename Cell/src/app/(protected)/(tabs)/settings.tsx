import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { AuthContext } from '../../utils/AuthContext';

export default function SettingsScreen() {
    const authContext = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authContext.logOut();
        } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
            setIsLoggingOut(false);
            setModalVisible(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Settings</Text>

            {/* Profile / Account Placeholder Card */}
            <View style={styles.card}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>U</Text>
                </View>
                <View>
                    <Text style={styles.userName}>User Account</Text>
                    <Text style={styles.userEmail}>user@example.com</Text>
                </View>
            </View>

            {/* General App Settings Placeholder */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.row}>
                    <Text style={styles.rowText}>Account Details</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row}>
                    <Text style={styles.rowText}>Notifications</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row}>
                    <Text style={styles.rowText}>Privacy & Security</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Trigger Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>

            {/* Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Log Out</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to log out of your account?
                        </Text>

                        {isLoggingOut ? (
                            <ActivityIndicator size="large" color="#FF3B30" style={{ marginVertical: 15 }} />
                        ) : (
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleConfirmLogout}
                                >
                                    <Text style={styles.confirmButtonText}>Log Out</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 24,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    row: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    rowText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 16,
    },
    logoutButton: {
        backgroundColor: '#FFE5E5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        color: '#1A1A1A',
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#FF3B30',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

