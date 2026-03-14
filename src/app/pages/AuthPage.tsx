import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (tab === 'login') {
      const ok = login(email, password);
      if (ok) { navigate('/dashboard'); }
      else { setError('Invalid email or password. Try admin@quiz.com / admin123'); }
    } else {
      if (!username.trim() || username.length < 3) { setError('Username must be at least 3 characters'); setLoading(false); return; }
      const ok = register(username, email, password);
      if (ok) { navigate('/dashboard'); }
      else { setError('Email already registered.'); }
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: 'linear-gradient(145deg, #0a0e27 0%, #131842 40%, #1a1145 70%, #0f172a 100%)', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(100px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              Quiz<span className="text-indigo-400">Blitz</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm">
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account and start competing'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-4 text-sm transition-all capitalize ${
                  tab === t ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={tab === t ? { background: 'rgba(99,102,241,0.05)' } : {}}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.form
                key={tab}
                initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {tab === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Username" value={username}
                      onChange={e => setUsername(e.target.value)} required
                      className={`${inputClass} pl-10`}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" placeholder="Email address" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    className={`${inputClass} pl-10`}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6}
                    className={`${inputClass} pl-10 pr-10`}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl text-red-400 text-sm"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
                  style={{ background: loading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    tab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>

                {tab === 'login' && (
                  <div className="text-center">
                    <p className="text-slate-500 text-xs">
                      Demo: <span className="text-indigo-400">admin@quiz.com</span> / <span className="text-indigo-400">admin123</span>
                    </p>
                  </div>
                )}
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}