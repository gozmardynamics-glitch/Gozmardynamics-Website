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

    /* ---------- HTML generators (shared with admin preview) ---------- */
    var html = {
        featuresInner: function (arr) {
            return (arr || []).map(function (f) {
                return '<li><i class="fas fa-check-circle" aria-hidden="true"></i> ' + esc(f) + '</li>';
            }).join('');
        },
        priceTiers: function (tiers) {
            return (tiers || []).map(function (t, i) {
                var featured = i === 1;
                var monthly = t.monthly || '';
                var priceInner = esc(monthly) + (String(monthly).trim().charAt(0) === '$' ? '<span>/mo</span>' : '');
                var feats = (t.features || []).map(function (f) {
                    return '<li><i class="fas fa-check" aria-hidden="true"></i> ' + esc(f) + '</li>';
                }).join('');
                var meta = [];
                if (t.annual && String(t.annual).trim() && t.annual !== monthly) meta.push('Annual: ' + esc(t.annual));
                if (parseFloat(t.volumeDiscount) > 0) meta.push(esc(t.volumeDiscount) + '% volume discount (min ' + esc(t.minSeats || '1') + ' seats)');
                var metaHtml = meta.length ? '<p class="price-meta">' + meta.join(' · ') + '</p>' : '';
                return '' +
                    '<div class="price-tier' + (featured ? ' featured' : '') + '">' +
                        '<h4>' + esc(t.name) + '</h4>' +
                        '<p class="price">' + priceInner + '</p>' +
                        metaHtml +
                        '<ul>' + feats + '</ul>' +
                        '<a href="#contact" class="btn ' + (featured ? 'btn-primary' : 'btn-outline') + '">' + esc(t.cta) + '</a>' +
                    '</div>';
            }).join('');
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
            p.textContent = t;
            cp.appendChild(p);
        });
        if (ul) cp.appendChild(ul);
    }

    function setMedia(key, media) {
        var hero = $('#' + key + '-detail [data-field="' + key + '-hero-image"]');
        if (hero) hero.style.backgroundImage = media && media.hero ? 'url("' + media.hero + '")' : '';
        (media && media.gallery || []).forEach(function (src, i) {
            var g = $('#' + key + '-detail [data-field="' + key + '-gallery-' + (i + 1) + '"]');
            if (g) g.style.backgroundImage = src ? 'url("' + src + '")' : '';
        });
    }

    function renderProduct(key, p) {
        if (!p) return;
        var ft = $('#product-' + key + ' .product-text');
        if (ft) {
            var tag = ft.querySelector('.product-tagline'); if (tag) tag.textContent = p.tagline;
            var h2 = ft.querySelector('h2'); if (h2) h2.textContent = p.title;
            var sum = ft.querySelector('h2 + p'); if (sum) sum.textContent = p.summary;
            var cta = ft.querySelector('a.btn-outline'); if (cta) cta.textContent = p.ctaPrimary;
        }
        var dh = $('#' + key + '-detail .detail-head');
        if (dh) {
            var dtag = dh.querySelector('.product-tagline'); if (dtag) dtag.textContent = p.tagline;
            var dh2 = dh.querySelector('h2'); if (dh2) dh2.textContent = p.detailTitle;
            var di = dh.querySelector('.detail-intro'); if (di) di.textContent = p.detailIntro;
        }
        var dc = $('#' + key + '-detail .detail-copy');
        if (dc) {
            var dch = dc.querySelector('h3'); if (dch) dch.textContent = p.detailHeading;
        }
        setDetailParagraphs(key, p.detailParagraphs);
        setFeatures(key, p.features);
        setMedia(key, p.media);
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

    /* ---------- public API ---------- */
    function applyState(state) {
        if (!state) return;
        if (state.products) Object.keys(state.products).forEach(function (k) { renderProduct(k, state.products[k]); });
        if (state.site) renderSite(state.site);
    }

    /* ---------- remote / baked loaders ---------- */
    function cfg() { return window.CMS_CONFIG || {}; }
    function useSupabase() { var c = cfg(); return !!(c.supabaseUrl && c.anonKey); }
    function sbHeaders() {
        var c = cfg();
        return {
            'apikey': c.anonKey,
            'Authorization': 'Bearer ' + c.anonKey,
            'Content-Type': 'application/json'
        };
    }
    function sbUrl() {
        var c = cfg();
        return c.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + c.table;
    }
    function isValidState(state) {
        return !!(state && state.products && state.site);
    }
    function loadBaked() {
        if (typeof fetch !== 'function') return Promise.resolve(null);
        return fetch('cms-content.json', { cache: 'no-cache' })
            .then(function (r) { if (!r.ok) throw new Error('no baked'); return r.json(); })
            .then(function (data) { return isValidState(data) ? data : null; })
            .catch(function () { return null; });
    }
    function loadFromSupabase() {
        if (typeof fetch !== 'function') return Promise.resolve(null);
        var c = cfg();
        return fetch(sbUrl() + '?select=data&id=eq.' + c.rowId + '&limit=1', { headers: sbHeaders() })
            .then(function (r) { if (!r.ok) throw new Error('sb load ' + r.status); return r.json(); })
            .then(function (rows) {
                var data = rows && rows[0] && rows[0].data;
                return isValidState(data) ? data : null;
            });
    }
    function saveToSupabase(state) {
        if (typeof fetch !== 'function') return Promise.resolve(false);
        var c = cfg();
        var body = { id: c.rowId, data: state, updated_at: new Date().toISOString() };
        return fetch(sbUrl() + '?id=eq.' + c.rowId, {
            method: 'PATCH',
            headers: sbHeaders(),
            body: JSON.stringify({ data: state, updated_at: body.updated_at })
        }).then(function (r) {
            if (r.ok) return true;
            if (r.status === 404) {
                return fetch(sbUrl(), {
                    method: 'POST',
                    headers: sbHeaders(),
                    body: JSON.stringify(body)
                }).then(function (r2) { if (!r2.ok) throw new Error('sb save ' + r2.status); return true; });
            }
            throw new Error('sb save ' + r.status);
        });
    }
    function cacheLocal(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    /* Refreshes content from the live store (Supabase, admin) or the baked Git
       file (public). Falls back silently to current state if unavailable. */
    function refreshState() {
        var admin = !!window.CMS_ADMIN;
        if (admin && useSupabase()) {
            return loadFromSupabase().then(function (data) {
                if (!data) return null;
                applyState(data); cacheLocal(data); return data;
            }).catch(function () { return null; });
        }
        return loadBaked().then(function (b) {
            if (b) { applyState(b); cacheLocal(b); }
            return b;
        });
    }

    function publish() {
        var g = (cfg().github) || {};
        if (!g.enabled || !g.token) return Promise.reject(new Error('disabled'));
        var url = 'https://api.github.com/repos/' + g.owner + '/' + g.repo + '/dispatches';
        return fetch(url, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + g.token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_type: 'publish-cms' })
        }).then(function (r) { return r.ok; });
    }

    /* ---------- load/save (localStorage is the offline fallback) ---------- */
    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (isValidState(parsed)) return parsed;
            }
        } catch (e) { /* ignore */ }
        return deepClone(DEFAULTS);
    }
    function saveState(state) {
        if (window.CMS_ADMIN && useSupabase()) {
            return saveToSupabase(state).then(function (ok) {
                cacheLocal(state); return ok;
            }).catch(function () { cacheLocal(state); return false; });
        }
        cacheLocal(state);
        return Promise.resolve(true);
    }
    function clearState() {
        if (window.CMS_ADMIN && useSupabase()) {
            return saveToSupabase(deepClone(DEFAULTS)).then(function () {
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
        publish: publish
    };

    /* Apply saved content on load (does not alter layout), then refresh from
       the live store / baked Git file when available. */
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
