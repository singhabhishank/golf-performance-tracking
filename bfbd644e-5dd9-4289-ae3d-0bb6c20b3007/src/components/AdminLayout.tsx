import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboardIcon,
  UsersIcon,
  TrophyIcon,
  CalendarIcon,
  HeartIcon,
  BarChart3Icon,
  MenuIcon,
  XIcon,
  LogOutIcon } from
'lucide-react';
interface AdminLayoutProps {
  children: React.ReactNode;
}
export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/signin');
  };
  const navItems = [
  {
    path: '/admin',
    label: 'Overview',
    icon: LayoutDashboardIcon
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: UsersIcon
  },
  {
    path: '/admin/draws',
    label: 'Draws',
    icon: CalendarIcon
  },
  {
    path: '/admin/charities',
    label: 'Charities',
    icon: HeartIcon
  },
  {
    path: '/admin/winners',
    label: 'Winners',
    icon: TrophyIcon
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: BarChart3Icon
  }];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4"
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              
              <MenuIcon className="w-6 h-6" />
            </button>
            <Link to="/" className="text-2xl font-bold text-emerald-400">
              GolfLottery Admin
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-300 hidden sm:block">
              {user?.name || 'Administrator'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition">
              
              <LogOutIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                  
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>);

            })}
          </nav>
        </aside>

        {sidebarOpen &&
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}>
          
            <aside
            className="w-64 bg-white h-full"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xl font-bold text-emerald-600">
                  Admin Menu
                </span>
                <button onClick={() => setSidebarOpen(false)}>
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                    
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>);

              })}
              </nav>
            </aside>
          </div>
        }

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>);

}