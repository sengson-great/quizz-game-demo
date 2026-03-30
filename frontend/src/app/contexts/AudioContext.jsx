import { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';

const AudioCtx = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// ADD YOUR OWN SONGS HERE
//
// Option A — Local file (recommended):
//   1. Copy your .mp3 / .ogg file into:  frontend/public/music/
//   2. Add it to the array below as:     '/music/your-song.mp3'
//
// Option B — Remote URL:
//   Just paste the direct .mp3 link (must be HTTPS and CORS-accessible).
//
// You can mix local and remote tracks. Order = playback order.
// ─────────────────────────────────────────────────────────────────────────────
const MUSIC_TRACKS = [
    // --- Your songs (local files from public/music/) ---
    '/music/tired.mp3',
    // '/music/background.mp3',

    // --- Fallback royalty-free tracks (remove if you have your own) ---
    'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749f5e8.mp3',
    'https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4f5a2679.mp3',
];

export function AudioProvider({ children }) {
    const { currentUser } = useAuth();
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.35);
    const trackIndexRef = useRef(0);
    const pendingPlayRef = useRef(false);

    // Initialize audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = volume;
        audio.preload = 'none';

        // Auto-play next track when current one ends
        audio.addEventListener('ended', () => {
            trackIndexRef.current = (trackIndexRef.current + 1) % MUSIC_TRACKS.length;
            audio.src = MUSIC_TRACKS[trackIndexRef.current];
            audio.play().catch(() => {});
        });

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Sync volume changes to audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // React to the user's musicEnabled preference
    useEffect(() => {
        if (!audioRef.current) return;
        const enabled = currentUser?.musicEnabled ?? true;
        if (enabled) {
            if (!isPlaying) {
                audioRef.current.src = MUSIC_TRACKS[trackIndexRef.current];
                const promise = audioRef.current.play();
                if (promise) {
                    promise
                        .then(() => setIsPlaying(true))
                        .catch(() => {
                            // Autoplay blocked — mark pending, will start on first user interaction
                            pendingPlayRef.current = true;
                        });
                }
            }
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            pendingPlayRef.current = false;
        }
    }, [currentUser?.musicEnabled]);

    // Handle browsers that block autoplay — start music on first user interaction
    useEffect(() => {
        const tryPlay = () => {
            const enabled = currentUser?.musicEnabled ?? true;
            if (pendingPlayRef.current && audioRef.current && enabled) {
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        pendingPlayRef.current = false;
                    })
                    .catch(() => {});
            }
        };
        document.addEventListener('click', tryPlay, { once: true });
        document.addEventListener('keydown', tryPlay, { once: true });
        return () => {
            document.removeEventListener('click', tryPlay);
            document.removeEventListener('keydown', tryPlay);
        };
    }, [currentUser?.musicEnabled]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const setMusicVolume = useCallback((v) => {
        setVolume(Math.max(0, Math.min(1, v)));
    }, []);

    const playTrack = useCallback((index = 0) => {
        if (!audioRef.current || !currentUser?.musicEnabled) return;
        trackIndexRef.current = index % MUSIC_TRACKS.length;
        audioRef.current.src = MUSIC_TRACKS[trackIndexRef.current];
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
    }, [currentUser?.musicEnabled]);

    return (
        <AudioCtx.Provider value={{ isPlaying, isMuted, volume, toggleMute, setMusicVolume, playTrack }}>
            {children}
        </AudioCtx.Provider>
    );
}

export function useAudio() {
    const ctx = useContext(AudioCtx);
    if (!ctx) return { isPlaying: false, isMuted: false, volume: 0.35, toggleMute: () => {}, setMusicVolume: () => {}, playTrack: () => {} };
    return ctx;
}
