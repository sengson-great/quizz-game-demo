import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import echo from '../echo';

const Dashboard = ({ user }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);
    const [isMatchmaking, setIsMatchmaking] = useState(false);
    const [matchmakingMode, setMatchmakingMode] = useState('1v1');
    const [showModeSelector, setShowModeSelector] = useState(false);
    const [queueStatus, setQueueStatus] = useState(null);
    const [inviteCodeInput, setInviteCodeInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const ffaModes = [
        { id: 'ffa_4', name: '4 Players FFA', players: 4 },
        { id: 'ffa_6', name: '6 Players FFA', players: 6 },
        { id: 'ffa_8', name: '8 Players FFA', players: 8 },
        { id: 'ffa_10', name: '10 Players FFA', players: 10 },
        { id: 'battle_royale', name: 'Battle Royale (100)', players: 100 }
    ];

    useEffect(() => {
        setLeaderboard([
            { name: 'Alice', score: 1000000 },
            { name: 'Bob', score: 500000 },
            { name: 'Charlie', score: 32000 },
            { name: 'Diana', score: 28000 },
            { name: 'Eve', score: 15000 },
        ]);

        if (user) {
            const channel = echo.private(`user.${user.id}`)
                // Listen for 1v1 match
                .listen('.match.found', (e) => {
                    console.log('1v1 Match Found!', e);
                    setIsMatchmaking(false);
                    setQueueStatus(null);
                    navigate(`/multiplayer/${e.match_id}`, { 
                        state: { 
                            mode: '1v1',
                            opponent: e.opponent,
                            players: [user, e.opponent]
                        } 
                    });
                })
                // Listen for FFA match
                .listen('.ffa.match.found', (e) => {
                    console.log('FFA Match Found!', e);
                    setIsMatchmaking(false);
                    setQueueStatus(null);
                    
                    // Store match info
                    localStorage.setItem(`match_${e.match_id}_players`, JSON.stringify(e.other_players));
                    localStorage.setItem(`match_${e.match_id}_player_number`, e.player_number);
                    
                    navigate(`/ffa/${e.match_id}`, {
                        state: {
                            mode: e.mode,
                            otherPlayers: e.other_players,
                            playerNumber: e.player_number,
                            totalPlayers: e.total_players
                        }
                    });
                })
                // Listen for Private Battle start
                .listen('.battle.started', (e) => {
                    console.log('Battle Started!', e);
                    setIsMatchmaking(false);
                    setQueueStatus(null);
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
                channel.stopListening('.match.found');
                channel.stopListening('.ffa.match.found');
                echo.leave(`user.${user.id}`);
            };
        }
    }, [user, navigate]);

    const startGame = () => {
        navigate('/game');
    };

    const startMatchmaking = async (mode, playerCount = null) => {
        setIsMatchmaking(true);
        setMatchmakingMode(mode);
        setQueueStatus({ mode, playerCount });
        
        try {
            const payload = { mode };
            if (playerCount) {
                payload.player_count = playerCount;
            }
            
            const res = await api.post('/multiplayer/matchmake', payload);
            
            if (res.data.status === 'matched') {
                setIsMatchmaking(false);
                setQueueStatus(null);
                
                if (mode === '1v1') {
                    navigate(`/multiplayer/${res.data.match_id}`, { 
                        state: { 
                            opponent: res.data.opponent,
                            players: res.data.players
                        } 
                    });
                } else {
                    navigate(`/ffa/${res.data.match_id}`, {
                        state: {
                            mode: res.data.mode,
                            players: res.data.players,
                            playerCount: res.data.player_count,
                            yourPosition: res.data.your_position
                        }
                    });
                }
            } else if (res.data.status === 'queued') {
                setQueueStatus({
                    mode: res.data.mode,
                    current: res.data.current_players,
                    needed: res.data.needed,
                    total: res.data.total_needed
                });
            }
        } catch (error) {
            console.error(error);
            setIsMatchmaking(false);
            setQueueStatus(null);
        }
    };

    const cancelMatchmaking = async () => {
        setIsMatchmaking(false);
        setQueueStatus(null);
        try {
            await api.post('/multiplayer/cancel-matchmake', {
                mode: matchmakingMode
            });
        } catch (error) {
            console.error(error);
        }
    };

    const createBattle = async (playerCount) => {
        try {
            const res = await api.post('/multiplayer/battle/create', {
                player_count: playerCount,
                is_private: true
            });
            navigate(`/battle/lobby/${res.data.invite_code}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create battle');
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await api.get(`/players/search?query=${query}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const joinBattle = async () => {
        if (!inviteCodeInput) return;
        try {
            const codeToJoin = inviteCodeInput.toUpperCase();
            const res = await api.post(`/multiplayer/battle/join/${codeToJoin}`);
            navigate(`/battle/lobby/${res.data.invite_code || codeToJoin}`);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to join battle');
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user.name}!</h1>
                <div className="admin-link">
                    {user.role === 'admin' && (
                        <button onClick={() => navigate('/admin')}>Admin Panel</button>
                    )}
                </div>
            </header>
            
            <main className="dashboard-content">
                <section className="game-modes-section">
                    <h2>Game Modes</h2>
                    
                    <div className="modes-grid">
                        {/* Solo Mode */}
                        <div className="mode-card">
                            <h3>Solo Practice</h3>
                            <p>Play against AI and improve your skills</p>
                            <button 
                                className="mode-button solo"
                                onClick={startGame}
                                disabled={isMatchmaking}
                            >
                                PLAY SOLO
                            </button>
                        </div>

                        {/* 1v1 Mode */}
                        <div className="mode-card">
                            <h3>1v1 Duel</h3>
                            <p>Face off against another player</p>
                            {isMatchmaking && matchmakingMode === '1v1' ? (
                                <div className="queue-status">
                                    <p>Searching for opponent...</p>
                                    <button 
                                        className="cancel-button"
                                        onClick={cancelMatchmaking}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="mode-button duel"
                                    onClick={() => startMatchmaking('1v1')}
                                    disabled={isMatchmaking}
                                >
                                    FIND DUEL
                                </button>
                            )}
                        </div>

                        {/* Private Battle Mode */}
                        <div className="mode-card ffa">
                            <h3>Private Battle</h3>
                            <p>Create a room and invite your friends</p>
                            
                            <div className="battle-actions">
                                <div className="create-group">
                                    <p>Create Room:</p>
                                    <div className="ffa-buttons">
                                        {ffaModes.map(mode => (
                                            <button
                                                key={mode.id}
                                                className="ffa-mode-button"
                                                onClick={() => createBattle(mode.players)}
                                                disabled={isMatchmaking}
                                            >
                                                {mode.players}P
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="join-group">
                                    <p>Join with Code:</p>
                                    <div className="join-input-row">
                                        <input 
                                            type="text" 
                                            placeholder="CODE" 
                                            value={inviteCodeInput}
                                            onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                                            maxLength={6}
                                        />
                                        <button 
                                            onClick={joinBattle}
                                            disabled={!inviteCodeInput || isMatchmaking}
                                        >
                                            JOIN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <div className="stats-row">
                    <section className="leaderboard-section glass-panel">
                        <h3>🏆 Leaderboard</h3>
                        <ul>
                            {leaderboard.map((player, index) => (
                                <li key={index}>
                                    <span>{index + 1}. {player.name}</span>
                                    <span className="score">{player.score.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                    
                    <section className="history-section glass-panel">
                        <h3>📊 Recent Matches</h3>
                        {history.length === 0 ? (
                            <p className="no-data">No matches played yet</p>
                        ) : (
                            <ul>
                                {history.map((game, index) => (
                                    <li key={index}>
                                        {game.mode} - {game.result} - {game.score}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section className="search-section glass-panel" style={{ marginTop: '20px' }}>
                    <h3>🔍 Find Opponent</h3>
                    <div className="search-input-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search by username..." 
                            value={searchQuery}
                            onChange={handleSearch}
                            className="player-search-input"
                        />
                        {isSearching && <span className="search-loader">...</span>}
                    </div>
                    
                    {searchResults.length > 0 && (
                        <ul className="search-results">
                            {searchResults.map(player => (
                                <li key={player.id} className="search-item">
                                    <span>{player.name}</span>
                                    <button 
                                        className="invite-link-btn"
                                        onClick={() => {
                                            // For now, let's just show a challenge or copy the 1v1 link
                                            alert(`Challenging ${player.name} is coming soon! For now, use "FIND DUEL" at the same time or share a Room code.`);
                                        }}
                                    >
                                        Challenge
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                        <p className="no-data">No players found matching "{searchQuery}"</p>
                    )}
                </section>
            </main>

            <style jsx>{`
                .modes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .mode-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                }

                .mode-card h3 {
                    margin-bottom: 10px;
                    color: #00ffff;
                }

                .mode-button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .mode-button.solo {
                    background: #4ade80;
                    color: black;
                }

                .mode-button.duel {
                    background: #e11d48;
                    color: white;
                }

                .ffa-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }

                .ffa-mode-button {
                    padding: 8px 15px;
                    background: #f59e0b;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .ffa-mode-button:hover {
                    background: #d97706;
                }

                .battle-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-top: 15px;
                }

                .create-group p, .join-group p {
                    font-size: 0.8rem;
                    color: #9ca3af;
                    margin-bottom: 8px;
                }

                .join-input-row {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }

                .join-input-row input {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 5px;
                    padding: 8px;
                    color: white;
                    width: 100px;
                    text-align: center;
                    font-weight: bold;
                    letter-spacing: 2px;
                }

                .join-input-row button {
                    background: #3b82f6;
                    border: none;
                    border-radius: 5px;
                    padding: 8px 15px;
                    color: white;
                    cursor: pointer;
                }

                .queue-status {
                    padding: 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 5px;
                }

                .cancel-button {
                    padding: 8px 16px;
                    background: #dc2626;
                    border: none;
                    border-radius: 5px;
                    color: white;
                    cursor: pointer;
                    margin-top: 10px;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 10px;
                    padding: 20px;
                }

                .glass-panel h3 {
                    margin-bottom: 15px;
                    color: #00ffff;
                }

                .glass-panel ul {
                    list-style: none;
                    padding: 0;
                }

                .glass-panel li {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .score {
                    color: #fbbf24;
                    font-weight: bold;
                }

                .no-data {
                    color: #9ca3af;
                    text-align: center;
                    padding: 20px;
                }

                .player-search-input {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 12px;
                    color: white;
                    width: 100%;
                    font-size: 1rem;
                    margin-bottom: 10px;
                }

                .search-results {
                    list-style: none;
                    padding: 0;
                    margin-top: 15px;
                }

                .search-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 5px;
                    margin-bottom: 8px;
                }

                .invite-link-btn {
                    background: #8b5cf6;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 12px;
                    color: white;
                    font-size: 0.8rem;
                    cursor: pointer;
                }

                .search-loader {
                    position: absolute;
                    right: 30px;
                    top: 65px;
                    color: #00ffff;
                }

                .search-input-wrapper {
                    position: relative;
                }

                @media (max-width: 768px) {
                    .stats-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;