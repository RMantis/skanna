import { kanaData } from '../constants/kanaData';

const hiraRomajiMap: Record<string, string> = {};
const kataRomajiMap: Record<string, string> = {};

// Popola le mappe romaji -> kana per la conversione automatica
Object.keys(kanaData).forEach(group => {
    kanaData[group].h.forEach(item => {
        const [kana, romaji] = item.split(':');
        hiraRomajiMap[romaji] = kana;
    });
    kanaData[group].k.forEach(item => {
        const [kana, romaji] = item.split(':');
        kataRomajiMap[romaji] = kana;
    });
});

export const imeService = {
    convertRomajiToKana(text: string, scriptType: 'Hiragana' | 'Katakana'): string {
        let result = '';
        let i = 0;
        const map = scriptType === 'Hiragana' ? hiraRomajiMap : kataRomajiMap;
        
        const keys = Object.keys(map).sort((a, b) => b.length - a.length);
        
        while (i < text.length) {
            let matched = false;
            for (const romaji of keys) {
                if (text.substring(i, i + romaji.length).toLowerCase() === romaji) {
                    result += map[romaji];
                    i += romaji.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                result += text[i];
                i++;
            }
        }
        return result;
    }
};
