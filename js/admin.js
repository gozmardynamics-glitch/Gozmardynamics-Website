/* ==========================================================================
   Gozmar CMS — Admin dashboard logic (vanilla JS, no build)
   Edits a single data model (CMS.loadState) and persists it to localStorage.
   The front page reads the same model via cms.js, so layout code is untouched.
   ========================================================================== */
(function () {
    'use strict';

    window.CMS_ADMIN = true; // tells cms.js to use the live store (PocketBase) when configured

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
        var wrap = el('div', { class: 'field media-hub' });
        wrap.appendChild(el('label', {}, label + ' — Visual Media Hub'));
        var row = el('div', { class: 'image-row' });
        var inp = el('input', { type: 'url', value: getPath(path) || '' });
        inp.placeholder = 'https://... or drop image here';
        var thumb = el('div', { class: 'thumb' }, 'Preview');
        var altWrap = el('div', { class: 'field alt-field' });
        altWrap.appendChild(el('label', {}, 'Alt text'));
        var altInp = el('input', { type: 'text', value: '' });
        altInp.placeholder = 'Describe image for SEO & accessibility';
        // try to restore alt from media.altTexts if available
        try {
            var parts = path.split('.');
            if (parts[0] === 'products' && state.products[parts[1]] && state.products[parts[1]].media.altTexts) {
                altInp.value = state.products[parts[1]].media.altTexts[path] || '';
            }
        } catch (e) {}
        altInp.addEventListener('input', function () {
            try {
                var p = path.split('.');
                if (p[0] === 'products') {
                    var prod = state.products[p[1]];
                    prod.media.altTexts = prod.media.altTexts || {};
                    prod.media.altTexts[path] = altInp.value;
                    touch();
                }
            } catch (e) {}
        });
        function upd() {
            var v = inp.value.trim();
            thumb.style.backgroundImage = v ? 'url("' + v + '")' : '';
            thumb.textContent = v ? '' : 'Preview';
        }
        // drag-and-drop + asset preview
        function onDragOver(e) { e.preventDefault(); wrap.classList.add('drag-over'); thumb.classList.add('drag-over'); }
        function onDragLeave() { wrap.classList.remove('drag-over'); thumb.classList.remove('drag-over'); }
        function onDrop(e) {
            e.preventDefault(); onDragLeave();
            var file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) {
                var url = URL.createObjectURL(file);
                inp.value = url; setPath(path, url); upd();
                toast('Image dropped — preview updated');
                return;
            }
            var url2 = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
            if (url2) { inp.value = url2.trim(); setPath(path, url2.trim()); upd(); }
        }
        wrap.addEventListener('dragover', onDragOver);
        wrap.addEventListener('dragleave', onDragLeave);
        wrap.addEventListener('drop', onDrop);
        thumb.addEventListener('dragover', onDragOver);
        thumb.addEventListener('dragleave', onDragLeave);
        thumb.addEventListener('drop', onDrop);
        // upload button (physically next to content — Component Closeness)
        var uploadRow = el('div', { class: 'hint' });
        var uploadLabel = el('label', { class: 'add-btn' }, 'Upload');
        var fileInp = el('input', { type: 'file' });
        fileInp.accept = 'image/*'; fileInp.hidden = true;
        fileInp.addEventListener('change', function () {
            var f = fileInp.files[0]; if (!f) return;
            var u = URL.createObjectURL(f); inp.value = u; setPath(path, u); upd(); toast('Image selected — preview updated');
        });
        uploadLabel.appendChild(fileInp);
        uploadLabel.addEventListener('click', function (e) { e.preventDefault(); fileInp.click(); });
        var hint = el('span', { class: 'hint' }, ' Drag & drop, paste URL, or Upload — preview + alt-text next to content');
        uploadRow.appendChild(uploadLabel); uploadRow.appendChild(hint);
        inp.addEventListener('input', function () { setPath(path, inp.value); upd(); });
        upd();
        row.appendChild(inp); row.appendChild(thumb); wrap.appendChild(row);
        wrap.appendChild(altWrap); altWrap.appendChild(altInp);
        wrap.appendChild(uploadRow);
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
        toast('Content saves directly to PocketBase — no publish step needed.');
    });

    /* ---------- draft & preview (staging → Publish Live) ---------- */
    var isDraft = false;
    var publishedSnapshot = null;
    function updateDraftUI() {
        var bar = document.getElementById('draftBar');
        var badge = document.getElementById('draftBadge');
        var mode = document.getElementById('previewMode');
        if (bar) bar.hidden = false;
        if (badge) badge.hidden = !isDraft;
        if (mode) mode.textContent = isDraft ? '— draft (staging)' : '— live';
        var btnPub = document.getElementById('btnPublishLive');
        if (btnPub) btnPub.textContent = isDraft ? 'Publish Live' : 'Published';
        if (btnPub) btnPub.disabled = !isDraft;
    }
    function enterDraft() {
        if (!isDraft) {
            publishedSnapshot = JSON.parse(JSON.stringify(state));
            isDraft = true; updateDraftUI(); toast('Draft mode — edits are staged. Preview then Publish Live.');
        }
    }
    // auto-enter draft on first edit
    var _origMarkDirty = markDirty;
    markDirty = function () {
        if (!isDraft && dirty === false && publishedSnapshot === null) {
            // first edit enters draft implicitly if user has toggled draft on
            var tg = document.getElementById('draftToggle');
            if (tg && tg.checked) enterDraft();
        }
        dirty = true;
        var f = document.getElementById('dirtyFlag');
        if (f) f.hidden = false;
        updatePreview();
    };

    /* ---------- wizard (4-step product rollout) ---------- */
    var wizStep = 1;
    var wizData = null;
    function openWizard() {
        wizStep = 1;
        wizData = {
            key: '',
            product: JSON.parse(JSON.stringify(state.products.dms))
        };
        // reset to blank template
        wizData.product.navLabel = '';
        wizData.product.title = '';
        wizData.product.tagline = '';
        wizData.product.summary = '';
        wizData.product.detailTitle = '';
        wizData.product.detailIntro = '';
        wizData.product.detailHeading = '';
        wizData.product.detailParagraphs = ['', ''];
        wizData.product.features = [''];
        wizData.product.media = { hero: '', gallery: ['', '', ''], altTexts: {} };
        wizData.product.pricing = JSON.parse(JSON.stringify(state.products.dms.pricing));
        wizData.product.pricing.tiers.forEach(function (t) { t.features = ['']; });
        wizData.product.categoryId = '';
        document.getElementById('wizardModal').hidden = false;
        renderWizard();
    }
    function closeWizard() { document.getElementById('wizardModal').hidden = true; wizData = null; }
    function renderWizard() {
        document.getElementById('wizStepNum').textContent = String(wizStep);
        document.querySelectorAll('.wiz-step').forEach(function (el) {
            var s = parseInt(el.getAttribute('data-s'), 10);
            el.classList.toggle('active', s === wizStep);
            el.classList.toggle('done', s < wizStep);
        });
        document.getElementById('wizBack').disabled = wizStep === 1;
        document.getElementById('wizNext').hidden = wizStep === 4;
        document.getElementById('wizCreate').hidden = wizStep !== 4;
        var body = document.getElementById('wizBody');
        body.innerHTML = '';
        if (!wizData) return;
        var p = wizData.product;
        if (wizStep === 1) {
            body.appendChild(boundTextWizard('Product key (slug, e.g. analytics)', function () { return wizData.key; }, function (v) { wizData.key = v.toLowerCase().replace(/[^a-z0-9-]/g, '-'); }));
            body.appendChild(boundTextWizard('Product name (title)', function () { return p.title; }, function (v) { p.title = v; p.navLabel = v; }));
            body.appendChild(boundTextWizard('Tagline', function () { return p.tagline; }, function (v) { p.tagline = v; }));
            body.appendChild(boundTextareaWizard('Summary (feature row)', function () { return p.summary; }, function (v) { p.summary = v; }));
            body.appendChild(boundTextareaWizard('Detail intro', function () { return p.detailIntro; }, function (v) { p.detailIntro = v; }));
            body.appendChild(el('div', { class: 'hint' }, 'Step 1 of 4 — Basics: name, tagline, summary. Next adds media.'));
        } else if (wizStep === 2) {
            var heroWrap = el('div', { class: 'field' });
            heroWrap.appendChild(el('label', {}, 'Hero image URL'));
            var heroInp = el('input', { type: 'url', value: p.media.hero });
            heroInp.placeholder = 'https://... or drop';
            var heroThumb = el('div', { class: 'thumb' }, p.media.hero ? '' : 'Preview');
            if (p.media.hero) heroThumb.style.backgroundImage = 'url("' + p.media.hero + '")';
            heroInp.addEventListener('input', function () { p.media.hero = heroInp.value; heroThumb.style.backgroundImage = p.media.hero ? 'url("' + p.media.hero + '")' : ''; heroThumb.textContent = p.media.hero ? '' : 'Preview'; });
            heroWrap.appendChild(heroInp); heroWrap.appendChild(heroThumb);
            body.appendChild(heroWrap);
            [0,1,2].forEach(function (i) {
                var w = el('div', { class: 'field' });
                w.appendChild(el('label', {}, 'Gallery ' + (i+1) + ' URL'));
                var inp = el('input', { type: 'url', value: p.media.gallery[i] || '' });
                inp.addEventListener('input', function () { p.media.gallery[i] = inp.value; });
                w.appendChild(inp); body.appendChild(w);
            });
            var fWrap = el('div', { class: 'field' });
            fWrap.appendChild(el('label', {}, 'Features'));
            var fEditor = el('div', { class: 'list-editor' });
            function rebuildF() {
                fEditor.innerHTML = '';
                p.features.forEach(function (item, idx) {
                    var row = el('div', { class: 'list-item' });
                    var inp = el('input', { type: 'text', value: item });
                    inp.addEventListener('input', function () { p.features[idx] = inp.value; });
                    var del = el('button', { class: 'icon-btn', title: 'Remove' }, '✕');
                    del.addEventListener('click', function () { p.features.splice(idx,1); rebuildF(); });
                    row.appendChild(inp); row.appendChild(del); fEditor.appendChild(row);
                });
                var add = el('button', { class: 'add-btn' }, '+ Add feature');
                add.addEventListener('click', function () { p.features.push(''); rebuildF(); });
                fEditor.appendChild(add);
            }
            rebuildF(); fWrap.appendChild(fEditor); body.appendChild(fWrap);
        } else if (wizStep === 3) {
            var catWrap = el('div', { class: 'field' });
            catWrap.appendChild(el('label', {}, 'Link to category / pricing table (Relationship Mapping)'));
            var sel = el('select', {});
            var opts = [{ id: '', label: '— No category —' }].concat(Object.keys(state.products).map(function (k) { return { id: k, label: state.products[k].navLabel }; }));
            opts.forEach(function (o) {
                var op = el('option', { value: o.id }, o.label);
                if (o.id === p.categoryId) op.selected = true;
                sel.appendChild(op);
            });
            sel.addEventListener('change', function () { p.categoryId = sel.value; });
            catWrap.appendChild(sel);
            catWrap.appendChild(el('div', { class: 'hint' }, 'Simple dropdown to link new product to existing category or pricing table.'));
            body.appendChild(catWrap);
            // pricing tiers quick
            p.pricing.tiers.forEach(function (t, i) {
                var card = el('div', { class: 'tier-card' + (i===1 ? ' featured' : '') });
                card.appendChild(el('h3', {}, t.name + ' — Tier ' + (i+1)));
                var g = el('div', { class: 'two-col' });
                g.appendChild(boundTextWizard('Tier name', function(){return t.name}, function(v){t.name=v}));
                g.appendChild(boundTextWizard('Monthly', function(){return t.monthly}, function(v){t.monthly=v}));
                g.appendChild(boundTextWizard('Annual', function(){return t.annual}, function(v){t.annual=v}));
                g.appendChild(boundTextWizard('CTA', function(){return t.cta}, function(v){t.cta=v}));
                card.appendChild(g);
                body.appendChild(card);
            });
        } else if (wizStep === 4) {
            body.appendChild(el('div', { class: 'hint' }, 'Draft & Preview: review staged product below. Toggle Draft then Publish Live to go live.'));
            var preview = el('div', { class: 'preview-card' });
            preview.appendChild(el('h3', {}, (p.tagline || 'Tagline') + ' — ' + (p.title || 'Untitled')));
            preview.appendChild(el('p', {}, p.summary || 'No summary yet.'));
            var ul = el('ul', { class: 'product-features' });
            (p.features || []).forEach(function (f) { if (f) ul.appendChild(el('li', {}, f)); });
            preview.appendChild(ul);
            var priceGrid = el('div', { class: 'price-grid' });
            p.pricing.tiers.forEach(function (t) {
                var tier = el('div', { class: 'price-tier' });
                tier.appendChild(el('h4', {}, t.name));
                tier.appendChild(el('p', { class: 'price' }, t.monthly));
                priceGrid.appendChild(tier);
            });
            preview.appendChild(priceGrid);
            body.appendChild(preview);
            if (!wizData.key || !p.title) {
                body.appendChild(el('div', { class: 'hint', style: 'color:#d70015' }, 'Enter product key and title before creating.'));
            }
        }
    }
    function boundTextWizard(label, getv, setv) {
        var w = el('div', { class: 'field' });
        w.appendChild(el('label', {}, label));
        var inp = el('input', { type: 'text', value: getv() || '' });
        inp.addEventListener('input', function(){ setv(inp.value); });
        w.appendChild(inp); return w;
    }
    function boundTextareaWizard(label, getv, setv) {
        var w = el('div', { class: 'field' });
        w.appendChild(el('label', {}, label));
        var ta = el('textarea', {}); ta.value = getv() || '';
        ta.addEventListener('input', function(){ setv(ta.value); });
        w.appendChild(ta); return w;
    }

    function showDashboard() {
        var gate = document.getElementById('authGate');
        var layout = document.getElementById('adminLayout');
        var signOut = document.getElementById('btnSignOut');
        if (gate) gate.hidden = true;
        if (layout) layout.hidden = false;
        if (signOut) signOut.hidden = false;

        buildTabs();
        render();
        updateDraftUI();
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
    var authRequired = !!(config.authEnabled && config.pocketbaseUrl);
    var modeEl = document.getElementById('cmsMode');
    if (modeEl) {
        modeEl.textContent = authRequired ? 'Backend: PocketBase' : 'Backend: Local (no backend)';
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

    // Draft bar wiring
    var draftToggle = document.getElementById('draftToggle');
    if (draftToggle) draftToggle.addEventListener('change', function () {
        if (draftToggle.checked) enterDraft();
        else {
            if (isDraft && publishedSnapshot) {
                if (dirty && !confirm('Discard staged draft and revert to published?')) { draftToggle.checked = true; return; }
                state = JSON.parse(JSON.stringify(publishedSnapshot));
                isDraft = false; dirty = false;
                var f = document.getElementById('dirtyFlag'); if (f) f.hidden = true;
                buildTabs(); render(); updateDraftUI(); toast('Reverted to published');
            } else { isDraft = false; updateDraftUI(); }
        }
    });
    var btnPreviewStaging = document.getElementById('btnPreviewStaging');
    if (btnPreviewStaging) btnPreviewStaging.addEventListener('click', function () {
        updatePreview();
        toast('Staging preview updated — check Live preview pane');
        document.querySelector('.admin-preview')?.scrollIntoView({ behavior: 'smooth' });
    });
    var btnPublishLive = document.getElementById('btnPublishLive');
    if (btnPublishLive) btnPublishLive.addEventListener('click', function () {
        if (!isDraft) { toast('Nothing to publish — enable Draft mode first'); return; }
        CMS.saveState(state).then(function (ok) {
            if (ok) {
                publishedSnapshot = JSON.parse(JSON.stringify(state));
                isDraft = false; dirty = false;
                var f = document.getElementById('dirtyFlag'); if (f) f.hidden = true;
                var tg = document.getElementById('draftToggle'); if (tg) tg.checked = false;
                updateDraftUI(); toast('✓ Published live');
            } else toast('Publish failed');
        });
    });

    // Wizard wiring
    var btnNew = document.getElementById('btnNewProduct');
    if (btnNew) btnNew.addEventListener('click', openWizard);
    var wizClose = document.getElementById('wizClose');
    if (wizClose) wizClose.addEventListener('click', closeWizard);
    var wizBack = document.getElementById('wizBack');
    if (wizBack) wizBack.addEventListener('click', function(){ if (wizStep>1){ wizStep--; renderWizard(); }});
    var wizNext = document.getElementById('wizNext');
    if (wizNext) wizNext.addEventListener('click', function(){ if (wizStep<4){ wizStep++; renderWizard(); }});
    var wizCreate = document.getElementById('wizCreate');
    if (wizCreate) wizCreate.addEventListener('click', function(){
        if (!wizData.key) { toast('Enter product key'); return; }
        if (state.products[wizData.key]) { toast('Key already exists: ' + wizData.key); return; }
        if (!wizData.product.title) { toast('Enter product title'); return; }
        state.products[wizData.key] = wizData.product;
        CMS.saveState(state).then(function(){
            buildTabs(); currentPath = 'products.' + wizData.key; render();
            toast('✓ Product created: ' + wizData.key);
            closeWizard();
        });
    });
    var wizardModal = document.getElementById('wizardModal');
    if (wizardModal) wizardModal.addEventListener('click', function(e){ if (e.target === wizardModal) closeWizard(); });

    /* boot: authenticate before exposing the CMS when PocketBase is configured */
    if (authRequired) {
        var session = CMS.getSession();
        if (session && session.access_token && (!session.expires_at || session.expires_at > Date.now())) showDashboard();
        else showLogin();
    } else {
        showDashboard();
    }
})();
