/* Bonamaze: authoritative rules engine. Runs on the host's browser only. No DOM. */
(function (root) {
  const Cards = root.Cards || (typeof require !== 'undefined' ? require('./cards.js') : null);
  const MAX_PLAYERS = 4, MAX_ROOM = 10, START_HAND = 3, MAX_PLAYS_PER_TURN = 8;
  const COLORS = ['#e05a4f', '#5a8cff', '#5fd068', '#ffb340', '#c070ff', '#40d8d0', '#ff7ab8', '#c8c8c8', '#a0e050', '#ff9060'];

  // Card definitions by id. def.hero = hero id or 'neutral'.
  function buildDefs() {
    const DEF = {}, HERO = {};
    const add = (owner, c) => {
      const sp = c.special ? Cards.SPECIALS[c.special] : null;
      DEF[c.id] = Object.assign({ attack: 0, shield: 0, heal: 0, draw: 0, again: 0, special: null, text: '', rarity: 'basic' }, c,
        { key: c.id, hero: owner, value: c.value != null ? c.value : sp && sp.value != null ? sp.value : 0 });
    };
    Cards.HEROES.forEach((h) => { HERO[h.id] = h; h.cards.forEach((c) => add(h.id, c)); });
    (Cards.NEUTRAL ? Cards.NEUTRAL.cards : []).forEach((c) => add('neutral', c));
    return { DEF, HERO };
  }
  const SHARED = buildDefs();
  function needsTarget(def) {
    return def.attack > 0 || !!(def.special && Cards.SPECIALS[def.special] && Cards.SPECIALS[def.special].target);
  }
  function classicDeck(heroId) {
    const h = SHARED.HERO[heroId]; if (!h) return [];
    const out = []; h.cards.forEach((c) => { if ((c.rarity || 'basic') === 'basic') for (let k = 0; k < (c.count || 1); k++) out.push(c.id); });
    return out;
  }
  // Rules check for a custom deck (ownership is checked on the player's own device).
  function validateDeck(heroId, list) {
    const E = Cards.ECONOMY;
    if (!SHARED.HERO[heroId]) return { error: 'Unknown hero' };
    if (!Array.isArray(list)) return { error: 'Bad deck' };
    if (list.length !== E.deckSize) return { error: `Deck must have exactly ${E.deckSize} cards (has ${list.length})` };
    const counts = {};
    for (const id of list) {
      const d = SHARED.DEF[id];
      if (!d) return { error: 'Unknown card in deck' };
      if (d.hero !== heroId && d.hero !== 'neutral') return { error: `${d.name} belongs to another hero` };
      counts[id] = (counts[id] || 0) + 1;
      const max = E.maxCopies[d.rarity] || 1;
      if (counts[id] > max) return { error: `Max ${max} × ${d.name}` };
    }
    return { ok: true };
  }
  function specialText(def) {
    const sp = def.special && Cards.SPECIALS[def.special]; if (!sp) return '';
    return sp.text.replace(/\{v\}/g, def.value);
  }

  function createGame(opts) {
    opts = opts || {};
    const now = opts.now || (() => Date.now());
    const rand = opts.rand || Math.random;
    const TURN_MS = opts.turnMs != null ? opts.turnMs : 60000;
    const AFK_MS = opts.afkMs != null ? opts.afkMs : 4000;
    const SUDDEN_TURNS = opts.suddenTurns != null ? opts.suddenTurns : 12; // turns per player before the maze collapses
    const { DEF, HERO } = SHARED;

    const G = {
      phase: 'lobby', players: [], turnId: null, plays: 0, wait: null, lastPlayed: null,
      log: [], chat: [], emotes: [], seq: 0, logSeq: 0, chatSeq: 0, emoteSeq: 0, playSeq: 0, uid: 0,
      winner: null, round: 0, hostId: null, turnCount: 0, sudden: false, startCount: 0, gameId: null,
    };
    const api = { G, onChange: () => {} };
    const P = (id) => G.players.find((p) => p.id === id);
    const alive = (p) => !!p && p.inGame && p.hp > 0;
    const living = () => G.players.filter(alive);
    const rivals = (p) => living().filter((q) => q.id !== p.id);
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    function log(text, sfx) { G.log.push({ id: ++G.logSeq, text, sfx: sfx || null }); if (G.log.length > 150) G.log.shift(); }
    function changed() { G.seq++; api.onChange(); }

    /* ---------- lobby ---------- */
    function addPlayer(id, name) {
      name = String(name || '').replace(/[<>]/g, '').trim().slice(0, 14) || 'Hero';
      let p = P(id);
      if (p) { p.connected = true; p.dcAt = null; changed(); return { ok: true }; }
      if (G.players.length >= MAX_ROOM) return { error: 'Room is full' };
      const base = name; let n = 2;
      while (G.players.some((q) => q.name.toLowerCase() === name.toLowerCase())) name = base.slice(0, 12) + n++;
      const used = G.players.map((q) => q.color);
      p = { id, name, color: COLORS.find((c) => !used.includes(c)) || COLORS[0], hero: null, ready: false, deckList: null, connected: true, dcAt: null,
        wins: 0, inGame: false, hp: 0, maxHp: 0, deck: [], hand: [], discard: [], shields: [], bubble: false };
      G.players.push(p);
      if (!G.hostId) G.hostId = id;
      log(`${name} joined${G.phase === 'play' ? ' (plays next round)' : ''}.`, 'join');
      changed();
      return { ok: true };
    }
    function setConnected(id, on) {
      const p = P(id); if (!p) return;
      if (!on && (G.phase !== 'play' || !p.inGame)) {
        G.players = G.players.filter((q) => q.id !== id);
        if (G.hostId === id && G.players[0]) G.hostId = G.players[0].id;
        log(`${p.name} left.`);
      } else {
        p.connected = on; p.dcAt = on ? null : now();
        log(on ? `${p.name} reconnected.` : `${p.name} disconnected.`);
      }
      changed();
    }
    function pickHero(pid, hero) {
      if (G.phase === 'play') return { error: 'Game in progress' };
      const p = P(pid);
      if (hero !== null && !HERO[hero]) return { error: 'Unknown hero' };
      if (hero && G.players.some((q) => q.id !== pid && q.hero === hero)) return { error: `${HERO[hero].name} is taken` };
      p.hero = hero; p.ready = false; p.deckList = null;
      return { ok: true };
    }
    function setReady(pid, on, deck) {
      if (G.phase === 'play') return { error: 'Game in progress' };
      const p = P(pid);
      if (on && !p.hero) return { error: 'Pick a hero first' };
      if (on && deck) { const r = validateDeck(p.hero, deck); if (r.error) return r; p.deckList = deck.slice(); }
      else if (on) p.deckList = null;
      p.ready = !!on;
      return { ok: true };
    }
    function roster() { return G.players.filter((p) => p.connected && p.hero && p.ready).slice(0, MAX_PLAYERS); }
    function startGame() {
      const r = roster();
      if (r.length < 2) return { error: 'Need 2+ ready heroes' };
      const notReady = G.players.filter((p) => p.connected && p.hero && !p.ready);
      if (notReady.length && r.length < MAX_PLAYERS) return { error: `Waiting for ${notReady.map((p) => p.name).join(', ')} to ready up` };
      G.players.forEach((p) => { p.inGame = false; p.deck = []; p.hand = []; p.discard = []; p.shields = []; p.bubble = false; p.hp = 0; });
      r.forEach((p) => {
        const h = HERO[p.hero];
        p.inGame = true; p.maxHp = h.maxHp || 10; p.hp = p.maxHp;
        (p.deckList || classicDeck(p.hero)).forEach((id) => p.deck.push({ uid: ++G.uid, key: id, owner: p.id }));
        shuffle(p.deck);
        draw(p, START_HAND);
      });
      G.round++; G.phase = 'play'; G.winner = null; G.lastPlayed = null; G.turnCount = 0; G.sudden = false; G.startCount = r.length;
      G.gameId = Math.floor(rand() * 1e9).toString(36) + G.round;
      log(`— Round ${G.round}: ${r.map((p) => `${p.name} (${HERO[p.hero].name}${p.deckList ? ', custom deck' : ''})`).join(' vs ')} —`, 'start');
      beginTurn(r[Math.floor(rand() * r.length)].id);
      return { ok: true };
    }
    function backToLobby() {
      if (G.phase === 'play') return { error: 'Game in progress' };
      G.phase = 'lobby'; G.wait = null; G.lastPlayed = null;
      G.players.forEach((p) => { p.ready = false; p.inGame = false; });
      return { ok: true };
    }

    /* ---------- cards ---------- */
    function draw(p, n) {
      for (let i = 0; i < n; i++) {
        if (!p.deck.length) { if (!p.discard.length) return; p.deck = shuffle(p.discard); p.discard = []; }
        p.hand.push(p.deck.pop());
      }
    }
    function discardCard(c) { (P(c.owner) || P(G.turnId)).discard.push(c); }
    function bigShieldIdx(t) { let bi = -1; t.shields.forEach((s, i) => { if (bi < 0 || s.dur > t.shields[bi].dur) bi = i; }); return bi; }
    function eliminate(t) {
      log(`☠ ${t.name} is knocked out!`, 'out');
      t.shields.forEach((s) => discardCard(s.c)); t.shields = [];
      t.hand.forEach(discardCard); t.hand = []; t.bubble = false;
    }
    function loseHp(t, n) { // direct HP loss, ignores shields (not bubble)
      if (!alive(t) || n <= 0 || t.bubble) return 0;
      const d = Math.min(n, t.hp); t.hp -= d;
      log(`${t.name} loses ${d} HP (${t.hp} left).`, 'hit');
      if (t.hp === 0) eliminate(t);
      return d;
    }
    function damage(t, n, pierce) {
      if (!alive(t) || n <= 0) return 0;
      if (t.bubble) { log(`${t.name}'s bubble shrugs it off.`, 'block'); return 0; }
      if (!pierce) {
        while (n > 0 && t.shields.length) {
          const s = t.shields[0]; const a = Math.min(s.dur, n);
          s.dur -= a; n -= a;
          if (s.dur <= 0) { t.shields.shift(); discardCard(s.c); log(`${t.name}'s ${DEF[s.c.key].name} breaks!`, 'break'); }
        }
      }
      if (n <= 0) { log(`${t.name}'s shield soaks it.`, 'block'); return 0; }
      t.hp = Math.max(0, t.hp - n);
      log(`${t.name} takes ${n} damage (${t.hp} HP left).`, 'hit');
      if (t.hp === 0) eliminate(t);
      return n;
    }
    function validTargets(pid, def) {
      const sp = def.special ? Cards.SPECIALS[def.special] : null;
      return living().filter((q) => q.id !== pid && !q.bubble && (!sp || !sp.needsShield || q.shields.length));
    }
    function flipAll() {
      let n = 0;
      G.players.forEach((q) => { q.shields.forEach((s) => discardCard(s.c)); n += q.shields.length; q.shields = []; });
      log(`The table goes flying! ${n} shield${n === 1 ? '' : 's'} destroyed.`, 'break');
    }

    /* ---------- SPECIALS (v = the card's value) ---------- */
    const SPECIALS = {
      tableflip() { flipAll(); },
      whirlwind(p, t, v) { rivals(p).forEach((q) => damage(q, v)); },
      bubble(p) { p.bubble = true; log(`${p.name} is safe in a bubble until their next turn.`, 'magic'); },
      smite(p, t, v) { if (t) damage(t, v, true); },
      shieldbreak(p, t) {
        if (!t || !t.shields.length) return;
        const s = t.shields.splice(bigShieldIdx(t), 1)[0]; discardCard(s.c);
        log(`${t.name}'s ${DEF[s.c.key].name} is destroyed.`, 'break');
      },
      yoink(p, t) {
        if (!t || !t.shields.length) return;
        const s = t.shields.splice(bigShieldIdx(t), 1)[0]; p.shields.push(s);
        log(`${p.name} yoinks ${t.name}'s ${DEF[s.c.key].name}!`, 'steal');
      },
      leech(p, t, v) {
        let got = 0; rivals(p).forEach((q) => { got += loseHp(q, v); });
        if (got) { p.hp = Math.min(p.maxHp, p.hp + got); log(`${p.name} heals ${got}.`, 'heal'); }
      },
      fireball(p, t, v) {
        rivals(p).forEach((q) => damage(q, v));
        if (p.hp > 1 && !p.bubble) { p.hp -= 1; log(`${p.name} singes themself (${p.hp} HP).`, 'hit'); }
      },
      swaphp(p, t) {
        if (!t) return; const a = p.hp, b = t.hp;
        p.hp = Math.min(p.maxHp, b); t.hp = Math.min(t.maxHp, a);
        log(`${p.name} and ${t.name} swap HP! (${p.hp} ↔ ${t.hp})`, 'magic');
      },
      chicken(p, t) {
        if (!t) return; const n = t.hand.length; t.hand.forEach(discardCard); t.hand = [];
        log(`${t.name} turns into a chicken and drops ${n} card${n === 1 ? '' : 's'}. Bawk.`, 'magic');
      },
      flipsmash(p, t, v) { flipAll(); if (t) damage(t, v); },
      berserk(p, t, v) { if (!t) return; const d = Math.max(1, Math.min(v, p.maxHp - p.hp)); log(`${p.name} goes BERSERK for ${d}!`, 'stab'); damage(t, d); },
      discard(p, t, v) {
        if (!t) return; let n = 0;
        for (let i = 0; i < v && t.hand.length; i++) { discardCard(t.hand.splice(Math.floor(rand() * t.hand.length), 1)[0]); n++; }
        log(`${t.name} drops ${n} card${n === 1 ? '' : 's'}.`, 'steal');
      },
      stealcard(p, t) {
        if (!t || !t.hand.length) { log('…but their hand is empty.'); return; }
        p.hand.push(t.hand.splice(Math.floor(rand() * t.hand.length), 1)[0]);
        log(`${p.name} swipes a card from ${t.name}!`, 'steal');
      },
      execute(p, t, v) {
        if (!t) return;
        if (t.hp <= v) { log(`${t.name} is in execute range!`, 'stab'); damage(t, v, true); } else damage(t, 1);
      },
      heist(p) {
        let n = 0; rivals(p).forEach((q) => { n += q.shields.length; p.shields.push(...q.shields); q.shields = []; });
        log(`${p.name} pulls off the heist: ${n} shield${n === 1 ? '' : 's'} stolen!`, 'steal');
      },
      surge(p) {
        const order = G.players.filter(alive); if (order.length < 2) return;
        const hands = order.map((q) => q.hand);
        order.forEach((q, i) => { q.hand = hands[(i - 1 + order.length) % order.length]; });
        log('Wild magic! Everyone passes their hand to the next player.', 'magic');
      },
    };

    /* ---------- turns ---------- */
    function beginTurn(id) {
      const p = P(id);
      G.turnId = id; p.bubble = false; G.plays = 1; G.turnPlays = 0;
      G.turnCount++;
      if (G.turnCount > SUDDEN_TURNS * G.startCount) {
        if (!G.sudden) { G.sudden = true; log('⚠ THE MAZE IS COLLAPSING! Falling rocks hit everyone at the start of their turn, harder every round.', 'quake'); }
        const rocks = 1 + Math.floor((G.turnCount - 1 - SUDDEN_TURNS * G.startCount) / G.startCount);
        p.hp -= rocks; log(`Falling rocks hit ${p.name} for ${rocks} (${Math.max(0, p.hp)} HP).`, 'hit');
        if (p.hp <= 0) { p.hp = 0; eliminate(p); return nextTurn(); }
      }
      draw(p, 1);
      if (!p.hand.length) draw(p, 2);
      G.wait = { kind: 'play', pid: id, deadline: now() + TURN_MS, since: now() };
    }
    function nextTurn() {
      if (checkOver()) return;
      const order = G.players.filter((p) => p.inGame);
      const i = order.findIndex((p) => p.id === G.turnId);
      for (let k = 1; k <= order.length; k++) { const q = order[(i + k) % order.length]; if (alive(q)) return beginTurn(q.id); }
    }
    function checkOver() {
      if (G.phase !== 'play') return true;
      const l = living();
      if (l.length > 1) return false;
      G.phase = 'over'; G.wait = null; G.turnId = null;
      if (l[0]) { l[0].wins++; G.winner = l[0].id; log(`★ ${l[0].name} wins round ${G.round}! ★`, 'win'); }
      G.players.forEach((p) => { p.ready = false; });
      return true;
    }

    function play(pid, uid, targetId) {
      const w = G.wait;
      if (G.phase !== 'play' || !w || w.kind !== 'play' || w.pid !== pid) return { error: 'Not your turn' };
      const p = P(pid);
      const hi = p.hand.findIndex((c) => c.uid === uid);
      if (hi < 0) return { error: 'Card not in hand' };
      const c = p.hand[hi]; const def = DEF[c.key];
      let t = null;
      if (needsTarget(def)) {
        const vt = validTargets(pid, def);
        if (vt.length === 1 && !targetId) t = vt[0];
        else if (vt.length) { t = vt.find((q) => q.id === targetId); if (!t) return { error: 'Pick a valid rival' }; }
      }
      p.hand.splice(hi, 1);
      G.lastPlayed = { id: ++G.playSeq, pid, key: c.key, target: t ? t.id : null };
      log(`${p.name} plays ${def.name}${t ? ' on ' + t.name : ''}.`, 'play');
      if (def.shield > 0) { p.shields.push({ c, dur: def.shield }); log(`${p.name} raises a ${def.shield}-point shield.`, 'shield'); }
      if (def.heal > 0) { const h = Math.min(def.heal, p.maxHp - p.hp); p.hp += h; log(h ? `${p.name} heals ${h} (${p.hp} HP).` : `${p.name} is already at full HP.`, h ? 'heal' : null); }
      if (def.draw > 0) { draw(p, def.draw); log(`${p.name} draws ${def.draw}.`, 'draw'); }
      if (def.attack > 0) { if (t) damage(t, def.attack); else log('…but there is nobody to hit.'); }
      if (def.special && SPECIALS[def.special]) SPECIALS[def.special](p, t, def.value);
      if (def.shield <= 0) discardCard(c);
      if (checkOver()) return { ok: true };
      G.plays = G.plays - 1 + (def.again || 0);
      G.turnPlays = (G.turnPlays || 0) + 1;
      if (G.plays > 0 && G.turnPlays >= MAX_PLAYS_PER_TURN) { G.plays = 0; log(`${p.name} is out of breath (max ${MAX_PLAYS_PER_TURN} plays per turn).`); }
      if (!p.hand.length) { draw(p, 2); if (p.hand.length) log(`${p.name}'s hand is empty, so they draw 2.`, 'draw'); }
      if (G.plays > 0 && p.hand.length) {
        if (def.again) log(`${p.name} gets to play again!`, 'again');
        G.wait = { kind: 'play', pid, deadline: now() + TURN_MS, since: now() };
      } else nextTurn();
      return { ok: true };
    }
    function autoPlay(p) {
      if (!p.hand.length) return nextTurn();
      const c = p.hand[Math.floor(rand() * p.hand.length)]; const def = DEF[c.key];
      const vt = validTargets(p.id, def);
      play(p.id, c.uid, vt.length ? vt[Math.floor(rand() * vt.length)].id : null);
    }
    function tick() {
      const w = G.wait; if (!w || G.phase !== 'play') return;
      const p = P(w.pid); const t = now();
      if (t >= w.deadline || (p && !p.connected && t - (p.dcAt || 0) > AFK_MS && t - w.since > 800)) {
        if (t >= w.deadline) log(`${p.name} ran out of time. A random card flies out of their hand!`);
        autoPlay(p); changed();
      }
    }

    function handle(pid, msg) {
      if (!msg || typeof msg !== 'object') return { error: 'bad' };
      const p = P(pid); if (!p) return { error: 'Not in room' };
      let r = { ok: true };
      switch (msg.t) {
        case 'hero': r = pickHero(pid, msg.hero == null ? null : String(msg.hero)); break;
        case 'ready': r = setReady(pid, msg.on, msg.deck); break;
        case 'start': case 'rematch':
          if (pid !== G.hostId) return { error: 'Only the host can start' };
          if (G.phase === 'play') return { error: 'Game running' };
          if (msg.t === 'rematch') G.players.forEach((q) => { if (q.hero && q.connected) q.ready = true; });
          r = startGame(); break;
        case 'lobby':
          if (pid !== G.hostId) return { error: 'Only the host can do that' };
          r = backToLobby(); break;
        case 'play': r = play(pid, msg.uid, msg.target); break;
        case 'chat': {
          const text = String(msg.text || '').trim().slice(0, 200); if (!text) return { error: 'empty' };
          G.chat.push({ id: ++G.chatSeq, pid, name: p.name, color: p.color, text }); if (G.chat.length > 80) G.chat.shift(); break;
        }
        case 'emote': G.emotes.push({ id: ++G.emoteSeq, pid, e: String(msg.e || '').slice(0, 12) }); if (G.emotes.length > 12) G.emotes.shift(); break;
        default: return { error: 'unknown' };
      }
      if (!r.error) changed();
      return r;
    }

    function view(pid) {
      const w = G.wait;
      return {
        you: pid, hostId: G.hostId, phase: G.phase, round: G.round, gameId: G.gameId, turn: G.turnId, plays: G.plays, winner: G.winner, seq: G.seq,
        sudden: !!G.sudden, rocks: G.sudden ? 1 + Math.floor((G.turnCount - 1 - SUDDEN_TURNS * G.startCount) / G.startCount) : 0,
        turnsLeft: G.phase === 'play' ? Math.max(0, SUDDEN_TURNS * G.startCount - G.turnCount) : null,
        lastPlayed: G.lastPlayed,
        players: G.players.map((p) => ({
          id: p.id, name: p.name, color: p.color, hero: p.hero, ready: p.ready, custom: !!p.deckList, connected: p.connected, wins: p.wins, inGame: p.inGame,
          hp: p.hp, maxHp: p.maxHp, alive: alive(p), bubble: p.bubble, deck: p.deck.length, discard: p.discard.length,
          shields: p.shields.map((s) => ({ key: s.c.key, dur: s.dur })),
          handCount: p.hand.length,
          hand: p.id === pid ? p.hand.map((c) => ({ uid: c.uid, key: c.key })) : null,
        })),
        wait: w ? { kind: w.kind, pid: w.pid, remaining: Math.max(0, w.deadline - now()), total: TURN_MS } : null,
        log: G.log.slice(-60), chat: G.chat.slice(-60), emotes: G.emotes.slice(),
      };
    }

    Object.assign(api, { addPlayer, setConnected, handle, tick, view, DEF, HERO, validTargets });
    return api;
  }

  const Engine = { createGame, buildDefs: () => SHARED, needsTarget, classicDeck, validateDeck, specialText, MAX_PLAYERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
