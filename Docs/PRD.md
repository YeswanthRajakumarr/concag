PRODUCT REQUIREMENTS DOCUMENT
Product Name: ConCag Triage & Visit Management System (TVMS)

Version: V1 (Non-AI)
Platform: Web (Hospital Internal Use Only)
Users: Nurses, Doctors, Admin Staff
Compliance Goal: HIPAA-aligned architecture

1. 🎯 PRODUCT PURPOSE

A standalone triage and visit workflow system for small hospitals that:

Structures patient inflow

Guides nurse-led triage

Enables clear doctor handover

Tracks multiple vitals over time

Maintains audit-safe medical records

This is also a training-friendly system for attenders and junior staff.

2. 👥 USER ROLES
Role	Capabilities
Admin	Create visits, assign doctors, manage users
Nurse	Perform triage, record vitals, send to doctor
Doctor (Primary)	Diagnose, prescribe, lock visit
Doctor (Consulting)	Add consultation notes
3. 🔄 VISIT WORKFLOW STATES
WAITING → IN_TRIAGE → READY_FOR_DOCTOR → WITH_DOCTOR → COMPLETED


Only Primary Doctor can move visit to COMPLETED (Locked).

4. 🧩 CORE MODULES
4.1 Patient Management

Basic demographic record.

Fields

id (UUID)

name

gender

date_of_birth

phone (optional)

created_at

4.2 Visit Management

Visit Fields

id (UUID)

patient_id (FK)

visit_type (OPD / Emergency / Follow-up)

department

status (enum)

arrival_time

completed_at

locked_by_doctor_id

4.3 Multi-Doctor Assignment

A visit can have multiple doctors.

Roles

PRIMARY

CONSULTING

4.4 Nurse Triage Module

Structured intake form.

Sections

A. Chief Complaint

Free text

B. Symptoms Checklist
Boolean list:

Fever

Cough

Breathlessness

Pain

Vomiting

Dizziness

Injury

Other (text)

C. Pain Score
0–10 scale

D. Medical History

Known conditions (text)

Current medications (text)

Allergies (text)

Past surgeries (text)

E. Notes
Free text

4.5 Optional Previous History View

Nurse can open “View History” panel:

Last 3 visits

Diagnoses

Chronic conditions

Allergy list

Read-only.

4.6 Vitals System

Multiple vitals entries allowed per visit.

Vitals Fields

id

visit_id

recorded_by (user_id)

recorded_at

context (TRIAGE / PRE_DOCTOR / POST_TREATMENT / DISCHARGE)

bp_systolic

bp_diastolic

heart_rate

respiratory_rate

spo2

temperature

weight

height

bmi (calculated)

4.7 Abnormal Highlight Rules
Vital	Condition
SpO₂ < 92	Critical
Resp Rate <10 or >24	Critical
Temp > 38°C	Warning
BP > 140/90	Warning

UI-only highlighting (no alerts yet).

4.8 Triage Summary Screen

Before sending to doctor:

Displays:

Complaints

Symptoms

Pain score

History

Latest vitals

Vitals graph preview

Button: Send to Doctor

4.9 Doctor Review Module

Doctor sees structured screen:

Triage Summary

Vitals Graphs

Nurse Notes

Diagnosis

Prescription

Advice / Instructions

Add Consultation Note (if consulting doctor)

4.10 Visit Lock

Primary doctor can Complete & Lock Visit

After lock:

No edits to triage or vitals

Doctors can add addendum notes (audit logged)

Admin can reopen (requires reason)

5. 📊 VITALS GRAPH REQUIREMENT

Charts required:

BP trend (systolic/diastolic)

SpO₂ trend

Temperature trend

Scope:

Within current visit (V1)

6. 🔐 SECURITY & HIPAA ALIGNMENT

Supabase Auth (email/password for hospital staff)

Role-based row-level security (RLS)

HTTPS required

Audit log for all updates

Session timeout after inactivity

🧱 TECHNICAL SPECIFICATION
7. 🧰 TECH STACK
Layer	Tech
Frontend	Next.js (App Router)
UI	Tailwind CSS + shadcn/ui
Backend	Supabase (Postgres + Auth + Storage)
Charts	Recharts
Forms	React Hook Form + Zod
8. 🗄 DATABASE SCHEMA (Supabase)
patients
id uuid pk
name text
gender text
date_of_birth date
phone text
created_at timestamp

visits
id uuid pk
patient_id uuid fk
visit_type text
department text
status text
arrival_time timestamp
completed_at timestamp
locked_by_doctor_id uuid

visit_doctors
id uuid pk
visit_id uuid fk
doctor_id uuid fk
role text

triage_records
id uuid pk
visit_id uuid fk
chief_complaint text
symptoms jsonb
pain_score int
known_conditions text
medications text
allergies text
past_surgeries text
notes text
created_by uuid
created_at timestamp

vitals
id uuid pk
visit_id uuid fk
recorded_by uuid
recorded_at timestamp
context text
bp_systolic int
bp_diastolic int
heart_rate int
respiratory_rate int
spo2 int
temperature numeric
weight numeric
height numeric
bmi numeric

doctor_notes
id uuid pk
visit_id uuid fk
doctor_id uuid
note_type text
content text
created_at timestamp

prescriptions
id uuid pk
visit_id uuid fk
doctor_id uuid
medication text
dosage text
frequency text
duration text
notes text

audit_logs
id uuid pk
user_id uuid
action text
entity text
entity_id uuid
old_value jsonb
new_value jsonb
created_at timestamp


10. 🖥 UI SCREENS (shadcn Components)
Screen	Key Components
Patient Queue	Table, Status badges
Triage Form	Tabs, Checkboxes, Sliders
Vitals Entry	Card grid inputs
Triage Summary	Accordion layout
Doctor Review	Split layout + charts
Visit History Panel	Sheet / Drawer

11. 🚀 FUTURE READY (Not V1)

AI triage assistant

Voice capture

Device-based vitals

Printable discharge summary

Cross-hospital sync