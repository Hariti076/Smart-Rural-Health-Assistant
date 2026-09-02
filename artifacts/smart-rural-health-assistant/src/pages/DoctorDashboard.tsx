import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle, BarChart3, Bell, Check, CheckCircle2,
  CloudOff, FileHeart, Filter, Save, Search, Send, Stethoscope, Users,
} from 'lucide-react';
import type { Consultation, Patient, Prescription, Referral, Role, Visit, Vital } from '../data';
import {
  abnormalVitals, formatDate, initials, latestVital, patientRisk,
  riskLabel, roleById, sameDay, uid, useStore,
} from '../context/StoreContext';
import {
  Badge, EmptyState, Metric, type NavItem, PrimaryButton,
  SectionTitle, Shell, StatusBadge,
} from '../components/Common';
import { ReferralModal } from '../components/ReferralModal';
import { ReferralTrackerView } from '../components/ReferralTrackerView';
import { SyncCenterView } from '../components/SyncCenterView';
import { VitalsGrid, VitalsHistoryTable, VitalsPills } from '../components/Vitals';

export function DoctorDashboard() {
  const role = roleById('doctor');
  const {
    patients,
    consultations,
    referrals, setReferrals,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'ehr' | 'queue' | 'referrals' | 'analytics' | 'sync'>('ehr');
  const [query, setQuery] = useState('');
  const [village, setVillage] = useState('all');
  const [risk, setRisk] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(patients[0]?.id ?? null);
  const [referralPatientId, setReferralPatientId] = useState<string | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedId);
  const referralTargetPatient = patients.find((p) => p.id === referralPatientId);

  const villages = useMemo(
    () => Array.from(new Set(patients.map((p) => p.village))).sort(),
    [patients]
  );

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesQuery = `${patient.name} ${patient.id}`.toLowerCase().includes(query.toLowerCase());
      const matchesVillage = village === 'all' || patient.village === village;
      const matchesRisk = risk === 'all' || patientRisk(patient) === risk;
      return matchesQuery && matchesVillage && matchesRisk;
    });
  }, [patients, query, village, risk]);

  const appointments = patients.filter((patient) => patient.visits?.some((visit) => sameDay(visit.date))).length;
  const critical = patients.filter(abnormalVitals).length;
  const pendingReviews = patients.filter(
    (p) => (p.triageStatus === 'yellow' || p.triageStatus === 'red') && !consultations.some((c) => c.patientId === p.id)
  ).length;

  const diseaseCounts = useMemo(
    () =>
      Object.entries(
        patients
          .flatMap((patient) => patient.history?.diseases ?? [])
          .reduce<Record<string, number>>((counts, disease) => ({ ...counts, [disease]: (counts[disease] ?? 0) + 1 }), {})
      ).sort(([, a], [, b]) => b - a),
    [patients]
  );

  const villageCounts = useMemo(
    () =>
      Object.entries(
        patients.reduce<Record<string, number>>((counts, p) => ({ ...counts, [p.village]: (counts[p.village] ?? 0) + 1 }), {})
      ).sort(([, a], [, b]) => b - a),
    [patients]
  );

  const incomingHandovers = patients.filter(
    (p) => p.triageStatus === 'yellow' || p.triageStatus === 'red'
  );

  const navItems: NavItem[] = [
    { id: 'ehr', label: 'EHR Workspace', icon: Stethoscope },
    { id: 'queue', label: 'Incoming Queue', icon: Bell },
    { id: 'referrals', label: 'Referral Tracker', icon: Send },
    { id: 'analytics', label: 'District Analytics', icon: BarChart3 },
    { id: 'sync', label: 'Sync Center', icon: CloudOff },
  ];

  const updateReferralStatus = (id: string, status: Referral['status']) => {
    setReferrals((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <Shell
      role={role}
      items={navItems}
      activeTab={activeTab}
      onSelectTab={(tab) => setActiveTab(tab as typeof activeTab)}
      title="Doctor EHR Workspace"
      eyebrow="Medical officer / Vijayawada Rural PHC"
      headerAction={
        <PrimaryButton
          onClick={() => setReferralPatientId(selectedId ?? patients[0]?.id)}
          variant="outline"
          testId="button-create-referral-header"
        >
          <Send size={15} /> Create Referral
        </PrimaryButton>
      }
    >
      {activeTab === 'ehr' && (
        <div className="animate-rise space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Total Registered" value={patients.length} detail="District health cohort" icon={Users} />
            <Metric label="Today's Appointments" value={appointments} detail="Scheduled PHC visits" icon={Stethoscope} />
            <Metric label="Critical Vital Alerts" value={critical} detail="Abnormal vitals flagged" icon={AlertCircle} tone="red" />
            <Metric label="Pending Handovers" value={pendingReviews} detail="Yellow & red triage" icon={Bell} tone="orange" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
            <section className="space-y-4">
              <SectionTitle
                title="Patient Directory"
                detail={`Showing ${filteredPatients.length} of ${patients.length} patients with vitals`}
              />
              <div className="surface rounded-2xl p-4">
                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
                  <label className="relative block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or Health ID"
                      className="focus-ring h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-10 pr-3 text-sm outline-none"
                      data-testid="input-doctor-search"
                    />
                  </label>
                  <label className="relative">
                    <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="focus-ring h-11 w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 pr-3 text-sm outline-none cursor-pointer"
                      data-testid="select-doctor-village"
                    >
                      <option value="all">All villages</option>
                      {villages.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <select
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    className="focus-ring h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none cursor-pointer"
                    data-testid="select-doctor-risk"
                  >
                    <option value="all">All risk levels</option>
                    <option value="green">Green · Normal</option>
                    <option value="yellow">Yellow · Warning</option>
                    <option value="red">Red · Critical</option>
                  </select>
                </div>

                <div className="mt-4 space-y-2">
                  {filteredPatients.map((patient) => {
                    const patientRiskValue = patientRisk(patient);
                    const vital = latestVital(patient);
                    return (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => setSelectedId(patient.id)}
                        className={`focus-ring flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition cursor-pointer ${
                          selectedId === patient.id
                            ? 'border-[#236d68] bg-[#e7f1ed]'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]'
                        }`}
                        data-testid={`button-doctor-patient-${patient.id}`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcefed] text-xs font-bold text-[#236d68]">
                              {initials(patient.name)}
                            </span>
                            <div>
                              <strong className="block truncate text-sm">{patient.name}</strong>
                              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                                {patient.id} · {patient.age} yrs · {patient.village}
                              </span>
                            </div>
                          </div>
                          <Badge tone={patientRiskValue === 'red' ? 'red' : patientRiskValue === 'yellow' ? 'yellow' : 'green'}>
                            {riskLabel(patientRiskValue)}
                          </Badge>
                        </div>
                        <div className="pl-10.5">
                          <VitalsPills vitals={vital} compact />
                        </div>
                      </button>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <EmptyState icon={Search} title="No records match" detail="Try adjusting your search query or filters." />
                  )}
                </div>
              </div>
            </section>

            <section>
              {selectedPatient ? (
                <DoctorEhrEditor
                  patient={selectedPatient}
                  doctorRole={role}
                  onOpenReferral={() => setReferralPatientId(selectedPatient.id)}
                />
              ) : (
                <div className="surface flex min-h-[420px] items-center justify-center rounded-2xl">
                  <EmptyState icon={FileHeart} title="Select a patient" detail="Their full electronic health record and vitals will open here." />
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="animate-rise space-y-6">
          <SectionTitle
            title="Incoming Field Handovers"
            detail="Yellow and Red urgency triages sent by village ASHA workers with complete vitals"
          />
          <div className="surface overflow-hidden rounded-2xl">
            {incomingHandovers.map((patient) => {
              const vital = latestVital(patient);
              return (
                <div
                  key={patient.id}
                  className="flex flex-col gap-3 border-b border-[hsl(var(--border))] p-4 last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcefed] text-xs font-bold text-[#236d68]">
                        {initials(patient.name)}
                      </span>
                      <div>
                        <strong className="block text-sm">{patient.name}</strong>
                        <small className="text-xs text-[hsl(var(--muted-foreground))]">
                          {patient.id} · {patient.village} · Last Visit: {formatDate(patient.lastVisit)}
                        </small>
                        <p className="mt-0.5 text-xs font-semibold text-[#8c5a16]">
                          Handover reason: {patient.triageRecommendation || patient.condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={patient.triageStatus} />
                      <PrimaryButton
                        onClick={() => {
                          setSelectedId(patient.id);
                          setActiveTab('ehr');
                        }}
                        variant="soft"
                        testId={`button-review-ehr-${patient.id}`}
                      >
                        Open EHR Record
                      </PrimaryButton>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[hsl(var(--muted))] p-2.5">
                    <p className="mb-1 text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">Field Vitals</p>
                    <VitalsPills vitals={vital} />
                  </div>
                </div>
              );
            })}
            {incomingHandovers.length === 0 && (
              <EmptyState icon={CheckCircle2} title="Queue is clear" detail="No new yellow or red handovers need review." />
            )}
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

      {activeTab === 'analytics' && (
        <div className="animate-rise grid gap-6 lg:grid-cols-3">
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[hsl(var(--primary))]" />
              <h3 className="text-sm font-bold">Prevalent Conditions</h3>
            </div>
            <div className="mt-4 space-y-3">
              {diseaseCounts.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <span className="flex-1">{name}</span>
                  <strong className="mono">{count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-[#a4382f]" />
              <h3 className="text-sm font-bold">Critical Risk Patients</h3>
            </div>
            <p className="mono mt-5 text-4xl font-bold text-[#a4382f]">
              {patients.filter((p) => patientRisk(p) === 'red' || abnormalVitals(p)).length}
            </p>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              Patients flagged with red triage or hypertensive/glycemic alerts.
            </p>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[hsl(var(--primary))]" />
              <h3 className="text-sm font-bold">Village Coverage</h3>
            </div>
            <div className="mt-4 space-y-3">
              {villageCounts.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <span className="flex-1">{name}</span>
                  <strong className="mono">{count} patients</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export function DoctorEhrEditor({
  patient,
  doctorRole,
  onOpenReferral,
}: {
  patient: Patient;
  doctorRole: Role;
  onOpenReferral: () => void;
}) {
  const { consultations, setConsultations, setPatients, setSyncRecords } = useStore();
  const previousVisit = patient.visits?.[0];
  const previousConsultation = consultations.find((item) => item.patientId === patient.id);
  const vital = latestVital(patient);

  const [form, setForm] = useState({
    symptoms: previousVisit?.symptoms ?? patient.condition,
    diagnosis: previousVisit?.diagnosis ?? previousConsultation?.diagnosis ?? '',
    notes: previousVisit?.notes ?? previousConsultation?.notes ?? '',
    medicineName: previousVisit?.prescription?.medicineName ?? '',
    dosage: previousVisit?.prescription?.dosage ?? '',
    duration: previousVisit?.prescription?.duration ?? '',
    bpSystolic: vital?.bpSystolic?.toString() ?? '120',
    bpDiastolic: vital?.bpDiastolic?.toString() ?? '80',
    sugar: vital?.sugar?.toString() ?? '110',
    heartRate: vital?.heartRate?.toString() ?? '75',
    spo2: vital?.spo2?.toString() ?? '98',
    temperature: vital?.temperature?.toString() ?? '37.0',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      symptoms: previousVisit?.symptoms ?? patient.condition,
      diagnosis: previousVisit?.diagnosis ?? previousConsultation?.diagnosis ?? '',
      notes: previousVisit?.notes ?? previousConsultation?.notes ?? '',
      medicineName: previousVisit?.prescription?.medicineName ?? '',
      dosage: previousVisit?.prescription?.dosage ?? '',
      duration: previousVisit?.prescription?.duration ?? '',
      bpSystolic: vital?.bpSystolic?.toString() ?? '120',
      bpDiastolic: vital?.bpDiastolic?.toString() ?? '80',
      sugar: vital?.sugar?.toString() ?? '110',
      heartRate: vital?.heartRate?.toString() ?? '75',
      spo2: vital?.spo2?.toString() ?? '98',
      temperature: vital?.temperature?.toString() ?? '37.0',
    });
    setSaved(false);
  }, [patient.id]);

  const alerts = [
    ...(vital && (vital.bpSystolic >= 140 || vital.bpDiastolic >= 90) ? ['Hypertension Risk Alert'] : []),
    ...(vital && vital.sugar >= 200 ? ['Diabetes High Glucose Risk'] : []),
    ...(vital && vital.spo2 < 94 ? ['Low SpO2 Hypoxia Alert'] : []),
    ...(vital && vital.temperature >= 38.0 ? ['High Fever Alert'] : []),
  ];

  const handleSaveVisit = (event: FormEvent) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const prescription: Prescription = {
      medicineName: form.medicineName || 'None prescribed',
      dosage: form.dosage || '—',
      duration: form.duration || '—',
    };
    const visit: Visit = {
      id: uid('V'),
      date: now,
      symptoms: form.symptoms,
      diagnosis: form.diagnosis,
      notes: form.notes,
      prescription,
      doctor: doctorRole.name,
    };
    const consultation: Consultation = {
      id: previousConsultation?.id ?? uid('C'),
      patientId: patient.id,
      doctorId: doctorRole.name,
      diagnosis: form.diagnosis,
      prescription: `${prescription.medicineName} (${prescription.dosage}, ${prescription.duration})`,
      notes: form.notes,
      createdAt: now,
    };

    const newVital: Vital = {
      recordedAt: now,
      bpSystolic: Number(form.bpSystolic) || (vital?.bpSystolic ?? 120),
      bpDiastolic: Number(form.bpDiastolic) || (vital?.bpDiastolic ?? 80),
      sugar: Number(form.sugar) || (vital?.sugar ?? 110),
      heartRate: Number(form.heartRate) || (vital?.heartRate ?? 75),
      spo2: Number(form.spo2) || (vital?.spo2 ?? 98),
      temperature: Number(form.temperature) || (vital?.temperature ?? 37.0),
    };

    setPatients((items) =>
      items.map((item) =>
        item.id === patient.id
          ? {
              ...item,
              condition: form.symptoms || form.diagnosis || item.condition,
              lastVisit: now,
              triageRecommendation: 'Doctor consultation completed',
              vitals: [newVital, ...(item.vitals ?? [])],
              visits: [visit, ...(item.visits ?? [])],
            }
          : item
      )
    );

    setConsultations((items) =>
      previousConsultation
        ? items.map((item) => (item.id === previousConsultation.id ? consultation : item))
        : [consultation, ...items]
    );

    setSyncRecords((items) => [
      { id: uid('S'), type: 'visit', label: `${patient.name} consultation record`, status: 'pending', createdAt: now },
      ...items,
    ]);

    setSaved(true);
  };

  return (
    <section className="surface rounded-2xl p-5 md:p-6 space-y-6" aria-label={`EHR for ${patient.name}`} data-testid={`panel-ehr-${patient.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">
            Electronic Health Record
          </p>
          <h2 className="mt-1 text-2xl font-bold">{patient.name}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            ID {patient.id} · {patient.age} yrs · {patient.gender} · {patient.village}
          </p>
        </div>
        <PrimaryButton onClick={onOpenReferral} variant="danger" testId="button-ehr-referral">
          <Send size={14} /> Referral
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone={patientRisk(patient) === 'red' ? 'red' : patientRisk(patient) === 'yellow' ? 'yellow' : 'green'}>
          {riskLabel(patientRisk(patient))}
        </Badge>
        <Badge tone="neutral">{patient.condition}</Badge>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((alert) => (
            <div
              key={alert}
              className="flex items-center gap-2 rounded-xl border border-[#e5aaa2] bg-[#fbe2de] px-3 py-2 text-xs font-bold text-[#a4382f]"
            >
              <AlertCircle size={15} /> {alert}
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Vitals Section */}
      <div className="border-t border-[hsl(var(--border))] pt-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
          Current Vital Signs
        </h3>
        <VitalsGrid vitals={vital} />
      </div>

      {/* Historical Vitals Section */}
      <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
          Vitals Trend & Log
        </h3>
        <VitalsHistoryTable vitals={patient.vitals} />
      </div>

      <form onSubmit={handleSaveVisit} className="border-t border-[hsl(var(--border))] pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Clinical Assessment & Visit Entry</h3>
          {saved && <Badge tone="green" icon={<Check size={12} />}>Saved locally</Badge>}
        </div>

        {/* Update Vitals in Visit */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.5)] p-3">
          <p className="mb-2 text-xs font-semibold text-[hsl(var(--foreground))]">Record New Vital Signs for this Visit</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              BP Sys
              <input
                value={form.bpSystolic}
                onChange={(e) => setForm({ ...form, bpSystolic: e.target.value })}
                className="focus-ring mt-1 h-8 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 text-xs outline-none"
              />
            </label>
            <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              BP Dia
              <input
                value={form.bpDiastolic}
                onChange={(e) => setForm({ ...form, bpDiastolic: e.target.value })}
                className="focus-ring mt-1 h-8 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 text-xs outline-none"
              />
            </label>
            <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              Sugar
              <input
                value={form.sugar}
                onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                className="focus-ring mt-1 h-8 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 text-xs outline-none"
              />
            </label>
            <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              SpO2 %
              <input
                value={form.spo2}
                onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                className="focus-ring mt-1 h-8 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 text-xs outline-none"
              />
            </label>
            <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              Pulse
              <input
                value={form.heartRate}
                onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                className="focus-ring mt-1 h-8 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 text-xs outline-none"
              />
            </label>
            <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              Temp °C
              <input
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                className="focus-ring mt-1 h-8 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 text-xs outline-none"
              />
            </label>
          </div>
        </div>

        <label className="block text-xs font-semibold">
          Working Diagnosis
          <input
            required
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            placeholder="e.g. Febrile illness / Hypertension stage 1"
            className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none"
            data-testid="input-ehr-diagnosis"
          />
        </label>

        <label className="block text-xs font-semibold">
          Clinical Handover Notes
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="Advice for ASHA worker follow-up"
            className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-3 text-sm outline-none"
            data-testid="input-ehr-notes"
          />
        </label>

        <div>
          <p className="text-xs font-semibold">Prescription (Medicine · Dosage · Duration)</p>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
            <input
              value={form.medicineName}
              onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
              placeholder="Medicine Name"
              className="focus-ring h-10 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-xs outline-none"
              data-testid="input-ehr-medicine"
            />
            <input
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="Dosage (e.g. 500mg BD)"
              className="focus-ring h-10 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-xs outline-none"
              data-testid="input-ehr-dosage"
            />
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="Duration (e.g. 5 days)"
              className="focus-ring h-10 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-xs outline-none"
              data-testid="input-ehr-duration"
            />
          </div>
        </div>

        <PrimaryButton type="submit" testId="button-save-ehr">
          <Save size={15} /> Save Visit & Vitals to Record
        </PrimaryButton>
      </form>
    </section>
  );
}
