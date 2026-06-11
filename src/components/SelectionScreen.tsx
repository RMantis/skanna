import React, { useState, useEffect, useMemo } from 'react';
import { kanaData, getVowelIndex } from '../constants/kanaData';
import { storageService } from '../services/storageService';
import { QuizMode } from '../hooks/useQuiz';
import { TranslationDictionary } from '../constants/translations';

interface SelectionScreenProps {
    t: TranslationDictionary;
    onStartQuiz: (mode: QuizMode, hira: string[], kata: string[]) => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({ t, onStartQuiz }) => {
    const [selectedHira, setSelectedHira] = useState<string[]>([]);
    const [selectedKata, setSelectedKata] = useState<string[]>([]);

    useEffect(() => {
        const saved = storageService.loadSelection();
        if (saved) {
            setSelectedHira(saved.hira);
            setSelectedKata(saved.kata);
        } else {
            const defaultGroups = ['Vowels', 'K'];
            setSelectedHira(defaultGroups);
            setSelectedKata(defaultGroups);
        }
    }, []);

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
            <h3 style={{ marginBottom: '5px', textAlign: 'center' }}>{t.chooseKana}</h3>

            <div className="tables-container">
                {/* Tabella Hiragana */}
                <div className="table-wrapper">
                    <h4 className="hira-title">Hiragana (<span id="hiraCountHeader">{counts.hira}</span>)</h4>
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
                    <h4 className="kata-title">Katakana (<span id="kataCountHeader">{counts.kata}</span>)</h4>
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

            <div id="tableSelectionSummary" style={{ textAlign: 'center', margin: '5px 0 15px 0', fontSize: '1.05rem', color: 'var(--text-color)', fontWeight: 600, letterSpacing: '0.5px' }}>
                {t.selectedSummary(counts.total, counts.hira, counts.kata)}
            </div>



            <div className="start-buttons-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="primary" style={{ flex: 1, padding: '12px' }} onClick={() => onStartQuiz('kana_to_romaji', selectedHira, selectedKata)}>{t.singleKanaRomaji}</button>
                    <button className="primary" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--btn-single-rk-bg)', color: 'var(--btn-single-rk-text)' }} onClick={() => onStartQuiz('romaji_to_kana', selectedHira, selectedKata)}>{t.singleRomajiKana}</button>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="primary" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--btn-phrase-kr-bg)', color: 'var(--btn-phrase-kr-text)' }} onClick={() => onStartQuiz('kana_to_romaji_phrases', selectedHira, selectedKata)}>{t.phrasesKanaRomaji}</button>
                    <button className="primary" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--btn-phrase-rk-bg)', color: 'var(--btn-phrase-rk-text)' }} onClick={() => onStartQuiz('romaji_to_kana_phrases', selectedHira, selectedKata)}>{t.phrasesRomajiKana}</button>
                </div>
            </div>
        </div>
    );
};
