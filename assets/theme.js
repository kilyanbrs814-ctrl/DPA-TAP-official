/* DPA TAP — theme.js (vanilla, no deps) */
(function () {
  'use strict';
  var RMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return RMQ.matches; }
  var DPA = window.DPA || {};
  var routes = DPA.routes || {};
  if (!routes.cartAdd) routes.cartAdd = '/cart/add.js';
  if (!routes.cart) routes.cart = '/cart';
  if (!routes.cartJs) routes.cartJs = '/cart.js';
  if (!routes.cartChange) routes.cartChange = '/cart/change.js';
  if (!routes.cartUpdate) routes.cartUpdate = '/cart/update.js';
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

  /* ---------- Démonstration vidéo (section « Comment ça marche ») ---------- */
  /* La lecture démarre quand la carte entre dans le viewport et s'arrête dès
     qu'elle en sort : rien ne tourne en arrière-plan. Aucun contrôle visible.
     En mouvement réduit, aucune lecture automatique — la vidéo reste sur son
     poster et un clic sur la carte la lance. */
  function initVideoDemo(scope) {
    qsa(scope, '[data-hiw-video]').forEach(function (card) {
      if (!guard(card, 'HiwVideo')) return;
      var video = card.querySelector('video');
      if (!video) return;

      var auto = !reduced();
      var wanted = auto;

      function tryPlay() {
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () { /* noop */ });
      }
      function onClick() {
        if (video.paused) { wanted = true; tryPlay(); }
        else { wanted = false; video.pause(); }
      }
      card.addEventListener('click', onClick);

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { if (wanted) tryPlay(); }
          else if (!video.paused) video.pause();
        }, { threshold: 0.25 });
        io.observe(card);
        onCleanup(card, function () { io.disconnect(); });
      } else if (auto) {
        tryPlay();
      }

      onCleanup(card, function () {
        card.removeEventListener('click', onClick);
        try { video.pause(); } catch (e) { /* noop */ }
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

  /* ---------- Rail d'avis Judge.me (section judgeme-carousel) ----------
     Le défilement lui-même est natif (scroll-snap) : sans ce script, la piste
     reste parcourable au doigt, au trackpad et au clavier. On n'ajoute ici que
     les flèches, livrées masquées, et leur état désactivé aux extrémités. */
  function initReviewsRail(scope) {
    qsa(scope, '[data-revw]').forEach(function (root) {
      if (!guard(root, 'Revw')) return;
      var track = root.querySelector('[data-revw-track]');
      var nav = root.querySelector('[data-revw-nav]');
      if (!track || !nav) return;
      var prev = nav.querySelector('[data-revw-prev]');
      var next = nav.querySelector('[data-revw-next]');
      if (!prev || !next) return;
      var raf = null;

      /* Un pas = une carte + l'espace qui la suit, donc l'arrêt tombe toujours
         sur un point de calage. */
      function stepWidth() {
        var card = track.querySelector('.revw-card');
        if (!card) return track.clientWidth;
        var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        return card.getBoundingClientRect().width + gap;
      }
      function sync() {
        raf = null;
        var max = track.scrollWidth - track.clientWidth;
        nav.hidden = max <= 4;
        if (nav.hidden) return;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
      }
      function queue() { if (raf === null) raf = requestAnimationFrame(sync); }
      function go(dir) {
        track.scrollBy({ left: dir * stepWidth(), behavior: reduced() ? 'auto' : 'smooth' });
      }
      var onPrev = function () { go(-1); };
      var onNext = function () { go(1); };

      prev.addEventListener('click', onPrev);
      next.addEventListener('click', onNext);
      track.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
      onCleanup(root, function () {
        window.removeEventListener('resize', queue);
        if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      });
      sync();
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

  /* ---------- Panier ----------
     Toutes les commandes du panier passent par /cart/change.js ou
     /cart/update.js, puis redemandent cette même section à Shopify
     (Section Rendering API). Les prix de ligne, la réduction pack et le total
     restent donc calculés par Liquid : aucune règle de remise n'est réécrite
     ici. Les écouteurs sont délégués sur la section, qui n'est jamais
     remplacée — seul son contenu l'est — donc ils survivent à chaque rendu. */
  function initCart(scope) {
    qsa(scope, '[data-cart-root]').forEach(function (root) {
      if (!guard(root, 'Cart')) return;

      var NOTE_DEBOUNCE = 600;
      var sectionId = root.getAttribute('data-section-id');
      var busy = false;
      var resubmitting = false;
      var lastSubmitter = null;
      var pending = Object.create(null);
      var pendingCount = 0;
      var qtyTimer = null;
      var waiters = [];
      var noteTimer = null;
      var noteChain = Promise.resolve();
      var noteSaved = null;
      var noteEl = root.querySelector('[data-cart-note]');
      if (noteEl) noteSaved = noteEl.value;

      function near(node, sel) {
        return node && node.closest ? node.closest(sel) : null;
      }
      function pick(sel) { return root.querySelector(sel); }
      function status(msg) {
        var el = pick('[data-cart-note-status]');
        if (el) el.textContent = msg || '';
      }
      function fail(msg) {
        var el = pick('[data-cart-error]');
        if (!el) return;
        el.textContent = msg || '';
        el.hidden = !msg;
      }
      function post(url, body) {
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body)
        }).then(function (res) {
          return res.json().then(function (json) {
            if (!res.ok) throw new Error(json.description || json.message || 'Le panier n’a pas pu être mis à jour.');
            return json;
          });
        });
      }

      /* Rendu renvoyé par Shopify : on ne remplace que le contenu de la
         section. Une note en cours de frappe n'est pas écrasée par la valeur
         encore enregistrée côté serveur, et le curseur reste où il était. */
      function render(cart) {
        var sections = (cart && cart.sections) || {};
        var html = sections[sectionId];
        /* Une seule section est demandée : si la clé attendue manque, la seule
           réponse présente est forcément la bonne. */
        if (!html) {
          for (var k in sections) { if (sections[k]) { html = sections[k]; break; } }
        }
        var next = null;
        if (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          next = doc.querySelector('[data-cart-root]');
        }
        if (!next) { window.location.assign(routes.cart); return; }

        var note = pick('[data-cart-note]');
        var keep = null;
        if (note && (note.value !== noteSaved || document.activeElement === note)) {
          keep = {
            value: note.value,
            start: note.selectionStart,
            end: note.selectionEnd,
            focus: document.activeElement === note
          };
        }
        root.innerHTML = next.innerHTML;
        var fresh = pick('[data-cart-note]');
        if (fresh && keep) {
          fresh.value = keep.value;
          if (keep.focus) {
            fresh.focus();
            try { fresh.setSelectionRange(keep.start, keep.end); } catch (e) { /* noop */ }
          }
        }
        setCount(cart.item_count);
      }

      /* Les clics rapides sont absorbés : la valeur affichée change tout de
         suite, les envois sont regroupés puis joués un par un. Une ligne est
         désignée par sa clé, jamais par son rang, donc une suppression en cours
         de file ne décale rien. Le rendu n'est appliqué qu'une fois la file
         vide, pour ne pas faire clignoter une quantité déjà dépassée. */
      function queueQty(key, quantity, input) {
        if (!key) return;
        if (input) input.value = quantity;
        if (!(key in pending)) pendingCount++;
        pending[key] = quantity;
        if (qtyTimer) clearTimeout(qtyTimer);
        qtyTimer = setTimeout(drain, 250);
      }

      function drain() {
        qtyTimer = null;
        if (busy || !pendingCount) return;
        var key = null;
        for (var k in pending) { key = k; break; }
        if (key === null) return;
        var quantity = pending[key];
        delete pending[key];
        pendingCount--;

        busy = true;
        root.setAttribute('aria-busy', 'true');
        fail('');
        post(routes.cartChange, {
          id: key,
          quantity: quantity,
          sections: sectionId,
          sections_url: routes.cart
        }).then(function (cart) {
          if (!pendingCount) render(cart);
        }).catch(function (err) {
          /* Le panier affiché ne doit jamais rester en avance sur le vrai :
             on le redemande à Shopify, puis on explique l'échec. */
          var msg = err.message;
          pending = Object.create(null);
          pendingCount = 0;
          return post(routes.cartUpdate, { sections: sectionId, sections_url: routes.cart })
            .then(render)
            .catch(function () { /* noop */ })
            .then(function () { fail(msg); });
        }).finally(function () {
          busy = false;
          if (pendingCount) {
            drain();
          } else {
            root.removeAttribute('aria-busy');
            var waiting = waiters;
            waiters = [];
            waiting.forEach(function (fn) { fn(); });
          }
        });
      }

      /* Résout quand plus aucune quantité n'est en attente ni en vol. */
      function flushQty() {
        if (qtyTimer) { clearTimeout(qtyTimer); qtyTimer = null; drain(); }
        if (!busy && !pendingCount) return Promise.resolve();
        return new Promise(function (resolve) { waiters.push(resolve); });
      }

      /* Les enregistrements de note sont mis à la file : deux frappes rapprochées
         ne peuvent pas arriver dans le désordre. La valeur est relue au moment
         de l'envoi, donc c'est toujours la dernière qui part. */
      function saveNote() {
        noteChain = noteChain.then(function () {
          var note = pick('[data-cart-note]');
          if (!note || note.value === noteSaved) return;
          var value = note.value;
          status('Enregistrement…');
          return post(routes.cartUpdate, { note: value }).then(function () {
            noteSaved = value;
            status('Note enregistrée');
          });
        }).catch(function () {
          status('La note n’a pas pu être enregistrée. Elle partira au paiement.');
        });
        return noteChain;
      }
      function flushNote() {
        if (noteTimer) { clearTimeout(noteTimer); noteTimer = null; }
        return saveNote();
      }

      root.addEventListener('click', function (e) {
        var ctl = near(e.target, '[data-qty-minus],[data-qty-plus],[data-qty-remove]');
        if (!ctl) return;
        var row = near(ctl, '[data-cart-key]');
        if (!row) return;
        e.preventDefault();
        var key = row.getAttribute('data-cart-key');
        var input = row.querySelector('[data-qty-input]');
        var current = input ? parseInt(input.value, 10) : 0;
        if (isNaN(current)) current = 0;
        if (ctl.hasAttribute('data-qty-remove')) queueQty(key, 0, null);
        else if (ctl.hasAttribute('data-qty-minus')) queueQty(key, Math.max(0, current - 1), input);
        else queueQty(key, current + 1, input);
      });

      /* Le bouton réellement cliqué, pour les navigateurs sans event.submitter. */
      root.addEventListener('click', function (e) {
        var btn = near(e.target, 'button[type="submit"],input[type="submit"]');
        if (btn) lastSubmitter = btn;
      }, true);

      root.addEventListener('change', function (e) {
        var input = near(e.target, '[data-qty-input]');
        if (!input) return;
        var row = near(input, '[data-cart-key]');
        if (!row) return;
        var q = parseInt(input.value, 10);
        if (isNaN(q) || q < 0) q = 0;
        queueQty(row.getAttribute('data-cart-key'), q, null);
      });

      /* Entrée dans le champ quantité : le bouton de paiement est désormais le
         premier bouton de soumission du formulaire, une validation clavier
         partirait donc au checkout. On applique la quantité, rien de plus. */
      root.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.keyCode !== 13) return;
        var input = near(e.target, '[data-qty-input]');
        if (!input) return;
        e.preventDefault();
        input.blur();
      });

      root.addEventListener('input', function (e) {
        if (!near(e.target, '[data-cart-note]')) return;
        status('');
        if (noteTimer) clearTimeout(noteTimer);
        noteTimer = setTimeout(function () { noteTimer = null; saveNote(); }, NOTE_DEBOUNCE);
      });

      root.addEventListener('focusout', function (e) {
        if (!near(e.target, '[data-cart-note]')) return;
        flushNote();
      });

      /* Frappe — ou clic sur « + » / poubelle — suivie d'un clic immédiat sur
         « Paiement sécurisé » : tout ce qui est en attente part d'abord, la
         redirection ne se fait qu'ensuite. Le formulaire poste de toute façon
         `note` et `updates[]` vers /cart, donc même un enregistrement AJAX en
         échec ne perd rien : Shopify les applique dans la requête même qui
         ouvre le checkout. */
      root.addEventListener('submit', function (e) {
        var form = near(e.target, '[data-cart-form]');
        if (!form || resubmitting) return;
        var submitter = e.submitter || lastSubmitter;
        var name = submitter && submitter.name ? submitter.name : '';
        var value = submitter && submitter.value ? submitter.value : '';
        e.preventDefault();
        root.setAttribute('aria-busy', 'true');

        Promise.all([flushQty(), flushNote()]).then(function () {
          /* Le rendu a pu remplacer le formulaire entre-temps : on repart de
             celui qui est réellement dans la page. Panier vidé au passage,
             donc plus de formulaire : il n'y a plus rien à payer. */
          var live = root.querySelector('[data-cart-form]');
          if (!live) { root.removeAttribute('aria-busy'); return; }
          var btn = name ? live.querySelector('button[name="' + name + '"],input[type="submit"][name="' + name + '"]') : null;
          resubmitting = true;
          if (live.requestSubmit) {
            try {
              live.requestSubmit(btn || undefined);
              return;
            } catch (err) { /* on retombe sur la soumission classique */ }
          }
          /* form.submit() n'embarque aucun bouton : sans `checkout`, Shopify
             se contenterait de mettre le panier à jour. */
          if (name) {
            var hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = name;
            hidden.value = value;
            live.appendChild(hidden);
          }
          live.submit();
        });
      });

      /* Départ de la page avec une frappe encore en attente : dernier envoi. */
      function onLeave() {
        var note = pick('[data-cart-note]');
        if (!note || note.value === noteSaved || !navigator.sendBeacon) return;
        try {
          navigator.sendBeacon(
            routes.cartUpdate,
            new Blob([JSON.stringify({ note: note.value })], { type: 'application/json' })
          );
        } catch (err) { /* noop */ }
      }
      window.addEventListener('pagehide', onLeave);
      onCleanup(root, function () {
        window.removeEventListener('pagehide', onLeave);
        if (noteTimer) clearTimeout(noteTimer);
      });
    });
  }

  /* ---------- Boot + éditeur Shopify ---------- */
  function initAll(scope) {
    initHeader(scope);
    initReveals(scope);
    initHeroParallax(scope);
    initVideoDemo(scope);
    initSpotlight(scope);
    initReviewsRail(scope);
    initFaq(scope);
    initBuyForms(scope);
    initCart(scope);
  }
  initAll(document);
  if (typeof DPA.cartCount === 'number') setCount(DPA.cartCount, true);
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:unload', function (e) { cleanupWithin(e.target); });
})();
