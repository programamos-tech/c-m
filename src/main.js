// Animaciones de entrada al hacer scroll
(function () {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        },
        { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );

    revealEls.forEach((el) => observer.observe(el));
})();

// Hero: rotar imágenes de fondo
(function () {
    const slides = document.querySelectorAll('.hero-bg');
    if (slides.length < 2) return;
    const INTERVAL_MS = 8000;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('hero-bg-active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('hero-bg-active');
    }, INTERVAL_MS);
})();

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

// Lightbox acabados: clic en card abre imagen a pantalla completa
(function () {
    const lightbox = document.getElementById('acabados-lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-img');
    const backdrop = lightbox?.querySelector('.lightbox-backdrop');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const cards = document.querySelectorAll('.acabados-video-card');

    if (!lightbox || !lightboxImg) return;

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    cards.forEach((card) => {
        const img = card.querySelector('.acabados-img');
        if (!img?.src) return;
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(img.src);
        });
    });

    backdrop?.addEventListener('click', closeLightbox);
    closeBtn?.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
})();
