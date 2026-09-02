import { useState, type FormEvent } from 'react';
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, Bell, Check, CheckCircle2,
  CloudOff, FileHeart, FilePlus2, LayoutDashboard, Phone, Plus, Send, Users, Wifi, Zap,
} from 'lucide-react';
import type { Patient, Referral, Severity, TriageResult, Vital } from '../data';
import { symptomOptions } from '../data';
import { initials, latestVital, roleById, sameDay, uid, useStore } from '../context/StoreContext';
import {
  Badge, EmptyState, Insight, Metric, type NavItem, PatientRow, PrimaryButton,
  SectionTitle, Shell, StatusBadge,
} from '../components/Common';
import { ReferralModal } from '../components/ReferralModal';
import { ReferralTrackerView } from '../components/ReferralTrackerView';
import { SyncCenterView } from '../components/SyncCenterView';
import { VitalsGrid, VitalsHistoryTable, VitalsPills } from '../components/Vitals';

export function AshaDashboard() {
  const role = roleById('asha');
  const { patients, setPatients, setTriages, referrals, setReferrals, syncRecords, setSyncRecords } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'triage' | 'register' | 'referrals' | 'sync'>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id ?? null);
  const [referralPatientId, setReferralPatientId] = useState<string | null>(null);
  const [triagePatientId, setTriagePatientId] = useState<string>(patients[0]?.id ?? '');
  const [triageSymptoms, setTriageSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const [registerForm, setRegisterForm] = useState({
    name: '', age: '', gender: 'Female', village: 'Kankipadu', phone: '', condition: '',
    bpSystolic: '120', bpDiastolic: '80', sugar: '110', heartRate: '78', spo2: '98', temperature: '37.0',
  });

  const today = patients.filter((patient) => sameDay(patient.lastVisit));
  const urgent = patients.filter((patient) => patient.triageStatus === 'red' || patient.triageStatus === 'yellow');
  const referralTargetPatient = patients.find((p) => p.id === referralPatientId);
  const activeDetailPatient = patients.find((p) => p.id === selectedPatientId);
  const currentTriagePatient = patients.find((p) => p.id === triagePatientId);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Field Console', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Register', icon: Users },
    { id: 'triage', label: 'Symptom Triage', icon: Activity },
    { id: 'referrals', label: 'Referral Tracker', icon: Send },
    { id: 'sync', label: 'Sync Center', icon: CloudOff },
  ];

  const handleRegisterSubmit = (event: FormEvent) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const initialVitals: Vital = {
      recordedAt: now,
      bpSystolic: Number(registerForm.bpSystolic) || 120,
      bpDiastolic: Number(registerForm.bpDiastolic) || 80,
      sugar: Number(registerForm.sugar) || 100,
      heartRate: Number(registerForm.heartRate) || 72,
      spo2: Number(registerForm.spo2) || 98,
      temperature: Number(registerForm.temperature) || 36.8,
    };

    const newPatient: Patient = {
      id: uid('P'),
      name: registerForm.name || 'New Patient',
      age: Number(registerForm.age) || 30,
      gender: registerForm.gender,
      village: registerForm.village,
      phone: registerForm.phone || 'Not provided',
      condition: registerForm.condition || 'General health concern',
      risk: initialVitals.bpSystolic >= 140 || initialVitals.sugar >= 200 ? 'high' : 'low',
      lastVisit: now,
      registeredBy: role.name,
      triageStatus: null,
      triageRecommendation: '',
      createdAt: now,
      vitals: [initialVitals],
      history: { diseases: [], allergies: ['None known'], previousTreatments: [] },
      visits: [],
    };

    setPatients((items) => [newPatient, ...items]);
    setSyncRecords((items) => [
      { id: uid('S'), type: 'patient', label: `${newPatient.name} registration with vitals`, status: 'pending', createdAt: now },
      ...items,
    ]);
    setTriagePatientId(newPatient.id);
    setSelectedPatientId(newPatient.id);
    setRegisterForm({
      name: '', age: '', gender: 'Female', village: 'Kankipadu', phone: '', condition: '',
      bpSystolic: '120', bpDiastolic: '80', sugar: '110', heartRate: '78', spo2: '98', temperature: '37.0',
    });
    setActiveTab('triage');
  };

  const handleRunTriage = () => {
    const isRed = triageSymptoms.some((item) =>
      ['Chest pain or faintness', 'Confusion or unusual sleepiness', 'Cough or breathing difficulty'].includes(item)
    );
    const severity: Severity = isRed ? 'red' : triageSymptoms.length > 0 ? 'yellow' : 'green';
    const details =
      severity === 'green'
        ? { recommendation: 'Home care and follow-up in 30 days', nextAction: 'Home care' }
        : severity === 'yellow'
        ? { recommendation: 'Doctor teleconsultation required today', nextAction: 'Teleconsult' }
        : { recommendation: 'Emergency hospital referral required immediately', nextAction: 'Emergency referral' };

    const triage: TriageResult = {
      id: uid('T'),
      patientId: triagePatientId,
      severity,
      symptoms: triageSymptoms,
      ...details,
      createdAt: new Date().toISOString(),
    };

    setTriageResult(triage);
    setTriages((items) => [triage, ...items]);
    setPatients((items) =>
      items.map((item) =>
        item.id === triagePatientId
          ? {
              ...item,
              triageStatus: severity,
              triageRecommendation: details.recommendation,
              risk: severity === 'red' ? 'high' : severity === 'yellow' ? 'medium' : 'low',
              lastVisit: new Date().toISOString(),
            }
          : item
      )
    );
    setSyncRecords((items) => [
      { id: uid('S'), type: 'triage', label: `Patient triage (${severity})`, status: 'pending', createdAt: new Date().toISOString() },
      ...items,
    ]);
  };

  const updateReferralStatus = (id: string, status: Referral['status']) => {
    setReferrals((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <Shell
      role={role}
      items={navItems}
      activeTab={activeTab}
      onSelectTab={(tab) => setActiveTab(tab as typeof activeTab)}
      title="Good morning, Meena"
      eyebrow="ASHA worker / Kankipadu field unit"
      headerAction={
        <PrimaryButton
          onClick={() => setActiveTab('register')}
          variant="primary"
          testId="button-register-header"
        >
          <Plus size={15} /> Register Patient
        </PrimaryButton>
      }
    >
      {activeTab === 'overview' && (
        <div className="animate-rise space-y-8">
          <div className="rounded-3xl bg-[#e0eee2] p-5 md:p-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <Badge tone="green" icon={<CheckCircle2 size={13} />}>
                  Field shift active
                </Badge>
                <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-[-.05em] md:text-4xl">
                  Frontline health records for Krishna District.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#467263]">
                  All observations and vital signs save locally on this device first. Escalate critical cases and review referrals right here.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <PrimaryButton
                  onClick={() => setActiveTab('register')}
                  testId="button-register-patient"
                >
                  <Plus size={17} /> Register patient & vitals
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => setActiveTab('triage')}
                  variant="outline"
                  testId="button-open-triage"
                >
                  <Activity size={17} /> Run triage
                </PrimaryButton>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Patients visited" value={today.length + 12} detail="+4 from yesterday" icon={Users} />
            <Metric label="Needs doctor review" value={urgent.length} detail="Yellow and red triage" icon={Bell} tone="orange" />
            <Metric label="Active referrals" value={referrals.filter((i) => i.status !== 'completed').length} detail="Across your villages" icon={Send} tone="red" />
            <Metric label="Pending sync" value={syncRecords.filter((i) => i.status === 'pending').length} detail="Device queue" icon={CloudOff} tone="cream" />
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.4fr_.8fr]">
            <div>
              <SectionTitle
                title="Today’s priority list"
                detail="Urgent yellow and red handovers with recorded vitals"
                action={
                  <button
                    onClick={() => setActiveTab('patients')}
                    className="text-xs font-bold text-[hsl(var(--primary))] hover:underline cursor-pointer"
                    data-testid="link-view-all-patients"
                  >
                    View all patients &rarr;
                  </button>
                }
              />
              <div className="surface overflow-hidden rounded-2xl">
                {urgent.slice(0, 4).map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    onSelect={() => {
                      setSelectedPatientId(patient.id);
                      setActiveTab('patients');
                    }}
                  />
                ))}
                {urgent.length === 0 && (
                  <EmptyState icon={CheckCircle2} title="No urgent cases" detail="Your priority list is clear." />
                )}
              </div>
            </div>

            <div>
              <SectionTitle title="Field Quick Actions" detail="Frontline clinical shortcuts" />
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('register')}
                  className="surface lift flex w-full items-center gap-3 rounded-2xl p-4 text-left cursor-pointer"
                  data-testid="link-quick-new-patient"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fce6d4] text-[#a25528]">
                    <FilePlus2 size={18} />
                  </span>
                  <span>
                    <strong className="block text-sm">New patient registration</strong>
                    <small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">
                      Capture info & initial vitals
                    </small>
                  </span>
                  <ArrowRight size={15} className="ml-auto text-[hsl(var(--muted-foreground))]" />
                </button>

                <button
                  onClick={() => setActiveTab('triage')}
                  className="surface lift flex w-full items-center gap-3 rounded-2xl p-4 text-left cursor-pointer"
                  data-testid="link-quick-symptom-check"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefed] text-[#236d68]">
                    <Activity size={18} />
                  </span>
                  <span>
                    <strong className="block text-sm">Run AI triage checklist</strong>
                    <small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">
                      Review vitals & red flags
                    </small>
                  </span>
                  <ArrowRight size={15} className="ml-auto text-[hsl(var(--muted-foreground))]" />
                </button>

                <button
                  onClick={() => setActiveTab('referrals')}
                  className="surface lift flex w-full items-center gap-3 rounded-2xl p-4 text-left cursor-pointer"
                  data-testid="link-quick-referrals"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe2de] text-[#a4382f]">
                    <Send size={18} />
                  </span>
                  <span>
                    <strong className="block text-sm">Referral status tracker</strong>
                    <small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">
                      Track hospital acceptance
                    </small>
                  </span>
                  <ArrowRight size={15} className="ml-auto text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle title="Frontline Care Continuity" detail="Resilient healthcare features" />
            <div className="grid gap-3 md:grid-cols-3">
              <Insight icon={Wifi} title="Low-connectivity operation" detail="Records, vitals and triage decisions persist on device until network reconnects." />
              <Insight icon={Zap} title="Decision Support System" detail="Standard vital thresholds guide safe escalation to PHC doctors." />
              <Insight icon={Send} title="Referral Handover Loop" detail="Follow each patient through emergency hospital acceptance and consultation." />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="mx-auto max-w-3xl animate-rise">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => setActiveTab('overview')}
                className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-foreground cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to overview
              </button>
              <h2 className="text-3xl font-bold tracking-[-.05em]">Register patient & capture vitals</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Capture basic identity details along with baseline vitals signs.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="surface rounded-2xl p-5 md:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--primary))] uppercase tracking-wider">1. Basic Demographic Info</h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold md:col-span-2">
                  Full Name
                  <input
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Lakshmi Devi"
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 outline-none"
                    data-testid="input-patient-name"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Age
                  <input
                    required
                    type="number"
                    min="0"
                    max="120"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    placeholder="Age in years"
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 outline-none"
                    data-testid="input-patient-age"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Gender
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 outline-none cursor-pointer"
                    data-testid="select-patient-gender"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Village
                  <select
                    value={registerForm.village}
                    onChange={(e) => setRegisterForm({ ...registerForm, village: e.target.value })}
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 outline-none cursor-pointer"
                    data-testid="select-patient-village"
                  >
                    <option>Kankipadu</option>
                    <option>Uppuluru</option>
                    <option>Kesarapalli</option>
                    <option>Gannavaram</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Phone Number
                  <input
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="Contact number"
                    className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 outline-none"
                    data-testid="input-patient-phone"
                  />
                </label>
                <label className="text-sm font-semibold md:col-span-2">
                  Chief Complaint / Symptom
                  <textarea
                    value={registerForm.condition}
                    onChange={(e) => setRegisterForm({ ...registerForm, condition: e.target.value })}
                    placeholder="Describe primary concern"
                    rows={2}
                    className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-3 outline-none"
                    data-testid="input-patient-concern"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-5">
              <h3 className="text-sm font-bold text-[hsl(var(--primary))] uppercase tracking-wider">2. Initial Vital Signs</h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Record baseline vitals signs measured in the field.</p>
              
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                <label className="text-xs font-semibold">
                  BP Systolic
                  <input
                    type="number"
                    value={registerForm.bpSystolic}
                    onChange={(e) => setRegisterForm({ ...registerForm, bpSystolic: e.target.value })}
                    className="focus-ring mt-1 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
                    placeholder="120"
                    data-testid="input-patient-bp-systolic"
                  />
                </label>
                <label className="text-xs font-semibold">
                  BP Diastolic
                  <input
                    type="number"
                    value={registerForm.bpDiastolic}
                    onChange={(e) => setRegisterForm({ ...registerForm, bpDiastolic: e.target.value })}
                    className="focus-ring mt-1 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
                    placeholder="80"
                    data-testid="input-patient-bp-diastolic"
                  />
                </label>
                <label className="text-xs font-semibold">
                  Blood Sugar (mg/dL)
                  <input
                    type="number"
                    value={registerForm.sugar}
                    onChange={(e) => setRegisterForm({ ...registerForm, sugar: e.target.value })}
                    className="focus-ring mt-1 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
                    placeholder="110"
                    data-testid="input-patient-sugar"
                  />
                </label>
                <label className="text-xs font-semibold">
                  SpO2 (%)
                  <input
                    type="number"
                    value={registerForm.spo2}
                    onChange={(e) => setRegisterForm({ ...registerForm, spo2: e.target.value })}
                    className="focus-ring mt-1 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
                    placeholder="98"
                    data-testid="input-patient-spo2"
                  />
                </label>
                <label className="text-xs font-semibold">
                  Heart Rate (bpm)
                  <input
                    type="number"
                    value={registerForm.heartRate}
                    onChange={(e) => setRegisterForm({ ...registerForm, heartRate: e.target.value })}
                    className="focus-ring mt-1 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
                    placeholder="75"
                    data-testid="input-patient-hr"
                  />
                </label>
                <label className="text-xs font-semibold">
                  Temp (°C)
                  <input
                    type="number"
                    step="0.1"
                    value={registerForm.temperature}
                    onChange={(e) => setRegisterForm({ ...registerForm, temperature: e.target.value })}
                    className="focus-ring mt-1 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
                    placeholder="37.0"
                    data-testid="input-patient-temp"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5">
              <p className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <CloudOff size={15} /> Saved locally if offline
              </p>
              <PrimaryButton type="submit" testId="button-save-patient">
                Save & Proceed to Triage <ArrowRight size={16} />
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'triage' && (
        <div className="mx-auto max-w-4xl animate-rise space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <button
                onClick={() => setActiveTab('overview')}
                className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-foreground cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to overview
              </button>
              <h2 className="text-3xl font-bold tracking-[-.05em]">Symptom triage & decision support</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Review recorded vitals and evaluate observed symptoms.
              </p>
            </div>
            <Badge tone="teal" icon={<Zap size={13} />}>
              Offline Decision Engine
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <div className="surface rounded-2xl p-5 md:p-6 space-y-5">
              <label className="block text-sm font-bold">
                Select Patient
                <select
                  value={triagePatientId}
                  onChange={(e) => {
                    setTriagePatientId(e.target.value);
                    setTriageSymptoms([]);
                    setTriageResult(null);
                  }}
                  className="focus-ring mt-2 h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 outline-none cursor-pointer"
                  data-testid="select-triage-patient"
                >
                  {patients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.id} ({item.village})
                    </option>
                  ))}
                </select>
              </label>

              {currentTriagePatient && (
                <div className="rounded-xl bg-[hsl(var(--muted))] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[hsl(var(--foreground))]">{currentTriagePatient.name}</span>
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{currentTriagePatient.village}</span>
                  </div>
                  <VitalsPills vitals={latestVital(currentTriagePatient)} compact />
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                  Observed Symptoms & Red Flags
                </p>
                <div className="mt-3 space-y-2">
                  {symptomOptions.map((symptom) => {
                    const isSelected = triageSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() =>
                          setTriageSymptoms((prev) =>
                            isSelected ? prev.filter((s) => s !== symptom) : [...prev, symptom]
                          )
                        }
                        className={`focus-ring flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'border-[#236d68] bg-[#dcefed] text-[#236d68]'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]'
                        }`}
                        data-testid={`button-symptom-${symptom.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {symptom}
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            isSelected ? 'border-[#236d68] bg-[#236d68] text-white' : 'border-[hsl(var(--input))]'
                          }`}
                        >
                          {isSelected && <Check size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <PrimaryButton onClick={handleRunTriage} testId="button-run-triage">
                Calculate Triage Outcome <ArrowRight size={16} />
              </PrimaryButton>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                triageResult
                  ? triageResult.severity === 'green'
                    ? 'border-[#a7d2b7] bg-[#e3f1e7]'
                    : triageResult.severity === 'yellow'
                    ? 'border-[#e4c477] bg-[#fff0cf]'
                    : 'border-[#e5aaa2] bg-[#fbe2de]'
                  : 'border-[hsl(var(--border))] bg-[#e7ece4]'
              }`}
            >
              {triageResult ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mono text-[10px] font-bold uppercase tracking-[.16em] opacity-70">
                        Triage result
                      </p>
                      <h3 className="mt-1 text-2xl font-bold">
                        {triageResult.severity === 'green'
                          ? 'Green · Home Care'
                          : triageResult.severity === 'yellow'
                          ? 'Yellow · Doctor Review Today'
                          : 'Red · Emergency Escalation'}
                      </h3>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/60">
                      {triageResult.severity === 'green' ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <AlertCircle size={24} />
                      )}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed">{triageResult.recommendation}</p>

                  <div className="rounded-xl bg-white/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.14em] opacity-70">Action protocol</p>
                    <p className="mt-1 text-lg font-bold">{triageResult.nextAction}</p>
                    {triageResult.severity === 'red' && (
                      <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-[#a4382f]">
                        <Phone size={14} className="mt-0.5 shrink-0" />
                        Call local ambulance / 108 and prepare hospital referral note.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {triageResult.severity === 'red' ? (
                      <PrimaryButton
                        onClick={() => setReferralPatientId(triagePatientId)}
                        variant="danger"
                        testId="button-create-referral-triage"
                      >
                        <Send size={15} /> Create Emergency Referral
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton
                        onClick={() => setActiveTab('overview')}
                        variant="primary"
                        testId="button-finish-triage"
                      >
                        <Check size={15} /> Return to Dashboard
                      </PrimaryButton>
                    )}
                    <PrimaryButton
                      onClick={() => {
                        setTriageResult(null);
                        setTriageSymptoms([]);
                      }}
                      variant="outline"
                      testId="button-reset-triage"
                    >
                      Run Again
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[380px] flex-col justify-center text-center">
                  <Activity size={32} className="mx-auto text-[hsl(var(--primary))]" />
                  <h3 className="mt-4 text-xl font-bold">Select symptoms to run triage</h3>
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] max-w-xs mx-auto">
                    Outcomes categorize severity into Green (home), Yellow (doctor visit), or Red (hospital referral).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="animate-rise space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-[-.05em]">Village patient register</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {patients.length} records registered with vital signs across local habitations.
              </p>
            </div>
            <PrimaryButton
              onClick={() => setActiveTab('register')}
              testId="button-register-from-patients"
            >
              <Plus size={16} /> Register New Patient
            </PrimaryButton>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
            <div className="surface overflow-hidden rounded-2xl">
              {patients.map((patient) => {
                const vital = latestVital(patient);
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`flex flex-col gap-2 border-b border-[hsl(var(--border))] p-4 last:border-0 hover:bg-[hsl(var(--muted))] cursor-pointer ${
                      selectedPatientId === patient.id ? 'bg-[#e7f1ed]' : ''
                    }`}
                    data-testid={`button-select-patient-${patient.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcefed] text-xs font-bold text-[#236d68]">
                          {initials(patient.name)}
                        </span>
                        <div>
                          <strong className="block text-sm">{patient.name}</strong>
                          <small className="text-xs text-[hsl(var(--muted-foreground))]">
                            {patient.id} · {patient.age} yrs · {patient.village}
                          </small>
                        </div>
                      </div>
                      <StatusBadge status={patient.triageStatus} />
                    </div>
                    <div className="pl-12">
                      <VitalsPills vitals={vital} compact />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="surface rounded-2xl p-5 md:p-6 space-y-6">
              {activeDetailPatient ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold">{activeDetailPatient.name}</h3>
                      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        Health ID: {activeDetailPatient.id} · {activeDetailPatient.age} yrs · {activeDetailPatient.gender} · {activeDetailPatient.village}
                      </p>
                    </div>
                    <StatusBadge status={activeDetailPatient.triageStatus} />
                  </div>

                  {/* Vitals Summary Grid in Patient Detail */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                      Latest Vital Signs
                    </h4>
                    <VitalsGrid vitals={latestVital(activeDetailPatient)} />
                  </div>

                  {/* Vitals History Table */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                      Vitals History Log
                    </h4>
                    <VitalsHistoryTable vitals={activeDetailPatient.vitals} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
                      <span className="text-[hsl(var(--muted-foreground))]">Primary Concern</span>
                      <strong className="mt-1 block text-sm">{activeDetailPatient.condition}</strong>
                    </div>
                    <div className="rounded-xl bg-[hsl(var(--muted))] p-3">
                      <span className="text-[hsl(var(--muted-foreground))]">Phone Contact</span>
                      <strong className="mt-1 block text-sm">{activeDetailPatient.phone}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-[hsl(var(--border))] pt-4">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                      Care Actions
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <PrimaryButton
                        onClick={() => {
                          setTriagePatientId(activeDetailPatient.id);
                          setActiveTab('triage');
                        }}
                        variant="primary"
                        testId="button-patient-triage"
                      >
                        <Activity size={15} /> Run Triage Checklist
                      </PrimaryButton>
                      <PrimaryButton
                        onClick={() => setReferralPatientId(activeDetailPatient.id)}
                        variant="danger"
                        testId="button-patient-referral"
                      >
                        <Send size={15} /> Create Referral
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={FileHeart}
                  title="Select a patient"
                  detail="Click a patient from the list to view their vitals and details."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <ReferralTrackerView
          referrals={referrals}
          patients={patients}
          onUpdateStatus={updateReferralStatus}
        />
      )}

      {activeTab === 'sync' && <SyncCenterView />}

      {referralTargetPatient && (
        <ReferralModal
          patient={referralTargetPatient}
          onClose={() => setReferralPatientId(null)}
        />
      )}
    </Shell>
  );
}
