import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Users, Globe, Shield, Trophy, ChevronRight, Star, Swords, BarChart3, Brain, Zap } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Solo Practice', desc: '15 progressive questions across 3 difficulty levels. Sharpen your skills at your own pace.', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { icon: Swords, title: '1v1 Battle', desc: 'Go head-to-head against another player with real-time score tracking.', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  { icon: Users, title: 'Room Mode', desc: '3-5 players compete together. Create rooms, share codes, and battle!', color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
];

const STATS = [
  { value: '1,247+', label: 'Players', icon: Users },
  { value: '4,280+', label: 'Games Played', icon: BarChart3 },
  { value: '6', label: 'Categories', icon: Globe },
  { value: '90+', label: 'Questions', icon: Star },
];

const CATEGORIES = [
  { icon: '🔬', name: 'Science' },
  { icon: '📜', name: 'History' },
  { icon: '💻', name: 'Technology' },
  { icon: '🌍', name: 'Geography' },
  { icon: '⚽', name: 'Sports' },
  { icon: '🎨', name: 'Arts & Culture' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen text-gray-800" style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #fecdd3, transparent)', filter: 'blur(120px)' }} />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #fda4af, transparent)', filter: 'blur(120px)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e8364e, #f43f5e)', boxShadow: '0 4px 15px rgba(232,54,78,0.3)' }}>
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg text-gray-800 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Quiz<span className="text-rose-500">Blitz</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/leaderboard" className="text-gray-500 hover:text-gray-800 text-sm transition-colors">Leaderboard</Link>
          <Link to="/auth" className="px-5 py-2.5 rounded-xl text-white text-sm transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #e8364e, #f43f5e)', boxShadow: '0 2px 15px rgba(232,54,78,0.25)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-16 pb-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm mb-8"
            style={{ background: 'rgba(232,54,78,0.06)', border: '1px solid rgba(232,54,78,0.15)', color: '#e8364e' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live quiz battles — real-time, multiplayer
          </div>
          <h1 className="text-gray-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', lineHeight: 1.1 }}>
            Challenge Your<br />
            <span style={{ background: 'linear-gradient(135deg, #e8364e, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Knowledge
            </span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>
            Play solo or compete with friends across 6 knowledge categories.
            15 questions, 30-second timer, lifelines, and live leaderboards.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 4px 25px rgba(232,54,78,0.3)' }}>
              <Brain className="w-5 h-5" />
              Play Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/leaderboard"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-gray-700 transition-all hover:bg-rose-50"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
              <Trophy className="w-5 h-5 text-amber-500" />
              View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20"
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-5 text-center bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Icon className="w-5 h-5 text-rose-400 mx-auto mb-2" />
              <p className="text-2xl text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{value}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Choose Your Battle
          </h2>
          <p className="text-center text-gray-500 mb-12">Three game modes to match every mood</p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`rounded-2xl border p-7 ${bg} ${border} bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(232,54,78,0.06)' }}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="relative z-10 px-4 py-20 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            6 Knowledge Domains
          </h2>
          <p className="text-center text-gray-500 mb-12">Difficulty scales from Easy to Medium to Hard</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ icon, name }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="flex flex-col items-center gap-2.5 p-5 rounded-2xl cursor-default transition-all bg-white"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <span className="text-3xl">{icon}</span>
                <p className="text-gray-600 text-xs text-center">{name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 py-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-center text-gray-900 mb-12" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              { num: '01', title: 'Register & Set Preferences', desc: 'Create your account, pick your favorite categories and language.' },
              { num: '02', title: 'Choose Game Mode', desc: 'Solo practice, 1v1 duel, or Room battle with 3-5 players.' },
              { num: '03', title: 'Answer 15 Questions', desc: '5 Easy, 5 Medium, 5 Hard. 30 seconds per question. Use lifelines wisely.' },
              { num: '04', title: 'Climb the Leaderboard', desc: 'Your score is saved globally. Beat the world, earn your rank.' },
            ].map(({ num, title, desc }, i) => (
              <motion.div key={num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 p-6 rounded-2xl bg-white"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="text-3xl flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'rgba(232,54,78,0.25)' }}>
                  {num}
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{title}</h4>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="max-w-2xl mx-auto rounded-3xl p-12 bg-white"
            style={{ border: '1px solid rgba(232,54,78,0.1)', boxShadow: '0 4px 20px rgba(232,54,78,0.06)' }}>
            <Shield className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              Ready to Test Yourself?
            </h2>
            <p className="text-gray-500 mb-8">Join thousands of players competing in real-time quiz battles.</p>
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 4px 30px rgba(232,54,78,0.3)' }}>
              Start Playing Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 text-center py-8 text-gray-400 text-sm">
        <p>2026 QuizBlitz</p>
      </footer>
    </div>
  );
}
