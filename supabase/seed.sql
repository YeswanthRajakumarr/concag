-- Seed data for ConCag TVMS Demo - Orthopaedic Hospital Focus
-- Run this in Supabase SQL Editor

-- Insert sample patients with orthopaedic-related cases
INSERT INTO patients (id, name, gender, date_of_birth, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', 'Male', '1975-03-15', '9876543210'),
  ('22222222-2222-2222-2222-222222222222', 'Priya Sharma', 'Female', '1988-07-22', '9876543211'),
  ('33333333-3333-3333-3333-333333333333', 'Amit Patel', 'Male', '1962-11-08', '9876543212'),
  ('44444444-4444-4444-4444-444444444444', 'Sunita Verma', 'Female', '1955-02-28', '9876543213'),
  ('55555555-5555-5555-5555-555555555555', 'Vikram Singh', 'Male', '2008-06-14', '9876543214'),
  ('66666666-6666-6666-6666-666666666666', 'Meera Reddy', 'Female', '1980-12-01', '9876543215')
ON CONFLICT (id) DO NOTHING;

-- Insert sample visits with orthopaedic departments
INSERT INTO visits (id, patient_id, visit_type, department, status, arrival_time) VALUES
  -- Waiting: Knee pain case
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'OPD', 'Orthopaedics - Knee', 'WAITING', NOW() - INTERVAL '30 minutes'),
  -- In Triage: Road accident with suspected fracture (Emergency)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'EMERGENCY', 'Orthopaedics - Trauma', 'IN_TRIAGE', NOW() - INTERVAL '15 minutes'),
  -- Ready for Doctor: Spine consultation
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'OPD', 'Orthopaedics - Spine', 'READY_FOR_DOCTOR', NOW() - INTERVAL '45 minutes'),
  -- With Doctor: Hip replacement follow-up
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'FOLLOW_UP', 'Orthopaedics - Joint Replacement', 'WITH_DOCTOR', NOW() - INTERVAL '60 minutes'),
  -- Waiting: Sports injury
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'OPD', 'Orthopaedics - Sports Medicine', 'WAITING', NOW() - INTERVAL '10 minutes'),
  -- Waiting: Shoulder pain
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'OPD', 'Orthopaedics - Shoulder', 'WAITING', NOW() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- Triage record for Emergency trauma case (IN_TRIAGE)
INSERT INTO triage_records (id, visit_id, chief_complaint, symptoms, pain_score, known_conditions, medications, allergies, notes) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
   'Road traffic accident - motorcycle fall. Severe pain in right forearm, visible swelling and deformity. Unable to move wrist.',
   '{"pain": true, "injury": true}',
   9,
   'None',
   'None',
   'Sulfa drugs',
   'Suspected distal radius fracture (Colles). X-ray ordered. Patient conscious and oriented. No head injury. TT given.'
  )
ON CONFLICT (id) DO NOTHING;

-- Triage record for Spine consultation (READY_FOR_DOCTOR)
INSERT INTO triage_records (id, visit_id, chief_complaint, symptoms, pain_score, known_conditions, medications, allergies, notes) VALUES
  ('a2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 
   'Chronic lower back pain for 6 months, radiating to left leg. Numbness in left foot. Pain worse on prolonged sitting.',
   '{"pain": true, "dizziness": false}',
   6,
   'Type 2 Diabetes, Hypertension',
   'Metformin 500mg BD, Telmisartan 40mg OD',
   'None known',
   'Suspected lumbar disc herniation. MRI report available. Neurological examination pending.'
  )
ON CONFLICT (id) DO NOTHING;

-- Triage record for Hip replacement follow-up (WITH_DOCTOR)
INSERT INTO triage_records (id, visit_id, chief_complaint, symptoms, pain_score, known_conditions, medications, allergies, notes) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 
   '6-week post-op follow-up for total hip replacement (right). Good recovery, walking with walker. Mild stiffness in morning.',
   '{"pain": false}',
   2,
   'Osteoarthritis, Osteoporosis',
   'Calcium + Vitamin D3, Rivaroxaban 10mg OD (DVT prophylaxis)',
   'Penicillin',
   'Incision site healing well. No signs of infection. Physiotherapy compliance good. X-ray for this visit done.'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert vitals for Emergency trauma case
INSERT INTO vitals (id, visit_id, context, bp_systolic, bp_diastolic, heart_rate, respiratory_rate, spo2, temperature, weight, height) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TRIAGE',
   138, 88, 98, 20, 98, 37.0, 65, 162
  )
ON CONFLICT (id) DO NOTHING;

-- Insert vitals for Spine consultation
INSERT INTO vitals (id, visit_id, context, bp_systolic, bp_diastolic, heart_rate, respiratory_rate, spo2, temperature, weight, height) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'TRIAGE',
   148, 92, 76, 16, 99, 36.6, 88, 172
  )
ON CONFLICT (id) DO NOTHING;

-- Insert vitals for Hip replacement follow-up (multiple readings)
INSERT INTO vitals (id, visit_id, context, bp_systolic, bp_diastolic, heart_rate, respiratory_rate, spo2, temperature, weight, height, recorded_at) VALUES
  ('b3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'TRIAGE',
   128, 78, 72, 16, 99, 36.5, 58, 155, NOW() - INTERVAL '60 minutes'
  ),
  ('b4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'PRE_DOCTOR',
   126, 76, 70, 15, 99, 36.4, 58, 155, NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- NOTE: Prescriptions and doctor_notes require a valid doctor_id from profiles table.
-- These will be created when a doctor logs in and adds them through the app.
-- Once you have a doctor profile, you can add prescriptions like this:
-- INSERT INTO prescriptions (visit_id, doctor_id, medication, dosage, frequency, duration, notes) 
-- VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', '<your-doctor-profile-id>', 'Calcium + Vitamin D3', '500mg', 'Twice daily', '90 days', 'For bone health');

SELECT 'Orthopaedic demo data inserted successfully!' as status;
