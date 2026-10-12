import { useState } from 'react';
import { Medication } from '../storage/medicationStorage';

const defaultQuantityFor = (quantityType: string) => (quantityType === 'Syrup' ? 10 : 1);

export type DraftTime = { hour: number; minute: number };

const draftTimeKey = (t: DraftTime) => `${t.hour}:${t.minute}`;

export function useMedicationForm() {
    const [visible, setVisible] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [times, setTimes] = useState<DraftTime[]>([]);
    const [foodTiming, setFoodTiming] = useState('Before Food');
    const [quantityType, setQuantityTypeState] = useState('Pills');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    const setQuantityType = (type: string) => {
        setQuantityTypeState(type);
        setQuantity(defaultQuantityFor(type));
    };

    const addTime = (time: Date) => {
        const draft: DraftTime = { hour: time.getHours(), minute: time.getMinutes() };
        setTimes((prev) => (prev.some((t) => draftTimeKey(t) === draftTimeKey(draft)) ? prev : [...prev, draft]));
    };

    const removeTime = (index: number) => {
        setTimes((prev) => prev.filter((_, i) => i !== index));
    };

    const reset = () => {
        setName('');
        setTimes([]);
        setFoodTiming('Before Food');
        setQuantityTypeState('Pills');
        setQuantity(1);
        setNotes('');
        setIsEditing(false);
        setEditingId(null);
        setVisible(false);
    };

    const openForAdd = () => {
        reset();
        setVisible(true);
    };

    const openForEdit = (med: Medication) => {
        setName(med?.name ?? '');
        // Safely check if med.times exists before calling .map()
        const safeTimes = Array.isArray(med?.times) ? med.times : [];
        setTimes(safeTimes.map((t) => ({ hour: t.hour, minute: t.minute })));
        setFoodTiming(med?.foodTiming ?? 'Before Food');
        setQuantityTypeState(med?.quantityType ?? 'Pills');
        setQuantity(med?.quantity ?? 1);
        setNotes(med?.notes ?? '');
        setEditingId(med?.id ?? null);
        setIsEditing(true);
        setVisible(true);
    };

    return {
        visible,
        isEditing,
        editingId,
        name,
        setName,
        times,
        addTime,
        removeTime,
        foodTiming,
        setFoodTiming,
        quantityType,
        setQuantityType,
        quantity,
        setQuantity,
        notes,
        setNotes,
        reset,
        openForAdd,
        openForEdit,
        close: () => setVisible(false),
    };
}