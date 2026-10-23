/* Sandy Flats character sprites for the Lane Clash: each character is drawn once by the films' cut-paper engine
   (sfa-engine.js), trimmed to its edges and cached as a few small canvases (animation frames), so the battle can draw
   a hundred of them every frame. SFA_SPRITES.get(who) -> { frames: [canvas…], w, h } (all frames share one size). */
(function () {
  'use strict';
  var cache = {}, E = null, cv = null;
  function engine() {
    if (E) return E;
    cv = document.createElement('canvas');
    E = window.SFEngine(cv, { dpr: 1 });
    return E;
  }
  // how to draw each character, standing on the ground at x = 480 (the engine's own 960 × 540 stage)
  var DRAW = {
    gus: function (E, T) { E.kid('gus', 480, 470, 1, false, null, false, T, {}); E.hat(484, 320, 0.95, 0.05); },
    one: function (E, T) { E.hero(480, 470, 1, false, null, T, {}); },
    zero: function (E, T) { E.zero(480, 400, 0, false, T, { mask: false }, null); },
    sam: function (E, T) { E.sam(480, T, false, {}); },
    pigeon: function (E, T) { E.pigeon(480, 440, 1, T, false, {}); },
    max: function (E, T) { E.maxim(480, T, false, {}); },
    mux: function (E, T) { E.mux3(480, T, false, {}); },
    priya: function (E, T) { E.kid('priya', 480, 470, 1, false, null, false, T, {}); },
    marcus: function (E, T) { E.kid('marcus', 480, 470, 1, false, null, false, T, {}); }
  };
  function bounds(c, w, h) {
    var d = c.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var y = 0; y < h; y += 2) for (var x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 2, h: y1 - y0 + 2 };
  }
  // n frames at slightly different engine times (the cut-paper wobble), trimmed to one shared box
  function make(who, n) {
    var e = engine(), c = e.c, raw = [], box = null;
    for (var i = 0; i < n; i++) {
      e.reset(); c.clearRect(0, 0, 960, 540);
      try { DRAW[who](e, 0.37 + i * 0.29); } catch (err) { }
      var b = bounds(c, 960, 540); if (!b) continue;
      box = box ? { x: Math.min(box.x, b.x), y: Math.min(box.y, b.y), x2: Math.max(box.x2, b.x + b.w), y2: Math.max(box.y2, b.y + b.h) } : { x: b.x, y: b.y, x2: b.x + b.w, y2: b.y + b.h };
      var copy = document.createElement('canvas'); copy.width = 960; copy.height = 540; copy.getContext('2d').drawImage(cv, 0, 0); raw.push(copy);
    }
    if (!box) return null;
    var w = box.x2 - box.x, h = box.y2 - box.y;
    var frames = raw.map(function (r) { var f = document.createElement('canvas'); f.width = w; f.height = h; f.getContext('2d').drawImage(r, box.x, box.y, w, h, 0, 0, w, h); return f; });
    return { frames: frames, w: w, h: h };
  }
  window.SFA_SPRITES = {
    get: function (who) { if (!(who in cache)) cache[who] = DRAW[who] && window.SFEngine ? make(who, who === 'zero' ? 1 : 4) : null; return cache[who]; },
    ready: function () { return !!window.SFEngine; }
  };
})();
