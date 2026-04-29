import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { motion } from 'motion/react';
import { RootProvider } from './components/layout/RootProvider';
import { Layout, FullLayout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Trophy } from 'lucide-react';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
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

// A premium loading component for suspense fallback
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[80px]" />
        
        <div className="relative flex flex-col items-center">
            {/* Logo/Icon Container */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-[2rem] glass-card flex items-center justify-center shadow-2xl border-white/40 relative z-10"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 blur-xl animate-pulse" />
                <div className="relative z-20 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-[#FACC15] drop-shadow-md" />
                </div>
            </motion.div>
            
            {/* Spinner */}
            <div className="absolute top-[34px] w-28 h-28 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin transition-all duration-1000" />
            
            {/* Text */}
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-12 flex flex-col items-center gap-2"
            >
                <span className="text-[#0F172A] font-bold text-lg tracking-tight" style={{ fontFamily: 'inherit' }}>
                    Millionaire Quiz
                </span>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"
                        />
                    ))}
                </div>
            </motion.div>
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
                    { path: '/forgot-password', element: <Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense> },
                    { path: '/password-reset', element: <Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense> },
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
                element: <ProtectedRoute />,
                children: [
                    {
                        Component: Layout,
                        children: [
                            { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
                            { path: '/mode-select', element: <Suspense fallback={<PageLoader />}><ModeSelectPage /></Suspense> },
                            { path: '/results', element: <Suspense fallback={<PageLoader />}><ResultsPage /></Suspense> },
                            { path: '/leaderboard', element: <Suspense fallback={<PageLoader />}><LeaderboardPage /></Suspense> },
                            { path: '/settings', element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
                            { path: '/admin', element: <Suspense fallback={<PageLoader />}><AdminPage /></Suspense> },
                        ]
                    }
                ]
            },
            { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
        ],
    },
]);
