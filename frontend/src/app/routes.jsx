import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootProvider } from './components/layout/RootProvider';
import { Layout, FullLayout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ModeSelectPage = lazy(() => import('./pages/ModeSelectPage'));
const MatchmakingPage = lazy(() => import('./pages/MatchmakingPage'));
const SmallRoomLobbyPage = lazy(() => import('./pages/SmallRoomLobbyPage'));
const PrivateBattleLobbyPage = lazy(() => import('./pages/PrivateBattleLobbyPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// A simple loading component for suspense fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a2e]">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <div className="mt-4 text-yellow-500 font-medium text-sm animate-pulse text-center">Loading Millionaire Quiz...</div>
        </div>
    </div>
);

export const router = createBrowserRouter([
    {
        Component: RootProvider,
        children: [
            {
                Component: FullLayout,
                children: [
                    { path: '/', element: <Suspense fallback={<PageLoader />}><LandingPage /></Suspense> },
                    { path: '/auth', element: <Suspense fallback={<PageLoader />}><AuthPage /></Suspense> },
                    {
                        element: <ProtectedRoute />,
                        children: [
                            { path: '/matchmaking', element: <Suspense fallback={<PageLoader />}><MatchmakingPage /></Suspense> },
                            { path: '/lobby', element: <Suspense fallback={<PageLoader />}><SmallRoomLobbyPage /></Suspense> },
                            { path: '/battle-lobby', element: <Suspense fallback={<PageLoader />}><PrivateBattleLobbyPage /></Suspense> },
                            { path: '/game', element: <Suspense fallback={<PageLoader />}><GamePage /></Suspense> },
                        ]
                    }
                ],
            },
            {
                Component: Layout,
                element: <ProtectedRoute />,
                children: [
                    { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
                    { path: '/mode-select', element: <Suspense fallback={<PageLoader />}><ModeSelectPage /></Suspense> },
                    { path: '/results', element: <Suspense fallback={<PageLoader />}><ResultsPage /></Suspense> },
                    { path: '/leaderboard', element: <Suspense fallback={<PageLoader />}><LeaderboardPage /></Suspense> },
                    { path: '/settings', element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
                    { path: '/admin', element: <Suspense fallback={<PageLoader />}><AdminPage /></Suspense> },
                ],
            },
            { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
        ],
    },
]);
