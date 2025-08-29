// app/components/Footer.jsx
export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '40px 0 20px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          <div>
            <h4 style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              FocusMate
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Beautiful productivity tools designed to help you focus, achieve your goals, and maintain work-life balance.
            </p>
          </div>
          
          <div>
            <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Features
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/focus" style={{ color: 'var(--text-secondary)' }}>Focus Sessions</a>
              <a href="/pomodoro" style={{ color: 'var(--text-secondary)' }}>Pomodoro Timer</a>
              <a href="/taskmanager" style={{ color: 'var(--text-secondary)' }}>Task Manager</a>
              <a href="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</a>
            </div>
          </div>
          
          <div>
            <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Account
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/auth/login" style={{ color: 'var(--text-secondary)' }}>Sign In</a>
              <a href="/auth/signup" style={{ color: 'var(--text-secondary)' }}>Create Account</a>
            </div>
          </div>
        </div>
        
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            © {new Date().getFullYear()} FocusMate. Crafted with care for productivity.
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            No tracking • Privacy focused • Open source
          </span>
        </div>
      </div>
    </footer>
  );
}
