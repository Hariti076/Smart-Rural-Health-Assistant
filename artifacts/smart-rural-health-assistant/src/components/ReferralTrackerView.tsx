import { Activity, Bell, Check, CheckCircle2, Send } from 'lucide-react';
import type { Patient, Referral } from '../data';
import { formatDate, latestVital } from '../context/StoreContext';
import { Badge, EmptyState, Metric, PrimaryButton } from './Common';
import { VitalsPills } from './Vitals';

export function ReferralTrackerView({
  referrals,
  patients,
  onUpdateStatus,
}: {
  referrals: Referral[];
  patients: Patient[];
  onUpdateStatus: (id: string, status: Referral['status']) => void;
}) {
  const tone = (status: Referral['status']) =>
    status === 'completed' ? 'green' : status === 'accepted' ? 'teal' : 'yellow';

  return (
    <div className="animate-rise space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Pending Handover"
          value={referrals.filter((r) => r.status === 'pending').length}
          detail="Awaiting hospital acceptance"
          icon={Bell}
          tone="orange"
        />
        <Metric
          label="Accepted & In Transit"
          value={referrals.filter((r) => r.status === 'accepted').length}
          detail="Patient en route to facility"
          icon={Activity}
          tone="teal"
        />
        <Metric
          label="Care Loop Closed"
          value={referrals.filter((r) => r.status === 'completed').length}
          detail="Completed consultations"
          icon={CheckCircle2}
          tone="cream"
        />
      </div>

      <div className="space-y-3">
        {referrals.map((referral) => {
          const patient = patients.find((item) => item.id === referral.patientId);
          const vital = latestVital(patient);
          return (
            <div key={referral.id} className="surface rounded-2xl p-4 md:p-5">
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe2de] text-[#a4382f]">
                  <Send size={18} />
                </span>
                <div className="min-w-[180px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold">{patient?.name ?? referral.patientId}</h3>
                    <Badge tone={tone(referral.status)}>{referral.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {referral.hospital} · Raised {formatDate(referral.createdAt)} by {referral.assignedBy}
                  </p>
                  <p className="mt-3 text-sm">{referral.reason}</p>
                  {referral.notes && (
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] italic">
                      Note: {referral.notes}
                    </p>
                  )}
                  {/* Vitals Snapshot */}
                  <div className="mt-3 rounded-lg bg-[hsl(var(--muted))] p-2">
                    <p className="mb-1 text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">Latest Vitals</p>
                    <VitalsPills vitals={vital} compact />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {referral.status === 'pending' && (
                    <PrimaryButton
                      onClick={() => onUpdateStatus(referral.id, 'accepted')}
                      variant="soft"
                      testId={`button-accept-referral-${referral.id}`}
                    >
                      <Check size={15} /> Mark accepted
                    </PrimaryButton>
                  )}
                  {referral.status === 'accepted' && (
                    <PrimaryButton
                      onClick={() => onUpdateStatus(referral.id, 'completed')}
                      variant="primary"
                      testId={`button-complete-referral-${referral.id}`}
                    >
                      <CheckCircle2 size={15} /> Mark completed
                    </PrimaryButton>
                  )}
                  {referral.status === 'completed' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#266b4b]">
                      <CheckCircle2 size={15} /> Loop closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {referrals.length === 0 && (
          <div className="surface rounded-2xl">
            <EmptyState
              icon={Send}
              title="No referrals active"
              detail="Referrals created will show up here without page reloading."
            />
          </div>
        )}
      </div>
    </div>
  );
}
