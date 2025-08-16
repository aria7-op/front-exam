import React, { useState } from 'react';
import { useTheme } from '../../contexts/theme/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      timezone: 'UTC-5'
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      attendance: true,
      tasks: true,
      system: false
    },
    security: {
      twoFactor: false,
      biometric: true,
      sessionTimeout: 30,
      passwordExpiry: 90
    }
  });

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={settings.profile.name}
          onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={settings.profile.phone}
          onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timezone
        </label>
        <select
          value={settings.profile.timezone}
          onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="UTC-8">Pacific Time (UTC-8)</option>
          <option value="UTC-5">Eastern Time (UTC-5)</option>
          <option value="UTC+0">UTC</option>
          <option value="UTC+1">Central European Time (UTC+1)</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notification Channels</h3>
        <div className="space-y-3">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key === 'twoFactor' ? 'Two Factor' : key}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Security Options</h3>
        <div className="space-y-3">
          {Object.entries(settings.security).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key === 'twoFactor' ? 'Two Factor Authentication' : 
                 key === 'biometric' ? 'Biometric Login' :
                 key === 'sessionTimeout' ? 'Session Timeout (minutes)' :
                 key === 'passwordExpiry' ? 'Password Expiry (days)' : key}
              </span>
              {typeof value === 'boolean' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange('security', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              ) : (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleSettingChange('security', key, parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => toggleTheme()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current theme: {theme}
          </span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 p-4">
            <TabButton id="profile" label="Profile" icon="👤" />
            <TabButton id="notifications" label="Notifications" icon="🔔" />
            <TabButton id="security" label="Security" icon="🔒" />
            <TabButton id="appearance" label="Appearance" icon="🎨" />
          </div>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings; 