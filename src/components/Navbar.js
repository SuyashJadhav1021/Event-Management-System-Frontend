import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Menu, X, LogOut, User, Shield, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${
        isActive(to) ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">EventHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Events')}
            {isLoggedIn && navLink('/my-events', 'My Events')}
            {isAdmin && navLink('/admin', 'Dashboard')}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {isAdmin ? <Shield size={14} className="text-indigo-600" /> : <User size={14} />}
                  <span className="font-medium">{user?.name}</span>
                  {isAdmin && (
                    <span className="badge bg-indigo-100 text-indigo-700">Admin</span>
                  )}
                </div>
                {isAdmin && (
                  <Link to="/admin/events/new" className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
                    <PlusCircle size={15} /> New Event
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Register</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          {navLink('/', 'Events')}
          {isLoggedIn && navLink('/my-events', 'My Events')}
          {isAdmin && navLink('/admin', 'Dashboard')}
          <hr className="border-gray-100" />
          {isLoggedIn ? (
            <>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <User size={14} />
                <span>{user?.name}</span>
                {isAdmin && <span className="badge bg-indigo-100 text-indigo-700">Admin</span>}
              </div>
              {isAdmin && (
                <Link to="/admin/events/new" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">
                  + New Event
                </Link>
              )}
              <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2 justify-center">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm text-center">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
