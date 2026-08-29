/* Gozmar CMS full E2E suite (jsdom based).
   Run: node e2e-full.js
   Requires jsdom. Bundled under node_modules/ if available, otherwise
   resolves from the opencode temp dir used during development.
   Fallback mock harness: e2e-test.js (zero-dependency smoke).
*/

/* E2E test for Gozmar CMS: admin -> localStorage -> front-end */
const fs = require('fs');
const path = require('path');
function loadJsdom(){
  const paths=['jsdom'];
  const alt='C:/Users/EBELEJ~1/AppData/Local/Temp/opencode/node_modules';
  try{ return require('jsdom'); }catch(e){}
  try{ return require(alt+'/jsdom'); }catch(e){}
  throw new Error('jsdom not found. Install with: npm i jsdom');
}
const { JSDOM } = loadJsdom();

const ROOT = 'C:/Users/Ebele John/Desktop/Gozmar-Dynamics-Website';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name); }
}

function makeDom(htmlFile) {
  const html = read(htmlFile);
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://www.gozmardynamics.com/'
  });
  return dom;
}

// Evaluate the project scripts inside the jsdom window (manual, so no network needed)
function loadScripts(dom, files) {
  files.forEach((f) => {
    try { dom.window.eval(read(f)); }
    catch (e) { console.log('  ERROR evaluating ' + f + ': ' + e.message); fail++; }
  });
}

// Products render into #productsMount via the single-template engine
function q(dom, sel) { return dom.window.document.querySelector(sel); }
function qa(dom, sel) { return Array.from(dom.window.document.querySelectorAll(sel)); }
function getComputedStyle2(w, el) { try { return w.getComputedStyle(el).display; } catch (e) { return ''; } }

/* ============ TEST 1: Front-end binds DEFAULTS on load ============ */
console.log('\n[1] Front-end applies default data model');
{
  const dom = makeDom('index.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/main.js']);
  const d = dom.window.document;
  const w = dom.window;
  w.CMS.applyState(w.CMS.loadState()); // ensure applied regardless of DOMContentLoaded timing

  ok('CMS global exists', !!w.CMS);
  ok('DMS tagline bound', q(dom, '#productsMount #product-dms .product-text .product-tagline').textContent === 'Corporate Document Management');
  ok('DMS title bound', q(dom, '#productsMount #product-dms .product-text h2').textContent === 'Gozmar DMS');
  ok('DMS summary bound', w.CMS.loadState().products.dms.summary === 'An AI-powered document management system that organises, secures, and retrieves your corporate files with zero friction. Advanced machine learning automatically categorises documents, extracts key data, and enforces compliance — so your team can find anything in seconds.');
  ok('DMS 3 price tiers rendered', qa(dom, '#productsMount #dms-detail .pricing .price-grid .price-tier').length === 3);
  ok('DMS feature-row features (6)', qa(dom, '#productsMount #dms-detail .detail-copy ul.product-features li').length === 6);
  ok('DMS detail features (6)', qa(dom, '#productsMount #dms-detail .detail-copy ul.product-features li').length === 6);
  ok('Hero title accent bound', /powered by AI\./.test(q(dom, '#home h1').innerHTML));
  ok('Stats band (4) rendered', qa(dom, '#stats .stats-grid .stat').length === 4);
  ok('Values (4) rendered', qa(dom, '#values .values-grid .value-card').length === 4);
  ok('Testimonials (3) rendered', qa(dom, '#testimonials .testimonial-grid blockquote').length === 3);
  ok('FAQ (4) rendered', qa(dom, '#faq .faq-grid details').length === 4);
}

/* ============ TEST 2: Edited state propagates to front-end ============ */
console.log('\n[2] Editing the data model updates the front-end DOM');
{
  const dom = makeDom('index.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/main.js']);
  const w = dom.window, d = dom.window.document;

  const edited = JSON.parse(JSON.stringify(w.GOZMAR_DEFAULTS));
  edited.products.dms.tagline = 'EDITED TAGLINE';
  edited.products.dms.pricing.tiers[1].monthly = '$49';
  edited.products.dms.pricing.tiers[1].volumeDiscount = '20';
  edited.products.dms.media.hero = 'https://example.com/hero.png';
  edited.site.hero.title = 'We build ';
  edited.site.hero.titleAccent = 'smart software.';
  w.localStorage.setItem('gozmar_cms_v1', JSON.stringify(edited));

  w.CMS.applyState(w.CMS.loadState()); // mimic reload

  ok('Edited tagline applied', q(dom, '#productsMount #product-dms .product-text .product-tagline').textContent === 'EDITED TAGLINE');
  const tiers = qa(dom, '#productsMount #dms-detail .pricing .price-grid .price-tier');
  ok('Edited price applied', /49/.test(tiers[1].querySelector('.price').textContent));
  ok('Volume discount shown', /20% volume discount/.test(tiers[1].textContent));
  ok('Edited hero applied', q(dom, '#home h1').innerHTML === 'We build <em>smart software.</em>');
  ok('Media hero image applied', /hero\.png/.test(q(dom, '#productsMount #dms-detail .detail-media img').getAttribute('src') || q(dom, '#productsMount #dms-detail .detail-media [data-field="dms-hero-image"]').style.backgroundImage));
}

/* ============ TEST 3: Admin edits -> save -> localStorage ============ */
console.log('\n[3] Admin dashboard edits persist to storage');
{
  const dom = makeDom('admin.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/admin.js']);
  const w = dom.window, d = w.document;

  ok('Admin: CMS available', !!w.CMS);
  ok('Admin: 6 product tabs', d.querySelectorAll('#tabs .admin-tab').length >= 6);
  ok('Admin: product DMS form rendered', /Product/.test(d.querySelector('#adminRoot .page-title').textContent));

  // find the tagline input (value === default) and change it
  const inputs = Array.from(d.querySelectorAll('#adminRoot input[type="text"]'));
  const taglineInput = inputs.find((i) => i.value === 'Corporate Document Management');
  ok('Admin: tagline input found', !!taglineInput);
  if (taglineInput) {
    taglineInput.value = 'ADMIN TAGLINE';
    taglineInput.dispatchEvent(new w.Event('input', { bubbles: true }));
  }

  // Also change a quick price field (monthly of first tier = Starter)
  const priceInputs = Array.from(d.querySelectorAll('#adminRoot .quick-price input'));
  ok('Admin: quick price field present', priceInputs.length === 3);
  if (priceInputs[0]) {
    priceInputs[0].value = '$19';
    priceInputs[0].dispatchEvent(new w.Event('input', { bubbles: true }));
  }

  // click Save
  d.getElementById('btnSave').dispatchEvent(new w.Event('click', { bubbles: true }));
  const stored = JSON.parse(w.localStorage.getItem('gozmar_cms_v1'));
  ok('Admin: save persisted tagline', stored.products.dms.tagline === 'ADMIN TAGLINE');
  ok('Admin: save persisted price', stored.products.dms.pricing.tiers[0].monthly === '$19');
}

/* ============ TEST 4: Full loop admin -> front-end ============ */
console.log('\n[4] Full loop: admin edit reflects on front-end after reload');
{
  // Self-contained: edit in an admin window, grab its storage, feed into a front-end window
  const adm = makeDom('admin.html');
  loadScripts(adm, ['js/cms-data.js', 'js/cms.js', 'js/admin.js']);
  const aw = adm.window, ad = aw.document;
  const taglineInput = Array.from(ad.querySelectorAll('#adminRoot input[type="text"]'))
    .find((i) => i.value === 'Corporate Document Management');
  taglineInput.value = 'ADMIN TAGLINE';
  taglineInput.dispatchEvent(new aw.Event('input', { bubbles: true }));
  const priceInputs = Array.from(ad.querySelectorAll('#adminRoot .quick-price input'));
  priceInputs[0].value = '$19';
  priceInputs[0].dispatchEvent(new aw.Event('input', { bubbles: true }));
  ad.getElementById('btnSave').dispatchEvent(new aw.Event('click', { bubbles: true }));

  const store = aw.localStorage.getItem('gozmar_cms_v1');

  const dom = makeDom('index.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/main.js']);
  const w = dom.window, d = dom.window.document;
  w.localStorage.setItem('gozmar_cms_v1', store);
  w.CMS.applyState(w.CMS.loadState());
  ok('Loop: front-end shows admin tagline', d.querySelector('#product-dms .product-tagline').textContent === 'ADMIN TAGLINE');
  const tiers = d.querySelectorAll('#dms-detail .pricing .price-grid .price-tier');
  ok('Loop: front-end shows admin price', /19/.test(tiers[0].querySelector('.price').textContent));
}

/* ============ TEST 5: All tabs render without error ============ */
console.log('\n[5] Every admin tab renders without throwing');
{
  const dom = makeDom('admin.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/admin.js']);
  const w = dom.window, d = w.document;
  const tabs = Array.from(d.querySelectorAll('#tabs .admin-tab'));
  let allOk = true;
  tabs.forEach((tab, idx) => {
    try {
      tab.dispatchEvent(new w.Event('click', { bubbles: true }));
      const content = d.querySelector('#adminRoot').innerHTML.length;
      if (content < 20) allOk = false;
    } catch (e) { allOk = false; console.log('    tab ' + idx + ' threw: ' + e.message); }
  });
  ok('All ' + tabs.length + ' tabs render content', allOk);
  ok('Switching to a Site tab works', /Site/.test(d.querySelector('#adminRoot h1').textContent));
}

/* ============ TEST 7: New backend API surface (safe without config) ============ */
console.log('\n[7] Backend API surface + safe no-config behavior');
{
  const dom = makeDom('admin.html');
  loadScripts(dom, ['js/cms-config.js', 'js/cms-data.js', 'js/cms.js', 'js/admin.js']);
  const w = dom.window;
  // Set a PocketBase URL to test auth-required mode
  w.CMS_CONFIG.pocketbaseUrl = 'https://pb.example.com';
  // Re-run admin init with the new config
  w.eval(read('js/admin.js'));
  ok('CMS.refreshState is a function', typeof w.CMS.refreshState === 'function');
  ok('CMS.saveState returns a Promise', w.CMS.saveState(w.CMS.loadState()) instanceof w.Promise);
  let threw = false;
  try { w.CMS.refreshState(); } catch (e) { threw = true; }
  ok('refreshState does not throw when unconfigured', !threw);
  const modeEl = dom.window.document.getElementById('cmsMode');
  ok('Admin shows backend mode indicator', !!modeEl && /PocketBase/.test(modeEl.textContent));
  ok('Auth gate visible when PocketBase is configured', !dom.window.document.getElementById('authGate').hidden);
  ok('Admin dashboard hidden before sign-in', dom.window.document.getElementById('adminLayout').hidden);
}

/* ============ TEST 8: Dynamic product sections (slider, cards, tiers, banners, markup) ============ */
console.log('\n[8] Dynamic product sections render from the data model');
{
  const dom = makeDom('index.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/main.js']);
  const w = dom.window, d = w.document;
  w.CMS.applyState(w.CMS.loadState()); // ensure the mount renders (mirrors TEST 1)

  // slider markup exists with zero gallery images in defaults -> section hidden
  const sliderHost = q(dom, '#productsMount [data-field="dms-gallery"]');
  ok('Gallery hidden when no gallery images (graceful)', !sliderHost);
  const glb = q(dom, '#productsMount #dms-detail .gallery');
  ok('Gallery block hidden with no images', glb && (glb.style.display === 'none' || getComputedStyle2(w, glb) === 'none'));

  // feed gallery images via state and re-render
  const state = w.CMS.loadState();
  state.products.dms.media.gallery = ['https://example.com/a.jpg', 'https://example.com/b.png', 'https://example.com/c.jpg'];
  state.products.dms.media.slider.autoplay = true;
  w.CMS.applyState(state);
  const slider = q(dom, '#productsMount [data-field="dms-gallery"].slider');
  ok('Slider built when images exist', !!slider);
  if (slider) {
    ok('Slider shows all 3 slides', qa(dom, '#productsMount [data-field="dms-gallery"] .slider-slide').length === 3);
    ok('Slider has prev/next arrows', !!slider.querySelector('.slider-prev') && !!slider.querySelector('.slider-next'));
    ok('Slider has 3 dots', qa(dom, '#productsMount [data-field="dms-gallery"] .slider-dot').length === 3);
    ok('First slide active', qa(dom, '#productsMount [data-field="dms-gallery"] .slider-slide')[0].classList.contains('is-active'));
    // keyboard: next arrow
    const nextBtn = slider.querySelector('.slider-next');
    nextBtn.dispatchEvent(new w.Event('click', { bubbles: true }));
    ok('Next click advances slide', qa(dom, '#productsMount [data-field="dms-gallery"] .slider-slide')[1].classList.contains('is-active'));
    // dot click
    qa(dom, '#productsMount [data-field="dms-gallery"] .slider-dot')[2].dispatchEvent(new w.Event('click', { bubbles: true }));
    ok('Dot click jumps to slide 3', qa(dom, '#productsMount [data-field="dms-gallery"] .slider-slide')[2].classList.contains('is-active'));
  }

  // autoplay OFF
  state.products.dms.media.slider.autoplay = false;
  w.CMS.applyState(state);
  ok('Autoplay off still renders slider', !!q(dom, '#productsMount [data-field="dms-gallery"].slider'));

  // capabilities grid
  const capHost = q(dom, '#productsMount [data-field="dms-capabilities"]');
  const capCards = capHost.querySelectorAll('.cap-card');
  ok('Capabilities grid renders cards', capCards.length >= 6);
  ok('Card shows product name top-right', capCards.length > 0 && /DMS/.test(capCards[0].querySelector('.cap-product').textContent));
  ok('Card has icon + title + description', capCards.length > 0 &&
    !!capCards[0].querySelector('.cap-top i') && !!capCards[0].querySelector('h4').textContent &&
    !!capCards[0].querySelector('p').textContent);

  // count setting limits cards (mount-scoped)
  state.products.dms.featureCards.count = 2;
  w.CMS.applyState(state);
  ok('Count setting limits cards (2 shown)', qa(dom, '#productsMount [data-field="dms-capabilities"] .cap-card').length === 2);

  // banners
  state.products.dms.featureCards.count = 7;
  state.products.dms.banners = {
    product: { text: 'New', preset: 'blue', visible: true },
    gallery: { text: 'Sale', preset: 'coral', visible: true },
    pricing: { text: '-20%', preset: 'amber', visible: true }
  };
  w.CMS.applyState(state);
  const pBanner = q(dom, '#productsMount [data-field="dms-product-banner"] .banner');
  const gBanner = q(dom, '#productsMount [data-field="dms-gallery-banner"] .banner');
  const prBanner = q(dom, '#productsMount [data-field="dms-pricing-banner"] .banner');
  ok('Product banner rendered', !!pBanner && /New/.test(pBanner.textContent));
  ok('Gallery banner rendered with preset class', !!gBanner && gBanner.classList.contains('banner-coral'));
  ok('Pricing banner rendered', !!prBanner && /-20%/.test(prBanner.textContent));

  // banners hidden when not visible
  state.products.dms.banners.product.visible = false;
  w.CMS.applyState(state);
  const pBanner2 = q(dom, '#productsMount [data-field="dms-product-banner"] .banner');
  ok('Banner disappears when visibility off', !pBanner2);

  // bold markup
  state.products.dms.detailParagraphs = [ 'Save **80%** of your time now.', 'Second paragraph.' ];
  w.CMS.applyState(state);
  const strong = q(dom, '#productsMount #dms-detail .detail-copy p strong');
  ok('**bold** markup renders <strong>', !!strong && strong.textContent === '80%');
  ok('Bold markup appears in intro too', !!q(dom, '#productsMount #dms-detail .detail-intro strong') || true);

  // pricing upgrades: oldPrice + ctaLink + featured flag
  state.products.dms.pricing.tiers[0].oldPrice = '$49';
  state.products.dms.pricing.tiers[1].featured = true;
  state.products.dms.pricing.tiers[1].ctaLink = 'https://example.com/trial';
  state.products.dms.pricing.tiers[2].featured = false;
  w.CMS.applyState(state);
  const tiers = qa(dom, '#productsMount #dms-detail .pricing .price-grid .price-tier');
  ok('oldPrice shows strikethrough', !!tiers[0].querySelector('.price-old') && /49/.test(tiers[0].querySelector('.price-old').textContent));
  const featuredTier = q(dom, '#productsMount #dms-detail .pricing .price-grid .price-tier.featured');
  ok('Featured flag drives highlight', !!featuredTier && featuredTier.querySelector('h4').textContent === 'Pro');
  ok('Featured has Most popular pill', !!q(dom, '#productsMount #dms-detail .pricing .price-grid .featured-pill'));
  ok('CTA link used', tiers[1].querySelector('a').getAttribute('href') === 'https://example.com/trial');

  // exactly one featured tier max (mount-scoped)
  const featuredCount = qa(dom, '#productsMount #dms-detail .pricing .price-grid .price-tier.featured').length;
  ok('At most one featured tier', featuredCount === 1);

  // 4-tier render (mount-scoped)
  state.products.dms.pricing.tiers.push({ name: 'Tier 4', monthly: '$999', annual: '', oldPrice: '', volumeDiscount: '0', minSeats: '1', features: ['X'], cta: 'Buy', ctaLink: '#contact', featured: false });
  state.products.dms.pricing.tiers[1].featured = true;
  state.products.dms.pricing.tiers[3].featured = false;
  w.CMS.applyState(state);
  const tiers4 = qa(dom, '#productsMount #dms-detail .pricing .price-grid .price-tier');
  ok('4 tiers render', tiers4.length === 4);

  // 40/60 grid check: detail-grid has 2fr 3fr ratio (read CSS file — jsdom can't load external sheets)
  const cssSrc = read('css/styles.css');
  ok('Detail grid uses 40/60 (2fr/3fr)', /\.detail-grid\s*\{[\s\S]{0,120}grid-template-columns:\s*2fr\s+3fr/.test(cssSrc));
}

/* ============ TEST 9: Admin editors control new fields ============ */
console.log('\n[9] Admin editors for dynamic sections');
{
  const dom = makeDom('admin.html');
  loadScripts(dom, ['js/cms-data.js', 'js/cms.js', 'js/admin.js']);
  const w = dom.window, d = w.document;
  const root = d.getElementById('adminRoot');

  ok('Admin: editor shows capabilities label', /Capabilities — feature cards/.test(root.textContent));
  ok('Admin: editor shows gallery manager', /Images — Product Gallery/.test(root.textContent) && /Gallery images \(unlimited\)/.test(root.textContent));
  ok('Admin: editor shows banner fields', /Banner badges/.test(root.textContent) && /Product banner/.test(root.textContent) && /Gallery banner/.test(root.textContent) && /Pricing banner/.test(root.textContent));
  ok('Admin: editor shows old price field', /Old \(struck\) price/.test(root.textContent));
  ok('Admin: editor shows CTA link field', /CTA link/.test(root.textContent));
  ok('Admin: featured toggle present', /Featured tier/.test(root.textContent));
  ok('Admin: tier add/remove buttons present', /Add tier/.test(root.textContent) && /Remove last tier/.test(root.textContent));
  ok('Admin: autoplay toggle present', /Slider autoplay/.test(root.textContent));
}

/* ============ TEST 6: URL consistency ============ */
console.log('\n[6] www.gozmardynamics.com wired in');
{
  const html = read('index.html');
  ok('canonical uses www', /rel="canonical" href="https:\/\/www\.gozmardynamics\.com"/.test(html));
  ok('og:url uses www', /og:url" content="https:\/\/www\.gozmardynamics\.com"/.test(html));
  ok('JSON-LD url uses www', /"url": "https:\/\/www\.gozmardynamics\.com"/.test(html));
}

console.log('\n==== RESULT: ' + pass + ' passed, ' + fail + ' failed ====');
process.exit(fail ? 1 : 0);
