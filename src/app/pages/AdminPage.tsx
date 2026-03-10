import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Plus, Edit3, Trash2, Search, Filter, BarChart2, Users, Trophy, Settings2, X, Check, AlertTriangle, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QUESTIONS, CATEGORIES, Question, Answer } from '../data/questions';
import { ANALYTICS_DATA, INITIAL_LEADERBOARD } from '../data/mockData';

const STORAGE_KEY = 'quiz_admin_questions';

function loadQuestions(): Question[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : QUESTIONS;
  } catch { return QUESTIONS; }
}
function saveQuestions(qs: Question[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
}

type Tab = 'questions' | 'analytics' | 'leaderboard' | 'system';

interface QuestionForm {
  categoryId: string;
  difficulty: Question['difficulty'];
  text: string;
  explanation: string;
  answers: { text: string; isCorrect: boolean }[];
}

const emptyForm = (): QuestionForm => ({
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

// ─── Custom chart components ────────────────────────────────────

function HorizBar({ label, value, max, color, index }: { label: string; value: number; max: number; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-2"
    >
      <span className="text-gray-500 text-xs w-36 flex-shrink-0 truncate" title={label}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.7, delay: 0.1 + index * 0.05 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs w-8 text-right flex-shrink-0" style={{ color }}>{value}%</span>
    </motion.div>
  );
}

function VertBar({ label, value, max, color, index }: { label: string; value: number; max: number; color: string; index: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs" style={{ color }}>{value}</span>
      <div className="w-full flex items-end justify-center" style={{ height: 100 }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.1 + index * 0.08 }}
          className="w-full rounded-t-md"
          style={{ background: color, minHeight: 4 }}
        />
      </div>
      <span className="text-slate-500 text-xs text-center leading-tight">{label}</span>
    </div>
  );
}

function MiniLineChart({ data }: { data: { day: string; users: number; games: number }[] }) {
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
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (v: number) => PAD.top + innerH - ((v - minV) / range) * innerH;

  const usersPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.users).toFixed(1)}`).join(' ');
  const gamesPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.games).toFixed(1)}`).join(' ');

  const yTicks = [minV, Math.round((minV + maxV) / 2), maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PAD.left} y1={toY(v)} x2={PAD.left + innerW} y2={toY(v)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          <text x={PAD.left - 4} y={toY(v) + 4} textAnchor="end" fill="#64748b" fontSize="9">{v}</text>
        </g>
      ))}
      <path d={usersPath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={gamesPath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => i % 2 === 0 && (
        <text key={d.day} x={toX(i)} y={H - 6} textAnchor="middle" fill="#64748b" fontSize="9">{d.day}</text>
      ))}
      <circle cx={PAD.left + 4} cy={PAD.top - 2} r="3" fill="#818cf8" />
      <text x={PAD.left + 10} y={PAD.top + 2} fill="#94a3b8" fontSize="9">Users</text>
      <circle cx={PAD.left + 52} cy={PAD.top - 2} r="3" fill="#34d399" />
      <text x={PAD.left + 58} y={PAD.top + 2} fill="#94a3b8" fontSize="9">Games</text>
    </svg>
  );
}

function DonutChart({ segments }: { segments: { name: string; value: number; fill: string }[] }) {
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
    const path = [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${xi2.toFixed(2)} ${yi2.toFixed(2)}`,
      `A ${ir} ${ir} 0 ${large} 0 ${xi1.toFixed(2)} ${yi1.toFixed(2)}`,
      'Z',
    ].join(' ');
    cumAngle += angle;
    return { ...seg, path, pct: Math.round((seg.value / total) * 100) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" width="160" height="160">
        {arcs.map(arc => (
          <path key={arc.name} d={arc.path} fill={arc.fill} opacity={0.85} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#374151" fontSize="13" fontWeight="700">Mode</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="10">split</text>
      </svg>
      <div className="space-y-3">
        {arcs.map(arc => (
          <div key={arc.name} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: arc.fill }} />
            <span className="text-gray-600 text-sm w-10">{arc.name}</span>
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
              <div className="h-full rounded-full" style={{ width: `${arc.pct}%`, background: arc.fill }} />
            </div>
            <span className="text-xs" style={{ color: arc.fill }}>{arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────

export default function AdminPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('questions');
  const [questions, setQuestions] = useState<Question[]>(loadQuestions);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<string>('All');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; question?: Question } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm());
  const [formError, setFormError] = useState('');
  const [systemConfig, setSystemConfig] = useState({ timerDuration: 30, easyCount: 5, mediumCount: 5, hardCount: 5 });
  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.role !== 'admin') { navigate('/dashboard'); return; }
  }, [currentUser, navigate]);

  const filteredQs = questions.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || q.difficulty === diffFilter;
    const matchCat = catFilter === 'All' || q.categoryId === catFilter;
    return matchSearch && matchDiff && matchCat;
  });

  const openAdd = () => { setForm(emptyForm()); setFormError(''); setModal({ mode: 'add' }); };
  const openEdit = (q: Question) => {
    setForm({
      categoryId: q.categoryId,
      difficulty: q.difficulty,
      text: q.text,
      explanation: q.explanation || '',
      answers: q.answers.map(a => ({ text: a.text, isCorrect: a.isCorrect })),
    });
    setFormError('');
    setModal({ mode: 'edit', question: q });
  };

  const handleDelete = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    saveQuestions(updated);
    setDeleteConfirm(null);
  };

  const validateForm = () => {
    if (!form.text.trim()) return 'Question text is required';
    if (form.answers.some(a => !a.text.trim())) return 'All answer options must be filled';
    if (!form.answers.some(a => a.isCorrect)) return 'At least one correct answer required';
    return '';
  };

  const handleSave = () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    const answers: Answer[] = form.answers.map((a, i) => ({ id: ['a', 'b', 'c', 'd'][i], text: a.text, isCorrect: a.isCorrect }));
    if (modal?.mode === 'add') {
      const newQ: Question = {
        id: `custom-${Date.now()}`,
        categoryId: form.categoryId,
        difficulty: form.difficulty,
        text: form.text,
        explanation: form.explanation,
        answers,
      };
      const updated = [...questions, newQ];
      setQuestions(updated);
      saveQuestions(updated);
    } else if (modal?.question) {
      const updated = questions.map(q => q.id === modal.question!.id ? { ...q, categoryId: form.categoryId, difficulty: form.difficulty, text: form.text, explanation: form.explanation, answers } : q);
      setQuestions(updated);
      saveQuestions(updated);
    }
    setModal(null);
  };

  const markCorrect = (idx: number) => {
    setForm(f => ({ ...f, answers: f.answers.map((a, i) => ({ ...a, isCorrect: i === idx })) }));
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'questions', label: 'Questions', icon: Filter },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'system', label: 'System', icon: Settings2 },
  ];

  const catScoreMax = Math.max(...ANALYTICS_DATA.categoryScores.map(d => d.avgScore));
  const catColors = ['#818cf8', '#fbbf24', '#34d399', '#f472b6', '#fb923c', '#22d3ee'];
  const updatedDistribution = ANALYTICS_DATA.gameModeDistribution.map((d, i) => ({
    ...d,
    fill: ['#818cf8', '#34d399', '#fbbf24'][i] || d.fill,
  }));

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(232,54,78,0.06)', border: '1px solid rgba(232,54,78,0.12)' }}>
          <Shield className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Content Management & Analytics</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(232,54,78,0.04)', border: '1px solid rgba(232,54,78,0.1)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-rose-500 text-xs">{currentUser?.username}</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Questions', value: questions.length, color: '#e8364e', bgStyle: { background: 'rgba(232,54,78,0.04)', border: '1px solid rgba(232,54,78,0.1)' } },
          { label: 'Total Players', value: ANALYTICS_DATA.totalStats.totalPlayers.toLocaleString(), color: '#059669', bgStyle: { background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' } },
          { label: 'Games Played', value: ANALYTICS_DATA.totalStats.totalGames.toLocaleString(), color: '#d97706', bgStyle: { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' } },
          { label: 'Completion Rate', value: `${ANALYTICS_DATA.totalStats.avgCompletionRate}%`, color: '#059669', bgStyle: { background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' } },
        ].map(({ label, value, color, bgStyle }) => (
          <div key={label} className="rounded-2xl p-5 bg-white" style={bgStyle}>
            <p className="text-2xl" style={{ color, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all"
            style={{
              background: tab === id ? 'rgba(232,54,78,0.06)' : 'transparent',
              border: tab === id ? '1px solid rgba(232,54,78,0.12)' : '1px solid transparent',
              color: tab === id ? '#e8364e' : '#94a3b8',
            }}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Questions Tab */}
      {tab === 'questions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
            </div>
            <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
              className="px-4 py-3 rounded-xl text-gray-800 focus:outline-none text-sm"
              style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="px-4 py-3 rounded-xl text-gray-800 focus:outline-none text-sm"
              style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 2px 10px rgba(232,54,78,0.25)' }}>
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <p className="text-gray-400 text-xs mb-3">{filteredQs.length} of {questions.length} questions</p>

          <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-gray-400 text-xs uppercase tracking-wider"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="col-span-6">Question</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
              {filteredQs.map((q, i) => {
                const cat = CATEGORIES.find(c => c.id === q.categoryId);
                const diffStyle: Record<string, { bg: string; color: string }> = {
                  Easy: { bg: 'rgba(52,211,153,0.08)', color: '#059669' },
                  Medium: { bg: 'rgba(251,191,36,0.08)', color: '#d97706' },
                  Hard: { bg: 'rgba(244,63,94,0.08)', color: '#e11d48' },
                };
                const ds = diffStyle[q.difficulty];
                return (
                  <motion.div key={q.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-12 items-center px-5 py-4 hover:bg-rose-50/30 transition-colors gap-2">
                    <div className="col-span-12 sm:col-span-6">
                      <p className="text-gray-700 text-sm line-clamp-2">{q.text}</p>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <span className="text-xs text-gray-500">{cat?.icon} {cat?.name}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: ds.bg, color: ds.color }}>{q.difficulty}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-2 flex justify-end gap-2">
                      <button onClick={() => openEdit(q)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === q.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded text-gray-400 hover:bg-gray-50"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(q.id)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Most Failed Questions</h3>
              <div className="space-y-3">
                {ANALYTICS_DATA.mostFailedQuestions.map((d, i) => (
                  <HorizBar key={d.question} label={d.question.length > 28 ? d.question.slice(0, 28) + '...' : d.question} value={d.failRate} max={100} color="#fb7185" index={i} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Avg Score by Category</h3>
              <div className="flex items-end gap-2 h-32 px-2">
                {ANALYTICS_DATA.categoryScores.map((d, i) => (
                  <VertBar key={d.category} label={d.category.slice(0, 4)} value={d.avgScore} max={catScoreMax} color={catColors[i % catColors.length]} index={i} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ANALYTICS_DATA.categoryScores.map((d, i) => (
                  <span key={d.category} className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: catColors[i % catColors.length] }} />
                    {d.category}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 lg:col-span-2 bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Daily Activity (March 2026)</h3>
              <div style={{ height: 140 }}>
                <MiniLineChart data={ANALYTICS_DATA.dailyUsers.slice(0, 10)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 className="text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Game Mode Distribution</h3>
            <DonutChart segments={updatedDistribution} />
          </div>
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">{leaderboard.length} players ranked</p>
            <div className="flex gap-2">
              {confirmReset ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Confirm reset?</span>
                  <button onClick={() => { setLeaderboard([]); setConfirmReset(false); }}
                    className="px-3 py-1.5 rounded-lg text-rose-400 transition-colors"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    Yes, Reset
                  </button>
                  <button onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                    style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setLeaderboard(l => l.slice(0, 10))}
                    className="px-3 py-2 rounded-lg text-gray-500 hover:text-gray-800 text-sm transition-colors flex items-center gap-1.5"
                    style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <ChevronDown className="w-3.5 h-3.5" /> Keep Top 10
                  </button>
                  <button onClick={() => setConfirmReset(true)}
                    className="px-3 py-2 rounded-lg text-rose-400 text-sm transition-colors flex items-center gap-1.5"
                    style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                    <AlertTriangle className="w-3.5 h-3.5" /> Reset All
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="grid grid-cols-10 px-5 py-3 text-gray-400 text-xs uppercase tracking-wider"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="col-span-1">#</span>
              <span className="col-span-4">Player</span>
              <span className="col-span-2 text-right">Score</span>
              <span className="col-span-1 text-right">Games</span>
              <span className="col-span-1 text-right">Wins</span>
              <span className="col-span-1 text-right">Action</span>
            </div>
            <div className="divide-y max-h-[450px] overflow-y-auto" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="grid grid-cols-10 items-center px-5 py-3 hover:bg-rose-50/30 transition-colors">
                  <span className="col-span-1 text-gray-400 text-sm">{i + 1}</span>
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="text-xl">{entry.avatar}</span>
                    <span className="text-gray-700 text-sm">{entry.username}</span>
                  </div>
                  <span className="col-span-2 text-right text-gray-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{entry.totalScore.toLocaleString()}</span>
                  <span className="col-span-1 text-right text-gray-400 text-sm">{entry.gamesPlayed}</span>
                  <span className="col-span-1 text-right text-gray-400 text-sm">{entry.wins}</span>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => setLeaderboard(l => l.filter(e => e.id !== entry.id))}
                      className="p-1.5 rounded hover:bg-rose-500/15 text-gray-600 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="py-12 text-center text-gray-400">Leaderboard is empty</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* System Tab */}
      {tab === 'system' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="rounded-2xl p-6 bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 className="text-gray-900 mb-5" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Game Timer</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-500 text-sm">Question Timer Duration</label>
                <span className="text-rose-500 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{systemConfig.timerDuration}s</span>
              </div>
              <input type="range" min={10} max={60} value={systemConfig.timerDuration}
                onChange={e => setSystemConfig(s => ({ ...s, timerDuration: +e.target.value }))}
                className="w-full" style={{ accentColor: '#e8364e' }} />
              <div className="flex justify-between text-gray-400 text-xs mt-1">
                <span>10s</span><span>60s</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 className="text-gray-900 mb-5" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Difficulty Distribution</h3>
            <p className="text-gray-500 text-sm mb-4">Configure the number of questions per difficulty level (max 15 total)</p>
            <div className="space-y-4">
              {([['easyCount', 'Easy', '#34d399'], ['mediumCount', 'Medium', '#fbbf24'], ['hardCount', 'Hard', '#fb7185']] as const).map(([key, label, color]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm" style={{ color }}>{label} Questions</label>
                    <span className="text-sm" style={{ color, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{systemConfig[key]}</span>
                  </div>
                  <input type="range" min={1} max={10} value={systemConfig[key]}
                    onChange={e => setSystemConfig(s => ({ ...s, [key]: +e.target.value }))}
                    className="w-full"
                    style={{ accentColor: color }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{
              background: systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount === 15 ? 'rgba(52,211,153,0.06)' : 'rgba(244,63,94,0.06)',
              border: `1px solid ${systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount === 15 ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)'}`,
            }}>
              <p className="text-sm">
                Total: <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount === 15 ? '#34d399' : '#fb7185' }}>
                  {systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount} / 15
                </span>
                {systemConfig.easyCount + systemConfig.mediumCount + systemConfig.hardCount !== 15 && (
                  <span className="text-rose-400 ml-2 text-xs">Must equal 15</span>
                )}
              </p>
            </div>
          </div>

          <button className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #e8364e, #dc2626)', boxShadow: '0 4px 15px rgba(232,54,78,0.25)' }}>
            <Check className="w-4 h-4" /> Save System Config
          </button>
        </motion.div>
      )}

      {/* Question Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl overflow-hidden bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 className="text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                  {modal.mode === 'add' ? '+ New Question' : 'Edit Question'}
                </h3>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Category</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none"
                      style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Question['difficulty'] }))}
                      className="w-full px-3 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none"
                      style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Question Text</label>
                  <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={3}
                    placeholder="Enter your question..."
                    className="w-full px-3 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none resize-none placeholder-gray-400"
                    style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Explanation (optional)</label>
                  <input type="text" value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                    placeholder="Brief explanation shown after answer..."
                    className="w-full px-3 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none placeholder-gray-400"
                    style={{ background: '#fef7f7', border: '1px solid rgba(0,0,0,0.08)' }} />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-2 block">Answer Options (click check to mark correct)</label>
                  <div className="space-y-2">
                    {form.answers.map((ans, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl transition-all"
                        style={{
                          background: ans.isCorrect ? 'rgba(52,211,153,0.04)' : 'rgba(0,0,0,0.01)',
                          border: ans.isCorrect ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(0,0,0,0.06)',
                        }}>
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ fontWeight: 700, background: 'rgba(0,0,0,0.04)', color: '#64748b' }}>
                          {['A', 'B', 'C', 'D'][i]}
                        </span>
                        <input type="text" value={ans.text} onChange={e => {
                          const updated = [...form.answers];
                          updated[i] = { ...updated[i], text: e.target.value };
                          setForm(f => ({ ...f, answers: updated }));
                        }}
                          placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                          className="flex-1 bg-transparent text-gray-800 text-sm focus:outline-none placeholder-gray-400" />
                        <button onClick={() => markCorrect(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: ans.isCorrect ? 'rgba(52,211,153,0.15)' : 'transparent',
                            color: ans.isCorrect ? '#34d399' : '#475569',
                          }}>
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {formError && (
                  <div className="flex items-center gap-2 text-rose-400 text-sm p-3 rounded-lg"
                    style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                    <AlertTriangle className="w-4 h-4" /> {formError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-3 rounded-xl text-gray-500 hover:text-gray-800 text-sm transition-colors"
                    style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="flex-1 py-3 rounded-xl text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #e8364e, #dc2626)' }}>
                    {modal.mode === 'add' ? 'Add Question' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}