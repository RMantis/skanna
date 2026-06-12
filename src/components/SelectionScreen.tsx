import React, { useState, useEffect, useMemo } from 'react';
import { kanaData, getVowelIndex } from '../constants/kanaData';
import { storageService } from '../services/storageService';
import { QuizMode } from '../hooks/useQuiz';
import { TranslationDictionary } from '../constants/translations';
import bannerImg from '../assets/banner.jpg';

interface SelectionScreenProps {
    t: TranslationDictionary;
    onStartQuiz: (mode: QuizMode, hira: string[], kata: string[]) => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({ t, onStartQuiz }) => {
    const [selectedHira, setSelectedHira] = useState<string[]>([]);
    const [selectedKata, setSelectedKata] = useState<string[]>([]);
    const [lastMode, setLastMode] = useState<string | null>(null);

    useEffect(() => {
        const saved = storageService.loadSelection();
        if (saved) {
            setSelectedHira(saved.hira);
            setSelectedKata(saved.kata);
        } else {
            setSelectedHira(['Vowels', 'K']);
            setSelectedKata([]);
        }
        setLastMode(storageService.loadLastMode());
    }, []);

    const getFriendlyModeName = (mode: string) => {
        switch (mode) {
            case 'kana_to_romaji':
                return `${t.single} (${t.kanaToRomaji})`;
            case 'romaji_to_kana':
                return `${t.single} (${t.romajiToKana})`;
            case 'kana_to_romaji_words':
                return `${t.words} (${t.kanaToRomaji})`;
            case 'romaji_to_kana_words':
                return `${t.words} (${t.romajiToKana})`;
            default:
                return mode;
        }
    };

    const updateSelection = (hira: string[], kata: string[]) => {
        setSelectedHira(hira);
        setSelectedKata(kata);
        storageService.saveSelection({ hira, kata });
    };

    const counts = useMemo(() => {
        let hiraCount = 0;
        selectedHira.forEach(group => {
            if (kanaData[group]) {
                hiraCount += kanaData[group].h.length;
            }
        });

        let kataCount = 0;
        selectedKata.forEach(group => {
            if (kanaData[group]) {
                kataCount += kanaData[group].k.length;
            }
        });

        return {
            hira: hiraCount,
            kata: kataCount,
            total: hiraCount + kataCount
        };
    }, [selectedHira, selectedKata]);

    const groups = Object.keys(kanaData);

    const toggleRow = (type: 'hira' | 'kata', group: string) => {
        if (type === 'hira') {
            const next = selectedHira.includes(group)
                ? selectedHira.filter(g => g !== group)
                : [...selectedHira, group];
            updateSelection(next, selectedKata);
        } else {
            const next = selectedKata.includes(group)
                ? selectedKata.filter(g => g !== group)
                : [...selectedKata, group];
            updateSelection(selectedHira, next);
        }
    };

    const toggleSelectAll = (type: 'hira' | 'kata', checked: boolean) => {
        if (type === 'hira') {
            const next = checked ? [...groups] : [];
            updateSelection(next, selectedKata);
        } else {
            const next = checked ? [...groups] : [];
            updateSelection(selectedHira, next);
        }
    };

    const isAllHiraChecked = groups.length > 0 && groups.every(g => selectedHira.includes(g));
    const isAllKataChecked = groups.length > 0 && groups.every(g => selectedKata.includes(g));

    return (
        <div className="config-section">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand-muted">s</span>
                    <span className="brand-highlight">KAN</span>
                    <span className="brand-muted">n</span>
                    <span className="brand-highlight">A</span>
                </h1>
                <p className="hero-subtitle">KANA school</p>
                <img src={bannerImg} alt="sKANnA Banner" className="hero-banner" />
                <p className="hero-desc">{t.projectDesc}</p>
                <hr className="hero-divider" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0 0 4px 0', padding: '0 5px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{t.chooseQuizMode}</h3>
                {lastMode && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--subtext)' }}>
                        {t.lastModeUsed}: <strong style={{ color: 'var(--primary-color)' }}>{getFriendlyModeName(lastMode)}</strong>
                    </span>
                )}
            </div>

            <div className="start-modes-grid" style={{ marginBottom: '20px' }}>
                <button type="button" className="mode-card single-kr" onClick={() => onStartQuiz('kana_to_romaji', selectedHira, selectedKata)}>
                    <span className="mode-badge">{t.single}</span>
                    <span className="mode-title">{t.kanaToRomaji}</span>
                </button>
                <button type="button" className="mode-card single-rk" onClick={() => onStartQuiz('romaji_to_kana', selectedHira, selectedKata)}>
                    <span className="mode-badge">{t.single}</span>
                    <span className="mode-title">{t.romajiToKana}</span>
                </button>
                <button type="button" className="mode-card word-kr" onClick={() => onStartQuiz('kana_to_romaji_words', selectedHira, selectedKata)}>
                    <span className="mode-badge">{t.words}</span>
                    <span className="mode-title">{t.kanaToRomaji}</span>
                </button>
                <button type="button" className="mode-card word-rk" onClick={() => onStartQuiz('romaji_to_kana_words', selectedHira, selectedKata)}>
                    <span className="mode-badge">{t.words}</span>
                    <span className="mode-title">{t.romajiToKana}</span>
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0 0 10px 0', padding: '0 5px' }}>
                <h3 style={{ margin: 0 }}>{t.chooseKana}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--subtext)' }}>
                    {t.selectedSummary(counts.total)}
                </span>
            </div>

            <div className="tables-container">
                {/* Tabella Hiragana */}
                <div className="table-wrapper">
                    <h4 className="hira-title">
                        Hiragana
                        <span className="count-badge" id="hiraCountHeader">{counts.hira}</span>
                    </h4>
                    <table className="kana-table hira-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25px' }}>
                                    <input
                                        type="checkbox"
                                        id="selectAllHira"
                                        checked={isAllHiraChecked}
                                        onChange={(e) => toggleSelectAll('hira', e.target.checked)}
                                    />
                                </th>
                                <th style={{ textAlign: 'left', paddingLeft: '8px' }}>{t.group}</th>
                                <th>A</th>
                                <th>I</th>
                                <th>U</th>
                                <th>E</th>
                                <th>O</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(group => {
                                const isSelected = selectedHira.includes(group);
                                const cells = Array(5).fill(null);
                                kanaData[group].h.forEach(item => {
                                    const [kana, romaji] = item.split(':');
                                    const idx = getVowelIndex(romaji);
                                    if (idx !== -1) {
                                        cells[idx] = { kana, romaji };
                                    }
                                });

                                return (
                                    <tr
                                        key={group}
                                        className={isSelected ? 'selected-row' : ''}
                                        onClick={() => toggleRow('hira', group)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleRow('hira', group)}
                                            />
                                        </td>
                                        <td className="group-label">{group === 'Vowels' ? t.vowels : group}</td>
                                        {cells.map((cell, idx) => (
                                            <td key={idx}>
                                                {cell ? (
                                                    <>
                                                        {cell.kana}
                                                        <span className="romaji-text">({cell.romaji})</span>
                                                    </>
                                                ) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Tabella Katakana */}
                <div className="table-wrapper">
                    <h4 className="kata-title">
                        Katakana
                        <span className="count-badge" id="kataCountHeader">{counts.kata}</span>
                    </h4>
                    <table className="kana-table kata-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25px' }}>
                                    <input
                                        type="checkbox"
                                        id="selectAllKata"
                                        checked={isAllKataChecked}
                                        onChange={(e) => toggleSelectAll('kata', e.target.checked)}
                                    />
                                </th>
                                <th style={{ textAlign: 'left', paddingLeft: '8px' }}>{t.group}</th>
                                <th>A</th>
                                <th>I</th>
                                <th>U</th>
                                <th>E</th>
                                <th>O</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(group => {
                                const isSelected = selectedKata.includes(group);
                                const cells = Array(5).fill(null);
                                kanaData[group].k.forEach(item => {
                                    const [kana, romaji] = item.split(':');
                                    const idx = getVowelIndex(romaji);
                                    if (idx !== -1) {
                                        cells[idx] = { kana, romaji };
                                    }
                                });

                                return (
                                    <tr
                                        key={group}
                                        className={isSelected ? 'selected-row' : ''}
                                        onClick={() => toggleRow('kata', group)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleRow('kata', group)}
                                            />
                                        </td>
                                        <td className="group-label">{group === 'Vowels' ? t.vowels : group}</td>
                                        {cells.map((cell, idx) => (
                                            <td key={idx}>
                                                {cell ? (
                                                    <>
                                                        {cell.kana}
                                                        <span className="romaji-text">({cell.romaji})</span>
                                                    </>
                                                ) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};
