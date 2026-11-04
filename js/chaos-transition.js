/* chaos-transition.js — CRT power-on / power-off transition */

export function pixelDissolve(direction, onComplete) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  if (direction === 'enter') {
    /* ═══════════════════════════════════════════════
       CRT POWER-ON  — 3-phase sequence
       Phase 1 (0 – 80 ms)  : white flash
       Phase 2 (80 – 320 ms): bright bar sweeps top→bottom
       Phase 3 (320 – 700ms): static noise fades out
    ═══════════════════════════════════════════════ */

    // Phase 1 — full-screen white flash
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    setTimeout(() => {
      // Phase 2 — sweep bright horizontal bar downward
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0, W, H);

      const SWEEP_MS    = 240;
      const BAR_HEIGHT  = 60;
      let   sweepStart  = null;

      function sweepFrame(ts) {
        if (!sweepStart) sweepStart = ts;
        const progress = Math.min((ts - sweepStart) / SWEEP_MS, 1);
        const barY = progress * (H + BAR_HEIGHT) - BAR_HEIGHT;

        // Redraw dark background behind the bar
        ctx.fillStyle = '#020202';
        ctx.fillRect(0, 0, W, barY);

        // Bright phosphor bar
        const barGrad = ctx.createLinearGradient(0, barY, 0, barY + BAR_HEIGHT);
        barGrad.addColorStop(0,    'rgba(255,255,255,0.0)');
        barGrad.addColorStop(0.3,  'rgba(255,255,255,0.9)');
        barGrad.addColorStop(0.5,  'rgba(180,255,200,1.0)');
        barGrad.addColorStop(0.7,  'rgba(255,255,255,0.9)');
        barGrad.addColorStop(1,    'rgba(255,255,255,0.0)');
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, barY, W, BAR_HEIGHT);

        if (progress < 1) {
          requestAnimationFrame(sweepFrame);
        } else {
          // Phase 3 — static noise overlay that fades out
          startStaticPhase();
        }
      }
      requestAnimationFrame(sweepFrame);

      function startStaticPhase() {
        // Show React content behind the canvas (make canvas transparent)
        onComplete && onComplete();

        const STATIC_MS = 380;
        let   staticStart = null;
        const imageData = ctx.createImageData(W, H);
        const data = imageData.data;

        function staticFrame(ts) {
          if (!staticStart) staticStart = ts;
          const progress = Math.min((ts - staticStart) / STATIC_MS, 1);
          const alpha = Math.max(0, 1 - progress);           // fades 1 → 0

          // Fill with random monochrome static
          for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() > 0.5 ? (Math.random() * 80 | 0) : 0;
            data[i]     = v;
            data[i + 1] = v;
            data[i + 2] = v + (Math.random() * 20 | 0);     // slight blue tint
            data[i + 3] = (alpha * 200) | 0;                 // fade out
          }
          ctx.putImageData(imageData, 0, 0);

          if (progress < 1) {
            requestAnimationFrame(staticFrame);
          } else {
            canvas.remove();
          }
        }
        requestAnimationFrame(staticFrame);
      }

    }, 80); // end Phase 1 timeout

  } else {
    /* ═══════════════════════════════════════════════
       CRT POWER-OFF — single collapse:
       Draw dark overlay, call onComplete immediately
       so React unmounts, then collapse screen to
       a horizontal sliver that fades out.
    ═══════════════════════════════════════════════ */

    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, W, H);

    // Unmount React immediately — dark canvas sits on top
    onComplete && onComplete();

    const COLLAPSE_MS = 350;
    let   collapseStart = null;

    function collapseFrame(ts) {
      if (!collapseStart) collapseStart = ts;
      const progress = Math.min((ts - collapseStart) / COLLAPSE_MS, 1);
      // Ease: fast collapse then slow
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, W, H);

      const sliver = Math.max(0, H * (1 - eased));
      const top    = (H - sliver) / 2;

      // Dark background outside sliver
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0,          W, top);
      ctx.fillRect(0, top + sliver, W, H);

      // Bright phosphor sliver
      if (sliver > 0) {
        const sliverGrad = ctx.createLinearGradient(0, top, 0, top + sliver);
        sliverGrad.addColorStop(0,   'rgba(180,255,200,0.0)');
        sliverGrad.addColorStop(0.5, 'rgba(180,255,200,0.9)');
        sliverGrad.addColorStop(1,   'rgba(180,255,200,0.0)');
        ctx.fillStyle = sliverGrad;
        ctx.fillRect(0, top, W, sliver);
      }

      if (progress < 1) {
        requestAnimationFrame(collapseFrame);
      } else {
        // Final flicker then remove
        canvas.style.opacity = '0.6';
        setTimeout(() => { canvas.style.opacity = '0'; }, 60);
        setTimeout(() => canvas.remove(), 180);
      }
    }
    requestAnimationFrame(collapseFrame);
  }
}
