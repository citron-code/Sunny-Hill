# Citrobit: design direction

The site is one game, from its title screen to its end credits. Scrolling down is playing on: no page part may look like a
web-site widget. (A dashboard-style panel was rejected for being "unrelated to the opening panel and amateurish".)
UXKIN was not connected, so this direction comes from the games themselves (Pocket Quest's pixel world, its cast)
and from the habits of retro game menus, not from other web sites.

## The screens

| Screen | What it is | Where |
| --- | --- | --- |
| Full-screen guide | Before the title screen, only on a phone or tablet in a browser: a window on the night sky, Android or iPhone / iPad, each step in Turkish then English (the English in the second ink), the button to tap drawn beside it. | `#guide` (`guide.js`) |
| Title screen | The Citrobit valley, alive behind the mascot and the wordmark, one line and PRESS START; the login window beside them. Nothing else. | `.hero` (`hero.js`, `valley.js`) |
| Under the ground | Below the grass the dirt turns, in dithered rows, into the deep blue of a game menu. Everything below the title screen sits on it, the end credits too. | `.hero::after`, `.deep` |
| Choose your game | Two game windows, each with a silent moving preview of the game (its real pictures, panned, then cut). | `#play` |
| How to play | A strip of Pocket Quest's ground with three signposts; Batuhan Teacher walks past them. Over each post, its step in a window. | `#how` (`hero.js` `startStrip`) |
| For parents | Batuhan Teacher speaks to the parents in his dialog window (his picture inside it): his promises as an item list, then two choices. | `#parents` |
| End credits | The night sky with its stars. | `.footer` |
| The child's top | The same world; the hello, the teacher's dialog, a window per game. A new level brings pixel confetti and a fanfare. | `#hello`, `#picks` |
| Loading | The game's window with a loading bar while the save comes. | `oyna.html` |

## Colour

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#1d2b53` | Text, every pixel outline, the menu ground |
| `--night` | `#0e1838` | Shadows on the menu ground, the deepest edge |
| `--deep` | `#16224a` | The menu ground under the world (between ink and night) |
| `--card` | `#fffdf7` | Window paper |
| `--orange` | `#ff9f1c` | The brand: the logo, title bars, the teacher's name bar |
| `--citron` | `#ffdd3c` | Highlights: PRESS START, chips, the menu cursor, the last-played glow |
| `--go` | `#2e9c3c` | The one action that starts something (Play, Continue, the PIN's OK). White bold text: 3.5:1 |
| `--sky-*`, `[data-mood]` | day / dusk / night | Skies follow the clock everywhere a sky shows |
| `--red` | `#e2364a` | Wrong PIN, delete |

Text on paper is `--ink` (14:1) or `--ink2` (7.2:1); on the menu ground `#fff` and `--mist` `#c9d4f5` (9.3:1).
Each game keeps its accent (`games.js`: Sunny Hill green, Pocket Quest blue) for its window's title bar.

## Type

Two pixel faces, served by the site itself (`/fonts/`, from Fontsource, OFL): no request leaves for Google.

Five sizes and nothing between them (`--fs-*`; on phones the upper four step down):

| Token | Desktop / phone | Use |
| --- | --- | --- |
| `--fs-s` | 14 / 14 | Labels, chips, name tabs, small print |
| `--fs-m` | 18 / 16 | Body text, buttons, item lists |
| `--fs-b` | 22 / 18 | The teacher's lines, leads, big buttons, typed input |
| `--fs-l` | 28 / 24 | Window titles, the brand in the bar |
| `--fs-xl` | 36 / 28 | Screen titles, the title screen's line |

The wordmark and the child's "Hello" are the only display sizes. Pixelify Sans's fi and fl ligatures look like an A
("first" read "Arst"): they are turned off for every element (`font-variant-ligatures: none !important`, as a `font:` shorthand would turn them on again), in the in-game panel too.
Press Start 2P is drawn on an 8 px grid, so only 8, 16 or 24 (PRESS START, the PIN keys, FILE 1, the step numbers).
No all-caps labels in Pixelify; capitals only where a game would print them, in Press Start 2P.

## Space, shape, depth

- A 4 px grid (`--px`): every size is a multiple of it. Sections: 96 px apart (64 on phones). Content: 1180 px.
- One pixel size for all art: on a computer each pixel of the world, the strip, the teacher and the frames is 4 screen
  pixels, always a whole number (the world is cut, never stretched unevenly); on a tablet 3, on a phone 2. Icons are
  drawn on 12 px, so 12 or 24; the logo on 32, so 32 or 64.
- No radius anywhere. Frames are pixel outlines drawn with box-shadow: `--ol` (4 px, cut corners), `--bevel` (light top-left,
  dark bottom-right on buttons), `--lift` (a hard 12 px shadow under windows). No soft shadows, no blur, no gradients
  except skies and dithers.

## Components

- **Window**: paper, `--ol` + `--lift`, a title bar in the brand or game colour with a 4 px ink line under it. Logins,
  games, dialogs, steps and the loading screen are all this one window.
- **Button**: a key with a thick ink side under it; it goes down when pressed (finger, mouse or keyboard). One `--go`
  button per window at most. Hover brightens one step; focus is a 4 px orange outline.
- **Menu cursor**: a blinking citron ▶ that jumps to the hovered or focused choice, as in a game menu.
- **Chips**: small framed labels for facts (tags, class, days in a row, stars).
- **Dialog**: as in a game: the teacher inside the box on the left, cut at the waist by its bottom edge (he stands behind
  it), no frame or painted sky around him; his name on an orange tab on the top edge; the line typed out; a bobbing ▼.
  A tap anywhere on the box brings the next line.

## Motion and sound

- One orchestrated entrance: the letters drop, then the window opens in steps. Everything else moves only because the
  child did something, or because it is the game world (the yard, the walk, the previews).
- Timing is stepped (`steps()`), never eased slides: things snap like sprites.
- 8-bit sounds from ZzFX (MIT, built in `sfx.js`, no files), only after a tap, never on hover; the speaker turns them off.
- "Reduce motion": no animation, the worlds and previews show one still picture, the wipe and confetti are skipped.

## Pictures

Pixel art only, in one style: Pocket Quest's drawing code (its engine, ground and cast) and `make-pixels.mjs` (the
mascot, the icons). The world is the Citrobit valley, not one game's: orange groves (the brand) and a place for each
game (`PLACES` in `valley.js`), each with a sign in its game's colour; more games become more places, and the guests
(Grabbo, Pip, a Sunny Hill villager) come from the games. The mascot is a living sprite (blink, wave, hop), never a
still picture. Game pictures are real screenshots, shown inside a window's screen. Icons are the 12 px set in `img/i/`, used as masks so they take the text
colour. No emoji, no stock art.
