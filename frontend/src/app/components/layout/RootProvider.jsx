import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { GameProvider } from '../../contexts/GameContext';
import { AudioProvider } from '../../contexts/AudioContext';
import { PWAProvider } from '../../contexts/PWAContext';
export function RootProvider() {
    return (<AuthProvider>
      <AudioProvider>
        <GameProvider>
          <PWAProvider>
            <Outlet />
          </PWAProvider>
        </GameProvider>
      </AudioProvider>
    </AuthProvider>);
}
