import { Link, useLocation, useNavigate } from 'react-router';
import { Trophy, LayoutDashboard, Settings, Shield, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/settings', label: 'Settings', icon: Settings },
    ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(1.4)', borderColor: 'rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e8364e, #f43f5e)', boxShadow: '0 4px 15px rgba(232,54,78,0.3)' }}>
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}
              className="text-gray-800 text-lg tracking-wide">
              Quiz<span className="text-rose-500">Blitz</span>
            </span>
          </Link>

          {/* Nav Links */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${
                      active
                        ? 'text-rose-600'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-rose-50'
                    }`}
                    style={active ? { background: 'rgba(232,54,78,0.08)', border: '1px solid rgba(232,54,78,0.15)' } : {}}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User info */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="text-xl">{currentUser.avatar}</span>
                  <div>
                    <p className="text-gray-800 text-sm leading-none">{currentUser.username}</p>
                    <p className="text-rose-500 text-xs">{currentUser.totalScore.toLocaleString()} pts</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/auth"
                className="px-5 py-2 rounded-xl text-white text-sm transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e8364e, #f43f5e)', boxShadow: '0 2px 10px rgba(232,54,78,0.25)' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {currentUser && (
          <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                    active ? 'bg-rose-50 text-rose-600' : 'text-gray-400 hover:text-gray-700'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
