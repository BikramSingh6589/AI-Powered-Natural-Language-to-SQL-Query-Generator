import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Zap, FileSpreadsheet, History, Shield, ArrowRight, LayoutDashboard, User, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const themeButtonRef = React.useRef<HTMLButtonElement>(null);

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

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-md shadow-sm transition-all"
        style={{ backgroundColor: 'color-mix(in srgb, var(--card) 85%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-primary no-underline hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Database className="w-4 h-4 text-white" />
            </div>
            SQL Analyzer
          </Link>

          {/* Right side — auth-aware */}
          <div className="flex items-center gap-4">
            {/* Premium pill theme toggle */}
            <button
              ref={themeButtonRef}
              onClick={handleToggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative flex items-center w-[72px] h-9 rounded-full border transition-all duration-300 overflow-hidden group flex-shrink-0"
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

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium transition-colors no-underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-2 no-underline">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary/30 hover:ring-primary/70 transition-all"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              /* ── Logged-out state ── */
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium transition-colors no-underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Log in
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-28 px-6 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-sm"
              style={{ backgroundColor: 'rgba(79,70,229,0.05)', borderColor: 'rgba(79,70,229,0.2)', color: '#4F46E5' }}
            >
              <Zap className="w-3.5 h-3.5" /> AI-Powered · Natural Language to SQL
            </div>

            <h1
              className="text-5xl lg:text-[4.25rem] font-extrabold leading-[1.05] tracking-tighter"
              style={{ color: 'var(--text-primary)' }}
            >
              Convert English Into{' '}
              <span className="relative inline-block">
                <span className="relative z-10" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  SQL
                </span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-primary/20 -z-10 rounded-sm blur-[2px]" />
              </span>{' '}
              Instantly
            </h1>

            <p className="text-xl leading-relaxed max-w-xl font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Stop struggling with complex queries. Our AI-powered platform translates your natural language questions into highly optimized SQL queries in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              {isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate('/query')} className="gap-2 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-transform">
                    Open Query Generator <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')} className="gap-2 hover:-translate-y-0.5 transition-transform border border-border/50">
                    <LayoutDashboard className="w-4 h-4" /> View Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-transform h-12 px-8">
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')} className="hover:-translate-y-0.5 transition-transform h-12 px-8 border border-border/50 bg-transparent hover:bg-muted/50">
                    View Demo
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Code preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-2 rounded-3xl opacity-30 blur-xl" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }} />
            <div className="relative rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              {/* Card header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <span className="text-xs font-medium ml-2" style={{ color: 'var(--text-secondary)' }}>
                  AI Query Generator
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Natural language input */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Your question</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>"Show me the top 5 customers by revenue this year"</p>
                </div>

                {/* Generated SQL */}
                <div className="p-4 rounded-xl bg-[#0D1117] font-mono text-sm overflow-x-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✓ Generated</span>
                  </div>
                  <div className="space-y-0.5">
                    <div><span className="text-[#FF79C6]">SELECT</span><span className="text-[#9CDCFE]"> customer_name</span><span className="text-[#D4D4D4]">,</span></div>
                    <div className="pl-6"><span className="text-[#DCDCAA]">SUM</span><span className="text-[#D4D4D4]">(revenue) </span><span className="text-[#FF79C6]">AS</span><span className="text-[#9CDCFE]"> total_revenue</span></div>
                    <div><span className="text-[#FF79C6]">FROM</span><span className="text-[#CE9178]"> customers</span></div>
                    <div><span className="text-[#FF79C6]">WHERE</span><span className="text-[#9CDCFE]"> YEAR</span><span className="text-[#D4D4D4]">(created_at) = </span><span className="text-[#B5CEA8]">2026</span></div>
                    <div><span className="text-[#FF79C6]">GROUP BY</span><span className="text-[#9CDCFE]"> customer_name</span></div>
                    <div><span className="text-[#FF79C6]">ORDER BY</span><span className="text-[#9CDCFE]"> total_revenue </span><span className="text-[#FF79C6]">DESC</span></div>
                    <div><span className="text-[#FF79C6]">LIMIT</span><span className="text-[#B5CEA8]"> 5</span><span className="text-[#D4D4D4]">;</span></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 border-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need to analyze data
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              End-to-end capabilities from data ingestion to query execution and result export.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[
              { title: 'CSV Upload', desc: 'Instantly generate a database schema from your CSV files and start querying.', icon: FileSpreadsheet, color: '#4F46E5' },
              { title: 'AI SQL Generation', desc: 'State-of-the-art LLMs trained to write complex, highly optimized SQL.', icon: Zap, color: '#F59E0B' },
              { title: 'Database Connection', desc: 'Connect directly to your Postgres, MySQL, or SQLite databases securely.', icon: Database, color: '#06B6D4' },
              { title: 'Query Explanation', desc: 'Understand how queries work with step-by-step AI generated explanations.', icon: Shield, color: '#22C55E' },
              { title: 'Result Export', desc: 'Export your query results to CSV, Excel, or PDF with a single click.', icon: ArrowRight, color: '#EF4444' },
              { title: 'Query History', desc: 'Never lose a query. Access your entire history and save favourite queries.', icon: History, color: '#8B5CF6' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-8 rounded-3xl border border-border/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${feature.color}18` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-base leading-relaxed opacity-80 flex-1" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Us Section ── */}
      <section id="contact" className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Contact Us
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Have questions? We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-3xl border shadow-lg" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      style={{ borderColor: 'var(--border)' }}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      style={{ borderColor: 'var(--border)' }}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ borderColor: 'var(--border)' }}
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Message</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[150px]"
                    style={{ borderColor: 'var(--border)' }}
                    placeholder="Your message here..."
                  />
                </div>

                <Button className="w-full py-3 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-transform">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-20 pb-10 border-t bg-muted/20" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 font-bold text-xl text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              SQL Analyzer
            </div>
            <p className="max-w-sm text-sm leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
              AI-Powered Natural Language to SQL Query Generator.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Links</h4>
            <ul className="space-y-4 text-sm opacity-80" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="#contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Legal</h4>
            <ul className="space-y-4 text-sm opacity-80" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>© 2026 SQL Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
