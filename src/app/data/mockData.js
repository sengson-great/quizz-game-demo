export const MOCK_USERS = [
    {
        id: 'admin-1', username: 'Admin', email: 'admin@quiz.com', password: 'admin123',
        role: 'admin', avatar: '🧑‍💼', totalScore: 0, gamesPlayed: 0, wins: 0, rank: 0,
        joinedAt: '2024-01-01', preferredCategories: ['science', 'history', 'technology', 'geography', 'sports', 'arts'],
        language: 'en', soundEnabled: true, musicEnabled: false,
    },
    {
        id: 'player-1', username: 'NovaMind', email: 'player@quiz.com', password: 'player123',
        role: 'player', avatar: '🦊', totalScore: 15420, gamesPlayed: 48, wins: 31, rank: 3,
        joinedAt: '2024-02-15', preferredCategories: ['science', 'technology'],
        language: 'en', soundEnabled: true, musicEnabled: true,
    },
];
export const INITIAL_LEADERBOARD = [
    { id: 'lb-1', userId: 'u1', username: 'QuantumBrain', avatar: '🧠', totalScore: 89250, gamesPlayed: 234, wins: 178, rank: 1, bestScore: 5800, winRate: 76.1 },
    { id: 'lb-2', userId: 'u2', username: 'StarChaser', avatar: '⭐', totalScore: 76100, gamesPlayed: 199, wins: 142, rank: 2, bestScore: 5650, winRate: 71.4 },
    { id: 'lb-3', userId: 'player-1', username: 'NovaMind', avatar: '🦊', totalScore: 15420, gamesPlayed: 48, wins: 31, rank: 3, bestScore: 5200, winRate: 64.6 },
    { id: 'lb-4', userId: 'u4', username: 'CipherKing', avatar: '👑', totalScore: 61400, gamesPlayed: 181, wins: 120, rank: 4, bestScore: 5400, winRate: 66.3 },
    { id: 'lb-5', userId: 'u5', username: 'PhoenixRize', avatar: '🔥', totalScore: 58900, gamesPlayed: 175, wins: 114, rank: 5, bestScore: 5100, winRate: 65.1 },
    { id: 'lb-6', userId: 'u6', username: 'NeonWizard', avatar: '🔮', totalScore: 52100, gamesPlayed: 162, wins: 102, rank: 6, bestScore: 4900, winRate: 63.0 },
    { id: 'lb-7', userId: 'u7', username: 'DataKnight', avatar: '⚔️', totalScore: 47800, gamesPlayed: 155, wins: 95, rank: 7, bestScore: 4700, winRate: 61.3 },
    { id: 'lb-8', userId: 'u8', username: 'CosmicSage', avatar: '🌌', totalScore: 43200, gamesPlayed: 140, wins: 83, rank: 8, bestScore: 4600, winRate: 59.3 },
    { id: 'lb-9', userId: 'u9', username: 'VortexPulse', avatar: '⚡', totalScore: 39600, gamesPlayed: 132, wins: 75, rank: 9, bestScore: 4400, winRate: 56.8 },
    { id: 'lb-10', userId: 'u10', username: 'MythicOwl', avatar: '🦉', totalScore: 35100, gamesPlayed: 121, wins: 67, rank: 10, bestScore: 4200, winRate: 55.4 },
    { id: 'lb-11', userId: 'u11', username: 'ShadowRacer', avatar: '🐆', totalScore: 31500, gamesPlayed: 110, wins: 59, rank: 11, bestScore: 4000, winRate: 53.6 },
    { id: 'lb-12', userId: 'u12', username: 'IronLogic', avatar: '🤖', totalScore: 28000, gamesPlayed: 98, wins: 51, rank: 12, bestScore: 3900, winRate: 52.0 },
    { id: 'lb-13', userId: 'u13', username: 'CrystalMind', avatar: '💎', totalScore: 25400, gamesPlayed: 90, wins: 46, rank: 13, bestScore: 3800, winRate: 51.1 },
    { id: 'lb-14', userId: 'u14', username: 'ArcLight', avatar: '💡', totalScore: 22800, gamesPlayed: 83, wins: 41, rank: 14, bestScore: 3700, winRate: 49.4 },
    { id: 'lb-15', userId: 'u15', username: 'HexMaster', avatar: '🎭', totalScore: 20100, gamesPlayed: 76, wins: 36, rank: 15, bestScore: 3500, winRate: 47.4 },
];
export const SIMULATED_OPPONENTS = [
    { id: 'opp-1', username: 'QuantumBrain', avatar: '🧠', skillLevel: 0.85 },
    { id: 'opp-2', username: 'StarChaser', avatar: '⭐', skillLevel: 0.75 },
    { id: 'opp-3', username: 'CipherKing', avatar: '👑', skillLevel: 0.70 },
    { id: 'opp-4', username: 'PhoenixRize', avatar: '🔥', skillLevel: 0.65 },
    { id: 'opp-5', username: 'NeonWizard', avatar: '🔮', skillLevel: 0.60 },
    { id: 'opp-6', username: 'DataKnight', avatar: '⚔️', skillLevel: 0.55 },
    { id: 'opp-7', username: 'CosmicSage', avatar: '🌌', skillLevel: 0.50 },
    { id: 'opp-8', username: 'VortexPulse', avatar: '⚡', skillLevel: 0.45 },
];
export const MOCK_GAME_HISTORY = [
    { id: 'g1', mode: '1v1', score: 4200, correctAnswers: 12, totalQuestions: 15, date: '2026-03-08', opponents: ['QuantumBrain'] },
    { id: 'g2', mode: 'Solo', score: 5200, correctAnswers: 14, totalQuestions: 15, date: '2026-03-07' },
    { id: 'g3', mode: 'Room', score: 3800, correctAnswers: 11, totalQuestions: 15, date: '2026-03-06', rank: 2, opponents: ['StarChaser', 'CipherKing', 'PhoenixRize'] },
    { id: 'g4', mode: '1v1', score: 4600, correctAnswers: 13, totalQuestions: 15, date: '2026-03-05', opponents: ['NeonWizard'] },
    { id: 'g5', mode: 'Solo', score: 3400, correctAnswers: 10, totalQuestions: 15, date: '2026-03-04' },
];
export const ANALYTICS_DATA = {
    categoryScores: [
        { category: 'Science', avgScore: 72, games: 89 },
        { category: 'History', avgScore: 65, games: 76 },
        { category: 'Technology', avgScore: 81, games: 102 },
        { category: 'Geography', avgScore: 58, games: 67 },
        { category: 'Sports', avgScore: 69, games: 71 },
        { category: 'Arts', avgScore: 54, games: 55 },
    ],
    dailyUsers: Array.from({ length: 30 }, (_, i) => ({
        day: `Mar ${i + 1}`,
        users: Math.floor(Math.random() * 200) + 150,
        games: Math.floor(Math.random() * 450) + 250,
    })),
    gameModeDistribution: [
        { name: 'Solo', value: 45, fill: '#E84C6A' },
        { name: '1v1', value: 35, fill: '#06b6d4' },
        { name: 'Room', value: 20, fill: '#f59e0b' },
    ],
    mostFailedQuestions: [
        { question: 'What does ACID stand for?', failRate: 78, category: 'Technology' },
        { question: 'Chandrasekhar limit value?', failRate: 74, category: 'Science' },
        { question: 'Teotihuacan civilization?', failRate: 71, category: 'History' },
        { question: 'Golf ball dimples count?', failRate: 68, category: 'Sports' },
        { question: '"Anachrony" literary term?', failRate: 65, category: 'Arts' },
        { question: 'What is BGP in networking?', failRate: 63, category: 'Technology' },
        { question: 'Half-life of Carbon-14?', failRate: 61, category: 'Science' },
        { question: 'Treaty of Westphalia year?', failRate: 58, category: 'History' },
    ],
    totalStats: {
        totalGames: 4280,
        totalPlayers: 1247,
        avgCompletionRate: 87.3,
        avgScore: 3240,
    },
};
