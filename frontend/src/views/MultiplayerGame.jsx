import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import echo from '../echo';

const PRIZE_LADDER = [
    500, 1000, 2000, 3000, 5000,
    7500, 10000, 12500, 15000, 25000,
    50000, 100000, 250000, 500000, 1000000
];

const MultiplayerGame = ({ user }) => {
    const { matchId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Derive opponent list once from location state
    const opponents = location.state?.opponents
        || (location.state?.opponent ? [location.state.opponent] : []);

    // ── Game state ──────────────────────────────────────────────────────────
    const [gameSession, setGameSession]       = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeLeft, setTimeLeft]             = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback]             = useState(null); // 'correct'|'wrong'|'win'|'timeout'
    const [hiddenAnswers, setHiddenAnswers]   = useState([]);

    // ── Multiplayer score state ─────────────────────────────────────────────
    // opponentScores: { [userId]: score }  — live money display
    const [opponentScores, setOpponentScores] = useState(() => {
        const init = {};
        opponents.forEach(opp => { init[opp.id] = 0; });
        return init;
    });

    // ── End-game state ──────────────────────────────────────────────────────
    const [myFinalScore, setMyFinalScore]         = useState(null);
    const [finishedPlayers, setFinishedPlayers]   = useState({});
    const [waitingForOpponents, setWaitingForOpponents] = useState(false);
    const [finalResults, setFinalResults]         = useState(null);

    // Keep a ref so async callbacks always read the latest value
    const gameSessionRef = useRef(null);
    useEffect(() => { gameSessionRef.current = gameSession; }, [gameSession]);

    // ── Computed money values ───────────────────────────────────────────────
    // Prize for the CURRENT question (what you win if you answer correctly)
    const currentQuestionPrize = gameSession ? (PRIZE_LADDER[gameSession.current_level - 1] ?? 0) : 0;
    // Safe-haven: what you keep if you lose NOW (prize from the level you already passed)
    const safeHavenScore = gameSession ? (PRIZE_LADDER[gameSession.current_level - 2] ?? 0) : 0;

    // ── Broadcast helper ────────────────────────────────────────────────────
    // Fire-and-forget; always uses the live matchId
    const notifyAction = useCallback(async (actionType, payload) => {
        try {
            await api.post('/multiplayer/action', {
                match_id: matchId,
                action_type: actionType,
                payload,
            });
        } catch (e) {
            console.warn('notifyAction failed:', e?.response?.data || e.message);
        }
    }, [matchId]);

    // ── WebSocket subscription + game init ──────────────────────────────────
    useEffect(() => {
        // 1. Subscribe FIRST, so we never miss events sent during init
        const channel = echo.private(`match.${matchId}`)
            .listen('.game.action', (e) => {
                // Ignore our own broadcasts (server echoes to all, including sender)
                if (String(e.user_id) === String(user.id)) return;

                if (e.action === 'score_update') {
                    setOpponentScores(prev => ({
                        ...prev,
                        [e.user_id]: e.data.score,
                    }));
                } else if (e.action === 'user_finished') {
                    setFinishedPlayers(prev => ({
                        ...prev,
                        [e.user_id]: e.data.score,
                    }));
                }
            });

        // 2. Initialize (or resume) the game session
        const initGame = async () => {
            try {
                const res = await api.post('/games', { match_id: matchId });
                setGameSession(res.data.session);
                setCurrentQuestion(res.data.question);
                // Announce we're in (score = $0 at start)
                await notifyAction('score_update', { score: 0 });
            } catch (e) {
                console.error('Failed to start game:', e?.response?.data || e);
            }
        };

        initGame();

        return () => {
            channel.stopListening('.game.action');
            echo.leave(`match.${matchId}`);
        };
    // notifyAction is stable (useCallback), user.id and matchId are stable strings
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, user.id]);

    // ── HTTP Fallback: Poll scores every 5s ─────────────────────────────────
    useEffect(() => {
        if (waitingForOpponents || finalResults) return;

        const pollScores = async () => {
            try {
                const res = await api.get(`/multiplayer/scores/${matchId}`);
                const fetchedScores = res.data;
                
                setOpponentScores(prev => {
                    const next = { ...prev };
                    let changed = false;
                    for (const [uid, score] of Object.entries(fetchedScores)) {
                        // Ignore our own score, only update opponents
                        if (String(uid) !== String(user.id)) {
                            // Only update if the fetched score is higher (fixes race with WS)
                            const current = next[uid] || 0;
                            const incoming = Number(score) || 0;
                            if (incoming > current) {
                                next[uid] = incoming;
                                changed = true;
                            }
                        }
                    }
                    return changed ? next : prev;
                });
            } catch (e) {
                // Silent fail for polling
            }
        };

        const interval = setInterval(pollScores, 5000);
        return () => clearInterval(interval);
    }, [matchId, user.id, waitingForOpponents, finalResults]);

    // ── Countdown timer ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentQuestion || feedback || finalResults || myFinalScore !== null) return;
        if (timeLeft <= 0) {
            handleTimeout();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    // handleTimeout reads state via ref — disable exhaustive lint
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, currentQuestion, feedback, finalResults, myFinalScore]);

    // ── Broadcast my final score when game ends ─────────────────────────────
    useEffect(() => {
        if (myFinalScore === null) return;
        notifyAction('user_finished', { score: myFinalScore });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myFinalScore]);

    // ── Collect results once ALL opponents finish ───────────────────────────
    useEffect(() => {
        if (myFinalScore === null) return;

        const finishedCount = Object.keys(finishedPlayers).length;
        const totalOpponents = opponents.length;

        if (finishedCount >= totalOpponents) {
            // All opponents reported — build final leaderboard
            const results = [
                { id: user.id, name: user.name, score: myFinalScore, isMe: true },
                ...opponents.map(opp => ({
                    id: opp.id,
                    name: opp.name,
                    score: finishedPlayers[opp.id] ?? opponentScores[opp.id] ?? 0,
                })),
            ].sort((a, b) => b.score - a.score);

            setFinalResults(results);
            setWaitingForOpponents(false);
        } else {
            setWaitingForOpponents(true);
        }
    }, [myFinalScore, finishedPlayers]);  // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-navigate after results ─────────────────────────────────────────
    useEffect(() => {
        if (!finalResults) return;
        const t = setTimeout(() => navigate('/dashboard'), 8000);
        return () => clearTimeout(t);
    }, [finalResults, navigate]);

    // ── Answer handler ──────────────────────────────────────────────────────
    const handleAnswer = async (answerId) => {
        if (feedback || !gameSession) return;
        setSelectedAnswer(answerId);

        try {
            const res = await api.post(`/games/${gameSession.id}/answer`, { answer_id: answerId });

            if (res.data.status === 'correct') {
                const wonScore = PRIZE_LADDER[(gameSession.current_level || 1) - 1] ?? 0;
                setFeedback('correct');
                // Broadcast updated score to opponents immediately
                await notifyAction('score_update', { score: wonScore });

                setTimeout(() => {
                    setFeedback(null);
                    setCurrentQuestion(res.data.next_question);
                    setGameSession(prev => ({
                        ...prev,
                        current_level: prev.current_level + 1,
                        score: res.data.score,
                    }));
                    setTimeLeft(30);
                    setHiddenAnswers([]);
                    setSelectedAnswer(null);
                }, 2000);

            } else if (res.data.status === 'win') {
                const winScore = PRIZE_LADDER[(gameSession.current_level || 1) - 1] ?? 0;
                setFeedback('win');
                await notifyAction('score_update', { score: winScore });
                setTimeout(() => setMyFinalScore(winScore), 2000);

            } else if (res.data.status === 'wrong') {
                const lostScore = PRIZE_LADDER[(gameSession.current_level ?? 1) - 2] ?? 0;
                setFeedback('wrong');
                await notifyAction('score_update', { score: lostScore });
                setTimeout(() => setMyFinalScore(lostScore), 2000);

            } else if (res.data.status === 'try_again') {
                // Double-chance lifeline — just remove the wrong answer
                setFeedback('wrong');
                setTimeout(() => {
                    setFeedback(null);
                    setHiddenAnswers(prev => [...prev, answerId]);
                    setSelectedAnswer(null);
                }, 1500);
            }
        } catch (e) {
            console.error('Answer error:', e?.response?.data || e);
        }
    };

    const handleTimeout = () => {
        const session = gameSessionRef.current;
        const lostScore = session ? (PRIZE_LADDER[(session.current_level ?? 1) - 2] ?? 0) : 0;
        setFeedback('timeout');
        notifyAction('score_update', { score: lostScore });
        setTimeout(() => setMyFinalScore(lostScore), 2000);
    };

    // ── Render: Waiting for opponents ───────────────────────────────────────
    if (waitingForOpponents) {
        const finishedCount = Object.keys(finishedPlayers).length;
        return (
            <div className="game-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel pulse" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ color: 'white' }}>⏳ Waiting for opponents...</h2>
                    <p style={{ marginTop: '1rem', color: '#fbbf24', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Your score: ${myFinalScore?.toLocaleString()}
                    </p>
                    <div style={{ marginTop: '2rem', color: '#9ca3af' }}>
                        {finishedCount} / {opponents.length} opponents finished
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        {opponents.map(opp => (
                            <div key={opp.id} style={{ padding: '8px', color: finishedPlayers[opp.id] !== undefined ? '#4ade80' : '#9ca3af' }}>
                                {opp.name}: {finishedPlayers[opp.id] !== undefined
                                    ? `✅ $${finishedPlayers[opp.id].toLocaleString()}`
                                    : `🎯 $${(opponentScores[opp.id] || 0).toLocaleString()} (playing...)`}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Render: Final results ───────────────────────────────────────────────
    if (finalResults) {
        const myRank = finalResults.findIndex(r => r.isMe) + 1;
        const resultColor = myRank === 1 ? '#10b981' : myRank === 2 ? '#eab308' : '#e11d48';
        const emoji = myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : '🥉';

        return (
            <div className="game-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', minWidth: '420px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: resultColor, marginBottom: '0.5rem' }}>
                        {emoji} {myRank === 1 ? 'CHAMPION!' : `Rank #${myRank}`}
                    </h1>
                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Match Results</p>

                    <div className="results-list" style={{ textAlign: 'left' }}>
                        {finalResults.map((r, idx) => (
                            <div key={r.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: r.isMe ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                border: r.isMe ? '1px solid rgba(0,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <span style={{ color: idx === 0 ? '#fbbf24' : 'white' }}>
                                    {idx + 1}. {r.name} {r.isMe && <span style={{ color: '#00ffff', fontSize: '0.8em' }}>(YOU)</span>}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>
                                    ${r.score.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p style={{ marginTop: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Returning to dashboard in 8s...
                    </p>
                </div>
            </div>
        );
    }

    // ── Render: Loading ─────────────────────────────────────────────────────
    if (!currentQuestion) {
        return <div className="loading">Initializing Match...</div>;
    }

    // ── Render: Active game ─────────────────────────────────────────────────
    return (
        <div className="game-screen" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Header: timer + live scores */}
            <div className="game-header">
                <div className={`timer-circle ${timeLeft < 10 ? 'danger' : ''}`}>
                    {timeLeft}
                </div>

                <div className="money-ladder" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    {/* My score */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '2px' }}>{user.name} (YOU)</div>
                        <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ${safeHavenScore.toLocaleString()}
                        </div>
                        <div style={{ color: '#4ade80', fontSize: '0.75rem' }}>
                            → win ${currentQuestionPrize.toLocaleString()}
                        </div>
                    </div>

                    <div style={{ color: '#374151', fontSize: '1.5rem' }}>|</div>

                    {/* Opponent scores */}
                    {opponents.map(opp => (
                        <div key={opp.id} style={{ textAlign: 'center' }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '2px' }}>{opp.name}</div>
                            <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                ${(opponentScores[opp.id] ?? 0).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Question */}
            <div className="main-stage">
                <div className="question-box glass-panel">
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Question {gameSession?.current_level} of 15 — Playing for ${currentQuestionPrize.toLocaleString()}
                    </div>
                    <h2>{currentQuestion.text}</h2>
                </div>

                {/* Answers */}
                <div className="answers-grid">
                    {currentQuestion.answers.map(ans => !hiddenAnswers.includes(ans.id) && (
                        <button
                            key={ans.id}
                            className={`answer-btn ${selectedAnswer === ans.id ? 'selected' : ''} ${feedback && selectedAnswer === ans.id ? feedback : ''}`}
                            onClick={() => handleAnswer(ans.id)}
                            disabled={!!feedback}
                        >
                            <span className="option-label">➤</span> {ans.text}
                        </button>
                    ))}
                </div>
            </div>

            <div className="match-status" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p>First to $1,000,000 wins!</p>
            </div>
        </div>
    );
};

export default MultiplayerGame;
