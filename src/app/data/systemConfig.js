export const DEFAULT_SYSTEM_CONFIG = {
    timerDuration: 30,
    easyCount: 5,
    mediumCount: 5,
    hardCount: 5,
    lobbyTimeout: 60,
    minRoomPlayers: 3,
    maxRoomPlayers: 5,
    enableFiftyFifty: true,
    enableSkip: true,
    enableAudience: true,
    enablePhone: true,
    enableDoubleDip: true,
    updated_at: null,
};
const SYSTEM_CONFIG_STORAGE_KEY = 'quiz_admin_system_config';
export function loadSystemConfig() {
    try {
        const stored = localStorage.getItem(SYSTEM_CONFIG_STORAGE_KEY);
        if (stored)
            return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(stored) };
    }
    catch { }
    return DEFAULT_SYSTEM_CONFIG;
}
