/* Shared, dependency-free poker rules. Cards are { r: 2..14, s: 's'|'h'|'d'|'c' }. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Poker = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SUITS = ['s', 'h', 'd', 'c'];
  const NAMES = ['하이 카드', '원페어', '투페어', '트리플', '스트레이트', '플러시', '풀하우스', '포카드', '스트레이트 플러시', '로열 스트레이트 플러시'];

  function deck() {
    const cards = [];
    for (const s of SUITS) for (let r = 2; r <= 14; r++) cards.push({ r, s });
    return cards;
  }
  function shuffle(cards, random = Math.random) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }
  function compare(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0);
    }
    return 0;
  }
  function rankFive(cards) {
    if (cards.length !== 5) throw new Error('Five cards required');
    const rs = cards.map(c => c.r).sort((a, b) => b - a);
    const counts = new Map();
    rs.forEach(r => counts.set(r, (counts.get(r) || 0) + 1));
    const groups = [...counts].map(([r, n]) => ({ r, n })).sort((a, b) => b.n - a.n || b.r - a.r);
    const flush = cards.every(c => c.s === cards[0].s);
    const unique = [...new Set(rs)];
    const straight = unique.length === 5 && (unique[0] - unique[4] === 4 ? unique[0] : (unique.join(',') === '14,5,4,3,2' ? 5 : 0));
    let score;
    if (straight && flush) score = [straight === 14 ? 9 : 8, straight];
    else if (groups[0].n === 4) score = [7, groups[0].r, groups[1].r];
    else if (groups[0].n === 3 && groups[1].n === 2) score = [6, groups[0].r, groups[1].r];
    else if (flush) score = [5, ...rs];
    else if (straight) score = [4, straight];
    else if (groups[0].n === 3) score = [3, groups[0].r, ...groups.slice(1).map(g => g.r).sort((a, b) => b - a)];
    else if (groups[0].n === 2 && groups[1].n === 2) score = [2, Math.max(groups[0].r, groups[1].r), Math.min(groups[0].r, groups[1].r), groups[2].r];
    else if (groups[0].n === 2) score = [1, groups[0].r, ...groups.slice(1).map(g => g.r).sort((a, b) => b - a)];
    else score = [0, ...rs];
    return { score, name: NAMES[score[0]], cards };
  }
  function evaluate(cards) {
    if (cards.length < 5) return null;
    let best = null;
    for (let a = 0; a < cards.length - 4; a++)
      for (let b = a + 1; b < cards.length - 3; b++)
        for (let c = b + 1; c < cards.length - 2; c++)
          for (let d = c + 1; d < cards.length - 1; d++)
            for (let e = d + 1; e < cards.length; e++) {
              const result = rankFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
              if (!best || compare(result.score, best.score) > 0) best = result;
            }
    return best;
  }
  function glyph(card) { return ({ s: '♠', h: '♥', d: '♦', c: '♣' })[card.s]; }
  function face(card) { return (card.r === 14 ? 'A' : card.r === 13 ? 'K' : card.r === 12 ? 'Q' : card.r === 11 ? 'J' : card.r === 10 ? '10' : card.r) + glyph(card); }
  return { SUITS, NAMES, deck, shuffle, compare, rankFive, evaluate, glyph, face };
});
