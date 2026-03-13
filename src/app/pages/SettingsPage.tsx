import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Settings, Volume2, Music, Globe, Tag, Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/questions';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const AVATARS = ['🦊', '🐺', '🦋', '🐉', '🦅', '🐬', '🦁', '🐙', '🐸', '🦄', '🦉', '🐆'];

export default function SettingsPage() {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    username: currentUser?.username || '',
    avatar: currentUser?.avatar || '🦊',
    language: currentUser?.language || 'en',
    soundEnabled: currentUser?.soundEnabled ?? true,
    musicEnabled: currentUser?.musicEnabled ?? false,
    preferredCategories: currentUser?.preferredCategories || CATEGORIES.map(c => c.id),
  });

  useEffect(() => {
    if (!currentUser) navigate('/auth');
  }, [currentUser, navigate]);

  const toggleCategory = (id: string) => {
    setForm(f => ({
      ...f,
      preferredCategories: f.preferredCategories.includes(id)
        ? (f.preferredCategories.length > 1 ? f.preferredCategories.filter(c => c !== id) : f.preferredCategories)
        : [...f.preferredCategories, id],
    }));
  };

  const handleSave = () => {
    updateUser({
      username: form.username,
      avatar: form.avatar,
      language: form.language,
      soundEnabled: form.soundEnabled,
      musicEnabled: form.musicEnabled,
      preferredCategories: form.preferredCategories,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!currentUser) return null;

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300"
      style={{ background: value ? '#6366f1' : 'rgba(255,255,255,0.15)' }}>
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Settings className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Settings</h1>
          <p className="text-slate-400 text-sm">Customize your experience</p>
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Profile</h2>

          <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Username</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-3 block">Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(avatar => (
                <button key={avatar} onClick={() => setForm(f => ({ ...f, avatar }))}
                  className="h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: form.avatar === avatar ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: form.avatar === avatar ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    transform: form.avatar === avatar ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: form.avatar === avatar ? '0 0 15px rgba(99,102,241,0.2)' : 'none',
                  }}>
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Audio */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Audio</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <Volume2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Sound Effects</p>
                  <p className="text-slate-500 text-xs">Answer feedback, timer alerts</p>
                </div>
              </div>
              <ToggleSwitch value={form.soundEnabled} onChange={v => setForm(f => ({ ...f, soundEnabled: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <Music className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Background Music</p>
                  <p className="text-slate-500 text-xs">Ambient music during gameplay</p>
                </div>
              </div>
              <ToggleSwitch value={form.musicEnabled} onChange={v => setForm(f => ({ ...f, musicEnabled: v }))} />
            </div>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Language</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LANGUAGES.map(({ code, name, flag }) => (
              <button key={code} onClick={() => setForm(f => ({ ...f, language: code }))}
                className="flex items-center gap-2 p-3 rounded-xl transition-all"
                style={{
                  background: form.language === code ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                  border: form.language === code ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  color: form.language === code ? '#c7d2fe' : '#94a3b8',
                }}>
                <span className="text-xl">{flag}</span>
                <span className="text-sm">{name}</span>
                {form.language === code && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Default Categories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Default Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ id, name, icon, color }) => {
              const isSelected = form.preferredCategories.includes(id);
              return (
                <button key={id} onClick={() => toggleCategory(id)}
                  className="flex items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm ${isSelected ? '' : 'opacity-40'}`}>
                    {icon}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-white' : 'text-slate-500'}`}>{name}</span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-400 ml-auto" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Save */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
          style={saved
            ? { background: '#059669' }
            : { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }
          }>
          {saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </motion.button>
      </div>
    </div>
  );
}
