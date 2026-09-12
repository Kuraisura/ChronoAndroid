import { NavLink } from 'react-router-dom';
import { Clock, BookOpen, Calendar } from 'lucide-react';

const TABS = [
  { to: '/schedule', label: 'SCHEDULE', Icon: Clock },
  { to: '/journal', label: 'JOURNAL', Icon: BookOpen },
  { to: '/calendar', label: 'CALENDAR', Icon: Calendar },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center justify-around rounded-2xl border border-chrono-border bg-chrono-surface/95 px-1.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-xl py-2 no-tap transition-colors ${
                isActive ? 'bg-chrono-cyan/12 text-chrono-cyan' : 'text-chrono-muted hover:bg-chrono-surface2 hover:text-chrono-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-7 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-chrono-cyan/15' : 'bg-chrono-surface2'}`}><Icon size={20} strokeWidth={isActive ? 2.4 : 2.1} /></span>
                <span className="font-mono text-[9px] font-semibold tracking-wider">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
