import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  AlertOctagon,
  ClipboardCheck,
  FolderKanban,
  User,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Header } from '../components/common/Header';

export const OfficerLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
    { label: 'Land Records', path: '/officer/land-records', icon: FileText },
    { label: 'Add Land Record', path: '/officer/land-records/new', icon: PlusCircle },
    { label: 'Application Verification', path: '/officer/applications', icon: ClipboardCheck },
    { label: 'Grievances', path: '/officer/grievances', icon: AlertOctagon },
    { label: 'Documents / OCR', path: '/officer/documents', icon: FolderKanban },
    { label: 'Profile & Settings', path: '/officer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF9] text-[#172121]">
      {/* Global Header */}
      <Header userRole="officer" />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop Sidebar (White bg with #DDE5E3 border) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#DDE5E3] text-[#172121] shrink-0 justify-between">
          <div>
            <div className="px-5 py-4 border-b border-[#DDE5E3] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#034E4E]" />
              <span className="text-[10px] font-extrabold uppercase text-[#667085] tracking-widest">
                OFFICER NAVIGATION
              </span>
            </div>

            <nav className="px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/officer/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#EAF4F3] text-[#034E4E] shadow-xs'
                        : 'text-[#667085] hover:bg-[#F4F8F7] hover:text-[#172121]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#034E4E] rounded-r-md" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#034E4E]' : 'text-[#667085]'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Officer Emblem Box */}
          <div className="p-4 border-t border-[#DDE5E3]">
            <div className="p-3 bg-[#F4F8F7] rounded-lg border border-[#DDE5E3] flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#034E4E] shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-[#034E4E] tracking-tight">Revenue Administration</p>
                <p className="text-[10px] text-[#667085]">Verified Officer Portal</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Top Bar */}
        <div className="md:hidden bg-[#034E4E] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#023B3B] w-full shrink-0">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1 rounded text-white hover:bg-[#023B3B]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Officer Portal</span>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-[#172121] border-r border-[#DDE5E3] transform transition-transform duration-200 ease-in-out md:hidden flex flex-col justify-between ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            <div className="p-4 border-b border-[#DDE5E3] flex items-center justify-between">
              <span className="text-xs font-bold text-[#034E4E] uppercase tracking-wider">Officer Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-[#667085]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#EAF4F3] text-[#034E4E]'
                        : 'text-[#667085] hover:bg-[#F4F8F7]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content & Footer */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#F7FAF9]">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Official Footer */}
          <footer className="border-t border-[#DDE5E3] bg-white px-6 py-4 text-center sm:text-left text-[11px] text-[#667085]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>© 2025 TRACIA. Revenue Administration Portal.</span>
              <span className="hidden sm:inline">•</span>
              <span>Building trust through transparency in land governance.</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-semibold text-[#034E4E]">Version 1.0.0</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
