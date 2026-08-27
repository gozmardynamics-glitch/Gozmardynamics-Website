/* ==========================================================================
   Gozmar CMS — Admin dashboard logic (vanilla JS, no build)
   Edits a single data model (CMS.loadState) and persists it to localStorage.
   The front page reads the same model via cms.js, so layout code is untouched.
   ========================================================================== */
(function () {
    'use strict';

    window.CMS_ADMIN = true; // tells cms.js to use the live store (Supabase) when configured

    var state = CMS.loadState();
    var dirty = false;
    var currentPath = 'products.dms';

    /* ---------- tiny DOM helper ---------- */
    function el(tag, attrs, kids) {
        var n = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) {
            if (k === 'class') n.className = attrs[k];
            else if (k === 'html') n.innerHTML = attrs[k];
            else n.setAttribute(k, attrs[k]);
        });
        if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
            if (c == null) return;
            n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return n;
    }
    function icon(cls) { return el('i', { class: 'fas ' + cls }); }
    function badge(t) { return el('span', { class: 'badge' }, t); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ---------- state access ---------- */
    function getPath(p) {
        return p.split('.').reduce(function (o, k) { return (o == null ? o : o[k]); }, state);
    }
    function setPath(p, val) {
        var parts = p.split('.'); var o = state;
        for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
        o[parts[parts.length - 1]] = val;
        touch();
    }
    function touch() { markDirty(); updatePreview(); }

    function markDirty() {
        dirty = true;
        var f = document.getElementById('dirtyFlag');
        if (f) f.hidden = false;
    }

    /* ---------- field builders ---------- */
    function textField(label, path, opts) {
        opts = opts || {};
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var inp = el('input', { type: opts.url ? 'url' : 'text', value: getPath(path) || '' });
        inp.addEventListener('input', function () { setPath(path, inp.value); });
        wrap.appendChild(inp);
        if (opts.hint) wrap.appendChild(el('div', { class: 'hint' }, opts.hint));
        return wrap;
    }
    function textareaField(label, path) {
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var ta = el('textarea', {}); ta.value = getPath(path) || '';
        ta.addEventListener('input', function () { setPath(path, ta.value); });
        wrap.appendChild(ta);
        return wrap;
    }
    function imageField(label, path) {
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var row = el('div', { class: 'image-row' });
        var inp = el('input', { type: 'url', value: getPath(path) || '' });
        var thumb = el('div', { class: 'thumb' }, 'Preview');
        function upd() {
            var v = inp.value.trim();
            thumb.style.backgroundImage = v ? 'url("' + v + '")' : '';
            thumb.textContent = v ? '' : 'Preview';
        }
        inp.addEventListener('input', function () { setPath(path, inp.value); upd(); });
        upd();
        row.appendChild(inp); row.appendChild(thumb); wrap.appendChild(row);
        return wrap;
    }

    /* bound variants (mutate an object in place) */
    function boundText(label, getv, setv, opts) {
        opts = opts || {};
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var inp = el('input', { type: opts.url ? 'url' : 'text', value: getv() || '' });
        inp.addEventListener('input', function () { setv(inp.value); touch(); });
        wrap.appendChild(inp);
        if (opts.hint) wrap.appendChild(el('div', { class: 'hint' }, opts.hint));
        return wrap;
    }
    function boundTextarea(label, getv, setv) {
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var ta = el('textarea', {}); ta.value = getv() || '';
        ta.addEventListener('input', function () { setv(ta.value); touch(); });
        wrap.appendChild(ta);
        return wrap;
    }
    function boundStringList(label, getArr) {
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var editor = el('div', { class: 'list-editor' });
        function rebuild() {
            editor.innerHTML = '';
            var arr = getArr();
            arr.forEach(function (item, idx) {
                var row = el('div', { class: 'list-item' });
                var inp = el('input', { type: 'text', value: item });
                inp.addEventListener('input', function () { arr[idx] = inp.value; touch(); });
                var del = el('button', { class: 'icon-btn', title: 'Remove' }, '✕');
                del.addEventListener('click', function () { arr.splice(idx, 1); touch(); rebuild(); });
                row.appendChild(inp); row.appendChild(del);
                editor.appendChild(row);
            });
            var add = el('button', { class: 'add-btn' }, '+ Add item');
            add.addEventListener('click', function () { arr.push(''); touch(); rebuild(); });
            editor.appendChild(add);
        }
        rebuild();
        wrap.appendChild(editor);
        return wrap;
    }
    function objectListField(label, path, fieldDefs) {
        var arr = getPath(path) || [];
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        var editor = el('div', { class: 'list-editor' });
        function rebuild() {
            editor.innerHTML = '';
            arr.forEach(function (item, idx) {
                var card = el('div', { class: 'tier-card' });
                fieldDefs.forEach(function (fd) {
                    card.appendChild(boundText(fd.label, function () { return item[fd.key]; }, function (v) { item[fd.key] = v; }));
                });
                var del = el('button', { class: 'icon-btn', title: 'Remove' }, '✕');
                del.addEventListener('click', function () { arr.splice(idx, 1); touch(); rebuild(); });
                card.appendChild(del);
                editor.appendChild(card);
            });
            var add = el('button', { class: 'add-btn' }, '+ Add ' + label.replace(/s$/, ''));
            add.addEventListener('click', function () {
                var ni = {}; fieldDefs.forEach(function (fd) { ni[fd.key] = ''; });
                arr.push(ni); touch(); rebuild();
            });
            editor.appendChild(add);
        }
        rebuild();
        wrap.appendChild(editor);
        return wrap;
    }

    /* ---------- pricing editor ---------- */
    function pricingEditor(pricing) {
        var block = el('div', { class: 'section-block' });
        block.appendChild(el('h2', {}, [icon('fa-tags'), 'Pricing', badge('Tiered')]));

        /* Quick price correction */
        var quick = el('div', { class: 'section-block quick-price' });
        quick.appendChild(el('h2', {}, [icon('fa-bolt'), 'Quick price correction']));
        quick.appendChild(el('p', { class: 'hint' }, 'Update any tier’s monthly price instantly. Reflected on the front page after Save.'));
        var tq = el('div', { class: 'two-col' });
        pricing.tiers.forEach(function (t) {
            tq.appendChild(boundText(t.name + ' — Monthly', function () { return t.monthly; }, function (v) { t.monthly = v; }));
        });
        quick.appendChild(tq);
        block.appendChild(quick);

        /* Full tier configuration with volume discounts */
        pricing.tiers.forEach(function (t, i) {
            var card = el('div', { class: 'tier-card' + (i === 1 ? ' featured' : '') });
            card.appendChild(el('h3', {}, [t.name, el('span', { class: 'hint' }, 'Tier ' + (i + 1))] ));
            var grid = el('div', { class: 'two-col' });
            grid.appendChild(boundText('Tier name', function () { return t.name; }, function (v) { t.name = v; }));
            grid.appendChild(boundText('Monthly price', function () { return t.monthly; }, function (v) { t.monthly = v; }));
            grid.appendChild(boundText('Annual price', function () { return t.annual; }, function (v) { t.annual = v; }));
            grid.appendChild(boundText('Volume discount %', function () { return t.volumeDiscount; }, function (v) { t.volumeDiscount = v; }, { hint: 'Bulk/volume discount applied at this level' }));
            grid.appendChild(boundText('Min seats for discount', function () { return t.minSeats; }, function (v) { t.minSeats = v; }));
            grid.appendChild(boundText('CTA label', function () { return t.cta; }, function (v) { t.cta = v; }));
            card.appendChild(grid);
            card.appendChild(boundStringList('Tier features', function () { return t.features; }));
            block.appendChild(card);
        });
        return block;
    }

    /* ---------- renderers ---------- */
    function renderProduct(key) {
        var p = state.products[key];
        var root = document.getElementById('adminRoot');
        root.innerHTML = '';
        root.appendChild(el('h1', { class: 'page-title' }, p.navLabel + ' — Product'));

        var d = el('div', { class: 'section-block' });
        d.appendChild(el('h2', {}, [icon('fa-info-circle'), 'Details & descriptions']));
        d.appendChild(boundText('Tagline', function () { return p.tagline; }, function (v) { p.tagline = v; }));
        d.appendChild(boundText('Title (feature row)', function () { return p.title; }, function (v) { p.title = v; }));
        d.appendChild(boundText('CTA button label', function () { return p.ctaPrimary; }, function (v) { p.ctaPrimary = v; }));
        d.appendChild(boundText('Detail marketing heading', function () { return p.detailTitle; }, function (v) { p.detailTitle = v; }));
        d.appendChild(boundText('Detail section heading', function () { return p.detailHeading; }, function (v) { p.detailHeading = v; }));
        d.appendChild(boundTextarea('Summary (feature row)', function () { return p.summary; }, function (v) { p.summary = v; }));
        d.appendChild(boundTextarea('Detail intro', function () { return p.detailIntro; }, function (v) { p.detailIntro = v; }));
        d.appendChild(boundTextarea('Detail paragraph 1', function () { return p.detailParagraphs[0]; }, function (v) { p.detailParagraphs[0] = v; }));
        d.appendChild(boundTextarea('Detail paragraph 2', function () { return p.detailParagraphs[1]; }, function (v) { p.detailParagraphs[1] = v; }));
        root.appendChild(d);

        var m = el('div', { class: 'section-block' });
        m.appendChild(el('h2', {}, [icon('fa-images'), 'Media']));
        m.appendChild(imageField('Hero image URL', 'products.' + key + '.media.hero'));
        [0, 1, 2].forEach(function (i) {
            m.appendChild(imageField('Gallery image ' + (i + 1) + ' URL', 'products.' + key + '.media.gallery.' + i));
        });
        root.appendChild(m);

        var f = el('div', { class: 'section-block' });
        f.appendChild(el('h2', {}, [icon('fa-list'), 'Features']));
        f.appendChild(boundStringList('Feature list', function () { return p.features; }));
        root.appendChild(f);

        root.appendChild(pricingEditor(p.pricing));
    }

    function renderSiteSection(section) {
        var root = document.getElementById('adminRoot');
        root.innerHTML = '';
        root.appendChild(el('h1', { class: 'page-title' }, 'Site — ' + section));

        if (section === 'hero') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-bullhorn'), 'Hero']));
            b.appendChild(textField('Title (before accent)', 'site.hero.title'));
            b.appendChild(textField('Title accent (gradient)', 'site.hero.titleAccent'));
            b.appendChild(textareaField('Subtitle', 'site.hero.subtitle'));
            b.appendChild(textField('Primary button', 'site.hero.ctaPrimary'));
            b.appendChild(textField('Secondary button', 'site.hero.ctaSecondary'));
            root.appendChild(b);
        } else if (section === 'about') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-building'), 'About']));
            b.appendChild(textField('Heading', 'site.about.heading'));
            b.appendChild(textareaField('Text', 'site.about.text'));
            b.appendChild(imageField('Image URL', 'site.about.image'));
            root.appendChild(b);
        } else if (section === 'stats') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-chart-bar'), 'Stats band']));
            b.appendChild(objectListField('Stats', 'site.stats.items', [{ key: 'number', label: 'Number' }, { key: 'label', label: 'Label' }]));
            root.appendChild(b);
        } else if (section === 'values') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-star'), 'Values']));
            b.appendChild(objectListField('Values', 'site.values.items', [{ key: 'icon', label: 'Icon class (e.g. fa-brain)' }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text' }]));
            root.appendChild(b);
        } else if (section === 'testimonials') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-quote-right'), 'Testimonials']));
            b.appendChild(objectListField('Testimonials', 'site.testimonials.items', [{ key: 'quote', label: 'Quote' }, { key: 'author', label: 'Author' }]));
            root.appendChild(b);
        } else if (section === 'faq') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-question'), 'FAQ']));
            b.appendChild(objectListField('FAQ items', 'site.faq.items', [{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer' }]));
            root.appendChild(b);
        } else if (section === 'contact') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-envelope'), 'Contact']));
            b.appendChild(textField('Email', 'site.contact.email'));
            b.appendChild(textField('Phone', 'site.contact.phone'));
            b.appendChild(textField('Address / note', 'site.contact.address'));
            root.appendChild(b);
        } else if (section === 'footer') {
            var b = el('div', { class: 'section-block' });
            b.appendChild(el('h2', {}, [icon('fa-shoe-prints'), 'Footer']));
            b.appendChild(textField('Brand name', 'site.footer.brand'));
            b.appendChild(textField('Tagline', 'site.footer.tagline'));
            root.appendChild(b);
        }
    }

    function render() {
        var parts = currentPath.split('.');
        if (parts[0] === 'products') renderProduct(parts[1]);
        else renderSiteSection(parts[1]);
        updatePreview();
    }

    /* ---------- preview ---------- */
    function updatePreview() {
        var pv = document.getElementById('preview');
        if (!pv) return;
        var parts = currentPath.split('.');
        var html = '';
        if (parts[0] === 'products') {
            var p = state.products[parts[1]];
            html = '<div class="preview-card"><h3>' + esc(p.tagline) + ' — ' + esc(p.title) + '</h3>' +
                '<ul class="product-features">' + CMS.html.featuresInner(p.features) + '</ul>' +
                '<div class="price-grid">' + CMS.html.priceTiers(p.pricing.tiers) + '</div></div>';
        } else {
            var s = state.site[parts[1]];
            if (parts[1] === 'stats') html = '<div class="preview-card"><div class="stats-grid">' + CMS.html.statsGrid(s.items) + '</div></div>';
            else if (parts[1] === 'values') html = '<div class="preview-card"><div class="values-grid">' + CMS.html.valuesGrid(s.items) + '</div></div>';
            else if (parts[1] === 'testimonials') html = '<div class="preview-card"><div class="testimonial-grid">' + CMS.html.testimonialsGrid(s.items) + '</div></div>';
            else if (parts[1] === 'faq') html = '<div class="preview-card">' + CMS.html.faqGrid(s.items) + '</div>';
            else if (parts[1] === 'contact') html = '<div class="preview-card">' + CMS.html.contactHTML(s) + '</div>';
            else if (parts[1] === 'hero') html = '<div class="preview-card"><h3>' + esc(s.title) + '<em>' + esc(s.titleAccent) + '</em></h3><p>' + esc(s.subtitle) + '</p></div>';
            else if (parts[1] === 'about') html = '<div class="preview-card"><h3>' + esc(s.heading) + '</h3><p>' + esc(s.text) + '</p></div>';
            else if (parts[1] === 'footer') html = '<div class="preview-card"><h4>' + esc(s.brand) + '</h4><p>' + esc(s.tagline) + '</p></div>';
        }
        pv.innerHTML = html;
    }

    /* ---------- tabs ---------- */
    function buildTabs() {
        var nav = document.getElementById('tabs');
        nav.innerHTML = '';
        nav.appendChild(el('div', { class: 'group-label' }, 'Products'));
        Object.keys(state.products).forEach(function (key) {
            var btn = el('button', { class: 'admin-tab' + (currentPath === 'products.' + key ? ' active' : '') }, [
                icon('fa-cube'), state.products[key].navLabel
            ]);
            btn.addEventListener('click', function () { currentPath = 'products.' + key; buildTabs(); render(); });
            nav.appendChild(btn);
        });
        nav.appendChild(el('div', { class: 'group-label' }, 'Site'));
        [
            { k: 'hero', l: 'Hero', i: 'fa-bullhorn' },
            { k: 'about', l: 'About', i: 'fa-building' },
            { k: 'stats', l: 'Stats band', i: 'fa-chart-bar' },
            { k: 'values', l: 'Values', i: 'fa-star' },
            { k: 'testimonials', l: 'Testimonials', i: 'fa-quote-right' },
            { k: 'faq', l: 'FAQ', i: 'fa-question' },
            { k: 'contact', l: 'Contact', i: 'fa-envelope' },
            { k: 'footer', l: 'Footer', i: 'fa-shoe-prints' }
        ].forEach(function (s) {
            var btn = el('button', { class: 'admin-tab' + (currentPath === 'site.' + s.k ? ' active' : '') }, [icon(s.i), s.l]);
            btn.addEventListener('click', function () { currentPath = 'site.' + s.k; buildTabs(); render(); });
            nav.appendChild(btn);
        });
    }

    /* ---------- actions ---------- */
    function toast(msg) {
        var t = el('div', { class: 'toast' }, msg);
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add('show'); });
        setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 1800);
    }

    function save() {
        CMS.saveState(state).then(function (ok) {
            if (ok) {
                dirty = false;
                var f = document.getElementById('dirtyFlag'); if (f) f.hidden = true;
                toast('Changes saved');
            } else {
                toast('Save failed (storage unavailable)');
            }
        });
    }
    function reset() {
        if (!window.confirm('Discard all edits and restore default content?')) return;
        CMS.clearState().then(function () {
            CMS.refreshState().then(function (s) {
                state = s || CMS.loadState();
                buildTabs(); render();
                dirty = false;
                var f = document.getElementById('dirtyFlag'); if (f) f.hidden = true;
                toast('Reset to defaults');
            });
        });
    }
    function exportJSON() {
        var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        var a = el('a', { href: URL.createObjectURL(blob), download: 'gozmar-cms-content.json' });
        document.body.appendChild(a); a.click(); a.remove();
        toast('Exported content.json');
    }
    function importJSON(file) {
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                if (!data.products || !data.site) throw new Error('Invalid file');
                state = data;
                CMS.saveState(state);
                buildTabs(); render();
                markDirty();
                toast('Imported & saved');
            } catch (e) { toast('Import failed: ' + e.message); }
        };
        reader.readAsText(file);
    }

    document.getElementById('btnSave').addEventListener('click', save);
    document.getElementById('btnReset').addEventListener('click', reset);
    document.getElementById('btnExport').addEventListener('click', exportJSON);
    document.getElementById('btnImport').addEventListener('click', function () { document.getElementById('fileImport').click(); });
    document.getElementById('fileImport').addEventListener('change', function (e) {
        if (e.target.files[0]) importJSON(e.target.files[0]);
        e.target.value = '';
    });

    var btnPublish = document.getElementById('btnPublish');
    if (btnPublish) btnPublish.addEventListener('click', function () {
        CMS.publish().then(function (ok) {
            toast(ok ? 'Publish triggered — GitHub will snapshot content to Git.' : 'Publish failed');
        }).catch(function () {
            toast('Publish not configured. Run “Publish CMS content to Git” in GitHub Actions.');
        });
    });

    /* unsaved-changes guard */
    window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

    function showDashboard() {
        var gate = document.getElementById('authGate');
        var layout = document.getElementById('adminLayout');
        var signOut = document.getElementById('btnSignOut');
        if (gate) gate.hidden = true;
        if (layout) layout.hidden = false;
        if (signOut) signOut.hidden = false;

        buildTabs();
        render();
        CMS.refreshState().then(function (s) { if (s) { state = s; render(); } });
    }

    function showLogin() {
        var gate = document.getElementById('authGate');
        var layout = document.getElementById('adminLayout');
        var signOut = document.getElementById('btnSignOut');
        if (gate) gate.hidden = false;
        if (layout) layout.hidden = true;
        if (signOut) signOut.hidden = true;
    }

    var config = window.CMS_CONFIG || {};
    var authRequired = !!(config.authEnabled && config.supabaseUrl && config.anonKey);
    var modeEl = document.getElementById('cmsMode');
    if (modeEl) {
        modeEl.textContent = authRequired ? 'Backend: Supabase' : 'Backend: Local (no backend)';
        modeEl.hidden = false;
    }

    var loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = document.getElementById('loginStatus');
        var email = document.getElementById('loginEmail').value.trim();
        var password = document.getElementById('loginPassword').value;
        if (!email || !password) {
            if (status) status.textContent = 'Enter your email and password.';
            return;
        }
        if (status) status.textContent = 'Signing in…';
        CMS.signIn(email, password).then(function () {
            loginForm.reset();
            if (status) status.textContent = '';
            showDashboard();
        }).catch(function (err) {
            if (status) status.textContent = err.message || 'Sign-in failed.';
        });
    });

    var signOutButton = document.getElementById('btnSignOut');
    if (signOutButton) signOutButton.addEventListener('click', function () {
        CMS.signOut().then(function () {
            dirty = false;
            showLogin();
        });
    });

    /* boot: authenticate before exposing the CMS when Supabase is configured */
    if (authRequired) {
        var session = CMS.getSession();
        if (session && session.access_token && (!session.expires_at || session.expires_at > Date.now())) showDashboard();
        else showLogin();
    } else {
        showDashboard();
    }
})();
