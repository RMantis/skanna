export type Language = 'en' | 'it';

export interface TranslationDictionary {
    title: string;
    projectDesc: string;
    chooseKana: string;
    chooseQuizMode: string;
    lastModeUsed: string;
    group: string;
    vowels: string;
    selectedSummary: (total: number) => string;
    resetStats: string;
    resetConfirm: string;
    resetSuccess: string;
    selectGroupAlert: string;
    single: string;
    phrases: string;
    kanaToRomaji: string;
    romajiToKana: string;
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
    switchToLight: string;
    switchToDark: string;
    changeLanguage: string;
    fontSelection: string;
    fontGothic: string;
    fontMincho: string;
    fontHandwriting: string;
    fontRandom: string;
}

export const translations: Record<Language, TranslationDictionary> = {
    en: {
        title: "sKANnA",
        projectDesc: "Welcome to sKANnA! Your fun, interactive shortcut to mastering Hiragana and Katakana. Pick your character pack, select your game mode, and level up your Japanese skills—no boring textbooks required! 🚀",
        chooseKana: "Choose Kana",
        chooseQuizMode: "Choose Quiz Mode",
        lastModeUsed: "Last Mode Used",
        group: "Group",
        vowels: "Vowels",
        selectedSummary: (total) => `Selected: ${total} characters`,
        resetStats: "Reset Statistics",
        resetConfirm: "Are you sure you want to reset all learning statistics? All progress will be lost.",
        resetSuccess: "Statistics reset successfully!",
        selectGroupAlert: "Select at least one group to start!",
        single: "Single",
        phrases: "Phrases",
        kanaToRomaji: "Kana → Romaji",
        romajiToKana: "Romaji → Kana",
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
        selectedQuizSummary: (total, hira, kata) => `Selected: ${total} characters (${hira} Hiragana, ${kata} Katakana)`,
        switchToLight: "Switch to Light Theme",
        switchToDark: "Switch to Dark Theme",
        changeLanguage: "Change Language",
        fontSelection: "Japanese Font",
        fontGothic: "Gothic (Typed)",
        fontMincho: "Mincho (Printed)",
        fontHandwriting: "Handwriting (Recommended)",
        fontRandom: "Random (Mix)"
    },
    it: {
        title: "sKANnA",
        projectDesc: "Benvenuto su sKANnA! La tua scorciatoia interattiva (e divertente) per 'sKANnAre' e padroneggiare l'Hiragana e il Katakana. Scegli il tuo pacchetto, seleziona la modalità di gioco e allena la tua mente—niente noiosi libri di testo, promesso! 🚀",
        chooseKana: "Scegli i Kana",
        chooseQuizMode: "Scegli la Modalità del Quiz",
        lastModeUsed: "Ultima modalità usata",
        group: "Gruppo",
        vowels: "Vocali",
        selectedSummary: (total) => `Selezionati: ${total} caratteri`,
        resetStats: "Resetta Statistiche",
        resetConfirm: "Sei sicuro di voler resettare tutte le statistiche di studio? I progressi andranno persi.",
        resetSuccess: "Statistiche resettate con successo!",
        selectGroupAlert: "Seleziona almeno un gruppo per iniziare!",
        single: "Singoli",
        phrases: "Frasi",
        kanaToRomaji: "Kana → Romaji",
        romajiToKana: "Romaji → Kana",
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
        selectedQuizSummary: (total, hira, kata) => `Selezionati: ${total} caratteri (${hira} Hiragana, ${kata} Katakana)`,
        switchToLight: "Attiva Tema Chiaro",
        switchToDark: "Attiva Tema Scuro",
        changeLanguage: "Cambia Lingua",
        fontSelection: "Font Giapponese",
        fontGothic: "Gothic (Tipizzato)",
        fontMincho: "Mincho (Serif)",
        fontHandwriting: "Scritto a mano (Consigliato)",
        fontRandom: "Casuale (Misto)"
    }
};
