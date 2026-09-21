/* Khoj Nepal - Light / Dark Theme */

(function applyThemeEarly() {
  try {
    const theme = localStorage.getItem('khoj_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#18191A' : '#F2F3F5';
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.backgroundColor = '#F2F3F5';
  }
})();

function getTheme() {
  return localStorage.getItem('khoj_theme') || 'light';
}

function setTheme(theme) {
  const bg = theme === 'dark' ? '#18191A' : '#F2F3F5';
  localStorage.setItem('khoj_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.style.backgroundColor = bg;
  const boot = document.getElementById('khoj-theme-boot');
  if (boot) boot.textContent = 'html,body{background-color:' + bg + '!important;}';
  if (document.body) document.body.style.backgroundColor = '';
  updateThemeToggleUI();
}

function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

function initTheme() {
  setTheme(getTheme());
}

function updateThemeToggleUI() {
  const theme = getTheme();
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const lightLabel = btn.querySelector('.theme-light-label');
    const darkLabel = btn.querySelector('.theme-dark-label');
    if (lightLabel) lightLabel.style.display = theme === 'light' ? 'inline' : 'none';
    if (darkLabel) darkLabel.style.display = theme === 'dark' ? 'inline' : 'none';
  });
  document.querySelectorAll('.theme-icon-sun').forEach(el => {
    el.style.display = theme === 'light' ? 'inline' : 'none';
  });
  document.querySelectorAll('.theme-icon-moon').forEach(el => {
    el.style.display = theme === 'dark' ? 'inline' : 'none';
  });
}

/* ---- Loading spinner (classic 12-spoke) ---- */
function khojSpinnerHtml(extraClass) {
  const cls = extraClass ? `khoj-spinner ${extraClass}` : 'khoj-spinner';
  let bars = '';
  for (let i = 0; i < 12; i++) bars += `<span style="--i:${i}"></span>`;
  return `<span class="${cls}" aria-hidden="true">${bars}</span>`;
}

function showPageLoading(message) {
  let el = document.getElementById('khoj-loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'khoj-loading-overlay';
    el.className = 'khoj-loading-overlay';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `<div class="khoj-loading-box">${khojSpinnerHtml('khoj-spinner-lg')}<p class="khoj-loading-text"></p></div>`;
    document.body.appendChild(el);
  }
  const text = el.querySelector('.khoj-loading-text');
  if (text) text.textContent = message || 'Please wait...';
  el.hidden = false;
  document.body.classList.add('khoj-loading-active');
}

function hidePageLoading() {
  const el = document.getElementById('khoj-loading-overlay');
  if (el) el.hidden = true;
  document.body.classList.remove('khoj-loading-active');
}

function setButtonLoading(btn, loading, loadingLabel) {
  if (!btn) return;
  if (loading) {
    if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('is-loading');
    const label = loadingLabel
      ? `<span class="khoj-btn-loading-label">${loadingLabel}</span>`
      : '';
    btn.innerHTML = khojSpinnerHtml() + label;
  } else {
    btn.disabled = false;
    btn.classList.remove('is-loading');
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
      delete btn.dataset.originalHtml;
    }
  }
}

/* ============================================================
   GLOBAL NOTIFICATION SYSTEM  (toast)
   ============================================================
   Usage:
     showNotification('message text', 'success');
     showNotification('message text', 'error');
     showNotification('message text', 'warning');
     showNotification('message text', 'info');
   ============================================================ */
function showNotification(message, type) {
  type = type || 'info';
  const ICONS = { success: '\u2713', error: '\u2717', warning: '\u26A0', info: '\u24D8' };
  const container = getOrCreateToastContainer();
  const toast = document.createElement('div');
  toast.className = 'khoj-toast khoj-toast-' + type;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML =
    '<span class="khoj-toast-icon">' + (ICONS[type] || ICONS.info) + '</span>' +
    '<span class="khoj-toast-msg">' + (message || '') + '</span>' +
    '<button type="button" class="khoj-toast-close" aria-label="Close">\u00D7</button>';
  toast.querySelector('.khoj-toast-close').addEventListener('click', function () { dismissToast(toast); });
  container.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('khoj-toast-visible'); });
  var delay = type === 'error' ? 6000 : 4000;
  setTimeout(function () { dismissToast(toast); }, delay);
}

function dismissToast(el) {
  if (!el || el._dismissing) return;
  el._dismissing = true;
  el.classList.remove('khoj-toast-visible');
  el.classList.add('khoj-toast-hiding');
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
}

function getOrCreateToastContainer() {
  var c = document.getElementById('khoj-toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'khoj-toast-container';
    c.className = 'khoj-toast-container';
    c.setAttribute('aria-relevant', 'additions removals');
    document.body.appendChild(c);
  }
  return c;
}

/* ============================================================
   GLOBAL CONFIRM MODAL
   ============================================================
   Usage:
     showConfirm({
       title: 'Delete post?',
       message: 'Are you sure you want to delete this post?',
       confirmLabel: 'Delete',
       cancelLabel: 'Cancel',
       danger: true,
       onConfirm: function() { ... }
     });
   ============================================================ */
function showConfirm(opts) {
  opts = opts || {};
  var overlay = document.createElement('div');
  overlay.className = 'khoj-confirm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  var confirmBtnClass = opts.danger ? 'btn btn-danger' : 'btn btn-primary';
  overlay.innerHTML =
    '<div class="khoj-confirm-card">' +
      '<h3 class="khoj-confirm-title">' + (opts.title || 'Confirm') + '</h3>' +
      '<p class="khoj-confirm-msg">' + (opts.message || '') + '</p>' +
      '<div class="khoj-confirm-actions">' +
        '<button type="button" class="btn btn-ghost khoj-confirm-cancel">' + (opts.cancelLabel || (typeof t === 'function' ? t('cancel') : 'Cancel')) + '</button>' +
        '<button type="button" class="' + confirmBtnClass + ' khoj-confirm-ok">' + (opts.confirmLabel || 'Confirm') + '</button>' +
      '</div>' +
    '</div>';
  function close() { overlay.classList.remove('khoj-confirm-visible'); setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200); }
  overlay.querySelector('.khoj-confirm-cancel').addEventListener('click', close);
  overlay.querySelector('.khoj-confirm-ok').addEventListener('click', function () { close(); if (typeof opts.onConfirm === 'function') opts.onConfirm(); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.body.appendChild(overlay);
  requestAnimationFrame(function () { overlay.classList.add('khoj-confirm-visible'); });
  overlay.querySelector('.khoj-confirm-ok').focus();
}

/* ============================================================
   REPLACE BROWSER alert() / confirm()
   ============================================================ */
window._origAlert = window.alert;
window._origConfirm = window.confirm;

window.alert = function (msg) {
  if (typeof showNotification === 'function') {
    showNotification(String(msg || ''), 'info');
  } else {
    window._origAlert(msg);
  }
};

window.confirm = function (msg) {
  return window._origConfirm(msg);
};
