/* nav.js — Mobile navigation drawer with backdrop and active state tracker */

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  // Backdrop Overlay Injection for smooth mobile closing
  let navBackdrop = document.querySelector('.nav-backdrop');
  if (!navBackdrop) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    document.body.appendChild(navBackdrop);
  }

  const closeMobileNav = () => {
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('active');
    }
    if (navLinksContainer) {
      navLinksContainer.classList.remove('active');
    }
    if (navBackdrop) {
      navBackdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
  };

  // Hamburger Drawer Logic
  if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      navBackdrop.classList.toggle('active', !isExpanded);
      
      // Prevent background scrolling when mobile menu is open
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close menu when clicking on the darkened backdrop
    navBackdrop.addEventListener('click', closeMobileNav);

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksContainer.classList.contains('active')) {
        closeMobileNav();
      }
    });
  }

  // Active Nav Tracker using IntersectionObserver
  const navObserverOptions = {
    root: null,
    rootMargin: '-25% 0px -55% 0px',
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
