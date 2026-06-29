import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, PlusCircle, Trophy, Brain, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoWordmark } from './Logo';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map',       label: 'Map',        icon: MapPin },
  { to: '/report',    label: 'Report',     icon: PlusCircle },
  { to: '/leaderboard', label: 'Leaders',  icon: Trophy },
  { to: '/insights',  label: 'Insights',   icon: Brain },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 py-2">
            <Link to="/dashboard">
              <LogoWordmark />
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {profile && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-full">
                  <span className="text-xs font-bold text-brand-700">{profile.points}</span>
                  <span className="text-xs text-brand-500 hidden sm:inline">pts</span>
                </div>
              )}
              {profile && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-slate-50 text-xs text-slate-600 font-medium">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline max-w-[80px] truncate">{profile.displayName}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="hidden md:flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            const isReport = to === '/report';
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                  isReport
                    ? 'relative -top-3 bg-brand-600 text-white w-14 h-14 rounded-2xl shadow-lg shadow-brand-600/30 flex items-center justify-center'
                    : active
                    ? 'text-brand-600'
                    : 'text-slate-400'
                }`}
              >
                <Icon className={isReport ? 'w-6 h-6' : 'w-5 h-5'} />
                {!isReport && <span className="text-[10px] font-medium">{label}</span>}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-slate-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
