// Pictures: Kenney Animal Pack Redux (CC0), see public/assets/animals/License.txt
// `ins` is the instrumental case, used in "Złodziej jest psem".
export const SPECIES = [
  { id: 'pies', img: 'dog', ins: 'psem' },
  { id: 'żaba', img: 'frog', ins: 'żabą' },
  { id: 'miś', img: 'bear', ins: 'misiem' },
  { id: 'królik', img: 'rabbit', ins: 'królikiem' },
  { id: 'sowa', img: 'owl', ins: 'sową' },
  { id: 'świnia', img: 'pig', ins: 'świnią' },
  { id: 'słoń', img: 'elephant', ins: 'słoniem' },
  { id: 'pingwin', img: 'penguin', ins: 'pingwinem' },
] as const;

// `loc` is the locative case, used in "Złodziej jest na czerwonym".
export const COLOURS = [
  { id: 'red', loc: 'czerwonym', css: '#f9c0c0', ink: '#c62828' },
  { id: 'blue', loc: 'niebieskim', css: '#bcd8f7', ink: '#1565c0' },
  { id: 'green', loc: 'zielonym', css: '#c3ecc3', ink: '#2e7d32' },
  { id: 'yellow', loc: 'żółtym', css: '#fbeaa0', ink: '#b8860b' },
] as const;

// `yes` follows "ma", `no` follows "nie ma".
export const ACCESSORIES = {
  hat: { yes: 'czapkę', no: 'czapki' },
  glasses: { yes: 'okulary', no: 'okularów' },
  scarf: { yes: 'szalik', no: 'szalika' },
} as const;

export const PLACES = {
  beside: { tail: ['obok', 'mnie'], arrow: '↔️↕️' },
  above: { tail: ['nad', 'mną'], arrow: '⬆️' },
  below: { tail: ['pod', 'mną'], arrow: '⬇️' },
  top: { tail: ['na', 'górze'], arrow: '⏫' },
  bottom: { tail: ['na', 'dole'], arrow: '⏬' },
  left: { tail: ['po', 'lewej'], arrow: '⏪' },
  right: { tail: ['po', 'prawej'], arrow: '⏩' },
} as const;

// Hand-made syllables (automatic Polish hyphenation is not reliable).
export const SYLLABLES: Readonly<Record<string, readonly string[]>> = {
  złodziej: ['zło', 'dziej'], złodziei: ['zło', 'dzie', 'i'], jeden: ['je', 'den'], żaden: ['ża', 'den'],
  jest: ['jest'], nie: ['nie'], ma: ['ma'], czapkę: ['czap', 'kę'], czapki: ['czap', 'ki'],
  okulary: ['o', 'ku', 'la', 'ry'], okularów: ['o', 'ku', 'la', 'rów'], szalik: ['sza', 'lik'], szalika: ['sza', 'li', 'ka'],
  obok: ['o', 'bok'], mnie: ['mnie'], nad: ['nad'], pod: ['pod'], mną: ['mną'], na: ['na'], po: ['po'],
  górze: ['gó', 'rze'], dole: ['do', 'le'], lewej: ['le', 'wej'], prawej: ['pra', 'wej'],
  czerwonym: ['czer', 'wo', 'nym'], niebieskim: ['nie', 'bie', 'skim'], zielonym: ['zie', 'lo', 'nym'], żółtym: ['żół', 'tym'],
  psem: ['psem'], żabą: ['ża', 'bą'], misiem: ['mi', 'siem'], królikiem: ['kró', 'li', 'kiem'], sową: ['so', 'wą'],
  świnią: ['świ', 'nią'], słoniem: ['sło', 'niem'], pingwinem: ['ping', 'wi', 'nem'],
};

// [columns, rows]
export const SIZES = { '3x3': [3, 3], '4x3': [4, 3], '4x4': [4, 4] } as const;
