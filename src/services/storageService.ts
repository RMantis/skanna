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

export const storageService = {
    loadStats(): KanaStatsMap {
        try {
            const stored = localStorage.getItem(STATS_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Errore nel caricamento delle statistiche:", e);
            return {};
        }
    },

    saveStats(stats: KanaStatsMap): void {
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        } catch (e) {
            console.error("Errore nel salvataggio delle statistiche:", e);
        }
    },

    clearStats(): void {
        try {
            localStorage.removeItem(STATS_KEY);
        } catch (e) {
            console.error("Errore nella cancellazione delle statistiche:", e);
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
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Errore nel caricamento della selezione:", e);
            return null;
        }
    },

    saveSelection(selection: SavedSelection): void {
        try {
            localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
        } catch (e) {
            console.error("Errore nel salvataggio della selezione:", e);
        }
    }
};
