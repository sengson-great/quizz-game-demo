import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4"
      style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.2]"
          style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(120px)' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <p className="text-8xl mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'rgba(232,76,106,0.25)' }}>404</p>
        <h1 className="text-[#1A1A2E] mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Page Not Found</h1>
        <p className="text-slate-500 mb-8">Looks like this question doesn't exist in our database.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:scale-[1.03]"
          style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 15px rgba(232,76,106,0.3)' }}>
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}