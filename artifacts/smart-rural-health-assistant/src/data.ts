export type RoleId = 'asha' | 'doctor' | 'admin';
export type Risk = 'low' | 'medium' | 'high';
export type Severity = 'green' | 'yellow' | 'red';
export type ReferralStatus = 'pending' | 'accepted' | 'completed';
export type Vital = {
  recordedAt: string;
  bpSystolic: number;
  bpDiastolic: number;
  sugar: number;
  heartRate: number;
  spo2: number;
  temperature: number;
};
export type MedicalHistory = {
  diseases: string[];
  allergies: string[];
  previousTreatments: string[];
};
export type Prescription = {
  medicineName: string;
  dosage: string;
  duration: string;
};
export type Visit = {
  id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  prescription: Prescription;
  doctor: string;
};

export type Role = {
  id: RoleId;
  name: string;
  title: string;
  facility: string;
  username: string;
  password: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  village: string;
  phone: string;
  condition: string;
  risk: Risk;
  lastVisit: string;
  registeredBy: string;
  triageStatus: Severity | null;
  triageRecommendation: string;
  createdAt: string;
  vitals: Vital[];
  history: MedicalHistory;
  visits: Visit[];
  referrals?: Referral[];
};

export type TriageResult = {
  id: string;
  patientId: string;
  severity: Severity;
  symptoms: string[];
  recommendation: string;
  nextAction: string;
  createdAt: string;
  reviewedBy?: string;
};

export type Consultation = {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: string;
};

export type Referral = {
  id: string;
  patientId: string;
  hospital: string;
  reason: string;
  notes?: string;
  status: ReferralStatus;
  assignedBy: string;
  createdAt: string;
};

export type SyncRecord = {
  id: string;
  type: string;
  label: string;
  status: 'pending' | 'synced';
  createdAt: string;
};

export const roles: Role[] = [
  { id: 'asha', name: 'Meena Kumari', title: 'ASHA Worker', facility: 'Kankipadu field unit', username: 'meena', password: 'demo123' },
  { id: 'doctor', name: 'Dr. Ravi Prakash', title: 'Medical Officer', facility: 'Vijayawada Rural PHC', username: 'ravi', password: 'demo123' },
  { id: 'admin', name: 'Anita Rao', title: 'District Administrator', facility: 'Krishna District Health Office', username: 'anita', password: 'demo123' },
];

export const symptomOptions = [
  'Fever or chills',
  'Cough or breathing difficulty',
  'Loose stools or vomiting',
  'Chest pain or faintness',
  'Severe pain',
  'Confusion or unusual sleepiness',
  'Pregnancy-related concern',
  'Unable to eat or drink',
];

export const hospitals = ['Government General Hospital, Vijayawada', 'Area Hospital, Gannavaram', 'Community Health Centre, Kankipadu'];

const date = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();

export const seedPatients: Patient[] = [
  { id: 'P-1048', name: 'Lakshmi Devi', age: 42, gender: 'Female', village: 'Kankipadu', phone: '98••• 4418', condition: 'Fever, body ache', risk: 'medium', lastVisit: date(0), registeredBy: 'Meena Kumari', triageStatus: 'yellow', triageRecommendation: 'Speak with a doctor today', createdAt: date(0), vitals: [{ recordedAt: date(0), bpSystolic: 146, bpDiastolic: 92, sugar: 186, heartRate: 88, spo2: 97, temperature: 38.2 }], history: { diseases: ['Hypertension'], allergies: ['None known'], previousTreatments: ['Paracetamol as needed'] }, visits: [{ id: 'V-1048-1', date: date(0), symptoms: 'Fever and body ache for two days', diagnosis: 'Febrile illness; monitor blood pressure', notes: 'Review after 48 hours.', prescription: { medicineName: 'Paracetamol', dosage: '500 mg twice daily', duration: '3 days' }, doctor: 'Dr. Ravi Prakash' }] },
  { id: 'P-1047', name: 'Suresh Babu', age: 58, gender: 'Male', village: 'Uppuluru', phone: '97••• 2306', condition: 'Breathing difficulty', risk: 'high', lastVisit: date(1), registeredBy: 'Meena Kumari', triageStatus: 'red', triageRecommendation: 'Emergency referral required', createdAt: date(1), vitals: [{ recordedAt: date(1), bpSystolic: 168, bpDiastolic: 96, sugar: 142, heartRate: 104, spo2: 91, temperature: 37.4 }], history: { diseases: ['Hypertension', 'Asthma'], allergies: ['Penicillin'], previousTreatments: ['Inhaler therapy'] }, visits: [{ id: 'V-1047-1', date: date(1), symptoms: 'Breathing difficulty with chest discomfort', diagnosis: 'Acute breathing difficulty', notes: 'Emergency referral accepted by hospital.', prescription: { medicineName: 'Salbutamol inhaler', dosage: 'As directed', duration: 'Until reviewed' }, doctor: 'Dr. Ravi Prakash' }] },
  { id: 'P-1046', name: 'Anjali Kumari', age: 9, gender: 'Female', village: 'Kesarapalli', phone: '99••• 8120', condition: 'Routine check-up', risk: 'low', lastVisit: date(2), registeredBy: 'Meena Kumari', triageStatus: 'green', triageRecommendation: 'Home care and follow-up', createdAt: date(2), vitals: [{ recordedAt: date(2), bpSystolic: 104, bpDiastolic: 68, sugar: 92, heartRate: 82, spo2: 99, temperature: 36.8 }], history: { diseases: [], allergies: ['None known'], previousTreatments: ['Routine nutrition counselling'] }, visits: [{ id: 'V-1046-1', date: date(2), symptoms: 'No acute symptoms', diagnosis: 'Routine wellness review', notes: 'Follow up with ASHA worker in 30 days.', prescription: { medicineName: 'None', dosage: '—', duration: '—' }, doctor: 'Dr. Ravi Prakash' }] },
  { id: 'P-1045', name: 'Venkat Rao', age: 67, gender: 'Male', village: 'Kankipadu', phone: '96••• 0971', condition: 'Diabetes review', risk: 'medium', lastVisit: date(5), registeredBy: 'Meena Kumari', triageStatus: null, triageRecommendation: '', createdAt: date(5), vitals: [{ recordedAt: date(5), bpSystolic: 138, bpDiastolic: 84, sugar: 228, heartRate: 76, spo2: 98, temperature: 36.7 }], history: { diseases: ['Type 2 diabetes'], allergies: ['None known'], previousTreatments: ['Metformin; diet counselling'] }, visits: [] },
];

export const seedTriages: TriageResult[] = [
  { id: 'T-2201', patientId: 'P-1048', severity: 'yellow', symptoms: ['Fever or chills'], recommendation: 'Speak with a doctor today', nextAction: 'Teleconsult', createdAt: date(0) },
  { id: 'T-2200', patientId: 'P-1047', severity: 'red', symptoms: ['Cough or breathing difficulty', 'Chest pain or faintness'], recommendation: 'Emergency referral required', nextAction: 'Refer now', createdAt: date(1) },
  { id: 'T-2199', patientId: 'P-1046', severity: 'green', symptoms: [], recommendation: 'Home care and follow-up', nextAction: 'Home care', createdAt: date(2) },
];

export const seedConsultations: Consultation[] = [
  { id: 'C-301', patientId: 'P-1046', doctorId: 'Dr. Ravi Prakash', diagnosis: 'Routine wellness review', prescription: 'Continue balanced meals and fluids.', notes: 'Follow up with ASHA worker in 30 days.', createdAt: date(2) },
];

export const seedReferrals: Referral[] = [
  { id: 'R-410', patientId: 'P-1047', hospital: 'Government General Hospital, Vijayawada', reason: 'Breathing difficulty with chest discomfort', status: 'accepted', assignedBy: 'Dr. Ravi Prakash', createdAt: date(1) },
];

export const seedSyncRecords: SyncRecord[] = [
  { id: 'S-18', type: 'patient', label: 'Lakshmi Devi record', status: 'synced', createdAt: date(0) },
  { id: 'S-17', type: 'triage', label: 'Suresh Babu triage', status: 'synced', createdAt: date(1) },
];