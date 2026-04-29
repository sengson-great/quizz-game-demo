import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const LIGHT_BG = 'var(--grad-surface)';

export default function AuthPage() {
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const { login, register, currentUser, loading: authLoading } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);
        await new Promise(r => setTimeout(r, 600));
        if (tab === 'login') {
            const result = await login(email, password);
            if (result.success) {
                navigate('/dashboard');
            }
            else {
                setError(result.message);
            }
        }
        else {
            if (!username.trim() || username.length < 3) {
                setError(t('usernameRequired'));
                setFormLoading(false);
                return;
            }
            const result = await register(username, email, password);
            if (result.success) {
                navigate('/dashboard');
            }
            else {
                setError(result.message);
            }
        }
        setFormLoading(false);
    };

    const inputClass = "w-full px-4 py-3 rounded-xl text-[#1A1A2E] placeholder-slate-400 focus:outline-none transition-all text-sm";

    return (<div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.3]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(100px)' }}/>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FACC15, #818CF8)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl text-[#1A1A2E] tracking-normal" style={{ fontFamily: 'inherit', fontWeight: 700 }}>
              Quiz<span className="text-[#FACC15]">Blitz</span>
            </span>
          </Link>
          <p className="text-slate-500 text-sm">
            {tab === 'login' ? t('welcomeBackSignIn') : t('createAccountCompete')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {['login', 'register'].map(tKey => (<button key={tKey} onClick={() => { setTab(tKey); setError(''); }} className={`flex-1 py-4 text-sm rounded-2xl transition-all capitalize ${tab === tKey ? 'text-[#FACC15] border-b-2 border-[#FACC15]' : 'text-slate-400 hover:text-slate-600'}`} style={tab === tKey ? { background: 'rgba(99,102,241,0.04)' } : {}}>
                {tKey === 'login' ? t('signIn') : t('register')}
              </button>))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.form key={tab} initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
                {tab === 'register' && (<div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <input type="text" placeholder={t('username')} value={username} onChange={e => setUsername(e.target.value)} required className={`${inputClass} pl-10`} style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                  </div>)}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                  <input type="email" placeholder={t('emailAddress')} value={email} onChange={e => setEmail(e.target.value)} required className={`${inputClass} pl-10`} style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                  <input type={showPass ? 'text' : 'password'} placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10 pr-10`} style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>

                {tab === 'login' && (
                  <div className="flex justify-end">
                    <Link to="/forgot-password" size="sm" className="text-xs text-slate-400 hover:text-[#FACC15] transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                )}

                <AnimatePresence>
                  {error && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 rounded-xl text-red-600 text-sm" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0"/>
                      {error}
                    </motion.div>)}
                </AnimatePresence>

                <button type="submit" disabled={formLoading} className="w-full py-3.5 rounded-xl text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-70 disabled:scale-100" style={{ background: formLoading ? '#4338CA' : 'linear-gradient(135deg, #FACC15, #4F46E5)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                  {formLoading ? (<span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                      </svg>
                      {tab === 'login' ? t('signingIn') : t('creatingAccount')}
                    </span>) : (tab === 'login' ? t('signIn') : t('register'))}
                </button>

                {tab === 'login' && (<div className="text-center">
                    <p className="text-slate-400 text-xs">
                      {t('player')}: <span className="text-[#FACC15]">admin@example.com</span> / <span className="text-[#FACC15]">password</span>
                    </p>
                  </div>)}
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>);
}
