import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { DraftTime } from '../../hooks/useMedicationForm';
import { formatTime } from '../../utils/time';
import { useTheme } from "expo-router";

interface AddMedicationModelProps {
    visible: boolean;
    isEditing: boolean;
    name: string;
    onChangeName: (value: string) => void;
    times: DraftTime[];
    onAddTime: (time: Date) => void;
    onRemoveTime: (index: number) => void;
    foodTiming: string;
    onChangeFoodTiming: (value: string) => void;
    quantityType: string;
    onChangeQuantityType: (value: string) => void;
    quantity: number;
    onChangeQuantity: (value: number) => void;
    notes: string;
    onChangeNotes: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export function AddMedicationModal({
                                       visible,
                                       isEditing,
                                       name,
                                       onChangeName,
                                       times,
                                       onAddTime,
                                       onRemoveTime,
                                       foodTiming,
                                       onChangeFoodTiming,
                                       quantityType,
                                       onChangeQuantityType,
                                       quantity,
                                       onChangeQuantity,
                                       notes,
                                       onChangeNotes,
                                       onClose,
                                       onSubmit,
                                   }: AddMedicationModelProps) {
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempTime, setTempTime] = useState<Date>(new Date());
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const quantityOptions =
        quantityType === 'Pills'
            ? Array.from({ length: 20 }, (_, i) => i + 1)
            : [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

    const handleOpenPicker = () => {
        setTempTime(new Date());
        setShowTimePicker(true);
    };

    const handleConfirmIosTime = () => {
        onAddTime(tempTime);
        setShowTimePicker(false);
    };

    const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
            if (event.type === 'set' && selectedDate) {
                onAddTime(selectedDate);
            }
        } else {
            // iOS: Update temporary state smoothly while scrolling
            if (selectedDate) {
                setTempTime(selectedDate);
            }
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={[styles.modalOverlay, { paddingTop: insets.top, backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
                <View style={[styles.modalContentContainer, { backgroundColor: colors.surface || '#FFFFFF', paddingBottom: insets.bottom || 24 }]}>

                    {/* Drag Handle */}
                    <View style={[styles.dragHandle, { backgroundColor: colors.border || '#E2E8F0' }]} />

                    {/* Modal Header */}
                    <View style={styles.modalHeaderRow}>
                        <Text style={[styles.modalTitle, { color: colors.text || '#0D1117' }]}>
                            {isEditing ? 'Edit Medication' : 'Schedule Medication'}
                        </Text>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                            <Ionicons name="close" size={22} color={colors.text || '#0D1117'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>

                        {/* Medicine Name */}
                        <Text style={[styles.label, { color: colors.text || '#0D1117' }]}>Medicine Name</Text>
                        <TextInput
                            placeholder="e.g. Paracetamol"
                            placeholderTextColor={colors.textFaint || '#9E9E9E'}
                            value={name}
                            onChangeText={onChangeName}
                            style={[styles.input, { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0', color: '#0D1117' }]}
                        />

                        {/* Dose Times Section */}
                        <Text style={[styles.label, { color: colors.text || '#0D1117' }]}>Dose Times</Text>
                        <View style={styles.timesWrapRow}>
                            {times.map((t, index) => (
                                <View key={`${t.hour}:${t.minute}`} style={[styles.timeTag, { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0' }]}>
                                    <Text style={[styles.timeTagText, { color: '#0D1117' }]}>{formatTime(t.hour, t.minute)}</Text>
                                    <TouchableOpacity onPress={() => onRemoveTime(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                        <Ionicons name="close" size={14} color="#6E737B" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity onPress={handleOpenPicker} style={[styles.addTimeButton, { borderColor: '#0B1C49' }]}>
                                <Ionicons name="time-outline" size={18} color="#0B1C49" />
                                <Text style={[styles.addTimeButtonText, { color: '#0B1C49' }]}>Add Time</Text>
                            </TouchableOpacity>
                        </View>
                        {times.length === 0 && (
                            <Text style={[styles.helperText, { color: '#E53E3E' }]}>Add at least one dose time.</Text>
                        )}

                        {/* Time Picker Container */}
                        {showTimePicker && (
                            <View style={styles.pickerContainer}>
                                {Platform.OS === 'ios' && (
                                    <View style={styles.iosHeader}>
                                        <TouchableOpacity onPress={handleConfirmIosTime} activeOpacity={0.7}>
                                            <Text style={styles.doneText}>Confirm Time</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <DateTimePicker
                                    value={tempTime}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleTimeChange}
                                />
                            </View>
                        )}

                        {/* Food Timing Section */}
                        <Text style={[styles.label, { color: colors.text || '#0D1117' }]}>Food Timing</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.quantityTypeButton,
                                    { borderColor: '#E2E8F0', backgroundColor: '#F8F9FA' },
                                    foodTiming === 'Before Food' && styles.quantityTypeButtonActive,
                                ]}
                                onPress={() => onChangeFoodTiming('Before Food')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="restaurant-outline" size={18} color={foodTiming === 'Before Food' ? '#FFFFFF' : '#6E737B'} />
                                <Text style={[styles.quantityTypeText, foodTiming === 'Before Food' && styles.quantityTypeTextActive]}>
                                    Before Food
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.quantityTypeButton,
                                    { borderColor: '#E2E8F0', backgroundColor: '#F8F9FA' },
                                    foodTiming === 'After Food' && styles.quantityTypeButtonActive,
                                ]}
                                onPress={() => onChangeFoodTiming('After Food')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="fast-food-outline" size={18} color={foodTiming === 'After Food' ? '#FFFFFF' : '#6E737B'} />
                                <Text style={[styles.quantityTypeText, foodTiming === 'After Food' && styles.quantityTypeTextActive]}>
                                    After Food
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quantity Type Section */}
                        <Text style={[styles.label, { color: colors.text || '#0D1117' }]}>Quantity Type</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.quantityTypeButton,
                                    { borderColor: '#E2E8F0', backgroundColor: '#F8F9FA' },
                                    quantityType === 'Pills' && styles.quantityTypeButtonActive,
                                ]}
                                onPress={() => onChangeQuantityType('Pills')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="medical-outline" size={18} color={quantityType === 'Pills' ? '#FFFFFF' : '#6E737B'} />
                                <Text style={[styles.quantityTypeText, quantityType === 'Pills' && styles.quantityTypeTextActive]}>
                                    Pills
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.quantityTypeButton,
                                    { borderColor: '#E2E8F0', backgroundColor: '#F8F9FA' },
                                    quantityType === 'Syrup' && styles.quantityTypeButtonActive,
                                ]}
                                onPress={() => onChangeQuantityType('Syrup')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="water-outline" size={18} color={quantityType === 'Syrup' ? '#FFFFFF' : '#6E737B'} />
                                <Text style={[styles.quantityTypeText, quantityType === 'Syrup' && styles.quantityTypeTextActive]}>
                                    Syrup
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quantity Amount Picker */}
                        <Text style={[styles.label, { color: colors.text || '#0D1117' }]}>Select Amount</Text>
                        <FlatList
                            horizontal
                            data={quantityOptions}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => onChangeQuantity(item)}
                                    style={[
                                        styles.quantityChip,
                                        { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0' },
                                        quantity === item && styles.quantityChipActive,
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.quantityChipText, quantity === item && styles.quantityChipTextActive]}>
                                        {quantityType === 'Pills' ? `${item}` : `${item} ml`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipListContainer}
                        />

                        {/* Notes Input */}
                        <Text style={[styles.label, { color: colors.text || '#0D1117' }]}>Notes (optional)</Text>
                        <TextInput
                            placeholder="e.g. take with water, avoid grapefruit"
                            placeholderTextColor="#9E9E9E"
                            value={notes}
                            onChangeText={onChangeNotes}
                            multiline
                            style={[styles.notesInput, { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0', color: '#0D1117' }]}
                        />

                        {/* Submit CTA */}
                        <TouchableOpacity
                            onPress={onSubmit}
                            disabled={times.length === 0 || !name.trim()}
                            style={[
                                styles.modalButton,
                                (times.length === 0 || !name.trim()) && styles.modalButtonDisabled
                            ]}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.modalButtonText}>Set Reminder</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContentContainer: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
    },
    scrollBody: {
        paddingBottom: 30,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    timesWrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 6,
    },
    timeTagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderStyle: 'dashed',
        gap: 4,
    },
    addTimeButtonText: {
        fontSize: 13,
        fontWeight: '700',
    },
    helperText: {
        fontSize: 12,
        marginTop: 6,
    },
    pickerContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 12,
        overflow: 'hidden',
    },
    iosHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    doneText: {
        color: '#1E88E5',
        fontSize: 14,
        fontWeight: '700',
    },
    quantityContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    quantityTypeButton: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    quantityTypeButtonActive: {
        backgroundColor: '#0B1C49',
        borderColor: '#0B1C49',
    },
    quantityTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6E737B',
    },
    quantityTypeTextActive: {
        color: '#FFFFFF',
    },
    chipListContainer: {
        paddingVertical: 4,
        gap: 8,
    },
    quantityChip: {
        height: 44,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    quantityChipActive: {
        backgroundColor: '#0B1C49',
        borderColor: '#0B1C49',
    },
    quantityChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6E737B',
    },
    quantityChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: 12,
        height: 80,
        paddingHorizontal: 16,
        paddingTop: 12,
        fontSize: 14,
        textAlignVertical: 'top',
    },
    modalButton: {
        backgroundColor: '#0B1C49',
        borderRadius: 28,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    modalButtonDisabled: {
        opacity: 0.5,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});