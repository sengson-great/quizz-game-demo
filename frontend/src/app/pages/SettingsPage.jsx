import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings, Volume2, Music, Globe, Tag, Save, Check, Download, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { CATEGORIES } from '../data/questions';
import { useTranslation } from '../hooks/useTranslation';
import { usePWA } from '../contexts/PWAContext';

const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

const LANGUAGES = [
    { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' }, { code: 'en', name: 'English', flag: '🇬🇧' },
];
const AVATARS = ['🦊', '🐺', '🦋', '🐉', '🦅', '🐬', '🦁', '🐙', '🐸', '🦄', '🦉', '🐆', '🐯', '🐻', '🐼'];

const ToggleSwitch = memo(({ value, onChange }) => (<button onClick={() => onChange(!value)} className="relative w-12 h-6 rounded-full transition-all duration-300" style={{ background: value ? '#E84C6A' : 'rgba(0,0,0,0.12)' }}>
  <motion.div animate={{ x: value ? 24 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"/>
</button>));

const VolumeSlider = memo(({ value, onChange }) => (
  <input 
      type="range" min="0" max="1" step="0.01" 
      value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#E84C6A]" 
      style={{ background: 'rgba(0,0,0,0.08)' }} 
  />
));

export default function SettingsPage() {
    const { currentUser, updateUser } = useAuth();
    const { sfxVolume, setSfxVolume, volume, setMusicVolume } = useAudio();
    const { t } = useTranslation();
    const { isInstallable, isInstalled, isIOS, installPWA } = usePWA();
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        username: currentUser?.username || '', avatar: currentUser?.avatar || '🦊', language: currentUser?.language || 'km',
        soundEnabled: currentUser?.soundEnabled ?? true, musicEnabled: currentUser?.musicEnabled ?? true,
        preferredCategories: currentUser?.preferredCategories || CATEGORIES.map(c => c.id),
    });

    const toggleCategory = (id) => { setForm(f => ({ ...f, preferredCategories: f.preferredCategories.includes(id) ? (f.preferredCategories.length > 1 ? f.preferredCategories.filter(c => c !== id) : f.preferredCategories) : [...f.preferredCategories, id] })); };
    const handleSave = () => { updateUser({ username: form.username, avatar: form.avatar, language: form.language, soundEnabled: form.soundEnabled, musicEnabled: form.musicEnabled, preferredCategories: form.preferredCategories }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
    if (!currentUser)
        return null;

    return (<div className="min-h-screen px-4 py-8 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,76,106,0.08)', border: '1px solid rgba(232,76,106,0.15)' }}>
          <Settings className="w-5 h-5 text-[#E84C6A]"/>
        </div>
        <div>
          <h1 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{t('settings')}</h1>
          <p className="text-slate-500 text-sm">{t('customizeExperience')}</p>
        </div>
      </motion.div>

      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={CARD}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.12)' }}>
                        <Smartphone className="w-4 h-4 text-cyan-500"/>
                    </div>
                    <div>
                        <p className="text-[#1A1A2E] text-sm font-semibold">{isIOS ? 'Add to Home Screen' : 'Install App'}</p>
                        <p className="text-slate-500 text-[10px]">{isIOS ? 'Get the full app experience' : 'Get a better experience on your home screen'}</p>
                    </div>
                </div>
                {isInstalled ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Check className="w-3 h-3"/>
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Installed</span>
                    </div>
                ) : (isInstallable || isIOS) ? (
                    <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={installPWA}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md"
                        style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}
                    >
                        <Download className="w-3.5 h-3.5"/> {isIOS ? 'How to' : 'Download'}
                    </motion.button>
                ) : (
                    <div className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded">
                        Not supported
                    </div>
                )}
            </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('profile')}</h2>
          <div className="mb-4">
            <label className="text-slate-500 text-sm mb-2 block">{t('username')}</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-[#1A1A2E] focus:outline-none text-sm" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
          </div>
          <div>
            <label className="text-slate-500 text-sm mb-3 block">{t('avatar')}</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(avatar => (<button key={avatar} onClick={() => setForm(f => ({ ...f, avatar }))} className="h-12 rounded-xl text-2xl flex items-center justify-center transition-all" style={{ background: form.avatar === avatar ? 'rgba(232,76,106,0.1)' : 'rgba(0,0,0,0.02)', border: form.avatar === avatar ? '2px solid #E84C6A' : '1px solid rgba(0,0,0,0.06)', transform: form.avatar === avatar ? 'scale(1.1)' : 'scale(1)', boxShadow: form.avatar === avatar ? '0 0 15px rgba(232,76,106,0.15)' : 'none' }}>
                  {avatar}
                </button>))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('audio')}</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}><Volume2 className="w-4 h-4 text-amber-500"/></div>
                  <div><p className="text-[#1A1A2E] text-sm">{t('soundEffects')}</p></div>
                </div>
                <ToggleSwitch value={form.soundEnabled} onChange={v => setForm(f => ({ ...f, soundEnabled: v }))}/>
              </div>
              <div className="flex items-center gap-3 px-1">
                 <span className="text-[10px] text-slate-400 w-4">0%</span>
                 <VolumeSlider value={sfxVolume} onChange={setSfxVolume} />
                 <span className="text-[10px] text-slate-400 w-4">100%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}><Music className="w-4 h-4 text-[#E84C6A]"/></div>
                  <div><p className="text-[#1A1A2E] text-sm">{t('backgroundMusic')}</p></div>
                </div>
                <ToggleSwitch value={form.musicEnabled} onChange={v => setForm(f => ({ ...f, musicEnabled: v }))}/>
              </div>
              <div className="flex items-center gap-3 px-1">
                 <span className="text-[10px] text-slate-400 w-4">0%</span>
                 <VolumeSlider value={volume} onChange={setMusicVolume} />
                 <span className="text-[10px] text-slate-400 w-4">100%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6" style={CARD}>
          <div className="flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-cyan-500"/><h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('language')}</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LANGUAGES.map(({ code, name, flag }) => (<button key={code} onClick={() => setForm(f => ({ ...f, language: code }))} className="flex items-center gap-2 p-3 rounded-xl transition-all" style={{ background: form.language === code ? 'rgba(232,76,106,0.06)' : 'rgba(0,0,0,0.02)', border: form.language === code ? '1px solid rgba(232,76,106,0.2)' : '1px solid rgba(0,0,0,0.06)', color: form.language === code ? '#E84C6A' : '#64748b' }}>
                <span className="text-xl">{flag}</span><span className="text-sm">{name}</span>
                {form.language === code && <Check className="w-3.5 h-3.5 text-[#E84C6A] ml-auto"/>}
              </button>))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-6" style={CARD}>
          <div className="flex items-center gap-2 mb-4"><Tag className="w-4 h-4 text-emerald-500"/><h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('defaultCategories')}</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(({ id, name, icon, color }) => {
                const isSelected = form.preferredCategories.includes(id);
                const tKey = `cat${id.charAt(0).toUpperCase() + id.slice(1)}`;
                return (<button key={id} onClick={() => toggleCategory(id)} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isSelected ? 'shadow-sm' : ''}`} style={{
                        background: isSelected ? 'rgba(232,76,106,0.06)' : 'rgba(0,0,0,0.02)',
                        border: isSelected ? '1px solid rgba(232,76,106,0.15)' : '1px solid rgba(0,0,0,0.06)',
                    }}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm ${isSelected ? '' : 'opacity-40'}`}>{icon}</div>
                    <span className={`text-sm transition-colors truncate min-w-0 ${isSelected ? 'text-[#1A1A2E]' : 'text-slate-400'}`} title={t(tKey)}>{t(tKey)}</span>
                    {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E84C6A] shadow-[0_0_8px_rgba(232,76,106,0.5)]"/>}
                  </button>);
            })}
            </div>
        </motion.div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all" style={saved ? { background: '#059669' } : { background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 15px rgba(232,76,106,0.3)' }}>
          {saved ? <><Check className="w-5 h-5"/> {t('saved')}</> : <><Save className="w-4 h-4"/> {t('saveSettings')}</>}
        </motion.button>
      </div>
    </div>);
}
