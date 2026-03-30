import { createBrowserRouter } from 'react-router-dom';
import { RootProvider } from './components/layout/RootProvider';
import { Layout, FullLayout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ModeSelectPage from './pages/ModeSelectPage';
import MatchmakingPage from './pages/MatchmakingPage';
import SmallRoomLobbyPage from './pages/SmallRoomLobbyPage';
import PrivateBattleLobbyPage from './pages/PrivateBattleLobbyPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
    {
        Component: RootProvider,
        children: [
            {
                Component: FullLayout,
                children: [
                    { path: '/', Component: LandingPage },
                    { path: '/auth', Component: AuthPage },
                    {
                        element: <ProtectedRoute />,
                        children: [
                            { path: '/matchmaking', Component: MatchmakingPage },
                            { path: '/lobby', Component: SmallRoomLobbyPage },
                            { path: '/battle-lobby', Component: PrivateBattleLobbyPage },
                            { path: '/game', Component: GamePage },
                        ]
                    }
                ],
            },
            {
                Component: Layout,
                element: <ProtectedRoute />,
                children: [
                    { path: '/dashboard', Component: DashboardPage },
                    { path: '/mode-select', Component: ModeSelectPage },
                    { path: '/results', Component: ResultsPage },
                    { path: '/leaderboard', Component: LeaderboardPage },
                    { path: '/settings', Component: SettingsPage },
                    { path: '/admin', Component: AdminPage },
                ],
            },
            { path: '*', Component: NotFoundPage },
        ],
    },
]);

