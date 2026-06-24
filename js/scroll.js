/* scroll.js — IntersectionObserver for reveal effects */

document.addEventListener('DOMContentLoaded', () => {
  // Standard Scroll Reveal Observer
  const revealOptions = {
    root: null, // viewport
    threshold: 0.15, // trigger when 15% visible
    rootMargin: '0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // If it's a section header, also animate its border line
        const header = entry.target.querySelector('.section-header');
        if (header) {
          header.classList.add('visible');
        }
        
        // Unobserve after showing to avoid firing animations repeatedly
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  // Select all reveal elements
  const revealElements = document.querySelectorAll('[data-reveal]');
  revealElements.forEach(el => revealObserver.observe(el));

  // Add scroll class to Nav Wrapper
  const navWrapper = document.querySelector('.nav-wrapper');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navWrapper.classList.add('scrolled');
    } else {
      navWrapper.classList.remove('scrolled');
    }
  }, { passive: true });
});
