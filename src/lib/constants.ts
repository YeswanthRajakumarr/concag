// Vitals abnormal thresholds for highlighting
export const VITALS_THRESHOLDS = {
    spo2: {
        critical: 92,
        warning: 95,
    },
    respiratory_rate: {
        critical_low: 10,
        critical_high: 24,
        warning_low: 12,
        warning_high: 20,
    },
    temperature: {
        warning_high: 38,
        warning_low: 36,
    },
    bp_systolic: {
        warning_high: 140,
        warning_low: 90,
    },
    bp_diastolic: {
        warning_high: 90,
        warning_low: 60,
    },
    heart_rate: {
        warning_high: 100,
        warning_low: 60,
    },
} as const;

export type VitalStatus = 'normal' | 'warning' | 'critical';

export function getVitalStatus(
    vital: keyof typeof VITALS_THRESHOLDS,
    value: number | null | undefined
): VitalStatus {
    if (value === null || value === undefined) return 'normal';

    if (vital === 'spo2') {
        const t = VITALS_THRESHOLDS.spo2;
        if (value < t.critical) return 'critical';
        if (value < t.warning) return 'warning';
        return 'normal';
    }

    if (vital === 'respiratory_rate') {
        const t = VITALS_THRESHOLDS.respiratory_rate;
        if (value < t.critical_low || value > t.critical_high) return 'critical';
        if (value < t.warning_low || value > t.warning_high) return 'warning';
        return 'normal';
    }

    if (vital === 'temperature') {
        const t = VITALS_THRESHOLDS.temperature;
        if (value > t.warning_high || value < t.warning_low) return 'warning';
        return 'normal';
    }

    if (vital === 'bp_systolic') {
        const t = VITALS_THRESHOLDS.bp_systolic;
        if (value > t.warning_high || value < t.warning_low) return 'warning';
        return 'normal';
    }

    if (vital === 'bp_diastolic') {
        const t = VITALS_THRESHOLDS.bp_diastolic;
        if (value > t.warning_high || value < t.warning_low) return 'warning';
        return 'normal';
    }

    if (vital === 'heart_rate') {
        const t = VITALS_THRESHOLDS.heart_rate;
        if (value > t.warning_high || value < t.warning_low) return 'warning';
        return 'normal';
    }

    return 'normal';
}


// Visit status display config
export const VISIT_STATUS_CONFIG: Record<
    string,
    { label: string; color: string; bgColor: string }
> = {
    WAITING: {
        label: 'Waiting',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
    },
    IN_TRIAGE: {
        label: 'In Triage',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
    },
    READY_FOR_DOCTOR: {
        label: 'Ready for Doctor',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
    },
    WITH_DOCTOR: {
        label: 'With Doctor',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
    },
    COMPLETED: {
        label: 'Completed',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
    },
};

// Department options
export const DEPARTMENTS = [
    'General Medicine',
    'Pediatrics',
    'Orthopedics',
    'Cardiology',
    'Neurology',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Emergency',
] as const;

// Symptom labels
export const SYMPTOM_LABELS: Record<string, string> = {
    fever: 'Fever',
    cough: 'Cough',
    breathlessness: 'Breathlessness',
    pain: 'Pain',
    vomiting: 'Vomiting',
    dizziness: 'Dizziness',
    injury: 'Injury',
};
