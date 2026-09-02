import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  roles, seedConsultations, seedPatients, seedReferrals, seedSyncRecords, seedTriages,
  type Consultation, type Patient, type Referral, type Role, type RoleId,
  type Severity, type SyncRecord, type TriageResult, type Vital, isRoleId,
} from '../data';

export { isRoleId };

export type Language = 'en' | 'hi' | 'te';

export type Store = {
  patients: Patient[];
  triages: TriageResult[];
  consultations: Consultation[];
  referrals: Referral[];
  syncRecords: SyncRecord[];
  offline: boolean;
  lastSynced: string;
  currentRole: RoleId | null;
  language: Language;
  setPatients: Dispatch<SetStateAction<Patient[]>>;
  setTriages: Dispatch<SetStateAction<TriageResult[]>>;
  setConsultations: Dispatch<SetStateAction<Consultation[]>>;
  setReferrals: Dispatch<SetStateAction<Referral[]>>;
  setSyncRecords: Dispatch<SetStateAction<SyncRecord[]>>;
  setOffline: Dispatch<SetStateAction<boolean>>;
  setLastSynced: Dispatch<SetStateAction<string>>;
  setCurrentRole: Dispatch<SetStateAction<RoleId | null>>;
  setLanguage: Dispatch<SetStateAction<Language>>;
};

const StoreContext = createContext<Store | null>(null);

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(`srha-${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('StoreProvider is missing');
  return store;
};

const usePersisted = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => readStorage(key, initial));
  useEffect(() => localStorage.setItem(`srha-${key}`, JSON.stringify(value)), [key, value]);
  return [value, setValue] as const;
};

const useRoleStorage = () => {
  const [role, setRole] = useState<RoleId | null>(() => {
    const storedRole = localStorage.getItem('role');
    return isRoleId(storedRole) ? storedRole : null;
  });

  useEffect(() => {
    if (role && isRoleId(role)) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  }, [role]);

  return [role, setRole] as const;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = usePersisted('patients', seedPatients);
  const [triages, setTriages] = usePersisted('triages', seedTriages);
  const [consultations, setConsultations] = usePersisted('consultations', seedConsultations);
  const [referrals, setReferrals] = usePersisted('referrals', seedReferrals);
  const [syncRecords, setSyncRecords] = usePersisted('sync', seedSyncRecords);
  const [offline, setOffline] = usePersisted('offline', false);
  const [lastSynced, setLastSynced] = usePersisted('last-synced', 'Today, 08:42');
  const [currentRole, setCurrentRole] = useRoleStorage();
  const [language, setLanguage] = usePersisted<Language>('language', 'en');

  return (
    <StoreContext.Provider
      value={{
        patients,
        triages,
        consultations,
        referrals,
        syncRecords,
        offline,
        lastSynced,
        currentRole,
        language,
        setPatients,
        setTriages,
        setConsultations,
        setReferrals,
        setSyncRecords,
        setOffline,
        setLastSynced,
        setCurrentRole,
        setLanguage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const copy = {
  en: {
    dashboard: 'Dashboard', patients: 'Patients', triage: 'Triage', referrals: 'Referrals',
    sync: 'Offline & sync', analytics: 'Analytics', consultations: 'Consultations',
    signIn: 'Sign in', username: 'Username', password: 'Password', continue: 'Continue',
    asha: 'ASHA Worker', doctor: 'Doctor', admin: 'Administrator', home: 'Home care',
    teleconsult: 'Teleconsult', emergency: 'Emergency referral', save: 'Save record',
    runTriage: 'Run triage', register: 'Register patient', search: 'Search patients',
    synced: 'Synced', pending: 'Pending sync', online: 'Online', offline: 'Offline mode',
    today: 'Today', back: 'Back', language: 'Language',
  },
  hi: {
    dashboard: 'डैशबोर्ड', patients: 'मरीज़', triage: 'जांच', referrals: 'रेफरल',
    sync: 'ऑफ़लाइन और सिंक', analytics: 'विश्लेषण', consultations: 'परामर्श',
    signIn: 'साइन इन', username: 'यूज़रनेम', password: 'पासवर्ड', continue: 'आगे बढ़ें',
    asha: 'आशा कार्यकर्ता', doctor: 'डॉक्टर', admin: 'प्रशासक', home: 'घर पर देखभाल',
    teleconsult: 'टेलीपरामर्श', emergency: 'आपातकालीन रेफरल', save: 'रिकॉर्ड सहेजें',
    runTriage: 'जांच शुरू करें', register: 'मरीज़ दर्ज करें', search: 'मरीज़ खोजें',
    synced: 'सिंक हुआ', pending: 'सिंक लंबित', online: 'ऑनलाइन', offline: 'ऑफ़लाइन मोड',
    today: 'आज', back: 'वापस', language: 'भाषा',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్', patients: 'రోగులు', triage: 'లక్షణాల పరిశీలన', referrals: 'రిఫరల్స్',
    sync: 'ఆఫ్‌లైన్ & సింక్', analytics: 'విశ్లేషణ', consultations: 'సంప్రదింపులు',
    signIn: 'సైన్ ఇన్', username: 'వినియోగదారు పేరు', password: 'పాస్‌వర్డ్', continue: 'కొనసాగించు',
    asha: 'ఆశా కార్యకర్త', doctor: 'వైద్యుడు', admin: 'నిర్వాహకుడు', home: 'ఇంటి సంరక్షణ',
    teleconsult: 'టెలికన్సల్ట్', emergency: 'అత్యవసర రిఫరల్', save: 'రికార్డ్ భద్రపరచు',
    runTriage: 'పరిశీలన ప్రారంభించు', register: 'రోగిని నమోదు చేయి', search: 'రోగులను వెతుకు',
    synced: 'సింక్ అయింది', pending: 'సింక్ పెండింగ్', online: 'ఆన్‌లైన్', offline: 'ఆఫ్‌లైన్ మోడ్',
    today: 'ఈ రోజు', back: 'వెనుకకు', language: 'భాష',
  },
} as const;

type CopyKey = keyof typeof copy.en;
export const useCopy = () => {
  const { language } = useStore();
  return (key: CopyKey) => copy[language][key];
};

export const roleById = (id: RoleId | null) => roles.find((role) => role.id === id) ?? roles[0];

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export const uid = (prefix: string) => `${prefix}-${Math.floor(Date.now() / 1000).toString().slice(-6)}`;

export const initials = (name: string) => name.split(' ').map((word) => word[0]).slice(0, 2).join('');

export const latestVital = (patient?: Patient | null): Vital | undefined => patient?.vitals?.[0];

export const abnormalVitals = (patient: Patient) => {
  const vital = latestVital(patient);
  return Boolean(
    vital &&
      (vital.bpSystolic >= 140 || vital.bpDiastolic >= 90 || vital.sugar >= 200 || vital.spo2 < 94 || vital.temperature >= 38.0)
  );
};

export const patientRisk = (patient: Patient): Severity =>
  patient.triageStatus ?? (patient.risk === 'high' ? 'red' : patient.risk === 'medium' ? 'yellow' : 'green');

export const riskLabel = (risk: Severity) =>
  risk === 'red' ? 'Red · Critical' : risk === 'yellow' ? 'Yellow · Warning' : 'Green · Normal';

export const sameDay = (first: string, second = new Date().toISOString()) =>
  new Date(first).toDateString() === new Date(second).toDateString();
