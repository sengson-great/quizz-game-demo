import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LIGHT_BG = 'var(--grad-surface)';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: searchParams.get('email') || '',
        token: searchParams.get('token') || '',
        password: '',
        password_confirmation: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState({ loading: false, error: '', success: false });

    useEffect(() => {
        if (!form.token || !form.email) {
            setStatus(s => ({ ...s, error: "Invalid or missing reset link parameters." }));
        }
    }, [form.token, form.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: false });

        if (form.password !== form.password_confirmation) {
            setStatus({ loading: false, error: "Passwords do not match.", success: false });
            return;
        }

        const result = await resetPassword(form);

        if (result.success) {
            setStatus({ loading: false, error: '', success: true });
            setTimeout(() => navigate('/auth'), 3000);
        } else {
            setStatus({ loading: false, error: result.message, success: false });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2.5 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FACC15, #8B5CF6)', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' }}>
                            <Sparkles className="w-5 h-5 text-white"/>
                        </div>
                        <span className="text-xl text-[#1A1A2E] tracking-normal" style={{ fontFamily: 'inherit', fontWeight: 700 }}>
                            Quiz<span className="text-[#FACC15]">Blitz</span>
                        </span>
                    </div>
                    <h2 className="text-[#1A1A2E] text-2xl font-bold mb-2">Create New Password</h2>
                    <p className="text-slate-500 text-sm">Please enter your new password below.</p>
                </div>

                <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    {status.success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle className="w-8 h-8"/>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[#1A1A2E] font-bold text-lg">Password Reset Successfully!</h3>
                                <p className="text-slate-500 text-sm">Your password has been updated. Redirecting to login...</p>
                            </div>
                            <Link to="/auth" className="block w-full py-4 rounded-xl text-white text-sm font-bold bg-[#FACC15]">
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                <input 
                                    type={showPass ? 'text' : 'password'} 
                                    placeholder="New Password" 
                                    value={form.password} 
                                    onChange={e => setForm({ ...form, password: e.target.value })} 
                                    required 
                                    minLength={8}
                                    className="w-full pl-10 pr-10 py-3.5 rounded-xl text-[#1A1A2E] placeholder-slate-400 focus:outline-none transition-all text-sm"
                                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </button>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                <input 
                                    type={showPass ? 'text' : 'password'} 
                                    placeholder="Confirm New Password" 
                                    value={form.password_confirmation} 
                                    onChange={e => setForm({ ...form, password_confirmation: e.target.value })} 
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
                                disabled={status.loading || !form.token}
                                className="w-full py-4 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-70"
                                style={{ background: 'linear-gradient(135deg, #FACC15, #065F46)', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' }}
                            >
                                {status.loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
