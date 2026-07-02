import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizState } from '../hooks/useQuiz';
import { imeService } from '../services/imeService';
import { storageService, JapaneseFont } from '../services/storageService';
import { kanaData } from '../constants/kanaData';
import { Language, TranslationDictionary } from '../constants/translations';

interface QuizScreenProps {
    t: TranslationDictionary;
    lang: Language;
    quizState: QuizState;
    selectedHira: string[];
    selectedKata: string[];
    japaneseFont: JapaneseFont;
    onStopQuiz: () => void;
    onCheckAnswer: (answer: string, hira: string[], kata: string[]) => void;
    onSelectOption: (option: string, hira: string[], kata: string[]) => void;
    onShowSolution: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
    t,
    lang,
    quizState,
    selectedHira,
    selectedKata,
    japaneseFont,
    onStopQuiz,
    onCheckAnswer,
    onSelectOption,
    onShowSolution
}) => {
    const {
        quizMode,
        currentKana,
        score,
        mistakes,
        optionSelected,
        feedback,
        feedbackColor,
        options,
        unlockProgress,
        rollingAccuracy,
        newlyUnlockedKana
    } = quizState;

    interface ConfettiParticle {
        id: number;
        color: string;
        style: React.CSSProperties;
    }

    const [inputValue, setInputValue] = useState('');
    const [clickedOption, setClickedOption] = useState<string | null>(null);
    const [currentActiveFont, setCurrentActiveFont] = useState<'gothic' | 'mincho' | 'handwriting'>('gothic');
    const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (newlyUnlockedKana) {
            const colors = ['#89b4fa', '#f5c2e7', '#a6e3a1', '#f9e2af', '#f38ba8', '#cba6f7', '#ff007f', '#00ffff'];
            const newConfetti: ConfettiParticle[] = [];

            for (let i = 0; i < 40; i++) {
                const id = Math.random();
                const color = colors[Math.floor(Math.random() * colors.length)];
                const border = Math.floor(Math.random() * 4);
                let startX = 0;
                let startY = 0;
                let angle = 0;

                if (border === 0) { // Top
                    startX = Math.random() * 100;
                    startY = 0;
                    angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
                } else if (border === 1) { // Right
                    startX = 100;
                    startY = Math.random() * 100;
                    angle = (Math.random() - 0.5) * 1.2;
                } else if (border === 2) { // Bottom
                    startX = Math.random() * 100;
                    startY = 100;
                    angle = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
                } else { // Left
                    startX = 0;
                    startY = Math.random() * 100;
                    angle = Math.PI + (Math.random() - 0.5) * 1.2;
                }

                const speed = 60 + Math.random() * 120;
                const tx = Math.cos(angle) * speed;
                const ty = Math.sin(angle) * speed;
                const size = 5 + Math.random() * 7;
                const rotation = Math.random() * 360;
                const duration = 0.6 + Math.random() * 0.8;

                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${startX}%`,
                    top: `${startY}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    pointerEvents: 'none',
                    zIndex: 20,
                    animation: `confetti-shoot ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
                    // @ts-ignore
                    '--tx': `${tx}px`,
                    // @ts-ignore
                    '--ty': `${ty}px`,
                    // @ts-ignore
                    '--rot': `${rotation + (Math.random() > 0.5 ? 360 : -360)}deg`,
                };

                newConfetti.push({ id, color, style });
            }

            setConfetti(newConfetti);

            const timer = setTimeout(() => {
                setConfetti([]);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [newlyUnlockedKana]);

    useEffect(() => {
        if (japaneseFont === 'random') {
            const fonts: ('gothic' | 'mincho' | 'handwriting')[] = ['gothic', 'mincho', 'handwriting'];
            const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
            setCurrentActiveFont(randomFont);
        } else {
            setCurrentActiveFont(japaneseFont);
        }
    }, [currentKana, japaneseFont]);

    useEffect(() => {
        if (quizMode !== 'romaji_to_kana') {
            setInputValue('');
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [currentKana, quizMode]);

    useEffect(() => {
        setClickedOption(null);
    }, [currentKana]);

    const activeKeyboardKeysByGroup = useMemo(() => {
        if (!currentKana) return [];
        const isHira = currentKana.type === 'Hiragana';
        const selectedGroups = isHira ? selectedHira : selectedKata;

        const rows: { groupName: string; keys: string[] }[] = [];

        Object.keys(kanaData).forEach(groupName => {
            if (selectedGroups.includes(groupName)) {
                const list = isHira ? kanaData[groupName].h : kanaData[groupName].k;
                const keys = list.map(item => item.split(':')[0]);
                if (keys.length > 0) {
                    rows.push({ groupName, keys });
                }
            }
        });

        return rows;
    }, [currentKana, selectedHira, selectedKata]);

    const handleKeyClick = (char: string) => {
        setInputValue(prev => prev + char);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleBackspace = () => {
        setInputValue(prev => prev.slice(0, -1));
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleClear = () => {
        setInputValue('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (quizMode === 'romaji_to_kana_words' && currentKana) {
            const converted = imeService.convertRomajiToKana(val, currentKana.type);
            setInputValue(converted);
        } else {
            setInputValue(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const isWordsMode = quizMode.endsWith('_words');
        if (e.key === 'Enter' || (e.key === ' ' && !isWordsMode)) {
            e.preventDefault();
            onCheckAnswer(inputValue, selectedHira, selectedKata);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onShowSolution();
        }
    };

    const handleOptionClick = (opt: string) => {
        setClickedOption(opt);
        onSelectOption(opt, selectedHira, selectedKata);
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (quizMode === 'romaji_to_kana') {
                if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
                    const idx = parseInt(e.key) - 1;
                    if (options[idx] && !optionSelected) {
                        handleOptionClick(options[idx]);
                    }
                }
            } else {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onShowSolution();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [quizMode, options, optionSelected, selectedHira, selectedKata, onSelectOption, onShowSolution]);

    if (!currentKana) return null;

    const isNew = quizState.isProgressiveMode && !quizMode.endsWith('_words') && (() => {
        const stats = storageService.loadStats();
        const stat = stats[currentKana.kana];
        return !stat || ((stat.correct || 0) === 0 && (stat.wrong || 0) === 0);
    })();

    const hint = isNew ? (
        quizMode === 'kana_to_romaji'
            ? t.newKanaRomaji(currentKana.romaji)
            : t.newKanaAnswer(currentKana.kana)
    ) : '';

    const getFontClass = (f: 'gothic' | 'mincho' | 'handwriting') => {
        if (f === 'gothic') return 'font-gothic';
        if (f === 'mincho') return 'font-mincho';
        return 'font-handwriting';
    };
    const fontClass = getFontClass(currentActiveFont);

    const getPosLabel = (pos: string) => {
        switch (pos) {
            case 'noun': return t.posNoun;
            case 'adjective': return t.posAdjective;
            case 'verb': return t.posVerb;
            case 'pronoun': return t.posPronoun;
            case 'adverb': return t.posAdverb;
            case 'number': return t.posNumber;
            case 'practice': return t.posPractice;
            default: return pos;
        }
    };

    const isTypingMode = quizMode !== 'romaji_to_kana';

    let hiraSelCount = 0;
    selectedHira.forEach(group => {
        if (kanaData[group]) hiraSelCount += kanaData[group].h.length;
    });
    let kataSelCount = 0;
    selectedKata.forEach(group => {
        if (kanaData[group]) kataSelCount += kanaData[group].k.length;
    });
    const totalSelCount = hiraSelCount + kataSelCount;

    const unlockedCount = useMemo(() => {
        const stats = storageService.loadStats();
        const selectedChars: string[] = [];
        selectedHira.forEach(group => {
            if (kanaData[group]) {
                kanaData[group].h.forEach(item => selectedChars.push(item.split(':')[0]));
            }
        });
        selectedKata.forEach(group => {
            if (kanaData[group]) {
                kanaData[group].k.forEach(item => selectedChars.push(item.split(':')[0]));
            }
        });

        return selectedChars.filter(char => {
            const stat = stats[char];
            return stat?.unlocked === true || (stat && (stat.correct > 0 || stat.wrong > 0));
        }).length;
    }, [selectedHira, selectedKata, currentKana]);

    return (
        <div className="quiz-section" style={{ display: 'block' }}>
            <div className="top-bar">
                <button className="btn-small" onClick={onStopQuiz}>{t.changeFilters}</button>
                <span id="alfabetoCorrente" className="alphabet-badge">
                    {currentKana.type}
                </span>
            </div>

            {/* Jukurendo Progress Bar */}
            {!quizMode.endsWith('_words') && quizState.isProgressiveMode && (
                <div className="unlock-progress-container">
                    {/* Confetti particles */}
                    {confetti.map(p => (
                        <div key={p.id} style={p.style} />
                    ))}

                    <div className="unlock-progress-header">
                        <span className="unlock-label">
                            {t.unlockProgressLabel} — {unlockProgress}%
                        </span>
                        <span className="accuracy-label">
                            {t.unlockedCountLabel(unlockedCount, totalSelCount)}
                        </span>
                    </div>

                    <div className={`unlock-progress-bar-wrapper ${unlockProgress === 100 ? 'level-up' : ''}`}>
                        <div
                            className={`unlock-progress-bar-fill ${unlockProgress === 100 ? 'level-up' : ''} ${rollingAccuracy < 0.8 ? 'warning-fill' : ''}`}
                            style={{ width: `${unlockProgress}%` }}
                        />
                    </div>

                    <div className="unlock-progress-footer">
                        {rollingAccuracy < 0.8 ? (
                            <span className="accuracy-warning-text">
                                ⚠️ {t.accuracyWarning} ({t.rollingAccuracyLabel(Math.round(rollingAccuracy * 100))})
                            </span>
                        ) : (
                            <span className="progress-detail-text">
                                {t.rollingAccuracyLabel(Math.round(rollingAccuracy * 100))}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="hint-text" id="firstTimeHint">
                {hint}
            </div>

            <div className={`kana-display ${fontClass}`} id="kanaDisplay">
                {quizMode === 'kana_to_romaji' || quizMode === 'kana_to_romaji_words'
                    ? (
                        <>
                            {currentKana.kana}
                            {quizMode.endsWith('_words') && 'kanji' in currentKana && (currentKana as any).kanji && (
                                <span className="display-kanji"> ({(currentKana as any).kanji})</span>
                            )}
                        </>
                    )
                    : currentKana.romaji}
            </div>

            {quizMode.endsWith('_words') && currentKana && 'translation' in currentKana && (
                <div className="word-translation">
                    {currentKana.translation[lang]}
                    {('partOfSpeech' in currentKana) && (
                        <span style={{ opacity: 0.7, fontSize: '0.9em' }}> ({getPosLabel((currentKana as any).partOfSpeech)})</span>
                    )}
                </div>
            )}

            {isTypingMode ? (
                <>
                    <div className="controls" id="textInputControls">
                        <input
                            type="text"
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={quizMode === 'romaji_to_kana_words' ? 'kana' : 'romaji'}
                            autoComplete="off"
                        />
                    </div>

                    <div className="controls" id="actionButtonsControls">
                        <button className="primary" onClick={() => onCheckAnswer(inputValue, selectedHira, selectedKata)}>
                            {t.verify}
                        </button>
                        <button className="secondary" onClick={onShowSolution}>
                            {t.dontRemember}
                        </button>
                    </div>

                    {/* Virtual Keyboard */}
                    {quizMode === 'romaji_to_kana_words' && activeKeyboardKeysByGroup.length > 0 && (
                        <div className="virtual-keyboard">
                            {activeKeyboardKeysByGroup.map((row, rIdx) => (
                                <div key={rIdx} className="keyboard-row">
                                    {row.keys.map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`keyboard-key ${fontClass}`}
                                            onClick={() => handleKeyClick(key)}
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            {/* Control row */}
                            <div className="keyboard-row">
                                <button
                                    type="button"
                                    className="keyboard-key control clear"
                                    onClick={handleClear}
                                    title="Clear"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    className="keyboard-key control backspace"
                                    onClick={handleBackspace}
                                    title="Backspace"
                                >
                                    ⌫
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="options-grid" id="optionsGrid" style={{ display: 'grid' }}>
                    {options.map((opt, index) => {
                        let btnClass = '';
                        if (optionSelected) {
                            if (opt === currentKana.kana) {
                                btnClass = 'correct';
                            } else if (opt === clickedOption) {
                                btnClass = 'wrong';
                            }
                        }

                        return (
                            <button
                                key={opt}
                                type="button"
                                className={`option-btn ${btnClass} ${fontClass}`}
                                onClick={() => handleOptionClick(opt)}
                                disabled={optionSelected}
                            >
                                <span className="option-badge">{index + 1}</span>
                                <span>{opt}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="feedback" id="feedback" style={{ color: feedbackColor }}>
                {feedback}
            </div>

            <div className="stats" id="stats">
                {t.scoreBoard(score, mistakes)}
            </div>

            <div id="quizSelectionSummary" style={{ fontSize: '0.8rem', color: 'var(--subtext)', marginTop: '10px', opacity: 0.75 }}>
                {t.selectedQuizSummary(totalSelCount, hiraSelCount, kataSelCount)}
            </div>
        </div>
    );
};
