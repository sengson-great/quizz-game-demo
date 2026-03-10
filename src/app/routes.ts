import { createBrowserRouter } from 'react-router';
import { Layout, FullLayout } from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ModeSelectPage from './pages/ModeSelectPage';
import MatchmakingPage from './pages/MatchmakingPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    Component: FullLayout,
    children: [
      { path: '/', Component: LandingPage },
      { path: '/auth', Component: AuthPage },
      { path: '/matchmaking', Component: MatchmakingPage },
      { path: '/game', Component: GamePage },
    ],
  },
  {
    Component: Layout,
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
]);
