# 火龍出巡 · Fire Dragon Checkpoint Hunt

A mobile-first, bilingual (Traditional Chinese / English) QR checkpoint hunt for the MHLRC's Mid-Autumn Festival week. Students scan hidden QR codes, answer a quick question at each stop, and light up the fire dragon one scale at a time. Borrowing a book after finishing all four checkpoints unlocks the reward.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell — loads the other files |
| `style.css` | All visual styling (night sky, dragon, cards, buttons) |
| `data.js` | Checkpoints, questions, answers and clues — **edit this to change content** |
| `game.js` | App logic: routing, scoring, localStorage, screen rendering |
| `admin-qr-codes.html` | Staff-only helper that prints the 4 QR codes once you know your published URL |
| `qrcode-lib.js` | Small open-source QR-drawing library used only by the admin page |

## How the game works

- Solving a checkpoint's question saves progress in the browser's localStorage and hands out a clue to one other checkpoint the player hasn't found yet — so the order is different for every player.
- Progress lives only in that browser/device's localStorage. There's no server, spreadsheet, or account system involved, so there's nothing to host beyond static files.
