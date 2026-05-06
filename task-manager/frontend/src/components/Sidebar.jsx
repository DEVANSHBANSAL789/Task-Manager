import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <CheckCircle className="icon" size={28} />
        <span>TaskFlow</span>
      </div>

      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutDashboard className="icon" />
          Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <FolderKanban className="icon" />
          Projects
        </NavLink>
      </nav>

      <div className="user-profile-mini">
        <div className="user-info-mini" style={{ flex: 1 }}>
          <h4>{user.name}</h4>
          <p>{user.email}</p>
        </div>
        <button onClick={logout} className="close-btn" title="Logout">
          <LogOut size={18} />
          <span className="logout-text" style={{ display: 'none' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
