/* =====================================================================
   BONAMAZE: HEROES & CARDS
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to add or change cards/heroes.

   Each card is one line:
     { name: 'Card Name', count: 3, attack: 2, shield: 0, heal: 0, draw: 0, again: 0, special: null, text: 'flavor' }

   Building blocks (leave out any you don't need):
     attack  N   deal N damage to one rival (their shields soak it first)
     shield  N   put this card in front of you as a shield that soaks N damage
     heal    N   heal N HP (max HP is set per hero)
     draw    N   draw N cards
     again   N   play N more cards this turn
     special     one of the SPECIALS listed at the bottom (or null)

   Adding a hero: copy a hero block, give it a new id, colours and sprite.
   Sprites are 16x16 pixel grids, letters map to the PALETTE below.
   ===================================================================== */
(function (root) {
  const PALETTE = {
    k: '#1a1020', s: '#f2c08a', S: '#c98a5a', y: '#ffd23f', Y: '#c99a1a', r: '#d63c3c', R: '#8a1e2a',
    o: '#e8742c', b: '#3b6fd6', B: '#23408a', p: '#8a4fd6', P: '#4f2a8a', g: '#3fae5a', G: '#23703a',
    w: '#f4f0e8', W: '#b8b0c8', d: '#6a6478', D: '#3a3448', n: '#8a5a34', N: '#5a3820', c: '#6fe0e8',
  };

  const HEROES = [
    {
      id: 'grukk', name: 'Grukk', title: 'the Barbarian', color: '#e05a4f', maxHp: 10,
      style: 'Hits hard, thinks later. Big attacks and flips tables.',
      sprite: ['................', '.w............w.', '.ww..dddddd..ww.', '..wwddddddddww..', '...dddddddddd...', '...ssssssssss...',
        '...ssksssskss...', '...ssssSSssss...', '...oooooooooo...', '..sSooooooooSs..', '.sssSooooooSsss.', '.ssssnnnnnnssss.',
        '.ss.snnyynns.ss.', '.ss.NNNNNNNN.ss.', '....NNN..NNN....', '....kkk..kkk....'],
      cards: [
        { name: 'Big Swing',     count: 1, attack: 3, text: 'Aim? Never heard of it.' },
        { name: 'Punch',         count: 2, attack: 2, text: 'Classic. Timeless. Painful.' },
        { name: 'Headbutt',      count: 3, attack: 1, again: 1, text: 'Ow. Again!' },
        { name: 'Spiked Shield', count: 2, shield: 3, text: 'Hug me, I dare you.' },
        { name: 'Meat Snack',    count: 3, heal: 2, text: 'Mystery meat. Do not ask.' },
        { name: 'Flex',          count: 2, draw: 1, again: 1, text: 'Look at these guns.' },
        { name: 'Second Wind',   count: 2, heal: 1, again: 1, text: 'Huff. Puff. Smash.' },
        { name: 'Table Flip',    count: 2, special: 'tableflip', text: 'Nobody gets shields. NOBODY.' },
        { name: 'Whirlwind',     count: 3, special: 'whirlwind', text: 'Spin to win.' },
      ],
    },
    {
      id: 'bonk', name: 'Sister Bonk', title: 'the Paladin', color: '#ffd23f', maxHp: 11,
      style: 'Shields up, prayers out. Very hard to kill.',
      sprite: ['................', '.....yyyyyy.....', '....yWWWWWWy....', '...yWWWyyWWWy...', '...WWWWyyWWWW...', '...WWssssssWW...',
        '...WssksskssW...', '...WsssSSsssW...', '....WssrrssW....', '.....wwwwww.....', '...ywwwyywwwy...', '..yywwyyyywwyy..',
        '..wwwwwyywwwww..', '..wwWwwyywwWww..', '..wwWwwwwwwWww..', '..WWWWWWWWWWWW..'],
      cards: [
        { name: 'Holy Bonk',    count: 5, attack: 2, text: 'Bonk, in the name of good.' },
        { name: 'Polite Bonk',  count: 3, attack: 1, again: 1, text: 'Sorry! (bonk)' },
        { name: 'Big Shield',   count: 4, shield: 3, text: 'It is mostly a door.' },
        { name: 'Pocket Shield',count: 3, shield: 1, again: 1, text: 'Fits in any pocket.' },
        { name: 'Prayer',       count: 3, heal: 2, text: 'Please. Pretty please.' },
        { name: 'Bless You',    count: 2, heal: 1, draw: 1, text: 'Did someone sneeze?' },
        { name: 'Inspire',      count: 1, draw: 2, text: 'You can do it! (I can do it.)' },
        { name: 'Holy Bubble',  count: 2, special: 'bubble', text: 'Bubble time. No touching.' },
        { name: 'Judgment',     count: 3, special: 'smite', text: 'Shields cannot save you from paperwork.' },
      ],
    },
    {
      id: 'pip', name: 'Pip', title: 'the Rogue', color: '#5fd068', maxHp: 11,
      style: 'Plays lots of cards per turn. Steals your stuff.',
      sprite: ['................', '......GGGG......', '.....GggggG.....', '....GggggggG....', '....GgsssssG....', '....GkkkkkkG....',
        '....GkwkkwkG....', '....GssssssG....', '.....ssSSss.....', '......ssss......', '....ggnnnngg....', '...gggnggggg.nn.',
        '...ggggngggg.nyn', '...Gggggngggnnyn', '...GGgggggnGGnnn', '...GGGGGGGGG....'],
      cards: [
        { name: 'Stab',             count: 5, attack: 1, again: 1, text: 'Stab stab stab.' },
        { name: 'Backstab',         count: 5, attack: 2, text: 'Behind you.' },
        { name: 'Cloak',            count: 3, shield: 2, text: 'You cannot see me (you can).' },
        { name: 'Hidden Blade',     count: 3, shield: 1, attack: 1, text: 'Pointy on both ends.' },
        { name: 'Quick Fingers',    count: 2, draw: 2, text: 'Is that my card? It is now.' },
        { name: 'Double Time',      count: 2, draw: 1, again: 1, text: 'Zoom.' },
        { name: 'Bandage',          count: 2, heal: 1, again: 1, text: 'Walk it off.' },
        { name: 'Shank the Shield', count: 2, special: 'shieldbreak', text: 'Your shield has a weak spot. It is everywhere.' },
        { name: 'Yoink!',           count: 2, special: 'yoink', text: 'Finders keepers.' },
        { name: 'Sticky Fingers',   count: 2, special: 'leech', text: 'A little from everyone.' },
      ],
    },
    {
      id: 'zappo', name: 'Zappo', title: 'the Wizard', color: '#5a8cff', maxHp: 10,
      style: 'Draws tons of cards. Chaos magic, mostly on purpose.',
      sprite: ['.......b......c.', '......bb.....ccc', '......bbb.....c.', '.....bbybb....n.', '....bbbbbbb...n.', '...BBBBBBBBB..n.',
        '....sssssss...n.', '....sksssks...n.', '....wwwwwww...n.', '.....wwwwww..sn.', '...bbbwwwbbbbsn.', '..bbbbbwbbbbb.n.',
        '..bbbbbbbbbbb.n.', '..bbBbbbbbBbb.n.', '..bbBbbbbbBbb.n.', '..BBBBBBBBBBB.n.'],
      cards: [
        { name: 'Magic Missile',    count: 5, attack: 2, text: 'It never misses. Mostly.' },
        { name: 'Zap',              count: 4, attack: 1, draw: 1, text: 'Bzzt.' },
        { name: 'Arcane Ward',      count: 3, shield: 2, draw: 1, text: 'A wall of very stern sparkles.' },
        { name: 'Study',            count: 2, draw: 2, again: 1, text: 'Page 394: how to win.' },
        { name: 'Potion',           count: 2, heal: 2, draw: 1, text: 'Tastes purple.' },
        { name: 'Brain Blast',      count: 3, attack: 1, again: 1, text: 'Thinking hurts. You, mostly.' },
        { name: 'Mana Surge',       count: 2, draw: 1, again: 1, text: 'Unlimited power! (limited)' },
        { name: 'Fireball (Unsafe)',count: 3, special: 'fireball', text: 'The "unsafe" part is you.' },
        { name: 'Oops, Swap!',      count: 1, special: 'swaphp', text: 'Wrong spell. Right result.' },
        { name: 'Chickenify',       count: 2, special: 'chicken', text: 'Bawk.' },
      ],
    },
  ];

  /* Specials: what each special does. `target` = needs a rival picked.
     The game logic for each lives in engine.js (search "SPECIALS"). */
  const SPECIALS = {
    tableflip:   { target: false, text: 'Destroy ALL shields in play (yours too).' },
    whirlwind:   { target: false, text: 'Deal 2 damage to every rival.' },
    bubble:      { target: false, text: 'Until your next turn, you take no damage and cannot be targeted.' },
    smite:       { target: true,  text: 'Deal 2 damage to a rival, ignoring shields.' },
    shieldbreak: { target: true,  text: "Destroy a rival's biggest shield.", needsShield: true },
    yoink:       { target: true,  text: "Steal a rival's biggest shield and put it in front of you.", needsShield: true },
    leech:       { target: false, text: 'Every rival loses 1 HP (ignores shields). Heal that much.' },
    fireball:    { target: false, text: 'Deal 3 damage to every rival and 1 to yourself (cannot drop you below 1).' },
    swaphp:      { target: true,  text: 'Swap your HP with a rival.' },
    chicken:     { target: true,  text: 'A rival discards their whole hand.' },
  };

  const Cards = { PALETTE, HEROES, SPECIALS };
  if (typeof module !== 'undefined' && module.exports) module.exports = Cards;
  else root.Cards = Cards;
})(typeof window !== 'undefined' ? window : globalThis);
