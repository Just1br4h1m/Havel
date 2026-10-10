import React, { useState } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from './utils/api';
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { BloodGroup } from './enums/BloodGroup';
import { HaemoglobinGenotype } from './enums/HaemoglobinGenotype';
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterMedicalScreen() {
    const [patientNumber, setPatientNumber] = useState('');
    const [hospitalNumber, setHospitalNumber] = useState('');
    const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.BNegative);
    const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
    const [genoType, setGenoType] = useState<HaemoglobinGenotype>(HaemoglobinGenotype.Aa);
    const [showGenotypeDropdown, setShowGenotypeDropdown] = useState(false);
    const [isWheeled, setIsWheeled] = useState<boolean | null>(null);
    const [showWheeledDropdown, setShowWheeledDropdown] = useState(false);
    const [isPregnant, setIsPregnant] = useState<boolean>(false);
    const [showPregnantDropdown, setShowPregnantDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const router = useRouter();

    const bloodGroupLabels: Record<BloodGroup, string> = {
        [BloodGroup.OPositive]: 'O+',
        [BloodGroup.ONegative]: 'O-',
        [BloodGroup.APositive]: 'A+',
        [BloodGroup.ANegative]: 'A-',
        [BloodGroup.BPositive]: 'B+',
        [BloodGroup.BNegative]: 'B-',
        [BloodGroup.AbPositive]: 'AB+',
        [BloodGroup.AbNegative]: 'AB-',
    };

    const booleanOptions = [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
    ];
    
    const bloodGroupOptions = Object.keys(BloodGroup)
        .filter((key) => isNaN(Number(key)) && key !== 'NotSet')
        .map((key) => {
            const value = BloodGroup[key as keyof typeof BloodGroup];
            return {
                label: bloodGroupLabels[value as BloodGroup] ?? key,
                value,
            };
        });

    const genotypeOptions = Object.keys(HaemoglobinGenotype)
        .filter((key) => isNaN(Number(key)) && key !== 'NotSet')
        .map((key) => ({
            label: key,
            value: HaemoglobinGenotype[key as keyof typeof HaemoglobinGenotype],
        }));
    
    const selectedBloodGroupOption = bloodGroupOptions.find(
        (option) => option.value === bloodGroup
    );

    const selectedHaemoglobinOption = genotypeOptions.find(
        (option) => option.value === genoType
    );

    const selectedWheeledOption = booleanOptions.find(
        (option) => option.value === isWheeled
    );
    
    const selectedPregnantOption = booleanOptions.find(
        (option) => option.value === isPregnant
    );
    
    const toggleBloodGroupDropdown = () => {
        setShowBloodGroupDropdown((prev) => !prev);
        setShowGenotypeDropdown(false);
    };

    const toggleGenotypeDropdown = () => {
        setShowGenotypeDropdown((prev) => !prev);
        setShowBloodGroupDropdown(false);
    };

    const toggleWheeledDropdown = () => {
        setShowWheeledDropdown((prev) => !prev);
        setShowBloodGroupDropdown(false);
        setShowGenotypeDropdown(false);
    };
    
    const togglePregnantDropdown = () => {
        setShowPregnantDropdown((prev) => !prev);
        setShowWheeledDropdown(false);
        setShowBloodGroupDropdown(false);
        setShowGenotypeDropdown(false);
    }

    const handleBloodGroupSelect = (value: BloodGroup) => {
        setBloodGroup(value);
        setShowBloodGroupDropdown(false);
    };

    const handleGenotypeSelect = (value: HaemoglobinGenotype) => {
        setGenoType(value);
        setShowGenotypeDropdown(false);
    };

    const handleWheeledSelect = (value: boolean) => {
        setIsWheeled(value);
        setShowWheeledDropdown(false);
    };
    
    const handlePregnantSelect = (value: boolean) => {
        setIsPregnant(value);
        setShowPregnantDropdown(false);
    }

    const handleRegister = async () => {
        if (!patientNumber || !hospitalNumber || !bloodGroup || !genoType) {
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

            const registerMedical = {
                patientNumber,
                hospitalNumber,
                bloodGroup,
                genoType,
                isWheeled,
                isPregnant
            };

            await api.post('/user/register-medical', registerMedical, {
                headers: {
                    'Content-Type': 'application/json',
                    'userId': `${userId}`,
                },
            });

            router.replace("/");
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
                                <Text style={styles.title}>Your medical details</Text>
                                <Text style={styles.subtitleText}>
                                    Please enter your medical information below
                                </Text>
                            </View>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {/* Patient Number */}
                            <Text style={styles.inputLabel}>Patient Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123-456-789"
                                placeholderTextColor="#9E9E9E"
                                value={patientNumber}
                                onChangeText={setPatientNumber}
                                autoCorrect={false}
                            />

                            {/* Hospital Number */}
                            <Text style={styles.inputLabel}>Hospital Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123-456-789"
                                placeholderTextColor="#9E9E9E"
                                value={hospitalNumber}
                                onChangeText={setHospitalNumber}
                                autoCorrect={false}
                            />

                            {/* Blood Group Dropdown */}
                            <Text style={styles.inputLabel}>Blood Group</Text>
                            <View style={[
                                styles.dropdownContainer,
                                { zIndex: showBloodGroupDropdown ? 2000 : 1000 }
                            ]}>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={toggleBloodGroupDropdown}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownButtonText,
                                            !selectedBloodGroupOption && styles.dropdownPlaceholder,
                                        ]}
                                    >
                                        {selectedBloodGroupOption ? selectedBloodGroupOption.label : 'Select blood group'}
                                    </Text>
                                    <Ionicons
                                        name={showBloodGroupDropdown ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>

                                {showBloodGroupDropdown && (
                                    <View style={styles.dropdownList}>
                                        {bloodGroupOptions.map((option) => (
                                            <TouchableOpacity
                                                key={String(option.value)}
                                                style={[
                                                    styles.dropdownOption,
                                                    option.value === bloodGroup && styles.selectedDropdownOption,
                                                ]}
                                                onPress={() => handleBloodGroupSelect(option.value as BloodGroup)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownOptionText,
                                                        option.value === bloodGroup && styles.selectedDropdownOptionText,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                                {option.value === bloodGroup && (
                                                    <Ionicons name="checkmark" size={18} color="#0B1C49" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Genotype Dropdown */}
                            <Text style={styles.inputLabel}>Haemoglobin Genotype</Text>
                            <View style={[
                                styles.dropdownContainer,
                                { zIndex: showGenotypeDropdown ? 2000 : 500 }
                            ]}>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={toggleGenotypeDropdown}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownButtonText,
                                            !selectedHaemoglobinOption && styles.dropdownPlaceholder,
                                        ]}
                                    >
                                        {selectedHaemoglobinOption ? selectedHaemoglobinOption.label : 'Select haemoglobin genotype'}
                                    </Text>
                                    <Ionicons
                                        name={showGenotypeDropdown ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>

                                {showGenotypeDropdown && (
                                    <View style={styles.dropdownList}>
                                        {genotypeOptions.map((option) => (
                                            <TouchableOpacity
                                                key={String(option.value)}
                                                style={[
                                                    styles.dropdownOption,
                                                    option.value === genoType && styles.selectedDropdownOption,
                                                ]}
                                                onPress={() => handleGenotypeSelect(option.value as HaemoglobinGenotype)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownOptionText,
                                                        option.value === genoType && styles.selectedDropdownOptionText,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                                {option.value === genoType && (
                                                    <Ionicons name="checkmark" size={18} color="#0B1C49" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Wheelchair Accessible Dropdown */}
                            <Text style={styles.inputLabel}>Wheelchair Required</Text>
                            <View style={[
                                styles.dropdownContainer,
                                { zIndex: showWheeledDropdown ? 2000 : 300 }
                            ]}>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={toggleWheeledDropdown}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownButtonText,
                                            selectedWheeledOption === undefined && styles.dropdownPlaceholder,
                                        ]}
                                    >
                                        {selectedWheeledOption ? selectedWheeledOption.label : 'Select option'}
                                    </Text>
                                    <Ionicons
                                        name={showWheeledDropdown ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>

                                {showWheeledDropdown && (
                                    <View style={styles.dropdownList}>
                                        {booleanOptions.map((option) => (
                                            <TouchableOpacity
                                                key={String(option.value)}
                                                style={[
                                                    styles.dropdownOption,
                                                    option.value === isWheeled && styles.selectedDropdownOption,
                                                ]}
                                                onPress={() => handleWheeledSelect(option.value)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownOptionText,
                                                        option.value === isWheeled && styles.selectedDropdownOptionText,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                                {option.value === isWheeled && (
                                                    <Ionicons name="checkmark" size={18} color="#0B1C49" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Pregnancy Dropdown */}
                            <Text style={styles.inputLabel}>Are you Pregnant</Text>
                            <View style={[
                                styles.dropdownContainer,
                                { zIndex: showPregnantDropdown ? 2000 : 300 }
                            ]}>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={togglePregnantDropdown}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownButtonText,
                                            selectedPregnantOption === undefined && styles.dropdownPlaceholder,
                                        ]}
                                    >
                                        {selectedPregnantOption ? selectedPregnantOption.label : 'Select option'}
                                    </Text>
                                    <Ionicons
                                        name={showPregnantDropdown ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6E737B"
                                    />
                                </TouchableOpacity>

                                {showPregnantDropdown && (
                                    <View style={styles.dropdownList}>
                                        {booleanOptions.map((option) => (
                                            <TouchableOpacity
                                                key={String(option.value)}
                                                style={[
                                                    styles.dropdownOption,
                                                    option.value === isPregnant && styles.selectedDropdownOption,
                                                ]}
                                                onPress={() => handlePregnantSelect(option.value)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownOptionText,
                                                        option.value === isPregnant && styles.selectedDropdownOptionText,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                                {option.value === isPregnant && (
                                                    <Ionicons name="checkmark" size={18} color="#0B1C49" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                            
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
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB',
        justify: 'center',
        alignItems: 'center',
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
        top: 56, // Fits right below the button
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
        elevation: 8,
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
    registerButton: {
        backgroundColor: '#0B1C49',
        borderRadius: 28,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});