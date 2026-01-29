import { createClient } from "@/utils/supabase/client"
import type {
    Patient,
    Visit,
    VisitWithPatient,
    Vitals,
    TriageRecord,
    Prescription,
    DoctorNote,
    VisitStatus
} from "@/types/database"

const supabase = createClient()

// ============= PATIENTS =============

export async function getPatients() {
    const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data as Patient[]
}

export async function getPatientById(id: string) {
    const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error
    return data as Patient
}

export async function createPatient(patient: {
    name: string
    gender?: "Male" | "Female" | "Other"
    date_of_birth?: string
    phone?: string
}) {
    const { data, error } = await supabase
        .from("patients")
        .insert(patient)
        .select()
        .single()

    if (error) throw error
    return data as Patient
}

// ============= VISITS =============

export async function getActiveVisits() {
    const { data, error } = await supabase
        .from("visits")
        .select(`
      *,
      patient:patients(*)
    `)
        .in("status", ["WAITING", "IN_TRIAGE", "READY_FOR_DOCTOR", "WITH_DOCTOR"])
        .order("arrival_time", { ascending: true })

    if (error) throw error
    return data as VisitWithPatient[]
}

export async function getVisitById(id: string) {
    const { data, error } = await supabase
        .from("visits")
        .select(`
      *,
      patient:patients(*),
      triage_records(*),
      vitals(*),
      prescriptions(*),
      doctor_notes(*)
    `)
        .eq("id", id)
        .single()

    if (error) throw error
    return data
}

export async function createVisit(visit: {
    patient_id: string
    visit_type: "OPD" | "EMERGENCY" | "FOLLOW_UP" | "PROCEDURE"
    department?: string
}) {
    const { data, error } = await supabase
        .from("visits")
        .insert({
            ...visit,
            status: "WAITING",
            arrival_time: new Date().toISOString(),
        })
        .select(`
      *,
      patient:patients(*)
    `)
        .single()

    if (error) throw error
    return data as VisitWithPatient
}

export async function updateVisitStatus(id: string, status: VisitStatus) {
    const { data, error } = await supabase
        .from("visits")
        .update({ status })
        .eq("id", id)
        .select(`
      *,
      patient:patients(*)
    `)
        .single()

    if (error) throw error
    return data as VisitWithPatient
}

// ============= VITALS =============

export async function getVitalsByVisitId(visitId: string) {
    const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("visit_id", visitId)
        .order("recorded_at", { ascending: false })

    if (error) throw error
    return data as Vitals[]
}

export async function getVitalsByPatientId(patientId: string) {
    const { data, error } = await supabase
        .from("vitals")
        .select(`
      *,
      visit:visits!inner(patient_id)
    `)
        .eq("visit.patient_id", patientId)
        .order("recorded_at", { ascending: false })

    if (error) throw error
    return data as Vitals[]
}

export async function createVitals(vitals: {
    visit_id: string
    context: "TRIAGE" | "PRE_DOCTOR" | "POST_DOCTOR" | "MONITORING"
    bp_systolic?: number
    bp_diastolic?: number
    heart_rate?: number
    respiratory_rate?: number
    spo2?: number
    temperature?: number
    weight?: number
    height?: number
}) {
    const { data, error } = await supabase
        .from("vitals")
        .insert(vitals)
        .select()
        .single()

    if (error) throw error
    return data as Vitals
}

// ============= TRIAGE =============

export async function getTriageByVisitId(visitId: string) {
    const { data, error } = await supabase
        .from("triage_records")
        .select("*")
        .eq("visit_id", visitId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    if (error && error.code !== "PGRST116") throw error
    return data as TriageRecord | null
}

export async function createOrUpdateTriage(triage: {
    visit_id: string
    chief_complaint?: string
    symptoms?: Record<string, boolean | string>
    pain_score?: number
    known_conditions?: string
    medications?: string
    allergies?: string
    past_surgeries?: string
    notes?: string
}) {
    // Check if triage exists
    const existing = await getTriageByVisitId(triage.visit_id)

    if (existing) {
        const { data, error } = await supabase
            .from("triage_records")
            .update(triage)
            .eq("id", existing.id)
            .select()
            .single()

        if (error) throw error
        return data as TriageRecord
    } else {
        const { data, error } = await supabase
            .from("triage_records")
            .insert(triage)
            .select()
            .single()

        if (error) throw error
        return data as TriageRecord
    }
}

// ============= PRESCRIPTIONS =============

export async function getPrescriptionsByVisitId(visitId: string) {
    const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("visit_id", visitId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data as Prescription[]
}

export async function createPrescription(prescription: {
    visit_id: string
    medication: string
    dosage?: string
    frequency?: string
    duration?: string
    notes?: string
}) {
    const { data, error } = await supabase
        .from("prescriptions")
        .insert(prescription)
        .select()
        .single()

    if (error) throw error
    return data as Prescription
}

export async function deletePrescription(id: string) {
    const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", id)

    if (error) throw error
}

// ============= DOCTOR NOTES =============

export async function createDoctorNote(note: {
    visit_id: string
    note_type: "DIAGNOSIS" | "CLINICAL_NOTE" | "FOLLOWUP"
    content: string
}) {
    const { data, error } = await supabase
        .from("doctor_notes")
        .insert(note)
        .select()
        .single()

    if (error) throw error
    return data as DoctorNote
}
