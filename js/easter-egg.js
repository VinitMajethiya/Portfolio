/* easter-egg.js — Konami Code sequence listener and overlay */

document.addEventListener('DOMContentLoaded', () => {
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
  ];
  let konamiIndex = 0;
  let previouslyFocusedElement = null;

  const easterEggOverlay = document.getElementById('easterEgg');
  const easterEggText = document.getElementById('easterEggText');
  const closeButton = document.getElementById('easterEggClose');

  if (!easterEggOverlay || !easterEggText || !closeButton) return;

  const message = `> accessing hidden file...
> ...
> this is the part nobody sees.
> i made this site at 2am with coffee and a guitar riff stuck in my head.
> if you found this — you're the kind of person i want to work with.`;

  window.addEventListener('keydown', (e) => {
    // Normalise lowercase values for 'b' and 'a'
    const key = e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'a' ? e.key.toLowerCase() : e.key;

    if (key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        triggerEasterEgg();
        konamiIndex = 0;
      }
    } else {
      // Allow restarting from the first key if match failed
      if (key === konamiCode[0]) {
        konamiIndex = 1;
      } else {
        konamiIndex = 0;
      }
    }
  });

  function triggerEasterEgg() {
    previouslyFocusedElement = document.activeElement;
    
    // Display the overlay
    easterEggOverlay.removeAttribute('hidden');
    easterEggOverlay.style.display = 'flex';
    easterEggText.textContent = '';
    
    // Disable body scrolling
    document.body.style.overflow = 'hidden';

    // Type out terminal message letter-by-letter
    let charIndex = 0;

    function typeTerminalText() {
      if (charIndex < message.length) {
        easterEggText.textContent = message.slice(0, charIndex + 1);
        // Append visual cursor
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'cursor';
        easterEggText.appendChild(cursorSpan);
        
        charIndex++;
        setTimeout(typeTerminalText, 35);
      } else {
        // Complete typing: append cursor and focus button
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'cursor';
        easterEggText.appendChild(cursorSpan);
        closeButton.focus();
      }
    }

    typeTerminalText();
    closeButton.focus();
  }

  function closeEasterEgg() {
    easterEggOverlay.setAttribute('hidden', '');
    easterEggOverlay.style.display = 'none';
    document.body.style.overflow = '';
    
    // Return focus
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }

  closeButton.addEventListener('click', closeEasterEgg);

  // Close when pressing Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && easterEggOverlay.style.display === 'flex') {
      closeEasterEgg();
    }
  });

  // Focus trap inside the dialog overlay
  easterEggOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Trap focus on closeButton (the only active element)
      closeButton.focus();
    }
  });
});
