# BONAMAZE

A silly 8-bit fantasy card brawl for 2–4 friends. Pick a hero, play cards, be the last one standing.

**Play:** https://hyperas-100.github.io/bonamaze/

One person clicks **Create room** and shares the link. Everyone picks a hero, hits **Ready**, and the host starts.
It runs peer-to-peer in the browser (no server, no accounts), so the host must keep their tab open.

## Editing cards and heroes

Everything lives in **`cards.js`**. Each card is one line:

```js
{ name: 'Big Swing', count: 1, attack: 3, text: 'Aim? Never heard of it.' },
```

| Key | What it does |
|---|---|
| `attack` | Deal N damage to one rival (shields soak it first) |
| `shield` | Card stays in front of you and soaks N damage |
| `heal` | Heal N HP |
| `draw` | Draw N cards |
| `again` | Play N more cards this turn |
| `special` | One of the specials listed at the bottom of `cards.js` |
| `count` | How many copies are in the deck |

To add a hero, copy a hero block, change the `id`, name, colour, HP and the 16×16 pixel `sprite` (letters map to the palette at the top of the file).
New special effects need a few lines in `engine.js` (search for `SPECIALS`).

## Files

- `index.html`: UI, sounds, networking
- `engine.js`: game rules (runs on the host)
- `cards.js`: heroes and cards
- `peerjs.min.js`: peer-to-peer library (PeerJS, MIT)

Test locally with several tabs: serve the folder (`python3 -m http.server`) and open `index.html?net=local`.
