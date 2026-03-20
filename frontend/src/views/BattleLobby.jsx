
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import echo from '../echo';

const BattleLobby = ({ user }) => {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const [lobby, setLobby] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLobby = async () => {
            try {
                const res = await api.get(`/multiplayer/battle/lobby/${inviteCode}`);
                
                // Track if current user is ready
                const me = res.data.players.find(p => p.id === user.id);
                if (me) setIsReady(me.ready);
                
                // Merge data: prefer the array with more players to prevent stale state overwriting new joins
                setLobby(prev => {
                    if (prev && prev.players && prev.invite_code === res.data.invite_code && prev.players.length > res.data.players.length) {
                        return {
                            ...res.data,
                            players: prev.players,
                            current_count: prev.current_count ?? res.data.current_count,
                            needed: prev.needed ?? res.data.needed
                        };
                    }
                    return res.data;
                });
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to load lobby');
                setLoading(false);
            }
        };

        fetchLobby();

        // Subscribe to user channel for lobby updates
        const channel = echo.private(`user.${user.id}`)
            .listen('.battle.lobby.update', (e) => {
                console.log('Lobby Update:', e);
                if (e.action === 'player_joined' || e.action === 'player_left' || e.action === 'player_ready') {
                    setLobby(prev => {
                        // If `prev` is completely null (API hasn't responded yet), temporarily build scaffold
                        if (!prev) {
                            return {
                                players: e.data.players,
                                current_count: e.data.current_count,
                                needed: e.data.needed
                            };
                        }
                        return {
                            ...prev,
                            players: e.data.players,
                            current_count: e.data.current_count ?? prev.current_count,
                            needed: e.data.needed ?? prev.needed
                        };
                    });
                }
            })
            .listen('.battle.lobby.closed', () => {
                alert('The host has closed the lobby.');
                navigate('/dashboard');
            })
            .listen('.battle.started', (e) => {
                console.log('Battle Started!', e);
                navigate(`/multiplayer/${e.match_id}`, {
                    state: {
                        mode: 'battle',
                        opponents: e.opponents,
                        playerPosition: e.player_position,
                        totalPlayers: e.total_players
                    }
                });
            });

        return () => {
            echo.leave(`user.${user.id}`);
        };
    }, [inviteCode, user.id, navigate]);

    const toggleReady = async () => {
        try {
            const nextReady = !isReady;
            await api.post(`/multiplayer/battle/ready/${inviteCode}`, { ready: nextReady });
            setIsReady(nextReady);
        } catch (err) {
            console.error(err);
        }
    };

    const startBattle = async () => {
        try {
            await api.post(`/multiplayer/battle/start/${inviteCode}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to start battle');
        }
    };

    const leaveLobby = async () => {
        try {
            await api.post(`/multiplayer/battle/leave/${inviteCode}`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="loading">Loading Lobby...</div>;
    if (error) return (
        <div className="error-screen">
            <div className="glass-panel">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    const isHost = lobby?.host.id === user.id;
    const allReady = lobby?.players.every(p => p.ready);
    const canStart = isHost && lobby?.players.length >= lobby?.total_needed; // Removed allReady constraint

    return (
        <div className="battle-lobby-container">
            <header className="lobby-header">
                <h1>Battle Lobby: {inviteCode}</h1>
                <div className="lobby-info">
                    <span className="mode-badge">PRIVATE BATTLE</span>
                    <span className="player-count">{lobby?.players.length} / {lobby?.total_needed} Players</span>
                </div>
            </header>

            <div className="lobby-content">
                <div className="players-list glass-panel">
                    <h3>Players</h3>
                    <ul>
                        {lobby?.players.map(player => (
                            <li key={player.id} className={player.id === user.id ? 'is-me' : ''}>
                                <div className="player-name">
                                    {player.name} {player.id === lobby.host.id && <span className="host-tag">HOST</span>}
                                </div>
                                <div className={`ready-status ${player.ready ? 'ready' : 'not-ready'}`}>
                                    {player.ready ? 'READY' : 'WAITING'}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lobby-actions glass-panel">
                    <div className="invite-section">
                        <p>Share this code with your friends:</p>
                        <div className="code-display">{inviteCode}</div>
                    </div>

                    <div className="button-group">
                        <button 
                            className={`ready-toggle ${isReady ? 'active' : ''}`}
                            onClick={toggleReady}
                        >
                            {isReady ? 'UNREADY' : 'I\'M READY!'}
                        </button>

                        {isHost && (
                            <button 
                                className="start-button"
                                disabled={!canStart}
                                onClick={startBattle}
                                title={!canStart ? 'Wait for enough players to join' : ''}
                            >
                                START BATTLE
                            </button>
                        )}

                        <button className="leave-button" onClick={leaveLobby}>
                            LEAVE LOBBY
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .battle-lobby-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                .lobby-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .lobby-header h1 {
                    font-size: 2.5rem;
                    color: #00ffff;
                    margin-bottom: 10px;
                }
                .mode-badge {
                    background: #f59e0b;
                    color: black;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    margin-right: 15px;
                }
                .lobby-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 25px;
                }
                .players-list ul {
                    list-style: none;
                    padding: 0;
                    margin-top: 20px;
                }
                .players-list li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .is-me {
                    background: rgba(0, 255, 255, 0.1);
                    border-radius: 8px;
                }
                .host-tag {
                    font-size: 0.7rem;
                    background: #8b5cf6;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 8px;
                }
                .ready-status {
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                .ready { color: #10b981; }
                .not-ready { color: #9ca3af; }
                
                .invite-section {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .code-display {
                    font-size: 2rem;
                    font-weight: bold;
                    letter-spacing: 5px;
                    color: #00ffff;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 10px;
                    border-radius: 8px;
                    margin-top: 10px;
                }
                .button-group {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .button-group button {
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .ready-toggle {
                    background: #3b82f6;
                    color: white;
                }
                .ready-toggle.active {
                    background: #10b981;
                }
                .start-button {
                    background: #8b5cf6;
                    color: white;
                }
                .start-button:disabled {
                    background: #4b5563;
                    cursor: not-allowed;
                    opacity: 0.5;
                }
                .leave-button {
                    background: #ef4444;
                    color: white;
                }
                .hint {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #9ca3af;
                    margin-top: 15px;
                }
                @media (max-width: 768px) {
                    .lobby-content {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default BattleLobby;
