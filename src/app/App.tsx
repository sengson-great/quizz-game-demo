import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <RouterProvider router={router} />
      </GameProvider>
    </AuthProvider>
  );
}