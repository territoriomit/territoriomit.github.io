/* Territorio — language switching (EN / ES / PT).
   Translations live in content.js. Anything without a translation
   falls back to the English written directly in the HTML. */
(function () {
  var LANGS = ['en', 'es', 'pt'];
  var STORE = 'territorio.lang';
  var original = null;           // key -> English HTML, captured once

  function capture() {
    original = {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key in original) return;
      original[key] = (el.getAttribute('data-i18n-attr'))
        ? el.getAttribute(el.getAttribute('data-i18n-attr'))
        : el.innerHTML;
    });
  }

  function apply(lang) {
    if (LANGS.indexOf(lang) < 0) lang = 'en';
    if (!original) capture();
    var dict = (lang === 'en') ? null : ((window.I18N || {})[lang] || {});

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = dict && Object.prototype.hasOwnProperty.call(dict, key)
        ? dict[key]
        : original[key];
      if (val == null) return;
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, val);
      else el.innerHTML = val;
    });

    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
    });
    try { localStorage.setItem(STORE, lang); } catch (e) { /* private mode */ }
  }

  function initial() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.indexOf(q) >= 0) return q;
    try {
      var s = localStorage.getItem(STORE);
      if (s && LANGS.indexOf(s) >= 0) return s;
    } catch (e) { /* private mode */ }
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) >= 0 ? nav : 'en';
  }

  function start() {
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-lang-btn')); });
    });
    apply(initial());
  }

  window.TerritorioLang = { set: apply };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
