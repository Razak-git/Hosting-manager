import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/sites': 'My Sites',
    '/files': 'File Manager',
  };

  const title = pageTitles[location.pathname] || 'Hosting Manager';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout-wrapper">
      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className={`bi ${sidebarOpen ? 'bi-x' : 'bi-list'}`}></i>
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-badge">⚡</div>
          <span>Hosting Manager</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>

          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-grid-1x2"></i>
            Dashboard
          </NavLink>

          <NavLink to="/sites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-globe2"></i>
            Sites
          </NavLink>

          <NavLink to="/files" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-folder2-open"></i>
            Files
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="user-email">{user?.email || 'User'}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                borderRadius: '6px',
                transition: 'color 0.15s',
              }}
              title="Logout"
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            <button
              className="topbar-btn"
              title="Logout"
              onClick={logout}
              style={{ textDecoration: 'none' }}
            >
              <i className="bi bi-power"></i>
            </button>
          </div>
        </header>

        <div className="page-content page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
