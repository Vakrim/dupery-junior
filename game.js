// Dupery Junior: game logic (no DOM). Used by index.html and test.js.
(function (root) {
  // Pictures: Kenney Animal Pack Redux (CC0), see assets/animals/License.txt
  const SPECIES = [
    { id: 'pies', img: 'dog', ins: 'psem' },
    { id: 'żaba', img: 'frog', ins: 'żabą' },
    { id: 'miś', img: 'bear', ins: 'misiem' },
    { id: 'królik', img: 'rabbit', ins: 'królikiem' },
    { id: 'sowa', img: 'owl', ins: 'sową' },
    { id: 'świnia', img: 'pig', ins: 'świnią' },
    { id: 'słoń', img: 'elephant', ins: 'słoniem' },
    { id: 'pingwin', img: 'penguin', ins: 'pingwinem' },
  ];
  const COLOURS = [
    { id: 'red', loc: 'czerwonym', css: '#f9c0c0', ink: '#c62828' },
    { id: 'blue', loc: 'niebieskim', css: '#bcd8f7', ink: '#1565c0' },
    { id: 'green', loc: 'zielonym', css: '#c3ecc3', ink: '#2e7d32' },
    { id: 'yellow', loc: 'żółtym', css: '#fbeaa0', ink: '#b8860b' },
  ];
  const ACCESSORIES = {
    hat: { yes: ['ma', 'czapkę'], no: ['nie', 'ma', 'czapki'] },
    glasses: { yes: ['ma', 'okulary'], no: ['nie', 'ma', 'okularów'] },
    scarf: { yes: ['ma', 'szalik'], no: ['nie', 'ma', 'szalika'] },
  };
  const PLACES = {
    beside: { tail: ['obok', 'mnie'], arrow: '↔️↕️' },
    above: { tail: ['nad', 'mną'], arrow: '⬆️' },
    below: { tail: ['pod', 'mną'], arrow: '⬇️' },
    top: { tail: ['na', 'górze'], arrow: '⏫' },
    bottom: { tail: ['na', 'dole'], arrow: '⏬' },
    left: { tail: ['po', 'lewej'], arrow: '⏪' },
    right: { tail: ['po', 'prawej'], arrow: '⏩' },
  };
  // Hand-made syllables (automatic Polish hyphenation is not reliable).
  const SYLLABLES = {
    złodziej: ['zło', 'dziej'], złodziei: ['zło', 'dzie', 'i'], jeden: ['je', 'den'], żaden: ['ża', 'den'],
    jest: ['jest'], nie: ['nie'], ma: ['ma'], czapkę: ['czap', 'kę'], czapki: ['czap', 'ki'],
    okulary: ['o', 'ku', 'la', 'ry'], okularów: ['o', 'ku', 'la', 'rów'], szalik: ['sza', 'lik'], szalika: ['sza', 'li', 'ka'],
    obok: ['o', 'bok'], mnie: ['mnie'], nad: ['nad'], pod: ['pod'], mną: ['mną'], na: ['na'], po: ['po'],
    górze: ['gó', 'rze'], dole: ['do', 'le'], lewej: ['le', 'wej'], prawej: ['pra', 'wej'],
    czerwonym: ['czer', 'wo', 'nym'], niebieskim: ['nie', 'bie', 'skim'], zielonym: ['zie', 'lo', 'nym'], żółtym: ['żół', 'tym'],
    psem: ['psem'], żabą: ['ża', 'bą'], misiem: ['mi', 'siem'], królikiem: ['kró', 'li', 'kiem'], sową: ['so', 'wą'],
    świnią: ['świ', 'nią'], słoniem: ['sło', 'niem'], pingwinem: ['ping', 'wi', 'nem'],
  };
  const SIZES = { '3x3': [3, 3], '4x3': [4, 3], '4x4': [4, 4] };

  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function combos(n, k, start = 0, cur = [], out = []) {
    if (cur.length === k) { out.push(cur.slice()); return out; }
    for (let i = start; i < n; i++) { cur.push(i); combos(n, k, i + 1, cur, out); cur.pop(); }
    return out;
  }

  function randomBoard(cols, rows) {
    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
      cells.push({
        species: pick(SPECIES).id, colour: pick(COLOURS).id,
        hat: Math.random() < 0.4, glasses: Math.random() < 0.4, scarf: Math.random() < 0.4,
      });
    }
    return { cols, rows, cells };
  }

  // Does cell c match property p, as seen by the speaker sp?
  function sat(p, sp, c, B) {
    const W = B.cols, r = (i) => Math.floor(i / W), q = (i) => i % W, cell = B.cells[c];
    switch (p.type) {
      case 'species': return cell.species === p.val;
      case 'hat': case 'glasses': case 'scarf': return cell[p.type];
      case 'colour': return cell.colour === p.val;
      case 'beside': return Math.abs(r(c) - r(sp)) + Math.abs(q(c) - q(sp)) === 1;
      case 'above': return q(c) === q(sp) && r(c) === r(sp) - 1;
      case 'below': return q(c) === q(sp) && r(c) === r(sp) + 1;
      case 'top': return r(c) === 0;
      case 'bottom': return r(c) === B.rows - 1;
      case 'left': return q(c) === 0;
      case 'right': return q(c) === W - 1;
    }
  }
  const cellsOf = (s, sp, B) => B.cells.map((_, c) => c).filter((c) => sat(s.prop, sp, c, B));
  // Positive: exactly one thief matches. Negative: no thief matches.
  function holds(s, sp, T, B) {
    const n = T.filter((c) => sat(s.prop, sp, c, B)).length;
    return s.neg ? n === 0 : n === 1;
  }

  function candidates() {
    const props = [
      ...SPECIES.map((x) => ({ type: 'species', val: x.id })),
      ...Object.keys(ACCESSORIES).map((type) => ({ type })),
      ...COLOURS.map((x) => ({ type: 'colour', val: x.id })),
      ...Object.keys(PLACES).map((type) => ({ type })),
    ];
    const out = [];
    for (const prop of props) {
      out.push({ prop, neg: false });
      if (prop.type !== 'colour') out.push({ prop, neg: true }); // "nie jest na czerwonym" has 6 words
    }
    return out;
  }
  const CANDIDATES = candidates();

  // Sentence as a list of words (3 to 5 words).
  function words(s, k) {
    const { type, val } = s.prop, neg = s.neg;
    let verb, tail;
    if (type === 'species') { verb = 'jest'; tail = [SPECIES.find((x) => x.id === val).ins]; }
    else if (ACCESSORIES[type]) { verb = 'ma'; tail = [ACCESSORIES[type][neg ? 'no' : 'yes'][neg ? 2 : 1]]; }
    else if (type === 'colour') { verb = 'jest'; tail = ['na', COLOURS.find((x) => x.id === val).loc]; }
    else { verb = 'jest'; tail = PLACES[type].tail; }
    const place = !!PLACES[type];
    let w;
    if (k === 1) w = ['Złodziej', ...(neg ? ['nie'] : []), verb, ...tail];
    else if (!neg) w = ['Jeden', 'złodziej', verb, ...tail];
    else if (place) w = ['Złodziei', 'nie', 'ma', ...tail];
    else w = ['Żaden', 'złodziej', 'nie', verb, ...tail];
    return w;
  }
  const sentence = (s, k) => words(s, k).join(' ') + '.';
  const syllables = (w) => SYLLABLES[w.toLowerCase()] || [w];
  const arrowOf = (s) => (PLACES[s.prop.type] && !s.neg ? PLACES[s.prop.type].arrow : '');

  // Case with exactly one solution. Returns null after too many failed tries.
  function generateCase({ cols, rows, k, liars }, tries = 300) {
    const n = cols * rows;
    for (let t = 0; t < tries; t++) {
      const B = randomBoard(cols, rows);
      const thieves = shuffle([...Array(n).keys()]).slice(0, k).sort((a, b) => a - b);
      let alive = combos(n, k);
      const statements = [];
      let ok = true;
      for (const c of shuffle([...Array(n).keys()])) {
        const want = (T) => (liars ? !T.includes(c) : true);
        const valid = CANDIDATES.filter((s) => holds(s, c, thieves, B) === want(thieves));
        if (!valid.length) { ok = false; break; }
        let best = null, bestAlive = null;
        for (let i = 0; i < 4; i++) {
          const s = pick(valid);
          const left = alive.filter((T) => holds(s, c, T, B) === want(T));
          if (!best || left.length < bestAlive.length) { best = s; bestAlive = left; }
        }
        statements[c] = best; alive = bestAlive;
      }
      if (ok && alive.length === 1) return { board: B, thieves, statements, k, liars };
    }
    return null;
  }

  // Stamps. s = settings: {size, k, liars, read, hints, syl, lives}. read/hints/syl = help is on.
  const noHelp = (s) => !s.read && !s.hints && !s.syl;
  const STAMPS = [
    { id: 'case', name: 'Rozwiązana sprawa', emoji: '🔍', need: 'Rozwiąż dowolną sprawę', test: () => true },
    { id: 'wide', name: 'Szeroka plansza', emoji: '↔️', need: 'Plansza 4×3', test: (s) => s.size === '4x3' },
    { id: 'big', name: 'Wielka plansza', emoji: '🗺️', need: 'Plansza 4×4', test: (s) => s.size === '4x4' },
    { id: 'k2', name: 'Dwóch złodziei', emoji: '👥', need: '2 złodziei', test: (s) => s.k === 2 },
    { id: 'k3', name: 'Trzech złodziei', emoji: '🎭', need: '3 złodziei', test: (s) => s.k === 3 },
    { id: 'liars', name: 'Kłamcy', emoji: '🤥', need: 'Złodzieje kłamią', test: (s) => s.liars },
    { id: 'noread', name: 'Bez głosu', emoji: '🔇', need: 'Czytanie na głos wyłączone', test: (s) => !s.read },
    { id: 'nohints', name: 'Bez wskazówek', emoji: '🧭', need: 'Strzałki i kolory wyłączone', test: (s) => !s.hints },
    { id: 'nosyl', name: 'Bez sylab', emoji: '📖', need: 'Sylaby wyłączone', test: (s) => !s.syl },
    { id: 'lives3', name: 'Trzy życia', emoji: '❤️', need: '3 życia', test: (s) => s.lives === 3 },
    { id: 'lives1', name: 'Jedno życie', emoji: '💔', need: '1 życie', test: (s) => s.lives === 1 },
    { id: 'liarsk2', name: 'Podwójne kłamstwo', emoji: '🎪', need: '2 lub 3 złodziei, którzy kłamią', test: (s) => s.liars && s.k >= 2 },
    { id: 'biglie', name: 'Wielki kłamca', emoji: '🦹', need: 'Plansza 4×4, złodzieje kłamią', test: (s) => s.size === '4x4' && s.liars },
    { id: 'trio', name: 'Trio', emoji: '🎰', need: '3 złodziei, którzy kłamią', test: (s) => s.k === 3 && s.liars },
    { id: 'reader', name: 'Czytelnik', emoji: '🎓', need: 'Bez głosu, wskazówek i sylab', test: noHelp },
    { id: 'careful', name: 'Ostrożny kłamca', emoji: '🧐', need: 'Złodzieje kłamią, 1 życie', test: (s) => s.liars && s.lives === 1 },
    { id: 'master', name: 'Mistrz detektywów', emoji: '🏆', need: 'Plansza 4×4, 3 złodziei, kłamią, bez pomocy, 1 życie',
      test: (s) => s.size === '4x4' && s.k === 3 && s.liars && noHelp(s) && s.lives === 1 },
  ];
  const earned = (s) => STAMPS.filter((x) => x.test(s)).map((x) => x.id);
  const maxThieves = (size) => (size === '3x3' ? 2 : 3);

  const api = { SPECIES, COLOURS, ACCESSORIES, PLACES, SIZES, STAMPS, generateCase, words, sentence, syllables, arrowOf,
    cellsOf, holds, sat, earned, maxThieves, combos };
  if (typeof module !== 'undefined') module.exports = api; else root.Game = api;
})(this);
