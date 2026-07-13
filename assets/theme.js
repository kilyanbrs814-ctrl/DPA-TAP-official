/* DPA TAP — theme.js (vanilla, no deps) */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPA = window.DPA || {};
  var routes = DPA.routes || { cartAdd: '/cart/add.js', cart: '/cart', cartJs: '/cart.js' };

  /* ---------- Header ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var heroEl = document.querySelector('.hero');
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
      var limit = heroEl ? heroEl.offsetTop + heroEl.offsetHeight - 80 : 40;
      header.classList.toggle('is-visible', window.scrollY > limit);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (RM || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      reveals.forEach(function (el) { rio.observe(el); });
    }
  }

  /* ---------- Scrollytelling ---------- */
  document.querySelectorAll('[data-scrolly]').forEach(function (root) {
    if (RM || !('IntersectionObserver' in window)) { root.classList.add('is-static'); return; }
    var stage = root.querySelector('.scrolly-stage');
    var steps = root.querySelectorAll('[data-step]');
    var track = root.querySelector('.scrolly-track');
    var active = false, rafId = null;
    function frame() {
      if (!active) { rafId = null; return; }
      var r = track.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      stage.style.setProperty('--p', p.toFixed(4));
      var phase = p < 1 / 3 ? 1 : p < 2 / 3 ? 2 : 3;
      if (stage.dataset.phase !== String(phase)) {
        stage.dataset.phase = phase;
        steps.forEach(function (el, i) { el.classList.toggle('is-active', i === phase - 1); });
      }
      rafId = requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active && rafId === null) rafId = requestAnimationFrame(frame);
    }, { rootMargin: '20% 0px 20% 0px' }).observe(root);
  });

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
  function setCount(n) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.hidden = !n;
    });
  }
  if (typeof DPA.cartCount === 'number') setCount(DPA.cartCount);

  /* ---------- Buy form ---------- */
  document.querySelectorAll('[data-buy]').forEach(function (root) {
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
    var btn = form.querySelector('[data-add-btn]');
    var btnLabel = btn ? btn.querySelector('.label') : null;
    var errEl = root.querySelector('[data-form-error]');
    var okEl = root.querySelector('[data-form-success]');

    function select(v, card) {
      if (!v) return;
      idInput.value = v.id;
      if (priceEl) priceEl.textContent = money(v.price);
      if (compareEl) {
        var has = v.compare_at_price && v.compare_at_price > v.price;
        compareEl.hidden = !has;
        if (has) compareEl.textContent = money(v.compare_at_price);
      }
      if (availEl) {
        availEl.classList.toggle('is-out', !v.available);
        availEl.textContent = v.available ? availEl.dataset.inStock : availEl.dataset.outStock;
      }
      if (imgEl) {
        var src = v.featured_image && (v.featured_image.src || v.featured_image.url);
        if (!src && card && card.dataset.image) src = card.dataset.image;
        if (src) { imgEl.removeAttribute('srcset'); imgEl.src = src; }
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
      if (btn) btn.classList.add('is-loading');
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
        if (okEl) okEl.hidden = false;
      }).catch(function (err) {
        if (errEl) { errEl.textContent = err.message; errEl.hidden = false; }
      }).finally(function () {
        if (btn) btn.classList.remove('is-loading');
      });
    });
  });
})();
