-- ConCag TVMS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ENUM TYPES
-- =====================

CREATE TYPE visit_status AS ENUM (
  'WAITING',
  'IN_TRIAGE',
  'READY_FOR_DOCTOR',
  'WITH_DOCTOR',
  'COMPLETED'
);

CREATE TYPE visit_type AS ENUM (
  'OPD',
  'EMERGENCY',
  'FOLLOW_UP'
);

CREATE TYPE doctor_role AS ENUM (
  'PRIMARY',
  'CONSULTING'
);

CREATE TYPE vitals_context AS ENUM (
  'TRIAGE',
  'PRE_DOCTOR',
  'POST_TREATMENT',
  'DISCHARGE'
);

CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'NURSE',
  'DOCTOR'
);

-- =====================
-- USERS / PROFILES
-- =====================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'NURSE',
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PATIENTS
-- =====================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- VISITS
-- =====================

CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_type visit_type NOT NULL DEFAULT 'OPD',
  department TEXT,
  status visit_status NOT NULL DEFAULT 'WAITING',
  arrival_time TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  locked_by_doctor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- VISIT DOCTORS
-- =====================

CREATE TABLE visit_doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  role doctor_role NOT NULL DEFAULT 'PRIMARY',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visit_id, doctor_id)
);

-- =====================
-- TRIAGE RECORDS
-- =====================

CREATE TABLE triage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  chief_complaint TEXT,
  symptoms JSONB DEFAULT '{}',
  pain_score INT CHECK (pain_score >= 0 AND pain_score <= 10),
  known_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  past_surgeries TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- VITALS
-- =====================

CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES profiles(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  context vitals_context DEFAULT 'TRIAGE',
  bp_systolic INT,
  bp_diastolic INT,
  heart_rate INT,
  respiratory_rate INT,
  spo2 INT,
  temperature NUMERIC(4,1),
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  bmi NUMERIC(4,1)
);

-- =====================
-- DOCTOR NOTES
-- =====================

CREATE TABLE doctor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  note_type TEXT CHECK (note_type IN ('DIAGNOSIS', 'ADVICE', 'CONSULTATION', 'ADDENDUM')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PRESCRIPTIONS
-- =====================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  medication TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- AUDIT LOGS
-- =====================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_vitals_visit ON vitals(visit_id);
CREATE INDEX idx_triage_visit ON triage_records(visit_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic policies (authenticated users can read/write)
-- In production, refine these based on roles

CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view patients"
  ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage visits"
  ON visits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage visit_doctors"
  ON visit_doctors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage triage"
  ON triage_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage vitals"
  ON vitals FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage doctor_notes"
  ON doctor_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage prescriptions"
  ON prescriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view audit_logs"
  ON audit_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert audit_logs"
  ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =====================
-- FUNCTIONS
-- =====================

-- Auto-calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.weight IS NOT NULL AND NEW.height IS NOT NULL AND NEW.height > 0 THEN
    NEW.bmi := ROUND((NEW.weight / ((NEW.height / 100) * (NEW.height / 100)))::numeric, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_bmi
  BEFORE INSERT OR UPDATE ON vitals
  FOR EACH ROW EXECUTE FUNCTION calculate_bmi();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'NURSE')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
