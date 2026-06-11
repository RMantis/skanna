import { useState, useCallback, useRef } from 'react';
import { kanaData, KanaItem } from '../constants/kanaData';
import { storageService } from '../services/storageService';
import { Language, translations } from '../constants/translations';

export type QuizMode = 'kana_to_romaji' | 'romaji_to_kana' | 'kana_to_romaji_phrases' | 'romaji_to_kana_phrases';

export interface QuizState {
    quizActive: boolean;
    quizMode: QuizMode;
    currentKana: KanaItem | { kana: string; romaji: string; type: 'Hiragana' | 'Katakana' } | null;
    score: number;
    mistakes: number;
    questionAnswered: boolean;
    optionSelected: boolean;
    feedback: string;
    feedbackColor: string;
    options: string[];
}

export function useQuiz(lang: Language) {
    const [state, setState] = useState<QuizState>({
        quizActive: false,
        quizMode: 'kana_to_romaji',
        currentKana: null,
        score: 0,
        mistakes: 0,
        questionAnswered: false,
        optionSelected: false,
        feedback: '',
        feedbackColor: '',
        options: []
    });

    const activePoolRef = useRef<KanaItem[]>([]);
    const currentKanaRef = useRef<any>(null);
    const historyRef = useRef<string[]>([]);

    const getCharacterWeight = useCallback((char: string) => {
        const stats = storageService.loadStats();
        const charStats = stats[char];
        if (!charStats) {
            return 10;
        }
        const correct = charStats.correct || 0;
        const wrong = charStats.wrong || 0;
        return Math.max(1, 5 + wrong * 3 - correct);
    }, []);

    const selectWeightedRandom = useCallback((pool: KanaItem[]) => {
        const weights = pool.map(item => getCharacterWeight(item.kana));
        const totalWeight = weights.reduce((acc, w) => acc + w, 0);
        
        let randomThreshold = Math.random() * totalWeight;
        for (let i = 0; i < pool.length; i++) {
            randomThreshold -= weights[i];
            if (randomThreshold <= 0) {
                return pool[i];
            }
        }
        return pool[pool.length - 1];
    }, [getCharacterWeight]);

    const generateOptions = useCallback((correctKana: string, pool: KanaItem[]) => {
        const opts = new Set<string>([correctKana]);
        const poolKanas = pool.map(item => item.kana);
        
        while (opts.size < Math.min(4, poolKanas.length)) {
            const randomKana = poolKanas[Math.floor(Math.random() * poolKanas.length)];
            opts.add(randomKana);
        }
        
        if (opts.size < 4) {
            const allKanas: string[] = [];
            Object.keys(kanaData).forEach(group => {
                kanaData[group].h.forEach(item => allKanas.push(item.split(':')[0]));
                kanaData[group].k.forEach(item => allKanas.push(item.split(':')[0]));
            });
            while (opts.size < 4) {
                const randomKana = allKanas[Math.floor(Math.random() * allKanas.length)];
                opts.add(randomKana);
            }
        }
        
        return Array.from(opts).sort(() => Math.random() - 0.5);
    }, []);

    const generatePhrase = useCallback((scriptType: 'Hiragana' | 'Katakana', selectedHira: string[], selectedKata: string[]) => {
        let pool: { kana: string; romaji: string }[] = [];
        if (scriptType === 'Hiragana') {
            selectedHira.forEach(group => {
                kanaData[group].h.forEach(item => {
                    const [kana, romaji] = item.split(':');
                    pool.push({ kana, romaji });
                });
            });
        } else {
            selectedKata.forEach(group => {
                kanaData[group].k.forEach(item => {
                    const [kana, romaji] = item.split(':');
                    pool.push({ kana, romaji });
                });
            });
        }
        
        if (pool.length === 0) return null;

        // Progressive learning logic: limit selection pool to seen characters + first 3 unseen ones
        const stats = storageService.loadStats();
        const seenPool = pool.filter(item => stats[item.kana] !== undefined);
        const unseenPool = pool.filter(item => stats[item.kana] === undefined);
        const activeUnseen = unseenPool.slice(0, 3);
        const effectivePool = [...seenPool, ...activeUnseen];
        const finalPool = effectivePool.length > 0 ? effectivePool : pool;
        
        const len = Math.floor(Math.random() * 4) + 2;
        let kanaStr = '';
        let romajiStr = '';
        for (let i = 0; i < len; i++) {
            const char = finalPool[Math.floor(Math.random() * finalPool.length)];
            kanaStr += char.kana;
            romajiStr += char.romaji;
        }
        
        return {
            kana: kanaStr,
            romaji: romajiStr,
            type: scriptType
        };
    }, []);

    const nextQuestion = useCallback((mode: QuizMode, selectedHira: string[], selectedKata: string[]) => {
        const isPhrasesMode = mode.endsWith('_phrases');
        let nextKana: any = null;
        let generatedOpts: string[] = [];

        if (isPhrasesMode) {
            const scripts: ('Hiragana' | 'Katakana')[] = [];
            if (selectedHira.length > 0) scripts.push('Hiragana');
            if (selectedKata.length > 0) scripts.push('Katakana');
            
            if (scripts.length === 0) {
                return;
            }
            const scriptType = scripts[Math.floor(Math.random() * scripts.length)];
            let phrase = generatePhrase(scriptType, selectedHira, selectedKata);
            const prevKana = currentKanaRef.current;
            if (prevKana && phrase && phrase.kana === prevKana.kana) {
                phrase = generatePhrase(scriptType, selectedHira, selectedKata) || phrase;
            }
            nextKana = phrase;
        } else {
            const pool = activePoolRef.current;
            const stats = storageService.loadStats();

            // Progressive learning logic: limit selection pool to seen characters + first 3 unseen ones
            const seenPool = pool.filter(item => stats[item.kana] !== undefined);
            const unseenPool = pool.filter(item => stats[item.kana] === undefined);
            const activeUnseen = unseenPool.slice(0, 3);
            const effectivePool = [...seenPool, ...activeUnseen];
            const basePool = effectivePool.length > 0 ? effectivePool : pool;
            
            let filteredPool = basePool;

            // History buffer: exclude recently shown kana
            const historyLength = Math.min(5, Math.floor(basePool.length / 2));
            if (historyLength > 0) {
                const poolWithoutHistory = basePool.filter(item => !historyRef.current.includes(item.kana));
                if (poolWithoutHistory.length > 0) {
                    filteredPool = poolWithoutHistory;
                }
            }

            const prevKana = currentKanaRef.current;
            if (filteredPool.length > 1 && prevKana) {
                const filteredByRomaji = filteredPool.filter(item => item.romaji !== prevKana.romaji);
                if (filteredByRomaji.length > 0) {
                    filteredPool = filteredByRomaji;
                } else {
                    filteredPool = filteredPool.filter(item => item.kana !== prevKana.kana);
                }
            }
            
            nextKana = selectWeightedRandom(filteredPool);

            // Record nextKana in history buffer
            if (nextKana) {
                historyRef.current = [...historyRef.current, nextKana.kana];
                if (historyRef.current.length > historyLength) {
                    historyRef.current = historyRef.current.slice(historyRef.current.length - historyLength);
                }
            }

            if (mode === 'romaji_to_kana' && nextKana) {
                generatedOpts = generateOptions(nextKana.kana, pool);
            }
        }

        currentKanaRef.current = nextKana;
        setState(prev => ({
            ...prev,
            currentKana: nextKana,
            optionSelected: false,
            questionAnswered: false,
            feedback: '',
            feedbackColor: '',
            options: generatedOpts
        }));
    }, [generatePhrase, selectWeightedRandom, generateOptions]);

    const startQuiz = useCallback((mode: QuizMode, selectedHira: string[], selectedKata: string[]) => {
        const pool: any[] = [];
        selectedHira.forEach(group => {
            if (kanaData[group]) {
                kanaData[group].h.forEach(item => {
                    const [kana, romaji] = item.split(':');
                    pool.push({ kana, romaji, type: 'Hiragana' });
                });
            }
        });
        selectedKata.forEach(group => {
            if (kanaData[group]) {
                kanaData[group].k.forEach(item => {
                    const [kana, romaji] = item.split(':');
                    pool.push({ kana, romaji, type: 'Katakana' });
                });
            }
        });

        if (pool.length === 0) {
            alert(translations[lang].selectGroupAlert);
            return;
        }

        activePoolRef.current = pool;
        currentKanaRef.current = null;
        historyRef.current = []; // Clear history buffer on quiz start

        setState({
            quizActive: true,
            quizMode: mode,
            currentKana: null,
            score: 0,
            mistakes: 0,
            questionAnswered: false,
            optionSelected: false,
            feedback: '',
            feedbackColor: '',
            options: []
        });

        nextQuestion(mode, selectedHira, selectedKata);
    }, [nextQuestion]);

    const stopQuiz = useCallback(() => {
        setState(prev => ({ ...prev, quizActive: false }));
    }, []);

    const checkAnswer = useCallback((userAnswer: string, selectedHira: string[], selectedKata: string[]) => {
        setState(prev => {
            if (!prev.currentKana || prev.questionAnswered) return prev;
            const cleanUser = userAnswer.trim().toLowerCase();
            if (cleanUser === '') return prev;

            const isRomajiToKanaPhrases = prev.quizMode === 'romaji_to_kana_phrases';
            const correctAnswer = isRomajiToKanaPhrases ? prev.currentKana.kana : prev.currentKana.romaji;

            if (cleanUser === correctAnswer) {
                if (!prev.quizMode.endsWith('_phrases')) {
                    storageService.recordResult(prev.currentKana.kana, true);
                }
                setTimeout(() => {
                    nextQuestion(prev.quizMode, selectedHira, selectedKata);
                }, 400);

                return {
                    ...prev,
                    questionAnswered: true,
                    feedback: translations[lang].correct,
                    feedbackColor: 'var(--success-color)',
                    score: prev.score + 1
                };
            } else {
                if (!prev.quizMode.endsWith('_phrases')) {
                    storageService.recordResult(prev.currentKana.kana, false);
                }
                return {
                    ...prev,
                    feedback: translations[lang].incorrectTryAgain,
                    feedbackColor: 'var(--error-color)',
                    mistakes: prev.mistakes + 1
                };
            }
        });
    }, [nextQuestion]);

    const selectOption = useCallback((selectedOpt: string, selectedHira: string[], selectedKata: string[]) => {
        setState(prev => {
            if (!prev.currentKana || prev.optionSelected) return prev;

            const isCorrect = selectedOpt === prev.currentKana.kana;
            storageService.recordResult(prev.currentKana.kana, isCorrect);

            if (isCorrect) {
                setTimeout(() => {
                    nextQuestion(prev.quizMode, selectedHira, selectedKata);
                }, 600);

                return {
                    ...prev,
                    optionSelected: true,
                    feedback: translations[lang].correct,
                    feedbackColor: 'var(--success-color)',
                    score: prev.score + 1
                };
            } else {
                setTimeout(() => {
                    nextQuestion(prev.quizMode, selectedHira, selectedKata);
                }, 1500);

                return {
                    ...prev,
                    optionSelected: true,
                    feedback: translations[lang].incorrectWas(prev.currentKana.kana),
                    feedbackColor: 'var(--error-color)',
                    mistakes: prev.mistakes + 1
                };
            }
        });
    }, [nextQuestion]);

    const showSolution = useCallback(() => {
        setState(prev => {
            if (!prev.currentKana) return prev;

            const isRomajiToKanaPhrases = prev.quizMode === 'romaji_to_kana_phrases';
            const solution = isRomajiToKanaPhrases ? prev.currentKana.kana : prev.currentKana.romaji;

            if (!prev.quizMode.endsWith('_phrases')) {
                storageService.recordResult(prev.currentKana.kana, false);
            }

            return {
                ...prev,
                feedback: translations[lang].solutionIs(solution),
                feedbackColor: 'var(--warning-color)',
                mistakes: prev.mistakes + 1
            };
        });
    }, []);

    return {
        ...state,
        startQuiz,
        stopQuiz,
        checkAnswer,
        selectOption,
        showSolution
    };
}
