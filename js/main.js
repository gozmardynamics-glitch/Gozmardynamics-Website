/* ==========================================================================
   Gozmar Dynamics — Landing Page
   Nav, scrollspy, reveal, modals, forms, back-to-top
   ========================================================================== */

(function () {
    'use strict';

    // Defensive: some environments (older browsers, non-browser test runners) lack matchMedia
    function safeMatch(q) {
        try { return window.matchMedia ? window.matchMedia(q).matches : false; }
        catch (e) { return false; }
    }

    var prefersReducedMotion = safeMatch('(prefers-reduced-motion: reduce)');

    /* ---------- Dark Mode Toggle ---------- */
    var darkModeToggle = document.getElementById('darkModeToggle');
    var moonIcon = darkModeToggle ? darkModeToggle.querySelector('.fa-moon') : null;
    var sunIcon = darkModeToggle ? darkModeToggle.querySelector('.fa-sun') : null;

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            if (moonIcon) moonIcon.classList.add('d-none');
            if (sunIcon) sunIcon.classList.remove('d-none');
        } else {
            if (moonIcon) moonIcon.classList.remove('d-none');
            if (sunIcon) sunIcon.classList.add('d-none');
        }
    }

    function toggleDarkMode() {
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }

    if (darkModeToggle) {
        var savedTheme = localStorage.getItem('theme') || (safeMatch('(prefers-color-scheme: dark)') ? 'dark' : 'light');
        setTheme(savedTheme);
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    /* ---------- Navbar scroll effect ---------- */
    var navbar = document.getElementById('navbar');

    function onScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateBackToTop();
        updateScrollspy();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Mobile nav toggle ---------- */
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    function closeMobileNav() {
        navLinks.classList.remove('active');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    function openMobileNav() {
        navLinks.classList.add('active');
        navToggle.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    navToggle.addEventListener('click', function () {
        if (navLinks.classList.contains('active')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMobileNav);
    });

    // Close mobile nav on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileNav();
        }
    });

    /* ---------- Scrollspy (active nav link) ---------- */
    var sections = document.querySelectorAll('section[id], article[id]');
    var navLinkEls = document.querySelectorAll('.nav-links a:not(.nav-cta)');

    function updateScrollspy() {
        var currentId = '';
        var offset = window.scrollY + window.innerHeight * 0.35;

        sections.forEach(function (section) {
            if (section.offsetTop <= offset) {
                currentId = section.id;
            }
        });

        navLinkEls.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    }

    /* ---------- Back to top ---------- */
    var backToTop = document.getElementById('backToTop');

    function updateBackToTop() {
        backToTop.classList.toggle('show', window.scrollY > 500);
    }

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    onScroll();

    /* ---------- Scroll reveal (Intersection Observer) ---------- */
    var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach(function (el) { el.classList.add('visible'); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- Stat count-up (numbers rise as the band scrolls in) ---------- */
    function animateCount(el) {
        var original = el.textContent;
        var m = original.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)([\s\S]*)$/);
        if (!m) return;
        if (prefersReducedMotion || typeof window.requestAnimationFrame !== 'function') return;

        var target = parseFloat(m[2]);
        var decimals = (m[2].split('.')[1] || '').length;
        var duration = 1400;
        var start = null;

        function frame(ts) {
            if (start === null) start = ts;
            var t = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            el.textContent = m[1] + (target * eased).toFixed(decimals) + m[3];
            if (t < 1) {
                window.requestAnimationFrame(frame);
            } else {
                el.textContent = original; // exact final string, always
            }
        }
        window.requestAnimationFrame(frame);
    }

    var statNumbers = document.querySelectorAll('.stat-number');
    if (!prefersReducedMotion && 'IntersectionObserver' in window && statNumbers.length) {
        var statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        statNumbers.forEach(function (el) { statObserver.observe(el); });
    }

    /* ---------- Modals ---------- */
    var modals = document.querySelectorAll('.modal');
    var lastFocused = null;

    function openModal(modal) {
        lastFocused = document.activeElement;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        var closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }

    // Keep keyboard focus inside an open modal (focus trap)
    function trapFocus(e) {
        var openModalEl = document.querySelector('.modal.active');
        if (!openModalEl || e.key !== 'Tab') return;

        var focusable = openModalEl.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    document.querySelectorAll('.modal-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            var modal = document.getElementById(trigger.getAttribute('data-modal'));
            if (modal) openModal(modal);
        });
    });

    modals.forEach(function (modal) {
        var closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { closeModal(modal); });

        // Close when clicking the backdrop
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var activeModal = document.querySelector('.modal.active');
            if (activeModal) closeModal(activeModal);
        }
        trapFocus(e);
    });

    /* ---------- Forms (inline validation, no alert) ---------- */
    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function setStatus(statusEl, message, type) {
        statusEl.textContent = message;
        statusEl.className = 'form-status ' + type;
    }

    // Contact form
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        var contactStatus = document.getElementById('formStatus');

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var message = document.getElementById('message').value.trim();

            if (!name) {
                setStatus(contactStatus, 'Please enter your name.', 'error');
                return;
            }
            if (!validateEmail(email)) {
                setStatus(contactStatus, 'Please enter a valid email address.', 'error');
                return;
            }
            if (!message) {
                setStatus(contactStatus, 'Please enter a message.', 'error');
                return;
            }

            // TODO: wire to a real backend (Formspree / Resend / Supabase, etc.)
            setStatus(contactStatus, 'Thank you for your message! We’ll get back to you shortly.', 'success');
            contactForm.reset();
        });
    }

    // Newsletter form
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        var newsletterStatus = document.getElementById('newsletterStatus');

        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = document.getElementById('newsletterEmail').value.trim();

            if (!validateEmail(email)) {
                setStatus(newsletterStatus, 'Please enter a valid email.', 'error');
                return;
            }

            // TODO: wire to a real backend
            setStatus(newsletterStatus, 'Subscribed! Thanks for signing up.', 'success');
            newsletterForm.reset();
        });
    }

    /* ---------- Admin-ready content hook (placeholder) ----------
       A future admin/CMS populates window.GOZMAR_PRODUCTS with live
       data (copy, image URLs, pricing tiers). Elements marked with
       data-field are updated when data is present. No effect until then.
       Example:
       window.GOZMAR_PRODUCTS = {
         dms: {
           heroImage: "https://.../dms.png",
           tiers: [
             { name: "Starter", price: "$9<span>/mo</span>" },
             { name: "Pro",     price: "$29<span>/mo</span>" },
             { name: "Enterprise", price: "Custom" }
           ]
         }
       };
    */
    function hydrateProducts(data) {
        if (!data) return;
        Object.keys(data).forEach(function (key) {
            var p = data[key];
            var root = document.querySelector('[data-product="' + key + '"]');
            if (!root || !p) return;

            if (p.heroImage) {
                var hero = root.querySelector('[data-field="' + key + '-hero-image"]');
                if (hero) {
                    hero.style.backgroundImage = 'url("' + p.heroImage + '")';
                    var label = hero.querySelector('span');
                    if (label) label.textContent = '';
                }
            }

            if (Array.isArray(p.tiers)) {
                var tiers = root.querySelectorAll('.price-tier');
                p.tiers.forEach(function (t, i) {
                    if (!tiers[i]) return;
                    if (t.name && tiers[i].querySelector('h4')) {
                        tiers[i].querySelector('h4').textContent = t.name;
                    }
                    if (t.price != null && tiers[i].querySelector('.price')) {
                        tiers[i].querySelector('.price').innerHTML = t.price;
                    }
                });
            }
        });
    }

    if (window.GOZMAR_PRODUCTS) {
        hydrateProducts(window.GOZMAR_PRODUCTS);
    }
})();
