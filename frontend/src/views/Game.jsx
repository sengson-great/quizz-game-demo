
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
    const [lifelines, setLifelines] = useState({ fiftyFifty: true, skip: true, doubleChance: true });
    const [hiddenAnswers, setHiddenAnswers] = useState([]); // IDs of answers to hide (50:50)
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
        </div>
    );
};

export default Game;
