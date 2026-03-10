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
      style={{ background: value ? '#e8364e' : '#e2e8f0' }}>
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
          style={{ background: 'rgba(232,54,78,0.06)', border: '1px solid rgba(232,54,78,0.12)' }}>
          <Settings className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Settings</h1>
          <p className="text-gray-500 text-sm">Customize your experience</p>
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Profile</h2>

          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-2 block">Username</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-gray-800 focus:outline-none text-sm"
              style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
          </div>

          <div>
            <label className="text-gray-500 text-sm mb-3 block">Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(avatar => (
                <button key={avatar} onClick={() => setForm(f => ({ ...f, avatar }))}
                  className="h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: form.avatar === avatar ? 'rgba(232,54,78,0.06)' : 'rgba(0,0,0,0.02)',
                    border: form.avatar === avatar ? '2px solid #e8364e' : '1px solid rgba(0,0,0,0.06)',
                    transform: form.avatar === avatar ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Audio */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Audio</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
                  <Volume2 className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-gray-800 text-sm">Sound Effects</p>
                  <p className="text-gray-400 text-xs">Answer feedback, timer alerts</p>
                </div>
              </div>
              <ToggleSwitch value={form.soundEnabled} onChange={v => setForm(f => ({ ...f, soundEnabled: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(232,54,78,0.05)', border: '1px solid rgba(232,54,78,0.1)' }}>
                  <Music className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-gray-800 text-sm">Background Music</p>
                  <p className="text-gray-400 text-xs">Ambient music during gameplay</p>
                </div>
              </div>
              <ToggleSwitch value={form.musicEnabled} onChange={v => setForm(f => ({ ...f, musicEnabled: v }))} />
            </div>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-teal-500" />
            <h2 className="text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Language</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LANGUAGES.map(({ code, name, flag }) => (
              <button key={code} onClick={() => setForm(f => ({ ...f, language: code }))}
                className="flex items-center gap-2 p-3 rounded-xl transition-all"
                style={{
                  background: form.language === code ? 'rgba(232,54,78,0.04)' : 'rgba(0,0,0,0.01)',
                  border: form.language === code ? '1px solid rgba(232,54,78,0.2)' : '1px solid rgba(0,0,0,0.06)',
                  color: form.language === code ? '#1a1a2e' : '#64748b',
                }}>
                <span className="text-xl">{flag}</span>
                <span className="text-sm">{name}</span>
                {form.language === code && <Check className="w-3.5 h-3.5 text-rose-500 ml-auto" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Default Categories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-emerald-500" />
            <h2 className="text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Default Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ id, name, icon, color }) => {
              const isSelected = form.preferredCategories.includes(id);
              return (
                <button key={id} onClick={() => toggleCategory(id)}
                  className="flex items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: isSelected ? 'rgba(232,54,78,0.04)' : 'rgba(0,0,0,0.01)',
                    border: isSelected ? '1px solid rgba(232,54,78,0.2)' : '1px solid rgba(0,0,0,0.06)',
                  }}>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm ${isSelected ? '' : 'opacity-40'}`}>
                    {icon}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>{name}</span>
                  {isSelected && <Check className="w-3 h-3 text-rose-500 ml-auto" />}
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
            : { background: 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 4px 15px rgba(232,54,78,0.25)' }
          }>
          {saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </motion.button>
      </div>
    </div>
  );
}
