import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
const LIGHT_BG = 'var(--grad-surface)';
export default function NotFoundPage() {
    const { lang } = useTranslation();
    return (<div className="min-h-screen flex items-center justify-center text-center px-4" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(120px)' }}/>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <p className="text-8xl mb-6" style={{ fontFamily: 'inherit', fontWeight: 800, color: 'rgba(250,204,21,0.25)' }}>404</p>
        <h1 className="text-[#1A1A2E] mb-3" style={{ fontFamily: 'inherit', fontWeight: 700 }}>Page Not Found</h1>
        <p className="text-slate-500 mb-8">Looks like this question doesn't exist in our database.</p>
        <Link to={`/${lang}/`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #FACC15, #065F46)', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' }}>
          <Home className="w-4 h-4"/> Back to Home
        </Link>
      </motion.div>
    </div>);
}
