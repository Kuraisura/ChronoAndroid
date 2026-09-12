import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';

import Card from '@/components/chrono/Card';
import { useAuth } from '@/lib/AuthContext';
import { applyTheme, saveTheme, THEME_KEY } from '@/lib/theme';

const THEMES = ['Light', 'Dark', 'System'];

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors no-tap ${
        on ? 'bg-chrono-cyan' : 'bg-chrono-surface2 border border-chrono-border'
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
          on ? 'left-[22px] bg-black' : 'left-0.5 bg-chrono-muted'
        }`}
      />
    </button>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'System');
  const [alarms, setAlarms] = useState(() => localStorage.getItem('chrono-alarms') !== 'false');

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => theme === 'System' && applyTheme('System');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [theme]);

  const handleSignOut = async () => {
    await logout();
    window.location.href = '/login';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Chrono User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in space-y-4">
      {/* User card */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-chrono-cyan/80 to-[#00626e] font-mono text-[14px] font-bold text-black">
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-semibold tracking-tight text-chrono-text">{displayName}</div>
            <div className="mt-1 truncate font-mono text-[10px] text-chrono-muted">{user?.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-chrono-border bg-chrono-surface2 px-2.5 py-1.5 text-[12px] font-medium text-chrono-muted transition-colors hover:text-chrono-text no-tap"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-4">
        <div className="label-caps mb-3 text-chrono-muted">PREFERENCES</div>

        {/* Appearance / theme selector */}
        <div className="mb-4">
          <div className="mb-2 text-[14px] font-medium text-chrono-text">Appearance</div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); saveTheme(t); }}
                className={`rounded-md py-2 text-[12px] font-medium transition-colors no-tap ${
                  theme === t
                    ? 'bg-chrono-cyan font-semibold text-black'
                    : 'border border-chrono-border bg-chrono-surface2 text-chrono-muted hover:text-chrono-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Push alarms */}
        <div className="flex items-center justify-between border-t border-chrono-borderSoft pt-3">
          <div>
            <div className="text-[14px] font-medium text-chrono-text">Push Alarms</div>
            <div className="text-[11px] text-chrono-muted">Threshold alerts</div>
          </div>
          <Toggle on={alarms} onClick={() => setAlarms((value) => { localStorage.setItem('chrono-alarms', String(!value)); return !value; })} />
        </div>
      </Card>
    </div>
  );
}
