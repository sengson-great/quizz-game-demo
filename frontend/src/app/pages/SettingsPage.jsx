import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings, Volume2, Music, Globe, Tag, Save, Check, Download, Smartphone, Brain, Cpu, History, Palette, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { CATEGORIES } from '../data/questions';
import { useTranslation } from '../hooks/useTranslation';
import { usePWA } from '../contexts/PWAContext';

const CARD_STYLE = "glass-card rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden";
const SECTION_STYLE = "glass-card rounded-[1.5rem] p-6 border-black/[0.03]";

const CategoryIcon = ({ name, className, style }) => {
    const icons = { Brain, Cpu, History, Globe, Zap, Palette };
    const Icon = icons[name] || Zap;
    return <Icon className={className} style={style} />;
};

const LANGUAGES = [
    { code: 'km', name: 'ខ្មែរ', flag: 'KH' }, { code: 'en', name: 'English', flag: 'EN' },
];
const AVATARS = ['🦊', '🐺', '🦋', '🐉', '🦅', '🐬', '🦁', '🐙', '🐸', '🦄', '🦉', '🐆', '🐯', '🐻', '🐼'];

const ToggleSwitch = memo(({ value, onChange }) => (<button onClick={() => onChange(!value)} className="relative w-12 h-6 rounded-full transition-all duration-300" style={{ background: value ? '#FACC15' : 'rgba(0,0,0,0.12)' }}>
  <motion.div animate={{ x: value ? 24 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"/>
</button>));

const VolumeSlider = memo(({ value, onChange }) => (
  <input 
      type="range" min="0" max="1" step="0.01" 
      value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#FACC15]" 
      style={{ background: 'rgba(0,0,0,0.08)' }} 
  />
));

export default function SettingsPage() {
    const { currentUser, updateUser } = useAuth();
    const { sfxVolume, setSfxVolume, volume, setMusicVolume } = useAudio();
    const { t } = useTranslation();
    const { isInstallable, isInstalled, isIOS, supportsPWA, installPWA } = usePWA();
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

    return (<div className="min-h-screen px-4 py-8 max-w-2xl mx-auto relative overflow-hidden" style={{ fontFamily: 'inherit' }}>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center shadow-lg border-black/[0.03]">
          <Settings className="w-6 h-6 text-[#FACC15]"/>
        </div>
        <div>
          <h1 className="text-[#1A1A2E] text-2xl font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>{t('settings')}</h1>
          <p className="text-slate-500 text-sm font-medium opacity-80">{t('customizeExperience')}</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={SECTION_STYLE}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/10 shadow-sm">
                        <Smartphone className="w-5 h-5 text-cyan-600"/>
                    </div>
                    <div>
                        <p className="text-[#1A1A2E] text-sm font-bold tracking-tight">{isIOS ? t('addToHomeScreen') : t('installApp')}</p>
                        <p className="text-slate-500 text-[10px] font-medium opacity-70">{isIOS ? t('getFullAppExperience') : t('getBetterExperience')}</p>
                    </div>
                </div>
                {isInstalled ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                        <Check className="w-3.5 h-3.5"/>
                        <span className="text-[10px] font-bold uppercase tracking-normal">Installed</span>
                    </div>
                ) : isInstallable || isIOS ? (
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                        onClick={installPWA}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all"
                        style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', boxShadow: '0 4px 12px rgba(8,145,178,0.25)' }}
                    >
                        <Download className="w-4 h-4"/> {isIOS ? 'How to' : 'Install'}
                    </motion.button>
                ) : (
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-normal bg-black/[0.02] px-3 py-1.5 rounded-lg border border-black/[0.03]">
                        {supportsPWA ? t('mobileReady') : t('desktopMode')}
                    </div>
                )}
            </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={SECTION_STYLE}>
          <h2 className="text-[#1A1A2E] text-lg font-bold tracking-tight mb-5" style={{ fontFamily: 'inherit' }}>{t('profile')}</h2>
          <div className="mb-6">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">{t('username')}</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-[#1A1A2E] focus:outline-none text-sm glass-card border-black/[0.03] focus:border-[#FACC15]/20 transition-all"/>
          </div>
          <div>
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-3 block opacity-70">{t('avatar')}</label>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map(avatar => (
                <button 
                  key={avatar} 
                  onClick={() => setForm(f => ({ ...f, avatar }))} 
                  className={`h-14 rounded-2xl text-2xl flex items-center justify-center transition-all duration-300 ${form.avatar === avatar ? 'bg-[#FACC15]/10 border-2 border-[#FACC15] scale-110 shadow-lg' : 'bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.05]'}`}
                >
                  <span className={form.avatar === avatar ? 'drop-shadow-sm' : 'opacity-60'}>{avatar}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={SECTION_STYLE}>
          <h2 className="text-[#1A1A2E] text-lg font-bold tracking-tight mb-6" style={{ fontFamily: 'inherit' }}>{t('audio')}</h2>
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/10 shadow-sm">
                    <Volume2 className="w-5 h-5 text-amber-600"/>
                  </div>
                  <div>
                    <p className="text-[#1A1A2E] text-sm font-bold">{t('soundEffects')}</p>
                    <p className="text-slate-500 text-[10px] font-medium opacity-60">{t('uiAndInteractionSounds')}</p>
                  </div>
                </div>
                <ToggleSwitch value={form.soundEnabled} onChange={v => setForm(f => ({ ...f, soundEnabled: v }))}/>
              </div>
              <div className="flex items-center gap-4 px-1">
                 <span className="text-[10px] font-bold text-slate-400 w-6">{t('off')}</span>
                 <VolumeSlider value={sfxVolume} onChange={setSfxVolume} />
                 <span className="text-[10px] font-bold text-slate-400 w-6">{t('max')}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FACC15]/10 border border-[#FACC15]/10 shadow-sm">
                    <Music className="w-5 h-5 text-[#FACC15]"/>
                  </div>
                  <div>
                    <p className="text-[#1A1A2E] text-sm font-bold">{t('backgroundMusic')}</p>
                    <p className="text-slate-500 text-[10px] font-medium opacity-60">{t('atmosphericGameMusic')}</p>
                  </div>
                </div>
                <ToggleSwitch value={form.musicEnabled} onChange={v => setForm(f => ({ ...f, musicEnabled: v }))}/>
              </div>
              <div className="flex items-center gap-4 px-1">
                 <span className="text-[10px] font-bold text-slate-400 w-6">{t('off')}</span>
                 <VolumeSlider value={volume} onChange={setMusicVolume} />
                 <span className="text-[10px] font-bold text-slate-400 w-6">{t('max')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={SECTION_STYLE}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/10 shadow-sm">
                <Globe className="w-5 h-5 text-cyan-600"/>
            </div>
            <h2 className="text-[#1A1A2E] text-lg font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>{t('language')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {LANGUAGES.map(({ code, name, flag }) => (
              <button 
                key={code} 
                onClick={() => setForm(f => ({ ...f, language: code }))} 
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${form.language === code ? 'bg-[#FACC15]/10 border-2 border-[#FACC15] shadow-md' : 'bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04]'}`}
              >
                <span className="text-2xl drop-shadow-sm">{flag}</span>
                <span className={`text-sm font-bold ${form.language === code ? 'text-[#FACC15]' : 'text-slate-500'}`}>{name}</span>
                {form.language === code && <Check className="w-4 h-4 text-[#FACC15] ml-auto"/>}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={SECTION_STYLE}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/10 shadow-sm">
                <Tag className="w-5 h-5 text-emerald-600"/>
            </div>
            <h2 className="text-[#1A1A2E] text-lg font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>{t('defaultCategories')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORIES.map(({ id, name, icon, color, iconColor }) => {
                const isSelected = form.preferredCategories.includes(id);
                const tKey = `cat${id.charAt(0).toUpperCase() + id.slice(1)}`;
                return (
                  <button 
                    key={id} 
                    onClick={() => toggleCategory(id)} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isSelected ? 'bg-[#FACC15]/10 border-2 border-[#FACC15] shadow-md' : 'bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04]'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/[0.03] flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110">
                      <CategoryIcon name={icon} className="w-6 h-6" style={{ color: isSelected ? iconColor : '#94a3b8' }} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-[#1A1A2E]' : 'text-slate-500'}`}>{t(tKey)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{isSelected ? t('activeDomain') : t('tapToEnable')}</p>
                    </div>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-pulse"/>}
                  </button>
                );
              })}
          </div>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleSave} 
          className={`w-full py-5 rounded-2xl text-white font-bold flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${saved ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-gradient-to-r from-[#FACC15] to-[#4F46E5] shadow-[#FACC15]/25'}`}
        >
          {saved ? <><Check className="w-6 h-6"/> {t('saved')}</> : <><Save className="w-5 h-5"/> {t('saveSettings')}</>}
        </motion.button>
      </div>
    </div>);
}
