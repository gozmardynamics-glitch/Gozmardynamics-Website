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
                del.addEventListener('click', function () { if (!confirm('Remove this item?')) return; arr.splice(idx, 1); touch(); rebuild(); });
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
                del.addEventListener('click', function () { if (!confirm('Remove this item?')) return; arr.splice(idx, 1); touch(); rebuild(); });
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

    /* ---------- gallery images with featured (scalable, unlimited) ---------- */
    function galleryImagesEditor(label, product) {
        var media = product.media = product.media || { images: [], featuredIndex: -1, hero: '', gallery: [], slider: { autoplay: true } };
        if (!Array.isArray(media.images)) media.images = [];
        if (typeof media.featuredIndex !== 'number') media.featuredIndex = media.images.length ? 0 : -1;
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        wrap.appendChild(el('div', { class: 'hint' }, 'Unlimited images. ★ sets Featured (card thumbnail & hero). Frontend slider shows all.'));
        var editor = el('div', { class: 'list-editor' });
        function rebuild() {
            editor.innerHTML = '';
            media.images.forEach(function (img, idx) {
                var row = el('div', { class: 'list-item', html: '' });
                row.style.alignItems = 'center';
                var isFeatured = media.featuredIndex === idx;
                var thumb = el('div', { class: 'thumb' }, isFeatured ? '★ Featured' : 'Preview');
                if (isFeatured) { thumb.style.borderColor = '#0071e3'; thumb.style.background = '#e6f1ff'; thumb.style.fontWeight = '700'; }
                var src = img.src || '';
                if (src) { thumb.style.backgroundImage = 'url(\"' + src.replace(/\"/g, '&quot;') + '\")'; thumb.style.backgroundSize = 'cover'; thumb.style.backgroundPosition = 'center'; thumb.textContent = isFeatured ? '★ Featured' : ''; }
                var inp = el('input', { type: 'url', value: src, placeholder: 'https://…/image.jpg' });
                inp.addEventListener('input', function () { img.src = inp.value; if (isFeatured) media.hero = inp.value; touch(); var v = inp.value.trim(); thumb.style.backgroundImage = v ? 'url(\"' + v.replace(/\"/g, '&quot;') + '\")' : ''; thumb.textContent = v ? (isFeatured ? '★ Featured' : '') : 'Preview'; });
                var altInp = el('input', { type: 'text', value: img.alt || '', placeholder: 'Alt text' });
                altInp.style.maxWidth = '140px';
                altInp.addEventListener('input', function () { img.alt = altInp.value; touch(); });
                var featBtn = el('button', { class: 'add-btn', title: 'Set as featured' }, isFeatured ? '★ Featured' : '☆ Featured');
                if (isFeatured) { featBtn.style.background = '#0071e3'; featBtn.style.color = '#fff'; featBtn.style.borderColor = '#0071e3'; }
                featBtn.addEventListener('click', function () {
                    media.featuredIndex = idx;
                    media.images.forEach(function (im, i) { im.featured = i === idx; });
                    media.hero = img.src;
                    touch(); rebuild();
                });
                var up = el('button', { class: 'icon-btn', title: 'Move up' }, '↑');
                up.addEventListener('click', function () { if (idx === 0) return; var t = media.images[idx]; media.images[idx] = media.images[idx - 1]; media.images[idx - 1] = t; if (media.featuredIndex === idx) media.featuredIndex = idx - 1; else if (media.featuredIndex === idx - 1) media.featuredIndex = idx; touch(); rebuild(); });
                var down = el('button', { class: 'icon-btn', title: 'Move down' }, '↓');
                down.addEventListener('click', function () { if (idx === media.images.length - 1) return; var t = media.images[idx]; media.images[idx] = media.images[idx + 1]; media.images[idx + 1] = t; if (media.featuredIndex === idx) media.featuredIndex = idx + 1; else if (media.featuredIndex === idx + 1) media.featuredIndex = idx; touch(); rebuild(); });
                var del = el('button', { class: 'icon-btn', title: 'Remove' }, '✕');
                del.addEventListener('click', function () { if (!confirm('Remove this image?')) return; try { if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); } catch (e) {} media.images.splice(idx, 1); if (media.featuredIndex === idx) { media.featuredIndex = media.images.length ? 0 : -1; if (media.images[0]) media.images[0].featured = true; } else if (media.featuredIndex > idx) media.featuredIndex--; touch(); rebuild(); });
                row.appendChild(inp); row.appendChild(altInp); row.appendChild(thumb); row.appendChild(featBtn); row.appendChild(up); row.appendChild(down); row.appendChild(del);
                editor.appendChild(row);
            });
            var add = el('button', { class: 'add-btn' }, '+ Add image');
            add.addEventListener('click', function () { media.images.push({ src: '', alt: '', featured: false }); if (media.images.length === 1) { media.featuredIndex = 0; media.images[0].featured = true; } touch(); rebuild(); });
            var fileInp = el('input', { type: 'file' }); fileInp.accept = 'image/*'; fileInp.hidden = true;
            fileInp.addEventListener('change', function () { var f = fileInp.files[0]; if (!f) return; var url = URL.createObjectURL(f); media.images.push({ src: url, alt: f.name, featured: media.images.length === 0 }); if (media.images.length === 1) media.featuredIndex = 0; touch(); rebuild(); toast('Image uploaded'); });
            var upBtn = el('button', { class: 'add-btn' }, 'Upload image');
            upBtn.addEventListener('click', function (e) { e.preventDefault(); fileInp.click(); });
            editor.appendChild(add); editor.appendChild(upBtn); editor.appendChild(fileInp);
        }
        rebuild();
        wrap.appendChild(editor);
        return wrap;
    }
    function specificationsEditor(label, product) {
        var specs = product.specifications = product.specifications || [];
        var wrap = el('div', { class: 'field' });
        wrap.appendChild(el('label', {}, label));
        wrap.appendChild(el('div', { class: 'hint' }, 'Optional — hidden on frontend if empty.'));
        var editor = el('div', { class: 'list-editor' });
        function rebuild() {
            editor.innerHTML = '';
            specs.forEach(function (s, idx) {
                var card = el('div', { class: 'tier-card' });
                var row = el('div', { class: 'two-col' });
                var lW = el('div', { class: 'field' }); lW.appendChild(el('label', {}, 'Label')); var lInp = el('input', { type: 'text', value: s.label || '', placeholder: 'e.g. OS' }); lInp.addEventListener('input', function () { s.label = lInp.value; touch(); }); lW.appendChild(lInp); row.appendChild(lW);
                var vW = el('div', { class: 'field' }); vW.appendChild(el('label', {}, 'Value')); var vInp = el('input', { type: 'text', value: s.value || '', placeholder: 'e.g. Web, iOS, Android' }); vInp.addEventListener('input', function () { s.value = vInp.value; touch(); }); vW.appendChild(vInp); row.appendChild(vW);
                card.appendChild(row);
                var del = el('button', { class: 'icon-btn', title: 'Remove' }, '✕');
                del.addEventListener('click', function () { if (!confirm('Remove specification?')) return; specs.splice(idx, 1); touch(); rebuild(); });
                card.appendChild(del);
                editor.appendChild(card);
            });
            var add = el('button', { class: 'add-btn' }, '+ Add specification');
            add.addEventListener('click', function () { specs.push({ label: '', value: '' }); touch(); rebuild(); });
            editor.appendChild(add);
        }
        rebuild(); wrap.appendChild(editor); return wrap;
    }

    /* ---------- banner editor (text + preset + visibility) ---------- */
    var BANNER_PRESETS = ['blue', 'green', 'amber', 'coral', 'ink', 'white'];
    function bannerEditor(label, path) {
        var b = getPath(path) || {};
        var wrap = el('div', { class: 'field banner-field' });
        wrap.appendChild(el('label', {}, label));
        var row = el('div', { class: 'banner-row' });
        var textInp = el('input', { type: 'text', value: b.text || '', placeholder: 'e.g. Sale, -20%, Limited Offer, New' });
        textInp.addEventListener('input', function () { b.text = textInp.value; touch(); });
        var presetSel = el('select', {});
        BANNER_PRESETS.forEach(function (p) {
            var opt = el('option', { value: p }, p.charAt(0).toUpperCase() + p.slice(1));
            if (b.preset === p) opt.selected = true;
            presetSel.appendChild(opt);
        });
        presetSel.addEventListener('change', function () { b.preset = presetSel.value; touch(); });
        row.appendChild(textInp);
        row.appendChild(presetSel);
        wrap.appendChild(row);
        var visWrap = el('label', { class: 'checkbox-row' });
        var visInp = el('input', { type: 'checkbox' });
        if (b.visible) visInp.checked = true;
        visInp.addEventListener('change', function () { b.visible = visInp.checked; touch(); });
        visWrap.appendChild(visInp);
        visWrap.appendChild(el('span', {}, 'Show on frontend (top-left of the section)'));
        wrap.appendChild(visWrap);
        return wrap;
    }

    /* ---------- capabilities (feature cards) ---------- */
    function capabilitiesEditor(label, path) {
        var cfg = getPath(path) || {};
        var wrap = el('div', { class: 'field capabilities-field' });
        wrap.appendChild(el('label', {}, label));
        wrap.appendChild(el('div', { class: 'hint' }, 'Cards shown uses the setting below; frontend renders gracefully if fewer items exist.'));

        var countWrap = el('div', { class: 'field' });
        countWrap.appendChild(el('label', {}, 'Cards shown (recommended minimum 7)'));
        var countInp = el('input', { type: 'number', min: 1, value: cfg.count || 7 });
        countInp.addEventListener('input', function () {
            var c = parseInt(countInp.value, 10);
            if (!isNaN(c) && c >= 1) { cfg.count = c; touch(); }
        });
        countWrap.appendChild(countInp);
        wrap.appendChild(countWrap);

        var items = cfg.items || [];
        var editor = el('div', { class: 'list-editor' });
        function rebuild() {
            editor.innerHTML = '';
            items.forEach(function (item, idx) {
                var card = el('div', { class: 'tier-card' });
                var row2 = el('div', { class: 'two-col' });
                var iconInp = el('input', { type: 'text', value: item.icon || '', placeholder: 'fa-folder-open' });
                iconInp.addEventListener('input', function () { item.icon = iconInp.value; touch(); });
                var iconField = el('div', { class: 'field' });
                iconField.appendChild(el('label', {}, 'Font Awesome icon class'));
                iconField.appendChild(iconInp);
                row2.appendChild(iconField);
                var titleInp = el('input', { type: 'text', value: item.title || '' });
                titleInp.addEventListener('input', function () { item.title = titleInp.value; touch(); });
                var titleField = el('div', { class: 'field' });
                titleField.appendChild(el('label', {}, 'Card title'));
                titleField.appendChild(titleInp);
                row2.appendChild(titleField);
                card.appendChild(row2);
                var textInp = el('textarea', {}); textInp.value = item.text || '';
                textInp.addEventListener('input', function () { item.text = textInp.value; touch(); });
                var textField = el('div', { class: 'field' });
                textField.appendChild(el('label', {}, 'Card description'));
                textField.appendChild(textInp);
                card.appendChild(textField);
                var del = el('button', { class: 'icon-btn', title: 'Remove card' }, '✕');
                del.addEventListener('click', function () { items.splice(idx, 1); touch(); rebuild(); });
                card.appendChild(del);
                editor.appendChild(card);
            });
            var add = el('button', { class: 'add-btn' }, '+ Add capability card');
            add.addEventListener('click', function () { items.push({ icon: 'fa-cube', title: '', text: '' }); touch(); rebuild(); });
            editor.appendChild(add);
        }
        rebuild();
        wrap.appendChild(editor);
        return wrap;
    }

    /* ---------- pricing editor ---------- */
    function pricingEditor(pricing) {
        var block = el('div', { class: 'section-block' });
        block.appendChild(el('h2', {}, [icon('fa-tags'), 'Pricing — Tiered plans', badge('3–4 tiers')]));

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

        /* Full tier configuration */
        pricing.tiers.forEach(function (t, i) {
            var card = el('div', { class: 'tier-card' + (t.featured ? ' featured' : '') });
            card.appendChild(el('h3', {}, [t.name, el('span', { class: 'hint' }, 'Tier ' + (i + 1))]));
            var grid = el('div', { class: 'two-col' });
            grid.appendChild(boundText('Tier name', function () { return t.name; }, function (v) { t.name = v; }));
            grid.appendChild(boundText('Monthly price', function () { return t.monthly; }, function (v) { t.monthly = v; }));
            grid.appendChild(boundText('Annual price', function () { return t.annual; }, function (v) { t.annual = v; }));
            grid.appendChild(boundText('Old (struck) price', function () { return t.oldPrice; }, function (v) { t.oldPrice = v; }, { hint: 'Shows next to monthly, e.g. $49 — leave empty for no strikethrough' }));
            grid.appendChild(boundText('Volume discount %', function () { return t.volumeDiscount; }, function (v) { t.volumeDiscount = v; }, { hint: 'Bulk/volume discount applied at this level' }));
            grid.appendChild(boundText('Min seats for discount', function () { return t.minSeats; }, function (v) { t.minSeats = v; }));
            grid.appendChild(boundText('CTA label', function () { return t.cta; }, function (v) { t.cta = v; }));
            grid.appendChild(boundText('CTA link', function () { return t.ctaLink; }, function (v) { t.ctaLink = v; }, { hint: 'e.g. #contact or a full URL' }));
            card.appendChild(grid);
            var featWrap = el('label', { class: 'checkbox-row' });
            var featInp = el('input', { type: 'checkbox' });
            if (t.featured) featInp.checked = true;
            featInp.addEventListener('change', function () {
                if (featInp.checked) pricing.tiers.forEach(function (o, j) { o.featured = (j === i); });
                else t.featured = false;
                touch(); renderPricing();
            });
            featWrap.appendChild(featInp);
            featWrap.appendChild(el('span', {}, 'Featured tier ("Most popular" pill + highlight)'));
            card.appendChild(featWrap);
            card.appendChild(boundStringList('Tier features', function () { return t.features; }));
            block.appendChild(card);
        });

        var tierControls = el('div', { class: 'tier-controls' });
        var addTier = el('button', { class: 'add-btn' }, '+ Add tier');
        addTier.addEventListener('click', function () {
            if (pricing.tiers.length >= 4) { toast('Maximum 4 pricing tiers.'); return; }
            var n = pricing.tiers.length + 1;
            pricing.tiers.push({
                name: 'Tier ' + n, monthly: '$—', annual: '', oldPrice: '',
                volumeDiscount: '0', minSeats: '1', features: ['Feature'],
                cta: 'Get started', ctaLink: '#contact', featured: false
            });
            touch(); renderPricing();
        });
        var delTier = el('button', { class: 'add-btn danger' }, '− Remove last tier');
        delTier.addEventListener('click', function () {
            if (pricing.tiers.length <= 3) { toast('Minimum 3 pricing tiers required.'); return; }
            pricing.tiers.pop();
            touch(); renderPricing();
        });
        tierControls.appendChild(addTier);
        tierControls.appendChild(delTier);
        block.appendChild(tierControls);

        function renderPricing() { render(); }

        return block;
    }

    /* ---------- renderers ---------- */
    function renderProduct(key) {
        var p = state.products[key];
        // ensure migrated fields exist (for old localStorage)
        p.commerce = p.commerce || { price: '', compareAtPrice: '', badge: '', stockStatus: 'in_stock' };
        p.taxonomy = p.taxonomy || { category: '', tags: [] };
        p.specifications = p.specifications || [];
        p.media = p.media || { images: [], featuredIndex: -1, hero: '', gallery: [], slider: { autoplay: true } };
        if (!Array.isArray(p.media.images)) p.media.images = [];
        p.status = p.status || 'active';
        if (!p.shortDescription) p.shortDescription = p.summary || '';
        if (!p.featureCards) p.featureCards = (window.GOZMAR_DEFAULTS && window.GOZMAR_DEFAULTS.products && window.GOZMAR_DEFAULTS.products[key] && JSON.parse(JSON.stringify(window.GOZMAR_DEFAULTS.products[key].featureCards))) || { count: 7, items: [] };
        if (!p.banners) p.banners = { product: { text: '', preset: 'blue', visible: false }, gallery: { text: '', preset: 'amber', visible: false }, pricing: { text: '', preset: 'coral', visible: false } };
        var root = document.getElementById('adminRoot');
        root.innerHTML = '';
        var headRow = el('div', { class: 'page-head' });
        headRow.style.display = 'flex'; headRow.style.alignItems = 'center'; headRow.style.gap = '8px'; headRow.style.marginBottom = '12px';
        headRow.appendChild(el('h1', { class: 'page-title', style: 'flex:1;margin:0' }, p.navLabel + ' — Product'));
        var dupBtn = el('button', { class: 'add-btn' }, 'Duplicate');
        dupBtn.addEventListener('click', function () {
            var newKey = (key + '_copy').replace(/[^a-z0-9_-]/g, ''); var i = 1; while (state.products[newKey]) newKey = key + '_copy' + i++;
            state.products[newKey] = JSON.parse(JSON.stringify(p)); state.products[newKey].title += ' (Copy)'; state.products[newKey].navLabel += ' Copy';
            currentPath = 'products.' + newKey; touch(); buildTabs(); render(); toast('Duplicated');
        });
        var delBtn = el('button', { class: 'add-btn danger' }, 'Delete product');
        delBtn.addEventListener('click', function () {
            if (Object.keys(state.products).length <= 1) { toast('Cannot delete last product', 'error'); return; }
            if (!confirm('Delete product "' + p.navLabel + '"? This cannot be undone.')) return;
            delete state.products[key];
            (p.media.images || []).forEach(function (im) { try { if (im.src && im.src.startsWith('blob:')) URL.revokeObjectURL(im.src); } catch (e) {} });
            currentPath = 'products.' + Object.keys(state.products)[0];
            touch(); buildTabs(); render(); CMS.saveState(state).then(function () { toast('Product deleted', 'success'); });
        });
        headRow.appendChild(dupBtn); headRow.appendChild(delBtn);
        root.appendChild(headRow);

        var d = el('div', { class: 'section-block' });
        d.appendChild(el('h2', {}, [icon('fa-info-circle'), 'Basic Info']));
        d.appendChild(el('p', { class: 'hint' }, 'Grouped: Title → H2, Tagline → eyebrow, Short Description → card. Use **bold** to emphasize phrases.'));
        d.appendChild(boundText('Product Title — frontend H2 & nav', function () { return p.title; }, function (v) { p.title = v; p.navLabel = v; }));
        d.appendChild(boundText('Nav Label — sidebar', function () { return p.navLabel; }, function (v) { p.navLabel = v; }));
        d.appendChild(boundText('Tagline — eyebrow', function () { return p.tagline; }, function (v) { p.tagline = v; }));
        d.appendChild(boundText('CTA button label', function () { return p.ctaPrimary; }, function (v) { p.ctaPrimary = v; }));
        d.appendChild(boundTextarea('Short Description — card paragraph', function () { return p.shortDescription; }, function (v) { p.shortDescription = v; p.summary = v; }));
        d.appendChild(boundText('Detail marketing heading — H2', function () { return p.detailTitle; }, function (v) { p.detailTitle = v; }));
        d.appendChild(boundText('Detail section heading — H3', function () { return p.detailHeading; }, function (v) { p.detailHeading = v; }));
        d.appendChild(boundTextarea('Detail intro — lede', function () { return p.detailIntro; }, function (v) { p.detailIntro = v; }));
        d.appendChild(boundTextarea('Detail paragraph 1', function () { return p.detailParagraphs[0]; }, function (v) { p.detailParagraphs[0] = v; }));
        d.appendChild(boundTextarea('Detail paragraph 2', function () { return p.detailParagraphs[1]; }, function (v) { p.detailParagraphs[1] = v; }));
        root.appendChild(d);

        var pricingGroup = el('div', { class: 'section-block' });
        pricingGroup.appendChild(el('h2', {}, [icon('fa-tags'), 'Pricing — Price & Badges']));
        pricingGroup.appendChild(el('p', { class: 'hint' }, 'Price shown on card & detail. Gracefully hidden if empty.'));
        pricingGroup.appendChild(boundText('Price (e.g. $29 / Free)', function () { return p.commerce.price; }, function (v) { p.commerce.price = v; }));
        pricingGroup.appendChild(boundText('Compare-at / Old price (strikethrough, e.g. $49)', function () { return p.commerce.compareAtPrice; }, function (v) { p.commerce.compareAtPrice = v; }, { hint: 'Sale old price — leave empty to hide' }));
        pricingGroup.appendChild(boundText('Badge (e.g. New, Sale) — card', function () { return p.commerce.badge; }, function (v) { p.commerce.badge = v; }));
        (function () {
            var wrap = el('div', { class: 'field' });
            wrap.appendChild(el('label', {}, 'Stock status — frontend chip'));
            var sel = el('select', {});
            [['in_stock', 'In Stock'], ['low_stock', 'Low Stock'], ['out_of_stock', 'Out of Stock']].forEach(function (o) {
                var opt = el('option', { value: o[0] }, o[1]); if (p.commerce.stockStatus === o[0]) opt.selected = true; sel.appendChild(opt);
            });
            sel.addEventListener('change', function () { p.commerce.stockStatus = sel.value; touch(); });
            wrap.appendChild(sel); pricingGroup.appendChild(wrap);
        })();
        root.appendChild(pricingGroup);

        var m = el('div', { class: 'section-block' });
        m.appendChild(el('h2', {}, [icon('fa-images'), 'Images — Product Gallery']));
        m.appendChild(el('p', { class: 'hint' }, 'Unlimited images. ★ sets Featured (card thumbnail & hero). Active for ALL products.'));
        m.appendChild(galleryImagesEditor('Gallery images (unlimited)', p));
        (function () {
            var wrap = el('label', { class: 'checkbox-row' });
            var sliderCfg = (p.media.slider = p.media.slider || { autoplay: true });
            var toggle = el('input', { type: 'checkbox' });
            if (sliderCfg.autoplay !== false) toggle.checked = true;
            toggle.addEventListener('change', function () { p.media.slider.autoplay = toggle.checked; touch(); });
            wrap.appendChild(toggle);
            wrap.appendChild(el('span', {}, 'Slider autoplay — "A closer look" advances on its own (pauses on hover/focus, respects reduced motion)'));
            m.appendChild(wrap);
        })();
        root.appendChild(m);

        var capBlock = el('div', { class: 'section-block' });
        capBlock.appendChild(el('h2', {}, [icon('fa-th-large'), 'Capabilities — feature cards']));
        capBlock.appendChild(capabilitiesEditor('Capability cards (frontend grid)', 'products.' + key + '.featureCards'));
        root.appendChild(capBlock);

        var banBlock = el('div', { class: 'section-block' });
        banBlock.appendChild(el('h2', {}, [icon('fa-tag'), 'Banner badges (top-left of sections)']));
        banBlock.appendChild(bannerEditor('Product banner — top-left of detail', 'products.' + key + '.banners.product'));
        banBlock.appendChild(bannerEditor('Gallery banner — top-left of "A closer look"', 'products.' + key + '.banners.gallery'));
        banBlock.appendChild(bannerEditor('Pricing banner — top-left of pricing', 'products.' + key + '.banners.pricing'));
        root.appendChild(banBlock);

        var f = el('div', { class: 'section-block' });
        f.appendChild(el('h2', {}, [icon('fa-list'), 'Details — Features']));
        f.appendChild(boundStringList('Feature list — checkmarks', function () { return p.features; }));
        root.appendChild(f);

        var tx = el('div', { class: 'section-block' });
        tx.appendChild(el('h2', {}, [icon('fa-layer-group'), 'Details — Category, Tags, Specifications']));
        tx.appendChild(boundText('Category — e.g. BusinessApplication', function () { return p.taxonomy.category; }, function (v) { p.taxonomy.category = v; }));
        tx.appendChild(boundStringList('Tags — chips', function () { return p.taxonomy.tags; }));
        tx.appendChild(specificationsEditor('Specifications (table)', p));
        root.appendChild(tx);

        var vis = el('div', { class: 'section-block' });
        vis.appendChild(el('h2', {}, [icon('fa-eye'), 'Visibility — Status']));
        (function () {
            var wrap = el('div', { class: 'field' });
            wrap.appendChild(el('label', {}, 'Status — archived hides on frontend'));
            var sel = el('select', {});
            [['active', 'Active (visible)'], ['draft', 'Draft'], ['archived', 'Archived (hidden)']].forEach(function (o) {
                var opt = el('option', { value: o[0] }, o[1]); if (p.status === o[0]) opt.selected = true; sel.appendChild(opt);
            });
            sel.addEventListener('change', function () { p.status = sel.value; touch(); });
            wrap.appendChild(sel); vis.appendChild(wrap);
        })();
        root.appendChild(vis);

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
        try {
            var parts = currentPath.split('.');
            if (parts[0] === 'products') {
                if (!state.products[parts[1]]) {
                    currentPath = 'products.' + Object.keys(state.products)[0];
                    parts = currentPath.split('.');
                }
                renderProduct(parts[1]);
            } else renderSiteSection(parts[1]);
            updatePreview();
        } catch (e) {
            try {
                var root = document.getElementById('adminRoot');
                if (root) root.innerHTML = '<div class="section-block" style="border-color:#f5b5b5;background:#fff0f0"><h2 style="color:#8a0010">Render error</h2><p>' + esc(e.message || String(e)) + '</p><p class="hint">Try resetting: <a href="#" onclick="localStorage.removeItem(\'gozmar_cms_v1\');location.reload();return false">clear saved data</a></p></div>';
                console.error(e);
                toast('Render error: ' + (e.message||e), 'error');
            } catch (ee) {}
        }
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
        var prodKeys = Object.keys(state.products);
        nav.appendChild(el('div', { class: 'group-label' }, 'Products (' + prodKeys.length + ')'));
        prodKeys.forEach(function (key) {
            var p = state.products[key];
            var isArchived = p.status === 'archived';
            var suffix = isArchived ? ' (archived)' : p.status === 'draft' ? ' • draft' : '';
            var btn = el('button', { class: 'admin-tab' + (currentPath === 'products.' + key ? ' active' : '') }, [
                icon(isArchived ? 'fa-eye-slash' : 'fa-cube'), p.navLabel + suffix
            ]);
            if (isArchived) btn.style.opacity = '0.6';
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
    function toast(msg, tone) {
        var t = el('div', { class: 'toast ' + (tone || '') }, msg);
        if (tone === 'error') t.style.background = '#b3261e';
        if (tone === 'success') t.style.background = '#0a7a3a';
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add('show'); });
        setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, tone === 'error' ? 2600 : 1800);
    }

    function save() {
        var btn = document.getElementById('btnSave');
        var orig = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…'; }
        CMS.saveState(state).then(function (ok) {
            if (ok) {
                dirty = false;
                var f = document.getElementById('dirtyFlag'); if (f) f.hidden = true;
                toast('✓ Changes saved', 'success');
            } else {
                toast('Save failed (storage unavailable)', 'error');
            }
        }).catch(function (e) { toast('Save failed: ' + (e.message || 'error'), 'error'); })
        .then(function () { if (btn) { btn.disabled = false; btn.innerHTML = orig || 'Save changes'; } });
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
        if (session && String(session).trim()) showDashboard();
        else showLogin();
    } else {
        showDashboard();
    }
})();
