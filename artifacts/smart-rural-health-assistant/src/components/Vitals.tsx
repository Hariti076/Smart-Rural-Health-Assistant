import { Activity, Droplets, Heart, HeartPulse, Thermometer } from 'lucide-react';
import type { Vital } from '../data';
import { formatDate } from '../context/StoreContext';

/**
 * Reusable Vitals Pills Chip Component
 * Used in lists, rows, summary cards, and triage panels
 */
export function VitalsPills({ vitals, compact = false }: { vitals?: Vital; compact?: boolean }) {
  if (!vitals) {
    return <span className="text-[11px] text-[hsl(var(--muted-foreground))] italic">No vitals recorded</span>;
  }

  const isBpHdr = vitals.bpSystolic >= 140 || vitals.bpDiastolic >= 90;
  const isSugarHigh = vitals.sugar >= 200;
  const isSpo2Low = vitals.spo2 < 94;
  const isFever = vitals.temperature >= 38.0;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'}`} data-testid="vitals-pills">
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${isBpHdr ? 'bg-[#fbe2de] text-[#a4382f]' : 'bg-[#e7f1ed] text-[#236d68]'}`}>
        <Heart size={12} /> BP: {vitals.bpSystolic}/{vitals.bpDiastolic}
      </span>
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${isSugarHigh ? 'bg-[#fbe2de] text-[#a4382f]' : 'bg-[#fff0cf] text-[#8c5a16]'}`}>
        <Droplets size={12} /> Sugar: {vitals.sugar}
      </span>
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${isSpo2Low ? 'bg-[#fbe2de] text-[#a4382f]' : 'bg-[#dcefed] text-[#236d68]'}`}>
        <Activity size={12} /> SpO2: {vitals.spo2}%
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 font-semibold text-[hsl(var(--foreground))]">
        <HeartPulse size={12} /> {vitals.heartRate} bpm
      </span>
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${isFever ? 'bg-[#fbe2de] text-[#a4382f]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'}`}>
        <Thermometer size={12} /> {vitals.temperature}°C
      </span>
    </div>
  );
}

/**
 * Reusable Vitals Grid Cards Component
 * Shows clinical metric tiles with live status indicators
 */
export function VitalsGrid({ vitals }: { vitals?: Vital }) {
  if (!vitals) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        No vital signs recorded for this patient yet.
      </div>
    );
  }

  const bpStatus = vitals.bpSystolic >= 140 || vitals.bpDiastolic >= 90 ? 'High (Hypertension)' : vitals.bpSystolic >= 120 ? 'Elevated' : 'Normal';
  const sugarStatus = vitals.sugar >= 200 ? 'High (Hyperglycemia)' : vitals.sugar >= 140 ? 'Elevated' : 'Normal';
  const spo2Status = vitals.spo2 < 94 ? 'Low (Hypoxia Alert)' : vitals.spo2 < 96 ? 'Borderline' : 'Normal';
  const hrStatus = vitals.heartRate > 100 ? 'High' : vitals.heartRate < 60 ? 'Low' : 'Normal';
  const tempStatus = vitals.temperature >= 38.0 ? 'Fever Alert' : vitals.temperature > 37.5 ? 'Mild Warm' : 'Normal';

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" data-testid="vitals-grid">
      <div className={`rounded-xl border p-3 ${vitals.bpSystolic >= 140 ? 'border-[#e5aaa2] bg-[#fbe2de]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1"><Heart size={13} className="text-[#a4382f]" /> Blood Pressure</span>
        </div>
        <p className="mono mt-1.5 text-lg font-bold">{vitals.bpSystolic}/{vitals.bpDiastolic} <span className="text-[11px] font-normal opacity-70">mmHg</span></p>
        <span className={`mt-1 inline-block text-[10px] font-bold ${vitals.bpSystolic >= 140 ? 'text-[#a4382f]' : 'text-[#266b4b]'}`}>{bpStatus}</span>
      </div>

      <div className={`rounded-xl border p-3 ${vitals.sugar >= 200 ? 'border-[#e5aaa2] bg-[#fbe2de]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1"><Droplets size={13} className="text-[#8c5a16]" /> Blood Sugar</span>
        </div>
        <p className="mono mt-1.5 text-lg font-bold">{vitals.sugar} <span className="text-[11px] font-normal opacity-70">mg/dL</span></p>
        <span className={`mt-1 inline-block text-[10px] font-bold ${vitals.sugar >= 200 ? 'text-[#a4382f]' : 'text-[#8c5a16]'}`}>{sugarStatus}</span>
      </div>

      <div className={`rounded-xl border p-3 ${vitals.spo2 < 94 ? 'border-[#e5aaa2] bg-[#fbe2de]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1"><Activity size={13} className="text-[#236d68]" /> SpO2 Oxygen</span>
        </div>
        <p className="mono mt-1.5 text-lg font-bold">{vitals.spo2}%</p>
        <span className={`mt-1 inline-block text-[10px] font-bold ${vitals.spo2 < 94 ? 'text-[#a4382f]' : 'text-[#266b4b]'}`}>{spo2Status}</span>
      </div>

      <div className={`rounded-xl border p-3 ${vitals.heartRate > 100 || vitals.heartRate < 60 ? 'border-[#e4c477] bg-[#fff0cf]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1"><HeartPulse size={13} className="text-[#236d68]" /> Pulse Rate</span>
        </div>
        <p className="mono mt-1.5 text-lg font-bold">{vitals.heartRate} <span className="text-[11px] font-normal opacity-70">bpm</span></p>
        <span className="mt-1 inline-block text-[10px] font-bold text-[#236d68]">{hrStatus}</span>
      </div>

      <div className={`col-span-2 rounded-xl border p-3 sm:col-span-1 ${vitals.temperature >= 38.0 ? 'border-[#e5aaa2] bg-[#fbe2de]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1"><Thermometer size={13} className="text-[#a4382f]" /> Temperature</span>
        </div>
        <p className="mono mt-1.5 text-lg font-bold">{vitals.temperature}°C</p>
        <span className={`mt-1 inline-block text-[10px] font-bold ${vitals.temperature >= 38.0 ? 'text-[#a4382f]' : 'text-[#266b4b]'}`}>{tempStatus}</span>
      </div>
    </div>
  );
}

/**
 * Reusable Vitals History Table Component
 */
export function VitalsHistoryTable({ vitals }: { vitals?: Vital[] }) {
  if (!vitals || vitals.length === 0) {
    return <p className="rounded-xl bg-[hsl(var(--muted))] p-3 text-xs text-[hsl(var(--muted-foreground))]">No historical vitals recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
      <table className="w-full min-w-[540px] text-left text-xs">
        <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Date & Time</th>
            <th className="px-3 py-2.5 font-semibold">BP (mmHg)</th>
            <th className="px-3 py-2.5 font-semibold">Blood Sugar</th>
            <th className="px-3 py-2.5 font-semibold">Heart Rate</th>
            <th className="px-3 py-2.5 font-semibold">SpO2</th>
            <th className="px-3 py-2.5 font-semibold">Temperature</th>
          </tr>
        </thead>
        <tbody>
          {vitals.map((item, idx) => (
            <tr key={`${item.recordedAt}-${idx}`} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/.5)]">
              <td className="px-3 py-2">{formatDate(item.recordedAt)}</td>
              <td className={item.bpSystolic >= 140 || item.bpDiastolic >= 90 ? 'px-3 py-2 font-bold text-[#a4382f]' : 'px-3 py-2'}>
                {item.bpSystolic}/{item.bpDiastolic}
              </td>
              <td className={item.sugar >= 200 ? 'px-3 py-2 font-bold text-[#a4382f]' : 'px-3 py-2'}>
                {item.sugar} mg/dL
              </td>
              <td className={item.heartRate > 100 || item.heartRate < 60 ? 'px-3 py-2 font-bold text-[#a4382f]' : 'px-3 py-2'}>
                {item.heartRate} bpm
              </td>
              <td className={item.spo2 < 94 ? 'px-3 py-2 font-bold text-[#a4382f]' : 'px-3 py-2'}>
                {item.spo2}%
              </td>
              <td className={item.temperature >= 38.0 ? 'px-3 py-2 font-bold text-[#a4382f]' : 'px-3 py-2'}>
                {item.temperature}°C
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
