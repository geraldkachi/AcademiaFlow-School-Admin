import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserSquare, BookOpen, FileText, BarChart2,
  Bell, Settings, LogOut, X, Menu, Search, User, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import { Navigate } from 'react-router-dom';

// ─── Logo ────────────────────────────────────────────
export function Logo({ size = 'md' }: { size?: 'sm'|'md'|'lg' }) {
  const s = { sm:{ w:22, text:'text-sm' }, md:{ w:28, text:'text-base' }, lg:{ w:36, text:'text-xl' } }[size];
  return (
    <div className="flex items-center gap-2">
      <svg width={s.w} height={s.w} viewBox="0 0 36 36" fill="none">
        <path d="M18 4L2 12L18 20L34 12L18 4Z" fill="#0f2d40"/>
        <path d="M6 15.5V24C6 24 10 28 18 28C26 28 30 24 30 24V15.5L18 21.5L6 15.5Z" fill="#16a34a"/>
        <rect x="32" y="12" width="2" height="10" rx="1" fill="#0f2d40"/>
        <circle cx="33" cy="23" r="2" fill="#0f2d40"/>
      </svg>
      <span className={`font-bold ${s.text} text-navy`}>Academia<span className="text-primary">Flow</span></span>
    </div>
  );
}

// ─── SchoolBadge ─────────────────────────────────────
export function SchoolBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 3L4 9V18C4 25.2 10.2 31.2 18 33C25.8 31.2 32 25.2 32 18V9L18 3Z" fill="#f59e0b"/>
        <path d="M18 7L8 12V18C8 23.2 12.4 27.8 18 29.4C23.6 27.8 28 23.2 28 18V12L18 7Z" fill="#fbbf24"/>
        <path d="M14 17l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="font-semibold text-navy text-sm">{name}</span>
    </div>
  );
}

// ─── AuthLayout ──────────────────────────────────────
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6"><Logo size="lg"/></div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 w-full max-w-md p-8">{children}</div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────
const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/staffs', label: 'Staffs', icon: UserSquare },
  { to: '/academics', label: 'Academics', icon: BookOpen },
  { to: '/exams', label: 'Exams', icon: FileText },
  { to: '/assignments', label: 'Assignments', icon: FileText },
  { to: '/results', label: 'Results', icon: BarChart2 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth(); navigate('/login');
  };
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose}/>}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-52 bg-white border-r border-gray-100 flex flex-col py-5 px-3 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <button onClick={onClose} className="lg:hidden absolute top-4 right-3 p-1 text-gray-400 hover:text-gray-600"><X size={18}/></button>
        <div className="px-2 mb-7"><Logo size="md"/></div>
        <nav className="flex-1 flex flex-col gap-0.5">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
              <Icon size={16}/>{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-3 mt-3">
          <NavLink to="/settings" onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <Settings size={16}/>Settings
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600 mt-0.5">
            <LogOut size={16}/>Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ──────────────────────────────────────────
export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth(); navigate('/login');
  };
  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center gap-4 shrink-0 relative z-20">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 text-gray-500 hover:text-navy"><Menu size={20}/></button>
      <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
        <Search size={14} className="text-gray-400"/>
        <input placeholder="Search" className="bg-transparent text-sm outline-none text-gray-600 placeholder:text-gray-400 w-full"/>
      </div>
      <div className="flex-1"/>
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-[8px] font-bold text-yellow-900">S</span>
        </div>
        <span className="text-xs font-medium text-navy">{user?.school?.name || 'Spring Hills Academy'}</span>
      </div>
      <button onClick={() => navigate('/notifications')} className="relative p-1.5 text-gray-500 hover:text-navy">
        <Bell size={18}/>
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full"/>
      </button>
      <div className="relative">
        <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar"/> : <User size={15} className="text-gray-500"/>}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-navy leading-tight">{user?.name || 'Admin 1'}</p>
            <p className="text-[10px] text-gray-400">Staff ID: {user?.staff_id || '1H35099'}</p>
          </div>
        </button>
        {showProfile && (
          <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-xl shadow-modal w-40 py-1 z-50">
            <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><User size={13}/>Profile</button>
            <button onClick={() => { navigate('/settings?tab=subscription'); setShowProfile(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><CreditCard size={13}/>Subscription</button>
            <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"><LogOut size={13}/>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Dashboard Layout ─────────────────────────────────
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)}/>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6"><Outlet/></main>
      </div>
    </div>
  );
}

// ─── Protected Route ─────────────────────────────────
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  return <>{children}</>;
}
