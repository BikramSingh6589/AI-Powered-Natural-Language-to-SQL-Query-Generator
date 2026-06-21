import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Upload,
  LayoutDashboard,
  History,
  Settings,
  User,
  LogOut,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  Search,
  Plug,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

export const MainLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Dataset', path: '/upload', icon: Upload },
    { name: 'Connect Database', path: '/connect', icon: Plug },
    { name: 'Query Generator', path: '/query', icon: Terminal },
    { name: 'Query History', path: '/history', icon: History },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex flex-col flex-shrink-0 overflow-hidden border-r"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Logo — clicking navigates to Landing Page */}
        <div className="flex items-center h-16 px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <Link to="/" className="flex items-center gap-3 min-w-0 no-underline">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
              <Database className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-lg whitespace-nowrap overflow-hidden hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-primary)' }}
                >
                  SQL Analyzer
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-colors hover:bg-primary hover:border-primary hover:text-white"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-4 space-y-1 border-t" style={{ borderColor: 'var(--border)' }}>
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}

          {/* User avatar + logout */}
          <div
            className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
            style={{}}
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-3 h-3 text-error" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-error whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header
          className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm flex-1 cursor-text hover:border-primary/40 transition-colors"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 flex-shrink-0" />
                <span>Search queries, datasets...</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 opacity-60">
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-medium font-sans">Ctrl</kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-medium font-sans">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>
            </button>

            {/* Avatar — links to profile */}
            <Link to="/profile" className="ml-1 flex-shrink-0">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary/20 hover:ring-primary/60 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-semibold hover:opacity-80 transition-opacity">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--bg)' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
