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

// ── Header scroll shrink + active nav section ───────────
const sectionNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');

function updateNavOnScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);

    let currentId = '';
    sectionNavLinks.forEach((link) => {
        const id = link.getAttribute('href').slice(1);
        const section = document.getElementById(id);
        if (section && section.offsetTop - 120 <= window.scrollY) {
            currentId = id;
        }
    });

    sectionNavLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
}

window.addEventListener('scroll', updateNavOnScroll, { passive: true });
updateNavOnScroll();

// ── Close menu on resize (desktop breakpoint) ───────────
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
});
