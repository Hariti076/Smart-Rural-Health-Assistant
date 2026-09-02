import { useState } from 'react';
import {
  AlertCircle, BarChart3, Check, CheckCircle2, CloudOff,
  FileHeart, LayoutDashboard, Send, Stethoscope, Users, Wifi,
} from 'lucide-react';
import type { Referral } from '../data';
import { formatDate, latestVital, roleById, useStore } from '../context/StoreContext';
import {
  Badge, Metric, type NavItem, SectionTitle, Shell,
} from '../components/Common';
import { ReferralTrackerView } from '../components/ReferralTrackerView';
import { SyncCenterView } from '../components/SyncCenterView';
import { VitalsPills } from '../components/Vitals';

export function AdminDashboard() {
  const role = roleById('admin');
  const { patients, referrals, setReferrals, consultations, syncRecords } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'analytics' | 'sync'>('overview');

  const totals = {
    green: patients.filter((p) => p.triageStatus === 'green').length,
    yellow: patients.filter((p) => p.triageStatus === 'yellow').length,
    red: patients.filter((p) => p.triageStatus === 'red').length,
  };
  const completedReferrals = referrals.filter((r) => r.status === 'completed').length;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'District Overview', icon: LayoutDashboard },
    { id: 'referrals', label: 'Referrals & Continuity', icon: Send },
    { id: 'analytics', label: 'Triage Mix', icon: BarChart3 },
    { id: 'sync', label: 'Data Freshness', icon: CloudOff },
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
      title="District Command Overview"
      eyebrow="District Administrator / Krishna District"
    >
      {activeTab === 'overview' && (
        <div className="animate-rise space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Registered Population" value={patients.length} detail="Active field records" icon={Users} />
            <Metric label="Doctor Consultations" value={consultations.length} detail="Clinical reviews closed" icon={Stethoscope} />
            <Metric label="Completed Referrals" value={completedReferrals} detail={`${referrals.length} total referrals`} icon={CheckCircle2} />
            <Metric label="Awaiting Action" value={totals.yellow + totals.red} detail="Yellow + red triages" icon={AlertCircle} tone="orange" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <div className="surface rounded-2xl p-5 md:p-7">
              <SectionTitle title="District Triage Mix" detail="Risk distribution across field consoles" />
              <div className="mt-6 flex items-center gap-7">
                <div
                  className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#c95c50 0 ${totals.red * 15}%, #d79d3c ${totals.red * 15}% ${(totals.red + totals.yellow) * 15}%, #4e9b6e ${(totals.red + totals.yellow) * 15}% 100%)`,
                  }}
                >
                  <div className="flex h-22 w-22 flex-col items-center justify-center rounded-full bg-[hsl(var(--card))]">
                    <span className="mono text-xl font-bold">{patients.length}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">records</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ['#4e9b6e', 'Green · Home Care', totals.green],
                    ['#d79d3c', 'Yellow · Teleconsult', totals.yellow],
                    ['#c95c50', 'Red · Emergency Referral', totals.red],
                  ].map(([color, label, value]) => (
                    <div key={label as string} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color as string }} />
                      <span className="w-36 font-semibold">{label}</span>
                      <strong className="mono">{value as number}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface rounded-2xl p-5 md:p-7">
              <SectionTitle title="Network Health" detail="Signals across PHCs and field workers" />
              <div className="space-y-3">
                {[
                  { icon: Wifi, label: 'Connected Care Points', value: '18 / 21 PHCs', tone: 'green' },
                  { icon: Send, label: 'Active Referrals in Transit', value: referrals.filter((r) => r.status !== 'completed').length, tone: 'yellow' },
                  { icon: CloudOff, label: 'Records In Local Device Queues', value: syncRecords.filter((s) => s.status === 'pending').length, tone: 'orange' },
                ].map(({ icon: Icon, label, value, tone }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl bg-[hsl(var(--muted))] p-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        tone === 'green' ? 'bg-[#dcefed] text-[#236d68]' : tone === 'yellow' ? 'bg-[#fff0cf] text-[#8c5a16]' : 'bg-[#fce6d4] text-[#a25528]'
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{label}</span>
                    <strong className="mono text-sm">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionTitle title="Recent Clinical Activity & Vitals Context" detail="Consultation records closed in the PHC" />
            <div className="surface overflow-hidden rounded-2xl">
              {consultations.slice(0, 5).map((consultation) => {
                const patient = patients.find((p) => p.id === consultation.patientId);
                const vital = latestVital(patient);
                return (
                  <div
                    key={consultation.id}
                    className="flex flex-col gap-2 border-b border-[hsl(var(--border))] p-4 last:border-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dcefed] text-[#236d68]">
                          <FileHeart size={17} />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{patient?.name ?? consultation.patientId}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{consultation.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {formatDate(consultation.createdAt)}
                        </span>
                        <Badge tone="green" icon={<Check size={12} />}>
                          Closed
                        </Badge>
                      </div>
                    </div>
                    <div className="pl-12">
                      <VitalsPills vitals={vital} compact />
                    </div>
                  </div>
                );
              })}
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

      {activeTab === 'analytics' && (
        <div className="animate-rise space-y-6">
          <SectionTitle title="District Disease Breakdown" detail="Aggregated clinical findings" />
          <div className="surface rounded-2xl p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Hypertension Cases</span>
                <p className="mono mt-2 text-2xl font-bold">14</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Diabetes Mellitus</span>
                <p className="mono mt-2 text-2xl font-bold">9</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Respiratory Illness</span>
                <p className="mono mt-2 text-2xl font-bold">6</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sync' && <SyncCenterView />}
    </Shell>
  );
}
