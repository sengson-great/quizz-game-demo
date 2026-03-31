import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Users, Globe, Shield, Trophy, ChevronRight, Star, Swords, BarChart3, Brain, Zap } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const CARD_STYLE = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

export default function LandingPage() {
    const { t } = useTranslation();

    const FEATURES = [
        { icon: Zap, title: t('soloPractice'), desc: t('soloDesc'), color: 'text-amber-500', gradient: 'from-amber-500 to-orange-500' },
        { icon: Swords, title: t('battle1v1'), desc: t('battleDesc'), color: 'text-[#E84C6A]', gradient: 'from-[#E84C6A] to-pink-500' },
        { icon: Users, title: t('roomMode'), desc: t('roomDesc'), color: 'text-cyan-500', gradient: 'from-cyan-500 to-teal-500' },
    ];
    const STATS = [
        { value: '1,247+', label: t('statsPlayers'), icon: Users },
        { value: '4,280+', label: t('statsGames'), icon: BarChart3 },
        { value: '6', label: t('statsCategories'), icon: Globe },
        { value: '90+', label: t('statsQuestions'), icon: Star },
    ];
    const CATEGORIES = [
        { icon: '🔬', name: 'Science' },
        { icon: '📜', name: 'History' },
        { icon: '💻', name: 'Technology' },
        { icon: '🌍', name: 'Geography' },
        { icon: '⚽', name: 'Sports' },
        { icon: '🎨', name: 'Arts & Culture' },
    ];
    const STEPS = [
        { num: '01', title: t('step1Title'), desc: t('step1Desc') },
        { num: '02', title: t('step2Title'), desc: t('step2Desc') },
        { num: '03', title: t('step3Title'), desc: t('step3Desc') },
        { num: '04', title: t('step4Title'), desc: t('step4Desc') },
    ];

    return (<div className="min-h-screen text-[#1A1A2E]" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.3]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, #F8BBD0, transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, #F48FB1, transparent)', filter: 'blur(100px)' }}/>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #E84C6A, #F472B6)', boxShadow: '0 4px 15px rgba(232,76,106,0.3)' }}>
            <Sparkles className="w-4.5 h-4.5 text-white"/>
          </div>
          <span className="text-lg text-[#1A1A2E] tracking-wide" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Quiz<span className="text-[#E84C6A]">Blitz</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/leaderboard" className="text-slate-500 hover:text-[#1A1A2E] text-sm transition-colors">{t('leaderboard')}</Link>
          <Link to="/auth" className="px-5 py-2.5 rounded-xl text-white text-sm transition-all hover:shadow-lg hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 2px 15px rgba(232,76,106,0.3)' }}>
            {t('getStarted')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-16 pb-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm mb-8" style={{ background: 'rgba(232,76,106,0.08)', border: '1px solid rgba(232,76,106,0.15)', color: '#E84C6A' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            {t('liveBattles')}
          </div>
          <h1 className="text-[#1A1A2E] mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', lineHeight: 1.1 }}>
            {t('heroTitle').split(' ').map((word, i) => i === 2 ? <><br /><span key={i} style={{ background: 'linear-gradient(135deg, #E84C6A, #F472B6, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{word}</span></> : word + ' ')}
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 25px rgba(232,76,106,0.3)' }}>
              <Brain className="w-5 h-5"/>
              {t('playNow')}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-600 transition-all hover:bg-white/60" style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.6)' }}>
              <Trophy className="w-5 h-5 text-amber-500"/>
              {t('viewLeaderboard')}
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20">
          {STATS.map(({ value, label, icon: Icon }) => (<div key={label} className="rounded-2xl p-5 text-center" style={CARD_STYLE}>
              <Icon className="w-5 h-5 text-[#E84C6A] mx-auto mb-2"/>
              <p className="text-2xl text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-[#1A1A2E] mb-3 text-3xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {t('chooseBattle')}
          </h2>
          <p className="text-center text-slate-500 mb-12">{t('threeModes')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, gradient }, i) => (<motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1" style={CARD_STYLE}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient}`} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <Icon className="w-6 h-6 text-white"/>
                </div>
                <h3 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>))}
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="relative z-10 px-4 py-20 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-[#1A1A2E] mb-3 text-3xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {t('domains')}
          </h2>
          <p className="text-center text-slate-500 mb-12">{t('difficultyScales')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ icon, name }, i) => (<motion.div key={name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ scale: 1.05, y: -4 }} className="flex flex-col items-center gap-2.5 p-5 rounded-2xl cursor-default transition-all" style={CARD_STYLE}>
                <span className="text-3xl">{icon}</span>
                <p className="text-slate-600 text-xs text-center">{name}</p>
              </motion.div>))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 py-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-[#1A1A2E] mb-12 text-3xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {t('howItWorks')}
          </h2>
          <div className="space-y-4">
            {STEPS.map(({ num, title, desc }, i) => (<motion.div key={num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-6 p-6 rounded-2xl" style={CARD_STYLE}>
                <div className="text-3xl flex-shrink-0" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'rgba(232,76,106,0.3)' }}>
                  {num}
                </div>
                <div>
                  <h4 className="text-[#1A1A2E] mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{title}</h4>
                  <p className="text-slate-500 text-sm">{desc}</p>
                </div>
              </motion.div>))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="max-w-2xl mx-auto rounded-3xl p-12" style={{ background: 'rgba(232,76,106,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(232,76,106,0.12)', boxShadow: '0 4px 40px rgba(232,76,106,0.06)' }}>
            <Shield className="w-12 h-12 text-[#E84C6A] mx-auto mb-4"/>
            <h2 className="text-[#1A1A2E] mb-4 text-2xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              {t('readyToTest')}
            </h2>
            <p className="text-slate-500 mb-8">{t('joinThousands')}</p>
            <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 30px rgba(232,76,106,0.3)' }}>
              {t('startPlayingFree')}
              <ChevronRight className="w-5 h-5"/>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 text-center py-8 text-slate-400 text-sm">
        <p>2026 {t('brandName')}</p>
      </footer>
    </div>);
}
