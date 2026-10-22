/* =====================================================================
   BONAMAZE: HEROES, CARDS & ECONOMY
   ---------------------------------------------------------------------
   This is the file to edit to add or change cards, heroes and the gacha.

   Each card is one line:
     { id: 'g_punch', name: 'Punch', rarity: 'basic', count: 2, attack: 2, text: 'flavor' }

   id       unique and NEVER change it once players own the card (collections are saved by id)
   rarity   basic (in the classic deck, always owned) | common | rare | epic | legendary
   count    basic cards only: copies in the hero's classic deck

   Building blocks (leave out any you don't need):
     attack  N   deal N damage to one rival (their shields soak it first)
     shield  N   put this card in front of you as a shield that soaks N damage
     heal    N   heal N HP (max HP is set per hero)
     draw    N   draw N cards
     again   N   play N more cards this turn
     special     one of the SPECIALS at the bottom (or leave out)
     value   N   the number used by the special, e.g. whirlwind value 3 = 3 damage to every rival

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
        // classic deck
        { id: 'g_bigswing',   name: 'Big Swing',     rarity: 'basic', count: 1, attack: 3, text: 'Aim? Never heard of it.' },
        { id: 'g_punch',      name: 'Punch',         rarity: 'basic', count: 2, attack: 2, text: 'Classic. Timeless. Painful.' },
        { id: 'g_headbutt',   name: 'Headbutt',      rarity: 'basic', count: 3, attack: 1, again: 1, text: 'Ow. Again!' },
        { id: 'g_spiked',     name: 'Spiked Shield', rarity: 'basic', count: 2, shield: 3, text: 'Hug me, I dare you.' },
        { id: 'g_meat',       name: 'Meat Snack',    rarity: 'basic', count: 3, heal: 2, text: 'Mystery meat. Do not ask.' },
        { id: 'g_flex',       name: 'Flex',          rarity: 'basic', count: 2, draw: 1, again: 1, text: 'Look at these guns.' },
        { id: 'g_wind2',      name: 'Second Wind',   rarity: 'basic', count: 2, heal: 1, again: 1, text: 'Huff. Puff. Smash.' },
        { id: 'g_tableflip',  name: 'Table Flip',    rarity: 'basic', count: 2, special: 'tableflip', text: 'Nobody gets shields. NOBODY.' },
        { id: 'g_whirlwind',  name: 'Whirlwind',     rarity: 'basic', count: 3, special: 'whirlwind', value: 2, text: 'Spin to win.' },
        // collectible
        { id: 'g_sandwich',   name: 'Knuckle Sandwich', rarity: 'common', attack: 2, heal: 1, text: 'Lunch is served.' },
        { id: 'g_yell',       name: 'Angry Yell',    rarity: 'common', attack: 1, draw: 1, text: 'AAAAAAAA.' },
        { id: 'g_belly',      name: 'Big Belly',     rarity: 'common', shield: 2, heal: 1, text: 'Natural armor.' },
        { id: 'g_doubleaxe',  name: 'Double Axe',    rarity: 'rare', attack: 2, again: 1, text: 'Two axes. Zero plans.' },
        { id: 'g_barfight',   name: 'Bar Fight',     rarity: 'rare', special: 'whirlwind', value: 1, again: 1, text: 'Somebody threw a chair.' },
        { id: 'g_rampage',    name: 'Rampage',       rarity: 'epic', attack: 4, text: 'He saw a spider.' },
        { id: 'g_flipsmash',  name: 'Toss the Table',rarity: 'epic', special: 'flipsmash', value: 2, text: 'With the table. At you.' },
        { id: 'g_berserk',    name: 'BERSERK',       rarity: 'legendary', special: 'berserk', value: 6, text: 'The angrier he gets, the angrier he gets.' },
      ],
    },
    {
      id: 'bonk', name: 'Sister Bonk', title: 'the Paladin', color: '#ffd23f', maxHp: 11,
      style: 'Shields up, prayers out. Very hard to kill.',
      sprite: ['................', '.....yyyyyy.....', '....yWWWWWWy....', '...yWWWyyWWWy...', '...WWWWyyWWWW...', '...WWssssssWW...',
        '...WssksskssW...', '...WsssSSsssW...', '....WssrrssW....', '.....wwwwww.....', '...ywwwyywwwy...', '..yywwyyyywwyy..',
        '..wwwwwyywwwww..', '..wwWwwyywwWww..', '..wwWwwwwwwWww..', '..WWWWWWWWWWWW..'],
      cards: [
        { id: 'b_holybonk',   name: 'Holy Bonk',     rarity: 'basic', count: 5, attack: 2, text: 'Bonk, in the name of good.' },
        { id: 'b_polite',     name: 'Polite Bonk',   rarity: 'basic', count: 3, attack: 1, again: 1, text: 'Sorry! (bonk)' },
        { id: 'b_bigshield',  name: 'Big Shield',    rarity: 'basic', count: 4, shield: 3, text: 'It is mostly a door.' },
        { id: 'b_pocket',     name: 'Pocket Shield', rarity: 'basic', count: 3, shield: 1, again: 1, text: 'Fits in any pocket.' },
        { id: 'b_prayer',     name: 'Prayer',        rarity: 'basic', count: 3, heal: 2, text: 'Please. Pretty please.' },
        { id: 'b_bless',      name: 'Bless You',     rarity: 'basic', count: 2, heal: 1, draw: 1, text: 'Did someone sneeze?' },
        { id: 'b_inspire',    name: 'Inspire',       rarity: 'basic', count: 1, draw: 2, text: 'You can do it! (I can do it.)' },
        { id: 'b_bubble',     name: 'Holy Bubble',   rarity: 'basic', count: 2, special: 'bubble', text: 'Bubble time. No touching.' },
        { id: 'b_judgment',   name: 'Judgment',      rarity: 'basic', count: 3, special: 'smite', value: 2, text: 'Shields cannot save you from paperwork.' },
        { id: 'b_gentle',     name: 'Gentle Bonk',   rarity: 'common', attack: 1, heal: 1, text: 'A bonk, but with love.' },
        { id: 'b_kite',       name: 'Kite Shield',   rarity: 'common', shield: 2, text: 'Pointy at the bottom.' },
        { id: 'b_hymn',       name: 'Hymn',          rarity: 'common', heal: 1, again: 1, text: 'La la la (bonk).' },
        { id: 'b_fortress',   name: 'Fortress',      rarity: 'rare', shield: 4, text: 'She lives here now.' },
        { id: 'b_smite3',     name: 'Smite Harder',  rarity: 'rare', special: 'smite', value: 3, text: 'Judgment, but louder.' },
        { id: 'b_wall',       name: 'Divine Wall',   rarity: 'epic', shield: 2, draw: 1, again: 1, text: 'Built by angels. Up to code.' },
        { id: 'b_miracle',    name: 'Miracle',       rarity: 'epic', heal: 4, text: 'Nobody saw that coming.' },
        { id: 'b_avatar',     name: 'Avatar of Bonk',rarity: 'legendary', shield: 2, heal: 2, special: 'bubble', text: 'Behold. The final bonk.' },
      ],
    },
    {
      id: 'pip', name: 'Pip', title: 'the Rogue', color: '#5fd068', maxHp: 11,
      style: 'Plays lots of cards per turn. Steals your stuff.',
      sprite: ['................', '......GGGG......', '.....GggggG.....', '....GggggggG....', '....GgsssssG....', '....GkkkkkkG....',
        '....GkwkkwkG....', '....GssssssG....', '.....ssSSss.....', '......ssss......', '....ggnnnngg....', '...gggnggggg.nn.',
        '...ggggngggg.nyn', '...Gggggngggnnyn', '...GGgggggnGGnnn', '...GGGGGGGGG....'],
      cards: [
        { id: 'p_stab',       name: 'Stab',          rarity: 'basic', count: 5, attack: 1, again: 1, text: 'Stab stab stab.' },
        { id: 'p_backstab',   name: 'Backstab',      rarity: 'basic', count: 5, attack: 2, text: 'Behind you.' },
        { id: 'p_cloak',      name: 'Cloak',         rarity: 'basic', count: 3, shield: 2, text: 'You cannot see me (you can).' },
        { id: 'p_hidden',     name: 'Hidden Blade',  rarity: 'basic', count: 3, shield: 1, attack: 1, text: 'Pointy on both ends.' },
        { id: 'p_quick',      name: 'Quick Fingers', rarity: 'basic', count: 2, draw: 2, text: 'Is that my card? It is now.' },
        { id: 'p_double',     name: 'Double Time',   rarity: 'basic', count: 2, draw: 1, again: 1, text: 'Zoom.' },
        { id: 'p_bandage',    name: 'Bandage',       rarity: 'basic', count: 2, heal: 1, again: 1, text: 'Walk it off.' },
        { id: 'p_shank',      name: 'Shank the Shield', rarity: 'basic', count: 2, special: 'shieldbreak', text: 'Your shield has a weak spot. It is everywhere.' },
        { id: 'p_yoink',      name: 'Yoink!',        rarity: 'basic', count: 2, special: 'yoink', text: 'Finders keepers.' },
        { id: 'p_sticky',     name: 'Sticky Fingers',rarity: 'basic', count: 2, special: 'leech', value: 1, text: 'A little from everyone.' },
        { id: 'p_flick',      name: 'Flick',         rarity: 'common', attack: 1, draw: 1, text: 'Right on the ear.' },
        { id: 'p_tripwire',   name: 'Trip Wire',     rarity: 'common', shield: 1, draw: 1, text: 'Watch your step.' },
        { id: 'p_sand',       name: 'Pocket Sand',   rarity: 'common', special: 'discard', value: 1, text: 'Sha-sha-sha!' },
        { id: 'p_pickpocket', name: 'Pickpocket',    rarity: 'rare', special: 'stealcard', text: "Thanks, I'll hold onto that." },
        { id: 'p_twin',       name: 'Twin Daggers',  rarity: 'rare', attack: 1, again: 1, draw: 1, text: 'Left. Right. Left again.' },
        { id: 'p_assassin',   name: 'Assassinate',   rarity: 'epic', special: 'execute', value: 4, text: 'Nothing personal.' },
        { id: 'p_vanish',     name: 'Vanish',        rarity: 'epic', special: 'bubble', draw: 1, text: 'Poof. (Pip is behind the curtain.)' },
        { id: 'p_heist',      name: 'Heist of the Century', rarity: 'legendary', special: 'heist', text: 'All your shields are belong to Pip.' },
      ],
    },
    {
      id: 'zappo', name: 'Zappo', title: 'the Wizard', color: '#5a8cff', maxHp: 10,
      style: 'Draws tons of cards. Chaos magic, mostly on purpose.',
      sprite: ['.......b......c.', '......bb.....ccc', '......bbb.....c.', '.....bbybb....n.', '....bbbbbbb...n.', '...BBBBBBBBB..n.',
        '....sssssss...n.', '....sksssks...n.', '....wwwwwww...n.', '.....wwwwww..sn.', '...bbbwwwbbbbsn.', '..bbbbbwbbbbb.n.',
        '..bbbbbbbbbbb.n.', '..bbBbbbbbBbb.n.', '..bbBbbbbbBbb.n.', '..BBBBBBBBBBB.n.'],
      cards: [
        { id: 'z_missile',    name: 'Magic Missile', rarity: 'basic', count: 5, attack: 2, text: 'It never misses. Mostly.' },
        { id: 'z_zap',        name: 'Zap',           rarity: 'basic', count: 4, attack: 1, draw: 1, text: 'Bzzt.' },
        { id: 'z_ward',       name: 'Arcane Ward',   rarity: 'basic', count: 3, shield: 2, draw: 1, text: 'A wall of very stern sparkles.' },
        { id: 'z_study',      name: 'Study',         rarity: 'basic', count: 2, draw: 2, again: 1, text: 'Page 394: how to win.' },
        { id: 'z_potion',     name: 'Potion',        rarity: 'basic', count: 2, heal: 2, draw: 1, text: 'Tastes purple.' },
        { id: 'z_brain',      name: 'Brain Blast',   rarity: 'basic', count: 3, attack: 1, again: 1, text: 'Thinking hurts. You, mostly.' },
        { id: 'z_surge',      name: 'Mana Surge',    rarity: 'basic', count: 2, draw: 1, again: 1, text: 'Unlimited power! (limited)' },
        { id: 'z_fireball',   name: 'Fireball (Unsafe)', rarity: 'basic', count: 3, special: 'fireball', value: 3, text: 'The "unsafe" part is you.' },
        { id: 'z_swap',       name: 'Oops, Swap!',   rarity: 'basic', count: 1, special: 'swaphp', text: 'Wrong spell. Right result.' },
        { id: 'z_chicken',    name: 'Chickenify',    rarity: 'basic', count: 2, special: 'chicken', text: 'Bawk.' },
        { id: 'z_spark',      name: 'Spark',         rarity: 'common', attack: 1, again: 1, text: 'Tiny but rude.' },
        { id: 'z_scroll',     name: 'Old Scroll',    rarity: 'common', draw: 2, text: 'Smells like grandpa.' },
        { id: 'z_manashield', name: 'Mana Shield',   rarity: 'common', shield: 1, draw: 1, text: 'Shimmery.' },
        { id: 'z_chain',      name: 'Chain Lightning', rarity: 'rare', special: 'whirlwind', value: 1, draw: 1, text: 'It bounces. A lot.' },
        { id: 'z_freeze',     name: 'Brain Freeze',  rarity: 'rare', special: 'discard', value: 2, text: 'Too much ice cream.' },
        { id: 'z_meteor',     name: 'Meteor (Very Unsafe)', rarity: 'epic', special: 'fireball', value: 4, again: 0, text: 'Do not look up.' },
        { id: 'z_timewarp',   name: 'Time Warp',     rarity: 'epic', again: 2, text: 'Wait, it is my turn again?' },
        { id: 'z_wild',       name: 'Wild Magic Surge', rarity: 'legendary', special: 'surge', again: 1, text: 'Everybody pass your hand left. Now.' },
      ],
    },
  ];

  /* Neutral cards: any hero can put these in a custom deck. */
  const NEUTRAL = {
    id: 'neutral', name: 'Neutral', color: '#c070ff',
    sprite: ['................', '................', '...nnnnnnnnnn...', '..nNNNNNNNNNNn..', '..nNnnnnnnnnNn..', '..nNnnnnnnnnNn..',
      '..yyyyyyyyyyyy..', '..yYYYYyyYYYYy..', '..nnnnnykynnnn..', '..nNnnnyyynnNn..', '..nNnnnnnnnnNn..', '..nNnnnnnnnnNn..',
      '..nNNNNNNNNNNn..', '..yyyyyyyyyyyy..', '................', '................'],
    cards: [
      { id: 'n_sword',   name: 'Rusty Sword',     rarity: 'common', attack: 2, text: 'Tetanus included.' },
      { id: 'n_wshield', name: 'Wooden Shield',   rarity: 'common', shield: 2, text: 'Splinters are a feature.' },
      { id: 'n_herb',    name: 'Healing Herb',    rarity: 'common', heal: 2, text: 'Probably not poison.' },
      { id: 'n_coffee',  name: 'Coffee',          rarity: 'common', draw: 1, again: 1, text: 'Fourth cup.' },
      { id: 'n_rock',    name: 'A Rock',          rarity: 'common', attack: 1, draw: 1, text: 'It is a rock.' },
      { id: 'n_mimic',   name: 'Mimic Chest',     rarity: 'rare', special: 'stealcard', text: 'It bites. Then it borrows.' },
      { id: 'n_trap',    name: 'Bear Trap',       rarity: 'rare', shield: 2, attack: 1, text: 'Snap.' },
      { id: 'n_speed',   name: 'Potion of Speed', rarity: 'rare', draw: 1, again: 1, text: 'Gotta go fast.' },
      { id: 'n_banana',  name: 'Banana Peel',     rarity: 'rare', special: 'discard', value: 1, again: 1, text: 'Classic.' },
      { id: 'n_goblins', name: 'Goblin Mob',      rarity: 'epic', special: 'whirlwind', value: 2, text: 'They work for snacks.' },
      { id: 'n_phoenix', name: 'Phoenix Feather', rarity: 'epic', heal: 3, draw: 1, text: 'Warm and fluffy.' },
      { id: 'n_crown',   name: 'The Bonamaze Crown', rarity: 'legendary', heal: 2, draw: 2, again: 1, text: 'Heavy is the head. Also shiny.' },
    ],
  };

  /* Specials. {v} in the text is replaced by the card's `value`.
     target: needs a rival picked. Logic lives in engine.js (search "SPECIALS"). */
  const SPECIALS = {
    tableflip:   { target: false, text: 'Destroy ALL shields in play (yours too).' },
    whirlwind:   { target: false, value: 2, text: 'Deal {v} damage to every rival.' },
    bubble:      { target: false, text: 'Until your next turn, you take no damage and cannot be targeted.' },
    smite:       { target: true,  value: 2, text: 'Deal {v} damage to a rival, ignoring shields.' },
    shieldbreak: { target: true,  text: "Destroy a rival's biggest shield.", needsShield: true },
    yoink:       { target: true,  text: "Steal a rival's biggest shield and put it in front of you.", needsShield: true },
    leech:       { target: false, value: 1, text: 'Every rival loses {v} HP (ignores shields). Heal that much.' },
    fireball:    { target: false, value: 3, text: 'Deal {v} damage to every rival and 1 to yourself (cannot drop you below 1).' },
    swaphp:      { target: true,  text: 'Swap your HP with a rival.' },
    chicken:     { target: true,  text: 'A rival discards their whole hand.' },
    flipsmash:   { target: true,  value: 2, text: 'Destroy ALL shields in play, then deal {v} damage to a rival.' },
    berserk:     { target: true,  value: 6, text: 'Deal damage equal to your missing HP (at least 1, at most {v}).' },
    discard:     { target: true,  value: 1, text: 'A rival discards {v} random card(s).' },
    stealcard:   { target: true,  text: "Steal a random card from a rival's hand." },
    execute:     { target: true,  value: 4, text: 'If the rival has {v} HP or less, deal {v} (ignores shields). Otherwise deal 1.' },
    heist:       { target: false, text: 'Steal EVERY shield from every rival.' },
    surge:       { target: false, text: 'Every player passes their hand to the next player.' },
  };

  /* Gacha + deckbuilding settings */
  const ECONOMY = {
    startPacks: 3,          // free packs for a brand-new player
    dailyPacks: 1,          // free packs per day
    winGems: 100, lossGems: 40,
    packCost: 100, packSize: 5,
    odds: { common: 0.70, rare: 0.22, epic: 0.065, legendary: 0.015 },
    pity: 20,               // a legendary is guaranteed within this many packs
    maxCopies: { basic: 3, common: 3, rare: 2, epic: 1, legendary: 1 },
    dupeShards: { common: 5, rare: 20, epic: 80, legendary: 300 },
    craftCost: { common: 40, rare: 100, epic: 400, legendary: 1600 },
    deckSize: 20,
  };
  const RARITY = {
    basic:     { name: 'Basic',     color: '#8a90b0' },
    common:    { name: 'Common',    color: '#d0d4e8' },
    rare:      { name: 'Rare',      color: '#4aa8ff' },
    epic:      { name: 'Epic',      color: '#c070ff' },
    legendary: { name: 'Legendary', color: '#ffb340' },
  };

  const Cards = { PALETTE, HEROES, NEUTRAL, SPECIALS, ECONOMY, RARITY };
  if (typeof module !== 'undefined' && module.exports) module.exports = Cards;
  else root.Cards = Cards;
})(typeof window !== 'undefined' ? window : globalThis);
