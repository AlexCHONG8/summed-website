/* Summed Medtech — site.js (nav dropdown + burger + contact form) */

function composeContactMailto(data) {
  var body = 'Name: ' + data.name +
    '\nCompany: ' + data.company +
    '\nEmail: ' + data.email +
    '\n\n' + data.message.slice(0, 1500);
  var subject = 'Program inquiry — ' + data.company;
  return 'mailto:alex.chong@summed-medtech.com?subject=' +
    encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function submitContactForm(form) {
  var fields = {
    name: document.getElementById('cf-name'),
    company: document.getElementById('cf-company'),
    email: document.getElementById('cf-email'),
    message: document.getElementById('cf-message')
  };
  var errors = {
    name: document.getElementById('cf-name-err'),
    company: document.getElementById('cf-company-err'),
    email: document.getElementById('cf-email-err'),
    message: document.getElementById('cf-message-err')
  };
  var ok = true;
  Object.keys(fields).forEach(function (k) {
    var valid = fields[k] && fields[k].value.trim() !== '';
    if (k === 'email' && valid) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[k].value.trim());
    }
    if (errors[k]) errors[k].hidden = valid;
    if (!valid) ok = false;
  });
  if (!ok) return false;

  window.location.href = composeContactMailto({
    name: fields.name.value.trim(),
    company: fields.company.value.trim(),
    email: fields.email.value.trim(),
    message: fields.message.value.trim()
  });
  return true;
}

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

(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitContactForm(form);
  });
})();
