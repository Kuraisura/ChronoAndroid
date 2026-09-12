import { Outlet, useLocation } from 'react-router-dom';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';

const TITLES = {
  '/schedule': 'SCHEDULE',
  '/journal': 'JOURNAL',
  '/calendar': 'CALENDAR',
  '/profile': 'PROFILE SETTINGS',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'CHRONO';
  return (
    <div className="min-h-[100dvh] bg-chrono-bg text-chrono-text font-body transition-colors duration-200">
      <TopHeader title={title} />
      <main className="mx-auto max-w-md px-4 pb-28 pt-3">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
