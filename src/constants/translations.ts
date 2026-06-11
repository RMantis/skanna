export type Language = 'en' | 'it';

export interface TranslationDictionary {
    title: string;
    chooseKana: string;
    group: string;
    vowels: string;
    selectedSummary: (total: number, hira: number, kata: number) => string;
    resetStats: string;
    resetConfirm: string;
    resetSuccess: string;
    selectGroupAlert: string;
    singleKanaRomaji: string;
    singleRomajiKana: string;
    phrasesKanaRomaji: string;
    phrasesRomajiKana: string;
    changeFilters: string;
    newKanaRomaji: (romaji: string) => string;
    newKanaAnswer: (kana: string) => string;
    verify: string;
    dontRemember: string;
    correct: string;
    incorrectTryAgain: string;
    incorrectWas: (correct: string) => string;
    solutionIs: (solution: string) => string;
    scoreBoard: (score: number, mistakes: number) => string;
    selectedQuizSummary: (total: number, hira: number, kata: number) => string;
}

export const translations: Record<Language, TranslationDictionary> = {
    en: {
        title: "sKANnA",
        chooseKana: "Choose Kana for the Quiz",
        group: "Group",
        vowels: "Vowels",
        selectedSummary: (total, hira, kata) => `Selected: ${total} characters (${hira} Hiragana, ${kata} Katakana)`,
        resetStats: "Reset Statistics",
        resetConfirm: "Are you sure you want to reset all learning statistics? All progress will be lost.",
        resetSuccess: "Statistics reset successfully!",
        selectGroupAlert: "Select at least one group to start!",
        singleKanaRomaji: "Single: Kana → Romaji",
        singleRomajiKana: "Single: Romaji → Kana",
        phrasesKanaRomaji: "Phrases: Kana → Romaji",
        phrasesRomajiKana: "Phrases: Romaji → Kana",
        changeFilters: "← Change Filters",
        newKanaRomaji: (romaji) => `💡 New kana! Romaji: ${romaji}`,
        newKanaAnswer: (kana) => `💡 New kana! Answer: ${kana}`,
        verify: "Verify",
        dontRemember: "Don't remember",
        correct: "Correct!",
        incorrectTryAgain: "Incorrect. Try again!",
        incorrectWas: (correct) => `Incorrect! It was: ${correct}`,
        solutionIs: (solution) => `The solution is: ${solution}`,
        scoreBoard: (score, mistakes) => `Score: ${score} | Mistakes: ${mistakes}`,
        selectedQuizSummary: (total, hira, kata) => `Selected: ${total} characters (${hira} Hiragana, ${kata} Katakana)`
    },
    it: {
        title: "sKANnA",
        chooseKana: "Scegli i Kana per il Quiz",
        group: "Gruppo",
        vowels: "Vocali",
        selectedSummary: (total, hira, kata) => `Selezionati: ${total} caratteri (${hira} Hiragana, ${kata} Katakana)`,
        resetStats: "Resetta Statistiche",
        resetConfirm: "Sei sicuro di voler resettare tutte le statistiche di studio? I progressi andranno persi.",
        resetSuccess: "Statistiche resettate con successo!",
        selectGroupAlert: "Seleziona almeno un gruppo per iniziare!",
        singleKanaRomaji: "Singoli: Kana → Romaji",
        singleRomajiKana: "Singoli: Romaji → Kana",
        phrasesKanaRomaji: "Frasi: Kana → Romaji",
        phrasesRomajiKana: "Frasi: Romaji → Kana",
        changeFilters: "← Cambia Filtri",
        newKanaRomaji: (romaji) => `💡 Nuovo kana! Romaji: ${romaji}`,
        newKanaAnswer: (kana) => `💡 Nuovo kana! Risposta: ${kana}`,
        verify: "Verifica",
        dontRemember: "Non ricordo",
        correct: "Corretto!",
        incorrectTryAgain: "Sbagliato. Riprova!",
        incorrectWas: (correct) => `Sbagliato! Era: ${correct}`,
        solutionIs: (solution) => `La soluzione è: ${solution}`,
        scoreBoard: (score, mistakes) => `Punteggio: ${score} | Errori: ${mistakes}`,
        selectedQuizSummary: (total, hira, kata) => `Selezionati: ${total} caratteri (${hira} Hiragana, ${kata} Katakana)`
    }
};
