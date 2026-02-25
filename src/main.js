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

// Nuestros trabajos: cargar miniaturas solo cuando la card entra en viewport (ahorra ancho de banda) y clic abre video en lightbox
(function () {
    const lightbox = document.getElementById('trabajos-video-lightbox');
    const video = document.getElementById('trabajos-video-player');
    const backdrop = lightbox?.querySelector('.video-lightbox-backdrop');
    const closeBtn = lightbox?.querySelector('.video-lightbox-close');
    const cards = document.querySelectorAll('.trabajos-video-card');
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

    if (!lightbox || !video) return;

    function videoUrl(filename) {
        return base + '/videos/' + encodeURIComponent(filename);
    }

    // Cargar miniatura solo cuando la card está visible (o cerca) para no cargar 15 vídeos a la vez
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const card = entry.target;
                const filename = card.getAttribute('data-video');
                const thumb = card.querySelector('.trabajos-video-thumb');
                if (filename && thumb && !thumb.src) {
                    thumb.preload = 'metadata';
                    thumb.src = videoUrl(filename);
                }
            });
        },
        { rootMargin: '100px', threshold: 0.01 }
    );
    cards.forEach((card) => observer.observe(card));

    function openVideo(filename) {
        video.preload = 'auto';
        video.src = videoUrl(filename);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        video.play().catch(() => {});
    }

    function closeVideo() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        video.pause();
        video.removeAttribute('src');
    }

    cards.forEach((card) => {
        const filename = card.getAttribute('data-video');
        if (!filename) return;
        card.addEventListener('click', () => openVideo(filename));
    });

    backdrop?.addEventListener('click', closeVideo);
    closeBtn?.addEventListener('click', closeVideo);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeVideo();
    });
})();

