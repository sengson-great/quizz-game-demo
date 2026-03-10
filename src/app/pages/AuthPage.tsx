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

  const inputClass = "w-full px-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #fecdd3, transparent)', filter: 'blur(100px)' }} />
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
              style={{ background: 'linear-gradient(135deg, #e8364e, #f43f5e)', boxShadow: '0 4px 15px rgba(232,54,78,0.3)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-gray-800 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              Quiz<span className="text-rose-500">Blitz</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm">
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account and start competing'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-4 text-sm transition-all capitalize ${
                  tab === t ? 'text-rose-500 border-b-2 border-rose-500' : 'text-gray-400 hover:text-gray-600'
                }`}
                style={tab === t ? { background: 'rgba(232,54,78,0.03)' } : {}}>
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
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Username" value={username}
                      onChange={e => setUsername(e.target.value)} required
                      className={`${inputClass} pl-10`}
                      style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="Email address" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    className={`${inputClass} pl-10`}
                    style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6}
                    className={`${inputClass} pl-10 pr-10`}
                    style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl text-rose-500 text-sm"
                      style={{ background: 'rgba(232,54,78,0.06)', border: '1px solid rgba(232,54,78,0.12)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
                  style={{ background: loading ? '#be123c' : 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 4px 15px rgba(232,54,78,0.25)' }}>
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
                    <p className="text-gray-400 text-xs">
                      Demo: <span className="text-rose-500">admin@quiz.com</span> / <span className="text-rose-500">admin123</span>
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
