/* Summed Medtech — site.js (nav dropdown + burger) */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  if (!header) return;

  var burger = header.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      header.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', header.classList.contains('nav-open') ? 'true' : 'false');
    });
  }

  header.querySelectorAll('.nav-item').forEach(function (item) {
    var link = item.querySelector(':scope > a');
    if (!link) return;

    link.addEventListener('click', function (e) {
      if (item.querySelector('.nav-drop')) {
        e.preventDefault();
        var wasOpen = item.classList.contains('open');
        header.querySelectorAll('.nav-item.open').forEach(function (o) { o.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      }
    });

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') item.classList.remove('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      header.querySelectorAll('.nav-item.open').forEach(function (o) { o.classList.remove('open'); });
    }
  });
})();
