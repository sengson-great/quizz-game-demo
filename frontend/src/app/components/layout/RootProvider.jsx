import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { GameProvider } from '../../contexts/GameContext';
import { AudioProvider } from '../../contexts/AudioContext';
export function RootProvider() {
    return (<AuthProvider>
      <AudioProvider>
        <GameProvider>
          <Outlet />
        </GameProvider>
      </AudioProvider>
    </AuthProvider>);
}
