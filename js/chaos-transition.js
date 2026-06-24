/* chaos-transition.js — Pixel storm transition handler */

export function pixelDissolve(direction, onComplete) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const PIXEL_SIZE = 8;
  const cols = Math.ceil(canvas.width / PIXEL_SIZE);
  const rows = Math.ceil(canvas.height / PIXEL_SIZE);
  const totalPixels = cols * rows;
  const pixels = Array.from({ length: totalPixels }, (_, i) => i);

  // Fisher-Yates shuffle for random order
  for (let i = pixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
  }

  let index = 0;
  const PIXELS_PER_FRAME = Math.ceil(totalPixels / 25); // Complete in ~25 frames (~400ms)

  if (direction === 'enter') {
    // ENTER TRANSITION: Dissolve into dark chaos background
    function drawEnterFrame() {
      ctx.fillStyle = '#FF6B35'; // --neon-orange
      for (let i = 0; i < PIXELS_PER_FRAME && index < totalPixels; i++, index++) {
        const pixelIdx = pixels[index];
        const x = (pixelIdx % cols) * PIXEL_SIZE;
        const y = Math.floor(pixelIdx / cols) * PIXEL_SIZE;
        ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      }

      if (index < totalPixels) {
        requestAnimationFrame(drawEnterFrame);
      } else {
        // Coalesce into full solid dark background
        ctx.fillStyle = '#0A0A0F'; // --chaos-bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        setTimeout(() => {
          canvas.remove();
          if (onComplete) onComplete();
        }, 100);
      }
    }
    requestAnimationFrame(drawEnterFrame);

  } else {
    // EXIT TRANSITION: Dissolve out back to main portfolio
    // Start with solid dark background
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Call unmount immediately so React disappears behind the black canvas
    if (onComplete) {
      onComplete();
    }

    function drawExitFrame() {
      // Clear pixels to transparent, revealing the portfolio underneath
      for (let i = 0; i < PIXELS_PER_FRAME && index < totalPixels; i++, index++) {
        const pixelIdx = pixels[index];
        const x = (pixelIdx % cols) * PIXEL_SIZE;
        const y = Math.floor(pixelIdx / cols) * PIXEL_SIZE;
        ctx.clearRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
      }

      if (index < totalPixels) {
        requestAnimationFrame(drawExitFrame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(drawExitFrame);
  }
}
