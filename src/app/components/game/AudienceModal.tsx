import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Phone } from 'lucide-react';
import { Answer } from '../../data/questions';
import { AudienceData } from '../../contexts/GameContext';

interface AudienceModalProps {
  type: 'audience' | 'phone';
  answers: Answer[];
  audienceData?: AudienceData;
  phoneMessage?: string;
  onClose: () => void;
}

export function AudienceModal({ type, answers, audienceData, phoneMessage, onClose }: AudienceModalProps) {
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-full max-w-md rounded-2xl p-6"
          style={{ background: 'linear-gradient(145deg, #131842, #1a1145)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: type === 'audience' ? 'rgba(99,102,241,0.15)' : 'rgba(52,211,153,0.15)' }}>
                {type === 'audience' ? <Users className="w-5 h-5 text-indigo-400" /> : <Phone className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h3 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                  {type === 'audience' ? 'Ask the Audience' : 'Phone a Friend'}
                </h3>
                <p className="text-slate-400 text-sm">{type === 'audience' ? 'Audience votes are in!' : 'Your friend says...'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {type === 'audience' && audienceData && (
            <div className="space-y-3">
              {answers.map((answer, i) => {
                const votes = audienceData[answer.id] || 0;
                return (
                  <div key={answer.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-200">
                        <span className="text-indigo-400 mr-2" style={{ fontWeight: 700 }}>{labels[i]}</span>
                        {answer.text}
                      </span>
                      <span className="text-white" style={{ fontWeight: 600 }}>{votes}%</span>
                    </div>
                    <div className="h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${votes}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15 }}
                        className="h-full rounded-lg flex items-center justify-end pr-2"
                        style={{ background: votes > 50 ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'linear-gradient(90deg, #475569, #64748b)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {type === 'phone' && phoneMessage && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <span className="text-lg">🧑‍🏫</span>
                </div>
                <div>
                  <p className="text-emerald-400 text-sm mb-1" style={{ fontWeight: 500 }}>Dr. Alex</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{phoneMessage}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-xl text-white text-sm transition-all hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            Got it!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
