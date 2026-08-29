/* ==========================================================================
   Gozmar Dynamics — CMS front-end binder
   Applies the data model (GOZMAR_DEFAULTS + saved overrides) to index.html
   using existing DOM selectors. No front-page layout/markup is altered; only
   content is updated. Regenerated reveal elements include `visible` so they
   stay visible after innerHTML replacement.
   ========================================================================== */
(function () {
    'use strict';

    var STORAGE_KEY = 'gozmar_cms_v1';
    var AUTH_STORAGE_KEY = 'gozmar_cms_auth_v1';
    var DEFAULTS = window.GOZMAR_DEFAULTS || {};

    /* ---------- helpers ---------- */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function deepClone(o) {
        return JSON.parse(JSON.stringify(o));
    }

    /* ---------- markup: **bold** inside descriptions ---------- */
    function boldify(text) {
        return String(text == null ? '' : text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }
    function escFormatted(text) {
        return boldify(esc(String(text == null ? '' : text)));
    }

    /* ---------- HTML generators (shared with admin preview) ---------- */
    var html = {
        featuresInner: function (arr) {
            return (arr || []).map(function (f) {
                return '<li><i class="fas fa-check-circle" aria-hidden="true"></i> ' + esc(f) + '</li>';
            }).join('');
        },
        priceTiers: function (tiers) {
            return (tiers || []).map(function (t, i) {
                var featured = !!(t.featured === true);
                var monthly = t.monthly || '';
                var oldPrice = t.oldPrice || '';
                var priceInner = (oldPrice ? '<s class="price-old">' + esc(oldPrice) + '</s> ' : '') +
                    esc(monthly) + (String(monthly).trim().charAt(0) === '$' ? '<span>/mo</span>' : '');
                var feats = (t.features || []).map(function (f) {
                    return '<li><i class="fas fa-check" aria-hidden="true"></i> ' + esc(f) + '</li>';
                }).join('');
                var meta = [];
                if (t.annual && String(t.annual).trim() && t.annual !== monthly) meta.push('Annual: ' + esc(t.annual));
                if (parseFloat(t.volumeDiscount) > 0) meta.push(esc(t.volumeDiscount) + '% volume discount (min ' + esc(t.minSeats || '1') + ' seats)');
                var metaHtml = meta.length ? '<p class="price-meta">' + meta.join(' · ') + '</p>' : '';
                var ctaLink = t.ctaLink || '#contact';
                return '' +
                    '<div class="price-tier' + (featured ? ' featured' : '') + '">' +
                        (featured ? '<span class="featured-pill">Most popular</span>' : '') +
                        '<h4>' + esc(t.name) + '</h4>' +
                        '<p class="price">' + priceInner + '</p>' +
                        metaHtml +
                        '<ul>' + feats + '</ul>' +
                        '<a href="' + esc(ctaLink) + '" class="btn ' + (featured ? 'btn-primary' : 'btn-outline') + '">' + esc(t.cta) + '</a>' +
                    '</div>';
            }).join('');
        },
        capabilitiesGrid: function (items, count, productName) {
            var shown = (items || []).slice(0, Math.max(0, count == null ? items.length : count));
            return shown.map(function (it) {
                return '<div class="cap-card reveal">' +
                    '<div class="cap-top"><i class="fas ' + esc(it.icon) + '" aria-hidden="true"></i>' +
                    '<span class="cap-product">' + esc(productName) + '</span></div>' +
                    '<h4>' + esc(it.title) + '</h4>' +
                    '<p>' + esc(it.text) + '</p></div>';
            }).join('');
        },
        bannerHTML: function (b) {
            if (!b || !b.visible || !b.text) return '';
            return '<span class="banner banner-' + esc(b.preset || 'blue') + '"><i class="fas fa-tag" aria-hidden="true"></i> ' + esc(b.text) + '</span>';
        },
        statsGrid: function (items) {
            return (items || []).map(function (it) {
                return '<div class="stat reveal visible"><span class="stat-number">' + esc(it.number) +
                    '</span><span class="stat-label">' + esc(it.label) + '</span></div>';
            }).join('');
        },
        valuesGrid: function (items) {
            return (items || []).map(function (it) {
                return '<div class="value-card reveal visible">' +
                    '<i class="fas ' + esc(it.icon) + '" aria-hidden="true"></i>' +
                    '<h3>' + esc(it.title) + '</h3>' +
                    '<p>' + esc(it.text) + '</p></div>';
            }).join('');
        },
        testimonialsGrid: function (items) {
            return (items || []).map(function (it) {
                return '<blockquote class="testimonial-card reveal visible">' +
                    '<p>"' + esc(it.quote) + '"</p>' +
                    '<cite class="testimonial-author">' + esc(it.author) + '</cite></blockquote>';
            }).join('');
        },
        faqGrid: function (items) {
            return (items || []).map(function (it) {
                return '<details class="faq-item"><summary>' + esc(it.q) + '</summary><p>' + esc(it.a) + '</p></details>';
            }).join('');
        },
        contactHTML: function (c) {
            return '' +
                '<p><i class="fas fa-envelope" aria-hidden="true"></i> ' + esc(c.email) + '</p>' +
                '<p><i class="fas fa-phone" aria-hidden="true"></i> ' + esc(c.phone) + '</p>' +
                '<p><i class="fas fa-globe" aria-hidden="true"></i> ' + esc(c.address) + '</p>';
        }
    };

    /* ---------- per-product render ---------- */
    function setFeatures(key, arr) {
        var inner = html.featuresInner(arr);
        var a = $('#product-' + key + ' .product-features');
        var b = $('#' + key + '-detail .detail-copy ul.product-features');
        if (a) a.innerHTML = inner;
        if (b) b.innerHTML = inner;
    }

    function setDetailParagraphs(key, paras) {
        var cp = $('#' + key + '-detail .detail-copy');
        if (!cp) return;
        var h3 = cp.querySelector('h3');
        var ul = cp.querySelector('ul.product-features');
        cp.innerHTML = '';
        if (h3) cp.appendChild(h3);
        (paras || []).forEach(function (t) {
            var p = document.createElement('p');
            p.innerHTML = escFormatted(t);   // **bold** supported
            cp.appendChild(p);
        });
        if (ul) cp.appendChild(ul);
    }

    function setMedia(key, media) {
        var hero = $('#' + key + '-detail [data-field="' + key + '-hero-image"]');
        if (hero) {
            var p = (window.CMS && CMS.loadState && CMS.loadState().products[key]) || { media: media };
            var src = getFeaturedSrc(p);
            if (hero.tagName === 'IMG') {
                if (src) hero.src = src;
            } else {
                hero.style.backgroundImage = src ? 'url("' + src + '")' : '';
            }
        }
        // also update product-grid hero image if template not used
        var cardImg = $('#product-' + key + ' .product-image img');
        if (cardImg) {
            var pp = (window.CMS && CMS.loadState && CMS.loadState().products[key]) || { media: media };
            var f = getFeaturedSrc(pp);
            if (f) cardImg.src = f;
        }
    }

    /* ---------- capabilities (feature cards) ---------- */
    function renderCapabilities(key, p) {
        var fallbackW = document.getElementById('productsStaticFallback');
        var hosts = $all('#' + key + '-detail [data-field="' + key + '-capabilities"]').filter(function (h) {
            return !(fallbackW && fallbackW.contains(h));
        });
        if (!hosts.length) return;
        var cfg = p.featureCards || {};
        var items = cfg.items || [];
        var inner = items.length ? html.capabilitiesGrid(items, cfg.count, p.navLabel) : '';
        hosts.forEach(function (host) {
            var block = host.closest('.capabilities');
            host.innerHTML = inner;
            if (block) block.style.display = inner ? '' : 'none';
        });
    }

    /* ---------- banner slots ---------- */
    function setBanner(slotSelector, b) {
        var fallbackW = document.getElementById('productsStaticFallback');
        var slots = $all(slotSelector).filter(function (s) {
            return !(fallbackW && fallbackW.contains(s));
        });
        if (!slots.length) return;
        var html2 = html.bannerHTML(b);
        slots.forEach(function (slot) {
            slot.innerHTML = html2;
            slot.style.display = html2 ? '' : 'none';
        });
    }

    function renderBanners(key, b) {
        setBanner('#' + key + '-detail [data-field="' + key + '-product-banner"]', b.product);
        setBanner('#' + key + '-detail [data-field="' + key + '-gallery-banner"]', b.gallery);
        setBanner('#' + key + '-detail [data-field="' + key + '-pricing-banner"]', b.pricing);
    }

    /* ---------- gallery slider engine ----------
       One instance per product; supports arrows, dots, swipe, keyboard,
       autoplay (admin-togglable). All animation CSS-driven. */
    function sliderMarkup(key, navLabel, urls) {
        var slides = urls.map(function (u, i) {
            return '<figure class="slider-slide' + (i === 0 ? ' is-active' : '') + '">' +
                '<img src="' + esc(u) + '" alt="' + esc(navLabel) + ' — screenshot ' + (i + 1) + '" loading="lazy"></figure>';
        }).join('');
        var dots = urls.map(function (u, i) {
            return '<button class="slider-dot' + (i === 0 ? ' is-active' : '') + '" type="button" role="tab" aria-label="Image ' + (i + 1) + ' of ' + urls.length + '"></button>';
        }).join('');
        var controls = urls.length > 1 ?
            '<button class="slider-arrow slider-prev" type="button" aria-label="Previous image"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>' +
            '<button class="slider-arrow slider-next" type="button" aria-label="Next image"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>' +
            '<div class="slider-dots" role="tablist" aria-label="Choose image">' + dots + '</div>' : '';
        return '<div class="slider-track" data-track>' + slides + '</div>' + controls;
    }

    var _sliders = {};

    function destroySlider(key) {
        var inst = _sliders[key];
        if (inst) {
            if (inst.timer) clearInterval(inst.timer);
            delete _sliders[key];
        }
    }

    function bindSlider(key, host, autoplay, reducedMotion) {
        var track = host.querySelector('[data-track]');
        var slides = host.querySelectorAll('.slider-slide');
        if (!track || !slides.length) return;
        var dots = host.querySelectorAll('.slider-dot');
        var prev = host.querySelector('.slider-prev');
        var next = host.querySelector('.slider-next');
        var index = 0;
        var timer = null;
        var INTERVAL = 5000;

        function goTo(i, fromAutoplay) {
            index = (i + slides.length) % slides.length;
            for (var n = 0; n < slides.length; n++) {
                slides[n].classList.toggle('is-active', n === index);
                if (dots[n]) dots[n].classList.toggle('is-active', n === index);
                if (dots[n]) dots[n].setAttribute('aria-selected', n === index ? 'true' : 'false');
            }
            dots.forEach(function (d) { d.setAttribute('aria-selected', d.classList.contains('is-active') ? 'true' : 'false'); });
            if (fromAutoplay) restart();
        }

        function restart() {
            if (timer) clearInterval(timer);
            if (autoplay && !reducedMotion) timer = setInterval(function () { goTo(index + 1, true); }, INTERVAL);
        }

        if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
        if (next) next.addEventListener('click', function () { goTo(index + 1); });
        dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });

        /* swipe (mobile) + pause on hover/focus */
        var touchX = null;
        host.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
        host.addEventListener('touchend', function (e) {
            if (touchX === null) return;
            var dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 48) goTo(index + (dx < 0 ? 1 : -1));
            touchX = null;
        }, { passive: true });
        host.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
        host.addEventListener('mouseleave', restart);
        host.addEventListener('focusout', restart);

        /* keyboard */
        host.setAttribute('tabindex', '0');
        host.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { goTo(index - 1); restart(); }
            if (e.key === 'ArrowRight') { goTo(index + 1); restart(); }
        });

        restart();
        _sliders[key] = { timer: null };
        _sliders[key].goTo = goTo;
    }

    function renderSlider(key, p) {
        /* The mount (single-template) path and the static fallback can BOTH
           exist in the DOM; only the visible one should be wired. We query
           all matching hosts, exclude hosts inside the (hidden) static
           fallback, and hide every gallery whose host is absent. */
        var fallbackW = document.getElementById('productsStaticFallback');
        var hosts = $all('#' + key + '-detail [data-field="' + key + '-gallery"]').filter(function (h) {
            return !(fallbackW && fallbackW.contains(h));
        });
        if (!hosts.length) {
            $all('#' + key + '-detail .gallery').forEach(function (g) { g.style.display = 'none'; });
            return;
        }
        var urls = getGalleryUrls(p);
        if (!urls.length) {
            $all('#' + key + '-detail .gallery').forEach(function (g) { g.style.display = 'none'; });
            return;
        }
        /* build only into the LAST visible host (the active mount) */
        var host = hosts[hosts.length - 1];
        var galleryBlock = host.closest('.gallery');
        $all('#' + key + '-detail .gallery').forEach(function (g) {
            g.style.display = (g === galleryBlock) ? '' : 'none';
        });
        destroySlider(key);
        host.classList.add('slider');
        host.setAttribute('role', 'region');
        host.setAttribute('aria-label', p.navLabel + ' gallery');
        host.innerHTML = sliderMarkup(key, p.navLabel, urls);
        var autoplay = (p.media && p.media.slider) ? p.media.slider.autoplay !== false : true;
        var reduced = false;
        try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        bindSlider(key, host, autoplay, reduced);
    }

    function renderProduct(key, p) {
        if (!p) return;
        var ft = $('#product-' + key + ' .product-text');
        if (ft) {
            var tag = ft.querySelector('.product-tagline'); if (tag) tag.textContent = p.tagline;
            var h2 = ft.querySelector('h2'); if (h2) h2.textContent = p.title;
            var sum = ft.querySelector('h2 + p'); if (sum) sum.innerHTML = escFormatted(p.summary);
            var cta = ft.querySelector('a.btn-outline'); if (cta) cta.textContent = p.ctaPrimary;
        }
        var dh = $('#' + key + '-detail .detail-head');
        if (dh) {
            var dtag = dh.querySelector('.product-tagline'); if (dtag) dtag.textContent = p.tagline;
            var dh2 = dh.querySelector('h2'); if (dh2) dh2.textContent = p.detailTitle;
            var di = dh.querySelector('.detail-intro'); if (di) di.innerHTML = escFormatted(p.detailIntro);
        }
        var dc = $('#' + key + '-detail .detail-copy');
        if (dc) {
            var dch = dc.querySelector('h3'); if (dch) dch.innerHTML = escFormatted(p.detailHeading);
        }
        setDetailParagraphs(key, p.detailParagraphs);
        setFeatures(key, p.features);
        setMedia(key, p.media);
        renderCapabilities(key, p);
        renderSlider(key, p);
        if (p.banners) renderBanners(key, p.banners);
        var pg = $('#' + key + '-detail .pricing .price-grid');
        if (pg && p.pricing) pg.innerHTML = html.priceTiers(p.pricing.tiers);
    }

    /* ---------- site-wide render ---------- */
    function renderSite(s) {
        if (!s) return;
        if (s.hero) {
            var h1 = $('#home h1'); if (h1) h1.innerHTML = esc(s.hero.title) + '<em>' + esc(s.hero.titleAccent) + '</em>';
            var sub = $('#home .hero-content p'); if (sub) sub.textContent = s.hero.subtitle;
            var b1 = $('#home .hero-buttons a.btn-primary'); if (b1) b1.textContent = s.hero.ctaPrimary;
            var b2 = $('#home .hero-buttons a.btn-outline'); if (b2) b2.textContent = s.hero.ctaSecondary;
        }
        if (s.about) {
            var ah = $('#about .about-text h2'); if (ah) ah.textContent = s.about.heading;
            var at = $('#about .about-text > p'); if (at) at.textContent = s.about.text;
            if (s.about.image) {
                var ai = $('#about .about-image img'); if (ai) ai.src = s.about.image;
            }
        }
        if (s.stats) { var sg = $('#stats .stats-grid'); if (sg) sg.innerHTML = html.statsGrid(s.stats.items); }
        if (s.values) { var vg = $('#values .values-grid'); if (vg) vg.innerHTML = html.valuesGrid(s.values.items); }
        if (s.testimonials) { var tg = $('#testimonials .testimonial-grid'); if (tg) tg.innerHTML = html.testimonialsGrid(s.testimonials.items); }
        if (s.faq) { var fg = $('#faq .faq-grid'); if (fg) fg.innerHTML = html.faqGrid(s.faq.items); }
        if (s.contact) { var ci = $('#contact .contact-info'); if (ci) ci.innerHTML = html.contactHTML(s.contact); }
        if (s.footer) {
            var fb = $('.footer-brand h4'); if (fb) fb.textContent = s.footer.brand;
            var fp = $('.footer-brand p'); if (fp) fp.textContent = s.footer.tagline;
        }
    }

    /* ---------- single reusable product template (ONE source of truth) ---------- */
    function productTemplateHTML(key, p, index) {
        var featuredSrc = getFeaturedSrc(p);
        var galleryUrls = getGalleryUrls(p);
        var altFeatured = (p.media && p.media.images && p.media.images[p.media.featuredIndex || 0] && p.media.images[p.media.featuredIndex || 0].alt) || p.title || '';
        var commerce = commerceHTML(p);
        var taxonomy = taxonomyHTML(p);
        var specs = specsHTML(p);
        var priceNote = commerce ? '' : '<p class="pricing-note">Managed via admin</p>';
        var badgeTop = (p.commerce && p.commerce.badge) ? '<span class="card-badge">' + esc(p.commerce.badge) + '</span>' : '';
        var stock = (p.commerce && p.commerce.stockStatus === 'out_of_stock') ? '<span class="stock-overlay">Out of Stock</span>' : '';
        var isReverse = index % 2 === 1 ? ' reverse' : '';
        // Gallery: if images exist show slider host, else hide the whole section
        var galleryBlock = galleryUrls.length ? '<div class="slider-host" data-field="' + esc(key) + '-gallery"></div>' : '';
        var specsBlock = specs || '';
        var taxonomyBlock = taxonomy || '';
        // Banners (optional)
        var banners = p.banners || {};
        var capItems = (p.featureCards && p.featureCards.items) || p.features || [];
        // Use same structure as original, but generated from one template
        return '' +
        '<article class="product-section section" id="product-' + esc(key) + '" data-product-key="' + esc(key) + '">' +
          '<div class="container product-grid' + isReverse + '">' +
            '<div class="product-text reveal-left">' +
              '<p class="product-tagline">' + esc(p.tagline || '') + '</p>' +
              '<h2>' + esc(p.title || '') + '</h2>' +
              taxonomyBlock +
              commerce +
              '<p>' + escFormatted(p.shortDescription || p.summary || '') + '</p>' +
              '<ul class="product-features">' + html.featuresInner(p.features || []) + '</ul>' +
              specsBlock +
              '<a href="#' + esc(key) + '-detail" class="btn btn-outline">' + esc(p.ctaPrimary || 'Learn more') + '</a>' +
            '</div>' +
            '<div class="product-image reveal-right">' +
              badgeTop + stock +
              (featuredSrc ? '<img src="' + esc(featuredSrc) + '" alt="' + esc(altFeatured) + '" loading="lazy">' : '<div class="media-placeholder" role="img" aria-label="No featured image"><i class="fas fa-image"></i><span>No image</span></div>') +
            '</div>' +
          '</div>' +
          '<div class="product-detail" id="' + esc(key) + '-detail" data-product="' + esc(key) + '" data-bannerslot="true">' +
            '<div class="container">' +
              '<span class="banner-slot banner-slot-product" data-field="' + esc(key) + '-product-banner"></span>' +
              '<div class="detail-head reveal">' +
                '<p class="product-tagline">' + esc(p.tagline || '') + '</p>' +
                '<h2>' + esc(p.detailTitle || p.title || '') + '</h2>' +
                '<p class="detail-intro">' + escFormatted(p.detailIntro || '') + '</p>' +
                taxonomyBlock +
                commerce +
                '<div class="hero-buttons" style="justify-content:center;"><a href="#contact" class="btn btn-primary">Start free trial</a><a href="#contact" class="btn btn-outline">Talk to sales</a></div>' +
              '</div>' +
              '<div class="detail-grid">' +
                '<div class="detail-copy reveal-left">' +
                  '<h3>' + escFormatted(p.detailHeading || '') + '</h3>' +
                  (p.detailParagraphs || []).map(function(t){ return '<p>' + escFormatted(t) + '</p>'; }).join('') +
                  '<ul class="product-features">' + html.featuresInner(p.features || []) + '</ul>' +
                  specsBlock +
                '</div>' +
                '<div class="detail-media reveal-right">' +
                  (featuredSrc ? '<img src="' + esc(featuredSrc) + '" alt="' + esc(altFeatured) + '" loading="lazy" style="width:100%;border-radius:12px;">' : '<div class="media-placeholder" data-field="' + esc(key) + '-hero-image" role="img" aria-label="No image"><i class="fas fa-image"></i><span>No image</span></div>') +
                '</div>' +
              '</div>' +
              '<div class="capabilities reveal"><h3>Capabilities</h3><div class="cap-grid" data-field="' + esc(key) + '-capabilities"></div></div>' +
              '<div class="gallery reveal"><h3>A closer look</h3>' + galleryBlock + '<span class="banner-slot" data-field="' + esc(key) + '-gallery-banner"></span></div>' +
              '<div class="pricing reveal" data-field="' + esc(key) + '-pricing"><span class="banner-slot" data-field="' + esc(key) + '-pricing-banner"></span><h3>Pricing</h3><div class="price-grid">' + html.priceTiers((p.pricing && p.pricing.tiers) || []) + '</div><p class="pricing-note">Managed via admin</p></div>' +
            '</div>' +
          '</div>' +
        '</article>';
    }

    function renderAllProductsDynamic(state) {
        var mount = document.getElementById('productsMount');
        // If dynamic mount exists, use template engine
        if (mount) {
            try {
                var keys = Object.keys(state.products || {});
                var visible = keys.filter(function(k){ var st=(state.products[k].status||'active'); return st !== 'archived'; });
                if (!visible.length) {
                    mount.innerHTML = '<div class="container"><p class="hint">No products yet. Create one in <a href="admin.html">admin</a>.</p></div>';
                    var fbEmpty = document.getElementById('productsStaticFallback');
                    if (fbEmpty) { fbEmpty.hidden = true; fbEmpty.style.display = 'none'; }
                    return true;
                }
                var htmlAll = visible.map(function(k, i){ return productTemplateHTML(k, state.products[k], i); }).join('');
                mount.innerHTML = htmlAll;
                // second pass: inject dynamic subsystems that need DOM (slider, capabilities, banners)
                visible.forEach(function(k){
                    try { var p = state.products[k]; renderCapabilities(k, p); renderSlider(k, p); if (p.banners) renderBanners(k, p.banners); } catch (e) { /* keep rendering */ }
                });
                // Update product nav grid (backend-driven)
                var navGrid = document.getElementById('productNavGrid');
                if (navGrid) {
                    try {
                        navGrid.innerHTML = visible.map(function(k){
                            var p = state.products[k];
                            return '<a href="#' + esc(k) + '-detail" class="product-nav-item reveal">' + esc(p.navLabel || p.title || k) + '</a>';
                        }).join('');
                    } catch (e) {}
                }
                // Hide static fallback only after successful dynamic render
                var fallback = document.getElementById('productsStaticFallback');
                if (fallback) { fallback.hidden = true; fallback.style.display = 'none'; }
                // Update stats count if element exists
                var statNum = document.querySelector('#stats .stat-number');
                if (statNum) statNum.textContent = String(visible.length);
                return true;
            } catch (e) {
                // Fallback to static markup on error — keep fallback visible
                try { console.error('Dynamic products render failed, keeping static fallback', e); } catch (ee) {}
                var fb = document.getElementById('productsStaticFallback');
                if (fb) { fb.hidden = false; fb.style.display = ''; }
                if (mount) mount.innerHTML = '';
                return false;
            }
        }
        // fallback: patch existing 6 hardcoded articles (backward compat)
        if (state.products) Object.keys(state.products).forEach(function (k) { renderProduct(k, state.products[k]); });
        return false;
    }

    /* ---------- public API ---------- */
    function applyState(state) {
        if (!state) return;
        // Try dynamic single-template render first; fallback to legacy per-product patch
        var usedDynamic = false;
        if (state.products) usedDynamic = renderAllProductsDynamic(state);
        if (!usedDynamic && state.products) Object.keys(state.products).forEach(function (k) { renderProduct(k, state.products[k]); });
        if (state.site) renderSite(state.site);
    }

    /* ---------- PocketBase helpers ---------- */
    function cfg() { return window.CMS_CONFIG || {}; }
    function usePocketBase() { var c = cfg(); return !!(c.pocketbaseUrl); }
    function getSession() {
        try { return localStorage.getItem(AUTH_STORAGE_KEY) || ''; }
        catch (e) { return ''; }
    }
    function pbHeaders() {
        var token = getSession();
        var h = { 'Content-Type': 'application/json' };
        if (token) h['Authorization'] = token;
        return h;
    }
    function pbUrl(collection) {
        var c = cfg();
        return c.pocketbaseUrl.replace(/\/$/, '') + '/api/collections/' + (collection || c.collection) + '/records';
    }
    function isValidState(state) {
        return !!(state && state.products && state.site);
    }

    /* ---------- load from PocketBase ---------- */
    function loadFromPocketBase() {
        if (typeof fetch !== 'function') return Promise.resolve(null);
        return fetch(pbUrl() + '?limit=1')
            .then(function (r) { if (!r.ok) throw new Error('pb load ' + r.status); return r.json(); })
            .then(function (data) {
                if (data.items && data.items.length > 0) {
                    var record = data.items[0];
                    var content = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                    content = normalizeState(content);
                    return isValidState(content) ? content : null;
                }
                return null;
            });
    }

    /* ---------- save to PocketBase ---------- */
    function saveToPocketBase(state) {
        if (typeof fetch !== 'function') return Promise.resolve(false);
        var body = JSON.stringify({ data: state });
        return fetch(pbUrl() + '?limit=1')
            .then(function (r) { if (!r.ok) throw new Error('pb check ' + r.status); return r.json(); })
            .then(function (data) {
                if (data.items && data.items.length > 0) {
                    var recordId = data.items[0].id;
                    return fetch(pbUrl() + '/' + recordId, {
                        method: 'PATCH',
                        headers: pbHeaders(),
                        body: body
                    });
                } else {
                    return fetch(pbUrl(), {
                        method: 'POST',
                        headers: pbHeaders(),
                        body: body
                    });
                }
            })
            .then(function (r) {
                if (!r.ok) throw new Error('pb save ' + r.status);
                return true;
            });
    }

    /* ---------- auth (PocketBase) ---------- */
    function signIn(email, password) {
        if (!usePocketBase() || typeof fetch !== 'function') return Promise.reject(new Error('PocketBase is not configured.'));
        var c = cfg();
        var url = c.pocketbaseUrl.replace(/\/$/, '') + '/api/collections/' + c.authCollection + '/auth-with-password';
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password: password })
        }).then(function (r) {
            return r.json().then(function (data) {
                if (!r.ok || !data.token) throw new Error(data.message || 'Sign-in failed.');
                localStorage.setItem(AUTH_STORAGE_KEY, data.token);
                return data;
            });
        });
    }
    function signOut() {
        try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (e) {}
        return Promise.resolve(true);
    }

    /* ---------- localStorage fallback ---------- */
    function cacheLocal(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    /* Refreshes content from PocketBase (admin) or localStorage (public). */
    function refreshState() {
        var admin = !!window.CMS_ADMIN;
        if (admin && usePocketBase()) {
            return loadFromPocketBase().then(function (data) {
                if (!data) return null;
                applyState(data); cacheLocal(data); return data;
            }).catch(function () { return null; });
        }
        return Promise.resolve(null);
    }

    /* ---------- gallery helpers (featured + fallback) ---------- */
    function getFeaturedSrc(p) {
        var media = p && p.media;
        if (!media) return '';
        if (Array.isArray(media.images) && media.images.length) {
            var idx = typeof media.featuredIndex === 'number' ? media.featuredIndex : -1;
            if (idx >= 0 && idx < media.images.length && media.images[idx] && media.images[idx].src) return media.images[idx].src;
            for (var i = 0; i < media.images.length; i++) if (media.images[i].featured && media.images[i].src) return media.images[i].src;
            return media.images[0].src || '';
        }
        if (media.hero) return media.hero;
        var g = media.gallery || [];
        for (var j = 0; j < g.length; j++) if (g[j]) return g[j];
        return '';
    }
    function getGalleryUrls(p) {
        var media = p && p.media;
        if (!media) return [];
        if (Array.isArray(media.images) && media.images.length) {
            return media.images.map(function (im) { return im.src; }).filter(function (u) { return u && String(u).trim(); });
        }
        var out = [];
        if (media.hero) out.push(media.hero);
        (media.gallery || []).forEach(function (u) { if (u) out.push(u); });
        return out.filter(function (u) { return u && String(u).trim(); });
    }
    function taxonomyHTML(p) {
        var tax = p.taxonomy || {};
        var bits = [];
        if (tax.category) bits.push('<span class="meta-chip"><i class="fas fa-tag"></i> ' + esc(tax.category) + '</span>');
        (tax.tags || []).forEach(function (tg) { if (tg) bits.push('<span class="meta-chip meta-tag">' + esc(tg) + '</span>'); });
        if (p.commerce && p.commerce.badge) bits.push('<span class="badge badge-accent">' + esc(p.commerce.badge) + '</span>');
        if (p.commerce && p.commerce.stockStatus) {
            var stock = p.commerce.stockStatus;
            var label = stock === 'in_stock' ? 'In Stock' : stock === 'low_stock' ? 'Low Stock' : stock === 'out_of_stock' ? 'Out of Stock' : esc(stock);
            var cls = stock === 'in_stock' ? 'stock-in' : stock === 'low_stock' ? 'stock-low' : 'stock-out';
            bits.push('<span class="stock-chip ' + cls + '">' + label + '</span>');
        }
        return bits.length ? '<div class="product-meta">' + bits.join(' ') + '</div>' : '';
    }
    function specsHTML(p) {
        var specs = p.specifications || [];
        if (!specs.length) return '';
        var rows = specs.map(function (s) {
            if (!s.label && !s.value) return '';
            return '<tr><th>' + esc(s.label || '') + '</th><td>' + esc(s.value || '') + '</td></tr>';
        }).join('');
        if (!rows.trim()) return '';
        return '<div class="specs-block"><h4>Specifications</h4><table class="specs-table"><tbody>' + rows + '</tbody></table></div>';
    }
    function commerceHTML(p) {
        var c = p.commerce || {};
        if (!c.price && !c.compareAtPrice && !c.badge) return '';
        var price = c.price ? '<span class="commerce-price">' + esc(c.price) + '</span>' : '';
        var comp = c.compareAtPrice ? '<s class="commerce-compare">' + esc(c.compareAtPrice) + '</s>' : '';
        var badge = c.badge ? '<span class="badge badge-sale">' + esc(c.badge) + '</span>' : '';
        return '<div class="commerce-block">' + badge + price + ' ' + comp + '</div>';
    }

    /* ---------- state hydration (migrate old saved states) ---------- */
    function normalizeProduct(p, defaults) {
        if (!p || typeof p !== 'object') return p;
        var d = (arguments.length > 1) ? defaults : null;
        if (!p.featureCards) p.featureCards = d ? deepClone(d.featureCards) : { count: 7, items: [] };
        if (!p.banners) p.banners = d ? deepClone(d.banners) : { product: { text: '', preset: 'blue', visible: false }, gallery: { text: '', preset: 'amber', visible: false }, pricing: { text: '', preset: 'coral', visible: false } };
        if (p.media) {
            if (!p.media.slider) p.media.slider = { autoplay: true };
            if (!Array.isArray(p.media.gallery)) p.media.gallery = [];
            if (!Array.isArray(p.media.images)) {
                var imgs = [];
                if (p.media.hero) imgs.push({ src: p.media.hero, alt: (p.title || 'Product') + ' hero', featured: true });
                (p.media.gallery || []).forEach(function (u, i) { if (u) imgs.push({ src: u, alt: (p.title || 'Product') + ' gallery ' + (i+1), featured: false }); });
                p.media.images = imgs;
                p.media.featuredIndex = imgs.length ? 0 : -1;
            }
            if (typeof p.media.featuredIndex !== 'number') {
                var fi = -1;
                for (var ii = 0; ii < (p.media.images || []).length; ii++) if (p.media.images[ii].featured) { fi = ii; break; }
                p.media.featuredIndex = fi !== -1 ? fi : (p.media.images.length ? 0 : -1);
            }
        } else {
            p.media = { hero:'', gallery:[], slider:{autoplay:true}, images:[], featuredIndex:-1 };
        }
        if (!p.commerce) p.commerce = d && d.commerce ? deepClone(d.commerce) : { price:'', compareAtPrice:'', badge:'', stockStatus:'in_stock' };
        if (!p.taxonomy) p.taxonomy = d && d.taxonomy ? deepClone(d.taxonomy) : { category:'General', tags:[] };
        if (!Array.isArray(p.taxonomy.tags)) p.taxonomy.tags = [];
        if (!Array.isArray(p.specifications)) p.specifications = [];
        if (!p.status) p.status = 'active';
        if (!p.shortDescription) p.shortDescription = p.summary || '';
        if (p.pricing && Array.isArray(p.pricing.tiers)) {
            p.pricing.tiers.forEach(function (t) {
                if (t.oldPrice == null) t.oldPrice = '';
                if (!t.ctaLink) t.ctaLink = '#contact';
                if (t.featured == null) t.featured = false;
            });
        }
        return p;
    }
    function normalizeState(state) {
        if (!state || !state.products) return state;
        var defaults = DEFAULTS.products || {};
        Object.keys(state.products).forEach(function (k) {
            // ensure defaults fallback uses any product defaults (e.g., dms) if specific missing
            var def = defaults[k] || defaults[Object.keys(defaults)[0]];
            state.products[k] = normalizeProduct(state.products[k], def);
        });
        return state;
    }

    /* ---------- load/save (localStorage is the offline fallback) ---------- */
    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = normalizeState(JSON.parse(raw));
                if (isValidState(parsed)) return parsed;
            }
        } catch (e) { /* ignore */ }
        return deepClone(DEFAULTS);
    }
    function saveState(state) {
        if (window.CMS_ADMIN && usePocketBase()) {
            return saveToPocketBase(state).then(function (ok) {
                cacheLocal(state); return ok;
            }).catch(function () { cacheLocal(state); return false; });
        }
        cacheLocal(state);
        return Promise.resolve(true);
    }
    function clearState() {
        if (window.CMS_ADMIN && usePocketBase()) {
            return saveToPocketBase(deepClone(DEFAULTS)).then(function () {
                try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
                return true;
            }).catch(function () { return false; });
        }
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        return Promise.resolve(true);
    }

    window.CMS = {
        defaults: DEFAULTS,
        html: html,
        applyState: applyState,
        loadState: loadState,
        saveState: saveState,
        clearState: clearState,
        refreshState: refreshState,
        getSession: getSession,
        signIn: signIn,
        signOut: signOut
    };

    /* Apply saved content on load (does not alter layout), then refresh from
       PocketBase when available. */
    function boot() { applyState(loadState()); refreshState(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /* Live-update this page if the admin dashboard saves while it is open. */
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) applyState(loadState());
    });
})();
