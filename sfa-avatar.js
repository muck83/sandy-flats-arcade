/* Sandy Flats Arcade: avatars, the wardrobe and the coin wallet.
   Every student has a little character drawn in SVG: a colour, eyes, a mouth, a hat, an extra, a trail, a name colour,
   a character type (cat, bunny, robot...) and a pet.
   A look is 9 base-36 characters (one per part, in that order), e.g. "120350030", plus up to 3 more for extra extras
   worn together (see wear()). Older 7-character looks still work: a missing part counts as 0 (the plain blob, no pet).
   One character per part means a list can hold at most 36 items (0-9, a-z). Basic parts are free; the rest cost coins, and the best ones
   also need an arcade level. New items only ever go on the END of a list, because looks and purchases use positions.
   Since 2026-11 a look can also carry an EXTENDED part (characters 13 on): hair, hair colour, outfit, outfit colour,
   pattern, face detail, backdrop, move, title, catchphrase and favourite badges. See CAT.r onwards and join().
   Coins are worked out from everything the student has done (arcade game levels and certificates, live-game XP,
   lesson answers, Climb), minus what they've spent. What they own, spend and wear lives in the arcade profile
   (the reserved game 'g99', shared with the arcade level), so it follows them to another computer. */
(function () {
  'use strict';
  var SFA = window.SFA = window.SFA || {};
  if (window.SFA_AVATAR) return;

  var CAT = {
    b: { name: 'Colour', items: [
      { n: 'Sky', c: '#53B7FF' }, { n: 'Mint', c: '#4FD97A' }, { n: 'Coral', c: '#FF7A6B' }, { n: 'Grape', c: '#9B6BFF' },
      { n: 'Sunny', c: '#FFD23F', p: 30 }, { n: 'Bubblegum', c: '#FF8FD1', p: 30 }, { n: 'Ocean', c: '#2E6BD9', p: 50 }, { n: 'Lava', c: '#E8452C', p: 50 },
      { n: 'Galaxy', c: '#5B3FC4', fx: 'galaxy', p: 150, lv: 4 }, { n: 'Solid gold', c: '#FFC107', fx: 'gold', p: 300, lv: 8 },
      { n: 'Neon lime', c: '#B6FF2E', p: 40 }, { n: 'Lilac', c: '#C8A2FF', p: 40 }, { n: 'Peach', c: '#FFB38A', p: 30 }, { n: 'Teal', c: '#1FC7B6', p: 30 },
      { n: 'Shadow', c: '#4A4A6A', p: 60 }, { n: 'Camo', c: '#6B8E4E', fx: 'camo', p: 100, lv: 2 }, { n: 'Cotton candy', c: '#FFB3E1', fx: 'candy', p: 100, lv: 2 },
      { n: 'Slime', c: '#7FE04A', fx: 'slime', p: 120, lv: 3 }, { n: 'Sunset', c: '#FF8A5B', fx: 'sunset', p: 150, lv: 3 },
      { n: 'Holographic', c: '#D9B8FF', fx: 'holo', p: 250, lv: 6 }, { n: 'Rainbow', c: '#FFE14D', fx: 'rainbow', p: 300, lv: 9 },
      { n: 'Mango', c: '#FFA53B', p: 30 }, { n: 'Cherry', c: '#D7263D', p: 50 }, { n: 'Forest', c: '#2F8F4E', p: 50 }, { n: 'Ice', c: '#BFEFFF', p: 40 },
      { n: 'Midnight', c: '#232A6B', p: 60 }, { n: 'Cow print', c: '#FFFFFF', fx: 'cow', p: 100, lv: 2 }, { n: 'Strawberry', c: '#FF4D6A', fx: 'berry', p: 120, lv: 3 },
      { n: 'Aurora', c: '#3B8BFF', fx: 'aurora', p: 200, lv: 5 },
      // natural skin tones, all free
      { n: 'Porcelain', c: '#FFE0C4' }, { n: 'Warm sand', c: '#F3C6A0' }, { n: 'Honey', c: '#E0AC7A' }, { n: 'Almond', c: '#C98F5E' }, { n: 'Chestnut', c: '#A8703F' }, { n: 'Cocoa', c: '#875230' }, { n: 'Espresso', c: '#6A3F25' }] },
    e: { name: 'Eyes', items: [{ n: 'Round' }, { n: 'Happy' }, { n: 'Sleepy', p: 20 }, { n: 'Big', p: 30 }, { n: 'Star eyes', p: 80, lv: 3 }, { n: 'Heart eyes', p: 80, lv: 5 },
      { n: 'Wink', p: 30 }, { n: 'Side-eye', p: 40 }, { n: 'Chill', p: 40 }, { n: 'Anime sparkle', p: 80, lv: 2 }, { n: 'Dizzy', p: 60 }, { n: 'Laser eyes', p: 200, lv: 7 }, { n: 'Happy tears', p: 60 },
      { n: 'Angry', p: 30 }, { n: 'Sus', p: 40 }, { n: 'Crying', p: 40 }, { n: 'Robot visor', p: 150, lv: 4 }, { n: 'Money eyes', p: 100, lv: 3 }, { n: 'Lashes', p: 30 }] },
    m: { name: 'Mouth', items: [{ n: 'Smile' }, { n: 'Grin' }, { n: 'Oh!', p: 20 }, { n: 'Tongue out', p: 30 }, { n: 'Smirk', p: 30 },
      { n: 'Braces', p: 30 }, { n: 'Fangs', p: 40 }, { n: 'Cat mouth :3', p: 30 }, { n: 'Bubblegum', p: 60, lv: 2 }, { n: 'Moustache', p: 50 }, { n: 'Laughing', p: 40 }, { n: 'Nervous', p: 20 }, { n: 'Bunny teeth', p: 30 },
      { n: 'Pout', p: 20 }, { n: 'Zipped', p: 30 }, { n: 'Wobbly', p: 20 }, { n: 'Lollipop', p: 60, lv: 2 }, { n: 'Beard', p: 80, lv: 3 }, { n: 'Whistle', p: 30 }] },
    h: { name: 'Hat', items: [{ n: 'No hat' }, { n: 'Cap', p: 40 }, { n: 'Beanie', p: 40 }, { n: 'Party hat', p: 50 }, { n: 'Headphones', p: 60 }, { n: 'Top hat', p: 80 },
      { n: 'Cowboy hat', p: 80 }, { n: 'Wizard hat', p: 120, lv: 3 }, { n: 'Viking helmet', p: 120, lv: 4 }, { n: 'Crown', p: 250, lv: 5 }, { n: 'Halo', p: 250, lv: 7 },
      { n: 'Backwards cap', p: 40 }, { n: 'Bucket hat', p: 50 }, { n: 'Frog hat', p: 80 }, { n: 'Cat-ear headphones', p: 90, lv: 2 }, { n: 'Chef hat', p: 60 },
      { n: 'Graduation cap', p: 100, lv: 3 }, { n: 'Pirate hat', p: 90, lv: 2 }, { n: 'Astronaut helmet', p: 200, lv: 6 }, { n: 'Flower crown', p: 70 },
      { n: 'Headband', p: 30 }, { n: 'Mushroom hat', p: 80, lv: 2 }, { n: 'Propeller cap', p: 60 },
      { n: 'Beret', p: 50 }, { n: 'Hard hat', p: 60 }, { n: 'Witch hat', p: 120, lv: 3 }, { n: 'Santa hat', p: 80 }, { n: 'Tiara', p: 150, lv: 4 },
      { n: 'Devil horns', p: 100, lv: 2 }, { n: 'Traffic cone', p: 60 }, { n: 'Sprout', p: 30 },
      // free head coverings (they take the outfit colour) and a bow
      { n: 'Hijab' }, { n: 'Turban' }, { n: 'Kufi' }, { n: 'Head wrap' }, { n: 'Hair bow' }] },
    // extras can be worn together, up to MAXX at once, but only one per spot (s): a second pair of glasses swaps the first
    a: { name: 'Extras', items: [{ n: 'Nothing' }, { n: 'Glasses', p: 30, s: 'face' }, { n: 'Bow tie', p: 30, s: 'neck' }, { n: 'Scarf', p: 40, s: 'neck' }, { n: 'Sunglasses', p: 60, s: 'face' },
      { n: 'Medal', p: 100, lv: 4, s: 'neck' }, { n: 'Cape', p: 150, lv: 3, s: 'back' }, { n: 'Wings', p: 300, lv: 6, s: 'back' },
      { n: 'Gaming headset', p: 80, lv: 2, s: 'ears' }, { n: 'Pi chain', p: 60, s: 'neck' }, { n: 'Boba tea', p: 50, s: 'hand' }, { n: 'Skateboard', p: 100, lv: 2, s: 'feet' }, { n: 'Basketball', p: 60, s: 'lhand' },
      { n: 'Game controller', p: 70, s: 'held' }, { n: 'Backpack', p: 50, s: 'back' }, { n: 'Phone', p: 50, s: 'hand' }, { n: 'Guitar', p: 150, lv: 3, s: 'held hand' }, { n: 'Earbuds', p: 40, s: 'ears' },
      { n: 'Ice cream', p: 40, s: 'hand' },
      { n: 'Monocle', p: 80, lv: 2, s: 'face' }, { n: 'Heart shades', p: 70, s: 'face' }, { n: 'Clown nose', p: 40, s: 'nose' }, { n: 'Gold chain', p: 150, lv: 4, s: 'neck' },
      { n: 'Bandana', p: 40, s: 'neck' }, { n: 'Pizza slice', p: 50, s: 'hand' }, { n: 'Magic wand', p: 120, lv: 3, s: 'hand' }, { n: 'Balloon', p: 50, s: 'lhand' },
      { n: 'Shield', p: 100, lv: 2, s: 'lhand' }, { n: 'Jetpack', p: 250, lv: 6, s: 'back' }, { n: 'Fairy wings', p: 200, lv: 5, s: 'back' }, { n: 'Hoverboard', p: 250, lv: 7, s: 'feet' }] },
    t: { name: 'Trail', items: [{ n: 'No trail' }, { n: 'Sparkles', e: '✨', p: 60 }, { n: 'Hearts', e: '💖', p: 60 }, { n: 'Music', e: '🎵', p: 60 }, { n: 'Stars', e: '⭐', p: 100, lv: 2 }, { n: 'Flames', e: '🔥', p: 150, lv: 3 }, { n: 'Rainbow', e: '🌈', p: 250, lv: 6 },
      { n: 'Lightning', e: '⚡', p: 60 }, { n: 'Bubbles', e: '🫧', p: 60 }, { n: 'Confetti', e: '🎉', p: 80 }, { n: 'Sakura', e: '🌸', p: 80 }, { n: 'Snow', e: '❄️', p: 80 },
      { n: 'Butterflies', e: '🦋', p: 100, lv: 2 }, { n: 'Dead funny', e: '💀', p: 100, lv: 2 }, { n: 'Moai', e: '🗿', p: 120, lv: 3 }, { n: 'Pixel aliens', e: '👾', p: 120, lv: 3 },
      { n: 'Money rain', e: '💸', p: 150, lv: 4 }, { n: 'Galaxy', e: '🌌', p: 200, lv: 5 }, { n: 'Diamonds', e: '💎', p: 250, lv: 7 },
      { n: 'Leaves', e: '🍃', p: 60 }, { n: 'Clovers', e: '🍀', p: 60 }, { n: 'Paw prints', e: '🐾', p: 60 }, { n: 'Pizza', e: '🍕', p: 80 }, { n: 'Cookies', e: '🍪', p: 80 },
      { n: 'Bats', e: '🦇', p: 100, lv: 2 }, { n: 'Ghosts', e: '👻', p: 100, lv: 2 }, { n: 'Rockets', e: '🚀', p: 150, lv: 3 }, { n: 'Crowns', e: '👑', p: 200, lv: 5 }, { n: 'Fireworks', e: '🎆', p: 250, lv: 6 },
      { n: 'Plus signs', e: '➕' }, { n: 'Footballs', e: '⚽', p: 60 }, { n: 'Palm trees', e: '🌴', p: 60 }, { n: 'Moons', e: '🌙', p: 80 },
      { n: 'Comets', e: '☄️', u: ['streak', 5], r: 3 }, { n: 'Bright ideas', e: '💡', u: ['fix', 5], r: 2 }, { n: 'Lucky stars', e: '🌟', u: ['quests', 10], r: 2 }] },
    n: { name: 'Name colour', items: [{ n: 'White' }, { n: 'Mint', p: 20 }, { n: 'Pink', p: 20 }, { n: 'Sky', p: 20 }, { n: 'Gold', p: 150, lv: 8 }, { n: 'Rainbow', p: 300, lv: 10 },
      { n: 'Neon', p: 40 }, { n: 'Lilac', p: 20 }, { n: 'Orange', p: 20 }, { n: 'Toxic green', p: 100, lv: 2 }, { n: 'Fire', p: 120, lv: 3 }, { n: 'Ice', p: 120, lv: 3 },
      { n: 'Galaxy', p: 200, lv: 5 }, { n: 'Holographic', p: 300, lv: 9 },
      { n: 'Coral', p: 20 }, { n: 'Aqua', p: 20 }, { n: 'Candy', p: 100, lv: 2 }, { n: 'Sunset', p: 120, lv: 3 }, { n: 'Glitch', p: 200, lv: 6 }, { n: 'Ocean', p: 100, lv: 2 }] },
    // the character under everything: 0 is the original blob, the rest add ears, horns, tails and so on
    k: { name: 'Character', items: [{ n: 'Blob' }, { n: 'Cat' }, { n: 'Bear' }, { n: 'Bunny' }, { n: 'Frog', p: 40 }, { n: 'Penguin', p: 50 }, { n: 'Fox', p: 60 },
      { n: 'Capybara', p: 80 }, { n: 'Axolotl', p: 100, lv: 2 }, { n: 'Robot', p: 120, lv: 3 }, { n: 'Ghost', p: 120, lv: 3 }, { n: 'Alien', p: 150, lv: 4 },
      { n: 'Dino', p: 150, lv: 4 }, { n: 'Unicorn', p: 200, lv: 6 }, { n: 'Dragon', p: 300, lv: 8 },
      { n: 'Mouse', p: 40 }, { n: 'Pig', p: 40 }, { n: 'Owl', p: 80, lv: 2 }, { n: 'Shark', p: 150, lv: 3 }, { n: 'Lion', p: 150, lv: 4 }] },
    // a little friend by the avatar's feet
    p: { name: 'Pet', items: [{ n: 'No pet' }, { n: 'Kitten', e: '🐱', p: 40 }, { n: 'Puppy', e: '🐶', p: 40 }, { n: 'Hamster', e: '🐹', p: 50 }, { n: 'Froggy', e: '🐸', p: 50 },
      { n: 'Duck', e: '🦆', p: 60 }, { n: 'Turtle', e: '🐢', p: 60 }, { n: 'Penguin', e: '🐧', p: 80 }, { n: 'Otter', e: '🦦', p: 100, lv: 2 }, { n: 'Octopus', e: '🐙', p: 120, lv: 3 },
      { n: 'Fox cub', e: '🦊', p: 120, lv: 3 }, { n: 'Panda', e: '🐼', p: 150, lv: 4 }, { n: 'T. rex', e: '🦖', p: 200, lv: 5 }, { n: 'Dragon', e: '🐉', p: 300, lv: 8 },
      { n: 'Bunny', e: '🐰', p: 50 }, { n: 'Bee', e: '🐝', p: 50 }, { n: 'Snail', e: '🐌', p: 40 }, { n: 'Hedgehog', e: '🦔', p: 80 }, { n: 'Parrot', e: '🦜', p: 100, lv: 2 },
      { n: 'Sloth', e: '🦥', p: 120, lv: 3 }, { n: 'Flamingo', e: '🦩', p: 120, lv: 3 }, { n: 'Unicorn', e: '🦄', p: 250, lv: 7 },
      { n: 'Chick', e: '🐥' }, { n: 'Goldfish', e: '🐠' }, { n: 'Ladybird', e: '🐞' }, { n: 'Koala', e: '🐨', p: 60 }, { n: 'Monkey', e: '🐵', p: 60 }, { n: 'Owl', e: '🦉', p: 80 },
      { n: 'Crab', e: '🦀', p: 60 }, { n: 'Camel', e: '🐫', p: 80 }, { n: 'Llama', e: '🦙', p: 100, lv: 2 }, { n: 'Falcon', e: '🦅', p: 120, lv: 3 }, { n: 'Tiger cub', e: '🐯', p: 120, lv: 3 },
      { n: 'Butterfly', e: '🦋', u: ['retry', 3], r: 2 }, { n: 'Robot buddy', e: '🤖', u: ['tries', 150], r: 3 }, { n: 'Peacock', e: '🦚', u: ['days', 10], r: 3 }] }
  };
  var ORDER = ['b', 'e', 'm', 'h', 'a', 't', 'n', 'k', 'p'];

  /* ---------- more ways to look like you: hair, outfits, face details, backdrops, moves, a title, a catchphrase ----------
     These ride in the EXTENDED part of a look: characters 13 onwards (the first 12 are the classic look above, padded
     with 0s). One character per part, in XORDER, then up to 3 favourite badges. A missing character counts as 0 (none),
     so every older look draws exactly as it always did, and anything that only keeps the first 12 characters (the live
     games' "zlookx1" rows) still shows the classic part.
     u: [stat, need] marks an item that is EARNED by effort (showing up, trying, retrying…) and can never be bought.
     r: its rarity (0 common … 4 legendary) when the price doesn't say. Same rule as above: new items go on the END. */
  CAT.r = { name: 'Hair', items: [{ n: 'No hair' }, { n: 'Short crop' }, { n: 'Side swoop' }, { n: 'Fringe' }, { n: 'Spiky' }, { n: 'Curly' }, { n: 'Afro' }, { n: 'Puffs' },
    { n: 'Long straight' }, { n: 'Long wavy' }, { n: 'Bob' }, { n: 'Ponytail' }, { n: 'Pigtails' }, { n: 'Top bun' }, { n: 'Space buns', p: 30 }, { n: 'Braids' },
    { n: 'Box braids' }, { n: 'Cornrows' }, { n: 'Locs' }, { n: 'High top' }, { n: 'Buzz cut' }, { n: 'Mohawk', p: 50 }, { n: 'Curtains' }, { n: 'Long curls' },
    { n: 'Undercut', p: 40 }, { n: 'Anime spikes', p: 80, lv: 2 },
    { n: 'Flame hair', u: ['streak', 3], r: 3, g: [[0, '#FFE14D'], [.5, '#FF8A1F'], [1, '#E8452C']] },
    { n: 'Starlight hair', u: ['tries', 300], r: 4, g: [[0, '#C9A6FF'], [.5, '#6B8BFF'], [1, '#3BFFE1']] }] };
  CAT.c = { name: 'Hair colour', items: [{ n: 'Black', c: '#3A3446' }, { n: 'Dark brown', c: '#52321E' }, { n: 'Brown', c: '#7A4A28' }, { n: 'Light brown', c: '#A9713F' },
    { n: 'Blonde', c: '#F2CF6B' }, { n: 'Ginger', c: '#D9662B' }, { n: 'Auburn', c: '#8E3A22' }, { n: 'Silver', c: '#C9CED6' },
    { n: 'Blue', c: '#3B8BFF', p: 30 }, { n: 'Pink', c: '#FF7AC0', p: 30 }, { n: 'Purple', c: '#9B6BFF', p: 30 }, { n: 'Green', c: '#3BAF7A', p: 30 }, { n: 'Red', c: '#E8452C', p: 30 },
    { n: 'Teal', c: '#1FC7B6', p: 30 }, { n: 'Snow white', c: '#F7F5F0', p: 40 },
    { n: 'Pastel mix', c: '#FFB3E1', g: [[0, '#FFB3E1'], [1, '#9BE3FF']], p: 100, lv: 2 }, { n: 'Sunset ombre', c: '#FF8A5B', g: [[0, '#7B3FC4'], [.5, '#E8457C'], [1, '#FFD23F']], p: 120, lv: 3 },
    { n: 'Rainbow', c: '#FFE14D', g: [[0, '#FF5B5B'], [.25, '#FFB020'], [.5, '#4FD97A'], [.75, '#53B7FF'], [1, '#9B6BFF']], u: ['days', 5], r: 3 }] };
  CAT.o = { name: 'Outfit', items: [{ n: 'No outfit' }, { n: 'T-shirt' }, { n: 'Hoodie' }, { n: 'Football shirt' }, { n: 'Basketball vest' }, { n: 'Overalls' }, { n: 'Zip jacket', p: 30 },
    { n: 'Sweater' }, { n: 'Lab coat', p: 60 }, { n: 'Kurta' }, { n: 'Suit and tie', p: 80 }, { n: 'Wrap robe', p: 60 }, { n: 'Poncho', p: 50 },
    { n: 'Hero suit', p: 120, lv: 3 }, { n: 'Space suit', p: 150, lv: 4 }, { n: 'Knight armour', p: 150, lv: 4 }, { n: 'Raincoat', p: 50 }, { n: 'Varsity jacket', p: 80, lv: 2 },
    { n: 'Captain\'s kit', u: ['team', 5], r: 2 }, { n: 'Comeback hoodie', u: ['retry', 10], r: 3 }, { n: 'Gold-thread robe', u: ['days', 20], r: 4 }] };
  // the colour of the outfit (and of a hijab, turban, head wrap or bow): every one is free
  CAT.q = { name: 'Outfit colour', items: [{ n: 'Teal', c: '#1FA3A8' }, { n: 'Red', c: '#E8452C' }, { n: 'Orange', c: '#FF8A3B' }, { n: 'Yellow', c: '#FFD23F' }, { n: 'Green', c: '#4FD97A' },
    { n: 'Forest', c: '#1F8A5A' }, { n: 'Sky', c: '#53B7FF' }, { n: 'Blue', c: '#2E6BD9' }, { n: 'Indigo', c: '#5B3FC4' }, { n: 'Purple', c: '#9B6BFF' }, { n: 'Pink', c: '#FF7AC0' },
    { n: 'Crimson', c: '#B8203A' }, { n: 'White', c: '#F7F5F0' }, { n: 'Grey', c: '#9AA4B2' }, { n: 'Charcoal', c: '#3B3B52' }, { n: 'Brown', c: '#7A4A28' }, { n: 'Black', c: '#24212C' }, { n: 'Lilac', c: '#C8A2FF' }] };
  CAT.w = { name: 'Pattern', items: [{ n: 'Plain' }, { n: 'Stripes' }, { n: 'Pinstripes' }, { n: 'Dots' }, { n: 'Checks' }, { n: 'Zigzag', p: 20 }, { n: 'Stars', p: 30 }, { n: 'Hearts', p: 30 },
    { n: 'Flames', p: 60 }, { n: 'Camo', p: 40 }, { n: 'Rainbow bands', p: 80, lv: 2 }, { n: 'Galaxy', p: 100, lv: 3 }, { n: 'Lightning', p: 40 }, { n: 'Tie-dye', p: 60 }, { n: 'Maths' },
    { n: 'Gold trim', u: ['quests', 5], r: 2 }] };
  CAT.f = { name: 'Face details', items: [{ n: 'None' }, { n: 'Freckles' }, { n: 'Rosy cheeks' }, { n: 'Beauty mark' }, { n: 'Plaster' }, { n: 'Bold brows' }, { n: 'Dimples' }, { n: 'Hearing aids' },
    { n: 'Bindi' }, { n: 'Star face paint', p: 20 }, { n: 'Heart cheek', p: 20 }, { n: 'Lightning paint', p: 30 }, { n: 'Glitter', p: 40 }, { n: 'Whisker paint', p: 20 }, { n: 'Sport stripes', p: 30 },
    { n: 'Vitiligo' }, { n: 'Tiger paint', p: 60 }, { n: 'Gold star freckles', u: ['fix', 3], r: 2 }] };
  // a backdrop is drawn only where a page asks for it (svg(look, {bg: true})): the profile card, the Wardrobe, the front page
  CAT.g = { name: 'Backdrop', items: [{ n: 'No backdrop' }, { n: 'Sunny day' }, { n: 'Night sky' }, { n: 'Graph paper' }, { n: 'Sunset', p: 30 }, { n: 'Ocean', p: 30 }, { n: 'Forest', p: 30 },
    { n: 'Desert dunes', p: 30 }, { n: 'City lights', p: 50 }, { n: 'Galaxy', p: 100, lv: 3 }, { n: 'Spotlight', p: 60 }, { n: 'Neon arcade', p: 80, lv: 2 }, { n: 'Aurora', p: 120, lv: 4 },
    { n: 'Gold burst', u: ['days', 10], r: 3 }, { n: 'Rainbow burst', u: ['quests', 20], r: 4 }, { n: 'Summit', u: ['ups', 3], r: 2 }] };
  // a move: how the avatar stands and fidgets (animated on pages; inside the canvas games it is just the pose)
  CAT.j = { name: 'Moves', items: [{ n: 'Standing' }, { n: 'Bounce' }, { n: 'Wave' }, { n: 'Wiggle' }, { n: 'Float', p: 30 }, { n: 'Cheer' }, { n: 'Spin', p: 50 }, { n: 'Headbang', p: 40 },
    { n: 'Shimmy', p: 40 }, { n: 'Jump for joy', p: 60 }, { n: 'Flex', p: 60, lv: 2 }, { n: 'Moonwalk', p: 100, lv: 3 }, { n: 'Victory dance', u: ['quests', 3], r: 2 }, { n: 'Zen float', u: ['streak', 5], r: 3 }] };
  // titles and catchphrases are picked from these lists (no typing, so nothing ever needs checking)
  CAT.u = { name: 'Title', items: [{ n: 'My level title' }, { n: 'Maths Explorer' }, { n: 'Slope Surfer' }, { n: 'Pattern Spotter' }, { n: 'Question Asker' }, { n: 'Night Owl' }, { n: 'Quiet Genius' },
    { n: 'Team Player' }, { n: 'Snack Enthusiast' }, { n: 'Graph Wizard', p: 40 }, { n: 'Zero Hero', p: 40 }, { n: 'Equation Tamer', p: 60 }, { n: 'Function Machine', p: 60 },
    { n: 'Professional Guesser', p: 30 }, { n: 'Chief Vibes Officer', p: 50 }, { n: 'Boss Slayer', p: 100, lv: 3 }, { n: 'Lane Legend', p: 100, lv: 3 }, { n: 'Human Calculator', p: 150, lv: 5 },
    { n: 'The Undefined', p: 200, lv: 7 }, { n: 'Comeback Kid', u: ['retry', 5], r: 2 }, { n: 'Never Gives Up', u: ['retry', 20], r: 3 }, { n: 'Mistake Fixer', u: ['fix', 10], r: 3 },
    { n: 'Always Here', u: ['days', 5], r: 2 }, { n: 'Sandy Flats Regular', u: ['days', 15], r: 3 }, { n: 'On a Roll', u: ['streak', 5], r: 3 }, { n: 'Quest Runner', u: ['quests', 10], r: 2 },
    { n: 'Level Climber', u: ['ups', 3], r: 2 }, { n: 'Great Teammate', u: ['team', 5], r: 2 }, { n: 'Hard Worker', u: ['tries', 200], r: 3 }, { n: 'Unstoppable', u: ['tries', 600], r: 4 }] };
  CAT.y = { name: 'Catchphrase', items: [{ n: 'No catchphrase' }, { n: 'Let\'s gooo!' }, { n: 'Not yet… but soon.' }, { n: 'One more try.' }, { n: 'Slow and steady.' }, { n: 'I ask good questions.' },
    { n: 'Watch this.' }, { n: 'Rise over run!' }, { n: 'Zero first.' }, { n: 'Here for the snacks.' }, { n: 'Mathing in progress…' }, { n: 'Brain loading: 99%' }, { n: 'Yalla, let\'s go!' },
    { n: 'Vamos!' }, { n: 'Ganbatte!' }, { n: 'Allons-y!' }, { n: 'Jiayou!' }, { n: 'Chalo!' }, { n: 'Hwaiting!' }, { n: 'Team first.' }, { n: 'Quiet but dangerous.' }, { n: 'Sleepy but here.' },
    { n: 'GG, well played.' }, { n: 'Trust the process.' }, { n: 'Powered by curiosity.' }, { n: 'Plot twist: I get it now.', p: 30 }, { n: 'Ask me about slope.', p: 30 },
    { n: 'Certified try-hard.', p: 40 }, { n: 'Undefined? Never heard of it.', p: 60 }, { n: 'Mistakes are data.', u: ['retry', 1], r: 1 }, { n: 'I came back for more.', u: ['days', 3], r: 1 },
    { n: 'Wrong first, right later.', u: ['fix', 5], r: 2 }, { n: 'I don\'t quit.', u: ['tries', 100], r: 2 }] };
  var XORDER = ['r', 'c', 'o', 'q', 'w', 'f', 'g', 'j', 'u', 'y'], ALL = ORDER.concat(XORDER), CLEN = 12, MAXFAV = 3;

  /* badges: small trophies of your own, all for effort. Up to 3 favourites show on the profile card.
     Same rule: new badges go on the END (favourites are kept by position). */
  var BADGES = [null,
    { e: '👣', n: 'First Steps', d: 'Have your first go at anything', s: 'tries', v: 1 }, { e: '🔥', n: 'Warmed Up', d: '25 goes', s: 'tries', v: 25 },
    { e: '💯', n: 'Century', d: '100 goes', s: 'tries', v: 100 }, { e: '🏃', n: 'Marathon', d: '500 goes', s: 'tries', v: 500 },
    { e: '📅', n: 'Show-Up Star', d: 'Show up on 3 days', s: 'days', v: 3 }, { e: '🗓️', n: 'Regular', d: 'Show up on 10 days', s: 'days', v: 10 }, { e: '🏛️', n: 'Part of the Furniture', d: 'Show up on 25 days', s: 'days', v: 25 },
    { e: '↩️', n: 'Bounce Back', d: 'Try again after a mistake', s: 'retry', v: 1 }, { e: '🔁', n: 'Comeback', d: 'Try again after 10 mistakes', s: 'retry', v: 10 }, { e: '🛡️', n: 'Unbreakable', d: 'Try again after 40 mistakes', s: 'retry', v: 40 },
    { e: '🔧', n: 'Fixed It', d: 'Turn 3 wrong answers into right ones', s: 'fix', v: 3 }, { e: '🐛', n: 'Bug Squasher', d: 'Turn 15 wrong answers into right ones', s: 'fix', v: 15 },
    { e: '🎳', n: 'On a Roll', d: 'A 3-day streak', s: 'streak', v: 3 }, { e: '☄️', n: 'Hot Streak', d: 'A 7-day streak', s: 'streak', v: 7 },
    { e: '🧭', n: 'Quest Starter', d: 'Finish your first quest', s: 'quests', v: 1 }, { e: '🗺️', n: 'Quest Pro', d: 'Finish 15 quests', s: 'quests', v: 15 },
    { e: '📈', n: 'Level Up', d: 'Move up a level on a review skill', s: 'ups', v: 1 }, { e: '🧗', n: 'Climber', d: 'Move up 5 review levels', s: 'ups', v: 5 },
    { e: '🤝', n: 'Teammate', d: 'Join a class game', s: 'team', v: 1 }, { e: '🎖️', n: 'Squad Regular', d: 'Join 8 class games', s: 'team', v: 8 },
    { e: '🕹️', n: 'Game On', d: 'Finish an arcade level', s: 'glv', v: 1 }, { e: '👾', n: 'Arcade Ace', d: 'Finish 20 arcade levels', s: 'glv', v: 20 },
    { e: '🎨', n: 'Stylist', d: 'Make your avatar your own', s: 'sty', v: 1 }];

  /* ---------- looks ---------- */
  /* Extras worn together: the first sits in its usual 5th place, up to MAXX-1 more go on the end (characters 10-12).
     Looks never grow past 12 characters, because the live games only pass on [0-9a-z]{1,12}. L.x is the whole list. */
  var MAXX = 4;
  function slots(i) { var it = CAT.a.items[i]; return it && it.s ? it.s.split(' ') : []; }
  function clash(i, j) { var a = slots(i), b = slots(j); return a.some(function (s) { return b.indexOf(s) >= 0; }); }
  // the extras list after putting on i (anything in the same spot comes off; past MAXX the oldest comes off). mode 'toggle': i comes off if it's on
  function wear(x, i, mode) {
    x = (x || []).slice();
    if (!i) return [];
    if (x.indexOf(i) >= 0) return mode === 'toggle' ? x.filter(function (j) { return j !== i; }) : x;
    x = x.filter(function (j) { return !clash(i, j); }); x.push(i);
    while (x.length > MAXX) x.shift();
    return x;
  }
  function decode(code) {
    var s = String(code || ''), L = {}, x = [], ext = s.length > CLEN ? s.slice(CLEN) : '';
    if (ext) s = s.slice(0, CLEN);
    ORDER.forEach(function (k, i) { var v = parseInt(s.charAt(i) || '0', 36); L[k] = isNaN(v) || !CAT[k].items[v] ? 0 : v; });
    [L.a].concat(s.slice(ORDER.length, ORDER.length + MAXX - 1).split('').map(function (c) { return parseInt(c, 36); })).forEach(function (v) {
      if (v > 0 && CAT.a.items[v] && x.length < MAXX && x.indexOf(v) < 0 && !x.some(function (j) { return clash(v, j); })) x.push(v);
    });
    L.x = x; L.a = x[0] || 0;
    // the extended part: one character per new part, then the favourite badges
    XORDER.forEach(function (k, i) { var v = parseInt(ext.charAt(i) || '0', 36); L[k] = isNaN(v) || !CAT[k].items[v] ? 0 : v; });
    L.fav = [];
    ext.slice(XORDER.length, XORDER.length + MAXFAV).split('').forEach(function (c) { var v = parseInt(c, 36); if (v > 0 && BADGES[v] && L.fav.indexOf(v) < 0) L.fav.push(v); });
    return L;
  }
  function encClassic(L) {
    var x = (L.x || (L.a ? [L.a] : [])).filter(function (v) { return v > 0 && CAT.a.items[v]; }).slice(0, MAXX);
    return ORDER.map(function (k) { return (k === 'a' ? x[0] || 0 : L[k] || 0).toString(36); }).join('') + x.slice(1).map(function (v) { return v.toString(36); }).join('');
  }
  function encExt(L) {
    return (XORDER.map(function (k) { return (L[k] || 0).toString(36); }).join('') + (L.fav || []).slice(0, MAXFAV).map(function (v) { return v.toString(36); }).join('')).replace(/0+$/, '');
  }
  // classic look + extended part -> one code (the classic part padded to 12 so the extended part always starts at 13)
  function join(look, lx) { look = String(look || ''); lx = String(lx || '').replace(/[^0-9a-z]/g, ''); if (!lx) return look; while (look.length < CLEN) look += '0'; return look.slice(0, CLEN) + lx; }
  function encode(L) { L = L || {}; return join(encClassic(L), encExt(L)); }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  // someone who never visited the wardrobe still gets a look of their own, from the free parts
  function defLook(seed) {
    var h = hash(seed || 'x'), free = [];
    CAT.k.items.forEach(function (it, i) { if (!it.p) free.push(i); });
    // >>> (not >>) keeps the numbers positive, so a big hash can't make a "-1" part
    return encode({ b: h % 4, e: (h >>> 3) % 2, m: (h >>> 5) % 2, h: 0, a: 0, t: 0, n: 0, k: free[(h >>> 7) % free.length], p: 0 });
  }

  /* ---------- drawing ---------- */
  var INK = '#141428', uid = 0;
  var BODY = 'M60 30 C95 30 104 60 104 95 C104 128 86 142 60 142 C34 142 16 128 16 95 C16 60 25 30 60 30 Z';
  // the ghost: the same head, with a wavy hem instead of feet
  var GHOST = 'M60 30 C95 30 104 60 104 95 L104 140 Q97 152 89 141 Q82 152 74.5 141 Q67 152 60 141 Q53 152 45.5 141 Q38 152 31 141 Q23 152 16 140 L16 95 C16 60 25 30 60 30 Z';
  // draw something on the left, then the same thing mirrored on the right. f(X, s): X maps an x, s is 1 (left) or -1 (right)
  function both(f) { return f(function (x) { return x; }, 1) + f(function (x) { return 120 - x; }, -1); }
  function ink(w) { return ' stroke="' + INK + '" stroke-width="' + w + '" stroke-linejoin="round"'; }

  function eyes(v, fill) {
    var o = '', s3 = ink(3);
    function round(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#fff"' + s3 + '/><circle cx="' + (x + 1) + '" cy="' + (y + 1) + '" r="5" fill="' + INK + '"/><circle cx="' + (x + 3) + '" cy="' + (y - 2) + '" r="1.8" fill="#fff"/>'; }
    function arc(x, y) { return '<path d="M' + (x - 8) + ' ' + (y + 3) + ' Q' + x + ' ' + (y - 9) + ' ' + (x + 8) + ' ' + (y + 3) + '" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>'; }
    // an eyelid in the body colour, coming down to d below the middle of the eye
    function lid(x, y, d) {
      var h = Math.round(Math.sqrt(100 - d * d) * 10) / 10;
      return '<path d="M' + (x - h) + ' ' + (y + d) + ' A10 10 0 ' + (d > 0 ? 1 : 0) + ' 1 ' + (x + h) + ' ' + (y + d) + ' Z" fill="' + fill + '"' + s3 + '/>';
    }
    function white(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#fff"' + s3 + '/>'; }
    [45, 75].forEach(function (x) {
      var y = 78;
      if (v === 1) o += arc(x, y);
      else if (v === 2) o += '<path d="M' + (x - 9) + ' ' + y + ' A9 9 0 0 0 ' + (x + 9) + ' ' + y + ' Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="3.5" fill="' + INK + '"/>';
      else if (v === 3) o += '<circle cx="' + x + '" cy="' + y + '" r="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + (x + 1) + '" cy="' + (y + 2) + '" r="7" fill="' + INK + '"/><circle cx="' + (x + 4) + '" cy="' + (y - 2) + '" r="2.6" fill="#fff"/>';
      else if (v === 4) o += '<text x="' + x + '" y="' + (y + 8) + '" font-size="24" text-anchor="middle">⭐</text>';
      else if (v === 5) o += '<text x="' + x + '" y="' + (y + 8) + '" font-size="22" text-anchor="middle">💗</text>';
      else if (v === 6) o += x === 45 ? round(x, y) : arc(x, y);   // wink
      else if (v === 7) o += white(x, y) + '<circle cx="' + (x + 5) + '" cy="' + (y + 3) + '" r="4.5" fill="' + INK + '"/>' + lid(x, y, -1);   // side-eye
      else if (v === 8) o += white(x, y) + '<circle cx="' + (x + 1) + '" cy="' + (y + 5) + '" r="4.5" fill="' + INK + '"/>' + lid(x, y, 2);   // chill
      else if (v === 9) o += '<ellipse cx="' + x + '" cy="' + y + '" rx="11" ry="14" fill="#fff"' + s3 + '/><ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="8" ry="11" fill="#5B3FC4"/>' +
        '<ellipse cx="' + x + '" cy="' + (y + 3) + '" rx="4.5" ry="6" fill="' + INK + '"/><circle cx="' + (x + 3) + '" cy="' + (y - 4) + '" r="3.6" fill="#fff"/><circle cx="' + (x - 3) + '" cy="' + (y + 7) + '" r="1.8" fill="#fff"/>';
      else if (v === 10) o += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="#fff"' + s3 + '/><path d="M' + x + ' ' + y + ' a2 2 0 0 1 4 0 a4 4 0 0 1 -8 0 a6 6 0 0 1 12 0 a8 8 0 0 1 -16 0" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>';
      else if (v === 11) o += '<circle class="avlz" cx="' + x + '" cy="' + y + '" r="16" fill="#FF3B3B" opacity=".3"/><circle cx="' + x + '" cy="' + y + '" r="10" fill="#FF2E2E"' + s3 + '/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#fff"/><path d="M' + (x - 17) + ' ' + y + ' L' + (x + 17) + ' ' + y + '" stroke="#FFB0B0" stroke-width="2" stroke-linecap="round" opacity=".85"/>';
      else if (v === 12) {   // happy tears
        var tx = x < 60 ? x - 10 : x + 10;
        o += arc(x, y) + '<path d="M' + tx + ' ' + (y + 3) + ' C' + (tx - 6) + ' ' + (y + 11) + ' ' + (tx - 5) + ' ' + (y + 16) + ' ' + tx + ' ' + (y + 16) + ' C' + (tx + 5) + ' ' + (y + 16) + ' ' + (tx + 6) + ' ' + (y + 11) + ' ' + tx + ' ' + (y + 3) + ' Z" fill="#7CC8FF"' + ink(2) + '/>';
      }
      else if (v === 13) {   // angry: brows slanting down to the middle
        var inr = x < 60 ? x + 10 : x - 10, out = x < 60 ? x - 11 : x + 11;
        o += round(x, y) + '<path d="M' + out + ' 62 L' + inr + ' 69" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
      }
      else if (v === 14) o += '<path d="M' + (x - 11) + ' ' + y + ' Q' + x + ' ' + (y - 6) + ' ' + (x + 11) + ' ' + y + ' Q' + x + ' ' + (y + 6) + ' ' + (x - 11) + ' ' + y + ' Z" fill="#fff"' + s3 + '/>' +   // sus
        '<circle cx="' + (x + 4) + '" cy="' + y + '" r="3" fill="' + INK + '"/>';
      else if (v === 15) {   // crying: shut eyes and two rivers
        var cx = x < 60 ? x - 4 : x + 4;
        o += '<path d="M' + cx + ' ' + (y + 4) + ' L' + cx + ' 134" stroke="#7CC8FF" stroke-width="6" stroke-linecap="round" opacity=".85"/>' +
          '<path d="M' + (x - 8) + ' ' + (y - 2) + ' Q' + x + ' ' + (y + 6) + ' ' + (x + 8) + ' ' + (y - 2) + '" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
      }
      else if (v === 16) { if (x === 45) o += '<rect x="26" y="67" width="68" height="22" rx="11" fill="' + INK + '"/><rect class="avlz" x="32" y="74" width="56" height="8" rx="4" fill="#3BFFE1"/>' +   // robot visor
        '<rect x="34" y="75.5" width="52" height="5" rx="2.5" fill="#3BFFE1"/><circle cx="40" cy="78" r="2" fill="#fff"/>'; }
      else if (v === 17) o += white(x, y) + '<text x="' + x + '" y="' + (y + 6.5) + '" font-size="18" font-weight="900" font-family="Arial,sans-serif" fill="#1E9E50" text-anchor="middle">$</text>';   // money eyes
      else if (v === 18) o += round(x, y) + [-1, 0, 1].map(function (d) {   // lashes
        return '<path d="M' + (x + d * 6) + ' ' + (y - 9) + ' L' + (x + d * 9) + ' ' + (y - 16) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>';
      }).join('');
      else o += round(x, y);
    });
    return o;
  }
  function mouth(v) {
    var s = ' stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"', smile = '<path d="M48 102 Q60 115 72 102" fill="none"' + s + '/>';
    var grin = '<path d="M46 100 Q60 122 74 100 Z" fill="' + INK + '"/>';
    if (v === 1) return grin + '<path d="M49 101 L71 101 L69 106 L51 106 Z" fill="#fff"/>';
    if (v === 2) return '<ellipse cx="60" cy="107" rx="6" ry="8" fill="' + INK + '"/>';
    if (v === 3) return grin + '<ellipse cx="60" cy="112" rx="7" ry="6" fill="#FF6B8A"/>';
    if (v === 4) return '<path d="M50 107 Q62 111 72 99" fill="none"' + s + '/>';
    if (v === 5) return grin + '<path d="M49 101 L71 101 L69 106 L51 106 Z" fill="#fff"/><path d="M50 103.5 L70 103.5" stroke="#8A94A6" stroke-width="1.8"/>' +   // braces
      '<g fill="#8A94A6"><rect x="52" y="102" width="3" height="3"/><rect x="58.5" y="102" width="3" height="3"/><rect x="65" y="102" width="3" height="3"/></g>';
    if (v === 6) return '<path d="M52 105 L54.5 114 L57 107 Z M63 107 L65.5 114 L68 105 Z" fill="#fff"' + ink(2) + '/>' + smile;   // fangs
    if (v === 7) return '<path d="M47 102 Q53.5 111 60 103 Q66.5 111 73 102" fill="none"' + s + ' stroke-linejoin="round"/>';   // :3
    if (v === 8) return '<ellipse cx="60" cy="105" rx="4" ry="3" fill="' + INK + '"/><g class="avbb"><circle cx="60" cy="112" r="14" fill="#FF8FD1"' + ink(3) + '/>' +   // bubblegum
      '<path d="M52 107 Q54 102 59 101" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/></g>';
    if (v === 9) return '<path d="M50 108 Q60 117 70 108" fill="none"' + s + '/>' +   // moustache
      '<path d="M60 97 C54 91 44 92 40 98 C37 102 32 100 31 96 C31 104 40 108 48 104 C53 102 57 100 60 100 C63 100 67 102 72 104 C80 108 89 104 89 96 C88 100 83 102 80 98 C76 92 66 91 60 97 Z" fill="#5B3A1E"' + ink(2.5) + '/>';
    if (v === 10) return '<path d="M40 98 Q60 132 80 98 Z" fill="' + INK + '"' + ink(2) + '/><ellipse cx="60" cy="117" rx="9" ry="6" fill="#FF6B8A"/><path d="M43 99 L77 99 L75 104 L45 104 Z" fill="#fff"/>';   // laughing
    if (v === 11) return '<path d="M44 106 L49 102 L54 106 L60 102 L66 106 L71 102 L76 106" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';   // nervous
    if (v === 12) return '<rect x="54" y="106" width="6" height="8" rx="1.5" fill="#fff"' + ink(2.2) + '/><rect x="60" y="106" width="6" height="8" rx="1.5" fill="#fff"' + ink(2.2) + '/>' + smile;   // bunny teeth
    if (v === 13) return '<path d="M60 108 C54 100 50 106 54 110 C50 114 54 120 60 112 C66 120 70 114 66 110 C70 106 66 100 60 108 Z" fill="#FF6B8A"' + ink(2.5) + '/>';   // pout
    if (v === 14) { var z = '<path d="M45 105 L75 105" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';   // zipped
      for (var zx = 49; zx <= 71; zx += 4) z += '<path d="M' + zx + ' 101.5 L' + zx + ' 108.5" stroke="' + INK + '" stroke-width="2"/>';
      return z + '<rect x="74" y="101" width="7" height="10" rx="2" fill="#C9D2DD"' + ink(2) + '/>'; }
    if (v === 15) return '<path d="M44 105 Q49 99 54 105 T64 105 T74 105" fill="none"' + s + '/>';   // wobbly
    if (v === 16) return smile + '<path d="M68 108 L86 120" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M68 108 L86 120" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +   // lollipop
      '<circle cx="90" cy="123" r="10" fill="#FF5B8A"' + ink(3) + '/><path d="M90 123 a2 2 0 0 1 4 0 a4 4 0 0 1 -8 0 a6 6 0 0 1 12 0" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>';
    if (v === 17) return '<path d="M22 100 Q24 146 60 148 Q96 146 98 100 Q90 124 76 120 Q60 114 44 120 Q30 124 22 100 Z" fill="#6B4423"' + ink(2.5) + '/>' +   // beard
      '<path d="M50 104 Q60 112 70 104" fill="none" stroke="#3A2412" stroke-width="4.5" stroke-linecap="round"/>';
    if (v === 18) return '<ellipse cx="60" cy="106" rx="5" ry="5.5" fill="' + INK + '"/><text x="82" y="102" font-size="16" fill="' + INK + '" text-anchor="middle">♪</text>';   // whistle
    return smile;
  }
  function hat(v) {
    var st = ink(3.5), s2 = ink(2.5);
    switch (v) {
      case 1: return '<path d="M30 42 Q30 12 60 12 Q90 12 90 42 Z" fill="#E8452C"' + st + '/><path d="M62 39 L106 43 Q102 51 62 46 Z" fill="#B8321F"' + st + '/><circle cx="60" cy="13" r="4" fill="#B8321F"/>';
      case 2: return '<path d="M28 44 Q28 6 60 6 Q92 6 92 44 Z" fill="#3BAF7A"' + st + '/><rect x="25" y="35" width="70" height="13" rx="6" fill="#2A8A5E"' + st + '/><circle cx="60" cy="5" r="8" fill="#fff"' + st + '/>';
      case 3: return '<path d="M40 38 L60 -10 L80 38 Z" fill="#FF8FD1"' + st + '/><path d="M47 22 L73 22 M53 8 L67 8" stroke="#FFE14D" stroke-width="5"/><circle cx="60" cy="-11" r="6" fill="#FFE14D"' + st + '/>';
      case 4: return '<path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="#2b2b3a" stroke-width="8"/><rect x="8" y="68" width="18" height="28" rx="7" fill="#FF5B8A"' + st + '/><rect x="94" y="68" width="18" height="28" rx="7" fill="#FF5B8A"' + st + '/>';
      case 5: return '<ellipse cx="60" cy="37" rx="40" ry="8" fill="#3B3B52"' + st + '/><rect x="38" y="-8" width="44" height="45" rx="3" fill="#3B3B52"' + st + '/><rect x="38" y="23" width="44" height="8" fill="#E8452C"/><path d="M44 -2 L44 18" stroke="#8A8AA8" stroke-width="3" stroke-linecap="round"/>';
      case 6: return '<path d="M38 36 Q36 4 50 6 Q60 13 70 6 Q84 4 82 36 Z" fill="#B8763A"' + st + '/><path d="M10 37 Q60 56 110 37 Q104 29 60 34 Q16 29 10 37 Z" fill="#A0642D"' + st + '/>';
      case 7: return '<path d="M30 40 L64 -22 L90 40 Z" fill="#4B3BB8"' + st + '/><ellipse cx="60" cy="40" rx="38" ry="7" fill="#3A2C99"' + st + '/><text x="58" y="18" font-size="14" fill="#FFE14D" text-anchor="middle">✦</text><text x="68" y="-1" font-size="10" fill="#FFE14D" text-anchor="middle">✦</text>';
      case 8: return '<path d="M30 30 Q6 24 8 0 Q20 16 34 21 Z" fill="#F3EFE7"' + st + '/><path d="M90 30 Q114 24 112 0 Q100 16 86 21 Z" fill="#F3EFE7"' + st + '/><path d="M28 44 Q28 10 60 10 Q92 10 92 44 Z" fill="#9AA4B2"' + st + '/><rect x="26" y="36" width="68" height="9" rx="3" fill="#6E7888"' + st + '/>';
      case 9: return '<path d="M32 38 L32 8 L46 22 L60 0 L74 22 L88 8 L88 38 Z" fill="#FFC94A"' + st + '/><circle cx="46" cy="31" r="4" fill="#E8452C"/><circle cx="60" cy="29" r="4.5" fill="#53B7FF"/><circle cx="74" cy="31" r="4" fill="#4FD97A"/>';
      case 10: return '<ellipse cx="60" cy="8" rx="27" ry="7" fill="none" stroke="#FFE14D" stroke-width="6" opacity=".95"/><ellipse cx="60" cy="8" rx="27" ry="7" fill="none" stroke="#fff" stroke-width="2"/>';
      case 11: return '<path d="M31 40 Q16 39 9 47 Q20 50 32 46 Z" fill="#1F4FA8"' + st + '/><path d="M30 42 Q30 12 60 12 Q90 12 90 42 Z" fill="#2E6BD9"' + st + '/>' +   // backwards cap
        '<path d="M49 42 Q49 32 60 32 Q71 32 71 42" fill="#1F4FA8"' + ink(3) + '/><circle cx="60" cy="13" r="4" fill="#1F4FA8"/>';
      case 12: return '<path d="M34 38 Q34 8 60 8 Q86 8 86 38 Z" fill="#F2D27A"' + st + '/><path d="M35 30 L85 30" stroke="#C9952E" stroke-width="4"/>' +   // bucket hat
        '<path d="M18 46 L34 32 L86 32 L102 46 Q60 56 18 46 Z" fill="#E5BE55"' + st + '/>';
      case 13: return '<path d="M28 46 Q28 10 60 10 Q92 10 92 46 Z" fill="#6BCB5A"' + st + '/>' +   // frog hat
        both(function (X) { return '<circle cx="' + X(42) + '" cy="12" r="10" fill="#6BCB5A"' + st + '/><circle cx="' + X(42) + '" cy="12" r="5.5" fill="#fff"' + ink(2) + '/><circle cx="' + X(42) + '" cy="13" r="2.8" fill="' + INK + '"/>'; }) +
        '<path d="M48 32 Q60 40 72 32" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><ellipse cx="38" cy="33" rx="4" ry="2.5" fill="#FF7AA8" opacity=".6"/><ellipse cx="82" cy="33" rx="4" ry="2.5" fill="#FF7AA8" opacity=".6"/>';
      case 14: return both(function (X) { return '<path d="M' + X(26) + ' 40 L' + X(28) + ' 6 L' + X(50) + ' 24 Z" fill="#FFB3DE"' + st + '/><path d="M' + X(31) + ' 30 L' + X(32) + ' 15 L' + X(42) + ' 23 Z" fill="#FF6FB5"/>'; }) +   // cat-ear headphones
        '<path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="' + INK + '" stroke-width="12"/><path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="#FFB3DE" stroke-width="7"/>' +
        both(function (X) { return '<rect x="' + (X(8) - (X(8) > 60 ? 18 : 0)) + '" y="68" width="18" height="28" rx="7" fill="#FFB3DE"' + st + '/><circle cx="' + X(17) + '" cy="82" r="4" fill="#7CF2FF"/>'; });
      case 15: return '<path d="M38 46 L38 28 Q22 28 24 14 Q26 0 42 4 Q46 -8 60 -8 Q74 -8 78 4 Q94 0 96 14 Q98 28 82 28 L82 46 Z" fill="#fff"' + st + '/>' +   // chef hat
        '<path d="M50 12 Q52 20 50 28 M70 12 Q68 20 70 28" fill="none" stroke="#D3DAE3" stroke-width="3" stroke-linecap="round"/><path d="M39 36 L81 36" stroke="#D3DAE3" stroke-width="3"/>';
      case 16: return '<path d="M36 42 Q36 22 60 22 Q84 22 84 42 Z" fill="#222"' + st + '/><path d="M60 4 L106 18 L60 32 L14 18 Z" fill="#2b2b3a"' + st + '/>' +   // graduation cap
        '<path d="M60 18 L96 22 L96 40" fill="none" stroke="#FFC94A" stroke-width="3" stroke-linecap="round"/><path d="M92 40 L100 40 L99 50 L93 50 Z" fill="#FFC94A"' + ink(2) + '/><circle cx="60" cy="18" r="3.5" fill="#FFC94A"/>';
      case 17: return '<path d="M12 40 Q24 -2 60 10 Q96 -2 108 40 Q60 26 12 40 Z" fill="#2b2b3a"' + st + '/><path d="M19 35 Q60 23 101 35" fill="none" stroke="#FFC94A" stroke-width="3"/>' +   // pirate hat
        '<circle cx="60" cy="20" r="6" fill="#FFC94A"' + ink(2) + '/><path d="M60 16.5 L60 23.5" stroke="#B8860B" stroke-width="2"/>';
      case 18: return '<circle cx="60" cy="80" r="52" fill="#BFE6FF" fill-opacity=".22" stroke="#E8EEF5" stroke-width="7"/>' +   // astronaut helmet
        '<circle cx="60" cy="80" r="55.5" fill="none"' + ink(2.5) + '/><circle cx="60" cy="80" r="48.5" fill="none"' + ink(2) + '/>' +
        '<path d="M30 58 Q37 42 52 35" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><circle cx="84" cy="44" r="3" fill="#fff" opacity=".8"/>' +
        '<rect x="22" y="126" width="76" height="12" rx="6" fill="#E8EEF5"' + st + '/><circle cx="60" cy="132" r="3" fill="#FF5B5B"/>';
      case 19: return '<path d="M26 44 Q60 22 94 44" fill="none" stroke="#3BAF7A" stroke-width="4" stroke-linecap="round"/>' +   // flower crown
        [[32, 40, '#FF8FD1'], [45, 35, '#FFE14D'], [60, 33, '#C9A6FF'], [75, 35, '#FFE14D'], [88, 40, '#FF8FD1']].map(function (f) {
          return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="7" fill="' + f[2] + '"' + s2 + '/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="2.6" fill="#FF9F1C"/>';
        }).join('');
      case 20: return '<path d="M18 60 Q60 34 102 60 L101 70 Q60 46 19 70 Z" fill="#FF5B8A"' + st + '/><path d="M20 65 Q60 40 100 65" fill="none" stroke="#fff" stroke-width="2.5" opacity=".85"/>';   // headband
      case 21: return '<path d="M10 48 Q10 -2 60 -2 Q110 -2 110 48 Q60 38 10 48 Z" fill="#E8452C"' + st + '/>' +   // mushroom hat
        '<g fill="#fff"><circle cx="40" cy="18" r="7"/><circle cx="70" cy="10" r="5"/><circle cx="86" cy="28" r="6"/><circle cx="26" cy="36" r="4"/><circle cx="58" cy="30" r="4"/></g>';
      case 22: return '<path d="M28 44 Q28 8 60 8 Q92 8 92 44 Z" fill="#FFD23F"' + st + '/>' +   // propeller cap
        '<path d="M60 8 Q46 9 42 44 L60 44 Z" fill="#FF5B5B"' + ink(2) + '/><path d="M60 8 Q74 9 78 44 L60 44 Z" fill="#53B7FF"' + ink(2) + '/>' +
        '<rect x="26" y="38" width="68" height="10" rx="5" fill="#FFD23F"' + st + '/><path d="M60 8 L60 -3" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="avpr"><ellipse cx="48" cy="-4" rx="12" ry="3.5" fill="#53B7FF"' + s2 + '/><ellipse cx="72" cy="-4" rx="12" ry="3.5" fill="#FF5B5B"' + s2 + '/></g><circle cx="60" cy="-4" r="3" fill="' + INK + '"/>';
      case 23: return '<path d="M22 40 Q20 16 60 14 Q102 14 98 40 Q60 47 22 40 Z" fill="#C0263A"' + st + '/><path d="M60 14 L63 5" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';   // beret
      case 24: return '<path d="M28 44 Q28 8 60 8 Q92 8 92 44 Z" fill="#FFC107"' + st + '/><path d="M60 10 L60 40" stroke="#E0A000" stroke-width="7"/>' +   // hard hat
        '<rect x="16" y="37" width="88" height="10" rx="5" fill="#FFB300"' + st + '/>';
      case 25: return '<path d="M30 38 L68 -22 Q71 -14 77 -11 L90 38 Z" fill="#3B2A5E"' + st + '/><ellipse cx="60" cy="40" rx="45" ry="8" fill="#2C1F47"' + st + '/>' +   // witch hat
        '<path d="M33 30 L88 30 L89.5 36 L31.5 36 Z" fill="#9B6BFF"/><rect x="54" y="28" width="12" height="10" rx="1.5" fill="none" stroke="#FFE14D" stroke-width="2.5"/>';
      case 26: return '<path d="M30 40 Q34 0 66 -4 Q90 -6 100 22 L92 26 Q84 10 74 14 Q88 26 90 40 Z" fill="#E8452C"' + st + '/>' +   // santa hat
        '<rect x="24" y="33" width="72" height="14" rx="7" fill="#fff"' + st + '/><circle cx="98" cy="25" r="8" fill="#fff"' + st + '/>';
      case 27: return '<path d="M34 42 L38 26 L48 34 L60 14 L72 34 L82 26 L86 42 Z" fill="#E8EEF5"' + st + '/>' +   // tiara
        '<circle cx="60" cy="29" r="5" fill="#FF5BB0"' + ink(2) + '/><circle cx="45" cy="37" r="3" fill="#7CC8FF"/><circle cx="75" cy="37" r="3" fill="#7CC8FF"/>';
      case 28: return both(function (X) { return '<path d="M' + X(36) + ' 42 Q' + X(20) + ' 26 ' + X(26) + ' 6 Q' + X(36) + ' 24 ' + X(50) + ' 34 Z" fill="#E8452C"' + st + '/>'; });   // devil horns
      case 29: return '<path d="M44 40 L56 -14 L64 -14 L76 40 Z" fill="#FF7A1F"' + st + '/>' +   // traffic cone
        '<path d="M49.3 16 L70.7 16 L72.9 26 L47.1 26 Z M52.9 0 L67.1 0 L68.4 6 L51.6 6 Z" fill="#fff"/><rect x="28" y="36" width="64" height="10" rx="3" fill="#FF7A1F"' + st + '/>';
      case 30: return '<path d="M60 32 Q57 18 60 5" fill="none" stroke="#3BAF7A" stroke-width="4" stroke-linecap="round"/>' +   // sprout
        '<path d="M60 9 Q46 -6 38 6 Q48 15 60 9 Z" fill="#6BCB5A"' + s2 + '/><path d="M60 7 Q76 -8 83 4 Q72 14 60 7 Z" fill="#6BCB5A"' + s2 + '/>';
    }
    return '';
  }
  // extras under the feet (they don't bob with the body)
  function extraUnder(v) {
    if (v === 11) return '<rect x="10" y="149" width="100" height="7" rx="3.5" fill="#FF5B8A"' + ink(3) + '/><path d="M22 152.5 L98 152.5" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"/>' +   // skateboard
      '<circle cx="28" cy="158" r="3.6" fill="#FFE14D"' + ink(2.2) + '/><circle cx="92" cy="158" r="3.6" fill="#FFE14D"' + ink(2.2) + '/>';
    if (v === 30) return '<ellipse class="avlz" cx="60" cy="161" rx="42" ry="4" fill="#3BFFE1" opacity=".4"/><rect x="6" y="148" width="108" height="9" rx="4.5" fill="#2b2b3a"' + ink(3) + '/>' +   // hoverboard
      '<rect x="14" y="151" width="92" height="3" rx="1.5" fill="#3BFFE1"/>';
    return '';
  }
  function extraBack(v) {
    var st = ink(3.5);
    if (v === 6) return '<path d="M30 52 Q10 118 2 152 L118 152 Q110 118 90 52 Z" fill="#C0263A"' + st + '/>';
    if (v === 7) return '<path d="M22 82 Q-20 48 -15 100 Q-4 96 0 114 Q8 100 22 106 Z" fill="#fff"' + st + '/><path d="M98 82 Q140 48 135 100 Q124 96 120 114 Q112 100 98 106 Z" fill="#fff"' + st + '/>';
    if (v === 14) return '<path d="M30 60 Q30 22 60 22 Q90 22 90 60 Z" fill="#FF8A1F"' + st + '/><path d="M52 25 Q60 12 68 25" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';   // backpack top
    if (v === 28) return both(function (X) {   // jetpack: a tank each side, flames below
      var x0 = X(6) - (X(6) > 60 ? 22 : 0);
      return '<path class="avjet" d="M' + (x0 + 4) + ' 112 Q' + (x0 + 11) + ' 146 ' + (x0 + 18) + ' 112 Z" fill="#FF8A1F"/><path class="avjet" d="M' + (x0 + 7) + ' 112 Q' + (x0 + 11) + ' 132 ' + (x0 + 15) + ' 112 Z" fill="#FFE14D"/>' +
        '<rect x="' + x0 + '" y="54" width="22" height="60" rx="10" fill="#9AA4B2"' + st + '/><path d="M' + (x0 + 6) + ' 64 L' + (x0 + 6) + ' 100" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>';
    });
    if (v === 29) return both(function (X, s) {   // fairy wings
      return '<ellipse cx="' + X(12) + '" cy="62" rx="16" ry="27" transform="rotate(' + (-32 * s) + ' ' + X(12) + ' 62)" fill="#BFF0FF" fill-opacity=".8"' + ink(3) + '/>' +
        '<ellipse cx="' + X(14) + '" cy="108" rx="11" ry="16" transform="rotate(' + (24 * s) + ' ' + X(14) + ' 108)" fill="#FFC6E8" fill-opacity=".85"' + ink(3) + '/>';
    });
    return '';
  }
  function extraFront(v) {
    var st = ink(3.5), s2 = ink(2.5);
    switch (v) {
      case 1: return '<circle cx="45" cy="78" r="13" fill="none" stroke="' + INK + '" stroke-width="3.5"/><circle cx="75" cy="78" r="13" fill="none" stroke="' + INK + '" stroke-width="3.5"/><path d="M58 78 L62 78" stroke="' + INK + '" stroke-width="3.5"/>';
      case 2: return '<path d="M60 129 L45 120 L45 138 Z M60 129 L75 120 L75 138 Z" fill="#E8452C"' + st + '/><circle cx="60" cy="129" r="4" fill="#B8321F"' + st + '/>';
      case 3: return '<path d="M22 116 Q60 132 98 116 L98 127 Q60 143 22 127 Z" fill="#E8452C"' + st + '/><path d="M74 128 L85 127 L90 152 L77 152 Z" fill="#E8452C"' + st + '/>';
      case 4: return '<path d="M31 71 H58 V80 Q45 92 31 80 Z" fill="' + INK + '"/><path d="M62 71 H89 V80 Q75 92 62 80 Z" fill="' + INK + '"/><path d="M58 73 L62 73" stroke="' + INK + '" stroke-width="3"/><path d="M36 74 L44 74" stroke="#fff" stroke-width="2" opacity=".6"/>';
      case 5: return '<path d="M52 112 L60 125 L68 112" fill="none" stroke="#2E6BD9" stroke-width="5"/><circle cx="60" cy="130" r="8" fill="#FFC94A"' + st + '/><text x="60" y="134" font-size="9" text-anchor="middle" fill="#7a5600">★</text>';
      case 8: return '<path d="M16 84 Q16 22 60 22 Q104 22 104 84" fill="none" stroke="' + INK + '" stroke-width="6"/>' +   // gaming headset
        '<rect x="6" y="72" width="16" height="26" rx="6" fill="#2b2b3a"' + st + '/><rect x="98" y="72" width="16" height="26" rx="6" fill="#2b2b3a"' + st + '/>' +
        '<rect x="10" y="80" width="8" height="10" rx="2" fill="#4FD97A"/><rect x="102" y="80" width="8" height="10" rx="2" fill="#4FD97A"/>' +
        '<path d="M14 96 Q18 116 42 112" fill="none" stroke="#2b2b3a" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="112" r="4.5" fill="#2b2b3a"' + ink(2) + '/>';
      case 9: return '<path d="M30 116 Q60 136 90 116" fill="none" stroke="#9A6E08" stroke-width="6" stroke-linecap="round"/><path d="M30 116 Q60 136 90 116" fill="none" stroke="#FFD54A" stroke-width="3.5" stroke-dasharray="5 3"/>' +   // pi chain
        '<circle cx="60" cy="131" r="8" fill="#FFD54A"' + s2 + '/><text x="60" y="135" font-size="11" font-weight="700" font-family="Georgia,serif" text-anchor="middle" fill="#7a5600">π</text>';
      case 10: return '<path d="M114 82 L120 62" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M114 82 L120 62" stroke="#FF5B8A" stroke-width="4.5" stroke-linecap="round"/>' +   // boba tea
        '<path d="M98 86 L122 86 L118 120 L102 120 Z" fill="#F0D2A8"' + st + '/><rect x="96" y="80" width="28" height="7" rx="3.5" fill="#fff"' + s2 + '/>' +
        '<g fill="' + INK + '"><circle cx="106" cy="115" r="2.6"/><circle cx="112" cy="116" r="2.6"/><circle cx="115" cy="111" r="2.6"/><circle cx="108" cy="110" r="2.6"/><circle cx="106" cy="98" r="1.6"/><circle cx="114" cy="98" r="1.6"/></g>' +
        '<path d="M108 101.5 Q110 103.5 112 101.5" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>';
      case 12: return '<circle cx="10" cy="114" r="13" fill="#FF8A1F"' + st + '/><path d="M-3 114 L23 114 M10 101 L10 127" stroke="' + INK + '" stroke-width="2"/>' +   // basketball
        '<path d="M1 104 Q6 114 1 124 M19 104 Q14 114 19 124" fill="none" stroke="' + INK + '" stroke-width="2"/>';
      case 13: return '<path d="M38 122 Q38 114 48 114 L72 114 Q82 114 82 122 L86 136 Q88 144 80 144 Q74 144 70 138 L50 138 Q46 144 40 144 Q32 144 34 136 Z" fill="#2b2b3a"' + st + '/>' +   // game controller
        '<path d="M46 123 L46 131 M42 127 L50 127" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="72" cy="123" r="2.4" fill="#FF5B5B"/><circle cx="77" cy="128" r="2.4" fill="#53B7FF"/><circle cx="67" cy="128" r="2.4" fill="#4FD97A"/><circle cx="72" cy="133" r="2.4" fill="#FFE14D"/>';
      case 14: return both(function (X) {   // backpack straps
        var d = 'M' + X(30) + ' 56 Q' + X(24) + ' 92 ' + X(30) + ' 128';
        return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#FF8A1F" stroke-width="5" stroke-linecap="round"/>';
      });
      case 15: return '<rect x="100" y="80" width="18" height="30" rx="4" fill="#2b2b3a"' + st + '/><rect x="103" y="84" width="12" height="20" rx="1.5" fill="#7CC8FF"/>' +   // phone
        '<path d="M105 88 L113 88 M105 92 L111 92" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M109 101 l-2.5 -2.5 a1.6 1.6 0 0 1 2.5 -2 a1.6 1.6 0 0 1 2.5 2 Z" fill="#FF5B8A"/><circle cx="109" cy="106.5" r="1.4" fill="#fff"/>';
      case 16: return '<g transform="rotate(-22 50 124)"><rect x="50" y="120.5" width="58" height="7" fill="#8A5A2B"' + s2 + '/><rect x="104" y="117" width="14" height="14" rx="3" fill="#5B3A1E"' + s2 + '/>' +   // guitar
        '<path d="M24 112 Q14 112 14 124 Q14 136 26 136 Q34 140 44 136 Q58 136 58 124 Q58 112 44 112 Q36 108 24 112 Z" fill="#E8452C"' + st + '/>' +
        '<circle cx="40" cy="124" r="5" fill="' + INK + '"/><path d="M40 124 L112 124" stroke="#F3EFE7" stroke-width="1"/></g>';
      case 17: return both(function (X) {   // earbuds
        return '<rect x="' + (X(9) - (X(9) > 60 ? 9 : 0)) + '" y="80" width="9" height="11" rx="4.5" fill="#fff"' + ink(2.2) + '/><rect x="' + (X(11) - (X(11) > 60 ? 5 : 0)) + '" y="89" width="5" height="11" rx="2.5" fill="#fff"' + ink(2.2) + '/>';
      });
      case 18: return '<path d="M100 96 L120 96 L110 124 Z" fill="#F2C27A"' + st + '/><path d="M103 103 L116 110 M117 103 L106 112" stroke="#C9952E" stroke-width="1.6"/>' +   // ice cream
        '<circle cx="110" cy="78" r="8" fill="#7CF2A2"' + st + '/><circle cx="110" cy="90" r="10" fill="#FF8FD1"' + st + '/>' +
        '<path d="M105 86 l2 1 M113 84 l1 2 M110 92 l2 -1 M104 93 l1 1.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
      case 19: return '<circle cx="75" cy="78" r="14" fill="#BFE6FF" fill-opacity=".25" stroke="#FFC94A" stroke-width="3.5"/><circle cx="75" cy="78" r="16" fill="none"' + ink(1.5) + '/>' +   // monocle
        '<path d="M89 84 Q98 108 88 124" fill="none" stroke="#FFC94A" stroke-width="2" stroke-dasharray="3 2"/>';
      case 20: return [45, 75].map(function (x) {   // heart shades
        return '<path d="M' + x + ' 89 C' + (x - 17) + ' 77 ' + (x - 11) + ' 63 ' + x + ' 71 C' + (x + 11) + ' 63 ' + (x + 17) + ' 77 ' + x + ' 89 Z" fill="#FF3B7A"' + ink(3) + '/>' +
          '<path d="M' + (x - 8) + ' 72 Q' + (x - 6) + ' 69 ' + (x - 3) + ' 70" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
      }).join('') + '<path d="M57 74 L63 74" stroke="' + INK + '" stroke-width="3"/>';
      case 21: return '<circle cx="60" cy="93" r="7.5" fill="#FF3B3B"' + ink(2.5) + '/><circle cx="57.5" cy="90.5" r="2.2" fill="#fff" opacity=".85"/>';   // clown nose
      case 22: return '<path d="M28 112 Q60 142 92 112" fill="none" stroke="#9A6E08" stroke-width="8" stroke-linecap="round"/><path d="M28 112 Q60 142 92 112" fill="none" stroke="#FFD54A" stroke-width="5" stroke-dasharray="6 3"/>' +   // gold chain
        '<text x="60" y="141" font-size="22" text-anchor="middle" fill="#FFD54A" stroke="' + INK + '" stroke-width="1.5">★</text>';
      case 23: return '<path d="M24 112 Q60 128 96 112 L60 142 Z" fill="#2E6BD9"' + st + '/>' +   // bandana
        '<g fill="#fff"><circle cx="46" cy="121" r="2"/><circle cx="60" cy="124" r="2"/><circle cx="74" cy="121" r="2"/><circle cx="53" cy="131" r="2"/><circle cx="67" cy="131" r="2"/></g>';
      case 24: return '<path d="M96 76 Q111 68 126 78 L108 120 Z" fill="#FFD36B"' + st + '/><path d="M96 76 Q111 68 126 78" fill="none" stroke="#C9852E" stroke-width="6" stroke-linecap="round"/>' +   // pizza slice
        '<g fill="#E8452C"><circle cx="108" cy="87" r="4"/><circle cx="116" cy="94" r="3.5"/><circle cx="107" cy="102" r="3"/></g>';
      case 25: return '<path d="M102 122 L116 74" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M102 122 L116 74" stroke="#3B3B52" stroke-width="4" stroke-linecap="round"/>' +   // magic wand
        '<circle class="avlz" cx="118" cy="66" r="12" fill="#FFE14D" opacity=".35"/><text x="118" y="74" font-size="22" text-anchor="middle">⭐</text>';
      case 26: return '<path d="M14 108 Q4 80 -5 58" fill="none" stroke="' + INK + '" stroke-width="1.5"/><g class="avbal">' +   // balloon
        '<ellipse cx="-6" cy="40" rx="14" ry="17" fill="#FF5B8A"' + ink(3) + '/><path d="M-6 57 L-9.5 62 L-2.5 62 Z" fill="#FF5B8A"' + ink(2) + '/>' +
        '<path d="M-13 32 Q-12 27 -8 26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/></g>';
      case 27: return '<path d="M-6 92 L22 92 L22 112 Q22 128 8 137 Q-6 128 -6 112 Z" fill="#9AA4B2"' + st + '/>' +   // shield
        '<path d="M0 97 L16 97 L16 112 Q16 123 8 130 Q0 123 0 112 Z" fill="#2E6BD9"/><path d="M8 100 L8 127 M2 109 L14 109" stroke="#FFE14D" stroke-width="3" stroke-linecap="round"/>';
    }
    return '';
  }
  // the order extras are drawn in front: neck first, things held in both hands last
  var XRANK = { neck: 0, ears: 1, face: 2, nose: 3, hand: 4, lhand: 4, held: 5 };
  function xrank(i) { return slots(i).reduce(function (m, s) { return Math.max(m, XRANK[s] || 0); }, 0); }

  /* character types: kBack goes behind the body (ears, tails, spikes), kFront on top of it (whiskers, belly, horn) */
  function kBack(v, fill) {
    var st = ink(4);
    switch (v) {
      case 1: return both(function (X) { return '<path d="M' + X(27) + ' 52 L' + X(22) + ' 8 L' + X(54) + ' 33 Z" fill="' + fill + '"' + st + '/><path d="M' + X(30) + ' 40 L' + X(27) + ' 19 L' + X(45) + ' 32 Z" fill="#FF9EC4"/>'; });   // cat
      case 2: return both(function (X) { return '<circle cx="' + X(31) + '" cy="40" r="14" fill="' + fill + '"' + st + '/><circle cx="' + X(31) + '" cy="40" r="7" fill="#000" opacity=".18"/>'; });   // bear
      case 3: return both(function (X, s) {   // bunny
        return '<g transform="rotate(' + (-14 * s) + ' ' + X(44) + ' 36)"><ellipse cx="' + X(44) + '" cy="8" rx="11" ry="30" fill="' + fill + '"' + st + '/><ellipse cx="' + X(44) + '" cy="10" rx="5" ry="20" fill="#FF9EC4"/></g>';
      });
      case 4: return both(function (X) { return '<circle cx="' + X(40) + '" cy="40" r="15" fill="' + fill + '"' + st + '/><circle cx="' + X(40) + '" cy="37" r="7" fill="#fff" opacity=".35"/>'; });   // frog
      case 6: return '<path d="M98 128 Q140 130 132 80 Q120 100 98 108 Z" fill="' + fill + '"' + st + '/><ellipse cx="130" cy="88" rx="7" ry="10" transform="rotate(20 130 88)" fill="#fff"' + st + '/>' +   // fox
        both(function (X) { return '<path d="M' + X(26) + ' 54 L' + X(18) + ' 4 L' + X(56) + ' 32 Z" fill="' + fill + '"' + st + '/><path d="M' + X(20.9) + ' 22 L' + X(18) + ' 4 L' + X(31.7) + ' 14 Z" fill="' + INK + '"/>'; });
      case 7: return both(function (X) { return '<ellipse cx="' + X(30) + '" cy="44" rx="9" ry="8" fill="' + fill + '"' + st + '/>'; });   // capybara
      case 8: return both(function (X) {   // axolotl gills
        return [[28, 58, 6, 40], [24, 68, 0, 62], [23, 80, 4, 86]].map(function (g) {
          var d = 'M' + X(g[0]) + ' ' + g[1] + ' L' + X(g[2]) + ' ' + g[3];
          return '<path d="' + d + '" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="' + d + '" stroke="#FF8FC8" stroke-width="5.5" stroke-linecap="round"/>';
        }).join('');
      });
      case 9: return '<rect x="6" y="68" width="12" height="22" rx="3" fill="#C9D2DD"' + ink(3) + '/><rect x="102" y="68" width="12" height="22" rx="3" fill="#C9D2DD"' + ink(3) + '/>' +   // robot
        '<path d="M60 32 L60 6" stroke="' + INK + '" stroke-width="4"/><circle class="avbl" cx="60" cy="3" r="6" fill="#FF4D4D"' + ink(3) + '/>';
      case 11: return both(function (X) {   // alien
        return '<path d="M' + X(46) + ' 36 Q' + X(42) + ' 14 ' + X(32) + ' 5" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle cx="' + X(32) + '" cy="3" r="6" fill="#9BFF6B"' + ink(3) + '/>';
      });
      case 12: return '<path d="M36 44 L38 16 L54 32 Z M52 34 L60 4 L68 34 Z M66 32 L82 16 L84 44 Z" fill="#FFB020"' + st + '/>' +   // dino
        '<path d="M26 126 Q-6 136 -16 108 Q4 122 22 112 Z" fill="' + fill + '"' + st + '/>';
      case 13: return '<circle cx="80" cy="34" r="9" fill="#FF8FD1"' + ink(3) + '/><circle cx="92" cy="44" r="8" fill="#C9A6FF"' + ink(3) + '/><circle cx="99" cy="57" r="7" fill="#7CC8FF"' + ink(3) + '/>';   // unicorn mane
      case 14: return both(function (X) {   // dragon wings
        var d = 'M' + X(24) + ' 80 Q' + X(-2) + ' 44 ' + X(-14) + ' 62 Q' + X(-6) + ' 68 ' + X(-8) + ' 78 Q' + X(2) + ' 78 ' + X(2) + ' 90 Q' + X(10) + ' 86 ' + X(20) + ' 96 Z';
        return '<path d="' + d + '" fill="' + fill + '"' + st + '/><path d="' + d + '" fill="#000" opacity=".18"/>';
      }) + '<path d="M38 42 L42 18 L54 32 Z M52 34 L60 8 L68 34 Z M66 32 L78 18 L82 42 Z" fill="#FF5B5B"' + st + '/>';
      case 15: return both(function (X) { return '<circle cx="' + X(25) + '" cy="40" r="20" fill="' + fill + '"' + st + '/><circle cx="' + X(25) + '" cy="40" r="11" fill="#FF9EC4"/>'; });   // mouse
      case 16: return both(function (X) { return '<path d="M' + X(30) + ' 50 L' + X(24) + ' 20 L' + X(52) + ' 36 Z" fill="' + fill + '"' + st + '/><path d="M' + X(32) + ' 42 L' + X(29) + ' 28 L' + X(44) + ' 36 Z" fill="#FF9EC4"/>'; });   // pig
      case 17: return both(function (X) { return '<path d="M' + X(30) + ' 48 L' + X(22) + ' 14 L' + X(50) + ' 36 Z" fill="' + fill + '"' + st + '/>'; });   // owl tufts
      case 19: return [150, 174, 198, 222, 246, 270, 294, 318, 342, 366, 390].map(function (a) {   // lion mane (top and sides only: it mustn't cover the feet)
        var r = a * Math.PI / 180; return '<circle cx="' + Math.round(60 + 52 * Math.cos(r)) + '" cy="' + Math.round(82 + 52 * Math.sin(r)) + '" r="16" fill="#C8641E"' + st + '/>';
      }).join('') + '<circle cx="60" cy="82" r="52" fill="#C8641E"/>';
      case 18: return '<path d="M42 38 Q58 -18 84 34 Z" fill="' + fill + '"' + st + '/><path d="M42 38 Q58 -18 84 34 Z" fill="#000" opacity=".15"/>' +   // shark fin and tail
        '<path d="M96 120 Q128 132 136 108 Q126 112 120 98 Q110 114 98 108 Z" fill="' + fill + '"' + st + '/>';
    }
    return '';
  }
  function kFront(v) {
    var nose = '<path d="M55 91 L65 91 L60 96.5 Z" fill="#FF7AA8"' + ink(2) + '/>', holes = '<circle cx="55" cy="93" r="1.8" fill="' + INK + '"/><circle cx="65" cy="93" r="1.8" fill="' + INK + '"/>';
    switch (v) {
      case 1: return nose + both(function (X) { return '<path d="M' + X(26) + ' 100 L' + X(2) + ' 95 M' + X(26) + ' 107 L' + X(3) + ' 111" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>'; });   // cat whiskers
      case 2: return '<ellipse cx="60" cy="102" rx="17" ry="13" fill="#fff" opacity=".35"/><ellipse cx="60" cy="93" rx="5" ry="3.5" fill="' + INK + '"/>';   // bear muzzle
      case 3: return nose;   // bunny
      case 4: return holes;   // frog
      case 5: return '<path d="M60 62 C84 62 92 92 90 112 C88 132 76 140 60 140 C44 140 32 132 30 112 C28 92 36 62 60 62 Z" fill="#fff"/>' +   // penguin belly and beak
        '<path d="M53 91 L67 91 L60 98 Z" fill="#FFA53B"' + ink(2) + '/>';
      case 6: return '<path d="M18 100 Q38 96 50 112 Q60 118 70 112 Q82 96 102 100 Q100 134 60 140 Q20 134 18 100 Z" fill="#fff" opacity=".92"/><ellipse cx="60" cy="94" rx="4.5" ry="3.2" fill="' + INK + '"/>';   // fox
      case 7: return '<ellipse cx="60" cy="101" rx="24" ry="16" fill="#000" opacity=".12"/><ellipse cx="54" cy="96" rx="2.6" ry="3.4" fill="' + INK + '"/><ellipse cx="66" cy="96" rx="2.6" ry="3.4" fill="' + INK + '"/>';   // capybara snout
      case 9: return '<path d="M26 60 Q60 50 94 60" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="3"/>' +   // robot panels
        '<rect x="44" y="118" width="32" height="15" rx="4" fill="#C9D2DD"' + ink(3) + '/><circle cx="52" cy="125.5" r="3" fill="#FF4D4D"/><circle cx="60" cy="125.5" r="3" fill="#FFD23F"/><circle cx="68" cy="125.5" r="3" fill="#4FD97A"/>' +
        '<g fill="#000" opacity=".3"><circle cx="24" cy="70" r="2.5"/><circle cx="96" cy="70" r="2.5"/><circle cx="26" cy="122" r="2.5"/><circle cx="94" cy="122" r="2.5"/></g>';
      case 11: return '<g fill="#fff" opacity=".3"><circle cx="48" cy="50" r="4"/><circle cx="60" cy="45" r="5"/><circle cx="72" cy="50" r="4"/></g>';   // alien spots
      case 12: return '<ellipse cx="60" cy="118" rx="26" ry="20" fill="#fff" opacity=".28"/>' + holes;   // dino belly
      case 13: return '<path d="M53 36 L60 -2 L67 36 Z" fill="#FFE14D"' + ink(3.5) + '/><path d="M55 27 L65 23 M56.5 17 L63.5 14" stroke="#E0A800" stroke-width="2.5" stroke-linecap="round"/>';   // unicorn horn
      case 14: return both(function (X) { return '<path d="M' + X(42) + ' 38 Q' + X(34) + ' 22 ' + X(30) + ' 10 Q' + X(44) + ' 20 ' + X(52) + ' 34 Z" fill="#F3EFE7"' + ink(3) + '/>'; }) +   // dragon horns
        '<ellipse cx="60" cy="118" rx="26" ry="20" fill="#fff" opacity=".22"/>' + holes;
      case 15: return '<circle cx="60" cy="93" r="4" fill="#FF7AA8"' + ink(2) + '/>' + both(function (X) { return '<path d="M' + X(30) + ' 98 L' + X(6) + ' 92 M' + X(30) + ' 104 L' + X(7) + ' 108" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'; });   // mouse
      case 16: return '<ellipse cx="60" cy="94" rx="12" ry="7" fill="#FFB3C7"' + ink(3) + '/><ellipse cx="55.5" cy="94" rx="2" ry="3" fill="' + INK + '"/><ellipse cx="64.5" cy="94" rx="2" ry="3" fill="' + INK + '"/>';   // pig snout
      case 17: return '<circle cx="45" cy="78" r="16" fill="#fff" opacity=".3"/><circle cx="75" cy="78" r="16" fill="#fff" opacity=".3"/>' +   // owl
        '<ellipse cx="60" cy="122" rx="22" ry="16" fill="#fff" opacity=".3"/><path d="M50 116 l4 4 l4 -4 M62 116 l4 4 l4 -4 M56 126 l4 4 l4 -4" fill="none" stroke="' + INK + '" stroke-opacity=".35" stroke-width="2"/>' +
        '<path d="M55 89 L65 89 L60 98 Z" fill="#FFA53B"' + ink(2) + '/>';
      case 18: return '<path d="M26 100 Q60 90 94 100 Q92 136 60 140 Q28 136 26 100 Z" fill="#fff" opacity=".9"/>' +   // shark belly and gills
        both(function (X) { return [22, 27, 32].map(function (x) { return '<path d="M' + X(x) + ' 72 Q' + X(x + 3) + ' 80 ' + X(x) + ' 88" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" opacity=".55"/>'; }).join(''); });
      case 19: return '<ellipse cx="60" cy="100" rx="18" ry="13" fill="#FFE2B0" opacity=".7"/><path d="M54 91 L66 91 L60 97 Z" fill="#5B3A1E"' + ink(2) + '/>';   // lion muzzle
    }
    return '';
  }
  function trail(v, id) {
    var it = CAT.t.items[v]; if (!v || !it || !it.e) return '';
    var P = [[-8, 128, 0], [126, 118, 0.35], [-4, 64, 0.7], [122, 54, 1.05], [60, -16, 1.4]], o = '';
    P.forEach(function (p) { o += '<text class="avtr" x="' + p[0] + '" y="' + p[1] + '" font-size="18" text-anchor="middle" style="animation-delay:' + p[2] + 's">' + it.e + '</text>'; });
    return o;
  }
  function pet(v) {
    var it = CAT.p.items[v]; if (!v || !it || !it.e) return '';
    return '<ellipse cx="120" cy="157" rx="11" ry="2.5" fill="rgba(0,0,0,.25)"/><text class="avpet" x="120" y="153" font-size="26" text-anchor="middle">' + it.e + '</text>';
  }
  /* special body fills: g = gradient stops [offset, colour], v = top-to-bottom, x = extra drawing (kept inside the body) */
  var SHINE = '<path d="M34 54 Q40 46 48 44" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>';
  var FX = {
    galaxy: { g: [[0, '#2b1a6b'], [.55, '#6b3fd6'], [1, '#1fa3c9']],
      x: '<g fill="#fff"><circle cx="34" cy="60" r="1.6"/><circle cx="84" cy="56" r="1.2"/><circle cx="30" cy="112" r="1.4"/><circle cx="92" cy="118" r="1.8"/><circle cx="62" cy="128" r="1.2"/><circle cx="96" cy="88" r="1.1"/></g>' },
    gold: { g: [[0, '#FFF3A0'], [.45, '#FFC107'], [1, '#B8860B']], x: SHINE },
    candy: { g: [[0, '#FFB3E1'], [.5, '#D9B8FF'], [1, '#9BE3FF']], x: SHINE },
    sunset: { g: [[0, '#7B3FC4'], [.4, '#E8457C'], [.7, '#FF8A5B'], [1, '#FFD23F']], v: 1 },
    holo: { g: [[0, '#B5FFFC'], [.25, '#D9B8FF'], [.5, '#FFC6E8'], [.75, '#FFF3B0'], [1, '#B8FFD0']],
      x: SHINE + '<path d="M78 120 Q88 114 92 102" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/><text x="86" y="60" font-size="10" fill="#fff" text-anchor="middle">✦</text>' },
    rainbow: { g: [[0, '#FF5B5B'], [.2, '#FFB020'], [.4, '#FFE14D'], [.6, '#4FD97A'], [.8, '#53B7FF'], [1, '#9B6BFF']], v: 1 },
    camo: { x: [[36, 58, 13, 7, -20, '#4A6B35'], [80, 48, 14, 8, 15, '#8FAE6A'], [26, 102, 9, 14, 10, '#3B4F2A'], [94, 98, 11, 8, -30, '#4A6B35'],
      [54, 128, 16, 7, 0, '#8FAE6A'], [86, 130, 9, 6, 20, '#3B4F2A'], [62, 40, 10, 5, 5, '#3B4F2A'], [40, 124, 6, 5, 0, '#4A6B35']].map(function (b) {
      return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" transform="rotate(' + b[4] + ' ' + b[0] + ' ' + b[1] + ')" fill="' + b[5] + '"/>';
    }).join('') },
    slime: { x: SHINE + '<g fill="#fff" opacity=".45"><circle cx="86" cy="62" r="4"/><circle cx="92" cy="72" r="2.2"/><circle cx="30" cy="118" r="3"/></g>' +
      '<path d="M16 95 C16 60 25 30 60 30 C95 30 104 60 104 95 L104 100 Q98 96 96 106 Q94 116 90 106 Q86 92 78 100 Q72 106 66 98 Q60 92 52 100 Q46 108 40 98 Q34 90 28 104 Q24 112 22 100 Q20 94 16 100 Z" fill="#fff" opacity=".12"/>' },
    cow: { x: [[34, 56, 12, 9, -15], [86, 64, 10, 13, 20], [24, 112, 9, 12, 0], [70, 124, 14, 9, 10], [96, 110, 7, 6, 0], [52, 40, 7, 5, 0]].map(function (b) {
      return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" transform="rotate(' + b[4] + ' ' + b[0] + ' ' + b[1] + ')" fill="#2b2b3a"/>';
    }).join('') },
    berry: { x: SHINE + '<g fill="#FFE6A0">' + [[30, 66], [50, 52], [70, 50], [90, 66], [24, 96], [42, 120], [60, 132], [78, 120], [96, 96], [36, 140], [84, 140], [100, 124], [20, 124]].map(function (p) {
      return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.8" ry="2.8"/>';
    }).join('') + '</g>' },
    aurora: { g: [[0, '#1FE0A0'], [.5, '#3B8BFF'], [1, '#A24BFF']], v: 1, x: SHINE }
  };
  /* ---------- hair: [behind the body, in front of the face]. f is the fill (a colour or a gradient) ---------- */
  var CAP = 'M16 72 C13 40 34 22 60 22 C86 22 107 40 104 72 C100 60 92 53 80 50 C68 47 52 47 40 50 C28 53 20 60 16 72 Z';
  var PART = 'M16 74 C13 40 34 22 60 22 C86 22 107 40 104 74 C100 58 86 46 60 34 C34 46 20 58 16 74 Z';
  var FRINGE = 'M15 76 C12 40 34 21 60 21 C86 21 108 40 105 76 C103 68 100 63 97 60 L88 60 L84 54 L78 60 L68 60 L64 54 L58 60 L48 60 L44 54 L38 60 L23 60 C20 63 17 68 15 76 Z';
  var SWOOP = 'M16 72 C13 40 34 22 60 22 C86 22 107 40 104 72 C101 62 96 56 90 52 C70 62 44 60 26 50 C21 56 18 63 16 72 Z';
  var WAVYB = 'M14 66 C10 36 34 23 60 23 C86 23 110 36 106 66 C116 78 106 90 114 102 C120 114 110 122 116 132 Q104 138 96 128 L24 128 Q16 138 4 132 C10 122 0 114 6 102 C14 90 4 78 14 66 Z';
  // hair that stands up (it is tucked into a short crop under a hat), hats that hide hair altogether, and hats hair can stand up through
  var TALL = { 4: 1, 13: 1, 14: 1, 19: 1, 21: 1, 25: 1, 26: 1 }, HATCOVER = { 31: 1, 32: 1, 34: 1 }, HATOPEN = { 4: 1, 10: 1, 14: 1, 19: 1, 20: 1, 27: 1, 28: 1, 30: 1, 35: 1 };
  function hair(v, f) {
    var h = hairRaw(v, f);
    if (h[1] && v !== 20) h[1] += '<path d="M33 40 Q42 30 55 27" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".22"/>';
    return h;
  }
  function hairRaw(v, f) {
    var st = ink(3.5), ln = ' fill="none" stroke="' + INK + '" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"';
    function P(d) { return '<path d="' + d + '" fill="' + f + '"' + st + '/>'; }
    function C(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + st + '/>'; }
    function R(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (w / 2) + '" fill="' + f + '"' + st + '/>'; }
    function Ln(d) { return '<path d="' + d + '"' + ln + '/>'; }
    function tie(x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="' + c + '"' + ink(2) + '/>'; }
    var fade = '<path d="' + CAP + '" fill="' + f + '" fill-opacity=".5"/>';
    function curls() {
      return [[20, 62], [21, 48], [28, 36], [39, 27], [52, 22], [68, 22], [81, 27], [92, 36], [99, 48], [100, 62]].map(function (p) { return C(p[0], p[1], 10); }).join('') +
        '<path d="M18 66 C16 44 36 28 60 28 C84 28 104 44 102 66 C94 54 80 50 60 50 C40 50 26 54 18 66 Z" fill="' + f + '"/>' +
        [[30, 53], [44, 48], [60, 46], [76, 48], [90, 53]].map(function (p) { return C(p[0], p[1], 8); }).join('');
    }
    switch (v) {
      case 1: return ['', P(CAP) + Ln('M44 30 Q48 38 46 46') + Ln('M74 30 Q72 38 76 46')];
      case 2: return ['', P(SWOOP) + Ln('M32 44 C50 54 74 52 88 42')];
      case 3: return ['', P(FRINGE)];
      case 4: return ['', P('M16 70 L14 50 L24 54 L22 34 L36 42 L40 20 L52 34 L62 12 L70 34 L84 20 L86 42 L100 34 L98 54 L106 50 L104 70 C98 58 88 50 60 50 C32 50 22 58 16 70 Z')];
      case 5: return ['', curls()];
      case 6: return [C(60, 44, 52), '<path d="M15 70 C13 42 36 26 60 26 C84 26 107 42 105 70 C97 57 82 50 60 50 C38 50 23 57 15 70 Z" fill="' + f + '"/>' +
        '<path d="M15 70 C23 57 38 50 60 50 C82 50 97 57 105 70" fill="none"' + st + '/>' + Ln('M38 20 q5 -5 10 0') + Ln('M66 12 q5 -5 10 0') + Ln('M24 36 q5 -5 10 0') + Ln('M84 30 q5 -5 10 0') + Ln('M52 34 q5 -5 10 0')];
      case 7: return [both(function (X) { return C(X(20), 28, 18); }), P(CAP)];
      case 8: return [P('M14 66 C10 36 34 23 60 23 C86 23 110 36 106 66 C112 90 116 112 114 130 Q104 136 94 128 L26 128 Q16 136 6 130 C4 112 8 90 14 66 Z'), P(PART)];
      case 9: return [P(WAVYB), P(SWOOP)];
      case 10: return [P('M12 66 C8 34 34 23 60 23 C86 23 112 34 108 66 L111 100 Q104 109 95 104 L25 104 Q16 109 9 100 Z'), P(FRINGE)];
      case 11: return [P('M92 34 C120 26 132 56 124 84 C122 98 114 108 108 112 C112 96 108 76 96 58 Z') + tie(98, 40, '#FF5B8A'), P(CAP)];
      case 12: return [both(function (X) {
        return P('M' + X(22) + ' 50 C' + X(2) + ' 50 ' + X(-8) + ' 78 ' + X(2) + ' 106 C' + X(6) + ' 112 ' + X(12) + ' 110 ' + X(12) + ' 104 C' + X(10) + ' 88 ' + X(14) + ' 72 ' + X(24) + ' 62 Z') + tie(X(19), 54, '#FFD23F');
      }), P(PART)];
      case 13: return ['', C(60, 13, 14) + P(CAP) + Ln('M53 9 Q60 4 67 9')];
      case 14: return ['', both(function (X) { return C(X(32), 19, 13); }) + P(PART)];
      case 15: return ['', P(PART) + both(function (X) {
        return [72, 86, 100, 114].map(function (y) { return '<ellipse cx="' + X(11) + '" cy="' + y + '" rx="7" ry="8.5" fill="' + f + '"' + st + '/>'; }).join('') + tie(X(11), 126, '#FF5B8A');
      })];
      case 16: return [both(function (X) {
        return [[4, 84], [13, 80], [22, 74]].map(function (b) { return R(X(b[0]) - 4, 46, 8, b[1]) + '<circle cx="' + X(b[0]) + '" cy="' + (46 + b[1]) + '" r="3.2" fill="#FFD23F"' + ink(1.5) + '/>'; }).join('');
      }), P(PART) + Ln('M60 34 L60 23') + Ln('M46 40 Q44 30 46 24') + Ln('M74 40 Q76 30 74 24') + Ln('M32 50 Q28 38 32 30') + Ln('M88 50 Q92 38 88 30')];
      case 17: return ['', P(CAP) + [-30, -18, -6, 6, 18, 30].map(function (dx) {
        return Ln('M' + (60 + dx) + ' ' + (49 + Math.abs(dx) * 0.14).toFixed(1) + ' Q' + (60 + dx * 1.12).toFixed(1) + ' 36 ' + (60 + dx * 0.8).toFixed(1) + ' 24');
      }).join('')];
      case 18: return [both(function (X) { return R(X(6) - 4.5, 44, 9, 52) + R(X(15) - 4.5, 40, 9, 60); }),
        P(CAP) + [36, 48, 60, 72, 84].map(function (x) { return R(x - 4.5, 38, 9, x === 60 ? 16 : 20); }).join('')];
      case 19: return ['', fade + P('M24 54 L22 12 Q60 2 98 12 L96 54 C88 49 74 47 60 47 C46 47 32 49 24 54 Z')];
      case 20: return ['', '<path d="' + CAP + '" fill="' + f + '" fill-opacity=".55"' + ink(2) + '/>'];
      case 21: return ['', fade + P('M48 50 C44 34 46 18 50 6 L56 20 L60 0 L64 20 L70 6 C74 18 76 34 72 50 C66 46 54 46 48 50 Z')];
      case 22: return ['', P('M14 78 C10 40 34 20 60 20 C86 20 110 40 106 78 C100 64 84 50 62 44 L60 34 L58 44 C36 50 20 64 14 78 Z')];
      case 23: return [C(60, 44, 50) + both(function (X) { return [[10, 62], [6, 78], [9, 94], [6, 110], [11, 124]].map(function (p) { return C(X(p[0]), p[1], 11); }).join(''); }), curls()];
      case 24: return ['', fade + P('M30 50 C26 30 44 16 66 18 C92 20 108 40 106 70 C100 58 90 50 76 48 C60 46 44 48 30 50 Z') + Ln('M40 44 C56 36 78 38 96 52')];
      case 25: return ['', P('M14 74 L8 48 L20 52 L14 26 L30 36 L32 8 L46 26 L58 -2 L68 24 L86 6 L86 32 L104 22 L98 48 L112 46 L104 74 L96 58 L84 64 L76 52 L64 62 L54 50 L44 62 L34 54 L24 62 Z')];
      case 26: return ['', '<g class="avfl">' + P('M18 70 C8 50 22 40 20 24 C30 30 34 22 36 6 C46 14 52 12 58 -6 C66 8 74 10 80 2 C84 18 92 22 100 18 C98 36 112 48 102 70 C98 58 88 50 60 50 C32 50 22 58 18 70 Z') + '</g>'];
      case 27: return [P(WAVYB) + '<g fill="#fff" font-size="10" text-anchor="middle"><text x="8" y="104">✦</text><text x="113" y="116">✦</text><text x="110" y="84">✦</text></g>',
        P(SWOOP) + '<g fill="#fff" font-size="9" text-anchor="middle"><text x="36" y="42">✦</text><text x="76" y="36">✦</text><text x="92" y="52">✦</text></g>'];
    }
    return ['', ''];
  }

  /* ---------- the new hats: head coverings in the outfit colour (col), a kufi and a bow ---------- */
  function hat2(v, col) {
    if (v < 31) return hat(v);
    var st = ink(3.5), ln = ' fill="none" stroke="' + INK + '" stroke-opacity=".3" stroke-width="2.5" stroke-linecap="round"';
    switch (v) {
      case 31: return '<path fill-rule="evenodd" d="M60 20 C102 20 112 58 109 98 C108 112 104 122 98 128 Q60 141 22 128 C16 122 12 112 11 98 C8 58 18 20 60 20 Z ' +   // hijab
        'M60 54 C82 54 94 70 94 90 C94 110 80 124 60 124 C40 124 26 110 26 90 C26 70 38 54 60 54 Z" fill="' + col + '"' + st + '/>' +
        '<path d="M24 60 C34 42 48 36 60 36"' + ln + '/><path d="M30 128 Q46 122 52 126"' + ln + '/><path d="M90 128 Q76 122 70 127"' + ln + '/>';
      case 32: return '<path d="M20 52 C14 22 38 4 60 4 C82 4 106 22 100 52 C88 42 74 40 60 46 C46 40 32 42 20 52 Z" fill="' + col + '"' + st + '/>' +   // turban
        '<path d="M26 44 C40 24 66 14 92 26"' + ln + '/><path d="M34 49 C46 30 70 22 96 38"' + ln + '/><path d="M60 46 C56 30 62 14 76 8"' + ln + '/>';
      case 33: return '<path d="M28 44 C28 20 42 12 60 12 C78 12 92 20 92 44 Q60 36 28 44 Z" fill="#F2EAD3"' + st + '/>' +   // kufi
        '<path d="M30 38 Q60 30 90 38" fill="none" stroke="#C9952E" stroke-width="3"/><path d="M34 30 Q60 22 86 30" fill="none" stroke="#1FA3A8" stroke-width="2.5" stroke-dasharray="4 4"/>';
      case 34: return '<path d="M22 50 C12 18 42 -2 64 0 C90 2 108 24 98 50 C84 40 40 40 22 50 Z" fill="' + col + '"' + st + '/>' +   // head wrap
        '<path d="M28 42 C42 26 70 20 94 34"' + ln + '/><path d="M36 30 C50 16 72 12 90 22"' + ln + '/>' +
        '<path d="M56 6 C44 -12 30 -4 42 10 Z" fill="' + col + '"' + st + '/><path d="M60 6 C72 -12 86 -4 74 10 Z" fill="' + col + '"' + st + '/><circle cx="58" cy="8" r="6" fill="' + col + '"' + st + '/>';
      case 35: return both(function (X) { return '<path d="M' + X(58) + ' 26 L' + X(36) + ' 12 Q' + X(31) + ' 26 ' + X(36) + ' 40 Z" fill="' + col + '"' + st + '/>'; }) +   // hair bow
        '<circle cx="60" cy="26" r="7" fill="' + col + '"' + st + '/>';
    }
    return '';
  }

  /* ---------- outfits: drawn on the lower body, inside the body's outline ---------- */
  var OTOP = 'M6 102 Q60 138 114 102 L114 156 L6 156 Z';
  var OFIX = { 5: '#F7F5F0', 8: '#F7F5F0', 14: '#EEF2F7', 15: '#AEB8C4' };   // outfits with a colour of their own (the picked colour is the trim)
  var OSLEEVE = { 2: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 14: 1, 15: 1, 16: 1, 17: '#F7F5F0', 19: 1, 20: 1 };
  function pattern(v) {
    var o = '', x, y, i;
    function w(op) { return ' fill="#fff" opacity="' + op + '"'; }
    switch (v) {
      case 1: for (y = 108; y < 152; y += 8) o += '<rect x="6" y="' + y + '" width="108" height="3.5"' + w(.5) + '/>'; return o;
      case 2: for (x = 15; x < 108; x += 9) o += '<rect x="' + x + '" y="98" width="2.2" height="60"' + w(.45) + '/>'; return o;
      case 3: for (y = 0; y < 6; y++) for (x = 14 + (y % 2) * 5; x < 108; x += 10) o += '<circle cx="' + x + '" cy="' + (110 + y * 7) + '" r="2.3"' + w(.6) + '/>'; return o;
      case 4: for (y = 0; y < 7; y++) for (x = 8 + (y % 2) * 8; x < 112; x += 16) o += '<rect x="' + x + '" y="' + (102 + y * 8) + '" width="8" height="8"' + w(.32) + '/>'; return o;
      case 5: for (i = 0; i < 3; i++) { o += '<path d="M2 ' + (126 + i * 10); for (x = 0; x < 20; x++) o += ' l6 ' + (x % 2 ? 6 : -6); o += '" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linejoin="round"/>'; } return o;
      case 6: return '<g fill="#fff" opacity=".85" font-size="9" text-anchor="middle">' + [[20, 122], [38, 134], [60, 142], [82, 134], [100, 122], [28, 144], [92, 144], [48, 151], [72, 151]].map(function (p) { return '<text x="' + p[0] + '" y="' + p[1] + '">★</text>'; }).join('') + '</g>';
      case 7: return '<g fill="#fff" opacity=".85" font-size="9" text-anchor="middle">' + [[20, 122], [38, 134], [60, 142], [82, 134], [100, 122], [28, 144], [92, 144], [48, 151], [72, 151]].map(function (p) { return '<text x="' + p[0] + '" y="' + p[1] + '">♥</text>'; }).join('') + '</g>';
      case 8: return '<path d="M6 156 L6 142 Q12 128 17 140 Q23 124 29 140 Q35 128 41 141 Q48 126 54 141 Q60 130 66 141 Q72 126 79 141 Q85 128 91 140 Q97 124 103 140 Q108 128 114 142 L114 156 Z" fill="#FFD23F" opacity=".9"/>' +
        '<path d="M6 156 L6 148 Q14 138 22 148 Q32 136 42 148 Q52 138 60 148 Q68 138 78 148 Q88 136 98 148 Q106 138 114 148 L114 156 Z" fill="#FF7A1F" opacity=".9"/>';
      case 9: return [[20, 130, 9, 5, '#000', .25], [46, 140, 11, 5, '#fff', .22], [74, 132, 10, 5, '#000', .25], [98, 142, 9, 5, '#fff', .22], [60, 148, 12, 4, '#000', .22], [30, 146, 7, 4, '#000', .2]].map(function (b) {
        return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="' + b[4] + '" opacity="' + b[5] + '"/>'; }).join('');
      case 10: return ['#FF5B5B', '#FFB020', '#FFE14D', '#4FD97A', '#53B7FF', '#9B6BFF'].map(function (c, k) { return '<path d="M6 ' + (106 + k * 5) + ' Q60 ' + (142 + k * 5) + ' 114 ' + (106 + k * 5) + '" fill="none" stroke="' + c + '" stroke-width="5.2"/>'; }).join('');
      case 11: return '<rect x="6" y="96" width="108" height="62" fill="#3B1F8A" opacity=".55"/><g fill="#fff"><circle cx="16" cy="114" r="1.3"/><circle cx="104" cy="116" r="1.5"/><circle cx="30" cy="124" r="1"/><circle cx="90" cy="126" r="1.1"/></g><g fill="#fff"><circle cx="24" cy="134" r="1.5"/><circle cx="40" cy="146" r="1.2"/><circle cx="58" cy="138" r="1.7"/><circle cx="76" cy="148" r="1.2"/><circle cx="92" cy="134" r="1.5"/><circle cx="102" cy="144" r="1"/></g>' +
        '<text x="70" y="138" font-size="8" fill="#fff" text-anchor="middle">✦</text>';
      case 12: return '<path d="M62 127 L51 140 L58 140 L54 152 L68 136 L61 136 L66 127 Z" fill="#FFE14D"' + ink(1.5) + '/>';
      case 13: return [44, 37, 30, 23, 16, 9].map(function (r, k) { return '<circle cx="60" cy="140" r="' + r + '" fill="none" stroke="' + (k % 2 ? '#000' : '#fff') + '" stroke-width="4" opacity="' + (k % 2 ? .18 : .4) + '"/>'; }).join('');
      case 14: return '<g fill="#fff" opacity=".85" font-size="10" font-weight="900" font-family="Arial,sans-serif" text-anchor="middle">' + [[18, 120, '+'], [32, 132, '÷'], [46, 142, '='], [60, 152, '+'], [74, 142, '×'], [88, 132, '−'], [102, 120, '+'], [26, 148, '×'], [94, 148, '÷']].map(function (p) { return '<text x="' + p[0] + '" y="' + p[1] + '">' + p[2] + '</text>'; }).join('') + '</g>';
      case 15: return '<path d="M6 106 Q60 142 114 106" fill="none" stroke="#FFD23F" stroke-width="3.5"/><path d="M6 146 L114 146" stroke="#FFD23F" stroke-width="3"/><path d="M6 150.5 L114 150.5" stroke="#FFD23F" stroke-width="1.5"/>';
    }
    return '';
  }
  // the line a collar follows: the outfit's top edge, from x = a to x = b
  function edge(a, b, dy) {
    function Y(x) { var t = (x - 6) / 108; return 102 + 72 * t * (1 - t) + (dy || 0); }
    var m = (a + b) / 2;
    return 'M' + a + ' ' + Y(a).toFixed(1) + ' Q' + m + ' ' + (2 * Y(m) - (Y(a) + Y(b)) / 2).toFixed(1) + ' ' + b + ' ' + Y(b).toFixed(1);
  }
  function outfit(v, col, pat, id) {
    var base = OFIX[v] || col, d = '', un = '';
    function dark(op) { return ' fill="#000" opacity="' + op + '"'; }
    function num(t, x, y, s) { return '<text x="' + x + '" y="' + y + '" font-size="' + (s || 12) + '" font-weight="900" font-family="Arial,sans-serif" fill="#fff" stroke="' + INK + '" stroke-width=".6" text-anchor="middle">' + t + '</text>'; }
    function collar(a, b, c, w, op) { return '<path d="' + edge(a, b, 1.2) + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" opacity="' + (op || 1) + '" stroke-linecap="round"/>'; }
    var hood = '<path d="' + edge(6, 114, 2) + '" fill="none" stroke="#000" stroke-width="6" opacity=".25"/><path d="M54 124 L54 135 M66 124 L66 135" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
    switch (v) {
      case 1: d = collar(44, 76, '#fff', 3, .6); break;
      case 2: d = hood + '<path d="M44 139 L76 139 L80 150 L40 150 Z"' + dark(.18) + '/>'; break;
      case 3: d = '<path d="M50 121 L60 130 L70 121" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' + num('8', 60, 147); break;
      case 4: d = collar(8, 112, '#fff', 3.5, .9) + '<rect x="6" y="98" width="12" height="60"' + ' fill="#fff" opacity=".55"/><rect x="102" y="98" width="12" height="60" fill="#fff" opacity=".55"/>' + num('23', 60, 147, 11); break;
      case 5: d = '<path d="M6 134 L38 134 L38 124 L82 124 L82 134 L114 134 L114 158 L6 158 Z" fill="' + col + '"' + ink(2) + '/>' + both(function (X) { return '<path d="M' + X(40) + ' 127 L' + X(26) + ' 104" stroke="' + INK + '" stroke-width="9"/><path d="M' + X(40) + ' 127 L' + X(26) + ' 104" stroke="' + col + '" stroke-width="5.5"/><circle cx="' + X(40) + '" cy="128" r="2.6" fill="#FFD23F"' + ink(1.2) + '/>'; }) +
          '<rect x="50" y="134" width="20" height="11" rx="2.5"' + dark(.16) + '/><rect x="50" y="134" width="20" height="11" rx="2.5" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".5"/>'; break;
      case 6: d = '<path d="M60 121 L60 156" stroke="#fff" stroke-width="2" opacity=".75"/><rect x="58" y="124" width="4" height="6" rx="1.5" fill="#C9D2DD"' + ink(1) + '/>' +
        '<path d="M42 118 L60 121 L49 132 Z"' + dark(.22) + '/><path d="M78 118 L60 121 L71 132 Z"' + dark(.22) + '/>'; break;
      case 7: d = collar(42, 78, '#fff', 6, .5); for (var x = 12; x < 112; x += 6) d += '<path d="M' + x + ' 146 L' + x + ' 156" stroke="#000" stroke-width="1.6" opacity=".22"/>'; d += '<path d="M6 146 L114 146" stroke="#000" stroke-width="1.5" opacity=".22"/>'; break;
      case 8: d = '<path d="M46 119 L60 142 L74 119 Q60 122 46 119 Z" fill="' + col + '"/><path d="M46 119 L60 142 L74 119" fill="none" stroke="' + INK + '" stroke-width="1.8" opacity=".55" stroke-linejoin="round"/>' +
        '<rect x="74" y="135" width="14" height="10" rx="1.5" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".5"/><path d="M78 131 L78 138" stroke="#2E6BD9" stroke-width="2.4" stroke-linecap="round"/>'; break;
      case 9: d = collar(44, 76, '#FFD23F', 3.5) + '<rect x="57" y="121" width="6" height="24" fill="#fff" opacity=".28"/>' + [127, 133.5, 140].map(function (y) { return '<circle cx="60" cy="' + y + '" r="1.7" fill="#FFD23F"/>'; }).join('') +
        '<path d="M6 149 L114 149" stroke="#FFD23F" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round"/>'; break;
      case 10: d = '<path d="M45 118.6 L60 143 L75 118.6 Q60 122 45 118.6 Z" fill="#fff"/><path d="M45 118.6 L60 143 L75 118.6" fill="none" stroke="' + INK + '" stroke-width="2" opacity=".6" stroke-linejoin="round"/>' +
        '<path d="M57 123 L63 123 L62 127 L64.5 139 L60 143 L55.5 139 L58 127 Z" fill="#D7263D"' + ink(1.4) + '/>'; break;
      case 11: d = '<path d="M30 113 L68 152" stroke="#fff" stroke-width="5" opacity=".9"/><path d="M90 113 L58 142" stroke="#fff" stroke-width="5" opacity=".9"/><rect x="6" y="143" width="108" height="6"' + dark(.3) + '/>'; break;
      case 12: d = '<path d="M6 124 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7" fill="none" stroke="#FFD23F" stroke-width="3" stroke-linejoin="round"/><path d="M6 134 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7" fill="none" stroke="#fff" stroke-width="3" opacity=".85" stroke-linejoin="round"/>' +
        '<path d="M6 143 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7 l9 -7 l9 7" fill="none" stroke="#FFD23F" stroke-width="3" stroke-linejoin="round"/>'; break;
      case 13: d = '<rect x="6" y="143" width="108" height="5.5" fill="#FFD23F"/><rect x="55" y="141.5" width="10" height="8.5" rx="1.5" fill="#FFF3A0"' + ink(1.3) + '/>' +
        '<circle cx="60" cy="133" r="6.5" fill="#fff"' + ink(1.5) + '/><text x="60" y="136.6" font-size="10" fill="#FFB020" text-anchor="middle">★</text>'; break;
      case 14: d = collar(8, 112, '#9AA4B2', 4.5) + '<rect x="47" y="131" width="26" height="13" rx="3" fill="' + col + '"' + ink(1.8) + '/><circle cx="53" cy="137.5" r="1.9" fill="#FF5B5B"/><circle cx="60" cy="137.5" r="1.9" fill="#FFE14D"/><circle cx="67" cy="137.5" r="1.9" fill="#4FD97A"/>'; break;
      case 15: d = '<path d="M6 116 Q60 150 114 116" fill="none" stroke="#5E6878" stroke-width="2" opacity=".6"/><path d="M6 132 Q60 148 114 132" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/><path d="M6 142 Q60 158 114 142" fill="none" stroke="#5E6878" stroke-width="2" opacity=".7"/>' +
        '<path d="M53 128 L67 128 L67 136 Q67 142 60 146 Q53 142 53 136 Z" fill="' + col + '"' + ink(1.8) + '/><circle cx="22" cy="128" r="1.6" fill="#5E6878"/><circle cx="98" cy="128" r="1.6" fill="#5E6878"/>'; break;
      case 16: d = '<path d="' + edge(6, 114, 2) + '" fill="none" stroke="#000" stroke-width="5" opacity=".22"/><path d="M60 122 L60 156" stroke="#000" stroke-width="1.6" opacity=".3"/>' +
        '<circle cx="64" cy="133" r="2.3" fill="#fff"' + ink(1.2) + '/><circle cx="64" cy="143" r="2.3" fill="#fff"' + ink(1.2) + '/>'; break;
      case 17: d = collar(40, 80, '#fff', 4, .9) + '<path d="M60 122 L60 156" stroke="#fff" stroke-width="1.6" opacity=".6"/>' + num('S', 38, 137, 14) + '<path d="M6 147 L114 147 M6 151 L114 151" stroke="#fff" stroke-width="2" opacity=".85"/>'; break;
      case 18: d = '<rect x="30" y="98" width="9" height="60" fill="#fff" opacity=".7"/><rect x="81" y="98" width="9" height="60" fill="#fff" opacity=".7"/><path d="M50 121 L60 130 L70 121" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="60" cy="142" r="6.5" fill="#FFD23F"' + ink(1.5) + '/><text x="60" y="145.6" font-size="10" font-weight="900" font-family="Arial,sans-serif" fill="' + INK + '" text-anchor="middle">C</text>'; break;
      case 19: d = hood + '<circle class="avlz" cx="60" cy="143" r="9" fill="#fff" opacity=".3"/><path d="M54.5 143 a5.5 5.5 0 1 1 2.2 4.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M53.2 146 L57.2 148 L57 143.6 Z" fill="#fff"/>'; break;
      case 20: d = '<path d="M38 117 L57 156 M82 117 L63 156" stroke="#FFD23F" stroke-width="4.5"/><path d="M6 149 L114 149" stroke="#FFD23F" stroke-width="3"/><text x="86" y="140" font-size="9" fill="#FFD23F" text-anchor="middle">✦</text><text x="30" y="142" font-size="7" fill="#FFD23F" text-anchor="middle">✦</text>'; break;
    }
    return '<g clip-path="url(#' + id + 'o)"><rect x="6" y="96" width="108" height="64" fill="' + base + '"/>' + pattern(pat) + d + '</g>' +
      '<path d="M6 102 Q60 138 114 102" fill="none" stroke="' + INK + '" stroke-width="3"/>' + un;
  }

  /* ---------- little face details (fill: the body colour) ---------- */
  function face(v, fill) {
    var s = ' stroke="' + INK + '" stroke-linecap="round"';
    switch (v) {
      case 1: return '<g fill="#8A4B24" opacity=".6">' + [[29, 94], [34, 91], [39, 95], [32, 99], [81, 95], [86, 91], [91, 94], [88, 99]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.5"/>'; }).join('') + '</g>';
      case 2: return '<ellipse cx="33" cy="98" rx="9" ry="6" fill="#FF5B8A" opacity=".5"/><ellipse cx="87" cy="98" rx="9" ry="6" fill="#FF5B8A" opacity=".5"/>';
      case 3: return '<circle cx="80" cy="109" r="2.2" fill="' + INK + '"/>';
      case 4: return '<g transform="rotate(-22 36 60)"><rect x="26" y="56" width="20" height="8" rx="4" fill="#F2C9A0"' + ink(1.6) + '/><rect x="32.5" y="57.5" width="7" height="5" rx="1" fill="#E0A872"/></g>';
      case 5: return '<path d="M35 63 Q45 57 55 62" fill="none"' + s + ' stroke-width="4.5"/><path d="M65 62 Q75 57 85 63" fill="none"' + s + ' stroke-width="4.5"/>';
      case 6: return '<path d="M41 103 Q39 107 42 110" fill="none"' + s + ' stroke-width="2.4"/><path d="M79 103 Q81 107 78 110" fill="none"' + s + ' stroke-width="2.4"/>';
      case 7: return both(function (X) { return '<path d="M' + X(20) + ' 74 Q' + X(11) + ' 76 ' + X(13) + ' 88 Q' + X(15) + ' 94 ' + X(20) + ' 92" fill="none" stroke="' + INK + '" stroke-width="6.5" stroke-linecap="round"/>' +
        '<path d="M' + X(20) + ' 74 Q' + X(11) + ' 76 ' + X(13) + ' 88 Q' + X(15) + ' 94 ' + X(20) + ' 92" fill="none" stroke="#53B7FF" stroke-width="3.6" stroke-linecap="round"/>'; });
      case 8: return '<circle cx="60" cy="61" r="3" fill="#D7263D"' + ink(1) + '/>';
      case 9: return '<path d="M86 89 l2.2 4.6 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7 Z" fill="#FFE14D"' + ink(1.4) + '/>';
      case 10: return '<path d="M34 102 C28 96 24 92 28 89 C31 87 34 90 34 92 C34 90 37 87 40 89 C44 92 40 96 34 102 Z" fill="#FF4D7A"' + ink(1.4) + '/>';
      case 11: return '<path d="M88 52 L80 66 L86 66 L82 78 L94 62 L88 62 L92 52 Z" fill="#FFE14D"' + ink(1.5) + '/>';
      case 12: return '<g fill="#fff" text-anchor="middle"><text x="30" y="97" font-size="8">✦</text><text x="37" y="103" font-size="6">✦</text><text x="89" y="97" font-size="8">✦</text><text x="83" y="103" font-size="6">✦</text></g>' +
        '<g fill="#FFE14D"><circle cx="34" cy="92" r="1.2"/><circle cx="86" cy="104" r="1.2"/><circle cx="92" cy="101" r="1"/></g>';
      case 13: return both(function (X) { return '<path d="M' + X(38) + ' 96 L' + X(22) + ' 92 M' + X(38) + ' 100 L' + X(21) + ' 100 M' + X(38) + ' 104 L' + X(22) + ' 108" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>'; }) +
        '<ellipse cx="60" cy="96" rx="4" ry="3" fill="' + INK + '"/>';
      case 14: return '<rect x="34" y="92" width="20" height="5" rx="2" fill="' + INK + '" opacity=".85"/><rect x="66" y="92" width="20" height="5" rx="2" fill="' + INK + '" opacity=".85"/>';
      case 15: return '<g fill="#fff" opacity=".42"><ellipse cx="80" cy="66" rx="13" ry="9" transform="rotate(20 80 66)"/><ellipse cx="42" cy="112" rx="10" ry="6" transform="rotate(-15 42 112)"/><ellipse cx="26" cy="84" rx="6" ry="9"/><ellipse cx="92" cy="104" rx="5" ry="7"/></g>';
      case 16: return both(function (X) { return '<path d="M' + X(18) + ' 86 L' + X(32) + ' 92 L' + X(19) + ' 95 Z M' + X(17) + ' 100 L' + X(30) + ' 104 L' + X(19) + ' 109 Z M' + X(44) + ' 44 L' + X(50) + ' 58 L' + X(54) + ' 42 Z" fill="' + INK + '" opacity=".8"/>'; });
      case 17: return '<g fill="#FFD23F" stroke="' + INK + '" stroke-width=".6" text-anchor="middle" font-size="7"><text x="29" y="97">★</text><text x="36" y="93">★</text><text x="37" y="102">★</text><text x="84" y="93">★</text><text x="91" y="97">★</text><text x="83" y="102">★</text></g>';
    }
    return '';
  }

  /* ---------- backdrops: a round scene behind the avatar (only where a page asks: svg(look, {bg: true})) ---------- */
  function backdrop(v, id) {
    var g = '', d = '', i;
    function grad(stops, r) { d += (r ? '<radialGradient id="' + id + 'b" cx=".5" cy=".5" r=".6">' : '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1">') + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + (r ? '</radialGradient>' : '</linearGradient>'); return '<rect x="-14" y="0" width="148" height="150" fill="url(#' + id + 'b)"/>'; }
    function stars(n, col) { var o = '<g fill="' + (col || '#fff') + '">'; for (var k = 0; k < n; k++) { var h = hash('st' + v + k); o += '<circle cx="' + (-8 + h % 136) + '" cy="' + (6 + (h >>> 8) % 100) + '" r="' + (0.8 + (h >>> 16) % 3 * 0.5) + '"/>'; } return o + '</g>'; }
    switch (v) {
      case 1: g = grad([[0, '#6EC6FF'], [1, '#D6F2FF']]) + '<circle cx="104" cy="30" r="14" fill="#FFE14D"/><g fill="#fff"><ellipse cx="14" cy="40" rx="16" ry="7"/><ellipse cx="24" cy="34" rx="10" ry="7"/><ellipse cx="96" cy="70" rx="14" ry="6"/></g><path d="M-14 128 Q60 112 134 128 L134 150 L-14 150 Z" fill="#6BCB5A"/>'; break;
      case 2: g = grad([[0, '#0E1440'], [1, '#2B2F7A']]) + stars(22) + '<circle cx="100" cy="30" r="12" fill="#FFF3B0"/><circle cx="105" cy="26" r="11" fill="#141B52"/><path d="M-14 132 Q60 118 134 132 L134 150 L-14 150 Z" fill="#141B52"/>'; break;
      case 3: g = '<rect x="-14" y="0" width="148" height="150" fill="#F7F3E3"/>'; for (i = -8; i < 136; i += 12) g += '<path d="M' + i + ' 0 L' + i + ' 150 M-14 ' + (i + 10) + ' L134 ' + (i + 10) + '" stroke="#9BC7E8" stroke-width="1"/>';
        g += '<path d="M-10 134 L130 22" stroke="#E8452C" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="113" r="3.5" fill="#E8452C"/><circle cx="106" cy="41" r="3.5" fill="#E8452C"/>'; break;
      case 4: g = grad([[0, '#5B2A86'], [.45, '#E8457C'], [.75, '#FF8A5B'], [1, '#FFD23F']]) + '<circle cx="60" cy="96" r="34" fill="#FFE9A0" opacity=".85"/><path d="M-14 120 L134 120 M-14 130 L134 130 M-14 140 L134 140" stroke="#5B2A86" stroke-width="3" opacity=".35"/>'; break;
      case 5: g = grad([[0, '#8FE3FF'], [.5, '#2E9BD9'], [1, '#0E3F8A']]); for (i = 0; i < 4; i++) g += '<path d="M-14 ' + (78 + i * 18) + ' q9 -8 18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0" fill="none" stroke="#fff" stroke-width="2.5" opacity="' + (.6 - i * .1) + '"/>';
        g += '<circle cx="24" cy="30" r="9" fill="#FFF3B0" opacity=".9"/>'; break;
      case 6: g = grad([[0, '#BFEFD0'], [1, '#3F9E62']]); [[-2, 122, 26], [26, 128, 20], [100, 124, 24], [126, 130, 18], [84, 132, 14]].forEach(function (t) { g += '<path d="M' + (t[0] - t[2] / 2) + ' ' + t[1] + ' L' + t[0] + ' ' + (t[1] - t[2] * 2.2) + ' L' + (t[0] + t[2] / 2) + ' ' + t[1] + ' Z" fill="#1F6B3F"/>'; });
        g += '<rect x="-14" y="124" width="148" height="30" fill="#2A7D4A"/>'; break;
      case 7: g = grad([[0, '#FFD98A'], [1, '#FFB45C']]) + '<circle cx="98" cy="34" r="16" fill="#FFF3B0"/><path d="M-14 112 Q30 84 70 108 Q100 124 134 96 L134 150 L-14 150 Z" fill="#E8A04A"/><path d="M-14 130 Q40 104 90 128 Q112 138 134 124 L134 150 L-14 150 Z" fill="#C9792E"/>' +
        '<path d="M14 108 L14 92 M14 98 Q8 96 8 90 M14 102 Q20 100 20 93" fill="none" stroke="#2F8F4E" stroke-width="3.5" stroke-linecap="round"/>'; break;
      case 8: g = grad([[0, '#1B1444'], [1, '#4A2A7A']]) + stars(10); [[-12, 60, 18], [8, 84, 16], [26, 46, 20], [48, 96, 14], [78, 70, 18], [98, 40, 20], [120, 88, 16]].forEach(function (b, k) {
        g += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + (150 - b[1]) + '" fill="#120C2E"/>'; for (var y = b[1] + 6; y < 140; y += 10) for (var x = b[0] + 3; x < b[0] + b[2] - 3; x += 6) if (hash('w' + k + x + y) % 3) g += '<rect x="' + x + '" y="' + y + '" width="3" height="4" fill="#FFE14D" opacity=".85"/>'; }); break;
      case 9: g = grad([[0, '#7B3FE4'], [.6, '#2B1A6B'], [1, '#0B0824']], 1) + stars(26) + '<ellipse cx="60" cy="74" rx="64" ry="20" fill="none" stroke="#FF9BE1" stroke-width="3" opacity=".5" transform="rotate(-18 60 74)"/><circle cx="18" cy="32" r="7" fill="#FFB020"/><circle cx="108" cy="112" r="5" fill="#3BFFE1"/>'; break;
      case 10: g = '<rect x="-14" y="0" width="148" height="150" fill="#15121F"/><path d="M34 0 L-14 150 L60 150 Z" fill="#FFF3B0" opacity=".22"/><path d="M86 0 L60 150 L134 150 Z" fill="#FFF3B0" opacity=".22"/><ellipse cx="60" cy="140" rx="60" ry="12" fill="#FFF3B0" opacity=".35"/>'; break;
      case 11: g = grad([[0, '#1A0B3B'], [.6, '#5B1E8A'], [1, '#FF4DA6']]) + '<circle cx="60" cy="66" r="30" fill="#FFD23F"/><path d="M28 62 L92 62 M30 72 L90 72 M34 82 L86 82" stroke="#5B1E8A" stroke-width="3"/><rect x="-14" y="98" width="148" height="56" fill="#150A30"/>';
        for (i = 0; i < 5; i++) g += '<path d="M-14 ' + (102 + i * i * 3) + ' L134 ' + (102 + i * i * 3) + '" stroke="#3BFFE1" stroke-width="1.5" opacity=".8"/>'; for (i = -6; i <= 6; i++) g += '<path d="M' + (60 + i * 6) + ' 98 L' + (60 + i * 30) + ' 150" stroke="#3BFFE1" stroke-width="1.5" opacity=".8"/>'; break;
      case 12: g = grad([[0, '#071A2E'], [1, '#12355A']]) + stars(14) + '<path d="M-14 50 Q20 10 50 44 T110 34 T134 50 L134 76 Q100 50 70 74 T-14 80 Z" fill="#3BFFA8" opacity=".5"/><path d="M-14 70 Q30 40 60 66 T134 60 L134 84 Q90 70 60 88 T-14 96 Z" fill="#9B6BFF" opacity=".45"/>' +
        '<path d="M-14 132 L20 108 L44 126 L72 100 L104 128 L134 110 L134 150 L-14 150 Z" fill="#0B2038"/>'; break;
      case 13: g = grad([[0, '#FFF3A0'], [.5, '#FFC94A'], [1, '#E8851F']], 1); for (i = 0; i < 12; i++) g += '<path d="M60 74 L' + (60 + 110 * Math.cos(i * Math.PI / 6 - .12)).toFixed(1) + ' ' + (74 + 110 * Math.sin(i * Math.PI / 6 - .12)).toFixed(1) + ' L' + (60 + 110 * Math.cos(i * Math.PI / 6 + .12)).toFixed(1) + ' ' + (74 + 110 * Math.sin(i * Math.PI / 6 + .12)).toFixed(1) + ' Z" fill="#fff" opacity=".35"/>'; break;
      case 14: g = '<rect x="-14" y="0" width="148" height="150" fill="#1B1824"/>'; ['#FF5B5B', '#FFB020', '#FFE14D', '#4FD97A', '#53B7FF', '#9B6BFF'].forEach(function (c, k) { for (var j = 0; j < 2; j++) { var a = (k + j * 6) * Math.PI / 6;
        g += '<path d="M60 74 L' + (60 + 110 * Math.cos(a)).toFixed(1) + ' ' + (74 + 110 * Math.sin(a)).toFixed(1) + ' L' + (60 + 110 * Math.cos(a + Math.PI / 6)).toFixed(1) + ' ' + (74 + 110 * Math.sin(a + Math.PI / 6)).toFixed(1) + ' Z" fill="' + c + '" opacity=".85"/>'; } }); break;
      case 15: g = grad([[0, '#9BDCFF'], [1, '#E9F7FF']]) + '<path d="M-14 150 L24 70 L44 100 L74 40 L104 96 L118 80 L134 110 L134 150 Z" fill="#6E7FA8"/><path d="M74 40 L62 64 L70 60 L76 68 L82 58 L88 66 Z" fill="#fff"/>' +
        '<path d="M74 40 L74 22" stroke="' + INK + '" stroke-width="2.5"/><path d="M74 22 L90 27 L74 32 Z" fill="#E8452C"' + ink(1.5) + '/>'; break;
      default: return ['', ''];
    }
    return [d + '<clipPath id="' + id + 'd"><circle cx="60" cy="74" r="72"/></clipPath>', '<g clip-path="url(#' + id + 'd)">' + g + '</g><circle cx="60" cy="74" r="72" fill="none" stroke="' + INK + '" stroke-width="3" opacity=".55"/>'];
  }

  // the whole character, as an SVG string. o.walk: feet and bob animate. o.size: width in px (height follows).
  // o.bg: draw the look's backdrop too (off by default, so the games' sprites stay clean). o.still: no move animation
  var ARMS = { 2: 'wave', 5: 'up', 9: 'up', 10: 'up', 12: 'up' };
  function svg(code, o) {
    o = o || {};
    var L = decode(code), id = 'av' + (++uid), B = CAT.b.items[L.b], fill = B.c, defs = '', extra = '', F = FX[B.fx];
    var ghost = L.k === 10, body = ghost ? GHOST : BODY;
    if (F && F.g) {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="' + (F.v ? 0 : 1) + '" y2="1">' + F.g.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
      fill = 'url(#' + id + 'g)';
    }
    if ((F && F.x) || L.o || L.f === 15) defs += '<clipPath id="' + id + 'c"><path d="' + body + '"/></clipPath>';
    if (F && F.x) extra = '<g clip-path="url(#' + id + 'c)">' + F.x + '</g>';
    // hair (hidden by a hijab, turban or head wrap; tall styles tuck under a hat)
    var hb = '', hf = '';
    if (L.r && !HATCOVER[L.h]) {
      var HI = CAT.r.items[L.r], HC = CAT.c.items[L.c] || CAT.c.items[0], hcol = HC.c, hg = HI.g || HC.g;
      if (hg) { defs += '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="0" y2="1">' + hg.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>'; hcol = 'url(#' + id + 'h)'; }
      var hh = hair(L.h && !HATOPEN[L.h] && TALL[L.r] ? 1 : L.r, hcol); hb = hh[0]; hf = hh[1];
    }
    // outfit, in its colour; long sleeves colour the arms too
    var OC = (CAT.q.items[L.q] || CAT.q.items[0]).c, fit = '', arm = fill;
    if (L.o) {
      defs += '<clipPath id="' + id + 'o"><path d="' + OTOP + '"/></clipPath>';
      fit = '<g clip-path="url(#' + id + 'c)">' + outfit(L.o, OC, L.w, id) + '</g>';
      var sl = OSLEEVE[L.o]; if (sl) arm = sl === 1 ? (OFIX[L.o] || OC) : sl;
    }
    var bd = o.bg && L.g ? backdrop(L.g, id) : ['', '']; defs += bd[0];
    var X = L.x, XF = X.slice().sort(function (i, j) { return xrank(i) - xrank(j); });
    function all(f, list) { return (list || X).map(f).join(''); }
    var w = o.size || 120, st = ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"', foot = L.k === 5 ? '#FFA53B' : fill, am = ARMS[L.j];
    function armAt(right, up) {
      var x = right ? 105 : 15;
      return up ? '<ellipse cx="' + (right ? 109 : 11) + '" cy="74" rx="8" ry="14" transform="rotate(' + (right ? 26 : -26) + ' ' + (right ? 109 : 11) + ' 74)" fill="' + arm + '"' + st + '/>'
        : '<ellipse cx="' + x + '" cy="100" rx="8" ry="13" fill="' + arm + '"' + st + '/>';
    }
    var arms = armAt(false, am === 'up') + (am === 'wave' ? '<g class="avwv">' + armAt(true, true) + '</g>' : armAt(true, am === 'up'));
    var bod = '<g class="avbod">' + all(extraBack) + kBack(L.k, fill) + hb + arms +
      '<path d="' + body + '" fill="' + fill + '"' + st + '/>' + extra + kFront(L.k) + fit +
      '<ellipse cx="34" cy="98" rx="6" ry="4" fill="#FF7AA8" opacity=".45"/><ellipse cx="86" cy="98" rx="6" ry="4" fill="#FF7AA8" opacity=".45"/>' +
      (L.f === 15 ? '<g clip-path="url(#' + id + 'c)">' + face(15, fill) + '</g>' : face(L.f, fill)) +
      eyes(L.e, fill) + mouth(L.m) + hf + all(extraFront, XF) + hat2(L.h, OC) + '</g>';
    if (ghost) bod = '<g class="avgh">' + bod + '</g>';
    return '<svg class="av' + (o.walk ? ' walk' : '') + '" viewBox="-20 -24 160 184" width="' + w + '" height="' + Math.round(w * 184 / 160) + '" role="img" aria-label="' + (o.label || 'Avatar') + '" xmlns="http://www.w3.org/2000/svg">' +
      (defs ? '<defs>' + defs + '</defs>' : '') + bd[1] +
      (ghost ? '<ellipse cx="60" cy="156" rx="30" ry="5" fill="rgba(0,0,0,.18)"/>' : '<ellipse cx="60" cy="154" rx="40" ry="6" fill="rgba(0,0,0,.25)"/>') +
      pet(L.p) + '<g class="avps' + (L.j && !o.still ? ' avp' + L.j : '') + '">' + all(extraUnder) +
      (ghost ? '' : '<g class="avft l"><ellipse cx="44" cy="146" rx="13" ry="7" fill="' + foot + '"' + st + '/></g><g class="avft r"><ellipse cx="76" cy="146" rx="13" ry="7" fill="' + foot + '"' + st + '/></g>') +
      bod + '</g>' + trail(L.t, id) + '</svg>';
  }
  function nameCls(code) { return 'avn avn' + decode(code).n; }

  /* ---------- levels (the same curve as the arcade level in sfa-lesson.js) ---------- */
  var TITLES = ['Rookie', 'Scout', 'Brawler', 'Ranger', 'Knight', 'Champion', 'Hero', 'Captain', 'Legend', 'Mythic'];
  function need(n) { return 75 * n * (n - 1); }
  function level(xp) { var n = 1; while (n < 30 && (xp || 0) >= need(n + 1)) n++; return n; }
  function title(n) { return TITLES[Math.min(n, TITLES.length) - 1] + (n > TITLES.length ? ' ' + '★'.repeat(Math.min(5, n - TITLES.length)) : ''); }

  /* ---------- the profile ---------- */
  var KEY = 'g99';
  function profile() { var P = SFA.store ? SFA.store.get(KEY, null) : null; if (!P || typeof P.xp !== 'number') P = { xp: 0, games: {}, got: {} }; P.own = P.own || {}; P.les = P.les || {}; P.spent = P.spent || 0; return P; }
  function save(P) {
    quiet = true; SFA.store.set(KEY, P); quiet = false;
    dirty = false; sentAt = Date.now();
    try { if (SFA.sync && SFA.sync.report) SFA.sync.report(KEY, P, SUMMARY(P)); } catch (e) { }
    changed();
  }
  /* The look is kept in two parts: P.look is the classic look (at most 12 characters: what the live lesson sends to the
     class) and P.lx the extended part (hair, outfit, title…). myLook() joins them; setLook() splits a joined code. */
  function myLook(P, seed) { P = P || profile(); return join(P.look || defLook(seed), P.lx); }
  function setLook(P, code) { var L = decode(code); P.look = encClassic(L); P.lx = encExt(L); return P; }
  // a "zlookx1" answer ("lk1;<look>;<level>" or, once the lesson sends it, "lk1;<look>;<level>;<extended>") -> the whole look
  function fromWire(answer) { var m = String(answer || '').match(/^lk1;([0-9a-z]{1,12})(?:;\d+;([0-9a-z]{1,16}))?/); return m ? join(m[1], m[2]) : null; }
  function owns(P, k, i) {
    var it = CAT[k] && CAT[k].items[i]; if (!it) return false;
    if (it.u) return stat(P, it.u[0]) >= it.u[1];
    return !it.p || !!(P.own || {})[k + i];
  }
  // 0 common, 1 uncommon, 2 rare, 3 epic, 4 legendary
  var RARE = [{ n: 'Common', c: '#9AA4B2' }, { n: 'Uncommon', c: '#4FD97A' }, { n: 'Rare', c: '#53B7FF' }, { n: 'Epic', c: '#B48CFF' }, { n: 'Legendary', c: '#FFC94A' }];
  function rarity(k, i) { var it = CAT[k] && CAT[k].items[i]; if (!it) return 0; if (it.r != null) return it.r; var p = it.p || 0; return !p ? 0 : p <= 60 ? 1 : p <= 120 ? 2 : p <= 200 ? 3 : 4; }

  /* ---------- effort: showing up, having a go, retrying, improving, joining in ----------
     Kept in the profile as P.ef, so it follows the student. Nothing here depends on being right or fast.
       t tries (lesson answers, review problems, arcade levels)   rt retries after a mistake   fx wrong answers turned right
       up review-skill level-ups   gl arcade levels   days days with at least one go   st / bst streak now / best
       ld the last active day   qd quests finished   hp partner helps (see note())   c coins earned by effort
       day / wk: this day's and this week's counts and claimed quests   sn: the totals last seen, so new work is counted once
     Work is noticed two ways: the page's storage is watched (a lesson answer changing is seen the moment it is saved),
     and the saved totals are compared with the last ones seen (so arcade levels and review problems done on pages
     that don't load this file are counted the next time any page does). */
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  function weekOf(day) { return Math.floor((day + 4) / 7); }   // weeks run Sunday to Saturday
  var GRACE = 4;   // a streak carries on if you come back within 4 days: a weekend plus one missed day never breaks it
  function ef(P) {
    var E = P.ef = P.ef || {};
    ['t', 'rt', 'fx', 'up', 'gl', 'days', 'st', 'bst', 'ld', 'qd', 'hp', 'c'].forEach(function (k) { E[k] = +E[k] || 0; });
    E.day = E.day || { id: 0 }; E.wk = E.wk || { id: 0 }; E.day.c = E.day.c || {}; E.wk.c = E.wk.c || {};
    return E;
  }
  function stat(P, k) {
    var E = (P && P.ef) || {}, g = (P && P.games) || {};
    switch (k) {
      case 'tries': return E.t || 0; case 'days': return E.days || 0; case 'streak': return E.bst || 0; case 'retry': return E.rt || 0; case 'fix': return E.fx || 0;
      case 'quests': return E.qd || 0; case 'ups': return E.up || 0; case 'glv': return E.gl || 0; case 'sty': return E.sty ? 1 : 0;
      case 'team': return (g.r || 0) + (g.c || 0) + (g.b || 0) + 2 * (E.hp || 0);
    }
    return 0;
  }
  var STAT = { tries: ['go at anything', 'goes at anything'], days: ['day shown up', 'days shown up'], streak: ['-day streak', '-day streak'], retry: ['retry after a mistake', 'retries after a mistake'],
    fix: ['wrong answer turned right', 'wrong answers turned right'], quests: ['quest', 'quests'], ups: ['review level-up', 'review level-ups'], team: ['class game joined', 'class games joined'],
    glv: ['arcade level', 'arcade levels'], sty: ['look of your own', 'look of your own'] };
  // "5 retries after a mistake", "a 3-day streak"
  function needText(u) { var s = STAT[u[0]] || ['', '']; return u[0] === 'streak' ? 'a ' + u[1] + s[0] : u[1] + ' ' + s[u[1] === 1 ? 0 : 1]; }

  /* quests: three small ones a day (about ten minutes for anyone), two a week. Finished quests are claimed with a tap;
     one left unclaimed is paid out by itself when the day or week turns over, so nothing is ever lost. */
  var QPOOL = [
    { id: 'r1', e: '↩️', n: 'Try one again after a mistake', d: 'Get one wrong in a lesson or the review, then have another go.', k: 'r', need: 1, c: 15, go: 'review-u2.html' },
    { id: 'g1', e: '🕹️', n: 'Finish 1 arcade level', d: 'Any game, any level. The first levels are gentle.', k: 'g', need: 1, c: 15, go: '#games' },
    { id: 'p3', e: '📝', n: 'Do 3 review problems', d: 'Guided or on your own, right or wrong.', k: 'p', need: 3, c: 15, go: 'review-u2.html' },
    { id: 'l3', e: '📚', n: 'Answer 3 lesson questions', d: 'Open any lesson and answer. Right or wrong counts.', k: 'l', need: 3, c: 15, go: 'lessons.html' },
    { id: 'u1', e: '📈', n: 'Move up a level on a review skill', d: 'For example from Limited to Emerging.', k: 'u', need: 1, c: 25, go: 'review-u2.html' }
  ];
  var TRIPLE = 10;
  function dayQuests(D) {
    var rot = QPOOL[(D.id || 0) % QPOOL.length];
    return [
      { id: 'show', e: '👋', n: 'Show up', d: 'You are here. That counts.', have: 1, need: 1, c: 5 },
      { id: 't5', e: '💪', n: 'Have 5 goes at anything', d: 'Lesson questions, review problems and arcade levels all count, right or wrong.', have: D.t || 0, need: 5, c: 15, go: 'lessons.html' },
      { id: rot.id, e: rot.e, n: rot.n, d: rot.d, have: D[rot.k] || 0, need: rot.need, c: rot.c, go: rot.go }
    ].map(function (q) { q.done = q.have >= q.need; q.got = !!(D.c || {})[q.id]; q.have = Math.min(q.have, q.need); return q; });
  }
  function weekQuests(W) {
    var alt = (W.id || 0) % 2 ? { id: 'wt', e: '🏋️', n: 'Have 25 goes this week', d: 'Anything counts, right or wrong.', have: W.t || 0, need: 25, c: 40 }
      : { id: 'wr', e: '🔁', n: 'Try again after 3 mistakes this week', d: 'A wrong answer is a first draft.', have: W.r || 0, need: 3, c: 40 };
    return [{ id: 'w3', e: '📅', n: 'Show up on 3 days this week', d: 'Any 3 days. A day counts once you have a go at something.', have: W.d || 0, need: 3, c: 40 }, alt]
      .map(function (q) { q.done = q.have >= q.need; q.got = !!(W.c || {})[q.id]; q.have = Math.min(q.have, q.need); q.week = true; return q; });
  }
  function pay(E, box, q) { if (!q.done || box.c[q.id]) return 0; box.c[q.id] = 1; E.c += q.c; E.qd++; return q.c; }
  function triple(E) { var D = E.day; if (D.c.all || !dayQuests(D).every(function (q) { return q.got; })) return 0; D.c.all = 1; E.c += TRIPLE; return TRIPLE; }
  // a new day or week: pay out anything finished but unclaimed, then start fresh
  function roll(E) {
    var d = today(), w = weekOf(d), ch = false;
    if (E.day.id !== d) { if (E.day.id) { dayQuests(E.day).forEach(function (q) { pay(E, E.day, q); }); triple(E); } E.day = { id: d, t: 0, r: 0, g: 0, p: 0, u: 0, l: 0, c: {} }; ch = true; }
    if (E.wk.id !== w) { if (E.wk.id) weekQuests(E.wk).forEach(function (q) { pay(E, E.wk, q); }); E.wk = { id: w, t: 0, r: 0, d: 0, c: {} }; ch = true; }
    return ch;
  }
  // the first go of a day: the streak, the day count and a small thank-you for showing up
  function active(E) {
    var d = E.day.id; if (E.ld === d) return;
    E.st = E.ld && d - E.ld <= GRACE ? E.st + 1 : 1; E.bst = Math.max(E.bst, E.st); E.ld = d; E.days++; E.wk.d = (E.wk.d || 0) + 1; E.c += 5;
    E.log = (E.log || []).filter(function (x) { return x > d - 21; }); E.log.push(d);
  }
  var DAYKEY = { les: 'l', game: 'g', prac: 'p' };
  function credit(E, kind, n) {
    n = Math.round(+n) || 0; if (n <= 0) return;
    roll(E);
    var D = E.day, W = E.wk;
    if (DAYKEY[kind]) { E.t += n; D.t += n; W.t += n; D[DAYKEY[kind]] = (D[DAYKEY[kind]] || 0) + n; if (kind === 'game') E.gl += n; active(E); }
    else if (kind === 'retry') { E.rt += n; D.r += n; W.r += n; var p = Math.min(n, Math.max(0, 5 - (D.rc || 0))); D.rc = (D.rc || 0) + p; E.c += 3 * p; active(E); }   // 3 coins a retry, for the first 5 of a day
    else if (kind === 'fix') E.fx += n;
    else if (kind === 'up') { E.up += n; D.u += n; E.c += 10 * n; }
    else if (kind === 'help') { var h = Math.min(n, Math.max(0, 5 - (D.hc || 0))); D.hc = (D.hc || 0) + h; E.hp += n; E.c += 5 * h; active(E); }
  }
  // the Unit 2 Review's mastery level for one skill (the same rule as review-u2.js: 0 not started … 4 deep)
  function rlvl(t) {
    if (!t || (!t.n && !t.g && !t.tried)) return 0;
    var h = t.h || [], last = h.slice(-4), right = last.reduce(function (a, b) { return a + b; }, 0), all = h.reduce(function (a, b) { return a + b; }, 0);
    if (t.dev || (last.length >= 3 && right >= 3)) return t.s >= 2 ? 4 : 3;
    if ((t.g >= 1 && all >= 1) || all >= 2) return 2;
    return 1;
  }
  function totals(P) {
    var a = lessons(P).n, g = 0, p = 0, R = SFA.store.get('g90', null), rs = {};
    for (var i = 1; i <= 30; i++) { var G = SFA.store.get('g' + i, null); if (G && G.done) g += Object.keys(G.done).length; }
    if (R && R.t) Object.keys(R.t).forEach(function (id) { var t = R.t[id] || {}, h = t.h || []; p += (t.n || 0) + (t.g || 0) + (t.s || 0); rs[id] = [t.n || 0, h.length && h[h.length - 1] === 0 ? 1 : 0, rlvl(t)]; });
    return { a: a, g: g, p: p, rs: rs };
  }
  var dirty = false, sentAt = 0, quiet = false;
  // the signed-in student (pages without sfa-sync.js read the saved sign-in)
  function me() { var S = SFA.sync; return S ? S.me : (SFA.store ? SFA.store.get('sync.me', null) : null); }
  // effort is only counted for a known student (or on a copy of the arcade with saving switched off), never on teacher pages
  function tracking() { var S = SFA.sync, on = S ? S.on : !!(window.SFA_CONFIG && window.SFA_CONFIG.endpoint); return !!SFA.store && (!on || !!me()) && !/^(class|teacher|participation|report|day|climb-teacher|review-u2-teacher)\.html$/.test((location.pathname.split('/').pop() || '').toLowerCase()) && !/[?&](screen|teach)\b/.test(location.search); }
  // keep the profile here, and send it to the Sheet now and then (at once when something was earned)
  function keep(P, now) {
    quiet = true; SFA.store.set(KEY, P); quiet = false; dirty = true;
    if (now || Date.now() - sentAt > 90000) send(P);
  }
  function send(P) { if (!dirty) return; dirty = false; sentAt = Date.now(); P = P || profile(); try { if (SFA.sync && SFA.sync.report) SFA.sync.report(KEY, P, SUMMARY(P)); } catch (e) { } }
  function SUMMARY(P) { return { levels: [], levelsDone: 0, levelsTotal: 0, coreDone: 0, coreTotal: 0, standard: false, specials: [], assisted: 0, tickets: Math.min(9999, P.xp || 0) }; }
  var listeners = [];
  function changed() { listeners.forEach(function (f) { try { f(); } catch (e) { } }); }
  // compare what is saved with what was last seen, and count the new work
  function tick() {
    if (!tracking()) return null;
    var P = profile(), E = ef(P), ch = roll(E), T = totals(P), S0 = E.sn;
    if (!S0) {
      // the first time: everything done so far counts towards the effort unlocks (not towards today's quests)
      var L = lessons(P), ups = 0; Object.keys(T.rs).forEach(function (id) { ups += Math.max(0, T.rs[id][2] - 1); });
      E.t = Math.max(E.t, T.a + T.g + T.p); E.gl = Math.max(E.gl, T.g); E.up = Math.max(E.up, ups); E.days = Math.max(E.days, L.joined);
      E.sn = { a: T.a, g: T.g, p: T.p, rs: T.rs }; ch = true;
    } else {
      var da = T.a - (S0.a || 0), dg = T.g - (S0.g || 0), dp = T.p - (S0.p || 0); S0.rs = S0.rs || {};
      if (da > 0) { credit(E, 'les', da); S0.a = T.a; ch = true; }
      if (dg > 0) { credit(E, 'game', dg); S0.g = T.g; ch = true; }
      if (dp > 0) { credit(E, 'prac', dp); S0.p = T.p; ch = true; }
      Object.keys(T.rs).forEach(function (id) {
        var now = T.rs[id], was = S0.rs[id] || [0, 0, 0];
        if (now[0] > was[0] && was[1]) { credit(E, 'retry', 1); if (!now[1]) credit(E, 'fix', 1); ch = true; }   // came back to a skill after a miss
        if (now[2] > was[2] && was[2] > 0) { credit(E, 'up', now[2] - was[2]); ch = true; }
        else if (now[2] > 1 && !was[2]) { credit(E, 'up', now[2] - 1); ch = true; }
        if (now[0] !== was[0] || now[1] !== was[1] || now[2] > was[2]) { S0.rs[id] = [now[0], now[1], Math.max(now[2], was[2])]; ch = true; }
      });
    }
    if (ch) { keep(P, false); changed(); }
    return E;
  }
  // a lesson's answers were saved: anything answered again after a wrong answer is a retry (and a fix if it is now right)
  function lesDiff(prev, cur) {
    if (!prev || !cur || !tracking()) return;
    var re = 0, fx = 0;
    Object.keys(cur).forEach(function (q) {
      var a = cur[q], b = prev[q]; if (/^z|^here$/.test(q) || !a || !a.answer || !b || !b.answer) return;
      if ((b.correct === false || b.correct === 'no') && String(a.answer) !== String(b.answer)) { re++; if (a.correct === true || a.correct === 'yes') fx++; }
    });
    if (!re) return;
    var P = profile(), E = ef(P); credit(E, 'retry', re); credit(E, 'fix', fx); keep(P, false); changed();
  }
  var tickT = null;
  function soon(ms) { clearTimeout(tickT); tickT = setTimeout(tick, ms || 1500); }
  function watch() {
    var st = SFA.store; if (!st || st._avw) return; st._avw = 1;
    var set0 = st.set;
    st.set = function (k, v) {
      var les = !quiet && /^les\.L\d+$/.test(k), prev = null;
      if (les) { try { prev = st.get(k, null); } catch (e) { } }
      var out = set0.apply(st, arguments);
      try { if (les) lesDiff(prev, v); if (!quiet && (les || /^g([1-9]|[1-3][0-9]|90)$/.test(k))) soon(); } catch (e) { }
      return out;
    };
    setTimeout(tick, 1200);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') send(); else soon(400); });
    window.addEventListener('pagehide', function () { send(); });
    if (SFA.sync && SFA.sync.onChange) { var was = SFA.sync.me ? SFA.sync.me.sid : null; SFA.sync.onChange(function (S) { var now = S.me ? S.me.sid : null; if (now !== was) { was = now; soon(300); changed(); } }); }
  }
  // for the games and the lesson engine: SFA_AVATAR.note('help') when a student helps a partner, and so on.
  // kinds: 'help' (a partner combo, an explanation given), 'retry', 'fix', 'up', 'les', 'game', 'prac'
  function note(kind, n) { if (!tracking()) return; var P = profile(), E = ef(P); credit(E, kind, n == null ? 1 : n); keep(P, kind === 'help' || kind === 'up'); changed(); }
  function quests(P) {
    P = P || profile(); var E = ef(P); roll(E);
    var d = today(), log = E.log || [], dots = [], live = E.ld && d - E.ld <= GRACE;
    for (var i = 6; i >= 0; i--) dots.push({ day: d - i, on: log.indexOf(d - i) >= 0, today: i === 0, wd: (d - i + 4) % 7 });
    return { day: dayQuests(E.day), week: weekQuests(E.wk), triple: { c: TRIPLE, got: !!E.day.c.all },
      streak: { n: live ? E.st : 0, best: E.bst, days: E.days, today: E.ld === d, dots: dots }, coins: E.c };
  }
  // claim a finished quest: returns the coins it paid (0 if it wasn't ready)
  function claim(id) {
    var P = profile(), E = ef(P); roll(E);
    var q = dayQuests(E.day).concat(weekQuests(E.wk)).filter(function (x) { return x.id === id; })[0]; if (!q) return 0;
    var got = pay(E, q.week ? E.wk : E.day, q); if (!got) return 0;
    got += triple(E); keep(P, true); changed();
    return got;
  }
  // the effort item this student is closest to earning: { k, i, it, have, need, left, text }
  function nextUnlock(P) {
    P = P || profile(); var best = null;
    ALL.forEach(function (k) { CAT[k].items.forEach(function (it, i) {
      if (!it.u) return; var have = stat(P, it.u[0]), need = it.u[1]; if (have >= need) return;
      var r = have / need; if (!best || r > best.r || (r === best.r && need < best.need)) best = { k: k, i: i, it: it, have: have, need: need, left: need - have, r: r };
    }); });
    if (best) best.text = needText(best.it.u);
    return best;
  }
  function badges(P) { P = P || profile(); return BADGES.map(function (b, i) { if (!b) return null; var have = stat(P, b.s); return { i: i, e: b.e, n: b.n, d: b.d, have: Math.min(have, b.v), need: b.v, got: have >= b.v }; }).filter(Boolean); }

  /* ---------- the profile card ----------
     SFA_AVATAR.card() is the signed-in student's own card. For someone else: SFA_AVATAR.card({ look, name, lv }).
     Returns an HTML string (the styles come with this file).
       look  the whole look (classic + extended); default: mine      name  the name to show (it is escaped here)
       lv    arcade level, for the title line; default: mine         size  's' (a chip), 'm' (default) or 'l'
       walk  the avatar walks on the spot                            stats true: add the streak / days line (own card only)
       tag   a small label in the corner, e.g. 'MVP' */
  function escH(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function firstName() { var m = me(), n = m ? String(m.name || '') : ''; return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || 'You'; }
  function titleOf(code, lv) { var u = decode(code).u; return u ? CAT.u.items[u].n : title(lv || 1); }
  function phraseOf(code) { var y = decode(code).y; return y ? CAT.y.items[y].n : ''; }
  function card(o) {
    o = o || {};
    var mine = !o.look, P = mine ? profile() : null, m = me(), look = o.look || myLook(P, m ? m.sid : 'me');
    var L = decode(look), lv = o.lv || (mine ? level(P.xp || 0) : 0), sz = o.size === 's' ? 56 : o.size === 'l' ? 150 : 100, ph = phraseOf(look), pt = L.p ? CAT.p.items[L.p] : null;
    var E = mine && o.stats ? quests(P).streak : null;
    return '<div class="pfc pfc-' + (o.size || 'm') + '">' + (o.tag ? '<span class="pfctag">' + escH(o.tag) + '</span>' : '') +
      '<div class="pfcav">' + svg(look, { size: sz, bg: true, walk: !!o.walk, label: (o.name || (mine ? firstName() : 'Avatar')) + '\'s avatar' }) + '</div>' +
      '<div class="pfcin"><b class="pfcnm ' + nameCls(look) + '">' + escH(o.name || (mine ? firstName() : '')) + '</b>' +
      '<span class="pfctt">' + (lv ? '⭐ Level ' + lv + ' · ' : '') + escH(titleOf(look, lv)) + '</span>' +
      (ph ? '<span class="pfcph">“' + escH(ph) + '”</span>' : '') +
      (pt || L.fav.length ? '<span class="pfcbd">' + L.fav.map(function (i) { return '<i title="' + escH(BADGES[i].n + ': ' + BADGES[i].d) + '">' + BADGES[i].e + '</i>'; }).join('') +
        (pt ? '<em>' + pt.e + ' ' + escH(pt.n) + '</em>' : '') + '</span>' : '') +
      (E ? '<span class="pfcst">' + (E.n ? '🔥 ' + E.n + '-day streak · ' : '') + E.days + (E.days === 1 ? ' day' : ' days') + ' shown up</span>' : '') +
      '</div></div>';
  }

  /* ---------- the wallet ---------- */
  // lesson answers: this browser's copy, or the synced count per lesson, whichever is bigger
  function lessons(P) {
    var per = {}, n = 0, r = 0, joined = 0;
    for (var i = 1; i <= 40; i++) {
      var m = SFA.store.get('les.L' + i, null), k = 0, kr = 0;
      if (m) Object.keys(m).forEach(function (q) { var a = m[q]; if (/^z|^here$/.test(q) || !a || !a.answer) return; k++; if (a.correct === true || a.correct === 'yes') kr++; });
      per['L' + i] = { n: k, r: kr };
    }
    Object.keys((P && P.les) || {}).forEach(function (l) { var s = P.les[l], c = per[l] || { n: 0, r: 0 }; per[l] = { n: Math.max(c.n, s.n || 0), r: Math.max(c.r, s.r || 0) }; });
    Object.keys(per).forEach(function (l) { if (per[l].n) { joined++; n += per[l].n; r += per[l].r; } });
    return { n: n, r: r, joined: joined };
  }
  // games: summaries from the server ('mine') or this browser's own game saves
  function localGames() {
    var out = [];
    for (var i = 1; i <= 30; i++) { var P = SFA.store.get('g' + i, null); if (P && P.done) out.push({ game: 'g' + i, levelsDone: Object.keys(P.done).length, standard: false, specials: [] }); }
    return out;
  }
  var RATE = { level: 5, std: 40, special: 25, xpPer: 5, answer: 2, right: 1, lesson: 5, secure: 5, session: 2 };
  function earned(d) {
    var g = (d.games || []).filter(function (x) { return /^g([1-9]|[1-8][0-9])$/.test(x.game); }), lv = 0, std = 0, sp = 0;
    g.forEach(function (x) { lv += Number(x.levelsDone) || 0; std += x.standard ? 1 : 0; sp += (x.specials || []).length; });
    var L = d.les || { n: 0, r: 0, joined: 0 }, c = d.climb || null, xp = d.xp || 0, E = d.ef || {};
    var parts = [
      { k: 'games', e: '🕹️', label: 'Arcade games', txt: lv + ' levels, ' + (std + sp) + ' certificates', c: lv * RATE.level + std * RATE.std + sp * RATE.special },
      { k: 'live', e: '⚔️', label: 'Class games', txt: xp + ' XP from Boss Raid, Lane Clash and the Big Board', c: Math.floor(xp / RATE.xpPer) },
      { k: 'les', e: '📚', label: 'Lessons', txt: L.joined + ' lessons, ' + L.n + ' answers (' + L.r + ' right)', c: L.n * RATE.answer + L.r * RATE.right + L.joined * RATE.lesson },
      { k: 'climb', e: '🧗', label: 'Climb', txt: c ? (Number(c.secure) || 0) + ' skills secure, ' + (Number(c.sess) || 0) + ' sessions' : 'not started yet', c: c ? (Number(c.secure) || 0) * RATE.secure + (Number(c.sess) || 0) * RATE.session : 0 },
      // effort: showing up, retrying, moving up a level and quests (see credit() and the quests above)
      { k: 'effort', e: '💪', label: 'Effort', txt: (E.days || 0) + ' days shown up, ' + (E.rt || 0) + ' retries, ' + (E.qd || 0) + ' quests', c: Math.max(0, Math.round(E.c || 0)) }
    ];
    return { parts: parts, total: parts.reduce(function (a, p) { return a + p.c; }, 0) };
  }

  /* ---------- prices ----------
     The prices above are for a class whose middle student (the median) has about 1,000 coins. The teacher's class page
     works out the real median from everyone's work so far and sets a scale; it reaches students in the live state of
     the next lesson (counts zpr, kept as 'teacher.avprice' so signing out doesn't lose it). */
  var STRUT = 25;
  function scale() { var v = +(SFA.store && SFA.store.get('teacher.avprice', 100)) || 100; return Math.max(10, Math.min(1000, v)) / 100; }
  function price(p) { return p ? Math.max(5, Math.round(p * scale() / 5) * 5) : 0; }
  function itemPrice(k, i) { var it = CAT[k].items[i]; return it ? price(it.p) : 0; }

  /* ---------- styles, once ---------- */
  function css() {
    if (document.getElementById('sfaAvCss')) return;
    var s = document.createElement('style'); s.id = 'sfaAvCss';
    s.textContent = '.av{overflow:visible;display:block}.av .avtr{opacity:0;transform-box:fill-box;transform-origin:center;animation:avtr 1.8s ease-out infinite}' +
      '@keyframes avtr{0%{opacity:0;transform:translateY(10px) scale(.5)}30%{opacity:1}100%{opacity:0;transform:translateY(-26px) scale(1.15)}}' +
      '.av.walk .avft.l{animation:avstep .42s ease-in-out infinite alternate}.av.walk .avft.r{animation:avstep .42s ease-in-out infinite alternate-reverse}' +
      '@keyframes avstep{from{transform:translateY(0)}to{transform:translateY(-7px)}}.av.walk .avbod{animation:avbob .21s ease-in-out infinite alternate}@keyframes avbob{to{transform:translateY(-3px)}}' +
      '.avn1{color:#7CF2A2}.avn2{color:#FF8FD1}.avn3{color:#7CC8FF}.avn4{color:#FFD23F;text-shadow:0 0 10px rgba(255,210,63,.6)}' +
      '.avn5{background:linear-gradient(90deg,#FF5B5B,#FFB020,#FFE14D,#4FD97A,#53B7FF,#9B6BFF);-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '.avn6{color:#C6FF3D;text-shadow:0 0 8px rgba(198,255,61,.75)}.avn7{color:#D6BCFF}.avn8{color:#FFB15C}.avn9{color:#8CFF5A;text-shadow:0 0 4px #39D11F,0 0 12px rgba(57,209,31,.7)}' +
      '.avn10,.avn11,.avn12,.avn13,.avn16,.avn17,.avn19{-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '.avn10{background-image:linear-gradient(0deg,#FF3B3B,#FF8A1F 50%,#FFE14D)}.avn11{background-image:linear-gradient(90deg,#fff,#A8E8FF 50%,#53B7FF)}' +
      '.avn12{background-image:linear-gradient(90deg,#C9A6FF,#8A6BFF 35%,#4FC3F7 70%,#FF9BE1)}' +
      '.avn13{background-image:linear-gradient(90deg,#B5FFFC,#D9B8FF,#FFC6E8,#FFF3B0,#B8FFD0,#B5FFFC);background-size:200% 100%;animation:avholo 3s linear infinite}@keyframes avholo{to{background-position:200% 0}}' +
      '.avn14{color:#FF8A7A}.avn15{color:#3BFFE1;text-shadow:0 0 8px rgba(59,255,225,.5)}.avn16{background-image:linear-gradient(90deg,#FF8FD1,#C9A6FF,#9BE3FF)}' +
      '.avn17{background-image:linear-gradient(0deg,#7B3FC4,#E8457C 45%,#FFD23F)}.avn19{background-image:linear-gradient(90deg,#1FC7B6,#2E6BD9 50%,#7CC8FF)}' +
      '.avn18{color:#fff;text-shadow:2px 0 #FF2E6A,-2px 0 #2EE6FF;animation:avgl 1.6s steps(1) infinite}@keyframes avgl{50%{text-shadow:-2px 0 #FF2E6A,2px 0 #2EE6FF}}' +
      // the balloon sways, jetpack flames flicker
      '.av .avbal{transform-box:fill-box;transform-origin:50% 100%;animation:avbal 2.4s ease-in-out infinite alternate}@keyframes avbal{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}' +
      '.av .avjet{transform-box:fill-box;transform-origin:50% 0;animation:avjet .18s ease-in-out infinite alternate}@keyframes avjet{to{transform:scaleY(.7)}}' +
      // pets bob, the propeller spins, the robot light blinks, ghosts float, bubblegum grows, laser eyes glow
      '.av .avpet{transform-box:fill-box;transform-origin:50% 100%;animation:avpet 1.8s ease-in-out infinite}@keyframes avpet{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px) rotate(-5deg)}}' +
      '.av .avpr{transform-box:fill-box;transform-origin:center;animation:avpr .5s linear infinite}@keyframes avpr{50%{transform:scaleX(.12)}}' +
      '.av .avbl{animation:avbl 1.2s steps(1) infinite}@keyframes avbl{50%{opacity:.3}}' +
      '.av .avgh{animation:avgh 2.6s ease-in-out infinite alternate}@keyframes avgh{to{transform:translateY(-6px)}}' +
      '.av .avbb{transform-box:fill-box;transform-origin:50% 0;animation:avbb 2.4s ease-in-out infinite}@keyframes avbb{0%,100%{transform:scale(.85)}50%{transform:scale(1.08)}}' +
      '.av .avlz{animation:avlz 1s ease-in-out infinite alternate}@keyframes avlz{from{opacity:.15}to{opacity:.55}}' +
      // the Lane Clash team intro: each name under its avatar, marching in one after another
      '.lcrost span.hasav{display:flex;flex-direction:column;align-items:center;gap:0;padding:0 2px;background:none}.lcrost .lcav{display:block;animation:lcavin .55s cubic-bezier(.2,1.6,.4,1) both}' +
      '.lcrost span.hasav em{font-style:normal;padding:1px 8px;border-radius:99px;background:rgba(255,255,255,.12);font-size:.85em}' +
      '@keyframes lcavin{from{opacity:0;transform:translateY(24px) scale(.4)}to{opacity:1;transform:none}}' +
      // moves: the whole character (feet and all) bounces, wiggles, floats… one keyframe set per move
      '.av .avps,.av .avwv,.av .avfl{transform-box:fill-box;transform-origin:50% 100%}' +
      '.av .avp1{animation:avp1 .55s ease-in-out infinite alternate}@keyframes avp1{from{transform:translateY(0) scale(1.04,.96)}to{transform:translateY(-9px) scale(.98,1.03)}}' +
      '.av .avwv{transform-origin:10% 100%;animation:avwv .45s ease-in-out infinite alternate}@keyframes avwv{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}' +
      '.av .avp3{animation:avp3 .45s ease-in-out infinite alternate}@keyframes avp3{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}' +
      '.av .avp4{animation:avp4 2s ease-in-out infinite alternate}@keyframes avp4{from{transform:translateY(-2px)}to{transform:translateY(-12px)}}' +
      '.av .avp5{animation:avp5 .32s ease-in-out infinite alternate}@keyframes avp5{to{transform:translateY(-6px)}}' +
      '.av .avp6{animation:avp6 2.6s linear infinite}@keyframes avp6{0%,62%{transform:scaleX(1)}72%{transform:scaleX(.05)}81%{transform:scaleX(-1)}90%{transform:scaleX(.05)}100%{transform:scaleX(1)}}' +
      '.av .avp7{animation:avp7 .36s ease-in-out infinite alternate}@keyframes avp7{to{transform:rotate(7deg) translateY(2px)}}' +
      '.av .avp8{animation:avp8 .28s ease-in-out infinite alternate}@keyframes avp8{from{transform:translateX(-5px)}to{transform:translateX(5px)}}' +
      '.av .avp9{animation:avp9 1s cubic-bezier(.3,0,.4,1) infinite}@keyframes avp9{0%,100%{transform:translateY(0) scale(1.08,.9)}45%{transform:translateY(-22px) scale(.95,1.07)}}' +
      '.av .avp10{animation:avp10 .5s ease-in-out infinite alternate}@keyframes avp10{to{transform:scale(1.07)}}' +
      '.av .avp11{animation:avp11 1.8s linear infinite alternate}@keyframes avp11{from{transform:translateX(12px)}to{transform:translateX(-12px)}}.av .avp11 .avft.l{animation:avstep .3s ease-in-out infinite alternate}.av .avp11 .avft.r{animation:avstep .3s ease-in-out infinite alternate-reverse}' +
      '.av .avp12{animation:avp12 1s ease-in-out infinite}@keyframes avp12{0%,100%{transform:rotate(-7deg)}25%{transform:rotate(0) translateY(-10px)}50%{transform:rotate(7deg)}75%{transform:rotate(0) translateY(-10px)}}' +
      '.av .avp13{animation:avp13 2.8s ease-in-out infinite alternate}@keyframes avp13{from{transform:translateY(-5px) rotate(-2deg)}to{transform:translateY(-15px) rotate(2deg)}}' +
      '.av .avfl{animation:avfl .5s ease-in-out infinite alternate}@keyframes avfl{to{transform:scale(1.03,1.08)}}' +
      // the profile card
      '.pfc{position:relative;display:inline-flex;align-items:center;gap:12px;max-width:100%;padding:10px 16px 10px 10px;border-radius:18px;background:linear-gradient(135deg,#2a2140,#1B1824 70%);border:2px solid #4a3f78;color:#F3EFE7;text-align:left;box-sizing:border-box;vertical-align:top}' +
      '.pfc .pfcav{flex:0 0 auto;line-height:0}.pfc .pfcin{display:flex;flex-direction:column;gap:2px;min-width:0}' +
      '.pfc .pfcnm{font:400 24px/1.1 "Luckiest Guy",system-ui,sans-serif;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.pfc .pfctt{font:800 13px/1.25 "Bricolage Grotesque",system-ui,sans-serif;color:#FFC94A}.pfc .pfcph{font:600 14px/1.3 "Bricolage Grotesque",system-ui,sans-serif;font-style:italic;color:#D9D3E8}' +
      '.pfc .pfcbd{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:2px}.pfc .pfcbd i{font-style:normal;font-size:18px;line-height:1;padding:4px;border-radius:9px;background:rgba(255,255,255,.1)}' +
      '.pfc .pfcbd em{font:700 12px "Bricolage Grotesque",system-ui,sans-serif;font-style:normal;color:#ABA5BC;padding:3px 8px;border-radius:99px;background:rgba(255,255,255,.07)}' +
      '.pfc .pfcst{font:700 12px "Bricolage Grotesque",system-ui,sans-serif;color:#7CF2A2;margin-top:2px}' +
      '.pfc .pfctag{position:absolute;top:-9px;right:12px;padding:2px 9px;border-radius:99px;background:#FFC94A;color:#231800;font:800 11px "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
      '.pfc-s{gap:8px;padding:5px 12px 5px 5px;border-radius:14px}.pfc-s .pfcnm{font-size:17px}.pfc-s .pfctt{font-size:11px}.pfc-s .pfcph,.pfc-s .pfcbd em{display:none}.pfc-s .pfcbd i{font-size:13px;padding:2px}' +
      '.pfc-l{gap:18px;padding:14px 22px 14px 14px}.pfc-l .pfcnm{font-size:34px}.pfc-l .pfctt{font-size:16px}.pfc-l .pfcph{font-size:17px}.pfc-l .pfcbd i{font-size:24px}' +
      '@media (max-width:420px){.pfc-l{gap:10px;padding:10px}.pfc-l .pfcav svg{width:110px;height:auto}.pfc-l .pfcnm{font-size:26px}}' +
      '@media (prefers-reduced-motion:reduce){.av .avps,.av .avwv,.av .avfl,.av .avp11 .avft{animation:none!important}}' +
      '@media (prefers-reduced-motion:reduce){.av .avtr,.av.walk .avft,.av.walk .avbod,.lcrost .lcav,.av .avpet,.av .avpr,.av .avbl,.av .avgh,.av .avbb,.av .avlz,.avn13,.avn18,.av .avbal,.av .avjet{animation:none}.av .avtr{opacity:.8}}';
    (document.head || document.documentElement).appendChild(s);
  }
  if (document.head) css(); else document.addEventListener('DOMContentLoaded', css);

  try { watch(); } catch (e) { }

  window.SFA_AVATAR = { XORDER: XORDER, ALL: ALL, BADGES: BADGES, RARE: RARE, rarity: rarity, join: join, setLook: setLook, fromWire: fromWire, card: card, titleOf: titleOf, phraseOf: phraseOf,
    stat: stat, needText: needText, quests: quests, claim: claim, nextUnlock: nextUnlock, badges: badges, note: note, tick: tick, onChange: function (f) { listeners.push(f); }, firstName: firstName,
    CAT: CAT, ORDER: ORDER, MAXX: MAXX, slots: slots, wear: wear, decode: decode, encode: encode, defLook: defLook, svg: svg, nameCls: nameCls, level: level, title: title, need: need,
    profile: profile, save: save, myLook: myLook, owns: owns, lessons: lessons, localGames: localGames, earned: earned, RATE: RATE, hash: hash,
    scale: scale, price: price, itemPrice: itemPrice, strutPrice: function () { return price(STRUT); } };
})();
