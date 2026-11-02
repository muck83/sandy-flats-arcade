# Cinema film sources

The Sandy Flats Cinema itself is a claude.ai artifact (index page plus `films/*.html`, each with its voices embedded).
This folder keeps the sources for films built in this project, so they can be edited and rebuilt.

A film is three files plus the shared build script:

- `beats.json`: the script, one beat per line or moment: `scene`, `cast` (`{name: [x, facing, opts]}`), `set` (scene
  state), `fx` (effects with an `at` time), `s` (speaker) and `t` (the line; text in brackets is a stage direction and
  isn't spoken), `d` (length for beats with no line), `hold` (extra time after a line), `title`/`sub` for title cards.
- `episode.js`: the episode's scenes and effects, drawn with the shared Sandy Flats episode engine.
- `meta.json`: title, kicker, blurb and the note under the player.

`build.py TEMPLATE.html DIR OUT.html COO_SOURCE.html` voices every line with Microsoft Edge neural voices (the cast's
voices are listed at the top: Priya en-US-Emma, Effie en-GB-Sonia, Sam en-US-Roger and Chip Hartley en-US-Brian match
the earlier films; the others are the nearest matches), works out the mouth movements and the timing, and builds the
page from an earlier film's shell (`TEMPLATE.html`, e.g. One Alone), reusing Doug's "Coo" from `COO_SOURCE.html`.
Audio is cached in `DIR/audio/`, so a rebuild only re-voices changed lines.

- `rewind/`: Rewind 1, *Rewind* (slope), before Lesson 12.
