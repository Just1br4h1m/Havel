import React, { useState, useEffect} from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_GOAL = 1000;
const STORAGE_KEY = 'intake_traker';

export default function ProgressTraker() {
    const [intakeCount, setIntakeCount] = useState(0);
    
    useEffect(() => {
        loadWaterData();
    }, []);
    
    const loadWaterData = async () => {
        try {
            const today = new Date().toDateString();
            const savedData = await AsyncStorage.getItem(STORAGE_KEY);
            
            if (savedData !== null) {
                const { date, amount } = JSON.parse(savedData);
                if (date === today) {
                    setIntakeCount(amount);
                } else {
                    setIntakeCount(0);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };
    
    const addWater = async (amount: number) => {
        const newCount = intakeCount + amount;
        setIntakeCount(newCount);
        
        try {
            const today = new Date().toDateString();
            const dataToSave = { date: today, amount: newCount };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            Alert.alert('Error', 'Failed to save data');
        }
    };
    
    const resetWater = async () => {
        setIntakeCount(0);
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            Alert.alert('Error', 'Failed to reset');
        }
    };
    
    const progressPercentage = Math.min((intakeCount / DAILY_GOAL) * 100, 100).toFixed(0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>💧 Hydration Tracker</Text>

            {/* Progress Circle Visual Display */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{progressPercentage}%</Text>
                <Text style={styles.subProgressText}>{intakeCount} / {DAILY_GOAL} ml</Text>
            </View>

            {/* Control Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.waterButton} onPress={() => addWater(250)}>
                    <Text style={styles.buttonText}>+250ml</Text>
                    <Text style={styles.buttonSubText}>Cup 🥛</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.waterButton} onPress={() => addWater(500)}>
                    <Text style={styles.buttonText}>+500ml</Text>
                    <Text style={styles.buttonSubText}>Bottle 🍼</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetWater}>
                <Text style={styles.resetText}>Reset Progress</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0faff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#005b96',
        marginBottom: 40,
    },
    progressContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 8,
        borderColor: '#6497b1',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    progressText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#011f4b',
    },
    subProgressText: {
        fontSize: 16,
        color: '#005b96',
        marginTop: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    waterButton: {
        backgroundColor: '#03396c',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
        alignItems: 'center',
        flex: 0.45,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonSubText: {
        color: '#b3cde3',
        fontSize: 12,
        marginTop: 2,
    },
    resetButton: {
        marginTop: 10,
    },
    resetText: {
        color: '#d9534f',
        fontWeight: '600',
        fontSize: 16,
    },
});