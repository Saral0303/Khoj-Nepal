/* Khoj Nepal — auth + data layer (server-side rendered, NO sync XHR) */

const API_BASE = '';

let _cachedUser = null;
let _postsCache = null;
let _claimsCache = null;
let _notificationsCache = null;
let _activityCache = null;
let _usersCache = null;
let _officeCache = null;
let _categoriesCache = null;
let _statsCache = null;

function readServerData(id) {
  try {
    var el = document.getElementById(id);
    if (el) return JSON.parse(el.textContent);
  } catch (e) {}
  return null;
}

async function apiRequestAsync(method, path, body) {
  try {
    const res = await fetch(API_BASE + path, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'Network error. Is the server running?' } };
  }
}

function normalizeUsername(username) {
  return String(username || '').trim().replace(/^@+/, '').toLowerCase();
}

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function refreshCurrentUser() {
  if (_cachedUser) return _cachedUser;
  var data = readServerData('server-user-data');
  if (data && data.id) { _cachedUser = data; return _cachedUser; }
  _cachedUser = null;
  return null;
}

function getCurrentUser() {
  if (_cachedUser) return _cachedUser;
  return refreshCurrentUser();
}

function getSessionUserId() {
  const u = getCurrentUser();
  return u ? String(u.id) : null;
}

function setSessionUserId() { /* session is server-side cookie */ }

function logoutCurrentUser() {
  fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(function(){});
  _cachedUser = null;
  _postsCache = null;
  _claimsCache = null;
  _notificationsCache = null;
  _activityCache = null;
}

async function createUserAccountAsync(data) {
  const body = {
    fullName: String(data.fullName || '').trim(),
    username: normalizeUsername(data.username),
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || '',
    mobile: String(data.mobile || '').trim(),
    email: normalizeIdentifier(data.email),
    province: data.province || '',
    district: String(data.district || '').trim(),
    city: String(data.city || '').trim(),
    password: String(data.password || ''),
    profilePicture: data.profilePicture || null
  };
  const res = await apiRequestAsync('POST', '/auth/register', body);
  if (!res.ok) return { ok: false, error: res.data.error || 'Could not create account.' };
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

async function loginWithCredentialsAsync(identifier, password) {
  const res = await apiRequestAsync('POST', '/auth/login', {
    identifier: String(identifier || '').trim(),
    password: String(password || '')
  });
  if (!res.ok) return { ok: false, error: res.data.error || 'Invalid email/mobile or password.' };
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

async function loginAdminWithCredentialsAsync(identifier, password) {
  const res = await apiRequestAsync('POST', '/auth/admin/login', {
    identifier: String(identifier || '').trim(),
    password: String(password || '')
  });
  if (!res.ok) return { ok: false, error: res.data.error || 'Invalid admin email or password.' };
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

async function updateCurrentUserAsync(updates) {
  const res = await apiRequestAsync('PUT', '/users/me', updates);
  if (!res.ok) return null;
  _cachedUser = res.data;
  return res.data;
}

async function changeCurrentPasswordAsync(currentPass, newPass) {
  const res = await apiRequestAsync('POST', '/auth/change-password', {
    currentPassword: String(currentPass || ''),
    newPassword: String(newPass || '')
  });
  if (!res.ok) return { ok: false, error: res.data.error || 'Could not change password.' };
  return { ok: true };
}

function findAccountForPasswordReset(identifier) {
  if (!String(identifier || '').trim()) return { ok: false, error: 'Enter email or mobile number.' };
  return { ok: true, user: { id: identifier } };
}

async function resetPasswordForIdentifierAsync(identifier, newPass) {
  const res = await apiRequestAsync('POST', '/auth/forgot-password', {
    identifier: String(identifier || '').trim(),
    newPassword: String(newPass || '')
  });
  if (!res.ok) return { ok: false, error: res.data.error || 'Could not reset password.' };
  return { ok: true };
}

function loadPostsCache() {
  if (_postsCache) return _postsCache;
  var data = readServerData('server-posts-data');
  _postsCache = Array.isArray(data) ? data : [];
  return _postsCache;
}

function getAllUserPosts() {
  return loadPostsCache();
}

function getMyPosts() {
  var data = readServerData('server-my-posts-data');
  if (Array.isArray(data)) return data;
  var user = getCurrentUser();
  if (!user) return [];
  return loadPostsCache().filter(function(p) { return String(p.ownerId || p.userId) === String(user.id); });
}

function getMyPostById(postId) {
  return getMyPosts().find(function(p) { return String(p.id) === String(postId); }) || null;
}

async function saveMyPostAsync(post) {
  const body = {
    type: post.type, title: post.title, titleNe: post.titleNe,
    description: post.description, descriptionNe: post.descriptionNe,
    location: post.location, locationNe: post.locationNe,
    category: post.category, subcategory: post.subcategory,
    date: post.date, image: post.image
  };
  const res = await apiRequestAsync('POST', '/posts', body);
  if (!res.ok) throw new Error(res.data.error || 'Could not save post');
  _postsCache = null;
  return res.data;
}

function isOwnPost(post) {
  const user = getCurrentUser();
  if (!user || !post) return false;
  return String(post.ownerId || post.userId) === String(user.id);
}

async function updateMyPostAsync(postId, updates) {
  const res = await apiRequestAsync('PUT', '/posts/' + postId, updates);
  if (!res.ok) return { ok: false, error: res.data.error || 'Could not update post.' };
  _postsCache = null;
  return { ok: true, post: res.data };
}

async function deleteMyPostAsync(postId) {
  const res = await apiRequestAsync('DELETE', '/posts/' + postId);
  if (!res.ok) return { ok: false, error: res.data.error || 'Could not delete post.' };
  _postsCache = null;
  return { ok: true };
}

async function updateAnyUserPostAsync(postId, updates) {
  if (updates.status === 'active') return approvePostByIdAsync(postId);
  if (updates.status === 'rejected') return rejectPostByIdAsync(postId);
  if (updates.status) {
    const res = await apiRequestAsync('POST', '/admin/posts/' + postId + '/status', {
      status: updates.status, handoverStep: updates.handoverStep
    });
    if (!res.ok) return { ok: false, error: res.data.error || 'Update failed' };
    _postsCache = null;
    return { ok: true, post: res.data };
  }
  return updateMyPostAsync(postId, updates);
}

function getMyClaims() {
  var data = readServerData('server-claims-data');
  if (Array.isArray(data)) return data.map(normalizeClaim);
  return [];
}

function getAllClaims() {
  var data = readServerData('server-admin-claims-data');
  if (Array.isArray(data)) { _claimsCache = data; return _claimsCache.map(normalizeClaim); }
  return [];
}

function getClaimById(claimId) {
  var all = getAllClaims().concat(getMyClaims());
  return all.find(function(c) { return String(c.id) === String(claimId); }) || null;
}

function normalizeClaim(c) {
  if (!c) return c;
  let history = [];
  try { history = c.historyJson ? JSON.parse(c.historyJson) : (c.history || []); } catch (e) { history = c.history || []; }
  return {
    ...c, read: c.readFlag, time: c.timeLabel || c.time,
    claimant: { name: c.claimantName, phone: c.claimantPhone, email: c.claimantEmail, address: c.claimantAddress },
    history
  };
}

async function saveMyClaimAsync(claim) {
  const body = {
    postId: claim.postId,
    claimantName: claim.claimantName || (claim.claimant && claim.claimant.name),
    claimantPhone: claim.claimantPhone || (claim.claimant && claim.claimant.phone),
    claimantEmail: claim.claimantEmail || (claim.claimant && claim.claimant.email),
    claimantAddress: claim.claimantAddress || (claim.claimant && claim.claimant.address),
    ownership: claim.ownership, kycFront: claim.kycFront, kycBack: claim.kycBack,
    proofImage: claim.proofImage || null
  };
  const res = await apiRequestAsync('POST', '/claims', body);
  if (!res.ok) throw new Error(res.data.error || 'Could not submit claim');
  _claimsCache = null; _postsCache = null;
  return normalizeClaim(res.data);
}

async function updateClaimByIdAsync(claimId, updates) {
  if (updates.status === 'approved') return completeClaimRecoveryAsync(claimId, updates.notes);
  if (updates.status === 'rejected') {
    const res = await apiRequestAsync('POST', '/admin/claims/' + claimId + '/reject', { adminMessage: updates.adminMessage || updates.notes || '' });
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  if (updates.status === 'additional_info') {
    const res = await apiRequestAsync('POST', '/admin/claims/' + claimId + '/more-info', { adminMessage: updates.adminMessage || 'Please provide more information' });
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  if (updates.status === 'suspicious' || updates.investigation === 'suspicious') {
    const res = await apiRequestAsync('POST', '/admin/claims/' + claimId + '/flag');
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  if (updates.kycVerified === true) {
    const res = await apiRequestAsync('POST', '/admin/claims/' + claimId + '/verify-kyc');
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  return { ok: false, error: 'Unsupported claim update' };
}

function getMyActivity() {
  var data = readServerData('server-activity-data');
  if (Array.isArray(data)) {
    return data.map(function(a) { return { ...a, time: a.timeLabel || a.time, key: a.activityKey || a.key }; });
  }
  return [];
}

function addMyActivity() { /* created on server */ }

function getMyNotifications() {
  var data = readServerData('server-notifications-data');
  if (Array.isArray(data)) {
    return data.map(function(n) { return { ...n, read: !!n.readFlag, time: n.timeLabel || n.time, key: n.notifKey || n.key }; });
  }
  return [];
}

function addMyNotification() { /* created on server */ }

async function markAllMyNotificationsReadAsync() {
  await apiRequestAsync('POST', '/notifications/read-all');
}

function addNotificationForUser() { /* server-side */ }
function addActivityForUser() { /* server-side */ }

const KHOJ_PUBLIC_PAGES = ['welcome', 'login', 'signup', 'forgot-password', 'help', 'how-it-works', 'privacy', 'terms'];

function isPublicPage(page) { return KHOJ_PUBLIC_PAGES.includes(page); }

function getAuthBasePath() {
  const path = (window.location.pathname || '').replace(/\\/g, '/');
  return path.includes('/admin/') ? '../' : '';
}

function guardAppAccess(page) {
  const base = getAuthBasePath();
  let user = refreshCurrentUser();

  if (user && user.role === 'admin') {
    logoutCurrentUser();
    user = null;
    if (!isPublicPage(page)) { window.location.replace(base + 'login.html'); return false; }
  }

  if (user && (page === 'login' || page === 'welcome')) {
    window.location.replace(base + 'home.html');
    return false;
  }

  if (!user && !isPublicPage(page)) {
    window.location.replace(base + 'login.html');
    return false;
  }

  return true;
}

function ensureDemoAdmin() { /* Admin is seeded by Spring Boot SeedDataController */ }

function isAdminUser(user) { return !!(user && user.role === 'admin'); }

function guardAdminAccess() {
  const user = refreshCurrentUser();
  if (!isAdminUser(user)) { window.location.replace('login.html'); return false; }
  return true;
}

function getRegisteredUsers() {
  var data = readServerData('server-users-data');
  if (Array.isArray(data)) { _usersCache = data; return _usersCache; }
  return [];
}

function updateUserById(userId, updates) {
  return { ok: false, error: 'Use admin panel endpoints.' };
}

async function approveUserKycAsync(userId) {
  return apiRequestAsync('POST', '/admin/users/' + userId + '/kyc-approve');
}

async function rejectUserKycAsync(userId) {
  return apiRequestAsync('POST', '/admin/users/' + userId + '/kyc-reject');
}

async function submitUserKycAsync(kycFront, kycBack) {
  return apiRequestAsync('POST', '/users/me/kyc', { kycFront: kycFront, kycBack: kycBack });
}

function getAdminStats() {
  var data = readServerData('server-stats-data');
  if (data) return data;
  return { pendingPosts: 0, pendingClaims: 0, pendingKyc: 0, suspiciousClaims: 0, totalUsers: 0, totalPosts: 0, openReports: 0, recovered: 0 };
}

function awardPointsToUser() { return { ok: true }; }

async function completeClaimRecoveryAsync(claimId, notes) {
  const res = await apiRequestAsync('POST', '/admin/claims/' + claimId + '/approve');
  if (!res.ok) return { ok: false, error: res.data.error || 'Could not approve claim.' };
  _postsCache = null; _claimsCache = null;
  return { ok: true, claim: normalizeClaim(res.data), recoveredUserPost: true };
}

async function approvePostByIdAsync(postId) {
  const res = await apiRequestAsync('POST', '/admin/posts/' + postId + '/approve');
  _postsCache = null;
  return res.ok ? { ok: true, post: res.data } : { ok: false, error: res.data.error };
}

async function rejectPostByIdAsync(postId) {
  const res = await apiRequestAsync('POST', '/admin/posts/' + postId + '/reject');
  _postsCache = null;
  return res.ok ? { ok: true, post: res.data } : { ok: false, error: res.data.error };
}

function getClaimDayOfSeven(claim) {
  if (!claim) return 1;
  if (claim.dayOfSeven != null) return Math.min(7, Math.max(1, Number(claim.dayOfSeven) || 1));
  const submitted = claim.submittedDate ? new Date(claim.submittedDate) : null;
  if (!submitted || Number.isNaN(submitted.getTime())) return 1;
  const diff = Math.floor((Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(7, Math.max(1, diff));
}

function getPostAgeDays(post) {
  if (!post || !post.date) return 999;
  const d = new Date(post.date);
  if (Number.isNaN(d.getTime())) return 999;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function isClaimWaitingComplete(post) { return getPostAgeDays(post) >= 7; }

function findPostById(postId) {
  return loadPostsCache().find(function(p) { return String(p.id) === String(postId); }) || null;
}

async function submitTipAsync(postId, infoType, message) {
  const res = await apiRequestAsync('POST', '/posts/' + postId + '/tips', { infoType, message });
  return res.ok ? { ok: true, tip: res.data } : { ok: false, error: res.data.error };
}

async function submitReportAsync(payload) {
  const res = await apiRequestAsync('POST', '/reports', payload);
  return res.ok ? { ok: true, report: res.data } : { ok: false, error: res.data.error };
}

function getOfficeInfo() {
  var data = readServerData('server-office-data');
  if (data) { _officeCache = data; return _officeCache; }
  return null;
}

function getCategoriesFromApi() {
  var data = readServerData('server-categories-data');
  if (Array.isArray(data)) { _categoriesCache = data; return _categoriesCache; }
  return null;
}

/* Backward-compatible wrappers for write functions (fire-and-forget) */
function saveMyPost(post) { return saveMyPostAsync(post); }
function updateMyPost(postId, updates) { return updateMyPostAsync(postId, updates); }
function deleteMyPost(postId) { return deleteMyPostAsync(postId); }
function saveMyClaim(claim) { return saveMyClaimAsync(claim); }
function markAllMyNotificationsRead() { markAllMyNotificationsReadAsync(); }
function submitTip(postId, infoType, message) { return submitTipAsync(postId, infoType, message); }
function submitReport(payload) { return submitReportAsync(payload); }
function updateCurrentUser(updates) { return updateCurrentUserAsync(updates); }
function changeCurrentPassword(c, n) { return changeCurrentPasswordAsync(c, n); }
function resetPasswordForIdentifier(i, p) { return resetPasswordForIdentifierAsync(i, p); }
function loginWithCredentials(i, p) { return loginWithCredentialsAsync(i, p); }
function loginAdminWithCredentials(i, p) { return loginAdminWithCredentialsAsync(i, p); }
function createUserAccount(d) { return createUserAccountAsync(d); }
function updateAnyUserPost(id, u) { return updateAnyUserPostAsync(id, u); }
function completeClaimRecovery(id, n) { return completeClaimRecoveryAsync(id, n); }
function updateClaimById(id, u) { return updateClaimByIdAsync(id, u); }
function approvePostById(id) { return approvePostByIdAsync(id); }
function rejectPostById(id) { return rejectPostByIdAsync(id); }
function approveUserKyc(id) { return approveUserKycAsync(id); }
function rejectUserKyc(id) { return rejectUserKycAsync(id); }

/* ──────── OTP helpers ──────── */

async function sendOtpToEmail(email, purpose) {
  const res = await apiRequestAsync('POST', '/auth/send-otp', {
    email: String(email || '').trim(),
    purpose: purpose || 'signup'
  });
  return { ok: res.ok, otp: res.data && res.data.otp ? res.data.otp : null };
}

async function verifyOtpCode(email, code, purpose) {
  const res = await apiRequestAsync('POST', '/auth/verify-otp', {
    email: String(email || '').trim(),
    code: String(code || '').trim(),
    purpose: purpose || 'signup'
  });
  return res.ok;
}
