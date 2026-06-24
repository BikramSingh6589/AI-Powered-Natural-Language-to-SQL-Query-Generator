import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const handleToggleTheme = () => {
    if (themeButtonRef.current) {
      const rect = themeButtonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      toggleTheme({ x, y });
    } else {
      toggleTheme();
    }
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

  const isDark = theme === 'dark';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ 
          x: isMobile ? (mobileOpen ? 0 : '-100%') : 0,
          width: isMobile ? 260 : (collapsed ? 72 : 260) 
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`flex flex-col flex-shrink-0 border-r ${
          isMobile ? 'fixed inset-y-0 left-0 z-40 shadow-2xl overflow-hidden' : 'relative z-20'
        }`}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <Link to="/" className="flex items-center gap-3 min-w-0 no-underline">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
              <Database className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="font-bold text-lg whitespace-nowrap overflow-hidden hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
                SQL Analyzer
              </span>
            )}
          </Link>
          
          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Close menu"
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                <span className="absolute w-4 h-[2px] bg-current rounded-full rotate-45" />
                <span className="absolute w-4 h-[2px] bg-current rounded-full -rotate-45" />
              </div>
            </button>
          )}
        </div>

        {/* Collapse toggle (Hamburger/Cross morph) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3.5 bottom-8 z-30 w-7 h-7 rounded-full border flex items-center justify-center transition-all hover:bg-primary hover:border-primary hover:text-white"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            aria-label="Toggle Sidebar"
          >
            <div className="relative w-3.5 h-3 flex flex-col justify-between">
              <span className={`w-full h-[1.5px] bg-current rounded-full transform transition-all duration-300 origin-center ${!collapsed ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`w-full h-[1.5px] bg-current rounded-full transition-opacity duration-300 ${!collapsed ? 'opacity-0' : ''}`} />
              <span className={`w-full h-[1.5px] bg-current rounded-full transform transition-all duration-300 origin-center ${!collapsed ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </div>
          </button>
        )}

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={(collapsed && !isMobile) ? item.name : undefined}
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
                  {(!collapsed || isMobile) && (
                    <span className="whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
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
              title={(collapsed && !isMobile) ? item.name : undefined}
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
                  {(!collapsed || isMobile) && (
                    <span className="whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* User avatar + logout */}
          <div
            className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
            style={{}}
            onClick={handleLogout}
            title={(collapsed && !isMobile) ? 'Logout' : undefined}
          >
            <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-3 h-3 text-error" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="text-sm font-medium text-error whitespace-nowrap">
                Logout
              </span>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header
          className="h-16 flex items-center justify-between px-4 sm:px-6 border-b flex-shrink-0 gap-4"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Hamburger Button */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-background/50 text-text-primary focus:outline-none transition-all hover:bg-muted/40"
                aria-label="Toggle Menu"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="relative w-4.5 h-3.5 flex flex-col justify-between">
                  <span className={`w-full h-[2px] bg-current rounded-full transform transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                  <span className={`w-full h-[2px] bg-current rounded-full transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`w-full h-[2px] bg-current rounded-full transform transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                </div>
              </button>
            )}

            {/* Search Component — Only show on desktop/tablet */}
            {!isMobile && (
              <div
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm flex-1 max-w-md cursor-text hover:border-primary/40 transition-colors"
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
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Premium pill theme toggle */}
            <button
              ref={themeButtonRef}
              onClick={handleToggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative flex items-center w-[72px] h-9 rounded-full border transition-all duration-300 overflow-hidden group"
              style={{
                backgroundColor: isDark ? 'var(--bg)' : '#f0f0f0',
                borderColor: 'var(--border)',
              }}
              aria-label="Toggle theme"
            >
              {/* Track icons */}
              <span className="absolute left-2.5 flex items-center justify-center w-4 h-4 text-yellow-400 opacity-100 transition-all duration-300" style={{ opacity: isDark ? 0.5 : 1 }}>
                <Sun className="w-3.5 h-3.5" />
              </span>
              <span className="absolute right-2.5 flex items-center justify-center w-4 h-4 text-indigo-400 transition-all duration-300" style={{ opacity: isDark ? 1 : 0.5 }}>
                <Moon className="w-3.5 h-3.5" />
              </span>
              {/* Sliding knob */}
              <span
                className="absolute top-1 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-in-out"
                style={{
                  left: isDark ? 'calc(100% - 32px)' : '4px',
                  backgroundColor: isDark ? '#4F46E5' : '#FFFFFF',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(79,70,229,0.5)'
                    : '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {isDark
                  ? <Moon className="w-3.5 h-3.5 text-white" />
                  : <Sun className="w-3.5 h-3.5 text-yellow-500" />
                }
              </span>
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
        <main className="flex-1 overflow-auto p-4 sm:p-6" style={{ backgroundColor: 'var(--bg)' }}>
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
