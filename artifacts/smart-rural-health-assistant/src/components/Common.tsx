import { useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import {
  AlertCircle, CheckCircle2, Cloud, CloudOff, HeartPulse, Languages,
  LayoutDashboard, LogOut, Menu, MoreHorizontal, ShieldCheck, UserRound, Users, X,
} from 'lucide-react';
import type { Patient, Role, Severity } from '../data';
import { initials, latestVital, useCopy, useStore, type Language } from '../context/StoreContext';
import { VitalsPills } from './Vitals';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none" data-testid="link-brand">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
        <HeartPulse size={21} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span>
          <strong className="block text-[15px] tracking-[-.03em]">ArogyaSetu</strong>
          <small className="block text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">
            Rural Health Assistant
          </small>
        </span>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode;
  tone?: 'green' | 'yellow' | 'red' | 'neutral' | 'teal';
  icon?: ReactNode;
}) {
  const tones = {
    green: 'bg-[#e3f1e7] text-[#266b4b]',
    yellow: 'bg-[#fff0cf] text-[#8c5a16]',
    red: 'bg-[#fbe2de] text-[#a4382f]',
    neutral: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
    teal: 'bg-[#dcefed] text-[#236d68]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useStore();
  return (
    <label
      className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs font-semibold"
      data-testid="control-language"
    >
      <Languages size={14} className="text-[hsl(var(--primary))]" />
      <span className="sr-only">Language</span>
      <select
        aria-label="Choose language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="cursor-pointer bg-transparent pr-1 outline-none"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
    </label>
  );
}

export function SyncPill() {
  const { offline, syncRecords, setOffline } = useStore();
  const pending = syncRecords.filter((item) => item.status === 'pending').length;
  return (
    <button
      onClick={() => setOffline(!offline)}
      className="focus-ring flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold cursor-pointer"
      aria-label="Toggle offline mode"
      data-testid="button-toggle-offline"
    >
      {offline ? <CloudOff size={15} className="text-[#a76020]" /> : <Cloud size={15} className="text-[hsl(var(--primary))]" />}
      <span className="hidden sm:inline">{offline ? 'Offline mode' : 'Connected'}</span>
      <span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{pending} pending</span>
    </button>
  );
}

export type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export function SideNav({
  role,
  items,
  activeTab,
  onSelectTab,
  onClose,
}: {
  role: Role;
  items: NavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  onClose?: () => void;
}) {
  const { setCurrentRole } = useStore();
  const [, navigate] = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('role');
    setCurrentRole(null);
    navigate('/');
  };

  return (
    <aside className="flex h-full w-[254px] flex-col bg-[#183f3a] px-4 py-5 text-[#e8f1e4]">
      <div className="mb-8 flex items-center justify-between px-2">
        <Logo />
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-[#b9d2c8] hover:bg-white/10 md:hidden cursor-pointer"
          aria-label="Close navigation"
          data-testid="button-close-nav"
        >
          <X size={18} />
        </button>
      </div>
      <div className="mb-5 rounded-xl border border-white/10 bg-white/[.06] p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f29a62] text-sm font-bold text-[#183f3a]">
            {initials(role.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{role.name}</p>
            <p className="truncate text-[11px] text-[#a8c5ba]">{role.title}</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1" aria-label="Primary navigation">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onSelectTab(id);
              onClose?.();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition cursor-pointer ${
              activeTab === id
                ? 'bg-[#e8f1e4] text-[#183f3a]'
                : 'text-[#b9d2c8] hover:bg-white/10 hover:text-white'
            }`}
            data-testid={`tab-nav-${id}`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-xl bg-[#25554d] p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck size={15} className="text-[#f5b36a]" />
            Demo workspace
          </div>
          <p className="text-[11px] leading-relaxed text-[#b9d2c8]">
            Synthetic records only. Never use for medical decisions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#b9d2c8] hover:bg-white/10 hover:text-white cursor-pointer"
          data-testid="link-sign-out"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function Shell({
  role,
  items,
  activeTab,
  onSelectTab,
  children,
  title,
  eyebrow,
  headerAction,
}: {
  role: Role;
  items: NavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  headerAction?: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const { setCurrentRole } = useStore();
  const [, navigate] = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('role');
    setCurrentRole(null);
    navigate('/');
  };

  return (
    <div className="app-shell noise">
      <div className="flex min-h-[100dvh]">
        <div
          className={`${menu ? 'fixed inset-0 z-40 block bg-[#183f3a]/30' : 'hidden'} md:hidden`}
          onClick={() => setMenu(false)}
        />
        <div className={`${menu ? 'fixed left-0 top-0 z-50 block' : 'hidden'} h-[100dvh] md:relative md:block`}>
          <SideNav
            role={role}
            items={items}
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            onClose={() => setMenu(false)}
          />
        </div>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenu(true)}
                className="rounded-lg p-2 hover:bg-[hsl(var(--muted))] md:hidden cursor-pointer"
                aria-label="Open navigation"
                data-testid="button-open-nav"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="mono mb-1 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">
                  {eyebrow ?? role.facility}
                </p>
                <h1 className="text-xl font-bold tracking-[-.03em] md:text-2xl">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerAction}
              <Badge tone="teal" icon={<UserRound size={13} />}>
                {role.title}
              </Badge>
              <SyncPill />
              <LanguageSwitcher />
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 hover:bg-[hsl(var(--muted))] sm:block cursor-pointer"
                aria-label="Sign out"
                data-testid="button-header-sign-out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>
          <div className="mx-auto max-w-[1440px] p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'teal',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone?: 'teal' | 'orange' | 'red' | 'cream';
}) {
  const colors = {
    teal: 'bg-[#dcefed] text-[#236d68]',
    orange: 'bg-[#fce6d4] text-[#a25528]',
    red: 'bg-[#fbe2de] text-[#a4382f]',
    cream: 'bg-[#f8edcc] text-[#8c651e]',
  };
  return (
    <div className="surface lift rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}>
          <Icon size={20} />
        </span>
        <MoreHorizontal size={18} className="text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="mono text-2xl font-bold tracking-[-.04em]">{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>
    </div>
  );
}

export function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-bold tracking-[-.02em]">{title}</h2>
        {detail && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  testId = 'button-action',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'soft' | 'outline' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  testId?: string;
}) {
  const style = {
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110',
    soft: 'bg-[#dcefed] text-[#236d68] hover:bg-[#cde6e2]',
    outline: 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]',
    danger: 'bg-[#a4382f] text-white hover:brightness-110',
  }[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: Severity | null }) {
  const t = useCopy();
  if (status === 'green') return <Badge tone="green" icon={<CheckCircle2 size={13} />}>{t('home')}</Badge>;
  if (status === 'yellow') return <Badge tone="yellow" icon={<AlertCircle size={13} />}>{t('teleconsult')}</Badge>;
  if (status === 'red') return <Badge tone="red" icon={<AlertCircle size={13} />}>{t('emergency')}</Badge>;
  return <Badge>Not assessed</Badge>;
}

export function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof CheckCircle2;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <Icon size={28} className="text-[hsl(var(--primary))]" />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>
    </div>
  );
}

export function Insight({ icon: Icon, title, detail }: { icon: typeof HeartPulse; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <Icon size={18} className="text-[hsl(var(--primary))]" />
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{detail}</p>
    </div>
  );
}

export function PatientRow({
  patient,
  onSelect,
}: {
  patient: Patient;
  onSelect?: () => void;
}) {
  const vital = latestVital(patient);

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col gap-2.5 border-b border-[hsl(var(--border))] p-4 last:border-0 md:px-5 ${
        onSelect ? 'cursor-pointer hover:bg-[hsl(var(--muted))]' : ''
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcefed] text-xs font-bold text-[#236d68]">
            {initials(patient.name)}
          </span>
          <div>
            <p className="text-sm font-bold" data-testid={`text-patient-${patient.id}`}>
              {patient.name}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {patient.id} · {patient.age} yrs · {patient.village}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-xs text-[hsl(var(--muted-foreground))] md:block">
            {patient.condition}
          </div>
          <StatusBadge status={patient.triageStatus} />
        </div>
      </div>
      <div className="pl-13">
        <VitalsPills vitals={vital} compact />
      </div>
    </div>
  );
}
