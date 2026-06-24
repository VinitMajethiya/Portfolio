/* nav.js — Mobile navigation drawer and active state tracker */

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  // Hamburger Drawer Logic
  if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      
      // Prevent body scrolling when mobile menu is open
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
        navLinksContainer.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Nav Tracker using IntersectionObserver (highly performant)
  const navObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px', // triggers when section is in center focus
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          if (href === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));
});
