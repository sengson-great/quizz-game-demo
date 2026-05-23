import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../api/axios';
import { Sparkles, Users, Globe, Shield, Trophy, ChevronRight, Star, Swords, BarChart3, Brain, Zap, Download, Cpu, History, Palette } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { usePWA } from '../contexts/PWAContext';


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

    return (<div className="min-h-screen text-[#000000] overflow-x-hidden" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.3]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.03), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.02), transparent)', filter: 'blur(100px)' }}/>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b-[3px] border-black shadow-[0_4px_0_0_rgba(0,0,0,0.1)]" style={{ background: '#FFFFFF', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4" style={{ paddingLeft: 'calc(0.75rem + env(safe-area-inset-left, 0px))', paddingRight: 'calc(0.75rem + env(safe-area-inset-right, 0px))' }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000000] sm:shadow-[3px_3px_0_0_#000000]" style={{ background: '#FACC15' }}>
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#EAB308]"/>
            </div>
            <span className="text-xl sm:text-2xl text-[#000000] logo-text truncate max-w-[120px] sm:max-w-none">
              Quiz No <span className="text-[#EAB308]">Cap</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <Link to={`/${lang}/leaderboard`} className="text-black font-bold hover:text-[#EAB308] text-xs sm:text-sm transition-colors whitespace-nowrap hidden xs:block">{t('leaderboard')}</Link>
            <Link to={`/${lang}/auth`} className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-black text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0_0_#000000] sm:shadow-[4px_4px_0_0_#000000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]" style={{ background: '#FACC15' }}>
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pb-24 max-w-5xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8rem)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-sm mb-10 border-2 border-black shadow-[3px_3px_0_0_#000000]" style={{ background: '#FFFFFF', color: '#000000', fontWeight: 800 }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black"/>
            {t('liveBattles').toUpperCase()}
          </div>
          <h1 
            className="text-[#EAB308] mb-6 sm:mb-8 leading-[1.2] sm:leading-[1.4] max-w-4xl mx-auto px-2" 
            style={{ 
              fontWeight: 800, 
              fontSize: 'clamp(1.75rem, 10vw, 5rem)',
              WebkitTextStroke: 'max(1px, 0.04em) black',
              textShadow: 'max(2px, 0.08em) max(2px, 0.08em) 0px #000000'
            }}
          >
            {t('heroTitle')}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12 font-medium" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
            <Link to={`/${lang}/auth`} className="w-full sm:w-auto group flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-black text-lg sm:text-xl font-bold border-[3px] border-black shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000] transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[8px_8px_0_0_#000000] sm:hover:shadow-[10px_10px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" style={{ background: '#FACC15' }}>
              <Brain className="w-5 h-5 sm:w-6 sm:h-6"/>
              {t('playNow')}
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform"/>
            </Link>
            {(isInstallable || isIOS) && (
                <button 
                    onClick={installPWA}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-white text-lg sm:text-xl font-bold border-[3px] border-black shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000] transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[8px_8px_0_0_#000000] sm:hover:shadow-[10px_10px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" 
                    style={{ background: '#6366F1' }}
                >
                    <Download className="w-5 h-5 sm:w-6 sm:h-6"/>
                    {isIOS ? t('addToHome') : t('installApp')}
                </button>
            )}
            <Link to={`/${lang}/leaderboard`} className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-black text-lg sm:text-xl font-bold border-[3px] border-black shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000] transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[8px_8px_0_0_#000000] sm:hover:shadow-[10px_10px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" style={{ background: '#FFFFFF' }}>
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#FACC15]"/>
              {t('viewLeaderboard')}
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-16 sm:mt-24">
          {STATS.map(({ value, label, icon: Icon, color }) => (<div key={label} className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 text-center border-[2px] sm:border-[3px] border-black shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000]" style={{ background: '#FFFFFF' }}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 ${color}`}/>
              <p className="text-xl sm:text-3xl text-[#000000] mb-0.5 sm:mb-1" style={{ fontWeight: 800 }}>{value}</p>
              <p className="text-slate-500 font-bold uppercase tracking-normal text-[9px] sm:text-[11px]">{label}</p>
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
          <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (<motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-[2px] sm:border-[3px] border-black shadow-[6px_6px_0_0_#000000] sm:shadow-[8px_8px_0_0_#000000] bg-white transition-all hover:translate-x-[-4px] hover:translate-y-[-4px]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border-2 border-black shadow-[3px_3px_0_0_#000000] sm:shadow-[4px_4px_0_0_#000000]" style={{ background: '#FACC15' }}>
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${color}`}/>
                </div>
                <h3 className="text-[#000000] mb-2 sm:mb-3 text-lg sm:text-xl" style={{ fontWeight: 800 }}>{title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">{desc}</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {dynamicCategories.map((cat) => (
              <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.05, y: -4 }} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-card border-[2px] sm:border-[3px] border-black shadow-[3px_3px_0_0_#000000] sm:shadow-[4px_4px_0_0_#000000] bg-white group hover:bg-[#FACC15]/5 transition-all">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <CategoryIcon name={cat.icon} className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: cat.color }} />
                </div>
                <span className="font-bold text-[11px] sm:text-sm text-[#000000] truncate">{(lang === 'km' && cat.nameKm) ? cat.nameKm : cat.name}</span>
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
            <Link to={`/${lang}/auth`} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #FACC15, #FACC15)', boxShadow: '0 4px 30px rgba(250,204,21,0.3)' }}>
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
