import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import {
  AlertCircle, ArrowLeft, ArrowRight, BriefcaseMedical, Check,
  Stethoscope, UserRound, Wifi, XCircle,
} from 'lucide-react';
import type { RoleId } from '../data';
import { isRoleId, roleById, useStore } from '../context/StoreContext';
import { Badge, LanguageSwitcher, Logo, PrimaryButton } from '../components/Common';

export function RoleSelection() {
  const [, navigate] = useLocation();
  const { setCurrentRole } = useStore();
  const [selectedRole, setSelectedRole] = useState<RoleId>('doctor');
  const [showAuthForm, setShowAuthForm] = useState(false);

  const activeDemoUser = roleById(selectedRole);
  const [username, setUsername] = useState(activeDemoUser.username);
  const [password, setPassword] = useState(activeDemoUser.password);
  const [error, setError] = useState('');

  const choices: { id: RoleId; title: string; description: string; icon: typeof UserRound; tint: string }[] = [
    { id: 'doctor', title: 'Doctor', description: 'Review incoming cases, EHR & prescriptions', icon: Stethoscope, tint: 'bg-[#dcefed]' },
    { id: 'asha', title: 'ASHA Worker', description: 'Register families, triage symptoms, field records', icon: UserRound, tint: 'bg-[#fce6d4]' },
    { id: 'admin', title: 'District Administrator', description: 'District-wide trends, alerts & referrals', icon: BriefcaseMedical, tint: 'bg-[#f8edcc]' },
  ];

  const handleRoleSelect = (roleId: RoleId) => {
    setSelectedRole(roleId);
    const demo = roleById(roleId);
    setUsername(demo.username);
    setPassword(demo.password);
    setError('');
  };

  const handleLoginSubmit = (roleId: RoleId) => {
    localStorage.setItem('role', roleId);
    setCurrentRole(roleId);
    if (roleId === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (roleId === 'asha') {
      navigate('/asha-dashboard');
    } else if (roleId === 'admin') {
      navigate('/admin-dashboard');
    }
  };

  const handleAuthSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (username === activeDemoUser.username && password === activeDemoUser.password) {
      handleLoginSubmit(selectedRole);
    } else {
      setError('Use the demo credentials provided below.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#183f3a] text-[#e8f1e4]">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 py-6 md:px-10 md:py-9">
        <header className="flex items-center justify-between">
          <Logo />
          <LanguageSwitcher />
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[.85fr_1.15fr]">
          <div className="animate-rise">
            <Badge tone="teal" icon={<Wifi size={13} />}>
              Built for low-connectivity care
            </Badge>
            <h1 className="mt-6 max-w-xl text-5xl font-bold leading-[.97] tracking-[-.065em] md:text-7xl">
              Care that keeps moving, even when the signal doesn’t.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#b9d2c8]">
              ArogyaSetu Rural Health Assistant connects frontline village workers with PHC doctors and district health administrators.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-[#b9d2c8]">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#f5b36a]" />
                Role-isolated dashboards
              </span>
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#f5b36a]" />
                AI-assisted triage
              </span>
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#f5b36a]" />
                Closed-loop referrals
              </span>
            </div>
          </div>

          <div className="animate-rise-2">
            {!showAuthForm ? (
              <div className="rounded-3xl border border-white/10 bg-white/[.07] p-6 shadow-2xl backdrop-blur-md md:p-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-[#9fc6b5]">
                  Select your role to sign in
                </p>
                <div className="space-y-3">
                  {choices.map(({ id, title, description, icon: Icon, tint }) => (
                    <button
                      key={id}
                      onClick={() => {
                        handleRoleSelect(id);
                        handleLoginSubmit(id);
                      }}
                      className="lift focus-ring group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[.07] p-4 text-left hover:bg-white/[.14] md:p-5 cursor-pointer"
                      data-testid={`button-role-${id}`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint} text-[#183f3a]`}>
                        <Icon size={23} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-base">{title}</strong>
                        <span className="mt-1 block text-sm text-[#abc8bb]">{description}</span>
                      </span>
                      <ArrowRight size={19} className="text-[#9fc6b5] transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#8eb3a5]">
                  <span>Demo credentials automatically loaded</span>
                  <button
                    onClick={() => setShowAuthForm(true)}
                    className="font-semibold text-[#f5b36a] hover:underline cursor-pointer"
                    data-testid="button-manual-login"
                  >
                    Custom login form &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[.07] p-6 shadow-2xl backdrop-blur-md md:p-8">
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#abc8bb] hover:text-white cursor-pointer"
                >
                  <ArrowLeft size={15} /> Back to role cards
                </button>
                <Badge tone="teal" icon={<UserRound size={13} />}>
                  {activeDemoUser.title}
                </Badge>
                <h2 className="mt-3 text-2xl font-bold">{activeDemoUser.name}</h2>
                <p className="mt-1 text-xs text-[#abc8bb]">{activeDemoUser.facility}</p>

                <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                  <label className="block text-xs font-semibold text-[#abc8bb]">
                    Username
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none"
                      data-testid="input-username"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#abc8bb]">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none"
                      data-testid="input-password"
                    />
                  </label>
                  {error && (
                    <p className="flex items-center gap-2 rounded-xl bg-[#fbe2de] px-3 py-2 text-xs font-semibold text-[#a4382f]">
                      <AlertCircle size={15} />
                      {error}
                    </p>
                  )}
                  <PrimaryButton type="submit" testId="button-sign-in">
                    Sign in as {activeDemoUser.title} <ArrowRight size={16} />
                  </PrimaryButton>
                </form>
              </div>
            )}
            <p className="mt-5 text-center text-xs text-[#8eb3a5]">
              Demo environment · Krishna District Health Network
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-xs text-[#8eb3a5]">
          <span>Krishna District Health Mission</span>
          <span>Last design principle: no family left behind.</span>
        </footer>
      </div>
    </div>
  );
}

export function RoleEntry() {
  const { currentRole } = useStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const role = currentRole || (isRoleId(storedRole) ? storedRole : null);
    if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (role === 'asha') {
      navigate('/asha-dashboard');
    } else if (role === 'admin') {
      navigate('/admin-dashboard');
    }
  }, [currentRole, navigate]);

  return <RoleSelection />;
}

export function ProtectedRoute({
  requiredRole,
  children,
}: {
  requiredRole: RoleId;
  children: ReactNode;
}) {
  const [, navigate] = useLocation();
  const { currentRole } = useStore();
  const storedRole = localStorage.getItem('role');
  const effectiveRole = currentRole || (isRoleId(storedRole) ? storedRole : null);

  useEffect(() => {
    if (effectiveRole !== requiredRole) {
      navigate('/');
    }
  }, [effectiveRole, requiredRole, navigate]);

  if (effectiveRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

export function NotFound() {
  const [, navigate] = useLocation();
  const { currentRole } = useStore();

  const handleReturn = () => {
    const storedRole = localStorage.getItem('role');
    const role = currentRole || (isRoleId(storedRole) ? storedRole : null);
    if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (role === 'asha') {
      navigate('/asha-dashboard');
    } else if (role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))] p-6">
      <div className="surface max-w-md rounded-2xl p-8 text-center animate-rise">
        <XCircle size={32} className="mx-auto text-[hsl(var(--destructive))]" />
        <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          The requested path is not a valid route. Return to your designated workspace.
        </p>
        <div className="mt-6">
          <PrimaryButton onClick={handleReturn} testId="button-return-home">
            Return to Dashboard
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
