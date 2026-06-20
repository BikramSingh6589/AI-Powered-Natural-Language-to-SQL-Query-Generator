import React from 'react';
import { Settings as SettingsIcon, Bell, Palette, Key } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<'general' | 'appearance' | 'notifications' | 'api'>('general');
  const [apiKey, setApiKey] = React.useState('sk_test_1234567890abcdef');
  const [isVisible, setIsVisible] = React.useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h2>
        <p className="text-text-secondary mt-1">Manage your workspace preferences and integrations.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
          >
            <SettingsIcon className="w-4 h-4" /> General
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
          >
            <Palette className="w-4 h-4" /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${activeTab === 'api' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
          >
            <Key className="w-4 h-4" /> API Settings
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the application looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-3">Theme</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-text-secondary bg-background'}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200"></div>
                        <span className="text-sm font-medium text-text-primary">Light</span>
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-text-secondary bg-[#0F172A]'}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-800 shadow-sm border border-slate-700"></div>
                        <span className="text-sm font-medium text-text-primary">Dark</span>
                      </button>
                      <button 
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-text-secondary bg-gradient-to-br from-white to-slate-800'}`}
                      >
                        <div className="w-10 h-10 rounded-full flex overflow-hidden shadow-sm border border-slate-300">
                          <div className="w-1/2 h-full bg-white"></div>
                          <div className="w-1/2 h-full bg-slate-800"></div>
                        </div>
                        <span className="text-sm font-medium text-text-primary">System</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>Manage your API keys for programmatic access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Secret API Key</label>
                  <div className="flex gap-3">
                    <Input 
                      type={isVisible ? "text" : "password"} 
                      value={apiKey} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button variant="secondary" onClick={() => setIsVisible(!isVisible)}>
                      {isVisible ? 'Hide' : 'Show'}
                    </Button>
                    <Button onClick={copyApiKey}>
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Keep your API key secure. Do not share it publicly or expose it in client-side code.
                  </p>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button variant="danger">Regenerate Key</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic workspace settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Workspace Name</label>
                  <Input defaultValue="My Workspace" />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what alerts you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { title: 'Email Alerts', desc: 'Receive emails when background queries finish.' },
                    { title: 'Weekly Reports', desc: 'Get a weekly summary of your database analytics.' },
                    { title: 'Security Alerts', desc: 'Get notified about new logins from unrecognized devices.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">{item.title}</h4>
                        <p className="text-sm text-text-secondary mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
