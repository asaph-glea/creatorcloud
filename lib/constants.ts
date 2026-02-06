
export const LANGUAGES = [
    {
        "language": "English",
        "countryCode": "US",
        "countryFlag": "🇺🇸",
        "modelName": "essential-voice-1",
        "modelLangCode": "en-US",
        "warmMessage": "Hello! I'm ready to narrate your story."
    },
    {
        "language": "Swahili",
        "countryCode": "KE",
        "countryFlag": "🇰🇪",
        "modelName": "essential-voice-1",
        "modelLangCode": "sw",
        "warmMessage": "Habari! Niko tayari kusimulia hadithi yako."
    },
    {
        "language": "German",
        "countryCode": "DE",
        "countryFlag": "🇩🇪",
        "modelName": "essential-voice-1",
        "modelLangCode": "de-DE",
        "warmMessage": "Hallo! Ich bin bereit, deine Geschichte zu erzählen."
    },
    {
        "language": "Afrikaans",
        "countryCode": "ZA",
        "countryFlag": "🇿🇦",
        "modelName": "essential-voice-1",
        "modelLangCode": "af",
        "warmMessage": "Hallo! Ek is gereed om jou verhaal te vertel."
    },
    {
        "language": "French",
        "countryCode": "FR",
        "countryFlag": "🇫🇷",
        "modelName": "essential-voice-1",
        "modelLangCode": "fr-FR",
        "warmMessage": "Bonjour! Je suis prêt à raconter votre histoire."
    },
    {
        "language": "Portuguese",
        "countryCode": "BR",
        "countryFlag": "🇧🇷",
        "modelName": "essential-voice-1",
        "modelLangCode": "pt-BR",
        "warmMessage": "Olá! Estou pronto para narrar sua história."
    },


]

export const NOIZ_VOICES = [
    {
        "model": "noiz",
        "modelName": "Alex",
        "preview": "Alex-the-mentor.mp3",
        "gender": "male",
        "language": "en-US"
    },
    {
        "model": "noiz",
        "modelName": "Silas",
        "preview": "Silas-the-naturalist.mp3",
        "gender": "male",
        "language": "en-US"
    },
    {
        "model": "noiz",
        "modelName": "James",
        "preview": "James-the-observer.mp3",
        "gender": "male",
        "language": "en-US"
    },
    {
        "model": "noiz",
        "modelName": "Chloe",
        "preview": "Chloe-the-barista.mp3",
        "gender": "female",
        "language": "en-US"
    },
    {
        "model": "noiz",
        "modelName": "Serena",
        "preview": "Serena-the-healer.mp3",
        "gender": "female",
        "language": "en-US"
    },
    {
        "model": "noiz",
        "modelName": "Elara",
        "preview": "Elara-the-storyteller.mp3",
        "gender": "female",
        "language": "en-US"
    },
    {
        "model": "noiz",
        "modelName": "Willem",
        "preview": "afrikanas.mp3",
        "gender": "male",
        "language": "af"
    },
    {
        "model": "noiz",
        "modelName": "Pierre",
        "preview": "french.mp3",
        "gender": "male",
        "language": "fr-FR"
    },
    {
        "model": "noiz",
        "modelName": "João",
        "preview": "portugese.mp3",
        "gender": "male",
        "language": "pt-BR"
    },
    {
        "model": "noiz",
        "modelName": "Klaus",
        "preview": "german.mp3",
        "gender": "male",
        "language": "de-DE"
    },
]

export const MUSIC_TRACKS = [
    {
        id: "aurora",
        name: "Aurora",
        artist: "Aylex",
        mood: "Atmospheric",
        filename: "Aylex - Aurora.mp3"
    },
    {
        id: "technology",
        name: "Technology",
        artist: "Aylex",
        mood: "Modern",
        filename: "Aylex - Technology.mp3"
    },
    {
        id: "dragons",
        name: "There Be Dragons",
        artist: "Aylex",
        mood: "Epic",
        filename: "Aylex - There Be Dragons.mp3"
    },
    {
        id: "too-hot",
        name: "Too Hot",
        artist: "Aylex",
        mood: "Upbeat",
        filename: "Aylex - Too Hot.mp3"
    },
    {
        id: "travelling",
        name: "Travelling",
        artist: "Aylex",
        mood: "Adventure",
        filename: "Aylex - Travelling.mp3"
    },
    {
        id: "inspire",
        name: "Inspire",
        artist: "Aylex",
        mood: "Inspirational",
        filename: "Aylex - inspire.mp3"
    }
]

export const VIDEO_STYLES = [
    {
        id: "3d-render",
        name: "3D Render",
        image: "/video-style/3d-render.png"
    },
    {
        id: "anime",
        name: "Anime",
        image: "/video-style/anime.png"
    },
    {
        id: "cinematic",
        name: "Cinematic",
        image: "/video-style/cinematic.png"
    },
    {
        id: "cyberpunk",
        name: "Cyberpunk",
        image: "/video-style/cyberpunk.png"
    },
    {
        id: "gta",
        name: "GTA Style",
        image: "/video-style/gta.png"
    },
    {
        id: "realistic",
        name: "Realistic",
        image: "/video-style/realistic.png"
    }
]

export const CAPTION_STYLES = [
    {
        id: "classic",
        name: "Classic",
        description: "Timeless and clear",
        className: "font-sans font-bold text-white drop-shadow-md"
    },
    {
        id: "pop",
        name: "Pop",
        description: "Bold and colorful",
        className: "font-extrabold text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black stroke-2"
    },
    {
        id: "typewriter",
        name: "Typewriter",
        description: "Retro mechanical feel",
        className: "font-mono font-medium text-green-400 bg-black/80 p-1"
    },
    {
        id: "karaoke",
        name: "Karaoke",
        description: "Sing along style",
        className: "font-bold text-blue-300 drop-shadow-glow"
    },
    {
        id: "neon",
        name: "Neon",
        description: "Cyberpunk visuals",
        className: "font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Clean and modern",
        className: "font-light tracking-widest uppercase text-white bg-black/40 px-2"
    }
]

export const VIDEO_DURATIONS = [
    { value: "10-20", label: "10-20 seconds" },
    { value: "20-30", label: "20-30 seconds" },
    { value: "40-50", label: "40-50 seconds" }
]

export const SOCIAL_PLATFORMS = [
    { id: "youtube", name: "YouTube", icon: "Youtube" },
    { id: "tiktok", name: "TikTok", icon: "Music2" }, // Using Music2 as a placeholder for TikTok
    { id: "instagram", name: "Instagram", icon: "Instagram" },
    { id: "twitter", name: "Twitter", icon: "Twitter" },
    { id: "pinterest", name: "Pinterest", icon: "Pin" },
    { id: "email", name: "Email", icon: "Mail" }
]
