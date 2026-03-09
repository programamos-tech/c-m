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

// Servicios carrusel: tablet = scroll nativo + auto-scroll; móvil = transform + auto-scroll + arrastre (como acabados)
(function () {
    const wrap = document.querySelector('.services-carousel-wrap');
    const track = wrap?.querySelector('.carousel-track');
    if (!wrap || !track) return;

    const QUERY_TABLET = '(min-width: 769px) and (max-width: 1024px)';
    const QUERY_MOBILE = '(max-width: 768px)';
    const PAUSE_AFTER_INTERACTION_MS = 2500;
    const LOOP_DURATION_S = 45;
    const TAP_ZONE_RATIO = 0.35;
    const TAP_STEP_RATIO = 0.75;

    let rafId = null;
    let userInteracting = false;
    let resumeTimeout = null;
    let didDrag = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartOffset = 0;
    let tappedToScroll = false;
    let offsetPx = 0;

    function isMobile() {
        return window.matchMedia(QUERY_MOBILE).matches;
    }
    function isTablet() {
        return window.matchMedia(QUERY_TABLET).matches;
    }

    function getSegmentWidthScroll() {
        const w = wrap.scrollWidth;
        return w > wrap.clientWidth ? w / 3 : wrap.clientWidth;
    }
    function getSegmentWidthMobile() {
        const w = track.offsetWidth || track.scrollWidth;
        return w > 0 ? w / 3 : wrap.clientWidth;
    }
    function getSegmentWidth() {
        return isMobile() ? getSegmentWidthMobile() : getSegmentWidthScroll();
    }
    function getTapStep() {
        return Math.round(wrap.clientWidth * TAP_STEP_RATIO);
    }

    function applyTransform() {
        track.style.transform = 'translateX(-' + offsetPx + 'px)';
    }

    function tick() {
        if (userInteracting) return;
        if (isMobile()) {
            const segment = getSegmentWidthMobile();
            offsetPx += segment / (LOOP_DURATION_S * 60);
            if (offsetPx >= segment) offsetPx -= segment;
            if (offsetPx < 0) offsetPx += segment;
            applyTransform();
        } else if (isTablet()) {
            const segment = getSegmentWidthScroll();
            wrap.scrollLeft += segment / (LOOP_DURATION_S * 60);
            if (wrap.scrollLeft >= segment) wrap.scrollLeft -= segment;
        } else {
            return;
        }
        rafId = requestAnimationFrame(tick);
    }

    function startAutoScroll() {
        if (rafId != null) return;
        if (isMobile()) {
            const segment = getSegmentWidthMobile();
            if (segment <= 0) return;
            offsetPx = offsetPx % segment;
            if (offsetPx < 0) offsetPx += segment;
            applyTransform();
        } else if (isTablet()) {
            const segment = getSegmentWidthScroll();
            if (segment > 0) wrap.scrollLeft = wrap.scrollLeft % segment;
        } else {
            return;
        }
        rafId = requestAnimationFrame(tick);
    }

    function stopAutoScroll() {
        if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function onInteractionStart() {
        if (!isMobile() && !isTablet()) return;
        userInteracting = true;
        stopAutoScroll();
        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
            resumeTimeout = null;
        }
    }

    function onInteractionEnd() {
        if (!isMobile() && !isTablet()) return;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            userInteracting = false;
            startAutoScroll();
            resumeTimeout = null;
        }, PAUSE_AFTER_INTERACTION_MS);
    }

    function handleTap(clientX) {
        if (!isTablet() && !isMobile()) return false;
        const rect = wrap.getBoundingClientRect();
        const x = clientX - rect.left;
        const w = rect.width;
        const step = getTapStep();

        if (isMobile()) {
            const segment = getSegmentWidthMobile();
            if (x < w * TAP_ZONE_RATIO) {
                offsetPx = Math.max(0, offsetPx - step);
                if (offsetPx < 0) offsetPx += segment;
                applyTransform();
                return true;
            }
            if (x > w * (1 - TAP_ZONE_RATIO)) {
                offsetPx = offsetPx + step;
                if (offsetPx >= segment) offsetPx -= segment;
                applyTransform();
                return true;
            }
            return false;
        }

        const maxScroll = wrap.scrollWidth - wrap.clientWidth;
        if (maxScroll <= 0) return false;
        if (x < w * TAP_ZONE_RATIO) {
            wrap.scrollTo({ left: Math.max(0, wrap.scrollLeft - step), behavior: 'smooth' });
            return true;
        }
        if (x > w * (1 - TAP_ZONE_RATIO)) {
            wrap.scrollTo({ left: Math.min(maxScroll, wrap.scrollLeft + step), behavior: 'smooth' });
            return true;
        }
        return false;
    }

    wrap.addEventListener('touchstart', (e) => {
        onInteractionStart();
        didDrag = false;
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            if (isMobile()) touchStartOffset = offsetPx;
        }
    }, { passive: true });

    wrap.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 8 || dy > 8) didDrag = true;
        if (isMobile() && dx > dy && dx > 8) {
            e.preventDefault();
            const segment = getSegmentWidthMobile();
            const deltaX = touchStartX - e.touches[0].clientX;
            offsetPx = touchStartOffset + deltaX;
            while (offsetPx >= segment) offsetPx -= segment;
            while (offsetPx < 0) offsetPx += segment;
            applyTransform();
        }
    }, { passive: false });

    wrap.addEventListener('touchend', (e) => {
        tappedToScroll = false;
        if (!didDrag && e.changedTouches && e.changedTouches[0]) {
            tappedToScroll = handleTap(e.changedTouches[0].clientX);
        }
        onInteractionEnd();
    }, { passive: true });

    wrap.addEventListener('touchcancel', onInteractionEnd, { passive: true });
    wrap.addEventListener('wheel', onInteractionStart, { passive: true });

    wrap.addEventListener('mousedown', (e) => {
        didDrag = false;
        onInteractionStart();
        if (isMobile()) {
            touchStartX = e.clientX;
            touchStartOffset = offsetPx;
        }
    });
    wrap.addEventListener('mouseup', (e) => {
        tappedToScroll = false;
        if (!didDrag) tappedToScroll = handleTap(e.clientX);
        onInteractionEnd();
    });
    wrap.addEventListener('mouseleave', onInteractionEnd);
    wrap.addEventListener('mousemove', (e) => {
        if (e.buttons !== 1) return;
        didDrag = true;
        if (isMobile()) {
            const segment = getSegmentWidthMobile();
            const deltaX = touchStartX - e.clientX;
            offsetPx = touchStartOffset + deltaX;
            while (offsetPx >= segment) offsetPx -= segment;
            while (offsetPx < 0) offsetPx += segment;
            applyTransform();
        }
    });

    wrap.addEventListener('click', (e) => {
        if (tappedToScroll) {
            e.preventDefault();
            e.stopPropagation();
            tappedToScroll = false;
        }
    }, true);

    const mqTablet = window.matchMedia(QUERY_TABLET);
    const mqMobile = window.matchMedia(QUERY_MOBILE);
    function onScrollModeChange() {
        if (isMobile()) {
            track.style.transform = '';
            startAutoScroll();
        } else if (isTablet()) {
            track.style.transform = '';
            startAutoScroll();
        } else {
            stopAutoScroll();
            track.style.transform = '';
        }
    }
    mqTablet.addEventListener('change', onScrollModeChange);
    mqMobile.addEventListener('change', onScrollModeChange);
    if (mqTablet.matches || mqMobile.matches) {
        requestAnimationFrame(() => requestAnimationFrame(startAutoScroll));
    }
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

// Acabados carrusel: en tablet y móvil, animación con transform (sin scroll) + tap y arrastre
(function () {
    const wrap = document.querySelector('.acabados-carousel-wrap');
    const track = wrap?.querySelector('.acabados-track');
    if (!wrap || !track) return;

    const QUERY = '(max-width: 1024px)';
    const ZONE_RATIO = 0.35;
    const STEP_RATIO = 0.7;
    const PAUSE_AFTER_INTERACTION_MS = 2500;
    const LOOP_DURATION_S = 100;

    let tapHandled = false;
    let rafId = null;
    let userInteracting = false;
    let resumeTimeout = null;
    let offsetPx = 0;
    let touchStartX = 0;
    let touchStartOffset = 0;
    let didDrag = false;

    function getSegmentWidth() {
        const w = track.offsetWidth || track.scrollWidth;
        return w > 0 ? w / 3 : 4000;
    }

    function applyTransform() {
        track.style.transform = 'translateX(-' + offsetPx + 'px)';
    }

    function tick() {
        if (userInteracting || !window.matchMedia(QUERY).matches) return;
        const segment = getSegmentWidth();
        offsetPx += segment / (LOOP_DURATION_S * 60);
        if (offsetPx >= segment) offsetPx -= segment;
        if (offsetPx < 0) offsetPx += segment;
        applyTransform();
        rafId = requestAnimationFrame(tick);
    }

    function startAutoScroll() {
        if (rafId != null) return;
        const segment = getSegmentWidth();
        offsetPx = offsetPx % segment;
        if (offsetPx < 0) offsetPx += segment;
        applyTransform();
        rafId = requestAnimationFrame(tick);
    }

    function stopAutoScroll() {
        if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function onInteractionStart() {
        if (!window.matchMedia(QUERY).matches) return;
        userInteracting = true;
        stopAutoScroll();
        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
            resumeTimeout = null;
        }
    }

    function onInteractionEnd() {
        if (!window.matchMedia(QUERY).matches) return;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            userInteracting = false;
            startAutoScroll();
            resumeTimeout = null;
        }, PAUSE_AFTER_INTERACTION_MS);
    }

    function getScrollStep() {
        return wrap.clientWidth * STEP_RATIO;
    }

    function handleTap(clientX) {
        if (!window.matchMedia(QUERY).matches) return false;
        const rect = wrap.getBoundingClientRect();
        const x = clientX - rect.left;
        const w = rect.width;
        const step = getScrollStep();
        const segment = getSegmentWidth();
        if (x < w * ZONE_RATIO) {
            offsetPx = Math.max(0, offsetPx - step);
            if (offsetPx < 0) offsetPx += segment;
            applyTransform();
            return true;
        }
        if (x > w * (1 - ZONE_RATIO)) {
            offsetPx = offsetPx + step;
            if (offsetPx >= segment) offsetPx -= segment;
            applyTransform();
            return true;
        }
        return false;
    }

    let touchStartY = 0;
    wrap.addEventListener('touchstart', (e) => {
        tapHandled = false;
        didDrag = false;
        onInteractionStart();
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartOffset = offsetPx;
        }
    }, { passive: true });

    wrap.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > dy && dx > 8) {
            didDrag = true;
            e.preventDefault();
            const segment = getSegmentWidth();
            const deltaX = touchStartX - e.touches[0].clientX;
            offsetPx = touchStartOffset + deltaX;
            while (offsetPx >= segment) offsetPx -= segment;
            while (offsetPx < 0) offsetPx += segment;
            applyTransform();
        }
    }, { passive: false });

    wrap.addEventListener('touchend', (e) => {
        if (!didDrag && e.changedTouches && e.changedTouches[0]) {
            tapHandled = handleTap(e.changedTouches[0].clientX);
        }
        onInteractionEnd();
    }, { passive: true });

    wrap.addEventListener('touchcancel', onInteractionEnd, { passive: true });
    wrap.addEventListener('wheel', onInteractionStart, { passive: true });
    wrap.addEventListener('mousedown', (e) => {
        onInteractionStart();
        touchStartX = e.clientX;
        touchStartOffset = offsetPx;
    });
    wrap.addEventListener('mousemove', (e) => {
        if (e.buttons !== 1) return;
        const segment = getSegmentWidth();
        const dx = touchStartX - e.clientX;
        offsetPx = touchStartOffset + dx;
        while (offsetPx >= segment) offsetPx -= segment;
        while (offsetPx < 0) offsetPx += segment;
        applyTransform();
    });
    wrap.addEventListener('mouseup', onInteractionEnd);
    wrap.addEventListener('mouseleave', onInteractionEnd);

    wrap.addEventListener('click', (e) => {
        if (!window.matchMedia(QUERY).matches) return;
        if (tapHandled) {
            e.preventDefault();
            e.stopPropagation();
            tapHandled = false;
            return;
        }
        const handled = handleTap(e.clientX);
        if (handled) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    const mq = window.matchMedia(QUERY);
    mq.addEventListener('change', (e) => {
        if (e.matches) startAutoScroll();
        else {
            stopAutoScroll();
            track.style.transform = '';
        }
    });

    const observer = new IntersectionObserver(
        (entries) => {
            if (!entries[0]?.isIntersecting || !mq.matches) return;
            startAutoScroll();
        },
        { rootMargin: '80px 0', threshold: 0.01 }
    );
    observer.observe(wrap);

    if (mq.matches) startAutoScroll();
})();

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
