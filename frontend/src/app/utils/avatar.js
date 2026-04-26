export const AVATAR_EMOJIS = [
    '🦊', '🐯', '🦁', '🐻', '🦅', 
    '🐺', '🦋', '🐬', '🦄', '🐲', 
    '🐼', '🦩', '🐙', '🎩', '🤖',
    '🦊', '🦉', '🐆', '🐸', '🐢'
];

export function getFixedAvatar(identifier, customAvatar = null) {
    if (customAvatar) return customAvatar;
    if (!identifier) return '👤';
    
    let hash = 0;
    if (typeof identifier === 'number') {
        hash = identifier;
    } else {
        const str = String(identifier);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    
    // Ensure positive index
    const index = Math.abs(hash) % AVATAR_EMOJIS.length;
    return AVATAR_EMOJIS[index];
}
