// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Mobile menu
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

function openMobileMenu() {
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', openMobileMenu);
}
if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        setTimeout(closeMobileMenu, 300);
    });
});

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === mobileMenuOverlay) closeMobileMenu();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOverlay?.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Hero slideshow: rotar 3 imágenes cada 5 segundos
(function () {
    const slides = document.querySelectorAll('.hero .hero-bg');
    const dots = document.getElementById('hero-dots');
    if (!slides.length || !dots) return;

    const dotEls = dots.querySelectorAll('span');
    let current = 0;
    const total = slides.length;
    const intervalMs = 5000;

    function goTo(index) {
        current = (index + total) % total;
        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    let timer = setInterval(() => goTo(current + 1), intervalMs);

    dotEls.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(timer);
            goTo(i);
            timer = setInterval(() => goTo(current + 1), intervalMs);
        });
    });
})();

// Servicios: flip card al hacer click
document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.classList.toggle('flipped');
        }
    });
});

