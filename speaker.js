/* The speaker under the RANDOM button (index.html and poster.html), after the one in the middle of the
   "Alter Egos" poster. It's drawn once on four canvases (cone, shine, frame, dust cap) and pumps to a
   looped two-bar beat as if it's playing something: the cone and the dust cap push out on every hit
   (the cap more), the shine on the cone brightens, the "?" rides along and the pink ring flares.
   Only transform and opacity move, so the browser's compositor runs it.

   AlterEgoSpeaker.build(core, { rnd, pulse }) puts the speaker inside the round RANDOM core, under its
   "?" (rnd: the element holding the "?" and label; pulse: an element whose opacity flares with the beat).
   It returns { rate(r) }: 1 is 120 BPM, the pages use 1.6 while RANDOM is hovered. */
(() => {
  const D2R = Math.PI / 180;
  // two bars at 120 BPM in 16th steps: [step, strength]. Kicks ~1, snares ~.5, hats ~.12
  const BEAT = { bpm: 120, steps: 32, hits: [[0, 1], [2, .12], [4, .5], [6, .12], [8, .9], [10, .6], [12, .5], [14, .12], [15, .1],
    [16, 1], [18, .12], [20, .5], [22, .55], [24, .9], [26, .12], [28, .55], [29, .45], [30, .7], [31, .35]] };
  const MOVE = { cone: .05, cap: .09, label: .035, shine: .6, pulse: .9, tau: 110 };   // peak sizes and decay (ms)

  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // the drawing, in a 300-unit square centred on 0,0, at twice the core's size for sharpness
  function draw(core, before) {
    const D = core.offsetWidth || 300, N = Math.round(D * 2), k = N / 300, R = rng(12);
    const layer = cls => { const c = document.createElement('canvas'); c.width = c.height = N; c.className = 'spk ' + cls; core.insertBefore(c, before);
      const g = c.getContext('2d'); g.setTransform(k, 0, 0, k, 150 * k, 150 * k); return [c, g]; };
    const disc = (g, r, fill, x = 0, y = 0) => { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    let gr;

    // cone: light at the upper left to black at the lower right, halftone print, ridges, black paint specks
    const [cone, gc] = layer('cone');
    gr = gc.createLinearGradient(-110, -110, 100, 100); gr.addColorStop(0, '#d8d8d8'); gr.addColorStop(.42, '#7e7e7e'); gr.addColorStop(1, '#111');
    disc(gc, 118, gr);
    gc.fillStyle = 'rgba(0,0,0,.5)';
    for (let y = -118; y <= 118; y += 5.5) for (let x = -118; x <= 118; x += 5.5) {
      const d = Math.hypot(x, y); if (d > 117 || d < 50) continue;
      gc.beginPath(); gc.arc(x, y, .3 + 1.9 * (d - 50) / 67, 0, 7); gc.fill();
    }
    gc.strokeStyle = 'rgba(255,255,255,.13)'; gc.lineWidth = 1.2;
    for (const r of [66, 82, 98]) { gc.beginPath(); gc.arc(0, 0, r, 0, 7); gc.stroke(); }
    for (let i = 0; i < 7; i++) { const a = R() * 7, d = 62 + R() * 44; disc(gc, 1.5 + R() * 4.5, '#0a0a09', d * Math.cos(a), d * Math.sin(a)); }

    // shine on the cone (brightens with each hit)
    const [shine, gs] = layer('shine');
    gr = gs.createRadialGradient(-44, -50, 4, -26, -30, 112); gr.addColorStop(0, 'rgba(255,255,255,.8)'); gr.addColorStop(.45, 'rgba(255,255,255,.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    disc(gs, 112, gr);

    // frame (still): black basket, silver flange with four screws, black rubber surround over the cone's edge
    const [frame, gf] = layer('frame');
    gf.fillStyle = '#0b0b0b'; gf.beginPath(); gf.arc(0, 0, 150, 0, 7); gf.moveTo(110, 0); gf.arc(0, 0, 110, 0, 7, true); gf.fill('evenodd');
    gr = gf.createLinearGradient(-140, -140, 140, 140); gr.addColorStop(0, '#e2e2e2'); gr.addColorStop(.5, '#7c7c7c'); gr.addColorStop(1, '#2a2a2a');
    gf.strokeStyle = gr; gf.lineWidth = 11; gf.beginPath(); gf.arc(0, 0, 139, 0, 7); gf.stroke();
    for (const a of [45, 135, 225, 315]) {
      const x = 139 * Math.cos(a * D2R), y = 139 * Math.sin(a * D2R);
      disc(gf, 5.2, '#151515', x, y); disc(gf, 3.4, '#9a9a9a', x - .6, y - .6);
      gf.save(); gf.translate(x, y); gf.rotate(a * D2R); gf.fillStyle = '#1c1c1c'; gf.fillRect(-2.8, -.6, 5.6, 1.2); gf.restore();
    }
    gr = gf.createRadialGradient(0, 0, 110, 0, 0, 131); gr.addColorStop(0, '#060606'); gr.addColorStop(.35, '#3b3b3b'); gr.addColorStop(.62, '#1a1a1a'); gr.addColorStop(1, '#050505');
    gf.strokeStyle = gr; gf.lineWidth = 21; gf.beginPath(); gf.arc(0, 0, 120.5, 0, 7); gf.stroke();
    gf.strokeStyle = 'rgba(255,255,255,.24)'; gf.lineWidth = 3; gf.lineCap = 'round'; gf.beginPath(); gf.arc(0, 0, 117, 200 * D2R, 285 * D2R); gf.stroke();
    for (let i = 0; i < 5; i++) { const a = R() * 7, d = 133 + R() * 12; disc(gf, 1 + R() * 3, '#0a0a09', d * Math.cos(a), d * Math.sin(a)); }

    // dust cap: a black glossy dome, the "?" sits on it
    const [cap, gk] = layer('cap');
    disc(gk, 56, 'rgba(0,0,0,.55)', 2, 3);   // its shadow on the cone
    gr = gk.createRadialGradient(-14, -18, 4, 0, 0, 54); gr.addColorStop(0, '#4a4a4a'); gr.addColorStop(.45, '#161616'); gr.addColorStop(1, '#020202');
    disc(gk, 54, gr);
    gk.fillStyle = 'rgba(255,255,255,.85)'; gk.beginPath(); gk.ellipse(-17, -26, 15, 6.5, -.5, 0, 7); gk.fill();
    gk.fillStyle = 'rgba(255,255,255,.45)'; gk.beginPath(); gk.ellipse(20, 30, 6, 2.5, -.6, 0, 7); gk.fill();
    gk.strokeStyle = 'rgba(255,255,255,.18)'; gk.lineWidth = 1.5; gk.beginPath(); gk.arc(0, 0, 52, 15 * D2R, 85 * D2R); gk.stroke();
    return { cone, shine, frame, cap };
  }

  // keyframes for one moving part: every hit jumps to its strength and dies away; sampled 5 times a 16th
  function keyframes(prop, fmt, amp) {
    const step = 60000 / BEAT.bpm / 4, dur = step * BEAT.steps, n = BEAT.steps * 5, out = [];
    for (let i = 0; i <= n; i++) {
      const t = dur * i / n; let e = 0;
      for (const [s, v] of BEAT.hits) {
        let d = t - s * step; if (d < 0) d += dur;   // the loop's last hits still ring at its start
        e = Math.max(e, v * Math.exp(-d / (v < .3 ? MOVE.tau * .4 : MOVE.tau)));
      }
      out.push({ offset: i / n, [prop]: fmt(Math.min(1, e) * amp) });
    }
    return [out, dur];
  }

  function build(core, opts = {}) {
    const rnd = opts.rnd || null, parts = draw(core, rnd);
    const anims = [];
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) && core.animate) {
      const scale = v => `scale(${(1 + v).toFixed(4)})`, op = v => v.toFixed(3);
      const go = (el, prop, fmt, amp) => { if (!el) return; const [kf, dur] = keyframes(prop, fmt, amp); anims.push(el.animate(kf, { duration: dur, iterations: Infinity })); };
      go(parts.cone, 'transform', scale, MOVE.cone);
      go(parts.cap, 'transform', scale, MOVE.cap);
      go(parts.shine, 'opacity', op, MOVE.shine);
      go(rnd, 'transform', scale, MOVE.label);
      go(opts.pulse, 'opacity', op, MOVE.pulse);
    }
    return { parts, anims, rate(r) { anims.forEach(a => a.updatePlaybackRate ? a.updatePlaybackRate(r) : (a.playbackRate = r)); } };
  }

  window.AlterEgoSpeaker = { build, BEAT, MOVE };
})();
