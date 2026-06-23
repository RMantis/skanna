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
    "Vowels": { h: ['あ:a','い:i','う:u','え:e','お:o'], k: ['ア:a','イ:i','ウ:u','エ:e','オ:o'] },
    "K": { h: ['か:ka','き:ki','く:ku','け:ke','こ:ko'], k: ['カ:ka','キ:ki','ク:ku','ケ:ke','コ:ko'] },
    "S": { h: ['さ:sa','し:shi','す:su','せ:se','そ:so'], k: ['サ:sa','シ:shi','ス:su','セ:se','ソ:so'] },
    "T": { h: ['た:ta','ち:chi','つ:tsu','て:te','と:to'], k: ['タ:ta','チ:chi','ツ:tsu','テ:te','ト:to'] },
    "N": { h: ['な:na','に:ni','ぬ:nu','ね:ne','の:no'], k: ['ナ:na','ニ:ni','ヌ:nu','ネ:ne','ノ:no'] },
    "H": { h: ['は:ha','ひ:hi','ふ:fu','へ:he','ほ:ho'], k: ['ハ:ha','ヒ:hi','フ:fu','ヘ:he','ホ:ho'] },
    "M": { h: ['ま:ma','み:mi','む:mu','め:me','も:mo'], k: ['マ:ma','ミ:mi','ム:mu','メ:me','モ:mo'] },
    "Y": { h: ['や:ya','ゆ:yu','よ:yo'], k: ['ヤ:ya','ユ:yu','ヨ:yo'] },
    "R": { h: ['ら:ra','り:ri','る:ru','れ:re','ろ:ro'], k: ['ラ:ra','リ:ri','ル:ru','レ:re','ロ:ro'] },
    "W / N": { h: ['わ:wa','を:wo','ん:n'], k: ['ワ:wa','ヲ:wo','ン:n'] },
    "G": { h: ['が:ga','ぎ:gi','ぐ:gu','げ:ge','ご:go'], k: ['ガ:ga','ギ:gi','グ:gu','ゲ:ge','ゴ:go'] },
    "Z": { h: ['ざ:za','じ:ji','ず:zu','ぜ:ze','ぞ:zo'], k: ['ザ:za','ジ:ji','ズ:zu','ゼ:ze','ゾ:zo'] },
    "D": { h: ['だ:da','ぢ:ji','づ:zu','で:de','ど:do'], k: ['ダ:da','ヂ:ji','ヅ:zu','デ:de','ド:do'] },
    "B": { h: ['ば:ba','び:bi','ぶ:bu','べ:be','ぼ:bo'], k: ['バ:ba','ビ:bi','ブ:bu','ベ:be','ボ:bo'] },
    "P": { h: ['ぱ:pa','ぴ:pi','ぷ:pu','ぺ:pe','ぽ:po'], k: ['パ:pa','ピ:pi','プ:pu','ペ:pe','ポ:po'] },
    "KY": { h: ['きゃ:kya','きゅ:kyu','きょ:kyo'], k: ['キャ:kya','キュ:kyu','キョ:kyo'] },
    "SH": { h: ['しゃ:sha','しゅ:shu','しょ:sho'], k: ['シャ:sha','シュ:shu','ショ:sho'] },
    "CH": { h: ['ちゃ:cha','ちゅ:chu','ちょ:cho'], k: ['チャ:cha','チュ:chu','チョ:cho'] },
    "NY": { h: ['にゃ:nya','にゅ:nyu','にょ:nyo'], k: ['ニャ:nya','ニュ:nyu','ニョ:nyo'] },
    "HY": { h: ['ひゃ:hya','ひゅ:hyu','ひょ:hyo'], k: ['ヒャ:hya','ヒュ:hyu','ヒョ:hyo'] },
    "MY": { h: ['みゃ:mya','みゅ:myu','みょ:myo'], k: ['ミャ:mya','ミュ:myu','ミョ:myo'] },
    "RY": { h: ['りゃ:rya','りゅ:ryu','りょ:ryo'], k: ['リャ:rya','リュ:ryu','リョ:ryo'] },
    "GY": { h: ['ぎゃ:gya','ぎゅ:gyu','ぎょ:gyo'], k: ['ギャ:gya','ギュ:gyu','ギョ:gyo'] },
    "J": { h: ['じゃ:ja','じゅ:ju','じょ:jo'], k: ['ジャ:ja','ジュ:ju','ジョ:jo'] },
    "BY": { h: ['びゃ:bya','びゅ:byu','びょ:byo'], k: ['ビャ:bya','ビュ:byu','ビョ:byo'] },
    "PY": { h: ['ぴゃ:pya','ぴゅ:pyu','ぴょ:pyo'], k: ['ピャ:pya','ピュ:pyu','ピョ:pyo'] }
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
