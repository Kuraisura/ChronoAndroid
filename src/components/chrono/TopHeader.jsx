import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '@/lib/AuthContext';

export default function TopHeader({ title }) {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Chrono User';
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-chrono-borderSoft bg-chrono-bg/92 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.25rem] max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-chrono-text">{title}</div>
        </div>
        <Link to="/profile" className="no-tap" aria-label="Profile">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-chrono-cyan/40 bg-chrono-cyan/15 font-mono text-[10px] font-bold text-chrono-cyan shadow-[0_0_16px_rgba(0,229,255,.12)]">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}
