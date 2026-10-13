import React, { useState } from "react";
import {
    View,
    Text,
    Alert,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMedications, MedicationFormValues, DoseStatus } from '../../hooks/useMedication';
import { useMedicationForm } from '../../hooks/useMedicationForm';
import { useDoseReminder } from '../../hooks/useDoseReminder';
import { useAdherence } from '../../hooks/useAdherence';
import { MedicationCard } from '../components/MedicationCard';
import { AddMedicationModal } from '../components/AddMedicationModel';
import { DoseCheckModal } from '../components/DoseCheckModel';
import { getCurrentTimeCategory, getTimeCategory, TimeCategory } from '../../utils/time';
import { saveStatus } from '../../storage/medicationStorage';
import { useTheme } from 'expo-router';

const CATEGORIES: TimeCategory[] = ['Morning', 'Afternoon', 'Evening'];

export default function MedicationScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { medications, fetchMedications, addMedication, editMedication, removeMedication } = useMedications();
    const adherence = useAdherence();
    const form = useMedicationForm();

    const handleStatusRecorded = () => {
        fetchMedications();
        adherence.refresh();
    };

    const doseReminder = useDoseReminder(medications, handleStatusRecorded);
    const [selectedCategory, setSelectedCategory] = useState<TimeCategory>(getCurrentTimeCategory());

    const handleSubmit = async () => {
        if (!form.name || form.times.length === 0) {
            Alert.alert('Error', 'Please enter a name and at least one dose time.');
            return;
        }

        const values: MedicationFormValues = {
            name: form.name,
            times: form.times,
            foodTiming: form.foodTiming,
            quantityType: form.quantityType,
            quantity: form.quantity,
            notes: form.notes || undefined,
        };

        if (form.isEditing && form.editingId) {
            await editMedication(form.editingId, values);
            Alert.alert('Updated', `${values.name} updated successfully.`);
        } else {
            await addMedication(values);
            Alert.alert('Scheduled!', `Reminder set for ${values.name}`);
        }

        form.reset();
    };

    const handleDelete = (medicationId: string) => {
        const medToDelete = medications.find((m) => m.id === medicationId);
        if (!medToDelete) return;

        Alert.alert('Delete Medication', `Do you really want to delete "${medToDelete.name}" schedule?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await removeMedication(medicationId);
                    Alert.alert('Deleted', `${medToDelete.name} has been deleted.`);
                },
            },
        ]);
    };

    const filteredMeds = medications.filter((med) =>
        med.times.some((t) => getTimeCategory(t.hour) === selectedCategory)
    );

    const handleToggleStatus = async (medicationId: string, hour: number, minute: number, currentStatus: DoseStatus) => {
        const nextStatus: DoseStatus =
            currentStatus === 'not yet' ? 'taken' :
                currentStatus === 'taken' ? 'not taken' : 'not yet';

        const today = new Date().toISOString().split('T')[0];
        await saveStatus({
            medicationId,
            date: today,
            hour,
            minute,
            status: nextStatus,
        });
        fetchMedications();
        adherence.refresh();
    };

    return (
        <View style={styles.background}>
            <SafeAreaView style={styles.container}>
                {/* Streak Banner */}
                {adherence.streak > 0 && (
                    <View style={styles.streakBanner}>
                        <Ionicons name="flame" size={18} color="#FF5252" style={styles.streakIcon} />
                        <Text style={styles.streakBannerText}>
                            {adherence.streak}-day streak - keep it going!
                        </Text>
                    </View>
                )}

                {/* Category Segmented Control / Tabs */}
                <View style={styles.categoryTabs}>
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                style={[
                                    styles.categoryButton,
                                    isSelected && styles.categoryButtonActive
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.categoryButtonText,
                                        isSelected && styles.categoryButtonTextActive,
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Main Medication List / Empty State */}
                {filteredMeds.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBadge}>
                            <Ionicons name="medical-outline" size={36} color="#9E9E9E" />
                        </View>
                        <Text style={styles.emptyTitle}>No medications scheduled</Text>
                        <Text style={styles.emptySubtext}>
                            You have no medications scheduled for {selectedCategory.toLowerCase()}.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredMeds}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <MedicationCard
                                medication={item}
                                onEdit={() => form.openForEdit(item)}
                                onDelete={() => handleDelete(item.id)}
                                onToggleStatus={(hour, minute, currentStatus) =>
                                    handleToggleStatus(item.id, hour, minute, currentStatus)
                                }
                            />
                        )}
                    />
                )}

                {/* Floating Add Medication Button */}
                <TouchableOpacity
                    style={[styles.addButton, { bottom: 24 + insets.bottom }]}
                    onPress={form.openForAdd}
                    activeOpacity={0.9}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Modals */}
                <AddMedicationModal
                    visible={form.visible}
                    isEditing={form.isEditing}
                    name={form.name}
                    onChangeName={form.setName}
                    times={form.times}
                    onAddTime={form.addTime}
                    onRemoveTime={form.removeTime}
                    foodTiming={form.foodTiming}
                    onChangeFoodTiming={form.setFoodTiming}
                    quantityType={form.quantityType}
                    onChangeQuantityType={form.setQuantityType}
                    quantity={form.quantity}
                    onChangeQuantity={form.setQuantity}
                    notes={form.notes}
                    onChangeNotes={form.setNotes}
                    onClose={form.close}
                    onSubmit={handleSubmit}
                />

                <DoseCheckModal
                    visible={doseReminder.visible}
                    medicationName={doseReminder.activeMedicationName}
                    activeTimeLabel={doseReminder.activeTimeLabel}
                    showSnoozeOptions={doseReminder.showSnoozeOptions}
                    onYes={() => doseReminder.recordStatus('taken')}
                    onNo={() => doseReminder.recordStatus('not taken')}
                    onOpenSnooze={doseReminder.openSnoozeOptions}
                    onSnooze={doseReminder.snooze}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    streakBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    streakIcon: {
        marginRight: 8,
    },
    streakBannerText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0D1117',
    },
    categoryTabs: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    categoryButton: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryButtonActive: {
        backgroundColor: '#0B1C49',
    },
    categoryButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6E737B',
    },
    categoryButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 60,
    },
    emptyIconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0D1117',
        marginBottom: 6,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#6E737B',
        textAlign: 'center',
        lineHeight: 18,
    },
    addButton: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0B1C49',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});