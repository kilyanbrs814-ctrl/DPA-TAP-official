/* DPA TAP — theme.js (vanilla, no deps) */
(function () {
  'use strict';
  var RMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return RMQ.matches; }
  var DPA = window.DPA || {};
  var routes = DPA.routes || { cartAdd: '/cart/add.js', cart: '/cart', cartJs: '/cart.js' };
  var EASE = 'cubic-bezier(.2,.8,.2,1)';

  /* ---------- helpers (Shopify editor safe) ---------- */
  function qsa(scope, sel) {
    var list = Array.prototype.slice.call((scope || document).querySelectorAll(sel));
    if (scope && scope !== document && scope.matches && scope.matches(sel)) list.unshift(scope);
    return list;
  }
  function guard(el, key) {
    key = 'dpa' + key;
    if (el.dataset[key]) return false;
    el.dataset[key] = '1';
    return true;
  }
  function onCleanup(el, fn) {
    (el.__dpaCleanups = el.__dpaCleanups || []).push(fn);
  }
  function cleanupWithin(rootEl) {
    qsa(rootEl, '*').concat([rootEl]).forEach(function (el) {
      if (el.__dpaCleanups) {
        el.__dpaCleanups.forEach(function (fn) { try { fn(); } catch (e) { /* noop */ } });
        el.__dpaCleanups = null;
      }
    });
  }
  function swapIn(el) {
    if (!el || reduced() || !el.animate) return;
    el.animate(
      [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 260, easing: EASE }
    );
  }

  /* ---------- Header ---------- */
  function initHeader(scope) {
    qsa(scope, '[data-header]').forEach(function (header) {
      if (!guard(header, 'Header')) return;
      var heroEl = document.querySelector('.hero');
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
        var limit = heroEl ? heroEl.offsetTop + heroEl.offsetHeight - 80 : 40;
        header.classList.toggle('is-visible', window.scrollY > limit);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onCleanup(header, function () { window.removeEventListener('scroll', onScroll); });
      onScroll();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals(scope) {
    var els = qsa(scope, '.reveal');
    if (!els.length) return;
    if (reduced() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { if (guard(el, 'Reveal')) rio.observe(el); });
  }

  /* ---------- Hero parallax ---------- */
  function initHeroParallax(scope) {
    qsa(scope, '.hero').forEach(function (hero) {
      if (!guard(hero, 'Parallax')) return;
      var img = hero.querySelector('.hero-bg img');
      if (!img || reduced() || !('IntersectionObserver' in window)) return;
      var visible = false, rafId = null;
      function frame() {
        if (!visible) { rafId = null; img.style.transform = ''; return; }
        var r = hero.getBoundingClientRect();
        var h = r.height || 1;
        var p = Math.min(1, Math.max(0, -r.top / h));
        img.style.transform = 'translate3d(0,' + (p * h * 0.05).toFixed(1) + 'px,0) scale(1.08)';
        rafId = requestAnimationFrame(frame);
      }
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && rafId === null) rafId = requestAnimationFrame(frame);
      });
      io.observe(hero);
      onCleanup(hero, function () { io.disconnect(); visible = false; });
    });
  }

  /* ---------- Scrollytelling ---------- */
  function initScrolly(scope) {
    qsa(scope, '[data-scrolly]').forEach(function (root) {
      if (!guard(root, 'Scrolly')) return;
      if (reduced() || !('IntersectionObserver' in window)) { root.classList.add('is-static'); return; }
      var stage = root.querySelector('.scrolly-stage');
      var steps = root.querySelectorAll('[data-step]');
      var track = root.querySelector('.scrolly-track');
      if (!stage || !track) return;
      var active = false, rafId = null;
      function frame() {
        if (!active) { rafId = null; return; }
        var r = track.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        var v = p.toFixed(4);
        root.style.setProperty('--p', v);
        stage.style.setProperty('--p', v);
        var phase = p < 1 / 3 ? 1 : p < 2 / 3 ? 2 : 3;
        if (stage.dataset.phase !== String(phase)) {
          stage.dataset.phase = phase;
          steps.forEach(function (el, i) {
            el.classList.toggle('is-active', i === phase - 1);
            el.classList.toggle('is-done', i < phase - 1);
          });
        }
        rafId = requestAnimationFrame(frame);
      }
      var io = new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active && rafId === null) rafId = requestAnimationFrame(frame);
      }, { rootMargin: '20% 0px 20% 0px' });
      io.observe(root);
      onCleanup(root, function () { io.disconnect(); active = false; });
    });
  }

  /* ---------- Spotlight (élément courant dans une liste) ---------- */
  function initSpotlight(scope) {
    qsa(scope, '[data-spotlight]').forEach(function (list) {
      if (!guard(list, 'Spot')) return;
      var items = Array.prototype.slice.call(list.children);
      if (!items.length || !('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            items.forEach(function (el) { el.classList.toggle('is-current', el === e.target); });
          }
        });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      items.forEach(function (el) { io.observe(el); });
      onCleanup(list, function () { io.disconnect(); });
    });
  }

  /* ---------- FAQ (ouverture/fermeture animée, <details> conservé) ---------- */
  function initFaq(scope) {
    qsa(scope, '.faq-item').forEach(function (d) {
      if (!guard(d, 'Faq')) return;
      var summary = d.querySelector('summary');
      var body = d.querySelector('.faq-body');
      if (!summary || !body || !body.animate) return;
      var anim = null;
      summary.addEventListener('click', function (ev) {
        if (reduced()) return; /* comportement natif */
        ev.preventDefault();
        if (anim) { anim.cancel(); anim = null; }
        if (d.open) {
          var h = body.offsetHeight;
          body.style.overflow = 'hidden';
          anim = body.animate(
            [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
            { duration: 260, easing: EASE }
          );
          anim.onfinish = function () { d.open = false; body.style.overflow = ''; anim = null; };
        } else {
          d.open = true;
          var h2 = body.offsetHeight;
          body.style.overflow = 'hidden';
          anim = body.animate(
            [{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }],
            { duration: 300, easing: EASE }
          );
          anim.onfinish = function () { body.style.overflow = ''; anim = null; };
        }
      });
    });
  }

  /* ---------- Money ---------- */
  function money(cents) {
    var fmt = DPA.moneyFormat || '{{amount_with_comma_separator}} €';
    var n = (cents / 100);
    var comma = n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    var dot = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fmt
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, comma)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, String(Math.round(n)))
      .replace(/\{\{\s*amount\s*\}\}/g, dot);
  }

  /* ---------- Cart count ---------- */
  function setCount(n, initial) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      var prev = el.textContent;
      el.textContent = n;
      el.hidden = !n;
      if (!initial && !el.hidden && prev !== String(n) && !reduced()) {
        el.classList.remove('is-bump');
        void el.offsetWidth;
        el.classList.add('is-bump');
      }
    });
  }

  /* ---------- Buy form ---------- */
  function initBuyForms(scope) {
    qsa(scope, '[data-buy]').forEach(function (root) {
      if (!guard(root, 'Buy')) return;
      var dataEl = root.querySelector('[data-variants]');
      var form = root.querySelector('form[data-product-form]');
      if (!dataEl || !form) return;
      var variants = [];
      try { variants = JSON.parse(dataEl.textContent); } catch (e) { return; }
      var idInput = form.querySelector('[data-variant-id]');
      var priceEl = root.querySelector('[data-price]');
      var compareEl = root.querySelector('[data-compare-price]');
      var availEl = root.querySelector('[data-availability]');
      var imgEl = root.querySelector('[data-buy-image]');
      var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-buy-thumb]'));
      var btn = form.querySelector('[data-add-btn]');
      var btnLabel = btn ? btn.querySelector('.label') : null;
      var errEl = root.querySelector('[data-form-error]');
      var okEl = root.querySelector('[data-form-success]');
      var addedTimer = null;

      function imageKey(src) {
        if (!src) return '';
        try {
          var url = new URL(src, window.location.href);
          url.searchParams.delete('width');
          return url.origin + url.pathname + url.search;
        } catch (e) {
          return src.split('?')[0];
        }
      }

      function setActiveThumb(imageId, src) {
        var id = imageId ? String(imageId) : '';
        var key = imageKey(src);
        var activeThumb = null;
        if (id) {
          activeThumb = thumbs.find(function (thumb) { return thumb.dataset.imageId === id; });
        }
        if (!activeThumb && key) {
          activeThumb = thumbs.find(function (thumb) { return imageKey(thumb.dataset.imageSrc) === key; });
        }
        thumbs.forEach(function (thumb) {
          var active = thumb === activeThumb;
          thumb.classList.toggle('is-active', active);
          thumb.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }

      function select(v, card) {
        if (!v) return;
        idInput.value = v.id;
        if (priceEl) {
          var newPrice = money(v.price);
          if (priceEl.textContent !== newPrice) { priceEl.textContent = newPrice; swapIn(priceEl); }
        }
        if (compareEl) {
          var has = v.compare_at_price && v.compare_at_price > v.price;
          compareEl.hidden = !has;
          if (has) compareEl.textContent = money(v.compare_at_price);
        }
        if (availEl) {
          var newAvail = v.available ? availEl.dataset.inStock : availEl.dataset.outStock;
          availEl.classList.toggle('is-out', !v.available);
          if (availEl.textContent.trim() !== newAvail) { availEl.textContent = newAvail; swapIn(availEl); }
        }
        if (imgEl) {
          var src = v.featured_image && (v.featured_image.src || v.featured_image.url);
          if (!src && card && card.dataset.image) src = card.dataset.image;
          if (src) {
            imgEl.removeAttribute('srcset');
            imgEl.src = src;
            if (!reduced() && imgEl.animate) {
              imgEl.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 420, easing: 'ease' });
            }
            setActiveThumb(v.featured_image && v.featured_image.id, src);
          }
        }
        if (btn) {
          btn.disabled = !v.available;
          if (btnLabel) btnLabel.textContent = v.available ? btn.dataset.labelAdd : btn.dataset.labelSoldOut;
        }
        root.querySelectorAll('.vcard').forEach(function (c) {
          c.classList.toggle('is-active', c.querySelector('input') && c.querySelector('input').checked);
        });
      }
      root.querySelectorAll('[data-variant-radio]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          var v = variants.find(function (x) { return String(x.id) === radio.value; });
          select(v, radio.closest('.vcard'));
        });
      });

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          if (!imgEl || !thumb.dataset.imageSrc) return;
          imgEl.removeAttribute('srcset');
          imgEl.src = thumb.dataset.imageSrc;
          if (thumb.dataset.imageAlt) imgEl.alt = thumb.dataset.imageAlt;
          setActiveThumb(thumb.dataset.imageId, thumb.dataset.imageSrc);
          if (!reduced() && imgEl.animate) {
            imgEl.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 300, easing: EASE });
          }
        });
      });

      root.querySelectorAll('[data-qty]').forEach(function (q) {
        var input = q.querySelector('input');
        q.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var d = b.dataset.dir === 'up' ? 1 : -1;
            input.value = Math.max(1, (parseInt(input.value, 10) || 1) + d);
          });
        });
      });

      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (errEl) errEl.hidden = true;
        if (okEl) okEl.hidden = true;
        if (btn) { btn.classList.remove('is-shake', 'is-added'); btn.classList.add('is-loading'); }
        fetch(routes.cartAdd, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: new FormData(form)
        }).then(function (res) {
          return res.json().then(function (json) {
            if (!res.ok) throw new Error(json.description || json.message || 'Impossible d’ajouter au panier.');
            return json;
          });
        }).then(function () {
          return fetch(routes.cartJs).then(function (r) { return r.json(); });
        }).then(function (cart) {
          setCount(cart.item_count);
          if (okEl) { okEl.hidden = false; }
          if (btn) {
            btn.classList.add('is-added');
            if (addedTimer) clearTimeout(addedTimer);
            addedTimer = setTimeout(function () { btn.classList.remove('is-added'); }, 2000);
          }
        }).catch(function (err) {
          if (errEl) { errEl.textContent = err.message; errEl.hidden = false; }
          if (btn && !reduced()) {
            btn.classList.remove('is-shake');
            void btn.offsetWidth;
            btn.classList.add('is-shake');
          }
        }).finally(function () {
          if (btn) btn.classList.remove('is-loading');
        });
      });
    });
  }

  /* ---------- Boot + éditeur Shopify ---------- */
  function initAll(scope) {
    initHeader(scope);
    initReveals(scope);
    initHeroParallax(scope);
    initScrolly(scope);
    initSpotlight(scope);
    initFaq(scope);
    initBuyForms(scope);
  }
  initAll(document);
  if (typeof DPA.cartCount === 'number') setCount(DPA.cartCount, true);
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:unload', function (e) { cleanupWithin(e.target); });
})();
