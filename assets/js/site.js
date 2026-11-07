/* Summed Medtech — site.js
   Header behaviour (dropdown, mobile drawer), contact form (mailto fallback). */

(function () {
  'use strict';

  var CONTACT_EMAIL = 'bd@summed-medtech.com';
  var DESKTOP_BREAKPOINT = 1100;

  function composeContactMailto(data) {
    var body = 'Name: ' + data.name +
      '\nCompany: ' + data.company +
      '\nEmail: ' + data.email +
      '\n\n' + data.message.slice(0, 1500);
    var subject = 'Program inquiry — ' + data.company;
    return 'mailto:' + CONTACT_EMAIL + '?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function fieldErrorId(field) {
    return field.getAttribute('aria-describedby') || '';
  }

  function validateField(field) {
    var value = (field.value || '').trim();
    var valid = value !== '';
    if (field.type === 'email' && valid) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    var errId = fieldErrorId(field).split(/\s+/).filter(Boolean).filter(function (id) {
      return /-err$/.test(id);
    })[0];
    var box = errId ? document.getElementById(errId) : null;
    field.setAttribute('aria-invalid', valid ? 'false' : 'true');
    if (box) box.hidden = valid;
    return valid;
  }

  function submitContactForm(form) {
    var ids = ['cf-name', 'cf-company', 'cf-email', 'cf-message'];
    var fields = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var status = document.getElementById('cf-status');
    var firstInvalid = null;

    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      if (status) status.textContent = 'Please complete the highlighted fields.';
      firstInvalid.focus();
      return false;
    }

    if (status) status.textContent = 'Opening your email app with the message pre-filled…';

    window.location.href = composeContactMailto({
      name: document.getElementById('cf-name').value.trim(),
      company: document.getElementById('cf-company').value.trim(),
      email: document.getElementById('cf-email').value.trim(),
      message: document.getElementById('cf-message').value.trim()
    });
    return true;
  }

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var burger = header.querySelector('.burger');
    var nav = header.querySelector('.main-nav');
    var scrim = null;

    function setScrolled() {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    }
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    function ensureScrim() {
      if (scrim) return scrim;
      scrim = document.createElement('div');
      scrim.className = 'nav-scrim';
      scrim.addEventListener('click', closeNav);
      header.parentNode.insertBefore(scrim, header.nextSibling);
      return scrim;
    }

    function openNav() {
      header.classList.add('nav-open');
      document.body.style.overflow = 'hidden';
      if (burger) burger.setAttribute('aria-expanded', 'true');
      ensureScrim().style.display = 'block';
      var main = document.getElementById('main');
      var footer = document.querySelector('.site-footer');
      if (main) main.inert = true;
      if (footer) footer.inert = true;
      var first = nav && nav.querySelector('a');
      if (first) first.focus();
    }

    function closeNav() {
      header.classList.remove('nav-open');
      document.body.style.overflow = '';
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.focus({ preventScroll: true });
      }
      if (scrim) scrim.style.display = 'none';
      var main = document.getElementById('main');
      var footer = document.querySelector('.site-footer');
      if (main) main.inert = false;
      if (footer) footer.inert = false;
    }

    if (burger) {
      burger.addEventListener('click', function () {
        if (header.classList.contains('nav-open')) closeNav();
        else openNav();
      });
    }

    if (nav) {
      nav.addEventListener('click', function (e) {
        var link = e.target.closest('a');
        if (link && window.innerWidth <= DESKTOP_BREAKPOINT) closeNav();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (header.classList.contains('nav-open')) closeNav();
        header.querySelectorAll('.nav-item.open, .nav-item.hovered').forEach(function (item) {
          item.classList.remove('open');
          item.classList.remove('hovered');
          var trigger = item.querySelector(':scope > a');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > DESKTOP_BREAKPOINT && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        document.body.style.overflow = '';
        if (burger) burger.setAttribute('aria-expanded', 'false');
        if (scrim) scrim.style.display = 'none';
        var main = document.getElementById('main');
        var footer = document.querySelector('.site-footer');
        if (main) main.inert = false;
        if (footer) footer.inert = false;
      }
    });

    header.querySelectorAll('.nav-item').forEach(function (item) {
      var trigger = item.querySelector(':scope > a');
      var drop = item.querySelector('.nav-drop');
      if (!trigger || !drop) return;

      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !item.classList.contains('open');
        header.querySelectorAll('.nav-item.open').forEach(function (other) {
          if (other === item) return;
          other.classList.remove('open');
          var otherTrigger = other.querySelector(':scope > a');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });
        item.classList.toggle('open', willOpen);
        if (!willOpen) item.classList.remove('hovered');
        trigger.setAttribute('aria-expanded', willOpen || item.classList.contains('hovered') ? 'true' : 'false');
      });

      item.addEventListener('mouseenter', function () {
        if (window.innerWidth <= DESKTOP_BREAKPOINT) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        item.classList.add('hovered');
        trigger.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', function () {
        if (window.innerWidth <= DESKTOP_BREAKPOINT) return;
        item.classList.remove('hovered');
        if (!item.classList.contains('open')) trigger.setAttribute('aria-expanded', 'false');
      });
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) {
          item.classList.remove('open');
          if (!item.classList.contains('hovered')) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        header.querySelectorAll('.nav-item.open, .nav-item.hovered').forEach(function (item) {
          item.classList.remove('open');
          item.classList.remove('hovered');
          var trigger = item.querySelector(':scope > a');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('blur', function () {
        if ((field.value || '').trim() !== '') validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitContactForm(form);
    });
  }

  function initBackToTop() {
    var link = document.querySelector('.footer-top');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeader(); initForm(); initBackToTop();
    });
  } else {
    initHeader(); initForm(); initBackToTop();
  }
})();
