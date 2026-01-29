// Database Types for ConCag TVMS

export type VisitStatus =
    | 'WAITING'
    | 'IN_TRIAGE'
    | 'READY_FOR_DOCTOR'
    | 'WITH_DOCTOR'
    | 'COMPLETED';

export type VisitType = 'OPD' | 'EMERGENCY' | 'FOLLOW_UP';

export type DoctorRole = 'PRIMARY' | 'CONSULTING';

export type VitalsContext = 'TRIAGE' | 'PRE_DOCTOR' | 'POST_TREATMENT' | 'DISCHARGE';

export type UserRole = 'ADMIN' | 'NURSE' | 'DOCTOR';

export type NoteType = 'DIAGNOSIS' | 'ADVICE' | 'CONSULTATION' | 'ADDENDUM';

// =====================
// Database Tables
// =====================

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    department?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Patient {
    id: string;
    name: string;
    gender?: 'Male' | 'Female' | 'Other' | null;
    date_of_birth?: string | null;
    phone?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Visit {
    id: string;
    patient_id: string;
    visit_type: VisitType;
    department?: string | null;
    status: VisitStatus;
    arrival_time: string;
    completed_at?: string | null;
    locked_by_doctor_id?: string | null;
    created_at: string;
    updated_at: string;
}

export interface VisitDoctor {
    id: string;
    visit_id: string;
    doctor_id: string;
    role: DoctorRole;
    assigned_at: string;
}

export interface TriageRecord {
    id: string;
    visit_id: string;
    chief_complaint?: string | null;
    symptoms: SymptomsData;
    pain_score?: number | null;
    known_conditions?: string | null;
    medications?: string | null;
    allergies?: string | null;
    past_surgeries?: string | null;
    notes?: string | null;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
}

export interface SymptomsData {
    fever?: boolean;
    cough?: boolean;
    breathlessness?: boolean;
    pain?: boolean;
    vomiting?: boolean;
    dizziness?: boolean;
    injury?: boolean;
    other?: string;
}

export interface Vitals {
    id: string;
    visit_id: string;
    recorded_by?: string | null;
    recorded_at: string;
    context: VitalsContext;
    bp_systolic?: number | null;
    bp_diastolic?: number | null;
    heart_rate?: number | null;
    respiratory_rate?: number | null;
    spo2?: number | null;
    temperature?: number | null;
    weight?: number | null;
    height?: number | null;
    bmi?: number | null;
}

export interface DoctorNote {
    id: string;
    visit_id: string;
    doctor_id: string;
    note_type: NoteType;
    content: string;
    created_at: string;
}

export interface Prescription {
    id: string;
    visit_id: string;
    doctor_id: string;
    medication: string;
    dosage?: string | null;
    frequency?: string | null;
    duration?: string | null;
    notes?: string | null;
    created_at: string;
}

export interface AuditLog {
    id: string;
    user_id?: string | null;
    action: string;
    entity: string;
    entity_id?: string | null;
    old_value?: Record<string, unknown> | null;
    new_value?: Record<string, unknown> | null;
    created_at: string;
}

// =====================
// Extended Types with Relations
// =====================

export interface VisitWithPatient extends Visit {
    patient: Patient;
}

export interface VisitWithDetails extends Visit {
    patient: Patient;
    triage_records: TriageRecord[];
    vitals: Vitals[];
    visit_doctors: (VisitDoctor & { doctor: Profile })[];
    doctor_notes: DoctorNote[];
    prescriptions: Prescription[];
}

// =====================
// Form Input Types
// =====================

export interface PatientInput {
    name: string;
    gender?: 'Male' | 'Female' | 'Other';
    date_of_birth?: string;
    phone?: string;
}

export interface VisitInput {
    patient_id: string;
    visit_type: VisitType;
    department?: string;
}

export interface TriageInput {
    visit_id: string;
    chief_complaint?: string;
    symptoms: SymptomsData;
    pain_score?: number;
    known_conditions?: string;
    medications?: string;
    allergies?: string;
    past_surgeries?: string;
    notes?: string;
}

export interface VitalsInput {
    visit_id: string;
    context: VitalsContext;
    bp_systolic?: number;
    bp_diastolic?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    spo2?: number;
    temperature?: number;
    weight?: number;
    height?: number;
}

export interface PrescriptionInput {
    visit_id: string;
    medication: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
}

export interface DoctorNoteInput {
    visit_id: string;
    note_type: NoteType;
    content: string;
}
