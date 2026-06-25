import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  FileText,
  Users,
  LogOut,
  Check,
  ArrowLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, path: '/dashboard' },
  { id: 'scan', label: 'Scanner une copie', icon: ScanLine, path: '/scan-copy' },
  { id: 'exams', label: 'Mes Examens', icon: FileText, path: '/dashboard?tab=exams' },
  { id: 'students', label: 'Mes Élèves', icon: Users, path: '/dashboard?tab=students' },
];

const MOBILE_LABELS = {
  overview: 'Accueil',
  scan: 'Scanner',
  exams: 'Examens',
  students: 'Élèves'
};

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-sky-500/30">
      <Check className="h-5 w-5 text-white stroke-[3]" />
    </div>
    <span className="text-xl font-bold tracking-tight text-white">Korrect</span>
  </div>
);

const AppLayout = ({ activeNav, title, subtitle, backLink, children }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Enseignant';
  const userEmail = localStorage.getItem('userEmail') || '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleNav = (item) => {
    if (item.path.includes('?')) {
      const [path, query] = item.path.split('?');
      navigate(`${path}?${query}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex fixed z-20 h-full w-60 flex-col border-r border-slate-800/80 bg-[#0d1324]">
        <div className="border-b border-slate-800/80 px-5 py-5">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/80 p-4">
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            {userEmail && (
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#0d1324]/95 border-t border-slate-800/80 backdrop-blur-md flex justify-around items-center px-2 py-1 shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-250 cursor-pointer ${
                isActive ? 'text-sky-400 scale-105 font-bold' : 'text-slate-400 active:scale-95'
              }`}
            >
              <item.icon className={`h-5 w-5 mb-1 transition-transform ${isActive ? 'text-sky-400 stroke-[2.5]' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight">{MOBILE_LABELS[item.id] || item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex flex-col flex-1 min-h-screen md:ml-60 w-full overflow-x-hidden">
        
        {/* Sticky top header optimized for mobile touch and actions */}
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a0f1e]/90 px-4 py-4 md:px-8 md:py-5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            
            {/* Header titles */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-0.5 text-xs md:text-sm text-slate-500 leading-none">{subtitle}</p>
              )}
            </div>

            {/* Header action button (Back button for subviews or Logout on mobile) */}
            <div className="flex items-center gap-2">
              {backLink ? (
                <Link
                  to={backLink.to}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-xl text-slate-400 bg-slate-900 border border-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{backLink.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        </header>

        {/* Content container adjusted to avoid bottom tab overflow */}
        <div className="flex-1 px-4 py-5 md:px-8 md:py-6 pb-24 md:pb-6">
          {children}
        </div>

      </main>
    </div>
  );
};

export default AppLayout;
