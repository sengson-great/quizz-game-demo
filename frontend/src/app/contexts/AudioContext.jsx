import { createContext, useContext, useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';

const AudioCtx = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// SOUND EFFECTS (SFX) PRIMARY SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
// We use a high-quality synthesizer for all game sounds to ensure reliability.
// No broken external links or loading failures.
const SFX_KEYS = ['click', 'correct', 'wrong', 'lifeline', 'timeout', 'victory', 'loss'];

const MUSIC_TRACKS = [
    '/music/tired.mp3', // Working local file
];

export function AudioProvider({ children }) {
    const { currentUser } = useAuth();
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.35);
    const [sfxVolume, setSfxVolume] = useState(0.5);
    const trackIndexRef = useRef(0);
    const pendingPlayRef = useRef(false);
    const audioContextRef = useRef(null);
    const sfxVolumeRef = useRef(sfxVolume);
    const isMutedRef = useRef(isMuted);
    const soundEnabledRef = useRef(true);

    useEffect(() => { sfxVolumeRef.current = sfxVolume; }, [sfxVolume]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { soundEnabledRef.current = currentUser?.soundEnabled ?? true; }, [currentUser?.soundEnabled]);

    // Initialize audio Context for synthesized sounds
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    // ── SYNTHESIZED SOUNDS (RELIABLE & UNIQUE) ───────────────────────────────────
    const playSynthSFX = useCallback((type) => {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.gain.value = sfxVolumeRef.current;
        masterGain.connect(ctx.destination);

        const playNote = (freq, start, duration, waveType = 'sine', decay = true) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = waveType;
            osc.frequency.setValueAtTime(freq, start);
            g.gain.setValueAtTime(0.5, start);
            if (decay) g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(start);
            osc.stop(start + duration);
        };

        switch (type) {
            case 'click':
                playNote(800, now, 0.08, 'square');
                break;
            case 'correct':
                playNote(523.25, now, 0.1, 'sine'); // C5
                playNote(659.25, now + 0.1, 0.1, 'sine'); // E5
                playNote(783.99, now + 0.2, 0.3, 'sine'); // G5
                break;
            case 'wrong':
                playNote(220, now, 0.1, 'sawtooth'); // A3
                playNote(110, now + 0.1, 0.4, 'sawtooth'); // A2
                break;
            case 'lifeline':
                for (let i = 0; i < 5; i++) {
                    playNote(1000 + i * 200, now + i * 0.05, 0.1, 'sine');
                }
                break;
            case 'timeout':
                playNote(440, now, 0.1, 'triangle');
                playNote(440, now + 0.2, 0.1, 'triangle');
                break;
            case 'victory':
                [523, 659, 783, 1046].forEach((f, i) => playNote(f, now + i * 0.15, 0.5, 'sine', false));
                break;
            case 'loss':
                playNote(220, now, 0.3, 'sawtooth');
                playNote(190, now + 0.3, 0.5, 'sawtooth');
                break;
            default:
                break;
        }
    }, [getAudioContext]);

    useEffect(() => {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = volume;
        audio.preload = 'auto';
        audio.addEventListener('ended', () => {
            trackIndexRef.current = (trackIndexRef.current + 1) % MUSIC_TRACKS.length;
            audio.src = MUSIC_TRACKS[trackIndexRef.current];
            audio.play().catch(() => {});
        });
        audioRef.current = audio;
        return () => { audio.pause(); audio.src = ''; };
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    useEffect(() => {
        if (!audioRef.current) return;
        const enabled = currentUser?.musicEnabled ?? true;
        if (enabled) {
            if (!isPlaying) {
                audioRef.current.src = MUSIC_TRACKS[trackIndexRef.current];
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => { pendingPlayRef.current = true; });
            }
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
            pendingPlayRef.current = false;
        }
    }, [currentUser?.musicEnabled]);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Priority 1: Ensure Synth Context is resumed (for SFX)
            const ctx = getAudioContext();
            if (ctx && ctx.state === 'suspended') ctx.resume();

            // Priority 2: Resume background music if it was blocked by autoplay
            const musicEnabled = currentUser?.musicEnabled ?? true;
            if (pendingPlayRef.current && audioRef.current && musicEnabled) {
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        pendingPlayRef.current = false;
                    })
                    .catch(() => {});
            }

            // Priority 3: Check sound effect permissions
            if (!soundEnabledRef.current || isMutedRef.current) return;

            // Priority 4: Find if click target is interactive
            const target = e.target;
            if (!target) return;
            const interactive = target.closest('button, a, select, input, [role="button"], label, .clickable, .btn');
            
            if (!interactive || interactive.disabled) return;

            const tag = interactive.tagName;
            const type = interactive.type;
            const validInputs = ['button', 'submit', 'radio', 'checkbox'];
            
            if (tag === 'INPUT' && !validInputs.includes(type)) return;

            playSynthSFX('click');
        };

        // Use capture phase to ensure we catch clicks even if propagation is stopped
        document.addEventListener('click', handleGlobalClick, true);
        return () => document.removeEventListener('click', handleGlobalClick, true);
    }, [getAudioContext, playSynthSFX, currentUser?.musicEnabled]);

    const playSFX = useCallback((type) => {
        const soundEnabled = currentUser?.soundEnabled ?? true;
        if (!soundEnabled || isMuted) return;
        playSynthSFX(type);
    }, [currentUser?.soundEnabled, isMuted, playSynthSFX]);

    const contextValue = useMemo(() => ({
        isPlaying, isMuted, volume, sfxVolume, 
        toggleMute: () => setIsMuted(prev => !prev), 
        setMusicVolume: (v) => setVolume(Math.max(0, Math.min(1, v))),
        setSfxVolume: (v) => setSfxVolume(Math.max(0, Math.min(1, v))),
        playTrack: (index) => {
            if (!audioRef.current || !currentUser?.musicEnabled) return;
            trackIndexRef.current = index % MUSIC_TRACKS.length;
            audioRef.current.src = MUSIC_TRACKS[trackIndexRef.current];
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        },
        playSFX
    }), [isPlaying, isMuted, volume, sfxVolume, playSFX, currentUser?.musicEnabled]);

    return (<AudioCtx.Provider value={contextValue}>{children}</AudioCtx.Provider>);
}

export function useAudio() {
    const ctx = useContext(AudioCtx);
    if (!ctx) return { isPlaying: false, isMuted: false, volume: 0.35, sfxVolume: 0.5, toggleMute: () => {}, setMusicVolume: () => {}, setSfxVolume: () => {}, playTrack: () => {}, playSFX: () => {} };
    return ctx;
}
