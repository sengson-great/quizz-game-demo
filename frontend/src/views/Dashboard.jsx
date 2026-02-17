
import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Mock data for now or fetch
        // api.get('/leaderboard').then(res => setLeaderboard(res.data));
        // api.get('/history').then(res => setHistory(res.data));
        setLeaderboard([
            { name: 'Alice', users_score: '1,000,000' },
            { name: 'Bob', users_score: '500,000' },
            { name: 'Charlie', users_score: '32,000' },
        ]);
    }, []);

    const startGame = async () => {
        try {
            // In real app: const res = await api.post('/games/start');
            // navigate(`/game/${res.data.id}`);
            navigate('/game');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user.name}</h1>
                <div className="admin-link">
                    {user.role === 'admin' && <button onClick={() => navigate('/admin')}>Admin Panel</button>}
                </div>
            </header>
            
            <main className="dashboard-content">
                <section className="start-game-section">
                    <button className="neon-button-large pulse" onClick={startGame}>
                        PLAY NOW
                    </button>
                    <p>Challenge the ladder. Win the glory.</p>
                </section>
                
                <section className="stats-section glass-panel">
                    <h3>Top Millionaires</h3>
                    <ul>
                        {leaderboard.map((u, i) => (
                            <li key={i}>
                                <span>{i + 1}. {u.name}</span>
                                <span className="score">${u.users_score}</span>
                            </li>
                        ))}
                    </ul>
                </section>
                
                <section className="history-section glass-panel">
                    <h3>Your Last Games</h3>
                    {history.length === 0 ? <p>No games played yet.</p> : (
                        <ul>
                            {history.map((g, i) => <li key={i}>{g.score} - {g.date}</li>)}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
