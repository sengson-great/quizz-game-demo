import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plus, Edit3, Trash2, Search, Filter, BarChart2, Trophy, Settings2, X, Check, AlertTriangle, ChevronDown, Layers, ToggleLeft, ToggleRight, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QUESTIONS, CATEGORIES as DEFAULT_CATEGORIES } from '../data/questions';
import { ANALYTICS_DATA, INITIAL_LEADERBOARD } from '../data/mockData';
const STORAGE_KEY = 'quiz_admin_questions';
const CATEGORY_STORAGE_KEY = 'quiz_admin_categories';
const SYSTEM_CONFIG_STORAGE_KEY = 'quiz_admin_system_config';
function loadQuestions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : QUESTIONS;
    }
    catch {
        return QUESTIONS;
    }
}
function saveQuestions(qs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
}
function loadCategories() {
    try {
        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored)
            return JSON.parse(stored);
    }
    catch { }
    return DEFAULT_CATEGORIES.map(c => ({ ...c, enabled: true }));
}
function saveCategories(cats) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cats));
}
const DEFAULT_SYSTEM_CONFIG = {
    timerDuration: 30,
    easyCount: 5,
    mediumCount: 5,
    hardCount: 5,
    lobbyTimeout: 60,
    minRoomPlayers: 3,
    maxRoomPlayers: 5,
    enableFiftyFifty: true,
    enableSkip: true,
    enableAudience: true,
    enablePhone: true,
    enableDoubleDip: true,
    updated_at: null,
};
function loadSystemConfig() {
    try {
        const stored = localStorage.getItem(SYSTEM_CONFIG_STORAGE_KEY);
        if (stored)
            return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(stored) };
    }
    catch { }
    return DEFAULT_SYSTEM_CONFIG;
}
function persistSystemConfig(config) {
    localStorage.setItem(SYSTEM_CONFIG_STORAGE_KEY, JSON.stringify(config));
}
const emptyForm = () => ({
    categoryId: 'science',
    difficulty: 'Easy',
    text: '',
    explanation: '',
    answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ],
});
const emptyCategoryForm = () => ({
    name: '',
    icon: '📚',
    color: 'from-blue-500 to-cyan-400',
    description: '',
});
const COLOR_OPTIONS = [
    { value: 'from-blue-500 to-cyan-400', label: 'Blue/Cyan' },
    { value: 'from-violet-500 to-purple-400', label: 'Violet/Purple' },
    { value: 'from-amber-500 to-orange-400', label: 'Amber/Orange' },
    { value: 'from-green-500 to-emerald-400', label: 'Green/Emerald' },
    { value: 'from-red-500 to-rose-400', label: 'Red/Rose' },
    { value: 'from-pink-500 to-fuchsia-400', label: 'Pink/Fuchsia' },
    { value: 'from-teal-500 to-cyan-400', label: 'Teal/Cyan' },
    { value: 'from-indigo-500 to-blue-400', label: 'Indigo/Blue' },
];
const ICON_OPTIONS = ['📚', '🔬', '📜', '💻', '🌍', '⚽', '🎨', '🧮', '🎵', '🏛️', '🚀', '🧪', '📊', '🎭', '🌐', '🧬', '🎯', '💡'];
// Chart components
function HorizBar({ label, value, max, color, index }) {
    return (<motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-2">
      <span className="text-slate-500 text-xs w-36 flex-shrink-0 truncate" title={label}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.7, delay: 0.1 + index * 0.05 }} className="h-full rounded-full" style={{ background: color }}/>
      </div>
      <span className="text-xs w-8 text-right flex-shrink-0" style={{ color }}>{value}%</span>
    </motion.div>);
}
function VertBar({ label, value, max, color, index }) {
    const pct = (value / max) * 100;
    return (<div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs" style={{ color }}>{value}</span>
      <div className="w-full flex items-end justify-center" style={{ height: 100 }}>
        <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }} transition={{ duration: 0.7, delay: 0.1 + index * 0.08 }} className="w-full rounded-t-md" style={{ background: color, minHeight: 4 }}/>
      </div>
      <span className="text-slate-500 text-xs text-center leading-tight">{label}</span>
    </div>);
}
function MiniLineChart({ data }) {
    const W = 400;
    const H = 120;
    const PAD = { top: 10, right: 10, bottom: 28, left: 36 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const allVals = data.flatMap(d => [d.users, d.games]);
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const range = maxV - minV || 1;
    const xStep = innerW / (data.length - 1);
    const toX = (i) => PAD.left + i * xStep;
    const toY = (v) => PAD.top + innerH - ((v - minV) / range) * innerH;
    const usersPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.users).toFixed(1)}`).join(' ');
    const gamesPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.games).toFixed(1)}`).join(' ');
    const yTicks = [minV, Math.round((minV + maxV) / 2), maxV];
    return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      {yTicks.map(v => (<g key={v}>
          <line x1={PAD.left} y1={toY(v)} x2={PAD.left + innerW} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <text x={PAD.left - 4} y={toY(v) + 4} textAnchor="end" fill="#64748b" fontSize="9">{v}</text>
        </g>))}
      <path d={usersPath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={gamesPath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => i % 2 === 0 && (<text key={d.day} x={toX(i)} y={H - 6} textAnchor="middle" fill="#64748b" fontSize="9">{d.day}</text>))}
      <circle cx={PAD.left + 4} cy={PAD.top - 2} r="3" fill="#818cf8"/>
      <text x={PAD.left + 10} y={PAD.top + 2} fill="#94a3b8" fontSize="9">Users</text>
      <circle cx={PAD.left + 52} cy={PAD.top - 2} r="3" fill="#34d399"/>
      <text x={PAD.left + 58} y={PAD.top + 2} fill="#94a3b8" fontSize="9">Games</text>
    </svg>);
}
function DonutChart({ segments }) {
    const total = segments.reduce((s, d) => s + d.value, 0);
    const cx = 80;
    const cy = 80;
    const r = 60;
    const ir = 38;
    let cumAngle = -Math.PI / 2;
    const arcs = segments.map(seg => {
        const angle = (seg.value / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(cumAngle);
        const y1 = cy + r * Math.sin(cumAngle);
        const x2 = cx + r * Math.cos(cumAngle + angle);
        const y2 = cy + r * Math.sin(cumAngle + angle);
        const xi1 = cx + ir * Math.cos(cumAngle);
        const yi1 = cy + ir * Math.sin(cumAngle);
        const xi2 = cx + ir * Math.cos(cumAngle + angle);
        const yi2 = cy + ir * Math.sin(cumAngle + angle);
        const large = angle > Math.PI ? 1 : 0;
        const path = [`M ${x1.toFixed(2)} ${y1.toFixed(2)}`, `A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`, `L ${xi2.toFixed(2)} ${yi2.toFixed(2)}`, `A ${ir} ${ir} 0 ${large} 0 ${xi1.toFixed(2)} ${yi1.toFixed(2)}`, 'Z'].join(' ');
        cumAngle += angle;
        return { ...seg, path, pct: Math.round((seg.value / total) * 100) };
    });
    return (<div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" width="160" height="160">
        {arcs.map(arc => (<path key={arc.name} d={arc.path} fill={arc.fill} opacity={0.85}/>))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#1A1A2E" fontSize="13" fontWeight="700">Mode</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="10">split</text>
      </svg>
      <div className="space-y-3">
        {arcs.map(arc => (<div key={arc.name} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: arc.fill }}/>
            <span className="text-slate-600 text-sm w-10">{arc.name}</span>
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${arc.pct}%`, background: arc.fill }}/>
            </div>
            <span className="text-xs" style={{ color: arc.fill }}>{arc.pct}%</span>
          </div>))}
      </div>
    </div>);
}
// Main component
export default function AdminPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('questions');
    const [questions, setQuestions] = useState(loadQuestions);
    const [categories, setCategories] = useState(loadCategories);
    const [search, setSearch] = useState('');
    const [diffFilter, setDiffFilter] = useState('All');
    const [catFilter, setCatFilter] = useState('All');
    const [modal, setModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [formError, setFormError] = useState('');
    const [systemConfig, setSystemConfig] = useState(loadSystemConfig);
    const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
    const [confirmReset, setConfirmReset] = useState(false);
    const [configSaved, setConfigSaved] = useState(false);
    const [configDirty, setConfigDirty] = useState(false);
    // Category CRUD state
    const [catModal, setCatModal] = useState(null);
    const [catForm, setCatForm] = useState(emptyCategoryForm());
    const [catFormError, setCatFormError] = useState('');
    const [catDeleteConfirm, setCatDeleteConfirm] = useState(null);
    const [catDeleteAction, setCatDeleteAction] = useState('reassign');
    const [catReassignTarget, setCatReassignTarget] = useState('');
    useEffect(() => {
        if (!currentUser) {
            navigate('/auth');
            return;
        }
        if (currentUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
    }, [currentUser, navigate]);
    // Questions helpers
    const filteredQs = questions.filter(q => {
        const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
        const matchDiff = diffFilter === 'All' || q.difficulty === diffFilter;
        const matchCat = catFilter === 'All' || q.categoryId === catFilter;
        return matchSearch && matchDiff && matchCat;
    });
    const openAdd = () => { setForm(emptyForm()); setFormError(''); setModal({ mode: 'add' }); };
    const openEdit = (q) => {
        setForm({ categoryId: q.categoryId, difficulty: q.difficulty, text: q.text, explanation: q.explanation || '', answers: q.answers.map(a => ({ text: a.text, isCorrect: a.isCorrect })) });
        setFormError('');
        setModal({ mode: 'edit', question: q });
    };
    const handleDelete = (id) => { const updated = questions.filter(q => q.id !== id); setQuestions(updated); saveQuestions(updated); setDeleteConfirm(null); };
    const validateForm = () => {
        if (!form.text.trim())
            return 'Question text is required';
        if (form.answers.some(a => !a.text.trim()))
            return 'All answer options must be filled';
        if (!form.answers.some(a => a.isCorrect))
            return 'At least one correct answer required';
        return '';
    };
    const handleSave = () => {
        const err = validateForm();
        if (err) {
            setFormError(err);
            return;
        }
        const answers = form.answers.map((a, i) => ({ id: ['a', 'b', 'c', 'd'][i], text: a.text, isCorrect: a.isCorrect }));
        if (modal?.mode === 'add') {
            const newQ = { id: `custom-${Date.now()}`, categoryId: form.categoryId, difficulty: form.difficulty, text: form.text, explanation: form.explanation, answers };
            const updated = [...questions, newQ];
            setQuestions(updated);
            saveQuestions(updated);
        }
        else if (modal?.question) {
            const updated = questions.map(q => q.id === modal.question.id ? { ...q, categoryId: form.categoryId, difficulty: form.difficulty, text: form.text, explanation: form.explanation, answers } : q);
            setQuestions(updated);
            saveQuestions(updated);
        }
        setModal(null);
    };
    const markCorrect = (idx) => { setForm(f => ({ ...f, answers: f.answers.map((a, i) => ({ ...a, isCorrect: i === idx })) })); };
    // Category CRUD helpers
    const getQuestionCount = (catId) => questions.filter(q => q.categoryId === catId).length;
    const openAddCategory = () => {
        setCatForm(emptyCategoryForm());
        setCatFormError('');
        setCatModal({ mode: 'add' });
    };
    const openEditCategory = (cat) => {
        setCatForm({ name: cat.name, icon: cat.icon, color: cat.color, description: cat.description });
        setCatFormError('');
        setCatModal({ mode: 'edit', category: cat });
    };
    const validateCatForm = () => {
        if (!catForm.name.trim())
            return 'Category name is required';
        if (!catForm.description.trim())
            return 'Description is required';
        // Check for duplicate name (when adding or when editing to a different name)
        const existingNames = categories
            .filter(c => catModal?.mode === 'edit' ? c.id !== catModal.category?.id : true)
            .map(c => c.name.toLowerCase());
        if (existingNames.includes(catForm.name.toLowerCase()))
            return 'Category name already exists';
        return '';
    };
    const handleSaveCategory = () => {
        const err = validateCatForm();
        if (err) {
            setCatFormError(err);
            return;
        }
        if (catModal?.mode === 'add') {
            const newCat = {
                id: `cat-${Date.now()}`,
                name: catForm.name,
                icon: catForm.icon,
                color: catForm.color,
                description: catForm.description,
                enabled: true,
                createdBy: currentUser?.id,
            };
            const updated = [...categories, newCat];
            setCategories(updated);
            saveCategories(updated);
        }
        else if (catModal?.category) {
            const updated = categories.map(c => c.id === catModal.category.id
                ? { ...c, name: catForm.name, icon: catForm.icon, color: catForm.color, description: catForm.description }
                : c);
            setCategories(updated);
            saveCategories(updated);
        }
        setCatModal(null);
    };
    const toggleCategoryEnabled = (catId) => {
        const updated = categories.map(c => c.id === catId ? { ...c, enabled: !c.enabled } : c);
        setCategories(updated);
        saveCategories(updated);
    };
    const handleDeleteCategory = (catId) => {
        const qCount = getQuestionCount(catId);
        if (qCount > 0) {
            if (catDeleteAction === 'reassign' && catReassignTarget) {
                const updatedQs = questions.map(q => q.categoryId === catId ? { ...q, categoryId: catReassignTarget } : q);
                setQuestions(updatedQs);
                saveQuestions(updatedQs);
            }
            else if (catDeleteAction === 'delete') {
                const updatedQs = questions.filter(q => q.categoryId !== catId);
                setQuestions(updatedQs);
                saveQuestions(updatedQs);
            }
            else {
                return; // Need a reassignment target
            }
        }
        const updatedCats = categories.filter(c => c.id !== catId);
        setCategories(updatedCats);
        saveCategories(updatedCats);
        setCatDeleteConfirm(null);
        setCatDeleteAction('reassign');
        setCatReassignTarget('');
    };
    const tabs = [
        { id: 'questions', label: 'Questions', icon: Filter },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'system', label: 'System', icon: Settings2 },
    ];
    const catScoreMax = Math.max(...ANALYTICS_DATA.categoryScores.map(d => d.avgScore));
    const catColors = ['#E84C6A', '#fbbf24', '#34d399', '#f472b6', '#fb923c', '#22d3ee'];
    const updatedDistribution = ANALYTICS_DATA.gameModeDistribution.map((d, i) => ({ ...d, fill: ['#E84C6A', '#34d399', '#fbbf24'][i] || d.fill }));
    const glassCard = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
    return (<div className="min-h-screen px-4 py-8 max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,76,106,0.08)', border: '1px solid rgba(232,76,106,0.15)' }}>
          <Shield className="w-5 h-5 text-[#E84C6A]"/>
        </div>
        <div>
          <h1 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Content Management & Analytics</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[#E84C6A] text-xs">{currentUser?.username}</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
            { label: 'Total Questions', value: questions.length, color: '#E84C6A', bgStyle: { background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' } },
            { label: 'Categories', value: categories.filter(c => c.enabled).length, color: '#8b5cf6', bgStyle: { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' } },
            { label: 'Total Players', value: ANALYTICS_DATA.totalStats.totalPlayers.toLocaleString(), color: '#059669', bgStyle: { background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' } },
            { label: 'Games Played', value: ANALYTICS_DATA.totalStats.totalGames.toLocaleString(), color: '#d97706', bgStyle: { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' } },
        ].map(({ label, value, color, bgStyle }) => (<div key={label} className="rounded-2xl p-5" style={bgStyle}>
            <p className="text-2xl" style={{ color, fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (<button key={id} onClick={() => setTab(id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap" style={{
                background: tab === id ? 'rgba(232,76,106,0.08)' : 'transparent',
                border: tab === id ? '1px solid rgba(232,76,106,0.15)' : '1px solid transparent',
                color: tab === id ? '#E84C6A' : '#64748b',
            }}>
            <Icon className="w-4 h-4"/>
            <span className="hidden sm:inline">{label}</span>
          </button>))}
      </div>

      {/* ═══════ Questions Tab ═══════ */}
      {tab === 'questions' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
              <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl text-[#1A1A2E] placeholder-slate-400 focus:outline-none text-sm" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
            </div>
            <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="px-4 py-3 rounded-xl text-[#1A1A2E] focus:outline-none text-sm" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-4 py-3 rounded-xl text-[#1A1A2E] focus:outline-none text-sm" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 2px 10px rgba(232,76,106,0.3)' }}>
              <Plus className="w-4 h-4"/> Add Question
            </button>
          </div>

          <p className="text-slate-500 text-xs mb-3">{filteredQs.length} of {questions.length} questions</p>

          <div className="rounded-2xl overflow-hidden" style={glassCard}>
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-slate-400 text-xs uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="col-span-6">Question</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
              {filteredQs.map((q, i) => {
                const cat = categories.find(c => c.id === q.categoryId);
                const diffStyle = {
                    Easy: { bg: 'rgba(52,211,153,0.1)', color: '#34d399' },
                    Medium: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
                    Hard: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
                };
                const ds = diffStyle[q.difficulty];
                return (<motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="grid grid-cols-12 items-center px-5 py-4 hover:bg-black/[0.01] transition-colors gap-2">
                    <div className="col-span-12 sm:col-span-6"><p className="text-[#1A1A2E] text-sm line-clamp-2">{q.text}</p></div>
                    <div className="col-span-4 sm:col-span-2"><span className="text-xs text-slate-400">{cat?.icon} {cat?.name || 'Unknown'}</span></div>
                    <div className="col-span-4 sm:col-span-2"><span className="text-xs px-2 py-1 rounded-full" style={{ background: ds.bg, color: ds.color }}>{q.difficulty}</span></div>
                    <div className="col-span-4 sm:col-span-2 flex justify-end gap-2">
                      <button onClick={() => openEdit(q)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-[#E84C6A] transition-colors"><Edit3 className="w-3.5 h-3.5"/></button>
                      {deleteConfirm === q.id ? (<div className="flex gap-1">
                          <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50"><Check className="w-3 h-3"/></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded text-slate-400 hover:bg-black/5"><X className="w-3 h-3"/></button>
                        </div>) : (<button onClick={() => setDeleteConfirm(q.id)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>)}
                    </div>
                  </motion.div>);
            })}
            </div>
          </div>
        </motion.div>)}

      {/* ═══════ Categories Tab ═══════ */}
      {tab === 'categories' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">{categories.length} categories ({categories.filter(c => c.enabled).length} active)</p>
            </div>
            <button onClick={openAddCategory} className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 2px 10px rgba(232,76,106,0.3)' }}>
              <Plus className="w-4 h-4"/> Add Category
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
                const qCount = getQuestionCount(cat.id);
                return (<motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl p-5 relative" style={{
                        ...glassCard,
                        opacity: cat.enabled ? 1 : 0.5,
                    }}>
                  {/* Top: Icon + Name + Toggle */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg`}>
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                          {cat.name}
                        </h3>
                        <p className="text-slate-500 text-xs">{cat.description}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleCategoryEnabled(cat.id)} className="p-1 rounded-lg hover:bg-black/5 transition-colors" title={cat.enabled ? 'Disable category' : 'Enable category'}>
                      {cat.enabled ? (<ToggleRight className="w-5 h-5 text-emerald-400"/>) : (<ToggleLeft className="w-5 h-5 text-slate-500"/>)}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}>
                      <FolderOpen className="w-3 h-3 text-[#E84C6A]"/>
                      <span className="text-[#E84C6A] text-xs" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {qCount} questions
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                      {cat.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openEditCategory(cat)} className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 text-slate-500 hover:text-[#E84C6A] transition-colors" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <Edit3 className="w-3 h-3"/> Edit
                    </button>
                    {catDeleteConfirm === cat.id ? (<div className="flex gap-1">
                        <button onClick={() => handleDeleteCategory(cat.id)} className="px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                          Confirm
                        </button>
                        <button onClick={() => setCatDeleteConfirm(null)} className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-black/5 transition-colors" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                          Cancel
                        </button>
                      </div>) : (<button onClick={() => {
                            setCatDeleteConfirm(cat.id);
                            setCatDeleteAction('reassign');
                            setCatReassignTarget(categories.find(c => c.id !== cat.id)?.id || '');
                        }} className="py-2 px-3 rounded-lg text-xs flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <Trash2 className="w-3 h-3"/>
                      </button>)}
                  </div>

                  {/* Delete confirmation with orphan handling */}
                  <AnimatePresence>
                    {catDeleteConfirm === cat.id && qCount > 0 && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 rounded-xl overflow-hidden" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p className="text-red-400 text-xs mb-2">
                          <AlertTriangle className="w-3 h-3 inline mr-1"/>
                          {qCount} orphaned questions found
                        </p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                            <input type="radio" name={`delete-${cat.id}`} checked={catDeleteAction === 'reassign'} onChange={() => setCatDeleteAction('reassign')} className="accent-[#E84C6A]"/>
                            Reassign to:
                            <select value={catReassignTarget} onChange={e => setCatReassignTarget(e.target.value)} className="px-2 py-1 rounded text-xs text-[#1A1A2E] focus:outline-none" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
                              {categories.filter(c => c.id !== cat.id).map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
                            </select>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-red-400 cursor-pointer">
                            <input type="radio" name={`delete-${cat.id}`} checked={catDeleteAction === 'delete'} onChange={() => setCatDeleteAction('delete')} className="accent-red-500"/>
                            Delete all {qCount} questions
                          </label>
                        </div>
                      </motion.div>)}
                  </AnimatePresence>
                </motion.div>);
            })}
          </div>
        </motion.div>)}

      {/* ═══════ Analytics Tab ═══════ */}
      {tab === 'analytics' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-5" style={glassCard}>
              <h3 className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Most Failed Questions</h3>
              <div className="space-y-3">
                {ANALYTICS_DATA.mostFailedQuestions.map((d, i) => (<HorizBar key={d.question} label={d.question.length > 28 ? d.question.slice(0, 28) + '...' : d.question} value={d.failRate} max={100} color="#f472b6" index={i}/>))}
              </div>
            </div>
            <div className="rounded-2xl p-5" style={glassCard}>
              <h3 className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Avg Score by Category</h3>
              <div className="flex items-end gap-2 h-32 px-2">
                {ANALYTICS_DATA.categoryScores.map((d, i) => (<VertBar key={d.category} label={d.category.slice(0, 4)} value={d.avgScore} max={catScoreMax} color={catColors[i % catColors.length]} index={i}/>))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ANALYTICS_DATA.categoryScores.map((d, i) => (<span key={d.category} className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: catColors[i % catColors.length] }}/>
                    {d.category}
                  </span>))}
              </div>
            </div>
            <div className="rounded-2xl p-5 lg:col-span-2" style={glassCard}>
              <h3 className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Daily Activity (March 2026)</h3>
              <div style={{ height: 140 }}><MiniLineChart data={ANALYTICS_DATA.dailyUsers.slice(0, 10)}/></div>
            </div>
          </div>
          <div className="rounded-2xl p-5" style={glassCard}>
            <h3 className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Game Mode Distribution</h3>
            <DonutChart segments={updatedDistribution}/>
          </div>
        </motion.div>)}

      {/* ═══════ Leaderboard Tab ═══════ */}
      {tab === 'leaderboard' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 text-sm">{leaderboard.length} players ranked</p>
            <div className="flex gap-2">
              {confirmReset ? (<div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Confirm reset?</span>
                  <button onClick={() => { setLeaderboard([]); setConfirmReset(false); }} className="px-3 py-1.5 rounded-lg text-red-500 transition-colors" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>Yes, Reset</button>
                  <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-[#1A1A2E] transition-colors" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>Cancel</button>
                </div>) : (<>
                  <button onClick={() => setLeaderboard(l => l.slice(0, 10))} className="px-3 py-2 rounded-lg text-slate-500 hover:text-[#1A1A2E] text-sm transition-colors flex items-center gap-1.5" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <ChevronDown className="w-3.5 h-3.5"/> Keep Top 10
                  </button>
                  <button onClick={() => setConfirmReset(true)} className="px-3 py-2 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-1.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle className="w-3.5 h-3.5"/> Reset All
                  </button>
                </>)}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden" style={glassCard}>
            <div className="grid grid-cols-10 px-5 py-3 text-slate-400 text-xs uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="col-span-1">#</span><span className="col-span-4">Player</span><span className="col-span-2 text-right">Score</span><span className="col-span-1 text-right">Games</span><span className="col-span-1 text-right">Wins</span><span className="col-span-1 text-right">Action</span>
            </div>
            <div className="divide-y max-h-[450px] overflow-y-auto" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
              {leaderboard.map((entry, i) => (<div key={entry.id} className="grid grid-cols-10 items-center px-5 py-3 hover:bg-black/[0.01] transition-colors">
                  <span className="col-span-1 text-slate-400 text-sm">{i + 1}</span>
                  <div className="col-span-4 flex items-center gap-2"><span className="text-xl">{entry.avatar}</span><span className="text-[#1A1A2E] text-sm">{entry.username}</span></div>
                  <span className="col-span-2 text-right text-[#1A1A2E] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{entry.totalScore.toLocaleString()}</span>
                  <span className="col-span-1 text-right text-slate-400 text-sm">{entry.gamesPlayed}</span>
                  <span className="col-span-1 text-right text-slate-400 text-sm">{entry.wins}</span>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => setLeaderboard(l => l.filter(e => e.id !== entry.id))} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>))}
              {leaderboard.length === 0 && (<div className="py-12 text-center text-slate-500">Leaderboard is empty</div>)}
            </div>
          </div>
        </motion.div>)}

      {/* ═══════ System Tab ═══════ */}
      {tab === 'system' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Last saved indicator */}
          {systemConfig.updated_at && (<div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              Last saved: {new Date(systemConfig.updated_at).toLocaleString()}
            </div>)}

          {/* Save success toast */}
          <AnimatePresence>
            {configSaved && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
                <Check className="w-5 h-5 text-emerald-400"/>
                <div>
                  <p className="text-emerald-400 text-sm" style={{ fontWeight: 600 }}>Configuration Saved</p>
                  <p className="text-slate-400 text-xs">Changes are now live across the application.</p>
                </div>
              </motion.div>)}
          </AnimatePresence>

          {/* Game Timer */}
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-[#1A1A2E] mb-5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Game Timer</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-500 text-sm">Question Timer Duration</label>
                <span className="text-[#E84C6A] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{systemConfig.timerDuration}s</span>
              </div>
              <input type="range" min={10} max={60} value={systemConfig.timerDuration} onChange={e => { setSystemConfig(s => ({ ...s, timerDuration: +e.target.value })); setConfigDirty(true); }} className="w-full" style={{ accentColor: '#E84C6A' }}/>
              <div className="flex justify-between text-slate-500 text-xs mt-1"><span>10s</span><span>60s</span></div>
            </div>
          </div>

          {/* Lobby & Room Settings */}
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-[#1A1A2E] mb-5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Lobby & Room Settings</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-500 text-sm">Lobby Timeout</label>
                  <span className="text-cyan-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{systemConfig.lobbyTimeout}s</span>
                </div>
                <input type="range" min={15} max={300} step={5} value={systemConfig.lobbyTimeout} onChange={e => { setSystemConfig(s => ({ ...s, lobbyTimeout: +e.target.value })); setConfigDirty(true); }} className="w-full" style={{ accentColor: '#06b6d4' }}/>
                <div className="flex justify-between text-slate-500 text-xs mt-1"><span>15s</span><span>5min</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-500 text-sm">Min Players for Room</label>
                  <span className="text-violet-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{systemConfig.minRoomPlayers}</span>
                </div>
                <input type="range" min={2} max={5} value={systemConfig.minRoomPlayers} onChange={e => { setSystemConfig(s => ({ ...s, minRoomPlayers: +e.target.value })); setConfigDirty(true); }} className="w-full" style={{ accentColor: '#8b5cf6' }}/>
                <div className="flex justify-between text-slate-500 text-xs mt-1"><span>2</span><span>5</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-500 text-sm">Max Players for Room</label>
                  <span className="text-violet-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{systemConfig.maxRoomPlayers}</span>
                </div>
                <input type="range" min={3} max={8} value={systemConfig.maxRoomPlayers} onChange={e => { setSystemConfig(s => ({ ...s, maxRoomPlayers: +e.target.value })); setConfigDirty(true); }} className="w-full" style={{ accentColor: '#8b5cf6' }}/>
                <div className="flex justify-between text-slate-500 text-xs mt-1"><span>3</span><span>8</span></div>
              </div>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-[#1A1A2E] mb-5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Difficulty Distribution</h3>
            <p className="text-slate-400 text-sm mb-4">Configure the number of questions per difficulty level (max 15 total)</p>
            <div className="space-y-4">
              {[['easyCount', 'Easy', '#34d399'], ['mediumCount', 'Medium', '#fbbf24'], ['hardCount', 'Hard', '#f87171']].map(([key, label, color]) => (<div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm" style={{ color }}>{label} Questions</label>
                    <span className="text-sm" style={{ color, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{systemConfig[key]}</span>
                  </div>
                  <input type="range" min={1} max={10} value={systemConfig[key]} onChange={e => { setSystemConfig(s => ({ ...s, [key]: +e.target.value })); setConfigDirty(true); }} className="w-full" style={{ accentColor: color }}/>
                </div>))}
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{
                background: systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount === 15 ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount === 15 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <p className="text-sm text-[#1A1A2E]">
                Total: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount === 15 ? '#059669' : '#dc2626' }}>
                  {systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount} / 15
                </span>
                {systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount !== 15 && (<span className="text-red-400 ml-2 text-xs">Must equal 15</span>)}
              </p>
            </div>
          </div>

          {/* Active Lifelines */}
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-[#1A1A2E] mb-5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Active Lifelines</h3>
            <p className="text-slate-400 text-sm mb-4">Toggle which lifelines are available during gameplay</p>
            <div className="space-y-3">
              {[
                ['enableFiftyFifty', '50:50', 'Remove 2 wrong answers', '#fbbf24'],
                ['enableSkip', 'Skip', 'Skip the current question', '#06b6d4'],
                ['enableAudience', 'Ask Audience', 'Poll the audience for their answer', '#6366f1'],
                ['enablePhone', 'Phone a Friend', 'Get a hint from a friend', '#34d399'],
                ['enableDoubleDip', '2nd Try', 'Get a second chance if wrong', '#f472b6'],
            ].map(([key, label, desc, color]) => (<div key={key} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{
                    background: systemConfig[key] ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${systemConfig[key] ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)'}`,
                    opacity: systemConfig[key] ? 1 : 0.5,
                }}>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }}/>
                    <div>
                      <p className="text-[#1A1A2E] text-sm">{label}</p>
                      <p className="text-slate-500 text-xs">{desc}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSystemConfig(s => ({ ...s, [key]: !s[key] })); setConfigDirty(true); }} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
                    {systemConfig[key] ? (<ToggleRight className="w-6 h-6 text-emerald-400"/>) : (<ToggleLeft className="w-6 h-6 text-slate-500"/>)}
                  </button>
                </div>))}
            </div>
          </div>

          {/* Save Button */}
          <button onClick={() => {
                const updated = { ...systemConfig, updated_at: new Date().toISOString() };
                setSystemConfig(updated);
                persistSystemConfig(updated);
                setConfigSaved(true);
                setConfigDirty(false);
                setTimeout(() => setConfigSaved(false), 3000);
            }} className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] relative overflow-hidden" style={{
                background: configDirty ? 'linear-gradient(135deg, #E84C6A, #D43B59)' : 'linear-gradient(135deg, rgba(232,76,106,0.5), rgba(212,59,89,0.5))',
                boxShadow: configDirty ? '0 4px 15px rgba(232,76,106,0.3)' : 'none',
            }}>
            {configDirty && (<motion.div className="absolute inset-0 rounded-xl" animate={{ boxShadow: ['0 0 10px rgba(232,76,106,0.15)', '0 0 25px rgba(232,76,106,0.35)', '0 0 10px rgba(232,76,106,0.15)'] }} transition={{ duration: 1.5, repeat: Infinity }}/>)}
            <Check className="w-4 h-4 relative z-10"/>
            <span className="relative z-10">
              {configDirty ? 'Save System Config' : 'All Changes Saved'}
            </span>
          </button>
        </motion.div>)}

      {/* ═══════ Question Modal ═══════ */}
      <AnimatePresence>
        {modal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }} onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{modal.mode === 'add' ? '+ New Question' : 'Edit Question'}</h3>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-[#1A1A2E] transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Category</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-[#1A1A2E] text-sm focus:outline-none" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {categories.filter(c => c.enabled).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-[#1A1A2E] text-sm focus:outline-none" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Question Text</label>
                  <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={3} placeholder="Enter your question..." className="w-full px-3 py-2.5 rounded-xl text-[#1A1A2E] text-sm focus:outline-none resize-none placeholder-slate-400" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Explanation (optional)</label>
                  <input type="text" value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Brief explanation..." className="w-full px-3 py-2.5 rounded-xl text-[#1A1A2E] text-sm focus:outline-none placeholder-slate-400" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-2 block">Answer Options (click check to mark correct)</label>
                  <div className="space-y-2">
                    {form.answers.map((ans, i) => (<div key={i} className="flex items-center gap-2 p-2 rounded-xl transition-all" style={{ background: ans.isCorrect ? 'rgba(52,211,153,0.06)' : 'rgba(0,0,0,0.02)', border: ans.isCorrect ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ fontWeight: 700, background: 'rgba(0,0,0,0.04)', color: '#64748b' }}>{['A', 'B', 'C', 'D'][i]}</span>
                        <input type="text" value={ans.text} onChange={e => { const updated = [...form.answers]; updated[i] = { ...updated[i], text: e.target.value }; setForm(f => ({ ...f, answers: updated })); }} placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`} className="flex-1 bg-transparent text-[#1A1A2E] text-sm focus:outline-none placeholder-slate-400"/>
                        <button onClick={() => markCorrect(i)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: ans.isCorrect ? 'rgba(52,211,153,0.2)' : 'transparent', color: ans.isCorrect ? '#34d399' : '#475569' }}>
                          <Check className="w-3.5 h-3.5"/>
                        </button>
                      </div>))}
                  </div>
                </div>
                {formError && (<div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle className="w-4 h-4"/> {formError}
                  </div>)}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-slate-500 hover:text-[#1A1A2E] text-sm transition-colors" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)' }}>{modal.mode === 'add' ? 'Add Question' : 'Save Changes'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>

      {/* ═══════ Category Modal ═══════ */}
      <AnimatePresence>
        {catModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }} onClick={() => setCatModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {catModal.mode === 'add' ? '+ New Category' : 'Edit Category'}
                </h3>
                <button onClick={() => setCatModal(null)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-[#1A1A2E] transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Icon selector */}
                <div>
                  <label className="text-slate-500 text-xs mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(icon => (<button key={icon} onClick={() => setCatForm(f => ({ ...f, icon }))} className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all" style={{
                    background: catForm.icon === icon ? 'rgba(232,76,106,0.1)' : 'rgba(0,0,0,0.02)',
                    border: catForm.icon === icon ? '2px solid rgba(232,76,106,0.35)' : '1px solid rgba(0,0,0,0.06)',
                }}>
                        {icon}
                      </button>))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Category Name</label>
                  <input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Web Development" className="w-full px-3 py-2.5 rounded-xl text-[#1A1A2E] text-sm focus:outline-none placeholder-slate-400" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                </div>

                {/* Description */}
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Description</label>
                  <input type="text" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this category" className="w-full px-3 py-2.5 rounded-xl text-[#1A1A2E] text-sm focus:outline-none placeholder-slate-400" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}/>
                </div>

                {/* Color */}
                <div>
                  <label className="text-slate-500 text-xs mb-2 block">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_OPTIONS.map(opt => (<button key={opt.value} onClick={() => setCatForm(f => ({ ...f, color: opt.value }))} className="flex items-center gap-2 p-2 rounded-lg transition-all" style={{
                    background: catForm.color === opt.value ? 'rgba(232,76,106,0.08)' : 'rgba(0,0,0,0.02)',
                    border: catForm.color === opt.value ? '2px solid rgba(232,76,106,0.25)' : '1px solid rgba(0,0,0,0.06)',
                }}>
                        <div className={`w-5 h-5 rounded bg-gradient-to-br ${opt.value}`}/>
                        <span className="text-xs text-slate-400">{opt.label.split('/')[0]}</span>
                      </button>))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p className="text-slate-400 text-xs mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catForm.color} flex items-center justify-center text-lg`}>
                      {catForm.icon}
                    </div>
                    <div>
                      <p className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {catForm.name || 'Category Name'}
                      </p>
                      <p className="text-slate-500 text-xs">{catForm.description || 'Description'}</p>
                    </div>
                  </div>
                </div>

                {catFormError && (<div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle className="w-4 h-4"/> {catFormError}
                  </div>)}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setCatModal(null)} className="flex-1 py-3 rounded-xl text-slate-500 hover:text-[#1A1A2E] text-sm transition-colors" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>Cancel</button>
                  <button onClick={handleSaveCategory} className="flex-1 py-3 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)' }}>
                    {catModal.mode === 'add' ? 'Create Category' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
