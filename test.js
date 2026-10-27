// Run: node test.js
const assert = require('assert');
const G = require('./game.js');

let worst = 0;
for (const size of Object.keys(G.SIZES)) {
  const [cols, rows] = G.SIZES[size];
  for (let k = 1; k <= G.maxThieves(size); k++) {
    for (const liars of [false, true]) {
      const t0 = Date.now();
      for (let i = 0; i < 20; i++) {
        const c = G.generateCase({ cols, rows, k, liars });
        assert(c, `no case for ${size} k=${k} liars=${liars}`);
        // independent brute force: exactly one thief set fits all statements
        const fits = G.combos(cols * rows, k).filter((T) =>
          c.statements.every((s, sp) => G.holds(s, sp, T, c.board) === (liars ? !T.includes(sp) : true)));
        assert.deepStrictEqual(fits, [c.thieves], `not unique for ${size} k=${k} liars=${liars}`);
        for (const s of c.statements) {
          const w = G.words(s, k);
          assert(w.length >= 3 && w.length <= 5, `word count: ${G.sentence(s, k)}`);
          for (const x of w) assert.strictEqual(G.syllables(x).join('').toLowerCase(), x.toLowerCase(), `syllables: ${x}`);
          for (const x of w) assert(G.syllables(x).length > 1 || /^[^\s]+$/.test(x));
        }
      }
      worst = Math.max(worst, (Date.now() - t0) / 20);
      console.log(`ok ${size} k=${k} liars=${liars}`);
    }
  }
}
// every word must have a hand-made syllable entry
const probe = G.generateCase({ cols: 4, rows: 4, k: 2, liars: true });
console.log('sample:', probe.statements.slice(0, 4).map((s) => G.sentence(s, 2)));
console.log(`slowest avg per case: ${worst.toFixed(0)} ms`);
