import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4"
      style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-8xl mb-6" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'rgba(232,54,78,0.2)' }}>404</p>
        <h1 className="text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Page Not Found</h1>
        <p className="text-gray-500 mb-8">Looks like this question doesn't exist in our database.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:scale-[1.03]"
          style={{ background: 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 4px 15px rgba(232,54,78,0.25)' }}>
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
