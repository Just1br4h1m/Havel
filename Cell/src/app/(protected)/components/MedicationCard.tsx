import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicationWithStatus, DoseStatus } from '../../hooks/useMedicationForm';
import { formatTime } from '../../utils/time';
import { useTheme } from 'expo-router';
import { Droplet, Tablets } from "lucide-react-native";

interface MedicationCardProps {
    medication: MedicationWithStatus;
    onEdit: () => void;
    onDelete: () => void;
    onToggleStatus: (medicationId: string, hour: number, minute: number, currentStatus: DoseStatus) => void;
}

const getStatusColor = (status: DoseStatus, pendingColor: string) => {
    if (status === 'taken') return '#38A169';
    if (status === 'not taken') return '#E53E3E';
    return pendingColor;
};

const getStatusIcon = (status: DoseStatus) => {
    if (status === 'taken') return 'checkmark-circle';
    if (status === 'not taken') return 'close-circle';
    return 'ellipse-outline';
};

export function MedicationCard({ medication, onEdit, onDelete, onToggleStatus }: MedicationCardProps) {
    const { colors } = useTheme();
    const isSyrup = medication.quantityType === 'Syrup';

    return (
        <View style={[styles.card, { backgroundColor: colors.surface || '#FFFFFF' }]}>
            <View style={styles.headerRow}>
                <View style={styles.leftInfoGroup}>
                    <View style={[styles.typeIconBadge, { backgroundColor: '#F8F9FA' }]}>
                        { isSyrup ? <Droplet /> : <Tablets /> }
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={[styles.cardTitle, { color: colors.text || '#0D1117' }]} numberOfLines={1}>
                            {medication.name}
                        </Text>
                        <Text style={styles.cardDetails}>
                            {medication.quantity}
                            {isSyrup ? ' ml' : ' mg '}
                            {' • '}
                            {medication.foodTiming}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="create-outline" size={18} color="#6E737B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                    </TouchableOpacity>
                </View>
            </View>

            {medication.notes ? (
                <View style={styles.notesContainer}>
                    <Ionicons name="document-text-outline" size={14} color="#9E9E9E" style={styles.notesIcon} />
                    <Text style={styles.cardNotes} numberOfLines={2}>
                        {medication.notes}
                    </Text>
                </View>
            ) : null}

            {/* Clickable Time Chips / Checkboxes */}
            <View style={styles.timesRow}>
                {medication.times.map((t) => {
                    const status = medication.statusByTime[`${t.hour}:${t.minute}`] ?? 'not yet';
                    const iconColor = getStatusColor(status, '#9E9E9E');

                    return (
                        <TouchableOpacity
                            key={`${t.hour}:${t.minute}`}
                            style={styles.timeChip}
                            onPress={() => onToggleStatus(medication.id, t.hour, t.minute, status)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={getStatusIcon(status)}
                                size={16}
                                color={iconColor}
                            />
                            <Text style={styles.timeChipText}>
                                {formatTime(t.hour, t.minute)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftInfoGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    typeIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    titleContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    cardDetails: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6E737B',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 10,
    },
    notesIcon: {
        marginRight: 6,
        color: '#D00000',
    },
    cardNotes: {
        fontSize: 11,
        fontWeight: '600',
        color: '#D00000',
        flex: 1,
    },
    timesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 6,
    },
    timeChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0D1117',
    },
});