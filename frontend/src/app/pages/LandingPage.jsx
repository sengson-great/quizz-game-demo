import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../api/axios';
import { Sparkles, Users, Globe, Shield, Trophy, ChevronRight, Star, Swords, BarChart3, Brain, Zap, Download, Cpu, History, Palette } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { usePWA } from '../contexts/PWAContext';
import { CATEGORIES } from '../data/questions';

const LIGHT_BG = 'var(--grad-surface)';
const CARD_STYLE = { 
    background: '#FFFFFF', 
    border: '3px solid #000000', 
    boxShadow: '6px 6px 0px 0px #000000' 
};

const CategoryIcon = ({ name, className, style }) => {
    const icons = { Brain, Cpu, History, Globe, Zap, Palette, Sparkles, Users, Shield, Trophy, Star, Swords, BarChart3, Download };
    const Icon = (typeof name === 'string' ? icons[name] : name) || Brain;
    return <Icon className={className} style={style} />;
};

export default function LandingPage() {
    const { t, lang } = useTranslation();
    const { isInstallable, isIOS, installPWA } = usePWA();

    const FEATURES = [
        { icon: Zap, title: t('soloPractice'), desc: t('soloDesc'), color: 'text-amber-500', gradient: 'from-amber-500 to-orange-500' },
        { icon: Swords, title: t('battle1v1'), desc: t('battleDesc'), color: 'text-[#000000]', gradient: 'from-[#FACC15] to-purple-500' },
        { icon: Users, title: t('roomMode'), desc: t('roomDesc'), color: 'text-cyan-500', gradient: 'from-cyan-500 to-purple-500' },
    ];
    const STATS = [
        { value: '1,247+', label: t('statsPlayers'), icon: Users, color: 'text-indigo-500' },
        { value: '4,280+', label: t('statsGames'), icon: BarChart3, color: 'text-emerald-500' },
        { value: '6', label: t('statsCategories'), icon: Globe, color: 'text-blue-500' },
        { value: '90+', label: t('statsQuestions'), icon: Star, color: 'text-amber-500' },
    ];
    const [dynamicCategories, setDynamicCategories] = useState([]);
    
    useEffect(() => {
        api.get('/categories').then(res => {
            const cats = (res.data.data || res.data || []).filter(c => c.is_enabled).map(c => ({
                id: c.id,
                name: c.name,
                nameKm: c.name_km,
                icon: c.icon || 'Brain',
                color: c.color || '#3b82f6',
            }));
            setDynamicCategories(cats);
        }).catch(e => console.error('Failed to fetch categories', e));
    }, []);

    const STEPS = [
        { num: '01', title: t('step1Title'), desc: t('step1Desc') },
        { num: '02', title: t('step2Title'), desc: t('step2Desc') },
        { num: '03', title: t('step3Title'), desc: t('step3Desc') },
        { num: '04', title: t('step4Title'), desc: t('step4Desc') },
    ];

    return (<div className="min-h-screen text-[#000000]" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.3]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.03), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.02), transparent)', filter: 'blur(100px)' }}/>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,0.1)]" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0_0_#000000]" style={{ background: '#FACC15' }}>
              <Brain className="w-6 h-6 text-[#EAB308]"/>
            </div>
            <span className="text-2xl text-[#000000] logo-text">
              Quiz No <span className="text-[#EAB308]">Cap</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/leaderboard" className="text-black font-bold hover:text-[#EAB308] text-sm transition-colors">{t('leaderboard')}</Link>
            <Link to="/auth" className="px-6 py-2.5 rounded-2xl text-black text-sm font-bold border-2 border-black shadow-[4px_4px_0_0_#000000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000000]" style={{ background: '#FACC15' }}>
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-32 pb-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-sm mb-10 border-2 border-black shadow-[3px_3px_0_0_#000000]" style={{ background: '#FFFFFF', color: '#000000', fontWeight: 800 }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black"/>
            {t('liveBattles').toUpperCase()}
          </div>
          <h1 className="text-[#000000] mb-8 leading-[1.4]" style={{ fontWeight: 800, fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
            {t('heroTitle').split(' ').map((word, i, arr) => (
                <React.Fragment key={i}>
                    {i === Math.floor(arr.length / 2) ? <br /> : ' '}
                    <span className={i === arr.length - 1 ? "text-[#EAB308]" : ""} style={i === arr.length - 1 ? { WebkitTextStroke: '2px black', textShadow: '4px 4px 0px #000000' } : {}}>{word}</span>
                </React.Fragment>
            ))}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12 font-medium" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth" className="group flex items-center gap-3 px-10 py-5 rounded-2xl text-black text-xl font-bold border-[3px] border-black shadow-[6px_6px_0_0_#000000] transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[10px_10px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" style={{ background: '#FACC15' }}>
              <Brain className="w-6 h-6"/>
              {t('playNow')}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform"/>
            </Link>
            {(isInstallable || isIOS) && (
                <button 
                    onClick={installPWA}
                    className="flex items-center gap-3 px-10 py-5 rounded-2xl text-white text-xl font-bold border-[3px] border-black shadow-[6px_6px_0_0_#000000] transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[10px_10px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" 
                    style={{ background: '#6366F1' }}
                >
                    <Download className="w-6 h-6"/>
                    {isIOS ? t('addToHome') : t('installApp')}
                </button>
            )}
            <Link to="/leaderboard" className="flex items-center gap-3 px-10 py-5 rounded-2xl text-black text-xl font-bold border-[3px] border-black shadow-[6px_6px_0_0_#000000] transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[10px_10px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" style={{ background: '#FFFFFF' }}>
              <Trophy className="w-6 h-6 text-[#FACC15]"/>
              {t('viewLeaderboard')}
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-24">
          {STATS.map(({ value, label, icon: Icon, color }) => (<div key={label} className="rounded-3xl p-6 text-center border-[3px] border-black shadow-[6px_6px_0_0_#000000]" style={{ background: '#FFFFFF' }}>
              <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`}/>
              <p className="text-3xl text-[#000000] mb-1" style={{ fontWeight: 800 }}>{value}</p>
              <p className="text-slate-500 font-bold uppercase tracking-normal text-[11px]">{label}</p>
            </div>))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-[#000000] mb-4 text-4xl" style={{ fontWeight: 800 }}>
            {t('chooseBattle')}
          </h2>
          <p className="text-center text-slate-600 mb-16 font-bold uppercase tracking-normal text-sm">{t('threeModes')}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (<motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="rounded-3xl p-8 border-[3px] border-black shadow-[8px_8px_0_0_#000000] bg-white transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_#000000]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 border-black shadow-[4px_4px_0_0_#000000]" style={{ background: '#FACC15' }}>
                  <Icon className={`w-7 h-7 ${color}`}/>
                </div>
                <h3 className="text-[#000000] mb-3 text-xl" style={{ fontWeight: 800 }}>{title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{desc}</p>
              </motion.div>))}
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="relative z-10 px-4 py-20 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-[#1A1A2E] mb-3 text-3xl" style={{ fontFamily: 'inherit', fontWeight: 700 }}>
            {t('domains')}
          </h2>
          <p className="text-center text-slate-500 mb-12">{t('difficultyScales')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.05, y: -4 }} className="flex items-center gap-3 p-4 rounded-2xl glass-card border-[3px] border-black shadow-[4px_4px_0_0_#000000] bg-white group hover:bg-[#FACC15]/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CategoryIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <span className="font-bold text-sm text-[#000000]">{(lang === 'km' && cat.nameKm) ? cat.nameKm : cat.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 py-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-[#1A1A2E] mb-12 text-3xl" style={{ fontFamily: 'inherit', fontWeight: 700 }}>
            {t('howItWorks')}
          </h2>
          <div className="space-y-4">
            {STEPS.map(({ num, title, desc }, i) => (<motion.div key={num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-6 p-6 rounded-2xl" style={CARD_STYLE}>
                <div className="text-3xl flex-shrink-0" style={{ fontFamily: 'inherit', fontWeight: 800, color: 'rgba(250,204,21,0.3)' }}>
                  {num}
                </div>
                <div>
                  <h4 className="text-[#1A1A2E] mb-1" style={{ fontFamily: 'inherit', fontWeight: 600 }}>{title}</h4>
                  <p className="text-slate-500 text-sm">{desc}</p>
                </div>
              </motion.div>))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="max-w-2xl mx-auto rounded-3xl p-12" style={{ background: 'rgba(250,204,21,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(250,204,21,0.12)', boxShadow: '0 4px 40px rgba(250,204,21,0.06)' }}>
            <Shield className="w-12 h-12 text-[#FACC15] mx-auto mb-4"/>
            <h2 className="text-[#1A1A2E] mb-4 text-2xl" style={{ fontFamily: 'inherit', fontWeight: 700 }}>
              {t('readyToTest')}
            </h2>
            <p className="text-slate-500 mb-8">{t('joinThousands')}</p>
            <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #FACC15, #FACC15)', boxShadow: '0 4px 30px rgba(250,204,21,0.3)' }}>
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
