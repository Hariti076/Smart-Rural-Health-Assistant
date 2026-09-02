import { Check, CheckCircle2, Cloud, CloudOff, RefreshCw, Wifi } from 'lucide-react';
import { formatTime, useStore } from '../context/StoreContext';
import { Badge, EmptyState, PrimaryButton, SectionTitle } from './Common';

export function SyncCenterView() {
  const { offline, setOffline, syncRecords, setSyncRecords, lastSynced, setLastSynced } = useStore();
  const pending = syncRecords.filter((item) => item.status === 'pending');

  const sync = () => {
    setSyncRecords((items) => items.map((item) => ({ ...item, status: 'synced' })));
    setLastSynced(
      `Today, ${new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())}`
    );
    setOffline(false);
  };

  return (
    <div className="animate-rise space-y-6">
      <div className={`rounded-3xl p-6 md:p-8 ${offline ? 'bg-[#fff0cf]' : 'bg-[#e0eee2]'}`}>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <Badge tone={offline ? 'yellow' : 'green'} icon={offline ? <CloudOff size={13} /> : <Cloud size={13} />}>
              {offline ? 'Offline mode' : 'Connected'}
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-[-.05em]">
              {offline ? 'Your work is safe on this device.' : 'You’re connected to the district network.'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {offline
                ? 'Capture patients, vitals and triage as usual. Records stay in local memory until sync.'
                : 'New records travel across role consoles. Continue care with full confidence.'}
            </p>
          </div>
          <PrimaryButton
            onClick={() => setOffline(!offline)}
            variant={offline ? 'primary' : 'outline'}
            testId="button-offline-toggle"
          >
            {offline ? <Wifi size={16} /> : <CloudOff size={16} />}
            {offline ? 'Switch to connected' : 'Simulate offline mode'}
          </PrimaryButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="surface rounded-2xl p-5 md:p-6">
          <SectionTitle title="Sync status" detail="Last successful connection" />
          <div className="flex items-end gap-3">
            <span className="mono text-3xl font-bold">{pending.length}</span>
            <span className="mb-1 text-sm text-[hsl(var(--muted-foreground))]">pending records</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--accent))] transition-all"
              style={{ width: `${Math.max(8, 100 - pending.length * 18)}%` }}
            />
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <RefreshCw size={14} className={pending.length ? 'sync-pulse' : ''} />
            Last synced {lastSynced}
          </p>
          <div className="mt-6">
            {pending.length > 0 ? (
              <PrimaryButton onClick={sync} testId="button-sync-now">
                <RefreshCw size={16} /> Sync now ({pending.length})
              </PrimaryButton>
            ) : (
              <div className="flex items-center gap-2 text-sm font-bold text-[#266b4b]">
                <CheckCircle2 size={17} /> All records synced
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle title="Device queue" detail="Changes captured locally" />
          <div className="surface overflow-hidden rounded-2xl">
            {syncRecords.slice(0, 8).map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 border-b border-[hsl(var(--border))] p-4 last:border-0"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    record.status === 'pending' ? 'bg-[#fff0cf] text-[#8c5a16]' : 'bg-[#dcefed] text-[#236d68]'
                  }`}
                >
                  {record.status === 'pending' ? <CloudOff size={16} /> : <Check size={16} />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{record.label}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {record.type} · {formatTime(record.createdAt)}
                  </p>
                </div>
                <Badge tone={record.status === 'pending' ? 'yellow' : 'green'}>
                  {record.status === 'pending' ? 'Pending' : 'Synced'}
                </Badge>
              </div>
            ))}
            {syncRecords.length === 0 && (
              <EmptyState icon={Cloud} title="Queue is empty" detail="New work will appear here when captured." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
