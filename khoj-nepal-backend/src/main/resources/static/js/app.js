/* Khoj Nepal - Main Application */

const STATUS_MAP = {
  active: { label: 'statusActive', class: 'badge-active', icon: '🟢' },
  pending: { label: 'statusPendingReview', class: 'badge-pending', icon: '🟡' },
  rejected: { label: 'statusRejected', class: 'badge-suspicious', icon: '❌' },
  under_verification: { label: 'statusVerification', class: 'badge-verification', icon: '🟡' },
  received_by_admin: { label: 'statusReceived', class: 'badge-received', icon: '🔵' },
  claim_pending: { label: 'statusClaimPending', class: 'badge-pending', icon: '🟠' },
  delivered: { label: 'statusDelivered', class: 'badge-delivered', icon: '✅' },
  owner_found: { label: 'statusOwnerFound', class: 'badge-delivered', icon: '✅' },
  archived: { label: 'statusArchived', class: 'badge-archived', icon: '⚫' },
  suspicious: { label: 'statusSuspicious', class: 'badge-suspicious', icon: '⚠' }
};

const JOURNEY_KEYS = ['journeyPosted', 'journeyInfo', 'journeyAdmin', 'journeyReceived', 'journeyOwner', 'journeyDelivered'];

const NEPAL_PROVINCES = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province'
];

let currentFeedFilters = { query: '', type: 'all', category: '', subcategory: '', location: '', date: '' };
let feedPage = 1;
const FEED_PAGE_SIZE = 6;
let currentPageName = '';

function getBasePath() {
  return window.location.pathname.includes('/admin/') ? '../' : '';
}

/** Logged-in user from signup/login only — never a community demo author */
function getDisplayUser() {
  return getCurrentUser();
}

function displayUsername(user) {
  if (!user || !user.username) return '';
  return user.username.startsWith('@') ? user.username : '@' + user.username;
}

function getFirstName(fullName) {
  if (!fullName) return 'User';
  return fullName.trim().split(/\s+/)[0];
}

function getInitials(fullName) {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getPublicLocation(user) {
  if (!user) return 'Nepal';
  const parts = [user.city, user.district].filter(Boolean);
  return parts.length ? parts.join(', ') : (user.province || 'Nepal');
}

function formatMemberSince(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateOfBirth(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function avatarHtml(user, className) {
  const cls = className || 'avatar';
  if (user && user.profilePicture) {
    return `<div class="${cls} avatar-img"><img src="${user.profilePicture}" alt="${user.fullName || 'User'}"></div>`;
  }
  return `<div class="${cls}">${getInitials(user ? user.fullName : 'U')}</div>`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderStatusBadge(status) {
  const s = STATUS_MAP[status] || STATUS_MAP.active;
  return `<span class="status-badge ${s.class}">${s.icon} <span data-i18n="${s.label}">${t(s.label)}</span></span>`;
}

/** Relative/display time for post cards (API posts often lack time/timeNe). */
function getPostTimeLabel(post, lang) {
  if (lang === 'ne' && post.timeNe) return post.timeNe;
  if (post.time) return post.time;
  const raw = post.createdAt || post.date;
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return lang === 'ne' ? 'आज' : 'Today';
  if (days === 1) return lang === 'ne' ? 'हिजो' : 'Yesterday';
  if (days < 7) return lang === 'ne' ? `${days} दिन अघि` : `${days} days ago`;
  return post.date || d.toLocaleDateString();
}

function renderPostCard(post) {
  const lang = getLang();
  const isLost = post.type === 'lost';
  const title = lang === 'ne' && post.titleNe ? post.titleNe : post.title;
  const desc = lang === 'ne' && post.descriptionNe ? post.descriptionNe : post.description;
  const loc = lang === 'ne' && post.locationNe ? post.locationNe : post.location;
  const time = getPostTimeLabel(post, lang);
  const cat = getCategoryLabel(post.category, lang);
  const sub = post.subcategory ? getSubcategoryLabel(post.category, post.subcategory, lang) : '';
  const typeClass = isLost ? 'post-lost' : 'post-found';
  const typeLabel = typeBadge(isLost);
  const base = getBasePath();
  const isRecovered = post.status === 'delivered' || post.status === 'owner_found';

  let imageHtml = '';
  if (post.image) {
    imageHtml = `<div class="post-card-image"><img src="${post.image}" alt="${title}" loading="lazy"></div>`;
  } else if (isLost) {
    imageHtml = `<div class="post-card-image post-card-no-image"><span>📷</span><small data-i18n="imageOptional">${t('imageOptional')}</small></div>`;
  } else {
    imageHtml = `<div class="post-card-image post-card-no-image">📷</div>`;
  }

  let banner = '';
  if (post.status === 'pending') {
    banner = `<div class="delivered-banner pending-banner">🟡 <span data-i18n="statusPendingReview">${t('statusPendingReview')}</span></div>`;
  } else if (post.status === 'claim_pending') {
    banner = `<div class="delivered-banner pending-banner">🟠 <span data-i18n="claimInProgressBanner">${t('claimInProgressBanner')}</span></div>`;
  } else if (isRecovered) {
    banner = `<div class="delivered-banner">✅ <span data-i18n="${post.status === 'owner_found' ? 'ownerFound' : 'delivered'}">${t(post.status === 'owner_found' ? 'ownerFound' : 'delivered')}</span></div>`;
  }

  const own = typeof isOwnPost === 'function' && isOwnPost(post);
  let actions;
  if (own) {
    actions = `<a href="${base}item-details.html?id=${post.id}" class="btn btn-secondary btn-sm" data-i18n="viewDetails">${t('viewDetails')}</a>
       <a href="${base}edit-post.html?id=${post.id}" class="btn btn-outline btn-sm" data-i18n="editPost">${t('editPost')}</a>
       <button type="button" class="btn btn-danger btn-sm" data-action="delete-post" data-id="${post.id}" data-i18n="deletePost">${t('deletePost')}</button>`;
    if (post.status === 'pending') {
      actions = `<p class="form-note" data-i18n="postPendingNote">${t('postPendingNote')}</p>` + actions;
    }
  } else if (isLost) {
    actions = `<a href="${base}item-details.html?id=${post.id}" class="btn btn-secondary btn-sm" data-i18n="viewDetails">${t('viewDetails')}</a>
       <a href="${base}have-info.html?id=${post.id}" class="btn btn-outline btn-sm" data-i18n="haveInfo">${t('haveInfo')}</a>`;
  } else if (isRecovered) {
    actions = `<a href="${base}item-details.html?id=${post.id}" class="btn btn-secondary btn-sm" data-i18n="viewDetails">${t('viewDetails')}</a>`;
  } else if (post.fromMock) {
    actions = `<a href="${base}item-details.html?id=${post.id}" class="btn btn-secondary btn-sm" data-i18n="viewDetails">${t('viewDetails')}</a>
       <span class="form-note" data-i18n="communitySampleNote">${t('communitySampleNote')}</span>`;
  } else {
    const canClaim = typeof isClaimWaitingComplete === 'function' ? isClaimWaitingComplete(post) : true;
    const inProgressNote = post.status === 'claim_pending'
      ? `<p class="form-note">🟠 ${t('claimInProgressHint')}</p>`
      : '';
    actions = canClaim
      ? `${inProgressNote}<a href="${base}item-details.html?id=${post.id}" class="btn btn-secondary btn-sm" data-i18n="viewDetails">${t('viewDetails')}</a>
         <a href="${base}claim.html?id=${post.id}" class="btn btn-found btn-sm">🟢 ${t('claimItem')}</a>`
      : `<a href="${base}item-details.html?id=${post.id}" class="btn btn-secondary btn-sm" data-i18n="viewDetails">${t('viewDetails')}</a>
         <span class="form-note">🔒 ${t('claimUnavailable')}</span>`;
  }

  const ownBadge = own ? `<span class="your-post-badge" data-i18n="yourPost">${t('yourPost')}</span>` : '';

  return `
    <article class="post-card ${typeClass} ${isRecovered ? 'post-delivered' : ''} ${own ? 'post-mine' : ''}"
      data-id="${post.id}" data-type="${post.type}" data-category="${post.category}" data-subcategory="${post.subcategory || ''}">
      ${banner}
      <div class="post-card-header">
        <div class="avatar">${post.userAvatar}</div>
        <div class="post-card-user">
          <strong>${post.userName}${ownBadge}</strong>
          <span class="post-meta">📍 ${loc} · 🕒 ${time}</span>
        </div>
        ${renderStatusBadge(post.status)}
      </div>
      <div class="post-card-body">
        ${imageHtml}
        <div class="post-card-content">
          <span class="post-type-label">${typeLabel}</span>
          <h3 class="post-title">${title}</h3>
          <p class="post-desc">${desc.length > 140 ? desc.slice(0, 140) + '…' : desc}</p>
          <div class="post-tags">
            <span>📂 ${cat}${sub ? ' → ' + sub : ''}</span>
            <span>📅 ${post.date}</span>
          </div>
        </div>
      </div>
      <div class="post-card-actions">${actions}</div>
    </article>`;
}

function renderEmptyState(messageKey, hintKey, icon) {
  return `<div class="empty-state">
    <div class="empty-icon">${icon || '🔍'}</div>
    <h3 data-i18n="${messageKey}">${t(messageKey)}</h3>
    ${hintKey ? `<p class="empty-hint" data-i18n="${hintKey}">${t(hintKey)}</p>` : ''}
  </div>`;
}

let feedHasMore = false;
let feedLoadingMore = false;

function getFeedSentinel() {
  return document.getElementById('feed-scroll-sentinel') || document.getElementById('load-more-btn');
}

function updateFeedSentinel(visible) {
  const sentinel = getFeedSentinel();
  if (!sentinel) return;
  sentinel.hidden = !visible;
  sentinel.style.display = visible ? '' : 'none';
}

function renderPosts(containerId, posts, options) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const opts = options || {};
  const page = opts.page || 1;
  const pageSize = opts.pageSize || FEED_PAGE_SIZE;
  const sliced = posts.slice(0, page * pageSize);
  feedHasMore = sliced.length < posts.length;

  if (!posts.length) {
    container.innerHTML = renderEmptyState(opts.emptyKey || 'noPosts', opts.hintKey || 'emptyFeedHint');
    feedHasMore = false;
    updateFeedSentinel(false);
    return;
  }

  container.innerHTML = sliced.map(renderPostCard).join('');
  updateFeedSentinel(feedHasMore);
}

function getPostById(postId) {
  if (postId == null || postId === '') return null;
  if (typeof findPostById === 'function') {
    const fromApi = findPostById(postId);
    if (fromApi) return fromApi;
  }
  const all = typeof getAllUserPosts === 'function' ? getAllUserPosts() : [];
  return all.find(p => String(p.id) === String(postId)) || null;
}

function getCommunityAndMyPosts() {
  const stored = typeof getAllUserPosts === 'function' ? getAllUserPosts() : [];
  const apiPosts = Array.isArray(stored) ? stored : [];
  const mock = typeof MOCK_POSTS !== 'undefined' ? MOCK_POSTS : [];
  if (!apiPosts.length) return mock;
  const apiIds = new Set(apiPosts.map(p => String(p.id)));
  const extraMock = mock.filter(p => !apiIds.has(String(p.id))).map(p => ({ ...p, fromMock: true }));
  return [...apiPosts, ...extraMock];
}

function getActiveFeedPosts() {
  let posts = getCommunityAndMyPosts();
  if (currentPageName === 'lost') posts = posts.filter(p => p.type === 'lost');
  if (currentPageName === 'found') posts = posts.filter(p => p.type === 'found');
  return filterPosts(posts, currentFeedFilters);
}

function refreshFeed() {
  renderPosts('feed-container', getActiveFeedPosts(), { page: feedPage });
}

function initInfiniteFeedScroll() {
  const sentinel = getFeedSentinel();
  if (!sentinel || sentinel.dataset.infiniteBound) return;
  sentinel.dataset.infiniteBound = '1';
  sentinel.classList.add('feed-scroll-sentinel');
  sentinel.setAttribute('aria-hidden', 'true');
  if (sentinel.tagName === 'BUTTON') {
    sentinel.type = 'button';
    sentinel.tabIndex = -1;
    sentinel.textContent = '';
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry?.isIntersecting || !feedHasMore || feedLoadingMore) return;
    feedLoadingMore = true;
    feedPage += 1;
    refreshFeed();
    feedLoadingMore = false;
  }, { root: null, rootMargin: '240px 0px', threshold: 0 });

  observer.observe(sentinel);
}

function renderJourney(status) {
  const active = journeyIndexForStatus(status);
  return `<div class="journey">
    <h3 data-i18n="itemJourney">${t('itemJourney')}</h3>
    <ol class="journey-list">
      ${JOURNEY_KEYS.map((key, i) => `
        <li class="journey-step ${i < active ? 'done' : ''} ${i === active ? 'current' : ''}">
          <span class="journey-dot"></span>
          <span data-i18n="${key}">${t(key)}</span>
        </li>`).join('')}
    </ol>
  </div>`;
}

function renderSevenDayProgress(day) {
  const d = Math.min(Math.max(day || 1, 1), 7);
  const pct = Math.round((d / 7) * 100);
  return `<div class="seven-day-box">
    <div class="seven-day-head">
      <strong data-i18n="verificationInProgress">${t('verificationInProgress')}</strong>
      <span>${t('dayOfSeven', { n: d })}</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <p class="form-note" data-i18n="minPeriodWarning">${t('minPeriodWarning')}</p>
  </div>`;
}

function renderTrustStrip() {
  return `<div class="trust-strip">
    <span data-i18n="trustAdmin">${t('trustAdmin')}</span>
    <span data-i18n="trustHandover">${t('trustHandover')}</span>
  </div>`;
}

function renderFinderSuccessCard(isExample) {
  return `<div class="finder-success-card ${isExample ? 'is-example' : ''}">
    ${isExample ? `<p class="form-note" data-i18n="finderSuccessExample">${t('finderSuccessExample')}</p>` : ''}
    <div class="finder-success-emoji">🎉</div>
    <h3 data-i18n="finderSuccessTitle">${t('finderSuccessTitle')}</h3>
    <p data-i18n="finderSuccessBody">${t('finderSuccessBody')}</p>
    <p class="reward-chip" data-i18n="finderSuccessPoints">${t('finderSuccessPoints')}</p>
  </div>`;
}

function initMobileFilters() {
  if (!['home', 'lost', 'found'].includes(currentPageName)) return;
  if (document.getElementById('mobile-filter-btn')) return;

  const main = document.querySelector('.main-content');
  if (!main) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'mobile-filter-btn';
  btn.className = 'btn btn-secondary btn-block mobile-only-filters';
  btn.innerHTML = `🔍 <span data-i18n="filtersOpen">${t('filtersOpen')}</span>`;
  main.insertBefore(btn, main.firstChild);

  const sheetTitleKey = currentPageName === 'lost' ? 'filterLostItems' : currentPageName === 'found' ? 'filterFoundItems' : 'filterFeedItems';
  const sheet = document.createElement('div');
  sheet.id = 'mobile-filter-sheet';
  sheet.className = 'mobile-filter-sheet';
  sheet.innerHTML = `
    <div class="mobile-filter-backdrop" id="mobile-filter-close"></div>
    <div class="mobile-filter-panel">
      <div class="mobile-filter-head">
        <strong data-i18n="${sheetTitleKey}">${t(sheetTitleKey)}</strong>
        <button type="button" class="btn btn-ghost btn-sm" id="mobile-filter-done" data-i18n="applyFilters">${t('applyFilters')}</button>
      </div>
      <div id="mobile-filter-body"></div>
    </div>`;
  document.body.appendChild(sheet);

  const syncBody = () => {
    const panel = document.querySelector('#sidebar-left .search-filter-card');
    const body = document.getElementById('mobile-filter-body');
    if (panel && body) body.innerHTML = panel.innerHTML;
    initFilters();
    initSearch();
  };

  const open = () => { syncBody(); sheet.classList.add('open'); };
  const close = () => sheet.classList.remove('open');

  btn.addEventListener('click', open);
  sheet.querySelector('#mobile-filter-close')?.addEventListener('click', close);
  sheet.querySelector('#mobile-filter-done')?.addEventListener('click', () => {
    const body = document.getElementById('mobile-filter-body');
    const panel = document.querySelector('#sidebar-left .search-filter-card');
    if (body && panel) {
      ['sidebar-search', 'filter-location', 'filter-date', 'filter-type', 'filter-subcategory'].forEach(id => {
        const from = body.querySelector(`#${id}`);
        const to = panel.querySelector(`#${id}`);
        if (from && to) to.value = from.value;
      });
      const activeCat = body.querySelector('.category-item.active');
      if (activeCat) {
        panel.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
        panel.querySelector(`.category-item[data-category="${activeCat.dataset.category || ''}"]`)?.classList.add('active');
        currentFeedFilters.category = activeCat.dataset.category || '';
      }
    }
    panel?.querySelector('#apply-filters')?.click();
    close();
  });
}

var _iconCache = {};
function iconSearch() {
  if (!_iconCache.search) _iconCache.search = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';
  return _iconCache.search;
}

function iconBell() {
  if (!_iconCache.bell) _iconCache.bell = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"></path><path d="M10 19a2 2 0 0 0 4 0"></path></svg>';
  return _iconCache.bell;
}

function iconGlobe() {
  if (!_iconCache.globe) _iconCache.globe = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>';
  return _iconCache.globe;
}

function iconArrow() {
  if (!_iconCache.arrow) _iconCache.arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg>';
  return _iconCache.arrow;
}

/** Lost — map pin (looking for location) */
function iconLost() {
  if (!_iconCache.lost) _iconCache.lost = '<svg class="icon-lost" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>';
  return _iconCache.lost;
}

/** Found — check circle */
function iconFound() {
  if (!_iconCache.found) _iconCache.found = '<svg class="icon-found" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8.5 12.5l2.5 2.5 4.5-5"></path></svg>';
  return _iconCache.found;
}

/** Post — plus in circle */
function iconPost() {
  if (!_iconCache.post) _iconCache.post = '<svg class="icon-post" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>';
  return _iconCache.post;
}

function iconHome() {
  if (!_iconCache.home) _iconCache.home = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"></path></svg>';
  return _iconCache.home;
}

function iconProfile() {
  if (!_iconCache.profile) _iconCache.profile = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M5 20a7 7 0 0 1 14 0"></path></svg>';
  return _iconCache.profile;
}

function typeBadge(isLost) {
  return isLost
    ? `<span class="type-badge type-lost">${iconLost()} <span data-i18n="lostOnly">${t('lostOnly')}</span></span>`
    : `<span class="type-badge type-found">${iconFound()} <span data-i18n="foundOnly">${t('foundOnly')}</span></span>`;
}

function iconAll() {
  if (!_iconCache.all) _iconCache.all = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>';
  return _iconCache.all;
}

function iconDevices() {
  if (!_iconCache.devices) _iconCache.devices = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></svg>';
  return _iconCache.devices;
}

function iconDocuments() {
  if (!_iconCache.documents) _iconCache.documents = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"></path><path d="M14 3v5h5"></path><path d="M9 13h6M9 17h6"></path></svg>';
  return _iconCache.documents;
}

function iconAnimals() {
  if (!_iconCache.animals) _iconCache.animals = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="5"></circle><circle cx="7" cy="8" r="2.2"></circle><circle cx="17" cy="8" r="2.2"></circle><path d="M10 15.5h4"></path></svg>';
  return _iconCache.animals;
}

function iconAccessories() {
  if (!_iconCache.accessories) _iconCache.accessories = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="9" width="14" height="11" rx="2"></rect><path d="M8 9V7a4 4 0 0 1 8 0v2"></path></svg>';
  return _iconCache.accessories;
}

function iconVehicle() {
  if (!_iconCache.vehicle) _iconCache.vehicle = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5"></path><path d="M3 14h18v3a1 1 0 0 1-1 1h-1"></path><circle cx="7.5" cy="17.5" r="1.5"></circle><circle cx="16.5" cy="17.5" r="1.5"></circle></svg>';
  return _iconCache.vehicle;
}

function iconKeys() {
  if (!_iconCache.keys) _iconCache.keys = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4"></circle><path d="M11 13l9-9M17 4l3 3M15 6l2 2"></path></svg>';
  return _iconCache.keys;
}

function iconOther() {
  if (!_iconCache.other) _iconCache.other = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8l8-4 8 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"></path><path d="M4 8l8 4 8-4M12 12v9"></path></svg>';
  return _iconCache.other;
}

function categoryIcon(id) {
  const map = {
    devices: iconDevices,
    documents: iconDocuments,
    animals: iconAnimals,
    accessories: iconAccessories,
    vehicle: iconVehicle,
    keys: iconKeys,
    other: iconOther
  };
  return (map[id] || iconOther)();
}

function iconSettings() {
  if (!_iconCache.settings) _iconCache.settings = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>';
  return _iconCache.settings;
}

function iconHistory() {
  if (!_iconCache.history) _iconCache.history = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>';
  return _iconCache.history;
}

function iconRewards() {
  if (!_iconCache.rewards) _iconCache.rewards = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 14.8 7.8 16l.8-4.7L5.2 8l4.7-.7L12 3z"></path></svg>';
  return _iconCache.rewards;
}

function iconTheme() {
  if (!_iconCache.theme) _iconCache.theme = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"></path></svg>';
  return _iconCache.theme;
}

function iconLogout() {
  if (!_iconCache.logout) _iconCache.logout = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"></path><path d="M14 12H4"></path><path d="M16 8l4 4-4 4"></path></svg>';
  return _iconCache.logout;
}

function iconChevron() {
  if (!_iconCache.chevron) _iconCache.chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>';
  return _iconCache.chevron;
}

function iconLogin() {
  if (!_iconCache.login) _iconCache.login = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"></path><path d="M10 12h10"></path><path d="M8 8l-4 4 4 4"></path></svg>';
  return _iconCache.login;
}

function iconHelpGuide() {
  if (!_iconCache.helpGuide) _iconCache.helpGuide = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 16v-1"></path><path d="M12 13a2.5 2.5 0 1 0-1.5-4.5"></path></svg>';
  return _iconCache.helpGuide;
}

function iconHelpSupport() {
  if (!_iconCache.helpSupport) _iconCache.helpSupport = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2"></path><path d="M4 12v5a2 2 0 0 0 2 2h2"></path><circle cx="9" cy="17" r="1"></circle><circle cx="15" cy="17" r="1"></circle></svg>';
  return _iconCache.helpSupport;
}

function applyLanguage(next) {
  if (!next || next === getLang()) return;
  setLang(next);
  if (currentPageName && !['welcome', 'login', 'signup'].includes(currentPageName)) {
    refreshChrome(currentPageName);
    refreshDynamicPage(currentPageName);
  } else {
    applyTranslations();
  }
}

function renderNavLangMenu() {
  const lang = getLang();
  return `
    <div class="lang-menu-wrap">
      <button type="button" class="nav-lang-btn" id="lang-menu-toggle"
        title="${t('language')}" aria-label="${t('language')}" aria-expanded="false" aria-haspopup="true">
        <span class="nav-lang-icon" aria-hidden="true">${iconGlobe()}</span>
      </button>
      <div class="lang-menu" id="lang-menu" role="menu" hidden>
        <div class="help-menu-card">
          <button type="button" class="lang-menu-item ${lang === 'en' ? 'active' : ''}" data-set-lang="en" role="menuitem">
            <span data-i18n="english">${t('english')}</span>
          </button>
          <button type="button" class="lang-menu-item ${lang === 'ne' ? 'active' : ''}" data-set-lang="ne" role="menuitem">
            <span data-i18n="nepali">${t('nepali')}</span>
          </button>
        </div>
      </div>
    </div>`;
}

function renderAccountHelpItems() {
  const base = getBasePath();
  return `
    <a href="${base}how-it-works.html" class="account-menu-item" role="menuitem">
      <span class="account-menu-icon">${iconHelpGuide()}</span>
      <span data-i18n="howItWorks">${t('howItWorks')}</span>
      <span class="account-menu-chevron">${iconChevron()}</span>
    </a>
    <a href="${base}help.html" class="account-menu-item" role="menuitem">
      <span class="account-menu-icon">${iconHelpSupport()}</span>
      <span data-i18n="helpSupport">${t('helpSupport')}</span>
      <span class="account-menu-chevron">${iconChevron()}</span>
    </a>`;
}

function closeLangMenu() {
  const menu = document.getElementById('lang-menu');
  const toggle = document.getElementById('lang-menu-toggle');
  if (menu) {
    menu.classList.remove('open');
    menu.hidden = true;
  }
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.classList.remove('active');
}

function openLangMenu() {
  const menu = document.getElementById('lang-menu');
  const toggle = document.getElementById('lang-menu-toggle');
  if (!menu) return;
  closeAccountMenu();
  closeNotificationsMenu();
  menu.hidden = false;
  menu.classList.add('open');
  toggle?.setAttribute('aria-expanded', 'true');
  toggle?.classList.add('active');
}

function renderAccountMenu(activePage) {
  const base = getBasePath();
  const user = getDisplayUser();
  const avatarContent = user && user.profilePicture
    ? `<img src="${user.profilePicture}" alt="">`
    : getInitials(user ? user.fullName : '?');
  const themeLabel = getTheme() === 'dark' ? t('lightMode') : t('darkMode');

  if (!user) {
    return `
      <div class="account-menu-wrap">
        <button type="button" class="nav-avatar account-menu-toggle" id="account-menu-toggle"
          aria-expanded="false" aria-haspopup="true" aria-label="${t('account')}">${avatarContent}</button>
        <div class="account-menu" id="account-menu" role="menu" hidden>
          <div class="account-menu-card">
            <p class="account-menu-guest" data-i18n="loginRequired">${t('loginRequired')}</p>
            <a href="${base}login.html" class="account-menu-item" role="menuitem">
              <span class="account-menu-icon">${iconLogin()}</span>
              <span data-i18n="signIn">${t('signIn')}</span>
            </a>
            <a href="${base}signup.html" class="account-menu-item" role="menuitem">
              <span class="account-menu-icon">${iconProfile()}</span>
              <span data-i18n="signUp">${t('signUp')}</span>
            </a>
            <div class="account-menu-divider"></div>
            ${renderAccountHelpItems()}
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="account-menu-wrap">
      <button type="button" class="nav-avatar account-menu-toggle ${activePage === 'profile' ? 'active' : ''}" id="account-menu-toggle"
        aria-expanded="false" aria-haspopup="true" aria-label="${t('account')}">${avatarContent}</button>
      <div class="account-menu" id="account-menu" role="menu" hidden>
        <div class="account-menu-card">
          <a href="${base}profile.html" class="account-menu-profile" role="menuitem">
            <span class="account-menu-avatar">${avatarContent}</span>
            <span class="account-menu-profile-text">
              <strong>${user.fullName || t('profile')}</strong>
              <span>${displayUsername(user) || getPublicLocation(user)}</span>
            </span>
          </a>
          <a href="${base}profile.html" class="account-menu-profile-btn" role="menuitem" data-i18n="viewYourProfile">${t('viewYourProfile')}</a>
          <div class="account-menu-divider"></div>
          <a href="${base}settings.html" class="account-menu-item" role="menuitem">
            <span class="account-menu-icon">${iconSettings()}</span>
            <span data-i18n="settings">${t('settings')}</span>
            <span class="account-menu-chevron">${iconChevron()}</span>
          </a>
          <a href="${base}activity.html" class="account-menu-item" role="menuitem">
            <span class="account-menu-icon">${iconHistory()}</span>
            <span data-i18n="history">${t('history')}</span>
            <span class="account-menu-chevron">${iconChevron()}</span>
          </a>
          <a href="${base}rewards.html" class="account-menu-item" role="menuitem">
            <span class="account-menu-icon">${iconRewards()}</span>
            <span data-i18n="rewards">${t('rewards')}</span>
            <span class="account-menu-chevron">${iconChevron()}</span>
          </a>
          <a href="${base}edit-profile.html" class="account-menu-item" role="menuitem">
            <span class="account-menu-icon">${iconProfile()}</span>
            <span data-i18n="editProfile">${t('editProfile')}</span>
            <span class="account-menu-chevron">${iconChevron()}</span>
          </a>
          <button type="button" class="account-menu-item" id="account-theme-btn" role="menuitem">
            <span class="account-menu-icon">${iconTheme()}</span>
            <span id="account-theme-label">${themeLabel}</span>
          </button>
          <div class="account-menu-divider"></div>
          <a href="${base}office.html" class="account-menu-item" role="menuitem">
            <span class="account-menu-icon">${iconOffice()}</span>
            <span data-i18n="officeInfo">${t('officeInfo')}</span>
            <span class="account-menu-chevron">${iconChevron()}</span>
          </a>
          <div class="account-menu-divider"></div>
          ${renderAccountHelpItems()}
          <div class="account-menu-divider"></div>
          <button type="button" class="account-menu-item account-menu-logout" id="account-logout-btn" role="menuitem">
            <span class="account-menu-icon">${iconLogout()}</span>
            <span data-i18n="logout">${t('logout')}</span>
          </button>
        </div>
      </div>
    </div>`;
}

function closeAccountMenu() {
  const menu = document.getElementById('account-menu');
  const toggle = document.getElementById('account-menu-toggle');
  if (menu) {
    menu.classList.remove('open');
    menu.hidden = true;
  }
  toggle?.setAttribute('aria-expanded', 'false');
}

function openAccountMenu() {
  const menu = document.getElementById('account-menu');
  const toggle = document.getElementById('account-menu-toggle');
  if (!menu) return;
  closeNotificationsMenu();
  closeLangMenu();
  menu.hidden = false;
  menu.classList.add('open');
  toggle?.setAttribute('aria-expanded', 'true');
}

function getNotificationIcon(type) {
  const icons = { points: '⭐', delivered: '🎉', reward: '⭐', rejected: '❌', received: '📦', kyc: '📄', info: '📢', approved: '🔔', claim: '🙋' };
  return icons[type] || '🔔';
}

function renderNotificationItemsHtml(limit) {
  const items = getMyNotifications();
  const list = typeof limit === 'number' ? items.slice(0, limit) : items;
  if (!list.length) {
    return `<div class="notif-empty">${renderEmptyState('noNotifications', 'noNotificationsHint', '🔔')}</div>`;
  }
  return list.map(n => {
    const time = getLang() === 'ne' ? (n.timeNe || n.time) : n.time;
    return `<div class="notification-item ${n.read ? 'read' : 'unread'}">
      <div class="notif-icon">${getNotificationIcon(n.type)}</div>
      <div class="notif-content">
        <p data-i18n="${n.key}">${t(n.key)}</p>
        <span class="notif-time">${time || ''}</span>
      </div>
      ${n.read ? '' : '<span class="notif-unread-dot" aria-hidden="true"></span>'}
    </div>`;
  }).join('');
}

function renderNotificationsMenu(activePage) {
  const base = getBasePath();
  return `
    <div class="notif-menu-wrap">
      <button type="button" class="nav-icon-btn ${activePage === 'notifications' ? 'active' : ''}" id="notif-menu-toggle"
        title="${t('notifications')}" aria-label="${t('notifications')}" aria-expanded="false" aria-haspopup="true">
        ${iconBell()}<span class="nav-badge" id="notif-badge" hidden></span>
      </button>
      <div class="notif-menu" id="notif-menu" role="dialog" aria-label="${t('notifications')}" hidden>
        <div class="notif-menu-card">
          <div class="notif-menu-head">
            <h3 data-i18n="notifications">${t('notifications')}</h3>
            <button type="button" class="btn btn-ghost btn-sm" id="notif-mark-all" data-i18n="markAllRead">${t('markAllRead')}</button>
          </div>
          <div class="notif-menu-tabs">
            <button type="button" class="notif-tab active" data-notif-filter="all" data-i18n="all">${t('all')}</button>
            <button type="button" class="notif-tab" data-notif-filter="unread" data-i18n="unreadOnly">${t('unreadOnly')}</button>
          </div>
          <div class="notif-menu-list" id="notif-menu-list"></div>
          <div class="notif-menu-footer">
            <a href="${base}notifications.html" class="notif-see-all" data-i18n="seeAllNotifications">${t('seeAllNotifications')}</a>
          </div>
        </div>
      </div>
    </div>`;
}

function lazyLoadNotifications() {
  try {
    var notifs = getMyNotifications();
    var unread = notifs.filter(function(n) { return !n.read; }).length;
    var badge = document.getElementById('notif-badge');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread > 9 ? '9+' : String(unread);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }
  } catch(e) {}
}

function refreshNotificationsMenuList(filter) {
  const list = document.getElementById('notif-menu-list');
  if (!list) return;
  const mode = filter || list.dataset.filter || 'all';
  list.dataset.filter = mode;
  const items = getMyNotifications().filter(n => mode === 'unread' ? !n.read : true).slice(0, 8);
  if (!items.length) {
    list.innerHTML = `<div class="notif-empty">${renderEmptyState(mode === 'unread' ? 'noUnreadNotifications' : 'noNotifications', 'noNotificationsHint', '🔔')}</div>`;
    return;
  }
  list.innerHTML = items.map(n => {
    const time = getLang() === 'ne' ? (n.timeNe || n.time) : n.time;
    return `<div class="notification-item ${n.read ? 'read' : 'unread'}">
      <div class="notif-icon">${getNotificationIcon(n.type)}</div>
      <div class="notif-content">
        <p data-i18n="${n.key}">${t(n.key)}</p>
        <span class="notif-time">${time || ''}</span>
      </div>
      ${n.read ? '' : '<span class="notif-unread-dot" aria-hidden="true"></span>'}
    </div>`;
  }).join('');
}

function closeNotificationsMenu() {
  const menu = document.getElementById('notif-menu');
  const toggle = document.getElementById('notif-menu-toggle');
  if (menu) {
    menu.classList.remove('open');
    menu.hidden = true;
  }
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.classList.remove('active');
}

function openNotificationsMenu() {
  const menu = document.getElementById('notif-menu');
  const toggle = document.getElementById('notif-menu-toggle');
  if (!menu) return;
  closeAccountMenu();
  closeLangMenu();
  refreshNotificationsMenuList(document.getElementById('notif-menu-list')?.dataset.filter || 'all');
  menu.hidden = false;
  menu.classList.add('open');
  toggle?.setAttribute('aria-expanded', 'true');
  toggle?.classList.add('active');
}

let notificationsMenuBound = false;
function initNotificationsMenu() {
  if (notificationsMenuBound) return;
  notificationsMenuBound = true;

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#notif-menu-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      const menu = document.getElementById('notif-menu');
      if (menu?.classList.contains('open')) closeNotificationsMenu();
      else openNotificationsMenu();
      return;
    }

    if (e.target.closest('#notif-mark-all')) {
      e.preventDefault();
      markAllMyNotificationsRead();
      refreshNotificationsMenuList(document.getElementById('notif-menu-list')?.dataset.filter || 'all');
      document.querySelector('#notif-menu-toggle .nav-badge')?.remove();
      if (currentPageName === 'notifications') renderNotifications();
      return;
    }

    const tab = e.target.closest('.notif-tab');
    if (tab && tab.closest('#notif-menu')) {
      e.preventDefault();
      document.querySelectorAll('#notif-menu .notif-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      refreshNotificationsMenuList(tab.dataset.notifFilter || 'all');
      return;
    }

    if (!e.target.closest('.notif-menu-wrap')) closeNotificationsMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNotificationsMenu();
  });
}

let accountMenuBound = false;

function initAccountMenu() {
  if (accountMenuBound) return;
  accountMenuBound = true;

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#account-menu-toggle');
    const menu = document.getElementById('account-menu');

    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      if (menu?.classList.contains('open')) closeAccountMenu();
      else openAccountMenu();
      return;
    }

    if (e.target.closest('#account-logout-btn')) {
      e.preventDefault();
      logoutCurrentUser();
      window.location.href = `${getBasePath()}welcome.html`;
      return;
    }

    if (e.target.closest('#account-theme-btn')) {
      e.preventDefault();
      toggleTheme();
      const label = document.getElementById('account-theme-label');
      if (label) label.textContent = getTheme() === 'dark' ? t('lightMode') : t('darkMode');
      return;
    }

    if (!e.target.closest('.account-menu-wrap')) closeAccountMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAccountMenu();
  });
}

function getLangLabel(lang) {
  return lang === 'ne' ? t('nepali') : t('english');
}

function getGuestAuthReturnUrl() {
  const base = getBasePath();
  const params = new URLSearchParams(window.location.search || '');
  const from = (params.get('from') || '').toLowerCase();
  if (from === 'signup') return `${base}signup.html`;
  if (from === 'login') return `${base}login.html`;
  if (from === 'welcome') return `${base}welcome.html`;
  try {
    const ref = document.referrer || '';
    if (ref.includes('signup.html')) return `${base}signup.html`;
    if (ref.includes('login.html')) return `${base}login.html`;
    if (ref.includes('welcome.html')) return `${base}welcome.html`;
  } catch (_) { /* ignore */ }
  return `${base}login.html`;
}

function isGuestAuthHelpPage(page) {
  return !getCurrentUser() && ['help', 'how-it-works', 'privacy', 'terms'].includes(page);
}

function renderGuestBackBar() {
  const base = getBasePath();
  const backUrl = getGuestAuthReturnUrl();
  document.body.classList.add('guest-auth-help');

  const topNav = document.getElementById('top-nav');
  if (topNav) {
    topNav.className = 'guest-back-bar';
    topNav.id = 'guest-back-bar';
    topNav.innerHTML = `
      <a href="${backUrl}" class="guest-back-btn">
        <span class="guest-back-arrow" aria-hidden="true">←</span>
        <span data-i18n="back">${t('back')}</span>
      </a>
      <span class="guest-back-brand"><span class="brand-khoj">Khoj</span> <span class="brand-nepal">Nepal</span></span>
      <span class="guest-back-spacer" aria-hidden="true"></span>`;
  }

  const bottom = document.getElementById('bottom-nav');
  if (bottom) {
    bottom.innerHTML = '';
    bottom.hidden = true;
  }
  document.getElementById('site-utility-bar')?.remove();
  document.getElementById('site-footer')?.remove();
  document.getElementById('search-overlay')?.remove();
}

function renderTopNav(activePage) {
  const base = getBasePath();
  const nav = document.getElementById('top-nav');
  if (!nav) return;

  document.getElementById('site-utility-bar')?.remove();
  document.body.classList.remove('has-utility-bar');

  nav.innerHTML = `
    <div class="nav-left">
      <a href="${base}home.html" class="nav-brand">
        <img src="${base}assets/logo.png" alt="Khoj Nepal" class="nav-logo">
        <span class="brand-text"><span class="brand-khoj">Khoj</span> <span class="brand-nepal">Nepal</span></span>
      </a>
      <div class="nav-links desktop-only">
        <a href="${base}home.html" class="nav-link ${activePage === 'home' ? 'active' : ''}" data-i18n="home">${t('home')}</a>
        <a href="${base}lost.html" class="nav-link ${activePage === 'lost' ? 'active' : ''}">${iconLost()} <span data-i18n="lost">${t('lost')}</span></a>
        <a href="${base}found.html" class="nav-link ${activePage === 'found' ? 'active' : ''}">${iconFound()} <span data-i18n="found">${t('found')}</span></a>
        <a href="${base}post.html" class="nav-link ${activePage === 'post' ? 'active' : ''}">${iconPost()} <span data-i18n="post">${t('post')}</span></a>
      </div>
    </div>
    <div class="nav-right">
      <button class="nav-icon-btn" id="search-toggle" title="${t('search')}" aria-label="${t('search')}">${iconSearch()}</button>
      ${renderNotificationsMenu(activePage)}
      ${renderNavLangMenu()}
      ${renderAccountMenu(activePage)}
    </div>`;

  document.getElementById('site-footer')?.remove();
}

function renderBottomNav(activePage) {
  const base = getBasePath();
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="${base}home.html" class="bottom-nav-item ${activePage === 'home' ? 'active' : ''}"><span class="bn-icon bn-svg">${iconHome()}</span><span data-i18n="home">${t('home')}</span></a>
    <a href="${base}lost.html" class="bottom-nav-item ${activePage === 'lost' ? 'active' : ''}"><span class="bn-icon bn-svg">${iconLost()}</span><span data-i18n="lost">${t('lost')}</span></a>
    <a href="${base}found.html" class="bottom-nav-item ${activePage === 'found' ? 'active' : ''}"><span class="bn-icon bn-svg">${iconFound()}</span><span data-i18n="found">${t('found')}</span></a>
    <a href="${base}post.html" class="bottom-nav-item post-btn ${activePage === 'post' ? 'active' : ''}"><span class="bn-icon bn-svg bn-post-icon">${iconPost()}</span></a>
    <a href="${base}notifications.html" class="bottom-nav-item ${activePage === 'notifications' ? 'active' : ''}">
      <span class="bn-icon bn-svg">${iconBell()}</span>
    </a>
    <a href="${base}profile.html" class="bottom-nav-item ${activePage === 'profile' ? 'active' : ''}"><span class="bn-icon bn-svg">${iconProfile()}</span><span data-i18n="profile">${t('profile')}</span></a>`;
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar-left');
  if (!sidebar) return;
  sidebar.hidden = false;

  if (!['home', 'lost', 'found'].includes(currentPageName)) {
    sidebar.innerHTML = '';
    sidebar.hidden = true;
    return;
  }

  sidebar.innerHTML = renderSearchFilterPanel();
}

function renderSearchFilterPanel() {
  const lang = getLang();
  const isLostPage = currentPageName === 'lost';
  const isFoundPage = currentPageName === 'found';
  const titleKey = isLostPage ? 'filterLostItems' : isFoundPage ? 'filterFoundItems' : 'filterFeedItems';
  const placeholderKey = isLostPage ? 'searchLostItems' : isFoundPage ? 'searchFoundItems' : 'searchFeedItems';
  const cats = CATEGORIES.map(c =>
    `<button type="button" class="category-item" data-category="${c.id}">
      <span class="cat-icon">${categoryIcon(c.id)}</span>
      <span>${lang === 'ne' ? c.ne : c.en}</span>
    </button>`
  ).join('');

  const typeFilter = (isLostPage || isFoundPage) ? '' : `
      <div class="filter-group">
        <label data-i18n="filterType">${t('filterType')}</label>
        <select id="filter-type" class="form-select">
          <option value="all">${t('all')}</option>
          <option value="lost">${t('lostOnly')}</option>
          <option value="found">${t('foundOnly')}</option>
        </select>
      </div>`;

  return `
    <div class="sidebar-card search-filter-card">
      <h4 data-i18n="${titleKey}">${t(titleKey)}</h4>
      <div class="filter-group">
        <label data-i18n="search">${t('search')}</label>
        <input type="text" class="form-input" id="sidebar-search" data-i18n-placeholder="${placeholderKey}" placeholder="${t(placeholderKey)}">
      </div>
      <div class="filter-group">
        <label data-i18n="categories">${t('categories')}</label>
        <button type="button" class="category-item active" data-category="">
          <span class="cat-icon">${iconAll()}</span>
          <span data-i18n="all">${t('all')}</span>
        </button>
        <div class="category-list">${cats}</div>
      </div>
      ${typeFilter}
      <div class="filter-group">
        <label data-i18n="filterSubcategory">${t('filterSubcategory')}</label>
        <select id="filter-subcategory" class="form-select"><option value="">${t('all')}</option></select>
      </div>
      <div class="filter-group">
        <label data-i18n="filterLocation">${t('filterLocation')}</label>
        <input type="text" id="filter-location" class="form-input" data-i18n-placeholder="locationPlaceholder" placeholder="${t('locationPlaceholder')}">
      </div>
      <div class="filter-group">
        <label data-i18n="filterDate">${t('filterDate')}</label>
        <input type="date" id="filter-date" class="form-input">
      </div>
      <button type="button" class="btn btn-primary btn-block" id="apply-filters" data-i18n="applyFilters">${t('applyFilters')}</button>
      <button type="button" class="btn btn-ghost btn-block" id="clear-filters" data-i18n="clearFilters">${t('clearFilters')}</button>
    </div>`;
}

function iconOffice() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V7l8-4 8 4v14"></path><path d="M9 21v-6h6v6"></path><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01"></path></svg>`;
}

function renderSidebarRight() {
  const sidebar = document.getElementById('sidebar-right');
  if (!sidebar) return;
  const user = getDisplayUser();
  const points = user ? (user.points || 0) : 0;
  const level = getUserLevel(points);
  const lang = getLang();

  sidebar.innerHTML = `
    <div class="sidebar-card points-card">
      <h4 data-i18n="yourPoints">${t('yourPoints')}</h4>
      <div class="points-display">
        <span class="points-icon">⭐</span>
        <span class="points-value">${points}</span>
        <span data-i18n="points">${t('points')}</span>
      </div>
      <p class="level-badge">${level.icon} ${lang === 'ne' ? level.ne : level.en}</p>
      <a href="${getBasePath()}rewards.html" class="btn btn-secondary btn-sm btn-block" data-i18n="rewards">${t('rewards')}</a>
    </div>
    <div class="sidebar-card office-card">
      <div class="office-card-head">
        <span class="office-card-icon">${iconOffice()}</span>
        <div>
          <h4 data-i18n="officeInfo">${t('officeInfo')}</h4>
          <p class="office-card-sub" data-i18n="officeSidebarSub">${t('officeSidebarSub')}</p>
        </div>
      </div>
      <ol class="office-flow">
        <li data-i18n="officeStepFinder">${t('officeStepFinder')}</li>
        <li data-i18n="officeStepOffice">${t('officeStepOffice')}</li>
        <li data-i18n="officeStepVerify">${t('officeStepVerify')}</li>
        <li data-i18n="officeStepOwner">${t('officeStepOwner')}</li>
      </ol>
      <p class="office-card-note" data-i18n="officeSidebarNote">${t('officeSidebarNote')}</p>
      <a href="${getBasePath()}office.html" class="btn btn-outline btn-sm btn-block office-card-cta">
        <span data-i18n="viewOfficeDetails">${t('viewOfficeDetails')}</span> ${iconArrow()}
      </a>
    </div>`;
}

function populateSubcategories(catId) {
  const select = document.getElementById('filter-subcategory');
  if (!select) return;
  const lang = getLang();
  select.innerHTML = `<option value="">${t('all')}</option>`;
  const cat = getCategory(catId);
  if (!cat) return;
  cat.subcategories.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = lang === 'ne' ? s.ne : s.en;
    select.appendChild(opt);
  });
}

let filtersBound = false;
let searchBound = false;

function initFilters() {
  if (!filtersBound) {
    document.addEventListener('click', (e) => {
      const catBtn = e.target.closest('.category-item');
      if (!catBtn) return;
      const inPanel = catBtn.closest('.search-filter-card') || catBtn.closest('#mobile-filter-body');
      if (!inPanel) return;
      inPanel.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
      catBtn.classList.add('active');
      currentFeedFilters.category = catBtn.dataset.category || '';
      currentFeedFilters.subcategory = '';
      populateSubcategories(currentFeedFilters.category);
      feedPage = 1;
      refreshFeed();
    });
    filtersBound = true;
  }

  document.getElementById('apply-filters')?.addEventListener('click', () => {
    if (document.getElementById('filter-type')) {
      currentFeedFilters.type = document.getElementById('filter-type').value || 'all';
    } else if (currentPageName === 'lost') {
      currentFeedFilters.type = 'lost';
    } else if (currentPageName === 'found') {
      currentFeedFilters.type = 'found';
    }
    currentFeedFilters.subcategory = document.getElementById('filter-subcategory')?.value || '';
    currentFeedFilters.location = document.getElementById('filter-location')?.value || '';
    currentFeedFilters.date = document.getElementById('filter-date')?.value || '';
    currentFeedFilters.query = document.getElementById('sidebar-search')?.value || '';
    feedPage = 1;
    refreshFeed();
  });

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    currentFeedFilters = { query: '', type: currentPageName === 'lost' ? 'lost' : currentPageName === 'found' ? 'found' : 'all', category: '', subcategory: '', location: '', date: '' };
    feedPage = 1;
    document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
    document.querySelector('.category-item[data-category=""]')?.classList.add('active');
    populateSubcategories('');
    const type = document.getElementById('filter-type');
    if (type) type.value = currentFeedFilters.type;
    ['filter-location', 'filter-date', 'sidebar-search'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    refreshFeed();
  });

  document.querySelectorAll('.feed-tab').forEach(tab => {
    if (tab.dataset.bound) return;
    tab.dataset.bound = '1';
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFeedFilters.type = tab.dataset.type || 'all';
      feedPage = 1;
      refreshFeed();
    });
  });
}

function ensureGlobalSearchOverlay() {
  let overlay = document.getElementById('search-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay';
    document.body.appendChild(overlay);
  }
  if (!overlay.querySelector('#global-search-results')) {
    overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-modal-title" data-i18n="globalSearchTitle">${t('globalSearchTitle')}</div>
        <div class="search-modal-header">
          <span class="search-modal-icon">${iconSearch()}</span>
          <input type="text" class="form-input" id="search-input" data-i18n-placeholder="globalSearchPlaceholder" placeholder="${t('globalSearchPlaceholder')}" autocomplete="off">
          <button type="button" class="search-close" id="search-close" aria-label="Close">✕</button>
        </div>
        <div id="global-recent-searches" class="global-recent-searches"></div>
        <div id="global-search-results" class="global-search-results"></div>
      </div>`;
    delete overlay.dataset.bound;
  }
  return overlay;
}

function getRecentSearches() {
  try {
    const raw = localStorage.getItem('khoj_nepal_recent_searches');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query) {
  const q = String(query || '').trim();
  if (!q) return;
  const list = getRecentSearches().filter(item => item.toLowerCase() !== q.toLowerCase());
  list.unshift(q);
  localStorage.setItem('khoj_nepal_recent_searches', JSON.stringify(list.slice(0, 5)));
}

function renderRecentSearches() {
  const box = document.getElementById('global-recent-searches');
  if (!box) return;
  const items = getRecentSearches();
  if (!items.length) {
    box.innerHTML = `<p class="form-note" data-i18n="noRecentSearches">${t('noRecentSearches')}</p>`;
    return;
  }
  box.innerHTML = `
    <h4 data-i18n="recentSearches">${t('recentSearches')}</h4>
    <div class="recent-search-list">
      ${items.map(q => `<button type="button" class="recent-search-chip" data-query="${q.replace(/"/g, '&quot;')}">${q}</button>`).join('')}
    </div>`;
  box.querySelectorAll('.recent-search-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('search-input');
      if (input) {
        input.value = btn.dataset.query || '';
        runGlobalSearch(input.value);
      }
    });
  });
}

function renderGlobalSearchResult(post) {
  const lang = getLang();
  const base = getBasePath();
  const title = lang === 'ne' && post.titleNe ? post.titleNe : post.title;
  const loc = lang === 'ne' && post.locationNe ? post.locationNe : post.location;
  const isLost = post.type === 'lost';
  return `<a href="${base}item-details.html?id=${post.id}" class="global-result-item">
    <div class="global-result-main">
      <strong>${title}</strong>
      <span class="global-result-meta">📍 ${loc || '—'}</span>
    </div>
    <span class="type-badge ${isLost ? 'type-lost' : 'type-found'}">${isLost ? iconLost() : iconFound()} ${isLost ? t('lostOnly') : t('foundOnly')}</span>
  </a>`;
}

function runGlobalSearch(query) {
  const resultsBox = document.getElementById('global-search-results');
  if (!resultsBox) return;
  const q = String(query || '').trim();
  const recentBox = document.getElementById('global-recent-searches');

  if (!q) {
    resultsBox.innerHTML = '';
    if (recentBox) recentBox.style.display = '';
    renderRecentSearches();
    return;
  }

  if (recentBox) recentBox.style.display = 'none';
  const matches = filterPosts(getCommunityAndMyPosts(), { query: q, type: 'all' });
  if (!matches.length) {
    resultsBox.innerHTML = renderEmptyState('noSearchResults', 'tryAdjustFilters', '🔍');
    return;
  }
  resultsBox.innerHTML = `
    <h4 data-i18n="searchResults">${t('searchResults')}</h4>
    <div class="global-result-list">${matches.map(renderGlobalSearchResult).join('')}</div>`;
}

function initSearch() {
  const overlay = ensureGlobalSearchOverlay();
  const toggle = document.getElementById('search-toggle');
  const close = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');

  const openOverlay = () => {
    overlay.classList.add('open');
    const input = document.getElementById('search-input');
    renderRecentSearches();
    const resultsBox = document.getElementById('global-search-results');
    if (resultsBox && !(input && input.value.trim())) resultsBox.innerHTML = '';
    setTimeout(() => input?.focus(), 50);
  };
  const closeOverlay = () => overlay.classList.remove('open');

  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      openOverlay();
    });
  }
  if (close && !close.dataset.bound) {
    close.dataset.bound = '1';
    close.addEventListener('click', closeOverlay);
  }
  if (overlay && !overlay.dataset.bound) {
    overlay.dataset.bound = '1';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  if (searchInput && !searchInput.dataset.globalBound) {
    searchInput.dataset.globalBound = '1';
    searchInput.addEventListener('input', (e) => runGlobalSearch(e.target.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) saveRecentSearch(q);
        runGlobalSearch(q);
      }
      if (e.key === 'Escape') closeOverlay();
    });
  }

  /* Left panel search = filter current feed only (delegation covers mobile sheet clone) */
  if (!searchBound) {
    searchBound = true;
    document.addEventListener('input', (e) => {
      if (e.target?.id !== 'sidebar-search') return;
      const value = e.target.value;
      currentFeedFilters.query = value;
      document.querySelectorAll('input#sidebar-search').forEach(input => {
        if (input !== e.target) input.value = value;
      });
      feedPage = 1;
      refreshFeed();
    });
  }
}

function refreshChrome(page) {
  const p = page || currentPageName;
  renderTopNav(p);
  renderBottomNav(p);
  renderSidebar();
  renderSidebarRight();
  initFilters();
  initSearch();
  initAccountMenu();
  initNotificationsMenu();
  initLangMenu();
  initUtilityChrome();
}

let langMenuBound = false;
function initLangMenu() {
  if (langMenuBound) return;
  langMenuBound = true;

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#lang-menu-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      const menu = document.getElementById('lang-menu');
      if (menu?.classList.contains('open')) closeLangMenu();
      else openLangMenu();
      return;
    }

    const langItem = e.target.closest('[data-set-lang]');
    if (langItem) {
      e.preventDefault();
      applyLanguage(langItem.getAttribute('data-set-lang'));
      closeLangMenu();
      return;
    }

    if (!e.target.closest('.lang-menu-wrap')) closeLangMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLangMenu();
  });
}

function initUtilityChrome() {
  /* Site footer removed. */
}

function initLangToggle() {
  /* Language switching is handled from the nav and account menus. */
}

function refreshDynamicPage(page) {
  if (page === 'home' || page === 'lost' || page === 'found') {
    if (page === 'home') initHomeLoginGreeting();
    else personalizeHome();
    refreshFeed();
  }
  if (page === 'notifications') renderNotifications();
  if (page === 'item-details') renderItemDetails();
  if (page === 'profile') renderOwnerProfile();
  if (page === 'rewards') personalizeRewards();
  if (page === 'activity') renderActivity();
  if (page === 'claim') {
    applyTranslations();
    const dayBox = document.getElementById('claim-progress');
    if (dayBox) dayBox.innerHTML = renderSevenDayProgress(1);
  }
  if (page === 'office') renderOffice();
  if ((page === 'how-it-works' || page === 'help') && typeof initHelpPages === 'function') {
    initHelpPages(page);
  }
  applyTranslations();
}

function initImagePreview() {
  const fileInput = document.getElementById('item-image');
  const preview = document.getElementById('image-preview');
  if (!fileInput || !preview || fileInput.dataset.previewBound) return;
  fileInput.dataset.previewBound = '1';
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) { preview.innerHTML = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      delete preview.dataset.existing;
      preview.innerHTML = `<img src="${ev.target.result}" alt="Preview"><button type="button" class="preview-remove" id="remove-preview">✕</button>`;
      document.getElementById('remove-preview')?.addEventListener('click', () => {
        fileInput.value = '';
        preview.innerHTML = '';
        delete preview.dataset.existing;
      });
    };
    reader.readAsDataURL(file);
  });
}

function initClaimSteps() {
  let step = 1;
  const total = 3;
  const panels = document.querySelectorAll('.claim-step-panel');
  const indicators = document.querySelectorAll('.step-dot');
  const btnBack = document.getElementById('claim-back');
  const btnNext = document.getElementById('claim-next');
  const progress = document.getElementById('claim-progress');
  const postId = new URLSearchParams(window.location.search).get('id');
  const post = getPostById(postId)
    || (typeof getMyPostById === 'function' ? getMyPostById(postId) : null)
    || (typeof getAllUserPosts === 'function' ? getAllUserPosts().find(p => String(p.id) === String(postId)) : null);

  if (!post) {
    const wrap = document.querySelector('.claim-container') || document.querySelector('.main-content');
    if (wrap) {
      wrap.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Post not found</h3>
        <p class="empty-hint">This item is not in the database. Open a Found item from Home / Found (real posts), then claim again.</p>
        <a href="found.html" class="btn btn-primary mt-16">Browse Found Items</a>
      </div>`;
    }
    return;
  }

  const waitBanner = document.getElementById('claim-wait-banner');
  const claimFormWrap = document.getElementById('claim-form-wrap') || document.querySelector('.claim-container');

  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (currentUser) {
    const kycStatus = currentUser.kycStatus || 'none';
    if (kycStatus !== 'verified') {
      const wrap = document.querySelector('.claim-container') || document.querySelector('.main-content');
      let kycMsg = '';
      let kycBtnLabel = typeof t === 'function' ? t('submitKyc') : 'Complete KYC';
      if (kycStatus === 'pending') {
        kycMsg = typeof t === 'function' ? t('kycStatusPending') : 'KYC pending admin review. You can claim once verified.';
      } else if (kycStatus === 'rejected') {
        kycMsg = typeof t === 'function' ? t('kycStatusRejected') : 'KYC rejected. Please resubmit with valid documents.';
        kycBtnLabel = typeof t === 'function' ? t('resubmitKyc') : 'Resubmit KYC';
      } else {
        kycMsg = typeof t === 'function' ? t('kycStatusNone') : 'KYC not completed. You must verify your identity before claiming.';
      }
      if (wrap) {
        wrap.innerHTML = `<div class="empty-state">
          <div class="empty-icon">🔒</div>
          <h3>${typeof t === 'function' ? t('kycVerification') : 'KYC Verification Required'}</h3>
          <p class="empty-hint">${kycMsg}</p>
          <a href="kyc.html" class="btn btn-primary mt-16">${kycBtnLabel}</a>
          <a href="found.html" class="btn btn-ghost mt-8">${typeof t === 'function' ? t('back') : 'Back'}</a>
        </div>`;
      }
      return;
    }
  }

  const eligible = typeof isClaimWaitingComplete === 'function' ? isClaimWaitingComplete(post) : true;
  if (waitBanner && post) {
    const age = typeof getPostAgeDays === 'function' ? getPostAgeDays(post) : 0;
    const day = Math.min(7, Math.max(1, age + 1));
    if (eligible) {
      waitBanner.innerHTML = `<div class="privacy-notice">🟢 ${t('claimWaitingComplete')}</div>`;
    } else {
      waitBanner.innerHTML = `<div class="admin-warning">
        <strong>🔒 ${t('claimUnavailable')}</strong>
        <p>${t('claimWaitingPeriod')}</p>
        <div class="mt-16">${renderSevenDayProgress(day)}</div>
      </div>`;
      document.querySelectorAll('.claim-step-panel, .step-indicator, .claim-nav-buttons, #claim-progress').forEach(el => {
        if (el) el.style.display = 'none';
      });
      const nav = document.querySelector('.claim-actions') || document.getElementById('claim-nav');
      if (nav) nav.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
      if (btnBack) btnBack.style.display = 'none';
      return;
    }
  }
  if (progress) progress.innerHTML = '';

  const user = getCurrentUser();
  if (user) {
    const set = (id, v) => { const el = document.getElementById(id); if (el && !el.value) el.value = v || ''; };
    set('claim-name', user.fullName);
    set('claim-phone', user.mobile);
    set('claim-email', user.email);
  }

  function bindKycPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview || input.dataset.bound) return;
    input.dataset.bound = '1';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) { preview.hidden = true; preview.removeAttribute('src'); return; }
      if (file.type.startsWith('image/')) {
        preview.src = await readFileAsDataURL(file);
        preview.hidden = false;
      } else {
        preview.hidden = true;
      }
    });
  }
  bindKycPreview('claim-proof', 'claim-proof-preview');

  if (post.status === 'claim_pending' && waitBanner) {
    waitBanner.insertAdjacentHTML('beforeend',
      `<div class="admin-warning mt-16"><strong>🟠 ${t('claimInProgressBanner')}</strong><p>${t('claimInProgressHint')}</p></div>`);
  }

  function fillReviewSummary() {
    const box = document.getElementById('claim-review-summary');
    if (!box) return;
    const name = document.getElementById('claim-name')?.value || '—';
    const phone = document.getElementById('claim-phone')?.value || '—';
    const email = document.getElementById('claim-email')?.value || '—';
    const address = document.getElementById('claim-address')?.value || '—';
    const why = document.getElementById('claim-why')?.value || '—';
    const details = document.getElementById('claim-details')?.value || '—';
    const proofOk = document.getElementById('claim-proof')?.files?.length ? '✓' : t('optional');
    box.innerHTML = `
      <div class="detail-row"><strong data-i18n="fullName">${t('fullName')}</strong>: ${name}</div>
      <div class="detail-row"><strong data-i18n="mobileNumber">${t('mobileNumber')}</strong>: ${phone}</div>
      <div class="detail-row"><strong data-i18n="emailAddress">${t('emailAddress')}</strong>: ${email}</div>
      <div class="detail-row"><strong data-i18n="address">${t('address')}</strong>: ${address}</div>
      <div class="detail-row"><strong data-i18n="whyBelong">${t('whyBelong')}</strong>: ${why}</div>
      <div class="detail-row"><strong data-i18n="claimOwnershipEvidence">${t('claimOwnershipEvidence')}</strong>: ${details}</div>
      <div class="detail-row"><strong data-i18n="claimProofPhoto">${t('claimProofPhoto')}</strong>: ${proofOk}</div>`;
  }

  function showStep(n) {
    panels.forEach((p, i) => p.classList.toggle('active', i + 1 === n));
    indicators.forEach((d, i) => {
      d.classList.toggle('done', i + 1 < n);
      d.classList.toggle('active', i + 1 === n);
    });
    if (btnBack) btnBack.style.display = n === 1 ? 'none' : '';
    if (btnNext) btnNext.textContent = n === total ? t('submitClaim') : t('next');
    if (n === 4) fillReviewSummary();
  }

  function validateStep(n) {
    if (n === 1) {
      if (!document.getElementById('claim-name')?.value.trim()) return false;
      if (!document.getElementById('claim-phone')?.value.trim()) return false;
      if (!document.getElementById('claim-email')?.value.trim()) return false;
      if (!document.getElementById('claim-address')?.value.trim()) return false;
    }
    if (n === 2) {
      if (!document.getElementById('claim-why')?.value.trim()) return false;
      if (!document.getElementById('claim-details')?.value.trim()) return false;
    }
    return true;
  }

  btnNext?.addEventListener('click', async () => {
    if (step < total) {
      if (!validateStep(step)) {
        showNotification(t('notifErrorRequiredFields'), 'warning');
        return;
      }
      step++;
      showStep(step);
      return;
    }
    const current = getCurrentUser();
    if (!current) {
      showNotification(t('notifErrorGeneric'), 'warning');
      window.location.href = 'login.html';
      return;
    }
    const postId = new URLSearchParams(window.location.search).get('id');
    const livePost = (typeof findPostById === 'function' ? findPostById(postId) : null)
      || getPostById(postId)
      || (typeof getAllUserPosts === 'function' ? getAllUserPosts().find(p => String(p.id) === String(postId)) : null);
    if (!livePost || livePost.fromMock) {
      showNotification(t('communitySampleNote'), 'info');
      window.location.href = 'found.html';
      return;
    }
    const proofFile = document.getElementById('claim-proof')?.files?.[0];
    const proofImage = proofFile ? await readFileAsDataURL(proofFile) : null;
    const name = document.getElementById('claim-name')?.value.trim();
    const why = document.getElementById('claim-why')?.value.trim() || '';
    const details = document.getElementById('claim-details')?.value.trim() || '';
    try {
      saveMyClaim({
        id: Date.now(),
        ownerId: current.id,
        postId: livePost.id,
        itemTitle: livePost.title || t('claimTitle'),
        status: 'under_review',
        investigation: 'normal',
        dayOfSeven: 1,
        submittedDate: new Date().toISOString().slice(0, 10),
        claimantName: name,
        claimant: {
          name,
          phone: document.getElementById('claim-phone')?.value.trim() || '',
          email: document.getElementById('claim-email')?.value.trim() || '',
          address: document.getElementById('claim-address')?.value.trim() || ''
        },
        ownership: `${why}\n\n${details}`.trim(),
        proofImage,
        kycVerified: false,
        notes: '',
        history: [
          { date: new Date().toISOString().slice(0, 10), key: 'histClaimSubmitted' }
        ]
      });
    } catch (err) {
      showNotification(t('notifErrorClaimFailed'), 'error');
      return;
    }
    document.querySelectorAll('.claim-timeline .timeline-item').forEach((el, i) => {
      el.classList.toggle('done', i < 2);
      el.classList.toggle('active', i === 2);
      el.classList.toggle('pending', i > 2);
    });
    if (progress) progress.innerHTML = renderSevenDayProgress(1);
    showNotification(t('notifClaimSubmitted'), 'success');
    setTimeout(function () { window.location.href = 'activity.html'; }, 1200);
  });
  btnBack?.addEventListener('click', () => { if (step > 1) { step--; showStep(step); } });
  showStep(1);
}

function initPostForm() {
  const form = document.getElementById('post-form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      showNotification(t('notifErrorGeneric'), 'warning');
      window.location.href = 'login.html';
      return;
    }
    const type = form.dataset.type || new URLSearchParams(window.location.search).get('type') || 'lost';
    const imageInput = document.getElementById('item-image');
    if (type === 'found' && !imageInput?.files?.length) {
      showNotification(t('notifErrorPhotoRequired'), 'warning');
      return;
    }
    const textFields = [...form.querySelectorAll('input.form-input')].filter(i => i.type === 'text' || i.type === '');
    const title = (textFields[0]?.value || '').trim() || 'Untitled item';
    const location = (textFields[1]?.value || '').trim();
    const description = (form.querySelector('textarea')?.value || '').trim();
    const category = document.getElementById('category-select')?.value || 'other';
    const subcategory = document.getElementById('subcategory-select')?.value || '';
    const dateVal = form.querySelector('input[type="date"]')?.value || new Date().toISOString().slice(0, 10);
    let image = null;
    if (imageInput?.files?.length) image = await readFileAsDataURL(imageInput.files[0]);

    const post = {
      id: Date.now(),
      ownerId: user.id,
      type,
      status: 'pending',
      userId: user.id,
      userName: user.fullName,
      userAvatar: getInitials(user.fullName),
      location,
      locationNe: location,
      time: 'Just now',
      timeNe: 'अहिले',
      title,
      titleNe: title,
      description,
      descriptionNe: description,
      category,
      subcategory,
      date: dateVal,
      image
    };
    const submitBtn = form.querySelector('button[type="submit"]') || document.getElementById('submit-btn');
    if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, true, 'Posting...');
    if (typeof showPageLoading === 'function') showPageLoading('Publishing your post...');
    try {
      if (typeof saveMyPostAsync === 'function') await saveMyPostAsync(post);
      else saveMyPost(post);
      showNotification(t('notifPostSubmitted'), 'success');
      setTimeout(function () { window.location.href = 'home.html'; }, 1200);
    } catch (err) {
      if (typeof hidePageLoading === 'function') hidePageLoading();
      if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false);
      showNotification(t('notifErrorPostFailed'), 'error');
    }
  });
}

function initEditPostForm() {
  const form = document.getElementById('edit-post-form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';

  const id = new URLSearchParams(window.location.search).get('id');
  const errorBox = document.getElementById('edit-post-error');
  const post = (typeof getMyPostById === 'function' ? getMyPostById(id) : null)
    || (typeof getPostById === 'function' ? getPostById(id) : null);
  const cancel = document.getElementById('edit-cancel');

  function showError(msg) {
    if (!errorBox) return;
    errorBox.style.display = '';
    errorBox.textContent = msg;
  }

  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }
  if (!post) {
    showError(t('editPostNotFound'));
    form.hidden = true;
    return;
  }

  const type = post.type === 'found' ? 'found' : 'lost';
  form.dataset.type = type;
  document.getElementById('edit-post-id').value = post.id;
  document.getElementById('edit-title').value = post.title || '';
  document.getElementById('edit-description').value = post.description || '';
  document.getElementById('edit-location').value = post.location || '';
  document.getElementById('edit-date').value = post.date || '';
  if (cancel) cancel.href = `item-details.html?id=${post.id}`;

  document.getElementById('location-label')?.setAttribute('data-i18n', type === 'lost' ? 'locationLost' : 'locationFound');
  document.getElementById('date-label')?.setAttribute('data-i18n', type === 'lost' ? 'dateLost' : 'dateFound');
  if (type === 'found') {
    const req = document.getElementById('img-required');
    const note = document.getElementById('photo-note');
    if (req) req.style.display = 'inline';
    if (note) note.style.display = 'block';
  }

  const catSelect = document.getElementById('category-select');
  const subSelect = document.getElementById('subcategory-select');
  const lang = getLang();

  function fillSubs(catId, selectedSub) {
    if (!subSelect) return;
    subSelect.innerHTML = '';
    const cat = getCategory(catId);
    if (!cat) return;
    cat.subcategories.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = lang === 'ne' ? s.ne : s.en;
      if (selectedSub && s.id === selectedSub) opt.selected = true;
      subSelect.appendChild(opt);
    });
  }

  if (catSelect) {
    catSelect.innerHTML = '';
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = lang === 'ne' ? c.ne : c.en;
      if (c.id === post.category) opt.selected = true;
      catSelect.appendChild(opt);
    });
    fillSubs(catSelect.value || post.category, post.subcategory);
    catSelect.addEventListener('change', () => fillSubs(catSelect.value));
  }

  const preview = document.getElementById('image-preview');
  if (preview && post.image) {
    preview.innerHTML = `<img src="${post.image}" alt="Preview"><button type="button" class="preview-remove" id="remove-preview">✕</button>`;
    preview.dataset.existing = post.image;
    document.getElementById('remove-preview')?.addEventListener('click', () => {
      const fileInput = document.getElementById('item-image');
      if (fileInput) fileInput.value = '';
      preview.innerHTML = '';
      delete preview.dataset.existing;
    });
  }

  initImagePreview();
  applyTranslations();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.style.display = 'none';
    const title = (document.getElementById('edit-title')?.value || '').trim();
    const location = (document.getElementById('edit-location')?.value || '').trim();
    const description = (document.getElementById('edit-description')?.value || '').trim();
    const category = catSelect?.value || 'other';
    const subcategory = subSelect?.value || '';
    const dateVal = document.getElementById('edit-date')?.value || '';
    const imageInput = document.getElementById('item-image');
    let image = preview?.dataset.existing || null;
    if (imageInput?.files?.length) {
      image = await readFileAsDataURL(imageInput.files[0]);
    }
    if (type === 'found' && !image) {
      showError(t('photoRequiredNote'));
      return;
    }
    if (!title || !location || !description || !dateVal) {
      showError(t('editPostIncomplete'));
      return;
    }
    let result;
    try {
      result = await updateMyPost(post.id, {
        title,
        titleNe: title,
        location,
        locationNe: location,
        description,
        descriptionNe: description,
        category,
        subcategory,
        date: dateVal,
        image,
        time: 'Just now',
        timeNe: 'अहिले'
      });
    } catch (err) {
      showError(t('editPostFailed'));
      return;
    }
    if (!result.ok) {
      showError(result.error || t('editPostFailed'));
      return;
    }
    addMyActivity({ icon: '✏️', key: 'actEditedPost' });
    window.location.href = `item-details.html?id=${post.id}`;
  });
}

function markJustLoggedIn() {
  try { sessionStorage.setItem('khoj_just_logged_in', '1'); } catch (_) { /* ignore */ }
}

function initAuthForms() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    const errorBox = document.getElementById('login-error');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (errorBox) errorBox.style.display = 'none';

    if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, true, 'Signing in...');
    if (typeof showPageLoading === 'function') showPageLoading('Signing you in...');

    try {
      const result = typeof loginWithCredentialsAsync === 'function'
        ? await loginWithCredentialsAsync(identifier, password)
        : loginWithCredentials(identifier, password);
      if (!result.ok) {
        if (typeof hidePageLoading === 'function') hidePageLoading();
        if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false);
        if (errorBox) {
          errorBox.style.display = '';
          errorBox.textContent = result.error;
        } else {
          showNotification(result.error || t('notifErrorLoginFailed'), 'error');
        }
        return;
      }
      markJustLoggedIn();
      window.location.href = 'home.html';
    } catch (err) {
      if (typeof hidePageLoading === 'function') hidePageLoading();
      if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false);
      if (errorBox) {
        errorBox.style.display = '';
        errorBox.textContent = err.message || 'Sign in failed.';
      }
    }
  });
}

function initWelcome() {
  const btnEn = document.getElementById('lang-en');
  const btnNe = document.getElementById('lang-ne');
  const btnContinue = document.getElementById('btn-continue');
  let selected = getLang();
  const update = () => {
    btnEn?.classList.toggle('selected', selected === 'en');
    btnNe?.classList.toggle('selected', selected === 'ne');
  };
  btnEn?.addEventListener('click', () => { selected = 'en'; setLang('en'); update(); });
  btnNe?.addEventListener('click', () => { selected = 'ne'; setLang('ne'); update(); });
  btnContinue?.addEventListener('click', () => { setLang(selected); window.location.href = 'login.html'; });
  update();
}

function personalizeHome() {
  const banner = document.querySelector('.welcome-banner h2');
  if (!banner) return;
  const user = getDisplayUser();
  if (user) {
    banner.innerHTML = `<span data-i18n="welcomeBack">${t('welcomeBack')}</span>, <span id="welcome-name">${getFirstName(user.fullName)}</span> 👋`;
  } else {
    banner.innerHTML = `<span data-i18n="welcomeGuest">${t('welcomeGuest')}</span> 👋`;
  }
}

function initHomeLoginGreeting() {
  const box = document.getElementById('home-login-greeting');
  if (!box) return;

  let justLoggedIn = false;
  try { justLoggedIn = sessionStorage.getItem('khoj_just_logged_in') === '1'; } catch (_) { justLoggedIn = false; }

  if (!justLoggedIn || !getDisplayUser()) {
    box.hidden = true;
    box.classList.remove('is-visible', 'is-hiding');
    return;
  }

  try { sessionStorage.removeItem('khoj_just_logged_in'); } catch (_) { /* ignore */ }
  personalizeHome();
  box.hidden = false;
  box.classList.add('is-visible');
  box.classList.remove('is-hiding');

  box.querySelectorAll('[data-icon="lost"]').forEach(el => { el.innerHTML = iconLost(); });
  box.querySelectorAll('[data-icon="found"]').forEach(el => { el.innerHTML = iconFound(); });

  window.clearTimeout(box._hideTimer);
  window.clearTimeout(box._removeTimer);
  box._hideTimer = window.setTimeout(() => {
    box.classList.add('is-hiding');
    box._removeTimer = window.setTimeout(() => {
      box.hidden = true;
      box.classList.remove('is-visible', 'is-hiding');
    }, 400);
  }, 5500);
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  if (container.querySelector('.notification-item') || container.querySelector('.empty-state')) {
    var existingMarkBtn = document.getElementById('mark-all-read');
    if (existingMarkBtn && !existingMarkBtn.dataset.bound) {
      existingMarkBtn.dataset.bound = '1';
      existingMarkBtn.addEventListener('click', function() {
        markAllMyNotificationsRead();
        container.innerHTML = '<div class="empty-state"><p>No notifications.</p></div>';
        document.querySelector('#notif-menu-toggle .nav-badge')?.remove();
      });
    }
    return;
  }
  const items = getMyNotifications();
  const markBtn = document.getElementById('mark-all-read');
  if (markBtn && !markBtn.dataset.bound) {
    markBtn.dataset.bound = '1';
    markBtn.addEventListener('click', () => {
      markAllMyNotificationsRead();
      renderNotifications();
      document.querySelector('#notif-menu-toggle .nav-badge')?.remove();
    });
  }
  if (!items.length) {
    container.innerHTML = renderEmptyState('noNotifications', 'noNotificationsHint', '🔔');
    return;
  }
  container.innerHTML = items.map(n => {
    const time = getLang() === 'ne' ? n.timeNe : n.time;
    const text = n.points != null ? t(n.key, { n: n.points }) : t(n.key);
    return `<div class="notification-item ${n.read ? 'read' : 'unread'}">
      <div class="notif-icon">${getNotificationIcon(n.type)}</div>
      <div class="notif-content">
        <p>${text}</p>
        <span class="notif-time">${time}</span>
      </div>
      ${n.read ? '' : '<span class="notif-unread-dot" aria-hidden="true"></span>'}
    </div>`;
  }).join('');
}

function renderMyHistorySections() {
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const user = getDisplayUser();

  if (!user) {
    set('my-lost-posts', renderEmptyState('loginRequired', 'guestProfileHint', '🔒'));
    set('my-found-posts', renderEmptyState('loginRequired', 'guestProfileHint', '🔒'));
    set('my-recovered-posts', renderEmptyState('loginRequired', 'guestProfileHint', '🔒'));
    set('my-claims-list', renderEmptyState('loginRequired', 'guestProfileHint', '🔒'));
    return;
  }

  const mine = getMyPosts();
  const lost = mine.filter(p => p.type === 'lost' && p.status !== 'delivered' && p.status !== 'owner_found');
  const found = mine.filter(p => p.type === 'found' && p.status !== 'delivered' && p.status !== 'owner_found');
  const recovered = mine.filter(p => p.status === 'delivered' || p.status === 'owner_found');

  set('my-lost-posts', lost.length ? lost.map(renderPostCard).join('') : renderEmptyState('noMyPosts', 'noMyPostsHint', '📝'));
  set('my-found-posts', found.length ? found.map(renderPostCard).join('') : renderEmptyState('noMyPosts', 'noMyPostsHint', '📝'));
  set('my-recovered-posts', recovered.length ? recovered.map(renderPostCard).join('') : renderEmptyState('noMyPosts', 'noMyPostsHint', '📝'));

  const claims = getMyClaims();
  const claimsBox = document.getElementById('my-claims-list');
  if (claimsBox) {
    if (!claims.length) {
      claimsBox.innerHTML = renderEmptyState('noClaims', 'noClaimsHint', '🙋');
    } else {
      claimsBox.innerHTML = claims.map(c => {
        const day = typeof getClaimDayOfSeven === 'function' ? getClaimDayOfSeven(c) : (c.dayOfSeven || 1);
        const statusKey = claimStatusI18nKey(c.status);
        const adminMsg = c.status === 'additional_info' && c.adminMessage
          ? `<div class="admin-warning mt-16"><strong data-i18n="adminRequest">${t('adminRequest')}</strong><p>${c.adminMessage}</p></div>`
          : '';
        return `
        <div class="activity-item claim-history-card">
          <span class="activity-icon">🙋</span>
          <div style="flex:1">
            <div class="activity-text">${c.itemTitle || t('claimTitle')}</div>
            <div class="activity-time">${c.submittedDate || ''} · <span data-i18n="${statusKey}">${t(statusKey)}</span>${c.kycVerified ? ' · KYC ✓' : ''}</div>
            ${adminMsg}
            <p class="form-note">${t('claimUnderReviewHint')}</p>
          </div>
        </div>`;
      }).join('');
    }
  }
}

function claimStatusI18nKey(status) {
  const map = {
    under_review: 'claimStatusUnderReview',
    under_investigation: 'claimStatusUnderInvestigation',
    pending: 'claimStatusPending',
    approved: 'claimStatusApproved',
    rejected: 'claimStatusRejected',
    suspicious: 'claimStatusSuspicious',
    resolved: 'claimStatusResolved',
    additional_info: 'claimStatusMoreInfo',
    kyc_submitted: 'claimStatusKycSubmitted'
  };
  return map[status] || 'claimStatusPending';
}

function renderActivity() {
  renderMyHistorySections();
  const list = document.getElementById('activity-list');
  if (!list) return;
  if (list.querySelector('.activity-item') || list.querySelector('.empty-state')) return;
  const items = getMyActivity();
  if (!items.length) {
    list.innerHTML = renderEmptyState('noActivityYet', 'noActivityHint', '📋');
    return;
  }
  list.innerHTML = items.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <div>
        <div class="activity-text" data-i18n="${a.key}">${t(a.key)}</div>
        <div class="activity-time">${getLang() === 'ne' ? a.timeNe : a.time}</div>
      </div>
    </div>`).join('');
}

function renderItemDetails() {
  const container = document.getElementById('item-detail-content');
  if (container && (container.querySelector('.detail-info') || container.querySelector('.empty-state'))) return;
  const id = new URLSearchParams(window.location.search).get('id');
  const post = getPostById(id)
    || (typeof getMyPostById === 'function' ? getMyPostById(id) : null)
    || (typeof getAllUserPosts === 'function' ? getAllUserPosts().find(p => String(p.id) === String(id)) : null);
  if (!container) return;
  if (!post) {
    container.innerHTML = renderEmptyState('noPosts');
    return;
  }

  const lang = getLang();
  const title = lang === 'ne' && post.titleNe ? post.titleNe : post.title;
  const desc = lang === 'ne' && post.descriptionNe ? post.descriptionNe : post.description;
  const loc = lang === 'ne' && post.locationNe ? post.locationNe : post.location;
  const isLost = post.type === 'lost';
  const isRecovered = post.status === 'delivered' || post.status === 'owner_found';
  const base = getBasePath();
  const cat = getCategoryLabel(post.category, lang);
  const sub = post.subcategory ? getSubcategoryLabel(post.category, post.subcategory, lang) : '';

  const imageSection = post.image
    ? `<div class="detail-image"><img src="${post.image}" alt="${title}"></div>`
    : `<div class="detail-image detail-no-image">${isLost ? '📷 ' + t('imageOptional') : '📷'}</div>`;

  let recovered = '';
  if (isRecovered) {
    const visibleUntil = post.visibleUntil || (post.deliveredDate
      ? (() => {
          const d = new Date(post.deliveredDate);
          d.setDate(d.getDate() + 14);
          return d.toISOString().slice(0, 10);
        })()
      : null);
    recovered = `<div class="delivered-notice">
      <strong>🟢 ${t('ownerFound')}</strong>
      <p data-i18n="deliveredNote">${t('deliveredNote')}</p>
      ${post.deliveredDate ? `<p><strong data-i18n="recoveredOn">${t('recoveredOn')}</strong>: ${post.deliveredDate}</p>` : ''}
      ${visibleUntil ? `<p><strong data-i18n="visibleUntil">${t('visibleUntil')}</strong>: ${visibleUntil}</p>` : ''}
      <p data-i18n="deliveredByOffice">${t('deliveredByOffice')}</p>
      <p class="form-note" data-i18n="trustRetention">${t('trustRetention')}</p>
      ${post.retentionDaysLeft != null ? `<p>${t('retentionLeft', { n: post.retentionDaysLeft })}</p>` : ''}
      ${!isLost && post.rewardPoints ? `<p class="reward-chip">⭐ ${t('rewardEarned', { n: post.rewardPoints })}</p>` : ''}
    </div>`;
  }

  const own = typeof isOwnPost === 'function' && isOwnPost(post);
  let actions;
  if (own) {
    actions = `<p class="form-note" data-i18n="yourPostNote">${t('yourPostNote')}</p>
       <div class="owner-actions-row">
         <a href="${base}edit-post.html?id=${post.id}" class="btn btn-primary" data-i18n="editPost">${t('editPost')}</a>
         <button type="button" class="btn btn-danger" data-action="delete-post" data-id="${post.id}" data-i18n="deletePost">${t('deletePost')}</button>
       </div>`;
  } else if (isLost) {
    actions = `<a href="${base}have-info.html?id=${post.id}" class="btn btn-primary btn-block" data-i18n="haveInfo">${t('haveInfo')}</a>
       <button type="button" class="btn btn-ghost btn-block" data-action="report-suspicious" data-i18n="reportSuspicious">${t('reportSuspicious')}</button>`;
  } else if (isRecovered) {
    actions = `<p class="form-note" data-i18n="trustRetention">${t('trustRetention')}</p>
       <button type="button" class="btn btn-ghost btn-block" data-action="report-suspicious" data-i18n="reportSuspicious">${t('reportSuspicious')}</button>`;
  } else {
    const canClaim = typeof isClaimWaitingComplete === 'function' ? isClaimWaitingComplete(post) : true;
    const age = typeof getPostAgeDays === 'function' ? getPostAgeDays(post) : 0;
    const waitDay = Math.min(7, Math.max(1, age + 1));
    const inProgress = post.status === 'claim_pending'
      ? `<div class="admin-warning mb-16"><strong>🟠 ${t('claimInProgressBanner')}</strong><p>${t('claimInProgressHint')}</p></div>`
      : '';
    if (post.fromMock) {
      actions = `<p class="form-note" data-i18n="communitySampleNote">${t('communitySampleNote')}</p>
         <button type="button" class="btn btn-ghost btn-block" data-action="report-suspicious" data-i18n="reportSuspicious">${t('reportSuspicious')}</button>`;
    } else {
      actions = canClaim
        ? `${inProgress}<a href="${base}claim.html?id=${post.id}" class="btn btn-found btn-block">🟢 ${t('claimItem')}</a>
           <button type="button" class="btn btn-ghost btn-block" data-action="report-suspicious" data-i18n="reportSuspicious">${t('reportSuspicious')}</button>`
        : `<div class="admin-warning"><strong>🔒 ${t('claimUnavailable')}</strong><p>${t('claimWaitingPeriod')}</p>${renderSevenDayProgress(waitDay)}</div>
           <button type="button" class="btn btn-ghost btn-block" data-action="report-suspicious" data-i18n="reportSuspicious">${t('reportSuspicious')}</button>`;
    }
  }

  if (own) container.classList.add('detail-mine');
  else container.classList.remove('detail-mine');

  container.innerHTML = `
    ${recovered}
    <div class="detail-header ${isLost ? 'type-lost' : 'type-found'}">
      <span class="detail-type">${typeBadge(isLost)}${own ? ` <span class="your-post-badge" data-i18n="yourPost">${t('yourPost')}</span>` : ''}</span>
      <h1>${title}</h1>
      ${renderStatusBadge(post.status)}
    </div>
    ${imageSection}
    <div class="detail-info">
      <h3 data-i18n="details">${t('details')}</h3>
      <div class="detail-row">📍 ${isLost ? t('lostAt') : t('foundAt')}: <strong>${loc}</strong></div>
      <div class="detail-row">📅 ${t('dateLabel')}: <strong>${post.date}</strong></div>
      <div class="detail-row">📂 ${t('category')}: <strong>${cat}${sub ? ' → ' + sub : ''}</strong></div>
    </div>
    <div class="detail-description">
      <h3 data-i18n="description">${t('description')}</h3>
      <p>${desc}</p>
    </div>
    <div class="detail-poster">
      <span data-i18n="postedBy">${t('postedBy')}</span>: <strong>${post.userName}</strong>
      ${own ? `<span class="your-post-badge" data-i18n="yourPost">${t('yourPost')}</span>` : ''}
    </div>
    ${renderJourney(post.status)}
    ${renderTrustStrip()}
    <div class="detail-actions">${actions}</div>`;
}

function handleDeletePost(postId) {
  if (!postId) return;
  showConfirm({
    title: t('notifConfirmDeletePost'),
    message: t('notifConfirmDeletePost'),
    confirmLabel: typeof t === 'function' ? t('delete') : 'Delete',
    danger: true,
    onConfirm: async function () {
      try {
        const result = await deleteMyPost(postId);
        if (!result.ok) {
          showNotification(t('notifErrorDeleteFailed'), 'error');
          return;
        }
      } catch (e) {
        showNotification(t('notifErrorDeleteFailed'), 'error');
        return;
      }
      if (typeof addMyActivity === 'function') {
        addMyActivity({ icon: '🗑️', key: 'actDeletedPost' });
      }
      if (currentPageName === 'item-details') {
        window.location.href = 'activity.html';
        return;
      }
      if (currentPageName === 'activity') {
        renderActivity();
        applyTranslations();
        return;
      }
      if (typeof refreshFeed === 'function') refreshFeed();
    }
  });
}

let deletePostBound = false;
function initDeletePost() {
  if (deletePostBound) return;
  deletePostBound = true;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="delete-post"]');
    if (!btn) return;
    e.preventDefault();
    handleDeletePost(btn.getAttribute('data-id'));
  });
}

function renderOwnerProfile() {
  const user = getDisplayUser();
  const header = document.getElementById('profile-header');
  const privateBox = document.getElementById('profile-private-info');
  const base = getBasePath();

  if (!user) {
    if (header) {
      header.innerHTML = `
        <div class="profile-avatar">?</div>
        <div class="profile-info">
          <h2 data-i18n="guestProfileTitle">${t('guestProfileTitle')}</h2>
          <p class="form-note" data-i18n="guestProfileHint">${t('guestProfileHint')}</p>
          <div class="mt-16" style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="${base}signup.html" class="btn btn-primary" data-i18n="signUp">${t('signUp')}</a>
            <a href="${base}login.html" class="btn btn-secondary" data-i18n="signIn">${t('signIn')}</a>
          </div>
        </div>`;
    }
    if (privateBox) privateBox.innerHTML = '';
    return;
  }

  const level = getUserLevel(user.points || 0);
  const lang = getLang();
  if (header) {
    header.innerHTML = `
      ${avatarHtml(user, 'profile-avatar')}
      <div class="profile-info">
        <h2>${user.fullName}</h2>
        <p class="profile-username">${displayUsername(user)}</p>
        <p class="profile-meta">📍 ${getPublicLocation(user)} · <span data-i18n="memberSince">${t('memberSince')}</span> ${formatMemberSince(user.memberSince)}</p>
        <p class="profile-points">⭐ ${user.points || 0} <span data-i18n="points">${t('points')}</span> · ${level.icon} ${lang === 'ne' ? level.ne : level.en}</p>
        <a href="${base}edit-profile.html" class="btn btn-primary btn-sm mt-16" data-i18n="editProfile">${t('editProfile')}</a>
      </div>`;
  }
  if (privateBox) {
    var kycStatus = user.kycStatus || 'none';
    var kycColors = { none: '#6b7280', pending: '#f59e0b', verified: '#10b981', rejected: '#ef4444' };
    var kycLabels = { none: 'KYC Not Completed', pending: 'KYC Under Review', verified: 'KYC Verified', rejected: 'KYC Rejected' };
    if (typeof getLang === 'function' && getLang() === 'ne') {
      kycLabels = { none: 'KYC पूरा भएन', pending: 'KYC समीक्षामा', verified: 'KYC प्रमाणित', rejected: 'KYC अस्वीकृत' };
    }
    var kycAction = '';
    if (kycStatus === 'none' || kycStatus === 'rejected') {
      kycAction = '<a href="' + base + 'kyc.html" class="btn btn-primary btn-sm mt-8">' + (typeof t === 'function' ? t('submitKyc') : 'Complete KYC') + '</a>';
    }
    privateBox.innerHTML = `
      <h4 data-i18n="accountPrivate">${t('accountPrivate')}</h4>
      <div class="detail-row">📧 ${t('emailAddress')}: <strong>${user.email || '—'}</strong></div>
      <div class="detail-row">📱 ${t('mobileNumber')}: <strong>${user.mobile ? '+977 ' + user.mobile : '—'}</strong></div>
      <div class="detail-row">🎂 ${t('dateOfBirth')}: <strong>${formatDateOfBirth(user.dateOfBirth)}</strong></div>
      <div class="detail-row">${t('province')}: <strong>${user.province || '—'}</strong></div>
      <div class="detail-row">${t('district')}: <strong>${user.district || '—'}</strong></div>
      <div class="detail-row">${t('city')}: <strong>${user.city || '—'}</strong></div>
      <div class="detail-row mt-16"><strong>${typeof t === 'function' ? t('kycVerification') : 'KYC Verification'}:</strong> <span class="badge" style="background:${kycColors[kycStatus] || kycColors.none};color:#fff;padding:3px 10px;border-radius:10px;font-size:13px">${kycLabels[kycStatus] || kycStatus}</span></div>
      ${kycAction}
      <a href="${base}kyc.html" class="btn btn-ghost btn-sm mt-8">${typeof t === 'function' ? t('kycInfoTitle') : 'View KYC'}</a>`;
  }
}

function personalizeRewards() {
  const user = getDisplayUser();
  const points = user ? (user.points || 0) : 0;
  const level = getUserLevel(points);
  const lang = getLang();
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('rewards-points', points);
  setText('rewards-level', `${level.icon} ${lang === 'ne' ? level.ne : level.en}`);
  setText('stat-reported', user ? (user.itemsReported || 0) : 0);
  setText('stat-returned', user ? (user.itemsReturned || 0) : 0);
  const list = document.getElementById('level-list');
  if (list) {
    list.innerHTML = REWARD_LEVELS.map(l => `
      <div class="level-item ${points >= l.min && points <= l.max ? 'current' : ''}">
        <span class="level-icon">${l.icon}</span>
        <div class="level-name">${lang === 'ne' ? l.ne : l.en}</div>
        <span class="level-range">${l.min}${l.max === Infinity ? '+' : '–' + l.max}</span>
      </div>`).join('');
  }
}

function initEditProfileForm() {
  const form = document.getElementById('edit-profile-form');
  if (!form) return;
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('edit-fullname', user.fullName);
  setVal('edit-username', user.username);
  setVal('edit-dob', user.dateOfBirth);
  setVal('edit-mobile', user.mobile);
  setVal('edit-email', user.email);
  setVal('edit-district', user.district);
  setVal('edit-city', user.city);

  const provinceSelect = document.getElementById('edit-province');
  if (provinceSelect) {
    provinceSelect.innerHTML = '';
    NEPAL_PROVINCES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      if (p === user.province) opt.selected = true;
      provinceSelect.appendChild(opt);
    });
  }

  const preview = document.getElementById('edit-avatar-preview');
  if (preview) {
    if (user.profilePicture) {
      preview.innerHTML = `<img src="${user.profilePicture}" alt="Profile">`;
      preview.classList.add('has-image');
    } else {
      preview.textContent = getInitials(user.fullName);
    }
  }

  let pendingPhoto = user.profilePicture || null;
  document.getElementById('edit-photo')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingPhoto = await readFileAsDataURL(file);
    if (preview) {
      preview.innerHTML = `<img src="${pendingPhoto}" alt="Profile">`;
      preview.classList.add('has-image');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateCurrentUser({
      fullName: document.getElementById('edit-fullname')?.value.trim(),
      username: document.getElementById('edit-username')?.value.trim(),
      dateOfBirth: document.getElementById('edit-dob')?.value,
      mobile: document.getElementById('edit-mobile')?.value.trim(),
      email: document.getElementById('edit-email')?.value.trim(),
      province: document.getElementById('edit-province')?.value,
      district: document.getElementById('edit-district')?.value.trim(),
      city: document.getElementById('edit-city')?.value.trim(),
      profilePicture: pendingPhoto
    });
    window.location.href = 'profile.html';
  });
}

function renderOffice() {
  const box = document.getElementById('office-content');
  if (!box) return;
  const lang = getLang();
  const base = getBasePath();
  const office = (typeof getOfficeInfo === 'function' && getOfficeInfo()) || ADMIN_OFFICE;
  const name = lang === 'ne' ? office.nameNe : office.name;
  const location = lang === 'ne' ? office.locationNe : office.location;
  const hours = lang === 'ne' ? office.hoursNe : office.hours;

  box.innerHTML = `
    <div class="office-page">
      <header class="office-hero">
        <div class="office-hero-icon">${iconOffice()}</div>
        <div>
          <p class="office-hero-kicker" data-i18n="officeInfo">${t('officeInfo')}</p>
          <h1>${name}</h1>
          <p class="office-hero-sub" data-i18n="officePageSub">${t('officePageSub')}</p>
        </div>
      </header>

      <section class="office-info-grid" aria-label="${t('officeContact')}">
        <div class="office-info-card">
          <span class="office-info-label" data-i18n="filterLocation">${t('filterLocation')}</span>
          <strong>📍 ${location}</strong>
        </div>
        <div class="office-info-card">
          <span class="office-info-label" data-i18n="officeHours">${t('officeHours')}</span>
          <strong>🕒 ${hours}</strong>
        </div>
        <div class="office-info-card">
          <span class="office-info-label" data-i18n="officeContact">${t('officeContact')}</span>
          <strong>📞 ${office.phone}</strong>
          <span class="office-info-meta">📧 ${office.email}</span>
        </div>
      </section>

      <section class="help-card office-section">
        <h2 data-i18n="officeWhatWeDo">${t('officeWhatWeDo')}</h2>
        <div class="office-service-grid">
          <div class="office-service-item">
            <span class="office-service-num">01</span>
            <div>
              <strong data-i18n="officeService1Title">${t('officeService1Title')}</strong>
              <p data-i18n="officeService1Body">${t('officeService1Body')}</p>
            </div>
          </div>
          <div class="office-service-item">
            <span class="office-service-num">02</span>
            <div>
              <strong data-i18n="officeService2Title">${t('officeService2Title')}</strong>
              <p data-i18n="officeService2Body">${t('officeService2Body')}</p>
            </div>
          </div>
          <div class="office-service-item">
            <span class="office-service-num">03</span>
            <div>
              <strong data-i18n="officeService3Title">${t('officeService3Title')}</strong>
              <p data-i18n="officeService3Body">${t('officeService3Body')}</p>
            </div>
          </div>
          <div class="office-service-item">
            <span class="office-service-num">04</span>
            <div>
              <strong data-i18n="officeService4Title">${t('officeService4Title')}</strong>
              <p data-i18n="officeService4Body">${t('officeService4Body')}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="help-card office-section">
        <h2 data-i18n="handoverFlow">${t('handoverFlow')}</h2>
        <p class="form-note" data-i18n="officeHandoverIntro">${t('officeHandoverIntro')}</p>
        <ol class="office-page-flow">
          ${HANDOVER_STEPS.map((s, i) => `
            <li>
              <span class="office-page-flow-num">${String(i + 1).padStart(2, '0')}</span>
              <span>${lang === 'ne' ? s.ne : s.en}</span>
            </li>`).join('')}
        </ol>
        <p class="office-page-note" data-i18n="officeSidebarNote">${t('officeSidebarNote')}</p>
      </section>

      <section class="office-checklist-grid">
        <div class="help-card office-section">
          <h2 data-i18n="officeForFinders">${t('officeForFinders')}</h2>
          <ul class="help-bullets">
            <li data-i18n="officeFinderTip1">${t('officeFinderTip1')}</li>
            <li data-i18n="officeFinderTip2">${t('officeFinderTip2')}</li>
            <li data-i18n="officeFinderTip3">${t('officeFinderTip3')}</li>
            <li data-i18n="officeFinderTip4">${t('officeFinderTip4')}</li>
          </ul>
          <a href="${base}post.html?type=found" class="btn btn-found btn-block mt-16" data-i18n="reportFound">${t('reportFound')}</a>
        </div>
        <div class="help-card office-section">
          <h2 data-i18n="officeForOwners">${t('officeForOwners')}</h2>
          <ul class="help-bullets">
            <li data-i18n="officeOwnerTip1">${t('officeOwnerTip1')}</li>
            <li data-i18n="officeOwnerTip2">${t('officeOwnerTip2')}</li>
            <li data-i18n="officeOwnerTip3">${t('officeOwnerTip3')}</li>
            <li data-i18n="officeOwnerTip4">${t('officeOwnerTip4')}</li>
          </ul>
          <a href="${base}found.html" class="btn btn-primary btn-block mt-16" data-i18n="wantToClaim">${t('wantToClaim')}</a>
        </div>
      </section>

      <section class="help-card office-section">
        <h2 data-i18n="officeInstructions">${t('officeInstructions')}</h2>
        <p>${lang === 'ne' ? office.instructionsNe : office.instructions}</p>
        <ul class="help-bullets">
          <li data-i18n="officeRule1">${t('officeRule1')}</li>
          <li data-i18n="officeRule2">${t('officeRule2')}</li>
          <li data-i18n="officeRule3">${t('officeRule3')}</li>
          <li data-i18n="officeRule4">${t('officeRule4')}</li>
        </ul>
        ${renderTrustStrip()}
      </section>

      <div class="office-page-actions">
        <a href="${base}how-it-works.html" class="btn btn-secondary" data-i18n="howItWorks">${t('howItWorks')}</a>
        <a href="${base}help.html" class="btn btn-outline" data-i18n="helpSupport">${t('helpSupport')}</a>
      </div>
    </div>`;
}

function initHaveInfo() {
  const form = document.getElementById('have-info-form');
  if (!form) return;
  const typeBox = document.getElementById('info-type-options');
  if (typeBox) {
    typeBox.innerHTML = INFO_TYPES.map(it => `
      <label class="info-option">
        <input type="radio" name="infoType" value="${it.id}" ${it.id === 'found' ? 'checked' : ''}>
        <span>${getLang() === 'ne' ? it.ne : it.en}</span>
      </label>`).join('');
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const postId = new URLSearchParams(window.location.search).get('id');
    const infoType = form.querySelector('input[name="infoType"]:checked')?.value || 'other';
    const message = form.querySelector('textarea')?.value || '';
    if (typeof submitTip === 'function' && postId) {
      const result = submitTip(postId, infoType, message);
      if (!result.ok) {
        showNotification(result.error || t('notifErrorTipFailed'), 'error');
        return;
      }
    }
    showNotification(t('notifReportSubmitted'), 'success');
    setTimeout(function () { window.location.href = 'home.html'; }, 1200);
  });
}

function ensureSuspiciousReportModal() {
  let modal = document.getElementById('suspicious-report-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'suspicious-report-modal';
  modal.className = 'help-modal-overlay';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="help-modal" role="dialog" aria-modal="true" aria-labelledby="suspicious-report-title">
      <div class="help-modal-head">
        <h3 id="suspicious-report-title" data-i18n="reportWhyTitle">${t('reportWhyTitle')}</h3>
        <button type="button" class="search-close" id="suspicious-report-close" aria-label="Close">✕</button>
      </div>
      <form id="suspicious-report-form">
        <div class="form-group">
          <label for="suspicious-reason" data-i18n="reportWhyTitle">${t('reportWhyTitle')}</label>
          <select id="suspicious-reason" class="form-select" required>
            <option value="">${t('selectOption')}</option>
            <option value="false">${t('reasonFalseInfo')}</option>
            <option value="suspicious">${t('reasonSuspiciousItem')}</option>
            <option value="fraud">${t('reasonFraudClaim')}</option>
            <option value="duplicate">${t('reasonDuplicate')}</option>
            <option value="inappropriate">${t('reasonInappropriate')}</option>
            <option value="other">${t('problemOther')}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="suspicious-desc" data-i18n="description">${t('description')}</label>
          <textarea id="suspicious-desc" class="form-textarea" rows="3" data-i18n-placeholder="tellUsMore" placeholder="${t('tellUsMore')}"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block" data-i18n="submitReport">${t('submitReport')}</button>
        <p id="suspicious-report-success" class="help-success" hidden></p>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSuspiciousReportModal(); });
  document.getElementById('suspicious-report-close')?.addEventListener('click', closeSuspiciousReportModal);
  document.getElementById('suspicious-report-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const reason = document.getElementById('suspicious-reason')?.value || '';
    const description = document.getElementById('suspicious-details')?.value
      || document.querySelector('#suspicious-report-form textarea')?.value || '';
    const postId = new URLSearchParams(window.location.search).get('id');
    if (typeof submitReport === 'function') {
      submitReport({
        targetType: 'post',
        targetId: postId ? Number(postId) : null,
        reason,
        description
      });
    }
    const success = document.getElementById('suspicious-report-success');
    if (success) {
      success.hidden = false;
      success.innerHTML = `<strong>${t('reportDemoTitle')}</strong><br>${t('reportDemoBody')}`;
    }
    setTimeout(closeSuspiciousReportModal, 1600);
  });
  return modal;
}

function openSuspiciousReportModal() {
  const modal = ensureSuspiciousReportModal();
  const success = document.getElementById('suspicious-report-success');
  if (success) success.hidden = true;
  document.getElementById('suspicious-report-form')?.reset();
  modal.hidden = false;
  applyTranslations();
}

function closeSuspiciousReportModal() {
  const modal = document.getElementById('suspicious-report-modal');
  if (modal) modal.hidden = true;
}

let suspiciousReportBound = false;
function initSuspiciousReport() {
  if (suspiciousReportBound) return;
  suspiciousReportBound = true;
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="report-suspicious"]')) {
      e.preventDefault();
      openSuspiciousReportModal();
    }
  });
}

function initApp(page) {
  currentPageName = page;
  initTheme();
  applyTranslations();
  initLangToggle();

  if (typeof guardAppAccess === 'function' && !guardAppAccess(page)) {
    return;
  }

  if (!['welcome', 'login', 'signup', 'forgot-password'].includes(page)) {
    if (isGuestAuthHelpPage(page)) {
      renderGuestBackBar();
      applyTranslations();
    } else {
      renderTopNav(page);
      renderBottomNav(page);
      renderSidebar();
      renderSidebarRight();
      initSearch();
      initAccountMenu();
      initNotificationsMenu();
      initLangMenu();
      initUtilityChrome();
      initFilters();
      setTimeout(lazyLoadNotifications, 100);
    }
  }

  if (page === 'welcome') initWelcome();
  if (page === 'login') initAuthForms();
  if (page === 'home' || page === 'lost' || page === 'found') {
    if (page === 'lost') currentFeedFilters.type = 'lost';
    if (page === 'found') currentFeedFilters.type = 'found';
    const typeSelect = document.getElementById('filter-type');
    if (typeSelect) typeSelect.value = currentFeedFilters.type || 'all';
    if (page === 'home') initHomeLoginGreeting();
    else personalizeHome();
    refreshFeed();
    initInfiniteFeedScroll();
    initMobileFilters();
  }
  if (page === 'notifications') renderNotifications();
  if (page === 'item-details') {
    renderItemDetails();
    if (typeof initSuspiciousReport === 'function') initSuspiciousReport();
  }
  if (typeof initDeletePost === 'function') initDeletePost();
  if (page === 'post') { initImagePreview(); initPostForm(); }
  if (page === 'edit-post') initEditPostForm();
  if (page === 'claim') initClaimSteps();
  if (page === 'profile') renderOwnerProfile();
  if (page === 'edit-profile') initEditProfileForm();
  if (page === 'rewards') personalizeRewards();
  if (page === 'activity') renderActivity();
  if (page === 'have-info') initHaveInfo();
  if (page === 'office') renderOffice();
  if (page === 'how-it-works' || page === 'help') {
    if (typeof initHelpPages === 'function') initHelpPages(page);
  }
  if (page === 'home' || page === 'found') renderKycWarningBanner();
  if (page === 'forgot-password') initForgotPassword();
}

function initForgotPassword() {
  var step1 = document.getElementById('forgot-step1');
  var step2 = document.getElementById('forgot-step2');
  var otpSection = document.getElementById('forgot-otp-section');
  var errorBox = document.getElementById('forgot-error');
  var findBtn = document.getElementById('forgot-find-btn');
  var verifyBtn = document.getElementById('forgot-verify-otp');
  var resetBtn = document.getElementById('forgot-reset-btn');
  var resendBtn = document.getElementById('forgot-resend-otp');
  var accountMsg = document.getElementById('forgot-account-msg');
  var identifierInput = document.getElementById('forgot-identifier');

  function showError(msg) {
    if (!errorBox) return;
    errorBox.style.display = '';
    errorBox.textContent = msg;
  }
  function clearError() {
    if (errorBox) { errorBox.style.display = 'none'; errorBox.textContent = ''; }
  }

  if (!findBtn) return;
  var resetIdentifier = '';

  findBtn.addEventListener('click', function() {
    var identifier = (identifierInput.value || '').trim();
    if (!identifier) { showError(t('enterEmailOrMobile') || 'Enter your email or mobile number.'); return; }
    clearError();
    setButtonLoading(findBtn, true, t('sending') || 'Sending...');
    sendOtpToEmail(identifier, 'forgot-password').then(function(result) {
      setButtonLoading(findBtn, false);
      if (!result.ok) { showError(t('failedToSendCode') || 'Failed to send verification code. Check your email.'); return; }
      resetIdentifier = identifier;
      if (step1) step1.style.display = 'none';
      if (otpSection) otpSection.style.display = '';
      if (result.otp) {
        var otpInput = document.getElementById('forgot-otp');
        if (otpInput) otpInput.value = result.otp;
        var otpHint = document.getElementById('forgot-otp-msg');
        if (otpHint) otpHint.textContent = (t('yourCodeIs') || 'Your verification code: ') + result.otp;
      }
    }).catch(function() {
      setButtonLoading(findBtn, false);
      showError(t('failedToSendCode') || 'Failed to send verification code. Try again.');
    });
  });

  if (verifyBtn) {
    verifyBtn.addEventListener('click', function() {
      var code = (document.getElementById('forgot-otp') || {}).value || '';
      code = code.trim();
      if (!code || code.length !== 6) { showError(t('enterSixDigitCode') || 'Enter the 6-digit verification code.'); return; }
      clearError();
      setButtonLoading(verifyBtn, true, t('verifying') || 'Verifying...');
      verifyOtpCode(resetIdentifier, code, 'forgot-password').then(function(ok) {
        setButtonLoading(verifyBtn, false);
        if (!ok) { showError(t('invalidCode') || 'Invalid or expired verification code.'); return; }
        if (otpSection) otpSection.style.display = 'none';
        if (step2) step2.style.display = '';
        if (accountMsg) accountMsg.textContent = (t('enterNewPasswordHint') || 'Enter your new password below.');
      }).catch(function() {
        setButtonLoading(verifyBtn, false);
        showError(t('verificationFailed') || 'Verification failed. Try again.');
      });
    });
  }

  if (resendBtn) {
    resendBtn.addEventListener('click', function() {
      if (!resetIdentifier) return;
      clearError();
      setButtonLoading(resendBtn, true, t('sending') || 'Sending...');
      sendOtpToEmail(resetIdentifier, 'forgot-password').then(function() {
        setButtonLoading(resendBtn, false);
      }).catch(function() {
        setButtonLoading(resendBtn, false);
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      var newPass = (document.getElementById('forgot-new-password') || {}).value || '';
      var confirmPass = (document.getElementById('forgot-confirm-password') || {}).value || '';
      if (!newPass || newPass.length < 6) { showError(t('passwordMinLength') || 'Password must be at least 6 characters.'); return; }
      if (newPass !== confirmPass) { showError(t('passwordsNoMatch') || 'Passwords do not match.'); return; }
      clearError();
      setButtonLoading(resetBtn, true, t('resetting') || 'Resetting...');
      resetPasswordForIdentifierAsync(resetIdentifier, newPass).then(function(result) {
        setButtonLoading(resetBtn, false);
        if (!result.ok) { showError(result.error); return; }
        window.location.href = 'login.html?reset=success';
      }).catch(function() {
        setButtonLoading(resetBtn, false);
        showError(t('resetFailed') || 'Password reset failed. Try again.');
      });
    });
  }
}

function initKycPage() {
  var user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) {
    document.getElementById('kyc-not-logged-in').hidden = false;
    return;
  }

  var status = user.kycStatus || 'none';
  var notLogged = document.getElementById('kyc-not-logged-in');
  var statusSection = document.getElementById('kyc-status-section');
  var formSection = document.getElementById('kyc-form-section');
  var pendingSection = document.getElementById('kyc-pending-section');
  var verifiedSection = document.getElementById('kyc-verified-section');
  var rejectedSection = document.getElementById('kyc-rejected-section');
  var statusBox = document.getElementById('kyc-status-box');

  notLogged.hidden = true;

  function hideAll() {
    [statusSection, formSection, pendingSection, verifiedSection, rejectedSection].forEach(function (el) { el.hidden = true; });
  }

  function showStatusBadge(s) {
    var colors = { none: '#6b7280', pending: '#f59e0b', verified: '#10b981', rejected: '#ef4444' };
    var labels = { none: 'Not Completed', pending: 'Under Review', verified: 'Verified', rejected: 'Rejected' };
    if (typeof getLang === 'function' && getLang() === 'ne') {
      labels = { none: 'पूरा भएन', pending: 'समीक्षामा', verified: 'प्रमाणित', rejected: 'अस्वीकृत' };
    }
    s = s || 'none';
    return '<span class="badge" style="background:' + (colors[s] || colors.none) + ';color:#fff;padding:4px 12px;border-radius:12px;font-size:14px">' + (labels[s] || s) + '</span>';
  }

  if (status === 'none' || status === 'rejected') {
    hideAll();
    formSection.hidden = false;
    statusSection.hidden = false;
    statusBox.innerHTML = '<div class="detail-info"><div class="detail-row"><strong>' + (typeof t === 'function' ? t('currentStatus') : 'Current Status') + '</strong>: ' + showStatusBadge(status) + '</div></div>';

    function bindKycPreviewLocal(inputId, previewId) {
      var input = document.getElementById(inputId);
      var preview = document.getElementById(previewId);
      if (!input || !preview || input.dataset.bound) return;
      input.dataset.bound = '1';
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) { preview.hidden = true; preview.removeAttribute('src'); return; }
        if (file.type.startsWith('image/')) {
          var reader = new FileReader();
          reader.onload = function (ev) { preview.src = ev.target.result; preview.hidden = false; };
          reader.readAsDataURL(file);
        } else {
          preview.hidden = true;
        }
      });
    }
    bindKycPreviewLocal('kyc-front', 'kyc-front-preview');
    bindKycPreviewLocal('kyc-back', 'kyc-back-preview');

    var submitBtn = document.getElementById('kyc-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () { handleKycSubmit(user); });
    }
    if (status === 'rejected') {
      var resubmitBtn = document.getElementById('kyc-resubmit-btn');
      if (resubmitBtn) {
        resubmitBtn.addEventListener('click', function () {
          hideAll();
          formSection.hidden = false;
          statusSection.hidden = true;
        });
      }
    }
  } else if (status === 'pending') {
    hideAll();
    pendingSection.hidden = false;
  } else if (status === 'verified') {
    hideAll();
    verifiedSection.hidden = false;
  } else {
    hideAll();
    formSection.hidden = false;
  }
}

function handleKycSubmit(user) {
  var frontInput = document.getElementById('kyc-front');
  var backInput = document.getElementById('kyc-back');
  if (!frontInput.files.length || !backInput.files.length) {
    showNotification(t('kycBothRequired'), 'warning');
    return;
  }
  var submitBtn = document.getElementById('kyc-submit-btn');
  if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, true, 'Submitting...');
  if (typeof showPageLoading === 'function') showPageLoading('Submitting KYC documents...');

  var reader1 = new FileReader();
  var reader2 = new FileReader();
  var results = { front: null, back: null };

  reader1.onload = function (ev) {
    results.front = ev.target.result;
    checkDone();
  };
  reader2.onload = function (ev) {
    results.back = ev.target.result;
    checkDone();
  };

  reader1.readAsDataURL(frontInput.files[0]);
  reader2.readAsDataURL(backInput.files[0]);

  function checkDone() {
    if (!results.front || !results.back) return;
    submitUserKycAsync(results.front, results.back).then(function (result) {
      if (typeof hidePageLoading === 'function') hidePageLoading();
      if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false);
      if (!result.ok) {
        showNotification(result.error || t('notifErrorGeneric'), 'error');
        return;
      }
      showNotification(t('notifKycSubmitted'), 'success');
      user.kycStatus = 'pending';
      try { localStorage.setItem('khoj_user', JSON.stringify(user)); } catch (e) {}
      initKycPage();
      if (typeof applyTranslations === 'function') applyTranslations();
    });
  }
}

function renderKycWarningBanner() {
  var user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) return;
  var status = user.kycStatus || 'none';
  if (status === 'verified' || status === 'pending') return;

  var bannerId = 'kyc-warning-banner';
  if (document.getElementById(bannerId)) return;

  var banner = document.createElement('div');
  banner.id = bannerId;
  banner.className = 'admin-warning';
  banner.style.cssText = 'margin-bottom:16px;border-left:4px solid #f59e0b;padding:12px 16px;background:var(--card-bg, #fffbeb);border-radius:8px;';

  var msg = status === 'rejected'
    ? (typeof t === 'function' ? t('kycRejectedHint') : 'Your KYC was rejected. Please resubmit with valid documents.')
    : (typeof t === 'function' ? t('kycStatusNone') : 'KYC not completed yet. Complete KYC to enable claiming found items.');
  var btnLabel = typeof t === 'function' ? t('submitKyc') : 'Complete KYC';

  banner.innerHTML = '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
    '<span style="font-size:20px">⚠️</span>' +
    '<div style="flex:1;min-width:200px">' +
    '<strong>' + (typeof t === 'function' ? t('kycVerification') : 'KYC Verification Required for Claims') + '</strong>' +
    '<p style="margin:4px 0 0;font-size:14px;color:var(--text-secondary, #6b7280)">' + msg + '</p>' +
    '</div>' +
    '<a href="kyc.html" class="btn btn-primary btn-sm">' + btnLabel + '</a>' +
    '</div>';

  var main = document.querySelector('.main-content') || document.querySelector('.content-area');
  if (main) main.insertBefore(banner, main.firstChild);
}
