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
      var scrollRaf = null;
      var menu = header.querySelector('.hdr-menu');
      var updateHeader = function () {
        scrollRaf = null;
        header.classList.toggle('is-scrolled', window.scrollY > 40);
      };
      var onScroll = function () {
        if (scrollRaf === null) scrollRaf = requestAnimationFrame(updateHeader);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      var closeMenu = function (ev) {
        if (!menu || !menu.open) return;
        if (ev.type === 'keydown' && ev.key !== 'Escape') return;
        if (ev.type === 'click' && menu.contains(ev.target) && !ev.target.closest('a')) return;
        menu.open = false;
        if (ev.type === 'keydown') menu.querySelector('summary').focus();
      };
      if (menu) {
        document.addEventListener('click', closeMenu);
        document.addEventListener('keydown', closeMenu);
      }
      onCleanup(header, function () {
        window.removeEventListener('scroll', onScroll);
        if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
        if (menu) {
          document.removeEventListener('click', closeMenu);
          document.removeEventListener('keydown', closeMenu);
        }
      });
      updateHeader();
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
      if (!img || reduced() || window.matchMedia('(max-width: 900px)').matches || !('IntersectionObserver' in window)) return;
      var visible = false, rafId = null;
      function frame() {
        rafId = null;
        if (!visible) { img.style.transform = ''; return; }
        var r = hero.getBoundingClientRect();
        var h = r.height || 1;
        var p = Math.min(1, Math.max(0, -r.top / h));
        img.style.transform = 'translate3d(0,' + (p * h * 0.05).toFixed(1) + 'px,0) scale(1.08)';
      }
      function queue() { if (visible && rafId === null) rafId = requestAnimationFrame(frame); }
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) queue();
        else img.style.transform = '';
      });
      io.observe(hero);
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue, { passive: true });
      onCleanup(hero, function () {
        io.disconnect();
        visible = false;
        window.removeEventListener('scroll', queue);
        window.removeEventListener('resize', queue);
        if (rafId !== null) cancelAnimationFrame(rafId);
      });
    });
  }

  /* ---------- Scrollytelling ---------- */
  function initScrolly(scope) {
    qsa(scope, '[data-scrolly]').forEach(function (root) {
      if (!guard(root, 'Scrolly')) return;
      if (reduced() || window.matchMedia('(max-width: 900px) and (max-height: 560px)').matches || !('IntersectionObserver' in window)) { root.classList.add('is-static'); return; }
      root.classList.remove('is-begun');
      var stage = root.querySelector('.scrolly-stage');
      var steps = root.querySelectorAll('[data-step]');
      var track = root.querySelector('.scrolly-track');
      if (!stage || !track) return;
      var active = false, rafId = null;
      function frame() {
        rafId = null;
        if (!active) return;
        var r = track.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        var v = p.toFixed(4);
        root.style.setProperty('--p', v);
        stage.style.setProperty('--p', v);
        root.classList.toggle('is-begun', p > 0.05);
        var phase = p < 1 / 3 ? 1 : p < 2 / 3 ? 2 : 3;
        if (stage.dataset.phase !== String(phase)) {
          stage.dataset.phase = phase;
          steps.forEach(function (el, i) {
            el.classList.toggle('is-active', i === phase - 1);
            el.classList.toggle('is-done', i < phase - 1);
          });
        }
      }
      function queue() { if (active && rafId === null) rafId = requestAnimationFrame(frame); }
      var io = new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active) queue();
      }, { rootMargin: '20% 0px 20% 0px' });
      io.observe(root);
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue, { passive: true });
      onCleanup(root, function () {
        io.disconnect();
        active = false;
        window.removeEventListener('scroll', queue);
        window.removeEventListener('resize', queue);
        if (rafId !== null) cancelAnimationFrame(rafId);
      });
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

      /* Pack — 14,50 € de remise sur 2 plaques. Doit correspondre à la réduction
         automatique Shopify « Pack 2 plaques : -14,50 € » (min. 2 articles). La livraison
         n'en fait pas partie : elle est gratuite pour toute la France via les profils
         d'expédition, quelle que soit la quantité. */
      var PACK_DISCOUNT = 1450;
      var duoEls = Array.prototype.slice.call(root.querySelectorAll('[data-pack-duo]'));
      var singleEls = Array.prototype.slice.call(root.querySelectorAll('[data-pack-single]'));
      var packPrice1 = root.querySelector('[data-pack-price="1"]');
      var packPrice2 = root.querySelector('[data-pack-price="2"]');

      function getVariant(id) {
        return variants.find(function (x) { return String(x.id) === String(id); });
      }
      function packMode() {
        var r = form.querySelector('[data-pack-radio]:checked');
        return r && r.value === '2' ? 2 : 1;
      }
      function selectedCombo() {
        return form.querySelector('[data-combo]:checked');
      }
      function plaqueVariant(i) {
        var combo = selectedCombo();
        var v = combo && getVariant(combo.dataset['v' + i]);
        return v || getVariant(idInput.value);
      }
      /* Pack — même établissement pour les deux plaques ou deux différents. T050.
         « same » : seul le panneau Plaque 1 reste visible/actif, ses champs sont
         réutilisés pour la seconde ligne à l'ajout. Le panneau 2 est masqué ET ses
         champs désactivés pour sortir de la validation HTML5. */
      function packScope() {
        var r = form.querySelector('[data-scope]:checked');
        return r ? r.value : 'same';
      }
      function applyScope() {
        if (packMode() !== 2) return;
        var same = packScope() === 'same';
        var panel2 = form.querySelector('[data-plaque-panel="2"]');
        if (panel2) {
          panel2.hidden = same;
          Array.prototype.slice.call(panel2.querySelectorAll('input,textarea,select')).forEach(function (f) {
            f.disabled = same || f.hasAttribute('data-unavailable');
          });
        }
        var title1 = form.querySelector('[data-plaque-title="1"]');
        if (title1) title1.textContent = same ? 'Votre établissement' : 'Plaque 1';
      }
      function setMainImage(src, imageId) {
        if (!imgEl || !src) return;
        imgEl.removeAttribute('srcset');
        imgEl.src = src;
        if (!reduced() && imgEl.animate) {
          imgEl.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 420, easing: 'ease' });
        }
        setActiveThumb(imageId, src);
      }
      function cardImage(card) {
        if (!card) return '';
        if (window.matchMedia('(max-width: 560px)').matches && card.dataset.imageMobile) return card.dataset.imageMobile;
        return card.dataset.image || '';
      }
      function setImage(v, card) {
        if (!v) return;
        var src = v.featured_image && (v.featured_image.src || v.featured_image.url);
        if (!src) src = cardImage(card);
        if (src) setMainImage(src, v.featured_image && v.featured_image.id);
      }
      function setPrice(cents, compareCents) {
        if (priceEl) {
          var newPrice = money(cents);
          if (priceEl.textContent !== newPrice) { priceEl.textContent = newPrice; swapIn(priceEl); }
        }
        if (compareEl) {
          var has = compareCents && compareCents > cents;
          compareEl.hidden = !has;
          if (has) compareEl.textContent = money(compareCents);
        }
      }
      function setAvail(ok) {
        if (availEl) {
          var newAvail = ok ? availEl.dataset.inStock : availEl.dataset.outStock;
          availEl.classList.toggle('is-out', !ok);
          if (availEl.textContent.trim() !== newAvail) { availEl.textContent = newAvail; swapIn(availEl); }
        }
        if (btn) {
          btn.disabled = !ok;
        }
      }
      /* CTA dynamique — le libellé porte l'offre choisie et son prix (depuis les
         données variantes Shopify, jamais codé en dur). T052. */
      function setBtn(mode, cents, ok) {
        if (!btn || !btnLabel) return;
        if (!ok) { btnLabel.textContent = btn.dataset.labelSoldOut; return; }
        var base = mode === 2 ? btn.dataset.labelAddPack : btn.dataset.labelAddSingle;
        btnLabel.textContent = base + ' — ' + money(cents);
      }
      function refresh() {
        if (packMode() === 2) {
          var v1 = plaqueVariant(1), v2 = plaqueVariant(2);
          if (!v1 || !v2) return;
          var total = v1.price + v2.price;
          setPrice(total - PACK_DISCOUNT, total);
          setAvail(v1.available && v2.available);
          setBtn(2, total - PACK_DISCOUNT, v1.available && v2.available);
        } else {
          var v = getVariant(idInput.value);
          if (!v) return;
          setPrice(v.price, v.compare_at_price);
          setAvail(v.available);
          setBtn(1, v.price, v.available);
        }
      }
      function syncCards() {
        root.querySelectorAll('.vcard').forEach(function (c) {
          var input = c.querySelector('input');
          c.classList.toggle('is-active', !!(input && input.checked));
        });
      }
      function setGroupHidden(el, hide) {
        el.hidden = hide;
        Array.prototype.slice.call(el.querySelectorAll('input,textarea,select')).forEach(function (field) {
          field.disabled = hide || field.hasAttribute('data-unavailable');
        });
        if (!hide) swapIn(el);
      }
      function setMode() {
        var mode = packMode();
        singleEls.forEach(function (el) { setGroupHidden(el, mode === 2); });
        duoEls.forEach(function (el) { setGroupHidden(el, mode !== 2); });
        var combo = selectedCombo();
        if (mode === 2 && (!combo || combo.disabled)) {
          combo = form.querySelector('[data-combo]:not([disabled])');
          if (combo) combo.checked = true;
        }
        syncCards();
        root.querySelectorAll('.pack').forEach(function (c) {
          var input = c.querySelector('input');
          c.classList.toggle('is-active', input && input.checked);
        });
        if (mode === 2 && combo && cardImage(combo)) {
          setMainImage(cardImage(combo));
        } else if (mode === 1) {
          var checked = form.querySelector('[data-variant-radio]:checked');
          setImage(getVariant(idInput.value), checked && checked.closest('.vcard'));
        }
        applyScope();
        refresh();
      }
      function select(v, card) {
        if (!v) return;
        idInput.value = v.id;
        setImage(v, card);
        if (packPrice1) packPrice1.textContent = money(v.price);
        if (packPrice2) packPrice2.textContent = money(v.price * 2 - PACK_DISCOUNT);
        syncCards();
        refresh();
      }
      root.querySelectorAll('[data-variant-radio]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          select(getVariant(radio.value), radio.closest('.vcard'));
        });
      });
      root.querySelectorAll('[data-pack-radio]').forEach(function (radio) {
        radio.addEventListener('change', setMode);
      });
      root.querySelectorAll('[data-combo]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          syncCards();
          if (cardImage(radio)) setMainImage(cardImage(radio));
          refresh();
        });
      });
      root.querySelectorAll('[data-scope]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          root.querySelectorAll('.scope-opt').forEach(function (o) {
            var i = o.querySelector('input');
            o.classList.toggle('is-active', !!(i && i.checked));
          });
          applyScope();
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

      setMode();

      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var redirecting = false;
        if (errEl) errEl.hidden = true;
        if (okEl) okEl.hidden = true;
        if (!form.checkValidity()) {
          form.reportValidity();
          if (errEl) {
            errEl.textContent = 'Vérifiez les champs obligatoires avant d’ajouter au panier.';
            errEl.hidden = false;
          }
          return;
        }
        if (packMode() === 2 && (!selectedCombo() || selectedCombo().disabled)) {
          if (errEl) {
            errEl.textContent = 'Cette combinaison est actuellement indisponible.';
            errEl.hidden = false;
            errEl.focus({ preventScroll: true });
          }
          return;
        }
        if (btn) {
          btn.classList.remove('is-shake', 'is-added');
          btn.classList.add('is-loading');
          btn.setAttribute('aria-busy', 'true');
          btn.disabled = true;
        }
        var opts = {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        };
        if (packMode() === 2) {
          var note = form.querySelector('[name="properties[Remarque]"]');
          var combo = selectedCombo();
          var sameScope = packScope() === 'same';
          var items = [1, 2].map(function (i) {
            var v = plaqueVariant(i);
            var srcI = sameScope ? 1 : i;
            var nameField = form.querySelector('[data-plaque-name="' + srcI + '"]');
            var linkField = form.querySelector('[data-plaque-link="' + srcI + '"]');
            var props = { 'Plaque': i + '/2' };
            if (combo && combo.dataset.label) props['Combinaison'] = combo.dataset.label;
            if (nameField && nameField.value) props['Nom de l’établissement'] = nameField.value;
            if (linkField && linkField.value) props['Lien Google'] = linkField.value;
            if (note && note.value) props['Remarque'] = note.value;
            return { id: v && v.id, quantity: 1, properties: props };
          });
          opts.headers['Content-Type'] = 'application/json';
          opts.body = JSON.stringify({ items: items });
        } else {
          opts.body = new FormData(form);
        }
        fetch(routes.cartAdd, opts).then(function (res) {
          return res.json().then(function (json) {
            if (!res.ok) throw new Error(json.description || json.message || 'Impossible d’ajouter au panier.');
            return json;
          });
        }).then(function () {
          return fetch(routes.cartJs).then(function (r) { return r.json(); });
        }).then(function (cart) {
          setCount(cart.item_count);
          if (okEl) { okEl.hidden = false; }
          /* Redirection vers la page panier, uniquement après que Shopify a
             confirmé l'ajout ET que /cart.js montre bien une ligne : en cas
             d'erreur le catch prend la main et on reste sur la page.
             `routes.cart` vient de routes.cart_url (theme.liquid), jamais d'une
             URL codée en dur. Le bouton reste désactivé pendant la navigation,
             ce qui empêche tout second ajout. */
          if (cart && cart.item_count > 0) {
            redirecting = true;
            window.location.assign(routes.cart);
            return;
          }
          if (btn) {
            btn.classList.add('is-added');
            if (addedTimer) clearTimeout(addedTimer);
            addedTimer = setTimeout(function () { btn.classList.remove('is-added'); }, 2000);
          }
        }).catch(function (err) {
          if (errEl) {
            errEl.textContent = err.message;
            errEl.hidden = false;
            errEl.focus({ preventScroll: true });
          }
          if (btn && !reduced()) {
            btn.classList.remove('is-shake');
            void btn.offsetWidth;
            btn.classList.add('is-shake');
          }
        }).finally(function () {
          /* Pendant la navigation vers /cart, on laisse le bouton verrouillé :
             le réactiver rouvrirait une fenêtre de double ajout. */
          if (redirecting) return;
          if (btn) {
            btn.classList.remove('is-loading');
            btn.removeAttribute('aria-busy');
          }
          refresh();
        });
      });
    });
  }

  /* ---------- Avis Google (carrousel) ---------- */
  /* Le défilement tactile reste assuré par scroll-snap en CSS : ce script ne
     gère que les flèches, le bouton « Afficher plus » et le défilement
     automatique. Aucun listener touch bloquant, donc aucun conflit avec le
     scroll vertical de la page ni avec le swipe natif. */
  var G_DELAY = 4500;   /* un pas toutes les 4,5 s */
  var G_RESUME = 6000;  /* reprise 6 s après la dernière action manuelle */

  function initGoogleReviews(scope) {
    qsa(scope, '[data-g-reviews]').forEach(function (root) {
      if (!guard(root, 'GReviews')) return;
      var track = root.querySelector('[data-g-track]');
      var prev = root.querySelector('[data-g-prev]');
      var next = root.querySelector('[data-g-next]');
      var more = root.querySelector('[data-g-more]');
      var toggle = root.querySelector('[data-g-toggle]');
      if (!track) return;

      /* Le pas vient de la largeur réelle d'une carte et du gap réellement
         appliqué : il suit donc les 1, 2 ou 3 colonnes selon le breakpoint,
         sans aucune largeur en dur. */
      function gap() {
        var g = parseFloat(getComputedStyle(track).columnGap);
        return isNaN(g) ? 0 : g;
      }
      function step() {
        var card = track.querySelector('.g-review:not([hidden])');
        return card ? card.getBoundingClientRect().width + gap() : track.clientWidth;
      }
      function maxScroll() { return track.scrollWidth - track.clientWidth; }
      function syncFrom(pos) {
        var max = maxScroll() - 2;
        if (prev) prev.disabled = pos <= 2;
        if (next) next.disabled = pos >= max;
      }
      function sync() { syncFrom(track.scrollLeft); }
      /* Cible absolue et bornée via scrollTo. L'état des flèches est recalculé
         depuis la cible sans attendre l'évènement `scroll` : celui-ci est
         étranglé par le navigateur et laissait le bouton précédent désactivé
         après un défilement animé. */
      function go(dir) {
        var max = maxScroll();
        var target = Math.max(0, Math.min(max, track.scrollLeft + dir * step()));
        track.scrollTo({ left: target, behavior: reduced() ? 'auto' : 'smooth' });
        syncFrom(target);
      }

      /* ----- Défilement automatique ----- */
      var timer = null, resumeT = null;
      var hovering = false, focused = false, manual = false;
      var paused = false, onScreen = false;

      /* Pas assez de cartes pour dépasser la largeur disponible : rien à faire
         défiler, donc pas de minuteur et pas de bouton pause. */
      function scrollable() { return maxScroll() > 4; }
      function allowed() {
        return !reduced() && scrollable() && !paused && !hovering &&
               !focused && !manual && onScreen && !document.hidden;
      }
      /* Un seul intervalle possible : on efface toujours avant de (re)poser. */
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function start() {
        stop();
        if (!allowed()) return;
        timer = setInterval(tick, G_DELAY);
      }
      function refresh() {
        if (toggle) toggle.hidden = reduced() || !scrollable();
        start();
      }
      /* Retour au début : rejouer tout le trajet à l'envers serait long et
         brutal. On masque le repositionnement instantané par un fondu court,
         puis l'animation normale reprend. */
      function rewind() {
        track.style.transition = 'opacity .18s ease';
        track.style.opacity = '0';
        setTimeout(function () {
          track.scrollTo({ left: 0, behavior: 'auto' });
          syncFrom(0);
          track.style.opacity = '1';
          setTimeout(function () {
            track.style.transition = '';
            track.style.opacity = '';
          }, 240);
        }, 180);
      }
      function tick() {
        if (!allowed()) { stop(); return; }
        if (track.scrollLeft >= maxScroll() - 2) rewind();
        else go(1);
      }
      /* Action manuelle : pause franche, puis reprise après inactivité. */
      function manualPause() {
        manual = true;
        stop();
        if (resumeT) clearTimeout(resumeT);
        resumeT = setTimeout(function () { manual = false; start(); }, G_RESUME);
      }

      if (prev) prev.addEventListener('click', function () { go(-1); manualPause(); });
      if (next) next.addEventListener('click', function () { go(1); manualPause(); });

      root.addEventListener('mouseenter', function () { hovering = true; stop(); });
      root.addEventListener('mouseleave', function () { hovering = false; start(); });
      root.addEventListener('focusin', function () { focused = true; stop(); });
      root.addEventListener('focusout', function () { focused = false; start(); });
      track.addEventListener('touchstart', manualPause, { passive: true });
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') manualPause();
      }, { passive: true });

      function setToggle() {
        if (!toggle) return;
        toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
        toggle.setAttribute('aria-label', paused
          ? 'Reprendre le défilement automatique des avis'
          : 'Mettre le défilement automatique des avis en pause');
      }
      if (toggle) {
        toggle.addEventListener('click', function () {
          paused = !paused;
          setToggle();
          if (paused) {
            stop();
            if (resumeT) clearTimeout(resumeT);
            manual = false;
          } else {
            start();
          }
        });
        setToggle();
      }

      /* Onglet masqué : le minuteur s'arrête au lieu d'accumuler des pas. */
      function onVis() { if (document.hidden) stop(); else start(); }
      document.addEventListener('visibilitychange', onVis);

      /* Hors écran : aucun minuteur ne tourne. */
      var io = null;
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function (entries) {
          onScreen = entries[0].isIntersecting;
          if (onScreen) start(); else stop();
        }, { threshold: 0.25 });
        io.observe(root);
      } else {
        onScreen = true;
      }

      function onResize() { sync(); refresh(); }
      window.addEventListener('resize', onResize);

      /* Le réglage système peut changer en cours de session. */
      function onRM() { if (reduced()) stop(); refresh(); }
      if (RMQ.addEventListener) RMQ.addEventListener('change', onRM);

      track.addEventListener('scroll', sync, { passive: true });

      onCleanup(root, function () {
        stop();
        if (resumeT) clearTimeout(resumeT);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVis);
        if (io) io.disconnect();
        if (RMQ.removeEventListener) RMQ.removeEventListener('change', onRM);
      });

      if (more) {
        more.addEventListener('click', function () {
          qsa(root, '[data-g-extra]').forEach(function (el) { el.hidden = false; });
          more.setAttribute('aria-expanded', 'true');
          more.remove();
          sync();
          refresh();
        });
      }
      sync();
      refresh();
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
    initGoogleReviews(scope);
  }
  initAll(document);
  if (typeof DPA.cartCount === 'number') setCount(DPA.cartCount, true);
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:unload', function (e) { cleanupWithin(e.target); });
})();
