import { Language } from '../constants/translations';

export type JapaneseFont = 'gothic' | 'mincho' | 'handwriting' | 'random';

export interface KanaStat {
    correct: number;
    wrong: number;
}

export type KanaStatsMap = Record<string, KanaStat>;

export interface SavedSelection {
    hira: string[];
    kata: string[];
}

const STATS_KEY = 'sKANnA_stats';
const SELECTION_KEY = 'sKANnA_selection';
const LANGUAGE_KEY = 'sKANnA_language';
const LAST_MODE_KEY = 'sKANnA_last_mode';
const FONT_KEY = 'sKANnA_font';

export const storageService = {
    loadFont(): JapaneseFont {
        try {
            const stored = localStorage.getItem(FONT_KEY);
            if (stored === 'gothic' || stored === 'mincho' || stored === 'handwriting' || stored === 'random') {
                return stored as JapaneseFont;
            }
            return 'random';
        } catch (e) {
            console.error("Error loading font preference:", e);
            return 'random';
        }
    },

    saveFont(font: JapaneseFont): void {
        try {
            localStorage.setItem(FONT_KEY, font);
        } catch (e) {
            console.error("Error saving font preference:", e);
        }
    },

    loadLanguage(): Language {
        try {
            const stored = localStorage.getItem(LANGUAGE_KEY);
            return (stored === 'en' || stored === 'it') ? stored : 'en';
        } catch (e) {
            console.error("Error loading language:", e);
            return 'en';
        }
    },

    saveLanguage(lang: Language): void {
        try {
            localStorage.setItem(LANGUAGE_KEY, lang);
        } catch (e) {
            console.error("Error saving language:", e);
        }
    },

    loadStats(): KanaStatsMap {
        try {
            const stored = localStorage.getItem(STATS_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Error loading stats:", e);
            return {};
        }
    },

    saveStats(stats: KanaStatsMap): void {
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        } catch (e) {
            console.error("Error saving stats:", e);
        }
    },

    clearStats(): void {
        try {
            localStorage.removeItem(STATS_KEY);
        } catch (e) {
            console.error("Error clearing stats:", e);
        }
    },

    recordResult(char: string, isCorrect: boolean): KanaStatsMap {
        const stats = this.loadStats();
        if (!stats[char]) {
            stats[char] = { correct: 0, wrong: 0 };
        }
        if (isCorrect) {
            stats[char].correct++;
        } else {
            stats[char].wrong++;
        }
        this.saveStats(stats);
        return stats;
    },

    loadSelection(): SavedSelection | null {
        try {
            const stored = localStorage.getItem(SELECTION_KEY);
            if (!stored) return null;
            const parsed = JSON.parse(stored) as SavedSelection;
            if (parsed.hira) parsed.hira = parsed.hira.map(g => g === 'Vocali' ? 'Vowels' : g);
            if (parsed.kata) parsed.kata = parsed.kata.map(g => g === 'Vocali' ? 'Vowels' : g);
            return parsed;
        } catch (e) {
            console.error("Error loading selection:", e);
            return null;
        }
    },

    saveSelection(selection: SavedSelection): void {
        try {
            localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
        } catch (e) {
            console.error("Error saving selection:", e);
        }
    },

    loadLastMode(): string | null {
        try {
            return localStorage.getItem(LAST_MODE_KEY);
        } catch (e) {
            console.error("Error loading last mode:", e);
            return null;
        }
    },

    saveLastMode(mode: string): void {
        try {
            localStorage.setItem(LAST_MODE_KEY, mode);
        } catch (e) {
            console.error("Error saving last mode:", e);
        }
    }
};
