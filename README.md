# BONAMAZE

A silly 8-bit fantasy card brawl for 2–4 friends. Pick a hero, play cards, be the last one standing.

**Play:** https://hyperas-100.github.io/bonamaze/

One person clicks **Create room** and shares the link. Everyone picks a hero, hits **Ready**, and the host starts.
It runs peer-to-peer in the browser (no server, no accounts), so the host must keep their tab open.

## Collection & packs (v2)

- Win a game: +100 gems. Lose: +40. A pack costs 100 gems. New players get 3 free packs, plus 1 free pack per day.
- Packs have 5 cards, at least one Rare or better. A Legendary is guaranteed within 20 packs.
- Copies beyond what you can use become shards. Spend shards to craft any missing card.
- Build a custom 20-card deck per hero (hero cards + neutral cards). Max copies: Basic/Common 3, Rare 2, Epic/Legendary 1. The classic deck is always available.
- Collections are saved in your browser. Use **Copy backup code** / **Restore from code** to move between devices.
- All gacha numbers (odds, prices, rewards, deck size) live in `ECONOMY` at the bottom of `cards.js`.

## Editing cards and heroes

Everything lives in **`cards.js`**. Each card is one line:

```js
{ id: 'g_bigswing', name: 'Big Swing', rarity: 'basic', count: 1, attack: 3, text: 'Aim? Never heard of it.' },
```

| Key | What it does |
|---|---|
| `attack` | Deal N damage to one rival (shields soak it first) |
| `shield` | Card stays in front of you and soaks N damage |
| `heal` | Heal N HP |
| `draw` | Draw N cards |
| `again` | Play N more cards this turn |
| `special` | One of the specials listed at the bottom of `cards.js` |
| `count` | Basic cards: copies in the classic deck |
| `rarity` | basic, common, rare, epic or legendary |
| `id` | Unique id. Never change it once people own the card |
| `value` | Number used by the special (e.g. whirlwind value 3) |

To add a hero, copy a hero block, change the `id`, name, colour, HP and the 16×16 pixel `sprite` (letters map to the palette at the top of the file).
New special effects need a few lines in `engine.js` (search for `SPECIALS`).

## Files

- `index.html`: UI, sounds, networking
- `engine.js`: game rules (runs on the host)
- `cards.js`: heroes, cards, gacha settings
- `collection.js`: gems, packs, crafting, decks (saved in the browser)
- `peerjs.min.js`: peer-to-peer library (PeerJS, MIT)

Test locally with several tabs: serve the folder (`python3 -m http.server`) and open `index.html?net=local`.
