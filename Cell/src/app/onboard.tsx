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
    Alert,
    Modal,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gender } from './enums/Gender';
import api from './utils/api';
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

export default function OnBoardScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.NotSet);
    const [telephone, setTelephone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const formatGenderLabel = (label: string): string => {
        return label.replace(/([a-z])([A-Z])/g, '$1 $2');
    };

    const genderOptions = Object.keys(Gender)
        .filter((key) => isNaN(Number(key)) && key !== 'NotSet')
        .map((key) => ({
            label: formatGenderLabel(key),
            value: Gender[key as keyof typeof Gender],
        }));

    const selectedGenderOption = genderOptions.find(
        (option) => option.value === gender
    );

    const getParsedDate = (dateStr: string): Date => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        if (!year || !month || !day) return new Date();
        return new Date(year, month - 1, day);
    };

    const formatDateToString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate && event.type !== 'dismissed') {
            const formattedString = formatDateToString(selectedDate);
            setDateOfBirth(formattedString);
        }
    };

    const handleGenderSelect = (value: Gender) => {
        setGender(value);
        setShowGenderDropdown(false);
    };

    const handleRegister = async () => {
        if (
            !firstName ||
            !lastName ||
            gender === Gender.NotSet ||
            !telephone ||
            !dateOfBirth
        ) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            setIsLoading(true);

            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                Alert.alert('Error', 'Session expired. Please log in again.');
                router.replace('/login');
                return;
            }

            const decoded: any = jwtDecode(token);
            const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

            const user = {
                firstName,
                lastName,
                gender,
                telephone,
                dateOfBirth,
            };

            await api.put('/user/update', user, {
                headers: {
                    'Content-Type': 'application/json',
                    'userId': `${userId}`,
                },
            });

            router.replace("/register-medical");

        } catch (error) {
            console.error('Something went wrong', error);
            Alert.alert('Error', 'Failed to save user details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0B1C49" />
            </View>
        );
    }

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
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header Row */}
                        <View style={styles.headerRow}>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.title}>Your details</Text>
                                <Text style={styles.subtitleText}>
                                    Please enter your personal information below
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.settingsButton} activeOpacity={0.8}>
                                <Ionicons name="settings" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {/* First Name */}
                            <Text style={styles.inputLabel}>First name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your first name"
                                placeholderTextColor="#9E9E9E"
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />

                            {/* Last Name */}
                            <Text style={styles.inputLabel}>
                                Last name (include any middle name)
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your last name"
                                placeholderTextColor="#9E9E9E"
                                value={lastName}
                                onChangeText={setLastName}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />

                            {/* Gender Dropdown */}
                            <Text style={styles.inputLabel}>Preferred gender</Text>
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowGenderDropdown((prev) => !prev)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownButtonText,
                                            gender === Gender.NotSet && styles.dropdownPlaceholder,
                                        ]}
                                    >
                                        {selectedGenderOption ? selectedGenderOption.label : 'Select gender'}
                                    </Text>
                                    <Ionicons
                                        name={showGenderDropdown ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>

                                {showGenderDropdown && (
                                    <View style={styles.dropdownList}>
                                        {genderOptions.map((option) => (
                                            <TouchableOpacity
                                                key={String(option.value)}
                                                style={[
                                                    styles.dropdownOption,
                                                    option.value === gender && styles.selectedDropdownOption,
                                                ]}
                                                onPress={() => handleGenderSelect(option.value as Gender)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownOptionText,
                                                        option.value === gender && styles.selectedDropdownOptionText,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                                {option.value === gender && (
                                                    <Ionicons name="checkmark" size={18} color="#0B1C49" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Telephone */}
                            <Text style={styles.inputLabel}>Telephone number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your telephone number"
                                placeholderTextColor="#9E9E9E"
                                value={telephone}
                                onChangeText={setTelephone}
                                keyboardType="number-pad"
                            />

                            {/* Date of Birth */}
                            <Text style={styles.inputLabel}>Date of birth</Text>
                            <TouchableOpacity
                                style={styles.datePickerInput}
                                onPress={() => setShowPicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.inputText,
                                        !dateOfBirth && styles.placeholderText,
                                    ]}
                                >
                                    {dateOfBirth || 'YYYY-MM-DD'}
                                </Text>
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color="#6E737B"
                                />
                            </TouchableOpacity>

                            {/* Register Button */}
                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={handleRegister}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.registerButtonText}>Save and continue</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* iOS DatePicker Modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={showPicker}
                    onRequestClose={() => setShowPicker(false)}
                >
                    <View style={styles.modalOverlay}>
                        <Pressable
                            style={StyleSheet.absoluteFillObject}
                            onPress={() => setShowPicker(false)}
                        />
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    onPress={() => setShowPicker(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.doneText}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.datePickerContainer}>
                                <DateTimePicker
                                    value={getParsedDate(dateOfBirth)}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    textColor="#0D1117"
                                    style={styles.datePicker}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Android DatePicker */}
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={getParsedDate(dateOfBirth)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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
    dropdownContainer: {
        position: 'relative',
        zIndex: 1000,
        elevation: 1000,
        marginBottom: 20,
    },
    dropdownButton: {
        height: 52,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdownButtonText: {
        fontSize: 14,
        color: '#0D1117',
    },
    dropdownPlaceholder: {
        color: '#9E9E9E',
    },
    dropdownList: {
        position: 'absolute',
        top: 58,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    dropdownOption: {
        minHeight: 48,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    selectedDropdownOption: {
        backgroundColor: '#F8F9FA',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#0D1117',
    },
    selectedDropdownOptionText: {
        fontWeight: '700',
        color: '#0B1C49',
    },
    datePickerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    inputText: {
        fontSize: 14,
        color: '#0D1117',
    },
    placeholderText: {
        color: '#9E9E9E',
    },
    registerButton: {
        backgroundColor: '#0B1C49',
        borderRadius: 28,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
    },
    modalHeader: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 16,
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    doneText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E88E5',
    },
    datePickerContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 4,
    },
    datePicker: {
        width: 350,
        height: 216,
        alignSelf: 'center',
    },
});