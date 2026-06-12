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
    unlockProgress: number;
    rollingAccuracy: number;
    newlyUnlockedKana: string | null;
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
        options: [],
        unlockProgress: storageService.loadUnlockProgress(),
        rollingAccuracy: 1.0,
        newlyUnlockedKana: null
    });

    const activePoolRef = useRef<KanaItem[]>([]);
    const currentKanaRef = useRef<any>(null);
    const historyRef = useRef<string[]>([]);
    const completeSelectedPoolRef = useRef<KanaItem[]>([]);
    const rollingAnswersRef = useRef<boolean[]>([]);

    const getCharacterWeight = useCallback((char: string) => {
        const stats = storageService.loadStats();
        const charStats = stats[char];
        let baseWeight = 1.0; // Lower weight for new/unseen characters to introduce them slowly

        if (charStats) {
            const correct = charStats.correct || 0;
            const wrong = charStats.wrong || 0;
            // Base weight for seen characters is 4.0.
            // Mistakes increase the weight significantly (+4.5 per wrong answer) to prioritize practicing them.
            // Correct answers reduce the weight (-0.8 per correct answer) down to a minimum of 0.2.
            baseWeight = Math.max(0.2, 4.0 + wrong * 4.5 - correct * 0.8);
        }

        // Apply a penalty if the character has been shown recently.
        // The more recently it was shown, the more it is penalized.
        const historyIndex = historyRef.current.indexOf(char);
        if (historyIndex !== -1) {
            // historyRef.current has oldest at index 0, newest at the end.
            const distance = historyRef.current.length - 1 - historyIndex;
            // Scale multiplier from 0.0 (most recent) up to 1.0 (distance >= 8)
            const multiplier = distance === 0 ? 0.0 : Math.min(1.0, 0.15 + (distance - 1) * 0.12);
            baseWeight *= multiplier;
        }

        return baseWeight;
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

    const nextQuestion = useCallback((mode: QuizMode, selectedHira: string[], selectedKata: string[], forceKana?: any) => {
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
            
            if (forceKana) {
                nextKana = forceKana;
            } else {
                const stats = storageService.loadStats();

                // Progressive learning logic: limit selection pool to seen characters + first 3 unseen ones
                const seenPool = pool.filter(item => stats[item.kana] !== undefined);
                const unseenPool = pool.filter(item => stats[item.kana] === undefined);
                const activeUnseen = unseenPool.slice(0, 3);
                const effectivePool = [...seenPool, ...activeUnseen];
                const basePool = effectivePool.length > 0 ? effectivePool : pool;
                
                let filteredPool = basePool;

                // History buffer: strictly exclude only the most recent characters to prevent immediate repetition
                const strictHistoryLength = Math.min(3, Math.floor(basePool.length / 3));
                if (strictHistoryLength > 0) {
                    const recentHistory = historyRef.current.slice(-strictHistoryLength);
                    const poolWithoutHistory = basePool.filter(item => !recentHistory.includes(item.kana));
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
            }

            // Record nextKana in history buffer (up to 15 characters, or half the active pool size)
            if (nextKana) {
                historyRef.current = [...historyRef.current, nextKana.kana];
                const maxHistory = Math.min(15, Math.floor(pool.length * 0.5));
                if (historyRef.current.length > maxHistory) {
                    historyRef.current = historyRef.current.slice(historyRef.current.length - maxHistory);
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
            options: generatedOpts,
            newlyUnlockedKana: null, // Clear newly unlocked alert on transition
            unlockProgress: storageService.loadUnlockProgress(),
            rollingAccuracy: rollingAnswersRef.current.length > 0
                ? (rollingAnswersRef.current.filter(Boolean).length / rollingAnswersRef.current.length)
                : 1.0
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

        // Initialize progressive unlock system
        const stats = storageService.loadStats();
        let unlockedChars = pool.filter(item => {
            const stat = stats[item.kana];
            return stat?.unlocked === true || (stat && (stat.correct > 0 || stat.wrong > 0));
        });

        // Ensure at least min(3, pool.length) characters are unlocked
        if (unlockedChars.length < Math.min(3, pool.length)) {
            const firstThree = pool.slice(0, Math.min(3, pool.length));
            firstThree.forEach(item => {
                if (!stats[item.kana]) {
                    stats[item.kana] = { correct: 0, wrong: 0 };
                }
                stats[item.kana].unlocked = true;
            });
            storageService.saveStats(stats);
            // Re-filter
            unlockedChars = pool.filter(item => {
                const stat = stats[item.kana];
                return stat?.unlocked === true || (stat && (stat.correct > 0 || stat.wrong > 0));
            });
        }

        completeSelectedPoolRef.current = pool;
        activePoolRef.current = unlockedChars;
        currentKanaRef.current = null;
        historyRef.current = []; // Clear history buffer on quiz start
        rollingAnswersRef.current = []; // Clear rolling accuracy on start

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
            options: [],
            unlockProgress: storageService.loadUnlockProgress(),
            rollingAccuracy: 1.0,
            newlyUnlockedKana: null
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
            const isCorrect = cleanUser === correctAnswer;

            // Update rolling answers
            rollingAnswersRef.current = [...rollingAnswersRef.current, isCorrect];
            if (rollingAnswersRef.current.length > 10) {
                rollingAnswersRef.current = rollingAnswersRef.current.slice(1);
            }

            const rolling = rollingAnswersRef.current;
            const correctCount = rolling.filter(Boolean).length;
            const rollingAcc = rolling.length > 0 ? (correctCount / rolling.length) : 1.0;

            let nextProgress = prev.unlockProgress;
            let newlyUnlocked: string | null = null;
            let unlockedItemToForce: any = null;

            if (isCorrect) {
                if (!prev.quizMode.endsWith('_phrases')) {
                    storageService.recordResult(prev.currentKana.kana, true);
                    
                    if (rollingAcc >= 0.8) {
                        nextProgress = Math.min(100, nextProgress + 10);
                    }

                    if (nextProgress >= 100) {
                        const stats = storageService.loadStats();
                        const nextLockedItem = completeSelectedPoolRef.current.find(item => {
                            const stat = stats[item.kana];
                            return !stat || !stat.unlocked;
                        });

                        if (nextLockedItem) {
                            if (!stats[nextLockedItem.kana]) {
                                stats[nextLockedItem.kana] = { correct: 0, wrong: 0 };
                            }
                            stats[nextLockedItem.kana].unlocked = true;
                            storageService.saveStats(stats);

                            activePoolRef.current = [...activePoolRef.current, nextLockedItem];
                            newlyUnlocked = nextLockedItem.kana;
                            unlockedItemToForce = nextLockedItem;
                            
                            // Save 0 to storage immediately, but keep nextProgress at 100 in state for animation
                            storageService.saveUnlockProgress(0);
                            
                            // Schedule resetting progress in state to 0 after 700ms
                            setTimeout(() => {
                                setState(current => ({
                                    ...current,
                                    unlockProgress: 0
                                }));
                            }, 700);
                        } else {
                            storageService.saveUnlockProgress(nextProgress);
                        }
                    } else {
                        storageService.saveUnlockProgress(nextProgress);
                    }
                }

                // If a character was unlocked, delay the next question transition to 1100ms
                const nextQuestionDelay = newlyUnlocked ? 1100 : 400;
                setTimeout(() => {
                    nextQuestion(prev.quizMode, selectedHira, selectedKata, unlockedItemToForce);
                }, nextQuestionDelay);

                return {
                    ...prev,
                    questionAnswered: true,
                    feedback: translations[lang].correct,
                    feedbackColor: 'var(--success-color)',
                    score: prev.score + 1,
                    unlockProgress: nextProgress,
                    rollingAccuracy: rollingAcc,
                    newlyUnlockedKana: newlyUnlocked
                };
            } else {
                if (!prev.quizMode.endsWith('_phrases')) {
                    storageService.recordResult(prev.currentKana.kana, false);

                    const confusedItem = activePoolRef.current.find(
                        item => item.romaji === cleanUser || item.kana === cleanUser
                    );
                    if (confusedItem) {
                        storageService.recordResult(confusedItem.kana, false);
                    }

                    nextProgress = Math.max(0, nextProgress - 10);
                    storageService.saveUnlockProgress(nextProgress);
                }
                return {
                    ...prev,
                    feedback: translations[lang].incorrectTryAgain,
                    feedbackColor: 'var(--error-color)',
                    mistakes: prev.mistakes + 1,
                    unlockProgress: nextProgress,
                    rollingAccuracy: rollingAcc,
                    newlyUnlockedKana: null
                };
            }
        });
    }, [nextQuestion]);

    const selectOption = useCallback((selectedOpt: string, selectedHira: string[], selectedKata: string[]) => {
        setState(prev => {
            if (!prev.currentKana || prev.optionSelected) return prev;

            const isCorrect = selectedOpt === prev.currentKana.kana;
            storageService.recordResult(prev.currentKana.kana, isCorrect);

            // Update rolling answers
            rollingAnswersRef.current = [...rollingAnswersRef.current, isCorrect];
            if (rollingAnswersRef.current.length > 10) {
                rollingAnswersRef.current = rollingAnswersRef.current.slice(1);
            }

            const rolling = rollingAnswersRef.current;
            const correctCount = rolling.filter(Boolean).length;
            const rollingAcc = rolling.length > 0 ? (correctCount / rolling.length) : 1.0;

            let nextProgress = prev.unlockProgress;
            let newlyUnlocked: string | null = null;
            let unlockedItemToForce: any = null;

            if (isCorrect) {
                if (rollingAcc >= 0.8) {
                    nextProgress = Math.min(100, nextProgress + 10);
                }

                if (nextProgress >= 100) {
                    const stats = storageService.loadStats();
                    const nextLockedItem = completeSelectedPoolRef.current.find(item => {
                        const stat = stats[item.kana];
                        return !stat || !stat.unlocked;
                    });

                    if (nextLockedItem) {
                        if (!stats[nextLockedItem.kana]) {
                            stats[nextLockedItem.kana] = { correct: 0, wrong: 0 };
                        }
                        stats[nextLockedItem.kana].unlocked = true;
                        storageService.saveStats(stats);

                        activePoolRef.current = [...activePoolRef.current, nextLockedItem];
                        newlyUnlocked = nextLockedItem.kana;
                        unlockedItemToForce = nextLockedItem;
                        
                        // Save 0 to storage immediately, but keep nextProgress at 100 in state for animation
                        storageService.saveUnlockProgress(0);
                        
                        // Schedule resetting progress in state to 0 after 700ms
                        setTimeout(() => {
                            setState(current => ({
                                ...current,
                                unlockProgress: 0
                            }));
                        }, 700);
                    } else {
                        storageService.saveUnlockProgress(nextProgress);
                    }
                } else {
                    storageService.saveUnlockProgress(nextProgress);
                }

                // If a character was unlocked, delay the next question transition to 1100ms
                const nextQuestionDelay = newlyUnlocked ? 1100 : 600;
                setTimeout(() => {
                    nextQuestion(prev.quizMode, selectedHira, selectedKata, unlockedItemToForce);
                }, nextQuestionDelay);

                return {
                    ...prev,
                    optionSelected: true,
                    feedback: translations[lang].correct,
                    feedbackColor: 'var(--success-color)',
                    score: prev.score + 1,
                    unlockProgress: nextProgress,
                    rollingAccuracy: rollingAcc,
                    newlyUnlockedKana: newlyUnlocked
                };
            } else {
                // Penalize the confused character (the wrong option that was clicked)
                storageService.recordResult(selectedOpt, false);

                nextProgress = Math.max(0, nextProgress - 10);
                storageService.saveUnlockProgress(nextProgress);

                setTimeout(() => {
                    nextQuestion(prev.quizMode, selectedHira, selectedKata);
                }, 1500);

                return {
                    ...prev,
                    optionSelected: true,
                    feedback: translations[lang].incorrectWas(prev.currentKana.kana),
                    feedbackColor: 'var(--error-color)',
                    mistakes: prev.mistakes + 1,
                    unlockProgress: nextProgress,
                    rollingAccuracy: rollingAcc,
                    newlyUnlockedKana: null
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
