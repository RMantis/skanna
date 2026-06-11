export interface KanaItem {
    kana: string;
    romaji: string;
    type: 'Hiragana' | 'Katakana';
}

export interface KanaGroup {
    h: string[]; // ['あ:a', ...]
    k: string[]; // ['ア:a', ...]
}

export type KanaDataMap = Record<string, KanaGroup>;

export const kanaData: KanaDataMap = {
    "Vocali": { h: ['あ:a','い:i','う:u','え:e','お:o'], k: ['ア:a','イ:i','ウ:u','エ:e','オ:o'] },
    "K": { h: ['か:ka','き:ki','く:ku','け:ke','こ:ko'], k: ['カ:ka','キ:ki','ク:ku','ケ:ke','コ:ko'] },
    "S": { h: ['さ:sa','し:shi','す:su','せ:se','そ:so'], k: ['サ:sa','シ:shi','ス:su','セ:se','ソ:so'] },
    "T": { h: ['た:ta','ち:chi','つ:tsu','て:te','と:to'], k: ['タ:ta','チ:chi','ツ:tsu','テ:te','ト:to'] },
    "N": { h: ['な:na','に:ni','ぬ:nu','ね:ne','の:no'], k: ['ナ:na','ニ:ni','ヌ:nu','ネ:ne','ノ:no'] },
    "H": { h: ['は:ha','ひ:hi','ふ:fu','へ:he','ほ:ho'], k: ['ハ:ha','ヒ:hi','フ:fu','ヘ:he','ホ:ho'] },
    "M": { h: ['ま:ma','み:mi','む:mu','め:me','も:mo'], k: ['マ:ma','ミ:mi','ム:mu','メ:me','モ:mo'] },
    "Y": { h: ['や:ya','ゆ:yu','よ:yo'], k: ['ヤ:ya','ユ:yu','ヨ:yo'] },
    "R": { h: ['ら:ra','り:ri','る:ru','れ:re','ろ:ro'], k: ['ラ:ra','リ:ri','ル:ru','レ:re','ロ:ro'] },
    "W / N": { h: ['わ:wa','を:wo','ん:n'], k: ['ワ:wa','ヲ:wo','ン:n'] }
};

export function getVowelIndex(romaji: string): number {
    if (romaji === 'n') return 2; // Colonna 'U'
    if (romaji.endsWith('a')) return 0;
    if (romaji.endsWith('i')) return 1;
    if (romaji.endsWith('u')) return 2;
    if (romaji.endsWith('e')) return 3;
    if (romaji.endsWith('o')) return 4;
    return -1;
}
