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
      style={{ background: 'rgba(10,14,39,0.8)', backdropFilter: 'blur(24px) saturate(1.4)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}
              className="text-white text-lg tracking-wide">
              Quiz<span className="text-indigo-400">Blitz</span>
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
                        ? 'text-indigo-300'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={active ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' } : {}}>
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
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-xl">{currentUser.avatar}</span>
                  <div>
                    <p className="text-white text-sm leading-none">{currentUser.username}</p>
                    <p className="text-indigo-400 text-xs">{currentUser.totalScore.toLocaleString()} pts</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all duration-200">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/auth"
                className="px-5 py-2 rounded-xl text-white text-sm transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 10px rgba(99,102,241,0.35)' }}>
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
                    active ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-500 hover:text-slate-300'
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
