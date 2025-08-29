import React, { useState } from 'react';
import { User, Bell, Palette, Shield, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';

const SettingsUI = () => {
  const [profile, setProfile] = useState({
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      color: isDarkMode ? '#e9ecef' : '#212529',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>Settings</h1>
      </header>

      {/* Profile Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', borderBottom: `1px solid ${isDarkMode ? '#343a40' : '#dee2e6'}`, paddingBottom: '8px', marginBottom: '16px' }}>
          <User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Profile Information
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#495057' : '#ced4da'}`,
                backgroundColor: isDarkMode ? '#212529' : 'white',
                color: 'inherit'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#495057' : '#ced4da'}`,
                backgroundColor: isDarkMode ? '#212529' : 'white',
                color: 'inherit'
              }}
            />
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', borderBottom: `1px solid ${isDarkMode ? '#343a40' : '#dee2e6'}`, paddingBottom: '8px', marginBottom: '16px' }}>
          <Palette size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Appearance
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: isDarkMode ? '#212529' : 'white', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            <span>Dark Mode</span>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
            <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: isDarkMode ? '#007bff' : '#ccc', transition: '.4s', borderRadius: '28px'
            }}></span>
            <span style={{
              position: 'absolute', content: '""', height: '20px', width: '20px', left: '4px', bottom: '4px',
              backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
              transform: isDarkMode ? 'translateX(22px)' : 'translateX(0)'
            }}></span>
          </label>
        </div>
      </section>

      {/* Notifications Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', borderBottom: `1px solid ${isDarkMode ? '#343a40' : '#dee2e6'}`, paddingBottom: '8px', marginBottom: '16px' }}>
          <Bell size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Notifications
        </h2>
        <div style={{ backgroundColor: isDarkMode ? '#212529' : 'white', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: `1px solid ${isDarkMode ? '#343a40' : '#f1f3f5'}` }}>
            <span>Email Notifications</span>
            <input type="checkbox" checked={notifications.email} onChange={() => setNotifications(n => ({...n, email: !n.email}))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
            <span>Push Notifications</span>
            <input type="checkbox" checked={notifications.push} onChange={() => setNotifications(n => ({...n, push: !n.push}))} />
          </div>
        </div>
      </section>
      
      {/* Action Buttons */}
      <section>
        <div style={{ backgroundColor: isDarkMode ? '#212529' : 'white', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: `1px solid ${isDarkMode ? '#343a40' : '#f1f3f5'}`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={18} />
              <span>Security & Password</span>
            </div>
            <ChevronRight size={18} color={isDarkMode ? '#6c757d' : '#adb5bd'} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', color: '#dc3545', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LogOut size={18} />
              <span>Log Out</span>
            </div>
            <ChevronRight size={18} />
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '32px', textAlign: 'center' }}>
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Save Changes
        </button>
      </footer>
    </div>
  );
};

export default SettingsUI;
