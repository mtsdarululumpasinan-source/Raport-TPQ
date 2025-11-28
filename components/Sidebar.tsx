
import React from 'react';
import { LayoutDashboard, Users, BookOpenCheck, FileText, GraduationCap, Settings, Layers, TrendingUp, LogOut, Shield, Database, Activity, Building2, UsersRound } from 'lucide-react';
import { ViewState, SchoolProfile, User, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  schoolProfile: SchoolProfile;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, toggleSidebar, schoolProfile, currentUser, onLogout }) => {
  const role = currentUser?.role;

  // Define Menus
  let menuItems: { id: string; label: string; icon: any }[] = [];

  if (role === UserRole.ADMIN_PUSAT) {
    // ADMIN PUSAT (SUPER ADMIN) - Sees EVERYTHING
    menuItems = [
      { id: 'ADMIN_DASHBOARD', label: 'Dashboard Utama', icon: LayoutDashboard }, // Executive View
      { id: 'INSTITUTION_DATA', label: 'Data Kelembagaan', icon: Building2 },
      { id: 'DASHBOARD', label: 'Dashboard Lembaga', icon: Activity }, // Operational View
      { id: 'TEACHERS', label: 'Data Ustadz & Wali', icon: UsersRound },
      { id: 'STUDENTS', label: 'Data Santri', icon: Users },
      { id: 'CLASSES', label: 'Data Kelas', icon: Layers },
      { id: 'GRADING', label: 'Input Nilai', icon: BookOpenCheck },
      { id: 'PROMOTION', label: 'Kenaikan Kelas', icon: TrendingUp },
      { id: 'REPORTS', label: 'Cetak Raport', icon: FileText },
      { id: 'DATA_MANAGEMENT', label: 'Database / Excel', icon: Database },
      { id: 'SETTINGS', label: 'Pengaturan', icon: Settings },
    ];
  } else if (role === UserRole.ADMIN_LEMBAGA) {
    // ADMIN LEMBAGA - Operational Only
    menuItems = [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'TEACHERS', label: 'Data Ustadz & Wali', icon: UsersRound },
      { id: 'STUDENTS', label: 'Data Santri', icon: Users },
      { id: 'CLASSES', label: 'Data Kelas', icon: Layers },
      { id: 'GRADING', label: 'Input Nilai', icon: BookOpenCheck },
      { id: 'PROMOTION', label: 'Kenaikan Kelas', icon: TrendingUp },
      { id: 'REPORTS', label: 'Cetak Raport', icon: FileText },
      { id: 'DATA_MANAGEMENT', label: 'Database / Excel', icon: Database },
      { id: 'SETTINGS', label: 'Pengaturan', icon: Settings },
    ];
  } else {
    // ADMIN CABANG (Limited View)
    menuItems = [
      { id: 'ADMIN_DASHBOARD', label: 'Dashboard Wilayah', icon: LayoutDashboard },
      { id: 'INSTITUTION_DATA', label: 'Data Lembaga TPQ', icon: Building2 },
      { id: 'SETTINGS', label: 'Pengaturan Akun', icon: Settings },
    ];
  }

  const appName = role === UserRole.ADMIN_LEMBAGA ? schoolProfile.name : "TPQ SYSTEM";

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-emerald-900 text-white transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0 flex flex-col shadow-2xl`}>
      
      {/* HEADER LOGO */}
      <div className="flex items-center h-20 border-b border-emerald-800 px-4 bg-emerald-950">
        {schoolProfile.logoUrl && role === UserRole.ADMIN_LEMBAGA ? (
             <img 
                src={schoolProfile.logoUrl} 
                alt="Logo" 
                className="w-10 h-10 mr-3 object-contain rounded bg-white p-0.5" 
             />
        ) : (
            <GraduationCap className="w-8 h-8 mr-3 text-emerald-300 flex-shrink-0" />
        )}
        <div>
           <h1 className="text-sm font-bold tracking-wide truncate max-w-[150px]" title={appName}>
              {appName}
           </h1>
           <p className="text-[10px] text-emerald-400 font-mono">Ver 2.1.0 (Super)</p>
        </div>
      </div>

      {/* USER PROFILE INFO */}
      {currentUser && (
        <div className="p-4 border-b border-emerald-800 bg-emerald-800/50">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold border-2 border-emerald-300">
                 {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold truncate text-white">{currentUser.name}</p>
                 <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                    <Shield className="w-3 h-3" />
                    <span className="truncate">{currentUser.role.replace('_', ' ')}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="mt-4 px-3 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setView(item.id as ViewState);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group ${
                    currentView === item.id
                      ? 'bg-emerald-100 text-emerald-900 shadow-lg font-bold'
                      : 'text-emerald-100 hover:bg-emerald-800 hover:pl-5'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-colors ${currentView === item.id ? 'text-emerald-700' : 'text-emerald-300 group-hover:text-white'}`} />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="p-4 border-t border-emerald-800 bg-emerald-950">
        <button 
          onClick={onLogout}
          className="flex items-center justify-center w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-bold shadow-md"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar Aplikasi
        </button>
        <p className="text-[10px] text-center text-emerald-600 mt-3">© 2024 TPQ Digital System</p>
      </div>
    </div>
  );
};
