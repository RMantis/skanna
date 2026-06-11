import React, { useState, useEffect, useRef } from 'react';
import { QuizState } from '../hooks/useQuiz';
import { imeService } from '../services/imeService';
import { storageService } from '../services/storageService';
import { kanaData } from '../constants/kanaData';
import { TranslationDictionary } from '../constants/translations';

interface QuizScreenProps {
    t: TranslationDictionary;
    quizState: QuizState;
    selectedHira: string[];
    selectedKata: string[];
    onStopQuiz: () => void;
    onCheckAnswer: (answer: string, hira: string[], kata: string[]) => void;
    onSelectOption: (option: string, hira: string[], kata: string[]) => void;
    onShowSolution: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
    t,
    quizState,
    selectedHira,
    selectedKata,
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
        options
    } = quizState;

    const [inputValue, setInputValue] = useState('');
    const [clickedOption, setClickedOption] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (quizMode === 'romaji_to_kana_phrases' && currentKana) {
            const converted = imeService.convertRomajiToKana(val, currentKana.type);
            setInputValue(converted);
        } else {
            setInputValue(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const isPhrasesMode = quizMode.endsWith('_phrases');
        if (e.key === 'Enter' || (e.key === ' ' && !isPhrasesMode)) {
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

    const isNew = !quizMode.endsWith('_phrases') && (() => {
        const stats = storageService.loadStats();
        const stat = stats[currentKana.kana];
        return !stat || ((stat.correct || 0) === 0 && (stat.wrong || 0) === 0);
    })();

    const hint = isNew ? (
        quizMode === 'kana_to_romaji'
            ? t.newKanaRomaji(currentKana.romaji)
            : t.newKanaAnswer(currentKana.kana)
    ) : '';

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

    return (
        <div className="quiz-section" style={{ display: 'block' }}>
            <div className="top-bar">
                <button className="btn-small" onClick={onStopQuiz}>{t.changeFilters}</button>
                <span id="alfabetoCorrente" style={{ color: 'var(--subtext)', fontSize: '0.9rem' }}>
                    {currentKana.type}
                </span>
            </div>

            <div className="hint-text" id="firstTimeHint">
                {hint}
            </div>

            <div className="kana-display" id="kanaDisplay">
                {quizMode === 'kana_to_romaji' || quizMode === 'kana_to_romaji_phrases'
                    ? currentKana.kana
                    : currentKana.romaji}
            </div>

            {isTypingMode ? (
                <>
                    <div className="controls" id="textInputControls">
                        <input
                            type="text"
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={quizMode === 'romaji_to_kana_phrases' ? 'kana' : 'romaji'}
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
                                className={`option-btn ${btnClass}`}
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
