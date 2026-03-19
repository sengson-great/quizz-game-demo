import { Outlet } from 'react-router';
import { AuthProvider } from '../../contexts/AuthContext';
import { GameProvider } from '../../contexts/GameContext';
export function RootProvider() {
    return (<AuthProvider>
      <GameProvider>
        <Outlet />
      </GameProvider>
    </AuthProvider>);
}
