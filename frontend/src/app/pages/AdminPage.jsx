import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plus, Edit3, Trash2, Search, Filter, BarChart2, Trophy, Settings2, X, Check, AlertTriangle, ChevronDown, Layers, ToggleLeft, ToggleRight, FolderOpen, Globe, Zap, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFixedAvatar } from '../utils/avatar';
import api from '../../api/axios';
import { ANALYTICS_DATA } from '../data/mockData';
const SYSTEM_CONFIG_STORAGE_KEY = 'quiz_admin_system_config';

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
    textKm: '',
    explanation: '',
    explanationKm: '',
    answers: [
        { text: '', textKm: '', isCorrect: true },
        { text: '', textKm: '', isCorrect: false },
        { text: '', textKm: '', isCorrect: false },
        { text: '', textKm: '', isCorrect: false },
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
    { value: 'from-violet-500 to-fuchsia-400', label: 'Pink/Fuchsia' },
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
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#000000" fontSize="13" fontWeight="700">Mode</text>
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
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [diffFilter, setDiffFilter] = useState('All');
    const [catFilter, setCatFilter] = useState('All');
    const [modal, setModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [formError, setFormError] = useState('');
    const [systemConfig, setSystemConfig] = useState(loadSystemConfig);
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, total_games: 0, avg_score: 0 });
    const [confirmReset, setConfirmReset] = useState(false);
    const [configSaved, setConfigSaved] = useState(false);
    const [configDirty, setConfigDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [catActionLoading, setCatActionLoading] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    

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

        let mounted = true;
        const loadData = async () => {
            try {
                const [qRes, cRes, lRes, sRes] = await Promise.all([
                    api.get('/admin/questions?limit=1000'),
                    api.get('/admin/categories'),
                    api.get('/leaderboard'),
                    api.get('/admin/stats')
                ]);
                if (!mounted) return;
                
                const qsMap = (qRes.data.data || qRes.data || []).map(q => ({
                    id: q.id,
                    categoryId: q.category_id,
                    difficulty: q.difficulty_level === 'easy' ? 'Easy' : q.difficulty_level === 'medium' ? 'Medium' : 'Hard',
                    text: q.text,
                    textKm: q.text_km || '',
                    explanation: q.explanation || '',
                    explanationKm: q.explanation_km || '',
                    answers: (q.answers || []).map(a => ({
                        id: a.id,
                        text: a.text,
                        textKm: a.text_km || '',
                        isCorrect: a.is_correct
                    }))
                }));
                setQuestions(qsMap);
                
                const catsMap = (cRes.data.data || cRes.data || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    icon: c.icon || '📚',
                    color: c.color || 'from-blue-500 to-cyan-400',
                    description: c.description || '',
                    enabled: true
                }));
                setCategories(catsMap);
                setLeaderboard(lRes.data || []);
                setStats(sRes.data || { total_users: 0, total_games: 0, avg_score: 0 });
            } catch (err) {
                console.error('Failed to load admin data', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadData();
        return () => { mounted = false; };
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
        setForm({ 
            categoryId: q.categoryId, 
            difficulty: q.difficulty, 
            text: q.text, 
            textKm: q.textKm || '',
            explanation: q.explanation || '', 
            explanationKm: q.explanationKm || '',
            answers: (q.answers || []).map(a => ({ id: a.id, text: a.text, textKm: a.textKm || '', isCorrect: a.isCorrect })) 
        });
        setFormError('');
        setModal({ mode: 'edit', question: q });
    };

    const handleDelete = async (id) => { 
        try { 
            await api.delete(`/admin/questions/${id}`); 
            setQuestions(q => q.filter(x => x.id !== id)); 
            setDeleteConfirm(null); 
        } catch (e) { 
            console.error(e); 
        } 
    };

    const validateForm = () => {
        if (!form.text.trim()) return 'Question text is required';
        if (form.answers.some(a => !a.text.trim())) return 'All answer options must be filled';
        if (!form.answers.some(a => a.isCorrect)) return 'At least one correct answer required';
        return '';
    };

    const handleSave = async () => {
        const err = validateForm();
        if (err) { setFormError(err); return; }
        
        try {
            const payload = {
                category_id: form.categoryId,
                difficulty_level: form.difficulty.toLowerCase(),
                text: form.text,
                text_km: form.textKm,
                explanation: form.explanation,
                explanation_km: form.explanationKm,
                answers: form.answers.map(a => ({ text: a.text, text_km: a.textKm, is_correct: a.isCorrect }))
            };
            
            if (modal?.mode === 'add') {
                const res = await api.post('/admin/questions', payload);
                const q = res.data;
                const newQ = { 
                    id: q.id, categoryId: q.category_id, 
                    difficulty: q.difficulty_level === 'easy' ? 'Easy' : q.difficulty_level === 'medium' ? 'Medium' : 'Hard', 
                    text: q.text, textKm: q.text_km || '', 
                    explanation: q.explanation || '', explanationKm: q.explanation_km || '', 
                    answers: (q.answers || []).map(a => ({ id: a.id, text: a.text, textKm: a.text_km || '', isCorrect: a.is_correct })) 
                };
                setQuestions([...questions, newQ]);
            } else if (modal?.question) {
                const res = await api.put(`/admin/questions/${modal.question.id}`, payload);
                const q = res.data;
                const updated = questions.map(x => x.id === q.id ? { 
                    id: q.id, categoryId: q.category_id, 
                    difficulty: q.difficulty_level === 'easy' ? 'Easy' : q.difficulty_level === 'medium' ? 'Medium' : 'Hard', 
                    text: q.text, textKm: q.text_km || '', 
                    explanation: q.explanation || '', explanationKm: q.explanation_km || '', 
                    answers: (q.answers || []).map(a => ({ id: a.id, text: a.text, textKm: a.text_km || '', isCorrect: a.is_correct })) 
                } : x);
                setQuestions(updated);
            }
            setModal(null);
        } catch (error) {
            console.error('Failed to save question', error);
            setFormError('Failed to save question to server.');
        }
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
    const handleSaveCategory = async () => {
        const err = validateCatForm();
        if (err) {
            setCatFormError(err);
            return;
        }
        setCatActionLoading(true);
        try {
            const payload = {
                name: catForm.name,
                icon: catForm.icon,
                color: catForm.color,
                description: catForm.description,
            };
            if (catModal?.mode === 'add') {
                const res = await api.post('/admin/categories', payload);
                const c = res.data;
                setCategories(prev => [...prev, {
                    id: c.id, name: c.name, icon: c.icon || '📚',
                    color: c.color || 'from-blue-500 to-cyan-400',
                    description: c.description || '', enabled: true,
                }]);
            } else if (catModal?.category) {
                const res = await api.put(`/admin/categories/${catModal.category.id}`, payload);
                const c = res.data;
                setCategories(prev => prev.map(x => x.id === c.id
                    ? { ...x, name: c.name, icon: c.icon || x.icon, color: c.color || x.color, description: c.description || '' }
                    : x
                ));
            }
            setCatModal(null);
        } catch (e) {
            setCatFormError(e?.response?.data?.message || 'Failed to save category.');
        } finally {
            setCatActionLoading(false);
        }
    };
    const toggleCategoryEnabled = (catId) => {
        // Local-only toggle (no 'enabled' column on backend); persisted in-memory
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, enabled: !c.enabled } : c));
    };
    const handleDeleteCategory = async (catId) => {
        const qCount = getQuestionCount(catId);
        if (qCount > 0 && catDeleteAction === 'reassign' && !catReassignTarget) return;
        setCatActionLoading(true);
        try {
            await api.delete(`/admin/categories/${catId}`);
            setCategories(prev => prev.filter(c => c.id !== catId));
            // Update local question list to reflect orphans
            if (qCount > 0) {
                if (catDeleteAction === 'reassign' && catReassignTarget) {
                    setQuestions(prev => prev.map(q => q.categoryId === catId ? { ...q, categoryId: catReassignTarget } : q));
                } else {
                    setQuestions(prev => prev.filter(q => q.categoryId !== catId));
                }
            }
        } catch (e) {
            console.error('Failed to delete category', e);
        } finally {
            setCatActionLoading(false);
            setCatDeleteConfirm(null);
            setCatDeleteAction('reassign');
            setCatReassignTarget('');
        }
    };
    const tabs = [
        { id: 'questions', label: 'Questions', icon: Filter },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'system', label: 'System', icon: Settings2 },
    ];
    const catScoreMax = Math.max(...ANALYTICS_DATA.categoryScores.map(d => d.avgScore));
    const catColors = ['#FACC15', '#fbbf24', '#34d399', '#f472b6', '#fb923c', '#22d3ee'];
    const updatedDistribution = ANALYTICS_DATA.gameModeDistribution.map((d, i) => ({ ...d, fill: ['#FACC15', '#34d399', '#fbbf24'][i] || d.fill }));
    const glassCard = { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px) saturate(1.8)', border: '1px solid rgba(226, 232, 240, 0.6)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' };
    const CARD_STYLE = "glass-card rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden";
    const SECTION_STYLE = "glass-card rounded-[1.5rem] p-6 border-black/[0.03]";
    return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto relative overflow-hidden" style={{ fontFamily: 'inherit' }}>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center shadow-lg border-black/[0.03]">
          <Shield className="w-6 h-6 text-[#FACC15]"/>
        </div>
        <div>
          <h1 className="text-[#000000] text-2xl font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>Admin Console</h1>
          <p className="text-slate-500 text-sm font-medium opacity-80">Content Management & Global Analytics</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl glass-card border-[#FACC15]/20 bg-[#FACC15]/5">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
            <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"/>
          </div>
          <span className="text-[#FACC15] text-[10px] font-bold uppercase tracking-[0.2em]">{currentUser?.username}</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
            { label: 'Total Questions', value: questions.length, color: '#FACC15', icon: Filter },
            { label: 'Active Categories', value: categories.filter(c => c.enabled).length, color: '#8b5cf6', icon: Layers },
            { label: 'Total Players', value: (stats?.total_users || 0).toLocaleString(), color: '#10b981', icon: Trophy },
            { label: 'Games Played', value: (stats?.total_games || 0).toLocaleString(), color: '#f59e0b', icon: BarChart2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-card rounded-[1.5rem] p-6 border-black/[0.03] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style={{ from: color, to: 'transparent' }}/>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm border border-black/[0.02]">
                <Icon className="w-5 h-5" style={{ color }}/>
            </div>
            <p className="text-2xl font-bold tracking-tight text-[#000000]" style={{ fontFamily: 'inherit' }}>{value}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mt-1 opacity-60">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1.5 rounded-2xl glass-card border-black/[0.03] overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button 
            key={id} 
            onClick={() => setTab(id)} 
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-normal transition-all whitespace-nowrap ${tab === id ? 'bg-white shadow-md text-[#FACC15] border border-black/[0.02]' : 'text-slate-500 hover:text-[#000000]'}`}
          >
            <Icon className={`w-4 h-4 ${tab === id ? 'text-[#FACC15]' : 'opacity-40'}`}/>
            {label}
          </button>
        ))}
      </div>

      {/* ═══════ Questions Tab ═══════ */}
      {tab === 'questions' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FACC15] transition-colors"/>
              <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[#000000] placeholder-slate-400 focus:outline-none text-sm glass-card border-black/[0.03] transition-all focus:border-[#FACC15]/20"/>
            </div>
            <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="px-5 py-3 rounded-2xl text-[#000000] focus:outline-none text-xs font-bold uppercase tracking-normal glass-card border-black/[0.03]">
              {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d} Difficulty</option>)}
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-5 py-3 rounded-2xl text-[#000000] focus:outline-none text-xs font-bold uppercase tracking-normal glass-card border-black/[0.03]">
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={openAdd} 
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white text-[11px] font-bold uppercase tracking-normal shadow-xl transition-all" 
              style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 15px rgba(99,102,241,0.25)' }}
            >
              <Plus className="w-4 h-4"/> Add New
            </motion.button>
          </div>

          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-60 px-2">{filteredQs.length} Questions matched</p>

          <div className={CARD_STYLE}>
            <div className="hidden sm:grid grid-cols-12 px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <span className="col-span-6">Question Content</span>
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
                return (<motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-black/[0.01] transition-colors gap-4 group">
                    <div className="col-span-12 sm:col-span-6"><p className="text-[#000000] text-sm font-medium leading-relaxed line-clamp-2">{q.text}</p></div>
                    <div className="col-span-4 sm:col-span-2 flex items-center gap-2"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-normal bg-black/[0.03] px-2 py-1 rounded-lg border border-black/[0.02]">{cat?.icon} {cat?.name || 'Unset'}</span></div>
                    <div className="col-span-4 sm:col-span-2"><span className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-sm" style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.color}20` }}>{q.difficulty}</span></div>
                    <div className="col-span-4 sm:col-span-2 flex justify-end gap-1">
                      <button onClick={() => openEdit(q)} className="p-2.5 rounded-xl transition-all glass-card border-black/[0.03] text-slate-400 hover:text-[#FACC15] hover:bg-[#FACC15]/5 shadow-sm"><Edit3 className="w-4 h-4"/></button>
                      {deleteConfirm === q.id ? (<div className="flex gap-1 animate-in zoom-in-95 duration-200">
                          <button onClick={() => handleDelete(q.id)} className="p-2 rounded-xl bg-red-500 text-white shadow-md shadow-red-500/20"><Check className="w-4 h-4"/></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500"><X className="w-4 h-4"/></button>
                        </div>) : (<button onClick={() => setDeleteConfirm(q.id)} className="p-2.5 rounded-xl transition-all glass-card border-black/[0.03] text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm"><Trash2 className="w-4 h-4"/></button>)}
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
            <button onClick={openAddCategory} className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #FACC15, #4F46E5)', boxShadow: '0 2px 10px rgba(99,102,241,0.3)' }}>
              <Plus className="w-4 h-4"/> Add Category
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
                const qCount = getQuestionCount(cat.id);
                return (<motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[1.5rem] p-6 relative group overflow-hidden" style={{
                        ...glassCard,
                        opacity: cat.enabled ? 1 : 0.6,
                    }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-[0.03] transition-opacity group-hover:opacity-[0.08]" style={{ from: cat.color.split(' ')[0].replace('from-', ''), to: 'transparent' }}/>
                  
                  {/* Top: Icon + Name + Toggle */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shadow-lg border border-white/20 transition-transform group-hover:scale-110`}>
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-[#000000] text-sm font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>
                          {cat.name}
                        </h3>
                        <p className="text-slate-500 text-[10px] font-medium opacity-60 leading-tight line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleCategoryEnabled(cat.id)} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
                      {cat.enabled ? (<ToggleRight className="w-6 h-6 text-emerald-500"/>) : (<ToggleLeft className="w-6 h-6 text-slate-400"/>)}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FACC15]/5 border border-[#FACC15]/10">
                      <FolderOpen className="w-3.5 h-3.5 text-[#FACC15]"/>
                      <span className="text-[#FACC15] text-[10px] font-bold uppercase tracking-normal">
                        {qCount} Questions
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-normal px-3 py-1.5 rounded-xl ${cat.enabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-slate-500/10 text-slate-500 border border-slate-500/10'}`}>
                      {cat.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 relative z-10">
                    <button onClick={() => openEditCategory(cat)} className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-normal flex items-center justify-center gap-2 text-slate-500 hover:text-[#FACC15] transition-all bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04]">
                      <Edit3 className="w-3.5 h-3.5"/> Edit
                    </button>
                    {catDeleteConfirm === cat.id ? (<div className="flex gap-1">
                        <button onClick={() => handleDeleteCategory(cat.id)} className="px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-normal text-red-500 hover:bg-red-50 transition-all border border-red-500/10">
                          Confirm
                        </button>
                        <button onClick={() => setCatDeleteConfirm(null)} className="px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-normal text-slate-500 hover:bg-black/5 transition-all border border-black/[0.05]">
                          X
                        </button>
                      </div>) : (<button onClick={() => {
                            setCatDeleteConfirm(cat.id);
                            setCatDeleteAction('reassign');
                            setCatReassignTarget(categories.find(c => c.id !== cat.id)?.id || '');
                        }} className="py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-normal flex items-center gap-1 text-slate-400 hover:text-red-500 transition-all bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04]">
                        <Trash2 className="w-3.5 h-3.5"/>
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
                            <input type="radio" name={`delete-${cat.id}`} checked={catDeleteAction === 'reassign'} onChange={() => setCatDeleteAction('reassign')} className="accent-[#FACC15]"/>
                            Reassign to:
                            <select value={catReassignTarget} onChange={e => setCatReassignTarget(e.target.value)} className="px-2 py-1 rounded text-xs text-[#000000] focus:outline-none" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
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
            <div className={SECTION_STYLE} style={glassCard}>
              <h3 className="text-[#000000] text-lg font-bold tracking-tight mb-6" style={{ fontFamily: 'inherit' }}>Most Failed Questions</h3>
              <div className="space-y-4">
                {ANALYTICS_DATA.mostFailedQuestions.map((d, i) => (<HorizBar key={d.question} label={d.question.length > 32 ? d.question.slice(0, 32) + '...' : d.question} value={d.failRate} max={100} color="#f472b6" index={i}/>))}
              </div>
            </div>
            <div className={SECTION_STYLE} style={glassCard}>
              <h3 className="text-[#000000] text-lg font-bold tracking-tight mb-6" style={{ fontFamily: 'inherit' }}>Avg Score by Category</h3>
              <div className="flex items-end gap-3 h-40 px-2 mb-6">
                {ANALYTICS_DATA.categoryScores.map((d, i) => (<VertBar key={d.category} label={d.category.slice(0, 6)} value={d.avgScore} max={catScoreMax} color={catColors[i % catColors.length]} index={i}/>))}
              </div>
              <div className="flex flex-wrap gap-3">
                {ANALYTICS_DATA.categoryScores.map((d, i) => (<span key={d.category} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/[0.02] border border-black/[0.03]">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: catColors[i % catColors.length] }}/>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-normal">{d.category}</span>
                  </span>))}
              </div>
            </div>
            <div className={SECTION_STYLE} style={{ ...glassCard, gridColumn: 'span 2' }}>
              <h3 className="text-[#000000] text-lg font-bold tracking-tight mb-6" style={{ fontFamily: 'inherit' }}>Daily Activity (March 2026)</h3>
              <div style={{ height: 160 }}><MiniLineChart data={ANALYTICS_DATA.dailyUsers.slice(0, 10)}/></div>
            </div>
          </div>
          <div className={SECTION_STYLE} style={glassCard}>
            <h3 className="text-[#000000] text-lg font-bold tracking-tight mb-8" style={{ fontFamily: 'inherit' }}>Game Mode Distribution</h3>
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
                  <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-[#000000] transition-colors" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>Cancel</button>
                </div>) : (<>
                  <button onClick={() => setLeaderboard(l => l.slice(0, 10))} className="px-3 py-2 rounded-lg text-slate-500 hover:text-[#000000] text-sm transition-colors flex items-center gap-1.5" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <ChevronDown className="w-3.5 h-3.5"/> Keep Top 10
                  </button>
                  <button onClick={() => setConfirmReset(true)} className="px-3 py-2 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-1.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle className="w-3.5 h-3.5"/> Reset All
                  </button>
                </>)}
            </div>
          </div>
          <div className={CARD_STYLE}>
            <div className="hidden sm:grid grid-cols-10 px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <span className="col-span-1">Rank</span><span className="col-span-4">Player Identity</span><span className="col-span-2 text-right">Total Score</span><span className="col-span-1 text-right">Games</span><span className="col-span-1 text-right">Wins</span><span className="col-span-1 text-right">Actions</span>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto no-scrollbar" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
              {leaderboard.map((entry, i) => (<div key={entry.id} className="grid grid-cols-10 items-center px-6 py-4 hover:bg-black/[0.01] transition-colors group">
                  <span className="col-span-1 text-slate-400 text-xs font-bold tabular-nums">#{i + 1}</span>
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-xl bg-white shadow-sm border border-black/[0.02]">
                        {getFixedAvatar(entry.user_id || entry.name, entry.avatar)}
                    </div>
                    <span className="text-[#000000] text-sm font-bold truncate">{entry.name}</span>
                  </div>
                  <span className="col-span-2 text-right text-[#000000] text-sm font-bold tabular-nums tracking-tight">{(entry.total_score || 0).toLocaleString()}</span>
                  <span className="col-span-1 text-right text-slate-500 text-xs font-medium opacity-60">{entry.games_played}</span>
                  <span className="col-span-1 text-right text-[#10b981] text-xs font-bold tabular-nums">{entry.wins}</span>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => setLeaderboard(l => l.filter(e => e.id !== entry.id))} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-black/[0.03]"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>))}
              {leaderboard.length === 0 && (<div className="py-20 text-center">
                  <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4 opacity-50"/>
                  <p className="text-slate-400 font-bold uppercase tracking-normal text-xs">Leaderboard is empty</p>
                </div>)}
            </div>
          </div>
        </motion.div>)}

      {/* ═══════ System Tab ═══════ */}
      {tab === 'system' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
          <div className={SECTION_STYLE}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shadow-sm border border-amber-500/10">
                    <Globe className="w-5 h-5 text-amber-600"/>
                </div>
                <div>
                    <h3 className="text-[#000000] text-sm font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>Multiplayer Matchmaking</h3>
                    <p className="text-slate-500 text-[10px] font-medium opacity-60">Global 1v1 queue status</p>
                </div>
              </div>
              <button onClick={() => setSystemConfig(prev => ({ ...prev, matchmakingEnabled: !prev.matchmakingEnabled }))} className="p-1 rounded-lg">
                {systemConfig.matchmakingEnabled ? (<ToggleRight className="w-7 h-7 text-emerald-500"/>) : (<ToggleLeft className="w-7 h-7 text-slate-400"/>)}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shadow-sm border border-cyan-500/10">
                    <Zap className="w-5 h-5 text-cyan-600"/>
                </div>
                <div>
                    <h3 className="text-[#000000] text-sm font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>Maintenance Mode</h3>
                    <p className="text-slate-500 text-[10px] font-medium opacity-60">Lock all game features</p>
                </div>
              </div>
              <button onClick={() => setSystemConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} className="p-1 rounded-lg">
                {systemConfig.maintenanceMode ? (<ToggleRight className="w-7 h-7 text-[#FACC15]"/>) : (<ToggleLeft className="w-7 h-7 text-slate-400"/>)}
              </button>
            </div>
          </div>

          <div className={SECTION_STYLE}>
            <h3 className="text-[#000000] text-sm font-bold tracking-tight mb-6" style={{ fontFamily: 'inherit' }}>Database & Storage</h3>
            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04] transition-all group">
                    <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors"/>
                        <span className="text-xs font-bold text-slate-500">Flush Redis Cache</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">Purge Now</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04] transition-all group">
                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-slate-400 group-hover:text-[#FACC15] transition-colors"/>
                        <span className="text-xs font-bold text-slate-500">Recalculate Ranks</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-normal text-slate-400">Run Sync</span>
                </button>
            </div>
          </div>
        </motion.div>)}

      {/* ═══════ Question Modal ═══════ */}
      <AnimatePresence>
        {isAddOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] glass-card border-white/20 shadow-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.98)' }}>
              
              <div className="p-8 pb-4 flex items-center justify-between border-b border-black/[0.03]">
                <div>
                    <h2 className="text-[#000000] text-2xl font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>{editId ? 'Edit Question' : 'Create Question'}</h2>
                    <p className="text-slate-500 text-xs font-medium opacity-60">Manage content for the global pool</p>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="p-3 rounded-2xl bg-black/[0.03] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                    <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar space-y-6">
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Question Content (English)</label>
                  <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="w-full p-4 rounded-2xl text-[#000000] text-sm glass-card border-black/[0.03] focus:border-[#FACC15]/20 focus:outline-none transition-all h-20 resize-none" placeholder="Enter question text..."/>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Question Content (Khmer)</label>
                  <textarea value={form.textKm} onChange={e => setForm({ ...form, textKm: e.target.value })} className="w-full p-4 rounded-2xl text-[#000000] text-sm glass-card border-black/[0.03] focus:border-[#FACC15]/20 focus:outline-none transition-all h-20 resize-none" placeholder="Enter question text in Khmer..."/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Category</label>
                    <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl text-[#000000] text-sm font-bold glass-card border-black/[0.03] focus:outline-none">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl text-[#000000] text-sm font-bold glass-card border-black/[0.03] focus:outline-none">
                      {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal block opacity-70">Answer Options (A-D)</label>
                  {(form.answers || []).map((ans, i) => (<div key={i} className="relative group">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${ans.isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-black/[0.03] text-slate-400 border-black/[0.05]'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="flex flex-col gap-1 w-full pl-14 pr-16 py-3.5 rounded-2xl glass-card border-black/[0.03] group-hover:border-black/[0.06] transition-all">
                        <input type="text" value={ans.text} onChange={e => {
                            const next = [...form.answers];
                            next[i] = { ...next[i], text: e.target.value };
                            setForm({ ...form, answers: next });
                        }} className="bg-transparent text-[#000000] text-sm focus:outline-none font-medium" placeholder={`Option ${String.fromCharCode(65 + i)} (English)`}/>
                        <input type="text" value={ans.textKm} onChange={e => {
                            const next = [...form.answers];
                            next[i] = { ...next[i], textKm: e.target.value };
                            setForm({ ...form, answers: next });
                        }} className="bg-transparent text-slate-500 text-xs focus:outline-none" placeholder={`Option ${String.fromCharCode(65 + i)} (Khmer)`}/>
                      </div>
                      <button onClick={() => markCorrect(i)} className={`absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-normal transition-all ${ans.isCorrect ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-emerald-500 bg-black/[0.03]'}`}>
                        {ans.isCorrect ? 'Correct' : 'Set Correct'}
                      </button>
                    </div>))}
                </div>

                {formError && (<div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-normal p-4 rounded-xl bg-red-50 border border-red-100">
                    <AlertTriangle className="w-4 h-4"/> {formError}
                </div>)}
              </div>

              <div className="p-8 pt-4 flex gap-3 border-t border-black/[0.03]">
                <button onClick={() => setIsAddOpen(false)} className="flex-1 py-4 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-normal hover:bg-black/[0.03] transition-all">Cancel</button>
                <button onClick={handleSave} className="flex-[2] py-4 rounded-2xl text-white text-xs font-bold uppercase tracking-normal shadow-xl transition-all" style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 15px rgba(99,102,241,0.25)' }}>
                  {editId ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </motion.div>
          </div>)}
      </AnimatePresence>

      <AnimatePresence>
        {catModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCatModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] glass-card border-white/20 shadow-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.98)' }}>
              
              <div className="p-8 pb-4 flex items-center justify-between border-b border-black/[0.03]">
                <div>
                    <h2 className="text-[#000000] text-2xl font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>{catModal.mode === 'add' ? 'Create Category' : 'Edit Category'}</h2>
                    <p className="text-slate-500 text-xs font-medium opacity-60">Define quiz domains and visual themes</p>
                </div>
                <button onClick={() => setCatModal(null)} className="p-3 rounded-2xl bg-black/[0.03] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                    <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar space-y-6">
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Icon & Visual Identity</label>
                  <div className="flex flex-wrap gap-2.5">
                    {ICON_OPTIONS.map(icon => (<button key={icon} onClick={() => setCatForm(f => ({ ...f, icon }))} className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${catForm.icon === icon ? 'bg-[#FACC15]/10 border-2 border-[#FACC15] shadow-md scale-110' : 'bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.04]'}`}>
                        {icon}
                      </button>))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Category Name</label>
                    <input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3.5 rounded-2xl text-[#000000] text-sm glass-card border-black/[0.03] focus:border-[#FACC15]/20 focus:outline-none transition-all" placeholder="e.g. Science & Tech"/>
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Description</label>
                    <input type="text" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3.5 rounded-2xl text-[#000000] text-sm glass-card border-black/[0.03] focus:border-[#FACC15]/20 focus:outline-none transition-all" placeholder="Brief tagline..."/>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-normal mb-2 block opacity-70">Color Theme Palette</label>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_OPTIONS.map(opt => (<button key={opt.value} onClick={() => setCatForm(f => ({ ...f, color: opt.value }))} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${catForm.color === opt.value ? 'bg-black/[0.04] border-2 border-[#000000] shadow-sm' : 'bg-black/[0.01] border border-black/[0.04] hover:bg-black/[0.03]'}`}>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.value} shadow-inner`}/>
                        <span className="text-[10px] font-bold uppercase tracking-normal text-slate-500">{opt.label.split('/')[0]}</span>
                      </button>))}
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 flex gap-3 border-t border-black/[0.03]">
                <button onClick={() => setCatModal(null)} className="flex-1 py-4 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-normal hover:bg-black/[0.03] transition-all">Cancel</button>
                <button onClick={handleSaveCategory} className="flex-[2] py-4 rounded-2xl text-white text-xs font-bold uppercase tracking-normal shadow-xl transition-all" style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 15px rgba(99,102,241,0.25)' }}>
                  {catModal.mode === 'add' ? 'Create Domain' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>)}
      </AnimatePresence>
    </div>
  );  
}
