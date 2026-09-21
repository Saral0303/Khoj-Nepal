/* Khoj Nepal — dynamic auth + data layer (Spring Boot /api + HttpSession) */

const API_BASE = '/api';

let _cachedUser = null;
let _postsCache = null;
let _claimsCache = null;
let _notificationsCache = null;
let _activityCache = null;
let _usersCache = null;

function apiRequest(method, path, body) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, API_BASE + path, false);
  xhr.withCredentials = true;
  if (body !== undefined) {
    xhr.setRequestHeader('Content-Type', 'application/json');
  }
  try {
    xhr.send(body !== undefined ? JSON.stringify(body) : null);
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'Network error. Is the server running?' } };
  }
  let data = {};
  try {
    data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
  } catch (e) {
    data = { error: xhr.responseText || 'Invalid response' };
  }
  return { ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data };
}

/** Async API (needed so the loading spinner can animate while waiting). */
async function apiRequestAsync(method, path, body) {
  try {
    const res = await fetch(API_BASE + path, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }
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
  const res = apiRequest('GET', '/auth/me');
  if (res.ok) {
    _cachedUser = res.data;
    return _cachedUser;
  }
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

function setSessionUserId() {
  /* session is server-side cookie */
}

function logoutCurrentUser() {
  apiRequest('POST', '/auth/logout');
  _cachedUser = null;
  _postsCache = null;
  _claimsCache = null;
  _notificationsCache = null;
  _activityCache = null;
}

function createUserAccount(data) {
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
  const res = apiRequest('POST', '/auth/register', body);
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not create account.' };
  }
  _cachedUser = res.data;
  return { ok: true, user: res.data };
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
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not create account.' };
  }
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

function loginWithCredentials(identifier, password) {
  const res = apiRequest('POST', '/auth/login', {
    identifier: String(identifier || '').trim(),
    password: String(password || '')
  });
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Invalid email/mobile or password.' };
  }
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

async function loginWithCredentialsAsync(identifier, password) {
  const res = await apiRequestAsync('POST', '/auth/login', {
    identifier: String(identifier || '').trim(),
    password: String(password || '')
  });
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Invalid email/mobile or password.' };
  }
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

function loginAdminWithCredentials(identifier, password) {
  const res = apiRequest('POST', '/auth/admin/login', {
    identifier: String(identifier || '').trim(),
    password: String(password || '')
  });
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Invalid admin email or password.' };
  }
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

async function loginAdminWithCredentialsAsync(identifier, password) {
  const res = await apiRequestAsync('POST', '/auth/admin/login', {
    identifier: String(identifier || '').trim(),
    password: String(password || '')
  });
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Invalid admin email or password.' };
  }
  _cachedUser = res.data;
  return { ok: true, user: res.data };
}

function updateCurrentUser(updates) {
  const res = apiRequest('PUT', '/users/me', updates);
  if (!res.ok) return null;
  _cachedUser = res.data;
  return res.data;
}

function changeCurrentPassword(currentPass, newPass) {
  const res = apiRequest('POST', '/auth/change-password', {
    currentPassword: String(currentPass || ''),
    newPassword: String(newPass || '')
  });
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not change password.' };
  }
  return { ok: true };
}

function findAccountForPasswordReset(identifier) {
  if (!String(identifier || '').trim()) {
    return { ok: false, error: 'Enter email or mobile number.' };
  }
  const res = apiRequest('GET', '/users/me', null, true);
  return { ok: true, user: { id: identifier } };
}

function resetPasswordForIdentifier(identifier, newPass) {
  const res = apiRequest('POST', '/auth/forgot-password', {
    identifier: String(identifier || '').trim(),
    newPassword: String(newPass || '')
  });
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not reset password.' };
  }
  return { ok: true };
}

function loadPostsCache(force) {
  if (_postsCache && !force) return _postsCache;
  const res = apiRequest('GET', '/posts?page=0&size=200');
  if (res.ok && res.data) {
    _postsCache = Array.isArray(res.data) ? res.data : (res.data.content || []);
  } else {
    _postsCache = [];
  }
  return _postsCache;
}

function getAllUserPosts() {
  const user = _cachedUser || refreshCurrentUser();
  if (user && user.role === 'admin') {
    const res = apiRequest('GET', '/admin/posts?page=0&size=200');
    if (res.ok && res.data) {
      _postsCache = Array.isArray(res.data) ? res.data : (res.data.content || []);
    } else {
      _postsCache = [];
    }
    return _postsCache;
  }
  return loadPostsCache(true);
}

function getMyPosts() {
  const res = apiRequest('GET', '/posts/mine?page=0&size=200');
  if (res.ok && res.data) {
    return Array.isArray(res.data) ? res.data : (res.data.content || []);
  }
  return [];
}

function getMyPostById(postId) {
  return getMyPosts().find(p => String(p.id) === String(postId)) || null;
}

function saveMyPost(post) {
  const body = {
    type: post.type,
    title: post.title,
    titleNe: post.titleNe,
    description: post.description,
    descriptionNe: post.descriptionNe,
    location: post.location,
    locationNe: post.locationNe,
    category: post.category,
    subcategory: post.subcategory,
    date: post.date,
    image: post.image
  };
  const res = apiRequest('POST', '/posts', body);
  if (!res.ok) {
    throw new Error(res.data.error || 'Could not save post');
  }
  _postsCache = null;
  refreshCurrentUser();
  return res.data;
}

async function saveMyPostAsync(post) {
  const body = {
    type: post.type,
    title: post.title,
    titleNe: post.titleNe,
    description: post.description,
    descriptionNe: post.descriptionNe,
    location: post.location,
    locationNe: post.locationNe,
    category: post.category,
    subcategory: post.subcategory,
    date: post.date,
    image: post.image
  };
  const res = await apiRequestAsync('POST', '/posts', body);
  if (!res.ok) {
    throw new Error(res.data.error || 'Could not save post');
  }
  _postsCache = null;
  refreshCurrentUser();
  return res.data;
}

function isOwnPost(post) {
  const user = getCurrentUser();
  if (!user || !post) return false;
  return String(post.ownerId || post.userId) === String(user.id);
}

function updateMyPost(postId, updates) {
  const res = apiRequest('PUT', '/posts/' + postId, updates);
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not update post.' };
  }
  _postsCache = null;
  return { ok: true, post: res.data };
}

function deleteMyPost(postId) {
  const res = apiRequest('DELETE', '/posts/' + postId);
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not delete post.' };
  }
  _postsCache = null;
  return { ok: true };
}

function updateAnyUserPost(postId, updates) {
  if (updates.status === 'active') {
    return approvePostById(postId);
  }
  if (updates.status === 'rejected') {
    return rejectPostById(postId);
  }
  if (updates.status) {
    const res = apiRequest('POST', '/admin/posts/' + postId + '/status', {
      status: updates.status,
      handoverStep: updates.handoverStep
    });
    if (!res.ok) return { ok: false, error: res.data.error || 'Update failed' };
    _postsCache = null;
    return { ok: true, post: res.data };
  }
  return updateMyPost(postId, updates);
}

function getMyClaims() {
  const res = apiRequest('GET', '/claims/mine');
  _claimsCache = res.ok && Array.isArray(res.data) ? res.data : [];
  return _claimsCache.map(normalizeClaim);
}

function getAllClaims() {
  const res = apiRequest('GET', '/admin/claims?page=0&size=200');
  if (res.ok && res.data) {
    _claimsCache = Array.isArray(res.data) ? res.data : (res.data.content || []);
  } else {
    _claimsCache = [];
  }
  return _claimsCache.map(normalizeClaim);
}

function getClaimById(claimId) {
  const res = apiRequest('GET', '/claims/' + claimId);
  if (res.ok) return normalizeClaim(res.data);
  const admin = apiRequest('GET', '/admin/claims/' + claimId);
  return admin.ok ? normalizeClaim(admin.data) : null;
}

function normalizeClaim(c) {
  if (!c) return c;
  let history = [];
  try {
    history = c.historyJson ? JSON.parse(c.historyJson) : (c.history || []);
  } catch (e) {
    history = c.history || [];
  }
  return {
    ...c,
    read: c.readFlag,
    time: c.timeLabel || c.time,
    claimant: {
      name: c.claimantName,
      phone: c.claimantPhone,
      email: c.claimantEmail,
      address: c.claimantAddress
    },
    history
  };
}

function saveMyClaim(claim) {
  const body = {
    postId: claim.postId,
    claimantName: claim.claimantName || (claim.claimant && claim.claimant.name),
    claimantPhone: claim.claimantPhone || (claim.claimant && claim.claimant.phone),
    claimantEmail: claim.claimantEmail || (claim.claimant && claim.claimant.email),
    claimantAddress: claim.claimantAddress || (claim.claimant && claim.claimant.address),
    ownership: claim.ownership,
    kycFront: claim.kycFront,
    kycBack: claim.kycBack,
    proofImage: claim.proofImage || null
  };
  const res = apiRequest('POST', '/claims', body);
  if (!res.ok) {
    throw new Error(res.data.error || 'Could not submit claim');
  }
  _claimsCache = null;
  _postsCache = null;
  return normalizeClaim(res.data);
}

function updateClaimById(claimId, updates) {
  /* admin actions use dedicated endpoints */
  if (updates.status === 'approved') {
    return completeClaimRecovery(claimId, updates.notes);
  }
  if (updates.status === 'rejected') {
    const res = apiRequest('POST', '/admin/claims/' + claimId + '/reject', {
      adminMessage: updates.adminMessage || updates.notes || ''
    });
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  if (updates.status === 'additional_info') {
    const res = apiRequest('POST', '/admin/claims/' + claimId + '/more-info', {
      adminMessage: updates.adminMessage || 'Please provide more information'
    });
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  if (updates.status === 'suspicious' || updates.investigation === 'suspicious') {
    const res = apiRequest('POST', '/admin/claims/' + claimId + '/flag');
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  if (updates.kycVerified === true) {
    const res = apiRequest('POST', '/admin/claims/' + claimId + '/verify-kyc');
    return res.ok ? { ok: true, claim: normalizeClaim(res.data) } : { ok: false, error: res.data.error };
  }
  return { ok: false, error: 'Unsupported claim update' };
}

function getMyActivity() {
  const res = apiRequest('GET', '/activity?page=0&size=200');
  const list = (res.ok && res.data) ? (Array.isArray(res.data) ? res.data : (res.data.content || [])) : [];
  return list.map(a => ({
    ...a,
    time: a.timeLabel || a.time,
    key: a.activityKey || a.key
  }));
}

function addMyActivity() {
  /* created on server */
}

function getMyNotifications() {
  const res = apiRequest('GET', '/notifications?page=0&size=200');
  const list = (res.ok && res.data) ? (Array.isArray(res.data) ? res.data : (res.data.content || [])) : [];
  return list.map(n => ({
    ...n,
    read: !!n.readFlag,
    time: n.timeLabel || n.time,
    key: n.notifKey || n.key
  }));
}

function addMyNotification() {
  /* created on server */
}

function markAllMyNotificationsRead() {
  apiRequest('POST', '/notifications/read-all');
}

function addNotificationForUser() { /* server-side */ }
function addActivityForUser() { /* server-side */ }

const KHOJ_PUBLIC_PAGES = [
  'welcome', 'login', 'signup', 'forgot-password', 'help', 'how-it-works', 'privacy', 'terms'
];

function isPublicPage(page) {
  return KHOJ_PUBLIC_PAGES.includes(page);
}

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
    if (!isPublicPage(page)) {
      window.location.replace(base + 'login.html');
      return false;
    }
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

function ensureDemoAdmin() {
  /* Admin is seeded by Spring Boot SeedDataController */
}

function isAdminUser(user) {
  return !!(user && user.role === 'admin');
}

function guardAdminAccess() {
  const user = refreshCurrentUser();
  if (!isAdminUser(user)) {
    window.location.replace('login.html');
    return false;
  }
  return true;
}

function getRegisteredUsers() {
  const res = apiRequest('GET', '/admin/users?page=0&size=200');
  if (res.ok && res.data) {
    _usersCache = Array.isArray(res.data) ? res.data : (res.data.content || []);
  } else {
    _usersCache = [];
  }
  return _usersCache;
}

function updateUserById(userId, updates) {
  /* limited — profile updates use /users/me for self */
  return { ok: false, error: 'Use admin panel endpoints.' };
}

function approveUserKyc(userId) {
  const res = apiRequest('POST', '/admin/users/' + userId + '/kyc-approve');
  return res;
}

function rejectUserKyc(userId) {
  const res = apiRequest('POST', '/admin/users/' + userId + '/kyc-reject');
  return res;
}

function submitUserKyc() {
  return { ok: false, error: 'Use submitUserKycAsync() instead.' };
}

function submitUserKycAsync(kycFront, kycBack) {
  return apiRequestAsync('POST', '/users/me/kyc', { kycFront: kycFront, kycBack: kycBack });
}

function getAdminStats() {
  const res = apiRequest('GET', '/admin/stats');
  const claimsRes = apiRequest('GET', '/admin/claims');
  const claimList = claimsRes.ok && Array.isArray(claimsRes.data) ? claimsRes.data : [];
  if (!res.ok) {
    return {
      pendingPosts: 0,
      pendingClaims: claimList.filter(c => c.status === 'under_review' || c.status === 'under_investigation').length,
      pendingKyc: 0,
      suspiciousClaims: claimList.filter(c => c.investigation === 'suspicious' || c.status === 'suspicious').length,
      totalUsers: 0,
      totalPosts: 0
    };
  }
  const s = res.data;
  return {
    pendingPosts: s.pendingPosts || 0,
    pendingClaims: claimList.filter(c => c.status === 'under_review' || c.status === 'under_investigation').length,
    pendingKyc: 0,
    suspiciousClaims: claimList.filter(c => c.investigation === 'suspicious' || c.status === 'suspicious').length,
    totalUsers: Math.max(0, (s.users || 0) - 1),
    totalPosts: s.posts || 0,
    openReports: s.openReports || 0,
    recovered: s.recovered || 0
  };
}

function awardPointsToUser() {
  return { ok: true };
}

function completeClaimRecovery(claimId, notes) {
  const res = apiRequest('POST', '/admin/claims/' + claimId + '/approve');
  if (!res.ok) {
    return { ok: false, error: res.data.error || 'Could not approve claim.' };
  }
  _postsCache = null;
  _claimsCache = null;
  return { ok: true, claim: normalizeClaim(res.data), recoveredUserPost: true };
}

function approvePostById(postId) {
  const res = apiRequest('POST', '/admin/posts/' + postId + '/approve');
  _postsCache = null;
  return res.ok ? { ok: true, post: res.data } : { ok: false, error: res.data.error };
}

function rejectPostById(postId) {
  const res = apiRequest('POST', '/admin/posts/' + postId + '/reject');
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

function isClaimWaitingComplete(post) {
  return getPostAgeDays(post) >= 7;
}

function findPostById(postId) {
  const res = apiRequest('GET', '/posts/' + postId);
  return res.ok ? res.data : null;
}

function submitTip(postId, infoType, message) {
  const res = apiRequest('POST', '/posts/' + postId + '/tips', { infoType, message });
  return res.ok ? { ok: true, tip: res.data } : { ok: false, error: res.data.error };
}

function submitReport(payload) {
  const res = apiRequest('POST', '/reports', payload);
  return res.ok ? { ok: true, report: res.data } : { ok: false, error: res.data.error };
}

function getOfficeInfo() {
  const res = apiRequest('GET', '/office');
  return res.ok ? res.data : null;
}

function getCategoriesFromApi() {
  const res = apiRequest('GET', '/categories');
  return res.ok && Array.isArray(res.data) ? res.data : null;
}
