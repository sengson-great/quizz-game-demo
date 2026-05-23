import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, LayoutDashboard, Settings, Shield, LogOut, Sparkles, Music, VolumeX, Brain } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import { useTranslation } from '../../hooks/useTranslation';

export function Navbar() {
    const { currentUser, logout } = useAuth();
    const { isPlaying, isMuted, toggleMute } = useAudio();
    const { t, lang } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(`/${lang}/auth`);
    };

    const navLinks = [
        { to: `/${lang}/dashboard`, label: t('dashboard'), icon: LayoutDashboard, color: '#6366f1' },
        { to: `/${lang}/leaderboard`, label: t('leaderboard'), icon: Trophy, color: '#FACC15' },
        { to: `/${lang}/settings`, label: t('settings'), icon: Settings, color: '#8b5cf6' },
        ...(currentUser?.role === 'admin' ? [{ to: `/${lang}/admin`, label: t('admin'), icon: Shield, color: '#10b981' }] : []),
    ];

    const showMusicBtn = currentUser?.musicEnabled && isPlaying;

    return (<><nav className="fixed top-0 left-0 right-0 z-50 border-b-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,0.1)]" style={{ background: '#FFFFFF', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-7xl mx-auto" style={{ paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))', paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))', paddingBottom: '0.5rem' }}>
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to={`/${lang}/dashboard`} className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="relative flex-shrink-0">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-[12px] sm:rounded-[14px] flex items-center justify-center shadow-lg relative overflow-hidden" 
                style={{ 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                    boxShadow: '0 8px 20px rgba(245,158,11,0.25)',
                    border: '1.5px solid rgba(255,255,255,0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10"/>
              </motion.div>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md border border-amber-100">
                <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]"/>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
                <span style={{ fontFamily: 'inherit', fontWeight: 900 }} className="text-[#000000] text-base sm:text-lg leading-tight tracking-tight uppercase truncate">
                  Quiz No Cap
                </span>
                <span className="hidden sm:block text-[10px] font-black text-[#FACC15] tracking-[0.25em] leading-none opacity-90">
                    CARTOON EDITION
                </span>
            </div>
          </Link>

          {/* Nav Links */}
          {currentUser && (<div className="hidden md:flex items-center gap-2 bg-black/[0.03] p-1.5 rounded-2xl border border-black/[0.02]">
              {navLinks.map(({ to, label, icon: Icon, color }) => {
                const cleanPath = location.pathname.replace(/^\/(en|km)/, '');
                const cleanTo = to.replace(/^\/(en|km)/, '');
                const active = cleanPath === cleanTo || (cleanPath === '' && cleanTo === '/dashboard');
                return (<Link key={to} to={to} className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${active
                        ? 'text-[#000000]'
                        : 'text-slate-500 hover:text-[#000000]'}`}
                        style={active ? { color } : {}}
                    >
                    {active && (
                        <motion.div 
                            layoutId="nav-active"
                            className="absolute inset-0 bg-white shadow-sm border border-black/[0.03] rounded-xl z-0"
                            transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                        />
                    )}
                    <Icon className="w-4.5 h-4.5 relative z-10" style={active ? { color } : { opacity: 0.7 }}/>
                    <span className="relative z-10">{label}</span>
                  </Link>);
            })}
            </div>)}

          {/* User info */}
          <div className="flex items-center gap-2 sm:gap-4">
            {showMusicBtn && (
              <motion.button
                onClick={toggleMute}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(99,102,241,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="p-2 sm:p-2.5 rounded-xl transition-all duration-300 glass-card border-[#FACC15]/20"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />
                ) : (
                  <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-[#FACC15]/20 blur-md rounded-full"
                    />
                    <Music className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FACC15] relative z-10" />
                  </div>
                )}
              </motion.button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden sm:flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-2xl glass-card border-black/[0.05] shadow-sm">
                  <div className="relative">
                    <span className="text-2xl relative z-10 filter drop-shadow-sm">{currentUser.avatar}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#000000] text-[13px] font-bold leading-none">{currentUser.username}</span>
                    <span className="text-[10px] text-[#FACC15] font-black uppercase tracking-normal mt-0.5 opacity-70">
                        {currentUser.role === 'admin' ? t('admin') : t('player')}
                    </span>
                  </div>
                </div>
                {/* Avatar only on mobile */}
                <div className="sm:hidden relative">
                  <span className="text-xl">{currentUser.avatar}</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.08)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout} 
                    className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-red-500 transition-all duration-300 glass-card border-black/[0.05]"
                >
                  <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-500"/>
                </motion.button>
              </div>
            ) : (
              <Link to={`/${lang}/auth`} className="relative group overflow-hidden px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all" style={{ background: 'var(--grad-primary)', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{t('signIn')}</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
    {/* Bottom Navigation Tab Bar for Mobile */}
    {currentUser && (
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-black"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch justify-around h-16" style={{ paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
          {navLinks.map(({ to, label, icon: Icon, color }) => {
            const cleanPath = location.pathname.replace(/^\/(en|km)/, '');
            const cleanTo = to.replace(/^\/(en|km)/, '');
            const active = cleanPath === cleanTo || (cleanPath === '' && cleanTo === '/dashboard');
            return (
              <Link 
                key={to} 
                to={to} 
                className="flex flex-col items-center justify-center flex-1 h-full px-1 relative"
              >
                {/* Active top indicator bar */}
                {active && (
                  <motion.div
                    layoutId="bottom-tab-indicator"
                    className="absolute top-0 left-2 right-2 h-[3px] rounded-b-full"
                    style={{ background: color }}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <motion.div 
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  {/* Icon pill on active */}
                  <div
                    className={`flex items-center justify-center rounded-xl transition-all duration-200 ${active ? 'w-10 h-7 min-[383px]:h-6' : 'w-8 h-7 min-[383px]:h-6'}`}
                    style={active ? { background: `${color}18` } : {}}
                  >
                    <Icon 
                      className="w-[18px] h-[18px]" 
                      strokeWidth={active ? 2.5 : 2}
                      style={{ color: active ? color : '#94a3b8' }}
                    />
                  </div>
                  <span 
                    className="hidden min-[384px]:block text-[8px] tracking-tight uppercase font-black leading-none" 
                    style={{ fontFamily: 'inherit', color: active ? color : '#94a3b8' }}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    )}
    </>);
}



