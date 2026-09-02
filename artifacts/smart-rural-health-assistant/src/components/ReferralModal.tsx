import { useState, type FormEvent } from 'react';
import { Send, X } from 'lucide-react';
import { hospitals, roles, type Patient, type Referral } from '../data';
import { isRoleId, latestVital, roleById, uid, useStore } from '../context/StoreContext';
import { PrimaryButton } from './Common';
import { VitalsPills } from './Vitals';

export function ReferralModal({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  const { currentRole, setPatients, setReferrals, setSyncRecords } = useStore();
  const [form, setForm] = useState({
    reason: '',
    referredTo: hospitals[0],
    notes: '',
  });

  const vital = latestVital(patient);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const activeRole = isRoleId(currentRole) ? roleById(currentRole) : roles[0];
    const referral: Referral = {
      id: uid('R'),
      patientId: patient.id,
      hospital: form.referredTo,
      reason: form.reason,
      notes: form.notes,
      status: 'pending',
      assignedBy: activeRole.name,
      createdAt: now,
    };
    setReferrals((items) => [referral, ...items]);
    setPatients((items) =>
      items.map((item) =>
        item.id === patient.id
          ? {
              ...item,
              referrals: [referral, ...(item.referrals ?? [])],
              triageStatus: 'red',
              triageRecommendation: 'Emergency referral created',
            }
          : item
      )
    );
    setSyncRecords((items) => [
      { id: uid('S'), type: 'referral', label: `${patient.name} referral`, status: 'pending', createdAt: now },
      ...items,
    ]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#183f3a]/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-modal-title"
    >
      <form
        onSubmit={save}
        className="surface w-full max-w-lg rounded-2xl p-5 shadow-2xl md:p-7 animate-rise"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">
              Referral Desk
            </p>
            <h2 id="referral-modal-title" className="mt-2 text-2xl font-bold tracking-[-.04em]">
              Create referral
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Attached to {patient.name}'s medical record.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] cursor-pointer"
            aria-label="Close referral form"
            data-testid="button-close-referral-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Vitals snapshot in referral dialog */}
        <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
            Patient Vitals Snapshot
          </p>
          <VitalsPills vitals={vital} compact />
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">
            Patient Name
            <input
              value={patient.name}
              readOnly
              className="mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--muted))] px-3 outline-none"
              data-testid="input-referral-patient-name"
            />
          </label>
          <label className="block text-sm font-semibold">
            Reason for referral
            <textarea
              required
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              rows={3}
              placeholder="Why does this patient need referral?"
              className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-3 outline-none"
              data-testid="input-referral-reason"
            />
          </label>
          <label className="block text-sm font-semibold">
            Referred To Hospital
            <select
              value={form.referredTo}
              onChange={(event) => setForm({ ...form, referredTo: event.target.value })}
              className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 outline-none cursor-pointer"
              data-testid="select-referral-hospital"
            >
              {hospitals.map((hospital) => (
                <option key={hospital} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Handover Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={2}
              placeholder="Add handover notes for the receiving care team"
              className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-3 outline-none"
              data-testid="input-referral-notes"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[hsl(var(--border))] pt-5">
          <PrimaryButton
            type="button"
            variant="outline"
            onClick={onClose}
            testId="button-cancel-referral"
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            type="submit"
            variant="danger"
            testId="button-save-referral"
          >
            <Send size={16} /> Save referral
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
