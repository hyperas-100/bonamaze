/* Bonamaze: player's collection, gems, packs, crafting and decks.
   Saved in this browser (localStorage). Backup codes move it between devices. */
(function (root) {
  const KEY = 'bz_profile_v1';
  const E = root.Cards.ECONOMY;
  const { DEF, HERO } = root.Engine.buildDefs();
  const RAR = ['common', 'rare', 'epic', 'legendary'];
  const POOL = {}; RAR.forEach((r) => (POOL[r] = Object.values(DEF).filter((d) => d.rarity === r)));
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  function fresh() {
    return { v: 1, gems: 0, shards: 0, packs: E.startPacks, cards: {}, decks: {}, useCustom: {}, lastDaily: '', pity: 0, awarded: [], opened: 0, created: Date.now() };
  }
  let P = load();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); if (p && p.v === 1) return Object.assign(fresh(), p); } } catch (e) {}
    return fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  save();

  const maxOf = (id) => E.maxCopies[DEF[id].rarity] || 1;
  function owned(id) { const d = DEF[id]; if (!d) return 0; return d.rarity === 'basic' ? maxOf(id) : Math.min(P.cards[id] || 0, maxOf(id)); }

  function rollRarity(minRare) {
    const odds = Object.assign({}, E.odds); if (minRare) delete odds.common;
    const tot = Object.values(odds).reduce((a, b) => a + b, 0);
    let x = Math.random() * tot;
    for (const r of RAR) { if (!(r in odds)) continue; if ((x -= odds[r]) <= 0) return r; }
    return 'rare';
  }
  function openPack() { P = load();
    if (P.packs > 0) P.packs--;
    else if (P.gems >= E.packCost) P.gems -= E.packCost;
    else return { error: `Need ${E.packCost} gems` };
    const rar = [];
    for (let i = 0; i < E.packSize; i++) rar.push(rollRarity(i === E.packSize - 1 && !rar.some((r) => r !== 'common')));
    if (rar.includes('legendary')) P.pity = 0;
    else if (++P.pity >= E.pity) { rar[E.packSize - 1] = 'legendary'; P.pity = 0; }
    const out = rar.map((r) => {
      const d = POOL[r][Math.floor(Math.random() * POOL[r].length)];
      const have = P.cards[d.key] || 0;
      if (have >= maxOf(d.key)) { const s = E.dupeShards[r] || 0; P.shards += s; return { id: d.key, rarity: r, dupe: true, shards: s }; }
      P.cards[d.key] = have + 1;
      return { id: d.key, rarity: r, isNew: have === 0 };
    });
    P.opened++; save();
    return { ok: true, cards: out };
  }
  function buyPack() { P = load(); if (P.gems < E.packCost) return { error: `Need ${E.packCost} gems` }; P.gems -= E.packCost; P.packs++; save(); return { ok: true }; }
  function craft(id) { P = load();
    const d = DEF[id]; if (!d || d.rarity === 'basic') return { error: 'Cannot craft that' };
    if ((P.cards[id] || 0) >= maxOf(id)) return { error: 'You already have the max copies' };
    const cost = E.craftCost[d.rarity]; if (P.shards < cost) return { error: `Need ${cost} shards` };
    P.shards -= cost; P.cards[id] = (P.cards[id] || 0) + 1; save(); return { ok: true };
  }
  function dailyReady() { return P.lastDaily !== today(); }
  function claimDaily() { P = load(); if (!dailyReady()) return { error: 'Already claimed today' }; P.lastDaily = today(); P.packs += E.dailyPacks; save(); return { ok: true, packs: E.dailyPacks }; }
  function award(key, won) { P = load();
    if (!key || P.awarded.includes(key)) return 0;
    const g = won ? E.winGems : E.lossGems;
    P.gems += g; P.awarded.push(key); if (P.awarded.length > 60) P.awarded.shift(); save(); return g;
  }

  /* decks */
  function getDeck(hero) { return (P.decks[hero] || []).slice(); }
  function setDeck(hero, list) { P = load(); P.decks[hero] = list.slice(0, E.deckSize); if (!deckValid(hero).ok) P.useCustom[hero] = false; save(); }
  function deckValid(hero) {
    const list = P.decks[hero] || [];
    const r = root.Engine.validateDeck(hero, list); if (r.error) return r;
    const cnt = {}; for (const id of list) { cnt[id] = (cnt[id] || 0) + 1; if (cnt[id] > owned(id)) return { error: `You only own ${owned(id)} × ${DEF[id].name}` }; }
    return { ok: true };
  }
  function setUseCustom(hero, on) { P = load(); if (on && !deckValid(hero).ok) return deckValid(hero); P.useCustom[hero] = !!on; save(); return { ok: true }; }
  function deckFor(hero) { return P.useCustom[hero] && deckValid(hero).ok ? getDeck(hero) : null; }

  /* backup */
  function exportCode() { return 'BZ1.' + btoa(unescape(encodeURIComponent(JSON.stringify(P)))); }
  function importCode(code) {
    try {
      const s = String(code || '').trim(); if (!s.startsWith('BZ1.')) return { error: 'Not a Bonamaze backup code' };
      const p = JSON.parse(decodeURIComponent(escape(atob(s.slice(4)))));
      if (!p || p.v !== 1) return { error: 'Backup code is broken' };
      P = Object.assign(fresh(), p); save(); return { ok: true };
    } catch (e) { return { error: 'Backup code is broken' }; }
  }

  root.Collection = {
    get p() { P = load(); return P; }, owned, maxOf, openPack, buyPack, craft, dailyReady, claimDaily, award,
    getDeck, setDeck, deckValid, setUseCustom, deckFor, exportCode, importCode, POOL, RAR,
    collectibleCount: () => Object.values(DEF).filter((d) => d.rarity !== 'basic').length,
    ownedUnique: () => Object.keys(P.cards).filter((id) => DEF[id] && P.cards[id] > 0).length,
  };
})(window);
