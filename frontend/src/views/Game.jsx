
import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const PRIZE_LADDER = [
    500, 1000, 2000, 3000, 5000,
    7500, 10000, 12500, 15000, 25000,
    50000, 100000, 250000, 500000, 1000000
];

const Game = ({ user }) => {
    const [gameSession, setGameSession] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', 'timeout'
    const [lifelines, setLifelines] = useState({ fiftyFifty: true, skip: true, doubleChance: true, audienceVote: true, phoneFriend: true });
    const [hiddenAnswers, setHiddenAnswers] = useState([]); // IDs of answers to hide (50:50)
    const [audienceData, setAudienceData] = useState(null);
    const [friendAdvice, setFriendAdvice] = useState(null);
    const navigate = useNavigate();

    // Init game
    useEffect(() => {
        const initGame = async () => {
             try {
                 const res = await api.post('/games');
                 setGameSession(res.data.session);
                 setCurrentQuestion(res.data.question);
                 setLifelines(res.data.session.lifelines); // server provides remaining lifelines
             } catch (e) {
                 console.error("Failed to start game", e);
             }
        };
        initGame();
    }, []);

    // Timer logic
    useEffect(() => {
        if (!currentQuestion || feedback) return;
        if (timeLeft <= 0) {
            handleTimeout();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, currentQuestion, feedback]);

    // Handlers
    const handleAnswer = async (answerId) => {
        if (feedback) return;
        setSelectedAnswer(answerId);
        
        try {
            const res = await api.post(`/games/${gameSession.id}/answer`, { answer_id: answerId });
            
            if (res.data.status === 'correct') {
                setFeedback('correct');
                setTimeout(() => {
                    setFeedback(null);
                    setCurrentQuestion(res.data.next_question);
                    setGameSession(prev => ({ ...prev, current_level: prev.current_level + 1, score: res.data.score }));
                    setTimeLeft(30);
                    setHiddenAnswers([]);
                    setSelectedAnswer(null);
                }, 2000);
            } else if (res.data.status === 'wrong') {
                setFeedback('wrong');
                setTimeout(() => navigate('/dashboard'), 3000); // Or show game over modal
            } else if (res.data.status === 'win') {
                setFeedback('win');
                setTimeout(() => navigate('/dashboard'), 5000);
            } else if (res.data.status === 'try_again') {
                setFeedback('wrong');
                setTimeout(() => {
                     setFeedback(null);
                     // Disable the wrong answer so they can't pick it again
                     setHiddenAnswers(prev => [...prev, answerId]); 
                     setSelectedAnswer(null); 
                     // Timer continues effectively because we cleared feedback
                }, 1500);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const useLifeline = async (type) => {
        if (!lifelines[type] || feedback || !currentQuestion) return;
        
        // Optimistic UI update
        setLifelines(prev => ({ ...prev, [type]: false }));

        try {
            const res = await api.post(`/games/${gameSession.id}/lifeline`, { type, question_id: currentQuestion.id });
            if (type === 'fiftyFifty') {
                if (res.data.hidden_ids) {
                    setHiddenAnswers(res.data.hidden_ids);
                } else {
                     // specific handling if backend doesn't return hidden_ids?
                }
            } else if (type === 'skip') {
                setCurrentQuestion(res.data.next_question);
                setTimeLeft(30); 
                // Skip logic on backend might verify if score increases or stays same
            } else if (type === 'audienceVote') {
                setAudienceData(res.data.vote_data);
            } else if (type === 'phoneFriend') {
                setFriendAdvice(res.data.friend_advice);
            }
            // Double chance just sets flag on backend
        } catch (e) {
            console.error(e);
            // Revert on error
            setLifelines(prev => ({ ...prev, [type]: true }));
        }
    };

    const handleTimeout = () => {
        setFeedback('timeout');
        setTimeout(() => navigate('/dashboard'), 3000);
    };

    if (!currentQuestion) return <div className="loading">Loading Studio...</div>;

    return (
        <div className="game-screen">
            <div className="game-header">
                <div className="timer-circle {timeLeft < 10 ? 'danger' : ''}">
                    {timeLeft}
                </div>
                <div className="money-ladder">
                    Current Prize: ${PRIZE_LADDER[gameSession.current_level - 1] || 0}
                </div>
            </div>

            <div className="main-stage">
                <div className="question-box glass-panel">
                    <h2>{currentQuestion.text}</h2>
                </div>

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

            <div className="lifelines-panel">
                <button 
                    className={`lifeline-btn ${!lifelines.fiftyFifty ? 'used' : ''}`}
                    onClick={() => useLifeline('fiftyFifty')}
                    disabled={!lifelines.fiftyFifty}
                >
                    50:50
                </button>
                <button 
                    className={`lifeline-btn ${!lifelines.audienceVote ? 'used' : ''}`}
                    onClick={() => useLifeline('audienceVote')}
                    disabled={!lifelines.audienceVote}
                >
                    👥 AUDIENCE
                </button>
                <button 
                    className={`lifeline-btn ${!lifelines.phoneFriend ? 'used' : ''}`}
                    onClick={() => useLifeline('phoneFriend')}
                    disabled={!lifelines.phoneFriend}
                >
                    📞 PHONE
                </button>
                <button 
                    className={`lifeline-btn ${!lifelines.skip ? 'used' : ''}`}
                    onClick={() => useLifeline('skip')}
                    disabled={!lifelines.skip}
                >
                    ⤺ SKIP
                </button>
                <button 
                    className={`lifeline-btn ${!lifelines.doubleChance ? 'used' : ''}`}
                    onClick={() => useLifeline('doubleChance')}
                    disabled={!lifelines.doubleChance}
                >
                    x2 CHANCE
                </button>
            </div>

            {/* Audience Vote Modal */}
            {audienceData && (
                <div className="lifeline-modal-overlay">
                    <div className="lifeline-modal-content glass-panel">
                        <h2>Audience Vote</h2>
                        <div className="audience-chart">
                            {currentQuestion.answers.map(ans => (
                                <div key={ans.id} className="audience-row">
                                    <span className="audience-ans">{ans.text}</span>
                                    <div className="audience-bar-bg">
                                        <div 
                                            className="audience-bar-fill" 
                                            style={{ width: `${audienceData[ans.id]}%` }}
                                        ></div>
                                    </div>
                                    <span className="audience-pct">{audienceData[ans.id]}%</span>
                                </div>
                            ))}
                        </div>
                        <button className="neon-button close-btn" onClick={() => setAudienceData(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Phone a Friend Modal */}
            {friendAdvice && (
                <div className="lifeline-modal-overlay">
                    <div className="lifeline-modal-content glass-panel">
                        <h2>Phone a Friend</h2>
                        <p className="friend-advice-text">"{friendAdvice}"</p>
                        <button className="neon-button close-btn" onClick={() => setFriendAdvice(null)}>Close</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .lifeline-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .lifeline-modal-content {
                    background: rgba(20, 30, 60, 0.95);
                    padding: 30px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
                }
                .lifeline-modal-content h2 {
                    color: #00ffff;
                    margin-bottom: 20px;
                }
                .audience-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 25px;
                }
                .audience-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .audience-ans {
                    flex: 1;
                    text-align: right;
                    color: white;
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .audience-bar-bg {
                    flex: 2;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                }
                .audience-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00ffff, #3b82f6);
                    transition: width 1s ease-out;
                }
                .audience-pct {
                    width: 40px;
                    text-align: left;
                    color: #fbbf24;
                    font-weight: bold;
                }
                .friend-advice-text {
                    font-size: 1.2rem;
                    color: white;
                    font-style: italic;
                    margin-bottom: 25px;
                    line-height: 1.5;
                }
                .close-btn {
                    padding: 10px 30px;
                }
                .lifelines-panel {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
            `}</style>
        </div>
    );
};

export default Game;
