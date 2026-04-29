import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, LayoutDashboard, Settings, Shield, LogOut, Sparkles, Music, VolumeX, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import { useTranslation } from '../../hooks/useTranslation';

export function Navbar() {
    const { currentUser, logout } = useAuth();
    const { isPlaying, isMuted, toggleMute } = useAudio();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { to: '/leaderboard', label: t('leaderboard'), icon: Trophy },
        { to: '/settings', label: t('settings'), icon: Settings },
        ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: t('admin'), icon: Shield }] : []),
    ];

    const showMusicBtn = currentUser?.musicEnabled && isPlaying;

    return (<nav className="fixed top-0 left-0 right-0 z-50 border-b-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,0.1)]" style={{ background: '#FFFFFF', paddingTop: 'var(--safe-area-top)' }}>
      <div className="max-w-7xl mx-auto" style={{ paddingLeft: 'calc(1rem + var(--safe-area-left))', paddingRight: 'calc(1rem + var(--safe-area-right))', paddingBottom: '0.5rem' }}>
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-lg relative overflow-hidden" 
                style={{ 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                    boxShadow: '0 8px 20px rgba(245,158,11,0.25)',
                    border: '1.5px solid rgba(255,255,255,0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                <Crown className="w-6 h-6 text-white fill-white/20 relative z-10"/>
              </motion.div>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md border border-amber-100">
                <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]"/>
              </div>
            </div>
            <div className="flex flex-col">
                <span style={{ fontFamily: 'inherit', fontWeight: 900 }} className="text-[#000000] text-lg leading-tight tracking-tight uppercase">
                  Millionaire
                </span>
                <span className="text-[10px] font-black text-[#FACC15] tracking-[0.25em] leading-none opacity-90">
                    QUIZ CHALLENGE
                </span>
            </div>
          </Link>

          {/* Nav Links */}
          {currentUser && (<div className="hidden md:flex items-center gap-2 bg-black/[0.03] p-1.5 rounded-2xl border border-black/[0.02]">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (<Link key={to} to={to} className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${active
                        ? 'text-[#FACC15]'
                        : 'text-slate-500 hover:text-[#000000]'}`}>
                    {active && (
                        <motion.div 
                            layoutId="nav-active"
                            className="absolute inset-0 bg-white shadow-sm border border-black/[0.03] rounded-xl z-0"
                            transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                        />
                    )}
                    <Icon className={`w-4.5 h-4.5 relative z-10 ${active ? 'text-[#FACC15]' : 'opacity-70'}`}/>
                    <span className="relative z-10">{label}</span>
                  </Link>);
            })}
            </div>)}

          {/* User info */}
          <div className="flex items-center gap-4">
            {showMusicBtn && (
              <motion.button
                onClick={toggleMute}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(99,102,241,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl transition-all duration-300 glass-card border-[#FACC15]/20"
              >
                {isMuted ? (
                  <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                ) : (
                  <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-[#FACC15]/20 blur-md rounded-full"
                    />
                    <Music className="w-4.5 h-4.5 text-[#FACC15] relative z-10" />
                  </div>
                )}
              </motion.button>
            )}

            {currentUser ? (<div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-2xl glass-card border-black/[0.05] shadow-sm">
                  <div className="relative">
                    <span className="text-2xl relative z-10 filter drop-shadow-sm">{currentUser.avatar}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#000000] text-[13px] font-bold leading-none">{currentUser.username}</span>
                    <span className="text-[10px] text-[#FACC15] font-black uppercase tracking-normal mt-0.5 opacity-70">
                        PLAYER
                    </span>
                  </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.08)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout} 
                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 transition-all duration-300 glass-card border-black/[0.05]"
                >
                  <LogOut className="w-4.5 h-4.5"/>
                </motion.button>
              </div>) : (
              <Link to="/auth" className="relative group overflow-hidden px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all" style={{ background: 'var(--grad-primary)', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{t('signIn')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {currentUser && (<div className="md:hidden flex items-center gap-1.5 pb-3 overflow-x-auto no-scrollbar scrollbar-hide px-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (<Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-300 ${active ? 'bg-[#FACC15] text-white shadow-md' : 'bg-black/[0.03] text-slate-500 hover:text-[#000000]'}`}>
                  <Icon className="w-4 h-4"/>
                  {label}
                </Link>);
            })}
          </div>)}
      </div>
    </nav>);
}



