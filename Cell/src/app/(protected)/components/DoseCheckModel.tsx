import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DoseCheckModelProps {
    visible: boolean;
    medicationName: string;
    activeTimeLabel: string | null;
    showSnoozeOptions: boolean;
    onYes: () => void;
    onNo: () => void;
    onOpenSnooze: () => void;
    onSnooze: (minutes: number) => void;
}

const SNOOZE_OPTIONS = [5, 10, 15, 30];

export function DoseCheckModal({
    visible,
    medicationName,
    activeTimeLabel,
    showSnoozeOptions,
    onYes,
    onNo,
    onOpenSnooze,
    onSnooze,
}: DoseCheckModelProps) {

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.box, { backgroundColor: '#FFFFFF' }]}>

                    {/* Header Icon Badge */}
                    <View style={styles.iconBadge}>
                        <Ionicons
                            name={showSnoozeOptions ? "alarm-outline" : "medical-outline"}
                            size={28}
                            color="#0B1C49"
                        />
                    </View>

                    {/* Title & Dose Label */}
                    <Text style={[styles.title, { color: '#0D1117' }]}>
                        {showSnoozeOptions ? 'Snooze Reminder' : `Did you take ${medicationName}?`}
                    </Text>

                    {activeTimeLabel && !showSnoozeOptions ? (
                        <Text style={[styles.subtitle, { color: '#6E737B' }]}>
                            {activeTimeLabel} dose
                        </Text>
                    ) : null}

                    {/* Action State: Primary Options (Yes / No / Snooze) */}
                    {!showSnoozeOptions ? (
                        <View style={styles.actionsContainer}>
                            {/* Yes Button (Primary CTA) */}
                            <TouchableOpacity
                                onPress={onYes}
                                style={styles.yesButton}
                                activeOpacity={0.9}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={styles.btnIcon} />
                                <Text style={styles.yesButtonText}>Yes, taken</Text>
                            </TouchableOpacity>

                            {/* Secondary Row (No & Snooze) */}
                            <View style={styles.secondaryRow}>
                                <TouchableOpacity
                                    onPress={onNo}
                                    style={styles.noButton}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="close-circle-outline" size={18} color="#0D1117" style={styles.btnIcon} />
                                    <Text style={styles.noButtonText}>No</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onOpenSnooze}
                                    style={styles.snoozeButton}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="time-outline" size={18} color="#0B1C49" style={styles.btnIcon} />
                                    <Text style={styles.snoozeButtonText}>Snooze</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        /* Snooze Options View */
                        <View style={styles.snoozeContainer}>
                            <Text style={[styles.snoozeLabel, { color: '#6E737B' }]}>
                                Choose a duration to remind you again:
                            </Text>

                            <View style={styles.snoozeOptionsRow}>
                                {SNOOZE_OPTIONS.map((min) => (
                                    <TouchableOpacity
                                        key={min}
                                        style={styles.snoozeOption}
                                        onPress={() => onSnooze(min)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.snoozeOptionText}>{min} min</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {onCloseSnooze && (
                                <TouchableOpacity
                                    onPress={onCloseSnooze}
                                    style={styles.cancelSnoozeButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelSnoozeText}>Back</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    box: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    iconBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    actionsContainer: {
        width: '100%',
        marginTop: 8,
    },
    yesButton: {
        backgroundColor: '#0B1C49',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    yesButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    btnIcon: {
        marginRight: 6,
    },
    secondaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    noButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noButtonText: {
        color: '#0D1117',
        fontSize: 14,
        fontWeight: '700',
    },
    snoozeButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    snoozeButtonText: {
        color: '#0B1C49',
        fontSize: 14,
        fontWeight: '700',
    },
    snoozeContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 8,
    },
    snoozeLabel: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 16,
    },
    snoozeOptionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
    },
    snoozeOption: {
        width: 64,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    snoozeOptionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0B1C49',
    },
    cancelSnoozeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    cancelSnoozeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6E737B',
    },
});