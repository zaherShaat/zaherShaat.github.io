/**
 * nav.js
 * Handles: mobile menu toggle, close-on-link-click, header scroll shrink
 */

const menuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('header');

// ── Toggle mobile menu ──────────────────────────────────
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// ── Close menu when a nav link is clicked ───────────────
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ── Header scroll shrink effect ─────────────────────────
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Close menu on resize (desktop breakpoint) ───────────
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
});
