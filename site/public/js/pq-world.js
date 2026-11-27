/* Pocket Quest's pixel engine, font and school-yard world, copied by tools/make-world.mjs from js/gfx/px.js, js/gfx/font.js, js/gfx/world.js.
   Do not edit here: change Pocket Quest and run the tool again. */

/* ---------------- js/gfx/px.js */
/* Pocket Quest - pixel raster kit (rework).
 *
 * Characters and props are built from simple shapes (ellipses, capsules,
 * rounded boxes, polygons) rasterized straight onto the pixel grid and shaded
 * with 4-tone hue-shifted ramps from one light: the top-front, which is the
 * top right for a sprite facing right. Then:
 *   - where a front part overlaps a back part, the back part gets a dark
 *     contour, so arms and legs separate from the body;
 *   - the silhouette gets an outline: dark ink on the shadow side, a coloured
 *     line on the lit side ("sel-out").
 * Hand-made decals (eyes, mouths, logos) go on top. The same model can be
 * rasterized at 1x (sprite) or 2x (portrait), so a face matches in both.
 */
window.PQ = window.PQ || {};
PQ.px = (function () {
  'use strict';
  var INK = '#1b1029';
  var L = norm(0.5, -0.72, 0.68);         // towards the light: right, up, out of the screen
  var TH = [0.74, 0.3, -0.18];           // intensity thresholds for tones 0..3

  function norm(x, y, z) { var l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function hex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }

  /** a material: four tones from lit to deep, and the colour of its lit outline */
  function ramp(hi, base, shade, deep, line) { return { c: [hi, base, shade, deep], line: line || mix(deep, INK, 0.55) }; }

  function toneOf(i, o) {
    i += (o && o.bias) || 0;
    var t = (o && o.th) || TH;
    var tone = i > t[0] ? 0 : i > t[1] ? 1 : i > t[2] ? 2 : 3;
    if (o && o.min !== undefined) tone = Math.max(o.min, tone);
    if (o && o.max !== undefined) tone = Math.min(o.max, tone);
    return tone;
  }

  function Pic(w, h) {
    this.w = w; this.h = h;
    var n = w * h;
    this.col = new Array(n).fill(null);
    this.pid = new Int16Array(n).fill(-1);
    this.rmp = new Array(n).fill(null);
    this.tone = new Int8Array(n).fill(-1);
    this.parts = []; this.cur = -1; this.mask = null;
  }
  /** start a new part: later parts are in front of earlier ones */
  Pic.prototype.part = function (name, o) {
    this.cur = this.parts.length;
    this.parts.push({ name: name, contour: !(o && o.contour === false), soft: !!(o && o.soft) });
    this.mask = null;
    return this;
  };
  Pic.prototype.idOf = function (name) {
    for (var i = this.parts.length - 1; i >= 0; i--) if (this.parts[i].name === name) return i;
    return -2;
  };
  /** draw only on pixels that already belong to the named parts */
  Pic.prototype.only = function (names) {
    var self = this, ids = [].concat(names).map(function (n) { return self.idOf(n); });
    this.mask = function (i) { return ids.indexOf(self.pid[i]) >= 0; };
    return this;
  };
  Pic.prototype.free = function () { this.mask = null; return this; };
  Pic.prototype.set = function (x, y, r, tone, color, keepPart) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    var i = y * this.w + x;
    if (this.mask && !this.mask(i)) return;
    if (!keepPart) this.pid[i] = this.cur;
    this.rmp[i] = r; this.tone[i] = r ? tone : -1;
    this.col[i] = color || (r ? r.c[tone] : null);
  };
  Pic.prototype.get = function (x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? null : this.col[y * this.w + x]; };
  Pic.prototype.clear = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    var i = y * this.w + x; this.col[i] = null; this.pid[i] = -1; this.rmp[i] = null; this.tone[i] = -1;
  };

  function shadeFrom(nx, ny, nz, o) {
    var n = norm(nx, ny, nz * ((o && o.flat) || 1));
    return toneOf(n[0] * L[0] + n[1] * L[1] + n[2] * L[2], o);
  }
  function clipOk(o, x, y) { return !o || !o.clip || o.clip(x, y); }

  /** a lit ellipse (a sphere seen from the front) */
  Pic.prototype.ellipse = function (cx, cy, rx, ry, r, o) {
    o = o || {};
    for (var y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx); x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      if (d > 1 || !clipOk(o, x + 0.5, y + 0.5)) continue;
      var t = o.tone !== undefined ? o.tone : shadeFrom(dx, dy, Math.sqrt(1 - d), o);
      if (o.erase) this.clear(x, y); else this.set(x, y, r, t);
    }
    return this;
  };
  /** a lit capsule (a limb): a round tube from (x1,y1) to (x2,y2) */
  Pic.prototype.capsule = function (x1, y1, x2, y2, rad, r, o) {
    o = o || {};
    var vx = x2 - x1, vy = y2 - y1, ll = vx * vx + vy * vy || 1e-6;
    for (var y = Math.floor(Math.min(y1, y2) - rad) - 1; y <= Math.ceil(Math.max(y1, y2) + rad); y++)
      for (var x = Math.floor(Math.min(x1, x2) - rad) - 1; x <= Math.ceil(Math.max(x1, x2) + rad); x++) {
        var px = x + 0.5, py = y + 0.5;
        var t = Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / ll));
        var ox = px - (x1 + vx * t), oy = py - (y1 + vy * t), d = Math.hypot(ox, oy) / rad;
        if (d > 1 || !clipOk(o, px, py)) continue;
        var tone = o.tone !== undefined ? o.tone : shadeFrom(ox / rad, oy / rad, Math.sqrt(Math.max(0, 1 - d * d)), o);
        this.set(x, y, r, tone);
      }
    return this;
  };
  /** a rounded box shaded like an upright cylinder (a torso, a box) */
  Pic.prototype.rbox = function (x0, y0, x1, y1, rad, r, o) {
    o = o || {};
    var cx = (x0 + x1) / 2, hw = (x1 - x0) / 2, cy = (y0 + y1) / 2, hh = (y1 - y0) / 2;
    for (var y = Math.floor(y0); y < Math.ceil(y1); y++) for (var x = Math.floor(x0); x < Math.ceil(x1); x++) {
      var px = x + 0.5, py = y + 0.5;
      var qx = Math.max(Math.abs(px - cx) - (hw - rad), 0), qy = Math.max(Math.abs(py - cy) - (hh - rad), 0);
      if (qx * qx + qy * qy > rad * rad || !clipOk(o, px, py)) continue;
      var nx = (px - cx) / hw, ny = (py - cy) / hh * (o.vert || 0.35);
      var tone = o.tone !== undefined ? o.tone : shadeFrom(nx, ny, Math.sqrt(Math.max(0.05, 1 - nx * nx)), o);
      this.set(x, y, r, tone);
    }
    return this;
  };
  /** a polygon, shaded by where each pixel sits relative to its centre */
  Pic.prototype.poly = function (pts, r, o) {
    o = o || {};
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, cx = 0, cy = 0;
    pts.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); cx += p[0]; cy += p[1]; });
    cx /= pts.length; cy /= pts.length;
    var ex = Math.max(1, (maxx - minx) / 2), ey = Math.max(1, (maxy - miny) / 2);
    if (o.cx !== undefined) { cx = o.cx; cy = o.cy; }
    for (var y = Math.floor(miny); y <= Math.ceil(maxy); y++) for (var x = Math.floor(minx); x <= Math.ceil(maxx); x++) {
      var px = x + 0.5, py = y + 0.5, inside = false;
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[i], b = pts[j];
        if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      if (!inside || !clipOk(o, px, py)) continue;
      var tone = o.tone !== undefined ? o.tone : shadeFrom((px - cx) / ex, (py - cy) / ey, 0.9, o);
      if (o.erase) this.clear(x, y); else this.set(x, y, r, tone);
    }
    return this;
  };
  /** move the tone of pixels already drawn (cast shadows, highlights) */
  Pic.prototype.retone = function (test, delta, names) {
    var ids = names ? [].concat(names).map(this.idOf.bind(this)) : null;
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var i = y * this.w + x;
      if (!this.rmp[i] || (ids && ids.indexOf(this.pid[i]) < 0) || !test(x + 0.5, y + 0.5, x, y)) continue;
      var t = Math.max(0, Math.min(3, this.tone[i] + delta));
      this.tone[i] = t; this.col[i] = this.rmp[i].c[t];
    }
    return this;
  };
  /** pixels of part `onto` just below / beside part `from` get one tone darker */
  Pic.prototype.castShadow = function (from, onto, dx, dy, n) {
    var a = this.idOf(from), self = this;
    var test = function (px, py, x, y) {
      for (var s = 1; s <= (n || 1); s++) {
        var sx = x - dx * s, sy = y - dy * s;
        if (sx >= 0 && sy >= 0 && sx < self.w && sy < self.h && self.pid[sy * self.w + sx] === a) return true;
      }
      return false;
    };
    return this.retone(test, 1, onto);
  };
  /** hand-made pixels: a grid of letters, each mapped to a colour */
  Pic.prototype.decal = function (rows, x, y, pal, flip) {
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      for (var i = 0; i < row.length; i++) {
        var ch = row[flip ? row.length - 1 - i : i];
        if (ch === '.' || ch === ' ' || !pal[ch]) continue;
        if (pal[ch] === 'clear') { this.clear(x + i, y + j); continue; }
        this.set(x + i, y + j, null, -1, pal[ch], true);
      }
    }
    return this;
  };

  /** finish: contours between parts, then the sel-out outline. Returns a canvas. */
  Pic.prototype.toCanvas = function (o) {
    o = o || {};
    var w = this.w, h = this.h, col = this.col.slice(), self = this, x, y, i;
    if (o.contour !== false) {
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        i = y * w + x;
        var a = this.pid[i];
        if (a < 0 || !this.parts[a].contour) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = x + d[0], ny = y + d[1];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
          var j = ny * w + nx, b = self.pid[j];
          if (b < 0 || b >= a || !self.rmp[j]) return;
          var r = self.rmp[j];
          col[j] = self.parts[a].soft ? r.c[Math.min(3, self.tone[j] + 1)] : (self.tone[j] >= 3 ? r.line : r.c[3]);
        });
      }
    }
    var pad = o.outline === false ? 0 : 1;
    var c = document.createElement('canvas'); c.width = w + pad * 2; c.height = h + pad * 2;
    var g = c.getContext('2d');
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var cc = col[y * w + x]; if (!cc) continue;
      g.fillStyle = cc; g.fillRect(x + pad, y + pad, 1, 1);
    }
    if (pad) {
      var ink = o.ink || INK;
      for (y = -1; y <= h; y++) for (x = -1; x <= w; x++) {
        if (x >= 0 && y >= 0 && x < w && y < h && col[y * w + x]) continue;
        var below = y + 1 < h && x >= 0 && x < w && col[(y + 1) * w + x];
        var left = x - 1 >= 0 && y >= 0 && y < h && col[y * w + x - 1];
        var above = y - 1 >= 0 && x >= 0 && x < w && col[(y - 1) * w + x];
        var right = x + 1 < w && y >= 0 && y < h && col[y * w + x + 1];
        if (!(below || left || above || right)) continue;
        // lit side (top, right): the material's own dark line; shadow side: ink
        var src = below ? (y + 1) * w + x : left ? y * w + x - 1 : -1;
        var lit = o.selout !== false && src >= 0 && !above && !right && this.rmp[src];
        g.fillStyle = lit ? this.rmp[src].line : ink;
        g.fillRect(x + pad, y + pad, 1, 1);
      }
    }
    return c;
  };

  return { INK: INK, ramp: ramp, mix: mix, Pic: Pic, rgb: rgb, hex: hex, L: L };
})();

/* ---------------- js/gfx/font.js */
/* Pocket Quest - pixel font (rework).
 *
 * Our own bitmap font, drawn for 7-8 year olds: single-storey a and g (the
 * way children learn to write them), l with a tail so it never looks like I,
 * round open shapes. Cap height 9, x-height 6, descenders 3. The bold weight
 * (used for almost everything) is the same drawing one pixel thicker.
 * Text is rendered once into a small canvas (fill, outline, shadow) and
 * cached, then drawn like any sprite.
 */
window.PQ = window.PQ || {};
PQ.font = (function () {
  'use strict';
  var ROWS = 12;   // 0-8 above the baseline, 9-11 descenders
  var G = {};
  function g(ch, top, rows) { G[ch] = { top: top, rows: rows.split('|'), w: rows.split('|')[0].length }; }

  // capitals
  g('A', 0, '.####.|#....#|#....#|#....#|######|#....#|#....#|#....#|#....#');
  g('B', 0, '#####.|#....#|#....#|#....#|#####.|#....#|#....#|#....#|#####.');
  g('C', 0, '.####.|#....#|#.....|#.....|#.....|#.....|#.....|#....#|.####.');
  g('D', 0, '####..|#...#.|#....#|#....#|#....#|#....#|#....#|#...#.|####..');
  g('E', 0, '#####|#....|#....|#....|####.|#....|#....|#....|#####');
  g('F', 0, '#####|#....|#....|#....|####.|#....|#....|#....|#....');
  g('G', 0, '.####.|#....#|#.....|#.....|#..###|#....#|#....#|#....#|.####.');
  g('H', 0, '#....#|#....#|#....#|#....#|######|#....#|#....#|#....#|#....#');
  g('I', 0, '###|.#.|.#.|.#.|.#.|.#.|.#.|.#.|###');
  g('J', 0, '....#|....#|....#|....#|....#|....#|#...#|#...#|.###.');
  g('K', 0, '#....#|#...#.|#..#..|#.#...|##....|#.#...|#..#..|#...#.|#....#');
  g('L', 0, '#....|#....|#....|#....|#....|#....|#....|#....|#####');
  g('M', 0, '#.....#|##...##|#.#.#.#|#..#..#|#.....#|#.....#|#.....#|#.....#|#.....#');
  g('N', 0, '#....#|##...#|##...#|#.#..#|#.#..#|#..#.#|#..#.#|#...##|#....#');
  g('O', 0, '.####.|#....#|#....#|#....#|#....#|#....#|#....#|#....#|.####.');
  g('P', 0, '#####.|#....#|#....#|#....#|#####.|#.....|#.....|#.....|#.....');
  g('Q', 0, '.####.|#....#|#....#|#....#|#....#|#....#|#..#.#|#...#.|.###.#');
  g('R', 0, '#####.|#....#|#....#|#....#|#####.|#..#..|#...#.|#....#|#....#');
  g('S', 0, '.####.|#....#|#.....|#.....|.####.|.....#|.....#|#....#|.####.');
  g('T', 0, '#####|..#..|..#..|..#..|..#..|..#..|..#..|..#..|..#..');
  g('U', 0, '#....#|#....#|#....#|#....#|#....#|#....#|#....#|#....#|.####.');
  g('V', 0, '#...#|#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..|..#..');
  g('W', 0, '#.....#|#.....#|#.....#|#.....#|#..#..#|#..#..#|#.#.#.#|##...##|#.....#');
  g('X', 0, '#....#|#....#|.#..#.|.#..#.|..##..|.#..#.|.#..#.|#....#|#....#');
  g('Y', 0, '#...#|#...#|#...#|.#.#.|.#.#.|..#..|..#..|..#..|..#..');
  g('Z', 0, '######|.....#|....#.|....#.|...#..|..#...|.#....|#.....|######');
  // small letters (x-height 6, from row 3)
  g('a', 3, '.###.#|#...##|#....#|#....#|#...##|.###.#');
  g('b', 0, '#.....|#.....|#.....|#.###.|##...#|#....#|#....#|##...#|#.###.');
  g('c', 3, '.###.|#...#|#....|#....|#...#|.###.');
  g('d', 0, '.....#|.....#|.....#|.###.#|#...##|#....#|#....#|#...##|.###.#');
  g('e', 3, '.####.|#....#|######|#.....|#....#|.####.');
  g('f', 0, '..##|.#..|.#..|####|.#..|.#..|.#..|.#..|.#..');
  g('g', 3, '.###.#|#...##|#....#|#....#|#...##|.###.#|.....#|#....#|.####.');
  g('h', 0, '#.....|#.....|#.....|#.###.|##...#|#....#|#....#|#....#|#....#');
  g('i', 1, '#|.|#|#|#|#|#|#');
  g('j', 1, '..#|...|..#|..#|..#|..#|..#|..#|..#|..#|##.');
  g('k', 0, '#....|#....|#....|#...#|#..#.|###..|#..#.|#...#|#...#');
  g('l', 0, '#.|#.|#.|#.|#.|#.|#.|#.|.#');
  g('m', 3, '###.##.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#');
  g('n', 3, '#.###.|##...#|#....#|#....#|#....#|#....#');
  g('o', 3, '.####.|#....#|#....#|#....#|#....#|.####.');
  g('p', 3, '#.###.|##...#|#....#|#....#|##...#|#.###.|#.....|#.....|#.....');
  g('q', 3, '.###.#|#...##|#....#|#....#|#...##|.###.#|.....#|.....#|.....#');
  g('r', 3, '#.###|##...|#....|#....|#....|#....');
  g('s', 3, '.####|#....|.###.|....#|....#|####.');
  g('t', 1, '.#..|.#..|####|.#..|.#..|.#..|.#..|..##');
  g('u', 3, '#....#|#....#|#....#|#....#|#...##|.###.#');
  g('v', 3, '#...#|#...#|#...#|.#.#.|.#.#.|..#..');
  g('w', 3, '#.....#|#.....#|#..#..#|#..#..#|#.#.#.#|.#...#.');
  g('x', 3, '#...#|.#.#.|..#..|..#..|.#.#.|#...#');
  g('y', 3, '#...#|#...#|#...#|#...#|#..##|.##.#|....#|#...#|.###.');
  g('z', 3, '#####|...#.|..#..|.#...|#....|#####');
  // Turkish letters, for the children's own names. Capitals keep their full
  // height and carry their marks above it (rows -3..-1, see headroom()).
  g('Ç', 0, '.####.|#....#|#.....|#.....|#.....|#.....|#.....|#....#|.####.|...#..|..##..');
  g('Ş', 0, '.####.|#....#|#.....|#.....|.####.|.....#|.....#|#....#|.####.|...#..|..##..');
  g('Ğ', -3, '#....#|.####.|......|.####.|#....#|#.....|#.....|#..###|#....#|#....#|#....#|.####.');
  g('İ', -2, '.#.|...|###|.#.|.#.|.#.|.#.|.#.|.#.|.#.|###');
  g('Ö', -2, '.#..#.|......|.####.|#....#|#....#|#....#|#....#|#....#|#....#|#....#|.####.');
  g('Ü', -2, '.#..#.|......|#....#|#....#|#....#|#....#|#....#|#....#|#....#|#....#|.####.');
  g('ç', 3, '.###.|#...#|#....|#....|#...#|.###.|..#..|.##..');
  g('ş', 3, '.####|#....|.###.|....#|....#|####.|..#..|.##..');
  g('ğ', 0, '#....#|.####.|......|.###.#|#...##|#....#|#....#|#...##|.###.#|.....#|#....#|.####.');
  g('ı', 3, '#|#|#|#|#|#');
  g('ö', 1, '.#..#.|......|.####.|#....#|#....#|#....#|#....#|.####.');
  g('ü', 1, '.#..#.|......|#....#|#....#|#....#|#....#|#...##|.###.#');
  // digits
  g('0', 0, '.###.|#...#|#...#|#...#|#...#|#...#|#...#|#...#|.###.');
  g('1', 0, '..#..|.##..|#.#..|..#..|..#..|..#..|..#..|..#..|#####');
  g('2', 0, '.###.|#...#|....#|....#|...#.|..#..|.#...|#....|#####');
  g('3', 0, '.###.|#...#|....#|....#|..##.|....#|....#|#...#|.###.');
  g('4', 0, '...#.|..##.|.#.#.|#..#.|#..#.|#####|...#.|...#.|...#.');
  g('5', 0, '#####|#....|#....|####.|....#|....#|....#|#...#|.###.');
  g('6', 0, '.###.|#....|#....|####.|#...#|#...#|#...#|#...#|.###.');
  g('7', 0, '#####|....#|....#|...#.|...#.|..#..|..#..|..#..|..#..');
  g('8', 0, '.###.|#...#|#...#|#...#|.###.|#...#|#...#|#...#|.###.');
  g('9', 0, '.###.|#...#|#...#|#...#|.####|....#|....#|....#|.###.');
  // punctuation and signs
  g('.', 8, '#');
  g(',', 8, '.#|#.');
  g('!', 0, '#|#|#|#|#|#|#|.|#');
  g('?', 0, '.###.|#...#|....#|....#|..##.|..#..|..#..|.....|..#..');
  g("'", 0, '#|#|#');
  g('’', 0, '#|#|#');
  g('"', 0, '#.#|#.#|#.#');
  g('-', 5, '####');
  g(':', 4, '#|.|.|.|#');
  g(';', 4, '.#|..|..|..|.#|#.');
  g('(', 0, '..#|.#.|#..|#..|#..|#..|#..|.#.|..#');
  g(')', 0, '#..|.#.|..#|..#|..#|..#|..#|.#.|#..');
  g('/', 0, '....#|....#|...#.|...#.|..#..|.#...|.#...|#....|#....');
  g('+', 3, '..#..|..#..|#####|..#..|..#..');
  g('=', 4, '####|....|####');
  g('…', 8, '#.#.#');
  g('·', 5, '#');
  g('×', 3, '#...#|.#.#.|..#..|.#.#.|#...#');
  g('_', 9, '#####');
  g('&', 0, '.##..|#..#.|#..#.|.##..|.#...|#.#.#|#..#.|#..#.|.##.#');
  g('▶', 1, '#...|##..|###.|####|###.|##..|#...');
  g('◀', 1, '...#|..##|.###|####|.###|..##|...#');
  g('▲', 2, '...#...|..###..|.#####.|#######');
  g('▼', 3, '#######|.#####.|..###..|...#...');
  g('←', 2, '..#....|.##....|#######|.##....|..#....');
  g('→', 2, '....#..|....##.|#######|....##.|....#..');
  g('↑', 0, '..#..|.###.|#.#.#|..#..|..#..|..#..|..#..|..#..|..#..');
  g('↓', 0, '..#..|..#..|..#..|..#..|..#..|..#..|#.#.#|.###.|..#..');
  g('♪', 0, '..##.|..#.#|..#..|..#..|..#..|.##..|###..|###..|.#...');
  g('★', 0, '...#...|...#...|..###..|#######|.#####.|..###..|.##.##.|.#...#.|#.....#');
  g('♥', 1, '.##.##.|#######|#######|.#####.|..###..|...#...');
  G[' '] = { top: 0, rows: [], w: 3 };

  var SPACE = 1;
  function glyph(ch) { return G[ch] || G['?']; }
  /** rows needed above the cap line (Ö, Ü, İ, Ğ carry their marks there);
   *  0 for every other string, so ordinary text is drawn exactly as before */
  function headroom(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { var t = glyph(str[i]).top; if (t < -h) h = -t; }
    return h;
  }
  function measure(str, bold) {
    var w = 0;
    for (var i = 0; i < str.length; i++) { var gl = glyph(str[i]); w += gl.w + (bold && str[i] !== ' ' ? 1 : 0) + SPACE; }
    return Math.max(0, w - SPACE);
  }
  /** paint the glyph pixels with fn(x, y) */
  function paint(str, bold, fn) {
    var x = 0;
    for (var i = 0; i < str.length; i++) {
      var gl = glyph(str[i]);
      for (var r = 0; r < gl.rows.length; r++) for (var c = 0; c < gl.w; c++) if (gl.rows[r][c] === '#') {
        fn(x + c, gl.top + r);
        if (bold) fn(x + c + 1, gl.top + r);
      }
      x += gl.w + (bold && str[i] !== ' ' ? 1 : 0) + SPACE;
    }
  }

  /* style: { bold, color (or array of colours per row: a pixel gradient),
   *          outline, shadow (colour, drawn 1px down), scale } */
  var cache = {}, cacheN = 0;
  function render(str, st) {
    st = st || {};
    var key = str + '\u0001' + JSON.stringify(st);
    if (cache[key]) return cache[key];
    if (++cacheN > 600) { cache = {}; cacheN = 0; }
    var bold = st.bold !== false, pad = st.outline ? 1 : 0, sh = st.shadow ? 1 : 0;
    var head = headroom(str), w = measure(str, bold), h = ROWS + head;
    var c = document.createElement('canvas');
    c.width = Math.max(1, w + pad * 2 + sh); c.height = h + pad * 2 + sh;
    var gx = c.getContext('2d');
    var mask = {};
    paint(str, bold, function (x, y) { mask[x + ',' + (y + head)] = 1; });
    var pts = Object.keys(mask).map(function (k) { var p = k.split(','); return [+p[0], +p[1]]; });
    function dot(x, y, col) { gx.fillStyle = col; gx.fillRect(x, y, 1, 1); }
    if (st.shadow) pts.forEach(function (p) {
      [[0, 1], [1, 1]].concat(pad ? [[-1, 2], [0, 2], [1, 2], [2, 1], [2, 2]] : []).forEach(function (o) { dot(p[0] + pad + o[0] - (pad ? 0 : 0), p[1] + pad + o[1], st.shadow); });
    });
    if (pad) pts.forEach(function (p) {
      for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) if (ox || oy) dot(p[0] + pad + ox, p[1] + pad + oy, st.outline);
    });
    var cols = Array.isArray(st.color) ? st.color : null;
    pts.forEach(function (p) { dot(p[0] + pad, p[1] + pad, cols ? cols[Math.min(cols.length - 1, p[1])] : (st.color || '#ffffff')); });
    c.base = pad + head + 9;   // baseline row inside the canvas
    c.pad = pad; c.head = head;
    cache[key] = c;
    return c;
  }
  /** draw text with its top-left (or align: 'center' / 'right') at x, y */
  function draw(g2, str, x, y, st) {
    var c = render(str, st), s = (st && st.scale) || 1;
    var dx = st && st.align === 'center' ? -Math.floor(c.width * s / 2) : st && st.align === 'right' ? -c.width * s : 0;
    g2.drawImage(c, Math.round(x + dx - c.pad * s), Math.round(y - (c.pad + c.head) * s), c.width * s, c.height * s);
    return c.width * s;
  }
  function wrap(str, maxW, bold) {
    var words = String(str).split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (measure(t, bold !== false) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  /** big title lettering: glyphs at scale s, then a native 1px ink outline,
   *  a solid extrusion below, a row gradient and a shine on the top edges */
  function logo(str, o) {
    o = o || {};
    var s = o.scale || 2, depth = o.depth || 3, bold = o.bold !== false, head = headroom(str);
    var w = measure(str, bold) * s + 4, h = (ROWS + head) * s + depth + 3;
    var m = new Uint8Array(w * h);
    paint(str, bold, function (x, y) { for (var a = 0; a < s; a++) for (var b = 0; b < s; b++) m[((y + head) * s + b + 1) * w + x * s + a + 1] = 1; });
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var gx = c.getContext('2d');
    function at(x, y) { return x >= 0 && y >= 0 && x < w && y < h && m[y * w + x]; }
    function dot(x, y, col) { gx.fillStyle = col; gx.fillRect(x, y, 1, 1); }
    var ext = o.ext || ['#c4561f', '#9a3a1c', '#6e2618'], ink = o.ink || '#1b1029';
    var solid = new Uint8Array(w * h), x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) for (var d = 0; d <= depth; d++) if (at(x, y - d)) solid[y * w + x] = d === 0 ? 2 : Math.max(solid[y * w + x], 1);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      if (solid[y * w + x]) continue;
      var near = false;
      for (var oy = -1; oy <= 1 && !near; oy++) for (var ox = -1; ox <= 1; ox++) { var xx = x + ox, yy = y + oy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && solid[yy * w + xx]) { near = true; break; } }
      if (near) dot(x, y, ink);
    }
    var cols = o.colors || ['#fffbe0', '#fff1a6', '#ffe06a', '#ffd64a', '#ffc23c', '#f7a83a', '#f08a2a'];
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var v = solid[y * w + x]; if (!v) continue;
      if (v === 1) { var dd = 0; while (dd < depth && !at(x, y - dd - 1)) dd++; dot(x, y, ext[Math.min(ext.length - 1, Math.floor(dd * ext.length / (depth + 1)))]); continue; }
      var row = Math.floor((y - 1) / (ROWS * s) * cols.length * 1.35);
      var col = cols[Math.max(0, Math.min(cols.length - 1, row))];
      if (!at(x, y - 1) || !at(x - 1, y)) col = o.shine || '#ffffff';
      dot(x, y, col);
    }
    return c;
  }
  return { measure: function (s, b) { return measure(s, b !== false); }, render: render, draw: draw, wrap: wrap, logo: logo, ROWS: ROWS, LINE: 13 };
})();

/* ---------------- js/gfx/world.js */
/* Pocket Quest - world art (rework): the school yard in the morning.
 *
 * Depth comes from layers that fade into the sky colour the farther they are
 * (far hills, the town, big trees), a ground with a grass lip, roots and
 * stones, props in the play layer, and a dark foreground of grass in front.
 * Every layer is pre-rendered once into a canvas and scrolled at its own
 * speed. The light is the morning sun at the top right, like the characters'.
 */
window.PQ = window.PQ || {};
PQ.world = (function () {
  'use strict';
  var PX = PQ.px, R = PX.ramp, F = PQ.font, INK = PX.INK;
  var W = 480, H = 270, GY = 224;

  /* an integer hash in [0, 1]: Math.imul keeps every bit, so big inputs still scatter */
  function hash(n) {
    n = Math.floor(n) | 0;
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967295;
  }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rect(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function mix(a, b, t) { return PX.mix(a, b, t); }

  var SKY = ['#3d8cf0', '#4a97f2', '#58a2f4', '#68aef6', '#7abaf7', '#8dc5f8', '#a2d0f8', '#b7dbf7', '#cde5f5', '#e2edf0', '#f4f1e4'];
  var HAZE = '#cde5f5', LW = W * 2;   // the far layers are two screens wide, so they do not repeat soon
  function haze(c, k) { return mix(c, HAZE, k); }
  function hazeRamp(r, k) { return R(haze(r.c[0], k), haze(r.c[1], k), haze(r.c[2], k), haze(r.c[3], k), haze(r.line, k)); }

  /* ------------------------------------------------------------ sky */
  var skyCv;
  function buildSky() {
    skyCv = canvas(W, H);
    var g = skyCv.getContext('2d'), band = 17;
    for (var i = 0; i < SKY.length; i++) {
      rect(g, SKY[i], 0, i * band, W, band + 1);
      if (i + 1 < SKY.length) for (var x = 0; x < W; x++) rect(g, SKY[i + 1], x, i * band + band - ((x & 1) ? 2 : 1), 1, 1);   // dithered seam
    }
    rect(g, SKY[SKY.length - 1], 0, SKY.length * band, W, H);
    // high wisps, thin and pale
    [[30, 22, 70], [120, 34, 46], [210, 18, 90], [330, 40, 54], [20, 52, 40], [250, 58, 64]].forEach(function (s, i) {
      rect(g, 'rgba(255,255,255,0.32)', s[0], s[1], s[2], 1);
      rect(g, 'rgba(255,255,255,0.22)', s[0] + 8 + i, s[1] + 1, s[2] - 18, 1);
      rect(g, 'rgba(255,255,255,0.16)', s[0] - 6, s[1] - 1, Math.round(s[2] * 0.4), 1);
    });
    // the sun, top right: a soft halo in steps
    var sx = 402, sy = 46;
    [[46, 'rgba(255,248,210,0.16)'], [34, 'rgba(255,246,205,0.22)'], [24, 'rgba(255,244,200,0.35)']].forEach(function (r) {
      g.fillStyle = r[1]; g.beginPath(); g.arc(sx, sy, r[0], 0, 7); g.fill();
    });
    pixelDisc(g, sx, sy, 15, '#fff8d8'); pixelDisc(g, sx, sy, 13, '#fffdf0');
  }
  function pixelDisc(g, cx, cy, r, col) {
    for (var y = -r; y <= r; y++) { var w = Math.round(Math.sqrt(r * r - y * y)); rect(g, col, cx - w, cy + y, w * 2, 1); }
  }

  /* ------------------------------------------------------------ clouds */
  var CLOUD = R('#ffffff', '#f3f8ff', '#d7e5f8', '#bccdec', '#9fb3dc');
  function cloud(seed, w, ramp) {
    ramp = ramp || CLOUD;
    var h = Math.round(w * 0.42), p = new PX.Pic(w, h + 2), n = 4 + Math.floor(hash(seed) * 3);
    var puffs = [];
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n, cx = w * (0.14 + t * 0.72) + (hash(seed + i) - 0.5) * w * 0.08;
      var r = h * (0.32 + 0.3 * Math.sin(t * Math.PI)) * (0.8 + hash(seed * 7 + i) * 0.35);
      puffs.push([cx, h - r * 0.9, r]);
    }
    puffs.sort(function (a, b) { return a[2] - b[2]; });
    puffs.forEach(function (q, i) { p.part('puff' + i, { soft: true }); p.ellipse(q[0], q[1], q[2] * 1.15, q[2], ramp, { flat: 0.9, clip: function (x, y) { return y < h - 1; } }); });
    p.part('base', { contour: false }); p.rbox(w * 0.1, h - 6, w * 0.9, h - 1, 2.5, ramp, { tone: 2 });
    return p.toCanvas({ outline: false });
  }
  var clouds;
  function buildClouds() {
    var far = hazeRamp(CLOUD, 0.35);   // three small, paler ones far away
    clouds = [cloud(3, 96), cloud(11, 64), cloud(23, 120), cloud(41, 52), cloud(57, 80), cloud(71, 40, far), cloud(83, 34, far), cloud(97, 46, far)];
  }

  /* ------------------------------------------------------------ far layers
   * Mountains: each peak one clean shape, its face to the sun (right)
   * lighter, the other in shade, a snow cap with a soft wavy edge. The light
   * is decided per peak, not per column, so there are no stripes. */
  var PEAKS = [[60, 44, 92], [180, 32, 70], [310, 58, 104], [440, 38, 82], [570, 50, 96], [700, 34, 72], [820, 54, 100], [930, 40, 84]];
  var mountCv, hillsCv, townCv, parkCv;
  function buildMountains() {
    mountCv = canvas(LW, H); var g = mountCv.getContext('2d'), base = 170;
    var lit = haze('#b4c2ee', 0.45), shade = haze('#97a6dc', 0.45), snowL = haze('#ffffff', 0.2), snowS = haze('#e1e7fb', 0.26);
    for (var x = 0; x < LW; x++) {
      var top = 999, best = null;
      PEAKS.forEach(function (p) {
        for (var wrap = -1; wrap <= 1; wrap++) {   // the layer repeats: a peak near one end shows at the other too
          var px = p[0] + wrap * LW, d = Math.abs(x - px);
          if (d > p[2]) continue;
          var y = base - p[1] * (1 - d / p[2]);
          if (y < top) { top = y; best = { px: px, h: p[1] }; }
        }
      });
      if (!best) continue;
      var sunny = x >= best.px, snowEdge = base - best.h + Math.min(18, best.h * 0.42) + Math.round(1.5 * Math.sin(x * 0.3));
      for (var y2 = Math.round(top); y2 < 190; y2++) {
        var c = sunny ? lit : shade;
        if (best.h > 36 && y2 < snowEdge) c = sunny ? snowL : snowS;
        rect(g, c, x, y2, 1, 1);
      }
    }
  }
  /* green hills: two soft rolls with a few wide patches of two greens, no lines */
  function hillLine(x, base, amp, f, seed) {
    var t = x / LW * Math.PI * 2;
    return Math.round(base - amp * (0.6 * Math.sin(t * f + seed) + 0.4 * Math.sin(t * f * 2 + seed * 3)));
  }
  function buildHills() {
    hillsCv = canvas(LW, H); var g = hillsCv.getContext('2d');
    [{ base: 160, amp: 12, f: 2, seed: 1.3, k: 0.55, cols: ['#8fd27a', '#9fd985'] },
     { base: 174, amp: 9, f: 3, seed: 4.1, k: 0.45, cols: ['#7cc96a', '#8ed27a'] }].forEach(function (L, li) {
      for (var x = 0; x < LW; x++) {
        var top = hillLine(x, L.base, L.amp, L.f, L.seed), patch = Math.floor((x + li * 37) / 90) % 2;
        rect(g, haze(L.cols[patch], L.k), x, top, 1, 200 - top);
        rect(g, haze('#d8f2a0', L.k), x, top, 1, 1);
      }
      for (var tx = 30 + li * 50; tx < LW; tx += 110 + li * 40) {   // a few small trees on the crest
        var ty = hillLine(tx, L.base, L.amp, L.f, L.seed);
        rect(g, haze('#3b8a3e', L.k - 0.05), tx - 2, ty - 4, 5, 4); rect(g, haze('#5fb544', L.k - 0.05), tx - 1, ty - 4, 3, 1);
      }
    });
  }
  /* the town: houses with red tiled roofs, a few flats, a water tower, half
   * faded into the haze */
  function house(g, x, base, w, h, wall, roof, seed, k) {
    var f = function (c) { return haze(c, k); };
    rect(g, f('#2b2350'), x - 1, base - h - 1, w + 2, h + 1);
    rect(g, f(wall), x, base - h, w, h);
    rect(g, f(mix(wall, '#000000', 0.15)), x, base - h, 2, h);
    for (var i = 0; i < 8; i++) {   // the roof, with rows of tiles
      rect(g, f(i === 0 ? mix(roof, '#ffffff', 0.25) : roof), x - 3 + i, base - h - 8 + i, w + 6 - i * 2, 1);
      if (i > 1 && i < 7) for (var tx = x - 2 + i + ((i % 2) * 2); tx < x + w + 4 - i; tx += 4) rect(g, f(mix(roof, '#000000', 0.2)), tx, base - h - 8 + i, 1, 1);
    }
    rect(g, f('#2b2350'), x - 4, base - h - 1, w + 8, 1);
    if (hash(seed * 3) > 0.5) { var cx = x + Math.round(w * 0.7); rect(g, f('#2b2350'), cx - 1, base - h - 13, 6, 9); rect(g, f('#b5584a'), cx, base - h - 12, 4, 8); }   // a chimney
    for (var r = 0; r < 2; r++) for (var c = 0; c < Math.floor(w / 9); c++) {
      var wx = x + 4 + c * 9, wy = base - h + 5 + r * 10;
      if (wy + 6 > base - 2) continue;
      rect(g, f('#2b2350'), wx - 1, wy - 1, 6, 7); rect(g, f(hash(seed + r * 9 + c) > 0.5 ? '#fff1b8' : '#bfe3ff'), wx, wy, 4, 5);
    }
  }
  function flats(g, x, base, w, h, wall, seed, k) {
    var f = function (c) { return haze(c, k); };
    rect(g, f('#2b2350'), x - 1, base - h - 3, w + 2, h + 3);
    rect(g, f(wall), x, base - h - 2, w, h + 2);
    rect(g, f(mix(wall, '#000000', 0.15)), x, base - h - 2, 2, h + 2);
    rect(g, f(mix(wall, '#ffffff', 0.35)), x, base - h - 2, w, 1);
    rect(g, f('#2b2350'), x + w - 9, base - h - 8, 6, 6); rect(g, f('#8a8aa0'), x + w - 8, base - h - 7, 4, 4);   // a tank on the roof
    for (var fl = 0; fl < Math.floor((h - 4) / 9); fl++) {
      var y = base - h + 3 + fl * 9;
      for (var c = 0; c < Math.floor((w - 4) / 8); c++) {
        var wx = x + 4 + c * 8;
        rect(g, f('#2b2350'), wx - 1, y - 1, 5, 6); rect(g, f(hash(seed + fl * 13 + c) > 0.6 ? '#fff1b8' : '#bfe3ff'), wx, y, 3, 4);
      }
      rect(g, f(mix(wall, '#000000', 0.25)), x + 2, y + 5, w - 4, 1);   // a balcony rail
    }
  }
  function waterTower(g, x, base, k) {
    var f = function (c) { return haze(c, k); };
    [x - 9, x + 8].forEach(function (lx) { rect(g, f('#2b2350'), lx, base - 30, 2, 30); });
    rect(g, f('#2b2350'), x - 9, base - 16, 19, 1);
    rect(g, f('#2b2350'), x - 13, base - 52, 27, 23); rect(g, f('#e9eef7'), x - 12, base - 51, 25, 21); rect(g, f('#c5cde0'), x + 6, base - 51, 7, 21);
    rect(g, f('#3a86d8'), x - 12, base - 44, 25, 4);
    for (var i = 0; i < 6; i++) rect(g, f('#d84a4a'), x - 11 + i, base - 58 + i, 23 - i * 2, 1);
  }
  var memo = {};
  function cached(key, w, h, draw) {
    if (!memo[key]) { var c = canvas(w, h); draw(c.getContext('2d')); memo[key] = c; }
    return memo[key];
  }
  function tree(g, cx, base, r, leaf, trunk, k) {
    var key = 'tree|' + r.toFixed(2) + '|' + leaf.c[1];
    var c = memo[key] || (memo[key] = treeSprite(r, leaf, trunk, k));
    g.drawImage(c, Math.round(cx - c.width / 2), Math.round(base - c.height + 1));
  }
  function treeSprite(r, leaf, trunk, k) {
    var p = new PX.Pic(Math.round(r * 2.8), Math.round(r * 3.2));
    var ox = p.w / 2, oy = p.h - 1;
    p.part('trunk'); p.rbox(ox - r * 0.18, oy - r * 1.3, ox + r * 0.18, oy, r * 0.1, trunk, { vert: 0.1 });
    var blobs = [[0, -2.0, 0.95], [-0.62, -1.62, 0.66], [0.66, -1.58, 0.7], [-0.25, -2.55, 0.62], [0.36, -2.48, 0.6]];
    blobs.forEach(function (b, i) { p.part('leaf' + i, { soft: true }); p.ellipse(ox + b[0] * r, oy + b[1] * r, b[2] * r * 1.08, b[2] * r, leaf, { flat: 1.0 }); });
    // a few lighter leaf clumps on the lit side
    p.retone(function (x, y, xi, yi) { return hash(xi * 13 + yi * 7) > 0.83; }, -1, ['leaf0', 'leaf2', 'leaf4']);
    return p.toCanvas({ ink: k && k.ink });
  }
  /** a poplar: tall and narrow, one long crown */
  function poplarSprite(r, leaf, trunk) {
    var p = new PX.Pic(Math.round(r * 1.6), Math.round(r * 4.4)), ox = p.w / 2, oy = p.h - 1;
    p.part('trunk'); p.rbox(ox - r * 0.12, oy - r * 0.9, ox + r * 0.12, oy, 1, trunk, { vert: 0.1 });
    p.part('crown', { soft: true }); p.ellipse(ox, oy - r * 2.35, r * 0.62, r * 1.95, leaf, { flat: 1.0 });
    p.retone(function (x, y, xi, yi) { return hash(xi * 17 + yi * 5) > 0.8; }, -1, ['crown']);
    return p.toCanvas();
  }
  var LEAF = R('#b8ec6e', '#79cf52', '#46a447', '#2c7a42', '#174d33');
  var LEAF_FAR = hazeRamp(LEAF, 0.45), LEAF_MID = hazeRamp(LEAF, 0.2);
  var TRUNK = R('#c08a5c', '#8f5f3d', '#69432f', '#4a2d24', '#2a1814');
  var BLOSSOM_MID = hazeRamp(R('#fff0f6', '#ffc2db', '#f38fbb', '#c85b93', '#7a2a5a'), 0.3);
  /** a tree of the park line: its trunk fades into the haze like its leaves */
  function parkTree(g, cx, base, r, leaf, kind) {
    var key = 'park|' + (kind || 'round') + '|' + r + '|' + leaf.c[1];
    var c = memo[key] || (memo[key] = kind === 'poplar' ? poplarSprite(r, leaf, hazeRamp(TRUNK, 0.2)) : treeSprite(r, leaf, hazeRamp(TRUNK, 0.2)));
    g.drawImage(c, Math.round(cx - c.width / 2), Math.round(base - c.height + 1));
  }
  function buildTown() {
    townCv = canvas(LW, H); var g = townCv.getContext('2d');
    var walls = ['#ffe3b0', '#ffc9b8', '#d8ecff', '#fff4d6', '#e6d6ff', '#d6f2e0'], roofs = ['#d9583f', '#c94a3a', '#e0704a', '#4f7fd8', '#d9583f'];
    var x = 4, i = 0;
    while (x < LW - 40) {
      var kind = hash(i * 17), hw = 30 + Math.round(hash(i * 11) * 26), hh = 22 + Math.round(hash(i * 13) * 18);
      if (i === 9) { waterTower(g, x + 14, 196, 0.5); hw = 30; }
      else if (kind > 0.8) flats(g, x, 196, hw - 6, 30 + Math.round(hash(i * 5) * 12), walls[i % walls.length], i * 31, 0.5);
      else if (kind > 0.22) house(g, x, 196, hw, hh, walls[i % walls.length], roofs[(i * 3) % roofs.length], i * 31, 0.48);
      else parkTree(g, x + hw / 2, 196, 12 + Math.round(hash(i) * 5), LEAF_FAR);
      x += hw + 5 + Math.round(hash(i * 19) * 12); i++;
    }
    rect(g, haze('#79cf52', 0.5), 0, 196, LW, H - 196);
    rect(g, haze('#a5df6a', 0.5), 0, 196, LW, 1);
  }
  /* the park line: a hedge, round trees, poplars and two in blossom, and the
   * school's playground in it (swings, a slide, a climbing dome) with the
   * school flag */
  function swingFrame(g, x, base, k) {
    var f = function (c) { return haze(c, k); };
    [x, x + 46].forEach(function (lx) {
      for (var y = 0; y < 40; y++) {
        var s = Math.round(y * 0.22);
        rect(g, f(INK), lx - s - 1, base - 40 + y, 3, 1); rect(g, f(INK), lx + s - 1, base - 40 + y, 3, 1);
        rect(g, f('#e0604f'), lx - s, base - 40 + y, 1, 1); rect(g, f('#e0604f'), lx + s, base - 40 + y, 1, 1);
      }
    });
    rect(g, f(INK), x - 2, base - 42, 51, 4); rect(g, f('#ff8a6a'), x - 1, base - 41, 49, 1); rect(g, f('#e0604f'), x - 1, base - 40, 49, 1);
  }
  function slide(g, x, base, k) {
    var f = function (c) { return haze(c, k); };
    rect(g, f(INK), x - 1, base - 34, 3, 34); rect(g, f(INK), x + 11, base - 34, 3, 34);   // the ladder
    rect(g, f('#ffd64a'), x, base - 34, 1, 34); rect(g, f('#ffd64a'), x + 12, base - 34, 1, 34);
    for (var r = base - 30; r < base; r += 6) rect(g, f('#ffd64a'), x, r, 13, 1);
    rect(g, f(INK), x - 2, base - 36, 18, 4); rect(g, f('#3a86d8'), x - 1, base - 35, 16, 2);   // the top
    for (var i = 0; i < 40; i++) {                                                             // the chute
      var sx = x + 14 + i, sy = base - 34 + Math.round(i * 0.75 + Math.max(0, i - 30) * -0.4);
      rect(g, f(INK), sx, sy - 1, 1, 5); rect(g, f('#52a6f2'), sx, sy, 1, 2); rect(g, f('#3474d2'), sx, sy + 2, 1, 1);
    }
  }
  function dome(g, cx, base, k) {
    var f = function (c) { return haze(c, k); }, cols = ['#e0604f', '#ffd64a', '#57cc99', '#52a6f2'];
    for (var a = 0; a < 4; a++) {
      var rx = 30 - a * 7;
      for (var i = 0; i <= 40; i++) {
        var an = Math.PI * i / 40, px = Math.round(cx - Math.cos(an) * rx), py = Math.round(base - Math.sin(an) * 30);
        rect(g, f(INK), px - 1, py - 1, 3, 3); rect(g, f(cols[a]), px, py, 1, 1);
      }
    }
    for (var h = 1; h < 3; h++) { var hy = base - h * 10, hw = Math.round(Math.sqrt(1 - Math.pow(h * 10 / 30, 2)) * 30); rect(g, f(INK), cx - hw, hy - 1, hw * 2, 3); rect(g, f('#ff9d3a'), cx - hw, hy, hw * 2, 1); }
  }


  var SWINGS = [158, 186], FLAG = 762, PARK_K = 0.18;
  function buildPark() {
    parkCv = canvas(LW, H); var g = parkCv.getContext('2d');
    for (var x = 0; x < LW; x += 2) {   // the hedge
      var hgt = 12 + Math.round(4 * Math.sin(x * 0.07) + 3 * Math.sin(x * 0.17 + 1));
      rect(g, LEAF_MID.c[2], x, 214 - hgt, 2, hgt + 20); rect(g, LEAF_MID.c[1], x, 214 - hgt, 2, 2);
      if (hash(x) > 0.7) rect(g, LEAF_MID.c[0], x, 214 - hgt + 1, 1, 1);
    }
    [[40, 'round', 24, LEAF_MID], [104, 'poplar', 16, LEAF_MID], [236, 'round', 19, BLOSSOM_MID], [420, 'poplar', 18, LEAF_MID], [470, 'round', 26, LEAF_MID],
     [640, 'round', 21, LEAF_MID], [716, 'poplar', 15, LEAF_MID], [800, 'round', 19, BLOSSOM_MID], [920, 'round', 25, LEAF_MID]].forEach(function (t) { parkTree(g, t[0], 214, t[2], t[3], t[1]); });
    swingFrame(g, 150, 214, PARK_K); slide(g, 300, 214, PARK_K); dome(g, 560, 214, PARK_K);   // (no seesaw or sandbox: over a pit they looked like something to stand on)
    rect(g, haze(INK, PARK_K), FLAG - 2, 128, 3, 86); rect(g, haze('#c8cce0', PARK_K), FLAG - 1, 128, 1, 86); rect(g, haze('#ffd64a', PARK_K), FLAG - 3, 125, 5, 3);   // the flagpole
  }
  /** what moves in the park: a swing (one child on it, one empty) and the flag */
  function parkLife(g, camX, t) {
    var off = -Math.round((camX * 0.5) % LW); if (off > 0) off -= LW;
    for (var base = off; base < W; base += LW) {
      SWINGS.forEach(function (sx, i) {
        var a = i === 0 ? Math.sin(t * 2.2) * 0.45 : Math.sin(t * 0.9) * 0.06, len = 26;
        var x = base + sx, y0 = 214 - 40, ex = x + Math.sin(a) * len, ey = y0 + Math.cos(a) * len;
        for (var s = 0; s <= len; s += 2) rect(g, haze('#6b6b80', PARK_K), x + Math.sin(a) * s, y0 + Math.cos(a) * s, 1, 1);
        rect(g, haze(INK, PARK_K), ex - 5, ey, 10, 3); rect(g, haze('#ffd64a', PARK_K), ex - 4, ey + 1, 8, 1);
      });
      var fx = base + FLAG + 1;   // the school flag: blue, a white bird on it
      for (var c = 0; c < 26; c++) {
        var wy = Math.round(Math.sin(t * 4 - c * 0.35) * (c / 26) * 2.5);
        rect(g, haze(INK, PARK_K), fx + c, 129 + wy, 1, 18); rect(g, haze(c < 2 ? '#2f6fd8' : '#3a86ff', PARK_K), fx + c, 130 + wy, 1, 16);
        if (c > 8 && c < 17) rect(g, haze('#ffffff', PARK_K), fx + c, 136 + wy, 1, 4);
      }
    }
  }
  /** a little flock of birds crosses the sky now and then */
  function birds(g, camX, t) {
    var period = 34, k = (t % period) / period; if (k > 0.75) return;
    var x0 = W + 30 - k / 0.75 * (W + 120) - camX * 0.02, y0 = 64 + Math.sin(t * 0.6) * 6, col = 'rgba(43,35,80,0.55)';
    [[0, 0], [9, 5], [18, 9], [8, -4], [-6, 6]].forEach(function (b, i) {
      var x = Math.round(x0 + b[0]), y = Math.round(y0 + b[1]);
      if (Math.floor(t * 7 + i * 1.7) % 2) { rect(g, col, x - 2, y - 1, 1, 1); rect(g, col, x - 1, y, 1, 1); rect(g, col, x, y + 1, 1, 1); rect(g, col, x + 1, y, 1, 1); rect(g, col, x + 2, y - 1, 1, 1); }
      else { rect(g, col, x - 2, y + 1, 2, 1); rect(g, col, x, y, 1, 1); rect(g, col, x + 1, y + 1, 2, 1); }
    });
  }

  function tiled(g, layer, camX, k, y) {
    var w = layer.width, off = -Math.round((camX * k) % w);
    if (off > 0) off -= w;
    for (var x = off; x < W; x += w) g.drawImage(layer, x, y || 0);
  }

  /** (added by the site's tools/make-world.mjs) the far layers only: sky, clouds, birds, mountains, hills */
  function far(g, camX, t) {
    if (!skyCv) { buildSky(); buildClouds(); buildMountains(); buildHills(); buildTown(); buildPark(); }
    t = t || 0;
    g.drawImage(skyCv, 0, 0);
    var drift = t * 3;
    [[5, 92, 0.02, 0.2], [6, 104, 0.025, 0.25], [7, 84, 0.03, 0.3], [0, 30, 0.04, 1], [1, 62, 0.05, 1], [2, 18, 0.03, 1], [3, 84, 0.06, 1], [4, 50, 0.045, 1]].forEach(function (c, i) {
      var cl = clouds[c[0]], span = W + cl.width + 60;
      var x = ((i * 157 + 40 - camX * c[2] - drift * (0.5 + i * 0.15) * c[3]) % span + span) % span - cl.width;
      g.drawImage(cl, Math.round(x), c[1]);
    });
    birds(g, camX, t);
    tiled(g, mountCv, camX, 0.03);
    tiled(g, hillsCv, camX, 0.08);
  }
  /** the whole background, back to front */
  function background(g, camX, t) {
    if (!skyCv) { buildSky(); buildClouds(); buildMountains(); buildHills(); buildTown(); buildPark(); }
    t = t || 0;
    g.drawImage(skyCv, 0, 0);
    // clouds drift slowly on their own; the three far ones slower still
    var drift = t * 3;
    [[5, 92, 0.02, 0.2], [6, 104, 0.025, 0.25], [7, 84, 0.03, 0.3], [0, 30, 0.04, 1], [1, 62, 0.05, 1], [2, 18, 0.03, 1], [3, 84, 0.06, 1], [4, 50, 0.045, 1]].forEach(function (c, i) {
      var cl = clouds[c[0]], span = W + cl.width + 60;
      var x = ((i * 157 + 40 - camX * c[2] - drift * (0.5 + i * 0.15) * c[3]) % span + span) % span - cl.width;
      g.drawImage(cl, Math.round(x), c[1]);
    });
    birds(g, camX, t);
    tiled(g, mountCv, camX, 0.03);
    tiled(g, hillsCv, camX, 0.08);
    tiled(g, townCv, camX, 0.22);
    tiled(g, parkCv, camX, 0.5);
    parkLife(g, camX, t);
  }

  /* ------------------------------------------------------------ ground */
  var G_INK = '#173b24', GRASS = ['#d2f584', '#97da55', '#5fb544', '#3b8a3e', '#24633a'];
  var DIRT = ['#d79c68', '#b5774c', '#93593b', '#6f402f', '#4c2b25', '#341c1c'];
  /** a run of ground from x0 to x1 (world x), its top at y; ends get a lip */
  function ground(g, camX, x0, x1, top, o) {
    var key = ['ground', camX, x0, x1, top, o && o.noFlowers].join('|');
    var c = memo[key] || (memo[key] = (function () { var cv = canvas(W, H); groundArt(cv.getContext('2d'), camX, x0, x1, top, o); return cv; })());
    g.drawImage(c, 0, 0);
  }
  function groundArt(g, camX, x0, x1, top, o) {
    o = o || {};
    var sx0 = Math.max(0, Math.round(x0 - camX)), sx1 = Math.min(W, Math.round(x1 - camX));
    for (var sx = sx0; sx < sx1; sx++) {
      var wx = Math.round(sx + camX), ex = Math.min(wx - x0, x1 - 1 - wx);  // distance to the nearest end
      var drop = ex === 0 ? 2 : ex === 1 ? 1 : 0;
      var drip = 5 + Math.floor(hash(wx * 3) * 3) + (hash(Math.floor(wx / 3)) > 0.7 ? 1 : 0);
      var y = top + drop;
      // grass: outline, lit rim, body, shade, ragged drip into the dirt
      rect(g, G_INK, sx, y - 1, 1, 1);
      rect(g, GRASS[0], sx, y, 1, 1);
      rect(g, GRASS[1], sx, y + 1, 1, 3);
      if (hash(wx * 7) > 0.6) rect(g, GRASS[0], sx, y + 1, 1, 1);
      rect(g, GRASS[2], sx, y + 4, 1, drip - 4);
      rect(g, GRASS[3], sx, y + drip, 1, 1);
      // dirt, darker with depth
      var d0 = y + drip + 1;
      for (var yy = d0; yy < H; yy++) rect(g, yy === d0 ? DIRT[3] : dirt(wx, yy, yy - y - 8), sx, yy, 1, 1);   // the bands follow the ground's top, not the grass's ragged edge
      if (ex === 0) rect(g, G_INK, sx, y - 1, 1, H - y + 1);
    }
    // stones and roots, placed by hash so they stay put as the camera moves
    for (var cx = Math.floor(x0 / 16) * 16; cx < x1; cx += 16) {
      var hs = hash(cx * 17 + 5);
      if (hs > 0.82 && cx - camX > -10 && cx - camX < W + 10 && cx > x0 + 4 && cx < x1 - 10) {
        var stx = Math.round(cx - camX + hash(cx) * 8), sty = top + 14 + Math.round(hash(cx * 3) * 18);
        stone(g, stx, sty, 3 + Math.round(hash(cx * 9) * 3));
      }
    }
    // grass blades and flowers on top
    for (var bx = Math.ceil(x0 / 3) * 3; bx < x1 - 2; bx += 3) {
      var bxs = Math.round(bx - camX); if (bxs < -2 || bxs > W + 2) continue;
      var hb = hash(bx * 29);
      if (hb > 0.55) { rect(g, G_INK, bxs, top - 3, 1, 2); rect(g, GRASS[1], bxs + 1, top - 3, 1, 2); rect(g, GRASS[0], bxs + 1, top - 3, 1, 1); }
      if (hb > 0.975 && !o.noFlowers) flower(g, bxs, top - 1, Math.floor(hash(bx) * 4));
    }
  }
  /** the colour of the soil at (wx, yy), depth rows under the grass: it
   *  darkens in small, close steps (no pattern, no hard line), with a few
   *  lighter flecks two pixels wide, so the soil has grain but no noise */
  var DIRT_STEPS = [];
  for (var di = 0; di < 9; di++) DIRT_STEPS.push(mix(DIRT[1], DIRT[4], di / 8));
  function dirt(wx, yy, depth) {
    var k = Math.max(0, Math.min(8, Math.floor(depth / 5)));
    if (k < 6 && hash(Math.floor(wx / 2) * 131 + yy * 71) > 0.975) return mix(DIRT_STEPS[k], DIRT[0], 0.35);
    return DIRT_STEPS[k];
  }
  function stone(g, x, y, r) {
    rect(g, '#3a2424', x - r, y - 1, r * 2 + 1, 4);
    rect(g, '#3a2424', x - r + 1, y - 2, r * 2 - 1, 6);
    rect(g, '#b8aca0', x - r + 1, y - 1, r * 2 - 1, 3);
    rect(g, '#e2d8cb', x - r + 1, y - 1, r * 2 - 2, 1);
    rect(g, '#8a7c70', x - r + 2, y + 1, r * 2 - 2, 1);
  }
  var PETALS = ['#ffffff', '#ffd64a', '#ff8fbf', '#9ab8ff'];
  function flower(g, x, y, kind) {
    rect(g, '#2c7a42', x, y - 3, 1, 3);
    var c = PETALS[kind];
    rect(g, INK, x - 2, y - 6, 5, 3); rect(g, INK, x - 1, y - 7, 3, 5);
    rect(g, c, x - 1, y - 6, 3, 3); rect(g, c, x - 2, y - 5, 5, 1); rect(g, c, x, y - 7, 1, 5);
    rect(g, kind === 1 ? '#e07a28' : '#ffd64a', x, y - 5, 1, 1);
  }

  /* ------------------------------------------------------------ props */
  var BRICK = ['#ff9a72', '#e8644a', '#c24a40', '#8e3438', '#5a2030'];
  function school(g, x, base) {
    var c = cached('school', 260, 200, function (sg) { schoolArt(sg, 12, 196); });
    g.drawImage(c, Math.round(x - 12), Math.round(base - 196));
  }
  function schoolArt(g, x, base) {
    // a two-storey brick school with a clock tower, a big sign and a rainbow
    var w = 236, h = 112;
    var o = INK;
    rainbow(g, x + w / 2, base - h - 2, 74);
    rect(g, o, x - 1, base - h - 1, w + 2, h + 1);
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
      var row = Math.floor(yy / 4), off = (row % 2) * 4, mort = yy % 4 === 3 || (xx + off) % 8 === 7;
      var shade = xx < 4 ? 2 : xx > w - 3 ? 1 : 1;
      var c = mort ? BRICK[3] : (hash((xx + off) >> 3 ^ row * 97) > 0.82 ? BRICK[0] : BRICK[shade]);
      if (yy < 3) c = BRICK[0];
      rect(g, c, x + xx, base - h + yy, 1, 1);
    }
    // stone trim between floors and at the top
    [[base - h, 5], [base - 56, 4]].forEach(function (s) {
      rect(g, o, x - 4, s[0] - 1, w + 8, s[1] + 2); rect(g, '#f4ead8', x - 3, s[0], w + 6, s[1]); rect(g, '#cdbfa8', x - 3, s[0] + s[1] - 1, w + 6, 1);
    });
    // windows: two rows
    for (var r = 0; r < 2; r++) for (var cI = 0; cI < 6; cI++) {
      if (r === 1 && (cI === 2 || cI === 3)) continue;
      var wx = x + 12 + cI * 37, wy = base - h + 14 + r * 56;
      win(g, wx, wy, 24, 30, (cI + r) % 3 === 0);
    }
    // the door
    var dx = x + w / 2 - 22, dy = base - 46;
    rect(g, o, dx - 3, dy - 3, 50, 49); rect(g, '#f4ead8', dx - 2, dy - 2, 48, 48);
    rect(g, o, dx, dy, 44, 46); rect(g, '#3474d2', dx + 1, dy + 1, 20, 45); rect(g, '#3474d2', dx + 23, dy + 1, 20, 45);
    rect(g, '#52a6f2', dx + 1, dy + 1, 20, 2); rect(g, '#52a6f2', dx + 23, dy + 1, 20, 2);
    rect(g, '#bfe3ff', dx + 4, dy + 6, 14, 14); rect(g, '#bfe3ff', dx + 26, dy + 6, 14, 14);
    rect(g, '#ffffff', dx + 5, dy + 7, 4, 1); rect(g, '#ffffff', dx + 27, dy + 7, 4, 1);
    rect(g, '#ffd64a', dx + 17, dy + 26, 2, 4); rect(g, '#ffd64a', dx + 25, dy + 26, 2, 4);
    // steps
    rect(g, o, dx - 8, base - 4, 60, 4); rect(g, '#e2d8cb', dx - 7, base - 4, 58, 3); rect(g, '#ffffff', dx - 7, base - 4, 58, 1);
    // clock tower
    var tx = x + w / 2 - 20, ty = base - h - 46;
    rect(g, o, tx - 1, ty - 1, 42, 48);
    for (var yy2 = 0; yy2 < 46; yy2++) for (var xx2 = 0; xx2 < 40; xx2++) {
      var row2 = Math.floor(yy2 / 4), off2 = (row2 % 2) * 4, m2 = yy2 % 4 === 3 || (xx2 + off2) % 8 === 7;
      rect(g, m2 ? BRICK[3] : BRICK[xx2 < 3 ? 2 : 1], tx + xx2, ty + yy2, 1, 1);
    }
    for (var i = 0; i < 14; i++) rect(g, i === 0 ? '#ff8a7a' : '#d84a4a', tx - 6 + i, ty - 14 + i, 52 - i * 2, 1);
    rect(g, o, tx - 7, ty - 1, 54, 1);
    for (var j = 0; j < 14; j++) rect(g, o, tx - 6 + j - 1, ty - 14 + j, 1, 1), rect(g, o, tx + 46 - j, ty - 14 + j, 1, 1);
    // clock face
    var ccx = tx + 20, ccy = ty + 20;
    pixelDisc(g, ccx, ccy, 12, o); pixelDisc(g, ccx, ccy, 11, '#f4ead8'); pixelDisc(g, ccx, ccy, 9, '#fffdf4');
    rect(g, o, ccx, ccy - 7, 1, 8); rect(g, o, ccx, ccy, 6, 1);
    for (var q = 0; q < 12; q++) { var a = q / 12 * Math.PI * 2; rect(g, '#8a7c70', Math.round(ccx + Math.sin(a) * 8), Math.round(ccy - Math.cos(a) * 8), 1, 1); }
    // the sign over the door: the school's bluebird and its name
    var sw = 150, sx = x + w / 2 - sw / 2, sy = base - 70;
    rect(g, o, sx - 1, sy - 1, sw + 2, 18); rect(g, '#7a4a2e', sx, sy, sw, 16); rect(g, '#a8693e', sx + 1, sy + 1, sw - 2, 13); rect(g, '#c98a54', sx + 1, sy + 1, sw - 2, 1);
    var nw = F.measure('BLUEBIRD SCHOOL'), nx = Math.round(sx + sw / 2 - (nw + 14) / 2);
    bluebird(g, nx, sy + 4, o);
    F.draw(g, 'BLUEBIRD SCHOOL', nx + 14, sy + 3, { color: '#fff4c8' });
  }
  /** the school's bluebird, 11x9 pixels: blue, a white belly, an orange beak */
  var BIRD = ['...kkkk....', '..kbbbbk...', '.kbbwkbbkk.', 'kbbbbbbbooo', 'klbbbbbbkk.', 'kllbbbbk...', '.kllllk....', '..kkkk.....', '...y.y.....'];
  function bluebird(g, x, y, ink) {
    var pal = { k: ink || INK, b: '#52a6f2', l: '#ffffff', w: '#ffffff', o: '#ffb43c', y: '#e07a28' };
    BIRD.forEach(function (row, j) { for (var i = 0; i < row.length; i++) if (pal[row[i]]) rect(g, pal[row[i]], x + i, y + j, 1, 1); });
  }
  function rainbow(g, cx, cy, r) {
    var cols = ['#f0564f', '#ff9d3a', '#ffd64a', '#66cb5b', '#52a6f2', '#7754cd'], bw = 3;
    for (var y = cy - r - 1; y <= cy; y++) for (var x = cx - r - 1; x <= cx + r + 1; x++) {
      var d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy), band = Math.floor((r - d) / bw);
      if (band < 0 || band >= cols.length) continue;
      rect(g, cols[band], x, y, 1, 1);
      if (band === 0 && (r - d) < 1) rect(g, '#ffffff', x, y, 1, 1);
    }
  }
  function win(g, x, y, w, h, lit) {
    rect(g, INK, x - 2, y - 2, w + 4, h + 4); rect(g, '#f4ead8', x - 1, y - 1, w + 2, h + 2);
    rect(g, INK, x, y, w, h);
    var gl = lit ? ['#fff1b8', '#ffe28a'] : ['#bfe3ff', '#8ec6f2'];
    rect(g, gl[0], x + 1, y + 1, w - 2, h - 2); rect(g, gl[1], x + 1, y + Math.round(h / 2), w - 2, h - 2 - Math.round(h / 2) + 1);
    rect(g, '#ffffff', x + 3, y + 3, 5, 1); rect(g, '#ffffff', x + 3, y + 4, 1, 4);
    rect(g, INK, x + Math.floor(w / 2), y, 1, h); rect(g, INK, x, y + Math.floor(h / 2), w, 1);
    rect(g, '#f4ead8', x - 3, y + h + 1, w + 6, 2);
  }
  function fence(g, x0, x1, base) {
    rect(g, INK, x0, base - 13, x1 - x0, 3); rect(g, '#f4f1ff', x0, base - 12, x1 - x0, 1);
    rect(g, INK, x0, base - 6, x1 - x0, 3); rect(g, '#d8d2ef', x0, base - 5, x1 - x0, 1);
    for (var x = x0; x < x1 - 4; x += 8) {
      rect(g, INK, x, base - 19, 6, 19); rect(g, INK, x + 1, base - 20, 4, 1);
      rect(g, '#ffffff', x + 1, base - 19, 4, 18); rect(g, '#d8d2ef', x + 4, base - 18, 1, 17); rect(g, '#ffffff', x + 2, base - 19, 2, 1);
    }
  }
  function bench(g, x, base) {
    rect(g, INK, x, base - 13, 40, 6); rect(g, '#c98a54', x + 1, base - 12, 38, 4); rect(g, '#e8b77a', x + 1, base - 12, 38, 1);
    rect(g, INK, x + 1, base - 21, 38, 5); rect(g, '#c98a54', x + 2, base - 20, 36, 3); rect(g, '#e8b77a', x + 2, base - 20, 36, 1);
    [[3, 0], [33, 0]].forEach(function (l) { rect(g, INK, x + l[0], base - 8, 4, 8); rect(g, '#4a4360', x + l[0] + 1, base - 8, 2, 8); });
    rect(g, INK, x + 4, base - 17, 3, 5); rect(g, INK, x + 33, base - 17, 3, 5);
  }
  function lamp(g, x, base) {
    rect(g, INK, x - 2, base - 52, 5, 52); rect(g, '#3a6a5a', x - 1, base - 52, 3, 52); rect(g, '#5a9a82', x - 1, base - 52, 1, 52);
    rect(g, INK, x - 5, base - 64, 11, 13); rect(g, '#fff6c8', x - 4, base - 63, 9, 10); rect(g, '#ffffff', x - 3, base - 62, 2, 4);
    rect(g, INK, x - 6, base - 66, 13, 3); rect(g, '#3a6a5a', x - 5, base - 65, 11, 1);
    rect(g, INK, x - 4, base - 3, 9, 3); rect(g, '#3a6a5a', x - 3, base - 3, 7, 2);
  }
  function bush(g, x, base, w) {
    var c = memo['bush|' + w] || (memo['bush|' + w] = bushSprite(w));
    g.drawImage(c, Math.round(x - c.width / 2), Math.round(base - c.height + 1));
  }
  function bushSprite(w) {
    var p = new PX.Pic(w + 4, Math.round(w * 0.6) + 2), h = p.h - 1;
    [[0.3, 0.62, 0.3], [0.62, 0.55, 0.34], [0.46, 0.4, 0.3], [0.82, 0.7, 0.2], [0.14, 0.75, 0.18]].forEach(function (b, i) {
      p.part('b' + i, { soft: true }); p.ellipse(2 + b[0] * w, b[1] * h + 1, b[2] * w, b[2] * w * 0.85, LEAF, { flat: 1, clip: function (xx, yy) { return yy < h; } });
    });
    p.retone(function (xx, yy, xi, yi) { return hash(xi * 31 + yi * 17) > 0.86; }, -1);
    return p.toCanvas({ ink: '#173b24' });
  }
  function signpost(g, x, base, icon) {
    rect(g, INK, x - 2, base - 30, 5, 30); rect(g, '#8f5f3d', x - 1, base - 30, 3, 30); rect(g, '#c08a5c', x - 1, base - 30, 1, 30);
    rect(g, INK, x - 13, base - 42, 27, 16); rect(g, '#a8693e', x - 12, base - 41, 25, 14); rect(g, '#d9a066', x - 12, base - 41, 25, 1);
    rect(g, '#7a4a2e', x - 12, base - 28, 25, 1);
    if (icon) PQ.font.draw(g, icon, x, base - 40, { color: '#fff4c8', align: 'center', outline: '#5a3420' });
  }
  /** the start pad of a challenge: a gold star set in the grass */
  function pad(g, cx, base) {
    rect(g, INK, cx - 15, base - 1, 31, 4); rect(g, '#d98c2f', cx - 14, base - 1, 29, 3); rect(g, '#ffd64a', cx - 14, base - 1, 29, 1);
    rect(g, INK, cx - 11, base - 2, 23, 1);
    PQ.ui.star(g, cx - 4, base - 12);
  }
  /** Hush's silence: a wall of dark ink with two eyes; it melts when solved */
  function gate(g, x, open, t) {
    var hgt = Math.round(GY * (1 - open)); if (hgt <= 0) return;
    var top = GY - hgt;
    for (var y = top; y < GY; y++) {
      var wob = Math.round(Math.sin(y * 0.18 + t * 3) * 1.6), wob2 = Math.round(Math.sin(y * 0.23 - t * 2.4) * 1.4);
      var l = x + wob, r = x + 18 + wob2;
      rect(g, INK, l - 1, y, r - l + 2, 1);
      rect(g, '#3a1f5c', l, y, r - l, 1);
      rect(g, '#5a3390', l + 2, y, Math.max(0, r - l - 8), 1);
      if (((y + Math.floor(t * 14)) % 11) < 2) rect(g, '#8a5ad8', l + 4 + ((y * 7) % 7), y, 3, 1);
    }
    for (var d = 0; d < 4; d++) {   // drips at the top
      var dx = x + 2 + d * 5, dl = 2 + Math.round(2 + 2 * Math.sin(t * 2 + d * 1.7));
      rect(g, INK, dx - 1, top - dl - 1, 4, dl + 1); rect(g, '#3a1f5c', dx, top - dl, 2, dl);
    }
    if (hgt > 70) {
      var ey = GY - 46, blink = (t % 3.2) < 0.14;
      [x + 4, x + 11].forEach(function (ex) {
        rect(g, '#ffffff', ex, ey, 4, blink ? 1 : 5);
        if (!blink) { rect(g, INK, ex + 1, ey + 2, 2, 2); }
      });
    }
  }
  /** brick ledge (the school's) */
  function ledge(g, x, y, w) {
    rect(g, INK, x - 1, y - 1, w + 2, 12);
    for (var yy = 0; yy < 10; yy++) for (var xx = 0; xx < w; xx++) {
      var row = Math.floor(yy / 5), off = (row % 2) * 6, mort = yy % 5 === 4 || (xx + off) % 12 === 11;
      rect(g, mort ? BRICK[3] : BRICK[yy % 5 === 0 ? 0 : 1], x + xx, y + yy, 1, 1);
    }
    rect(g, '#f4ead8', x - 1, y - 3, w + 2, 3); rect(g, INK, x - 2, y - 4, w + 4, 1); rect(g, '#cdbfa8', x - 1, y - 1, w + 2, 1);
  }

  /* ------------------------------------------------------------ foreground + light */
  /* in front of everything: a few soft, dark bushes along the bottom. (No
   * thin grass blades: swaying in front of the eyes they flickered and tired
   * them.) */
  function foreground(g, camX) {
    var col = '#0f2a1c', span = 780;
    for (var b = 0; b < 3; b++) {
      var bx = Math.round(((b * 260 + 90 - camX * 1.25) % span + span) % span - 150);
      g.fillStyle = col;
      [[0, 6, 46, 22], [34, 8, 30, 16], [-30, 10, 24, 14]].forEach(function (e) { g.beginPath(); g.ellipse(bx + e[0], H + e[1], e[2], e[3], 0, 0, 7); g.fill(); });
      [[-14, -12, 9], [6, -14, 10], [26, -6, 8], [42, -2, 6]].forEach(function (c) { g.beginPath(); g.arc(bx + c[0], H + 6 + c[1], c[2], 0, 7); g.fill(); });   // round leafy tops
    }
  }
  function light(g, t, camX) {
    // sun rays from the top right, and pollen drifting in them
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 4; i++) {
      var x = 300 + i * 46, a = 0.035 + 0.015 * Math.sin(t * 0.7 + i);
      g.fillStyle = 'rgba(255,240,200,' + a.toFixed(3) + ')';
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 26, 0); g.lineTo(x - 110, H); g.lineTo(x - 150, H); g.closePath(); g.fill();
    }
    g.restore();
    for (var p = 0; p < 18; p++) {
      var px = (hash(p * 7) * W + t * (6 + p % 5) * 2) % W, py = (hash(p * 13) * 180 + Math.sin(t + p) * 6 + 20);
      rect(g, p % 3 ? 'rgba(255,248,210,0.8)' : '#ffffff', px, py, 1, 1);
    }
    // butterflies over the grass, staying with the ground as it scrolls
    camX = camX || 0;
    [['#ffffff', '#ffd64a'], ['#ffd64a', '#ff9d3a'], ['#ff9ab8', '#ffffff']].forEach(function (c, i) {
      var span = 560, bx = ((i * 197 + 120 - camX) % span + span) % span - 40 + Math.sin(t * 0.7 + i * 2) * 18;
      var by = GY - 14 - Math.abs(Math.sin(t * 1.6 + i)) * 16 - i * 4;
      rect(g, '#2b2350', bx, by, 1, 2);
      if (Math.floor(t * 12 + i * 3) % 2) { rect(g, c[0], bx - 2, by - 1, 2, 2); rect(g, c[0], bx + 1, by - 1, 2, 2); rect(g, c[1], bx - 2, by + 1, 1, 1); rect(g, c[1], bx + 2, by + 1, 1, 1); }
      else { rect(g, c[0], bx - 1, by - 2, 1, 2); rect(g, c[0], bx + 1, by - 2, 1, 2); }
    });
  }
  /** a soft drop shadow under someone's feet */
  function shadow(g, cx, y, w) {
    g.fillStyle = 'rgba(20,40,20,0.28)';
    for (var i = 0; i < 3; i++) { var ww = Math.round(w * (1 - i * 0.22)); g.fillRect(Math.round(cx - ww / 2), y - 1 + i, ww, 1); }
  }

  return { W: W, H: H, GY: GY, background: background, far: far, ground: ground, school: school, fence: fence, bench: bench, lamp: lamp,
    bush: bush, signpost: signpost, pad: pad, gate: gate, ledge: ledge, foreground: foreground, light: light, shadow: shadow,
    tree: function (g, x, base, r) { tree(g, x, base, r, LEAF, TRUNK); }, flower: flower, rainbow: rainbow, bluebird: bluebird, hash: hash, dirt: dirt };
})();
