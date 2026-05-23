import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Mail, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const LIGHT_BG = 'var(--grad-surface)';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', success: false, message: '' });
    const { forgotPassword } = useAuth();
    const { t, lang } = useTranslation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: false, message: '' });
        
        const result = await forgotPassword(email);
        
        if (result.success) {
            setStatus({ loading: false, error: '', success: true, message: result.message });
        } else {
            setStatus({ loading: false, error: result.message, success: false, message: '' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.3]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(100px)' }}/>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to={`/${lang}/`} className="inline-flex items-center gap-2.5 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FACC15, #8B5CF6)', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' }}>
                            <Sparkles className="w-5 h-5 text-white"/>
                        </div>
                        <span className="text-xl text-[#1A1A2E] tracking-normal" style={{ fontFamily: 'inherit', fontWeight: 700 }}>
                            Quiz No <span className="text-[#FACC15]">Cap</span>
                        </span>
                    </Link>
                    <h2 className="text-[#1A1A2E] text-2xl font-bold mb-2">Reset Password</h2>
                    <p className="text-slate-500 text-sm">Enter your email and we'll send you a reset link.</p>
                </div>

                <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    {status.success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle className="w-8 h-8"/>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[#1A1A2E] font-bold text-lg">Check your email</h3>
                                <p className="text-slate-500 text-sm">{status.message || "We've sent a password reset link to your email."}</p>
                            </div>
                            <Link to={`/${lang}/auth`} className="flex items-center justify-center gap-2 text-[#FACC15] text-sm font-semibold hover:underline">
                                <ChevronLeft className="w-4 h-4"/> Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-[#1A1A2E] placeholder-slate-400 focus:outline-none transition-all text-sm"
                                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}
                                />
                            </div>

                            {status.error && (
                                <div className="flex items-center gap-2 p-3 rounded-xl text-red-600 text-sm" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0"/>
                                    {status.error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={status.loading}
                                className="w-full py-4 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-70"
                                style={{ background: 'linear-gradient(135deg, #FACC15, #065F46)', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' }}
                            >
                                {status.loading ? "Sending..." : "Send Reset Link"}
                            </button>

                            <Link to={`/${lang}/auth`} className="flex items-center justify-center gap-2 text-slate-400 text-sm hover:text-slate-600 transition-colors">
                                <ChevronLeft className="w-4 h-4"/> Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
