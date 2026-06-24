/* typewriter.js — IntersectionObserver-triggered skills typewriter animation */

document.addEventListener('DOMContentLoaded', () => {
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const skillItems = skillsSection.querySelectorAll('.skill-list li');
  
  // Store original text and empty list items initially
  skillItems.forEach(item => {
    // Keep a copy of the original text
    item.dataset.originalText = item.textContent.trim();
    item.textContent = '';
  });

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    skillItems.forEach(item => {
      item.textContent = item.dataset.originalText;
    });
    return; // Skip typewriter animations
  }

  const typewriterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Start typing sequence
        typeAllSkills(Array.from(skillItems));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  typewriterObserver.observe(skillsSection);

  function typeAllSkills(items) {
    let itemIndex = 0;

    function typeNextItem() {
      if (itemIndex >= items.length) return;

      const item = items[itemIndex];
      const text = item.dataset.originalText;
      item.classList.add('typing');
      let charIndex = 0;

      function typeChar() {
        if (charIndex < text.length) {
          item.textContent += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, 25); // typing speed
        } else {
          item.classList.remove('typing');
          itemIndex++;
          // Stagger before typing the next skill item
          setTimeout(typeNextItem, 80);
        }
      }

      typeChar();
    }

    typeNextItem();
  }
});
