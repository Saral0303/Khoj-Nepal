/* Khoj Nepal Admin */

function renderAdminNav(active) {
  const groups = [
    { label: 'Overview', key: 'groupOverview', links: [
      ['dashboard.html', 'adminDashboard', 'Dashboard']
    ]},
    { label: 'Content', key: 'groupContent', links: [
      ['posts.html', 'pendingPosts', 'Pending Posts'],
      ['lost.html', 'adminLostItems', 'Lost Items'],
      ['found.html', 'adminFoundItems', 'Found Items']
    ]},
    { label: 'Verification', key: 'groupVerification', links: [
      ['claims.html', 'pendingClaims', 'Claims'],
      ['verification.html', 'kycReview', 'KYC Review'],
      ['suspicious.html', 'adminSuspicious', 'Suspicious']
    ]},
    { label: 'Management', key: 'groupManagement', links: [
      ['users.html', 'adminUsers', 'Users'],
      ['recovered.html', 'adminRecovered', 'Recovered'],
      ['rewards.html', 'adminRewards', 'Rewards']
    ]},
    { label: 'System', key: 'groupSystem', links: [
      ['reports.html', 'adminReports', 'Reports'],
      ['settings.html', 'adminSettings', 'Settings']
    ]}
  ];

  const side = document.getElementById('admin-sidebar');
  const mobile = document.getElementById('admin-mobile-nav');
  const admin = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const name = admin ? admin.fullName : 'Admin';

  const sideHtml = `
    <button type="button" class="admin-sidebar-toggle" id="admin-sidebar-toggle" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <a href="dashboard.html" class="admin-logo">🔍 Khoj Nepal Admin</a>
    <p class="admin-signed-in">${name}</p>
    <div class="admin-sidebar-nav">
      ${groups.map(g => `
        <div class="admin-nav-group">
          <div class="admin-nav-group-label" data-i18n="${g.key}">${g.label}</div>
          ${g.links.map(([href, key, fallback]) =>
            `<a href="${href}" class="admin-nav-link ${active === href ? 'active' : ''}" data-i18n="${key}">${fallback}</a>`
          ).join('')}
        </div>
      `).join('')}
    </div>
    <div class="admin-sidebar-footer">
      <a href="../office.html" class="admin-nav-link admin-exit-link" id="admin-exit" data-i18n="officeInfo">Admin Office</a>
      <button type="button" class="admin-nav-link admin-logout-btn" id="admin-logout" data-i18n="signOut">Sign Out</button>
    </div>`;

  if (side) side.innerHTML = sideHtml;

  const savedScroll = localStorage.getItem('admin_sidebar_scroll');
  if (savedScroll) {
    requestAnimationFrame(() => { side.scrollTop = parseInt(savedScroll, 10); });
  }
  side.addEventListener('scroll', () => {
    localStorage.setItem('admin_sidebar_scroll', side.scrollTop);
  });

  document.getElementById('admin-sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('admin-sidebar')?.classList.toggle('open');
  });

  if (mobile) {
    mobile.innerHTML = groups.flatMap(g =>
      g.links.map(([href, key, fallback]) =>
        `<a href="${href}" class="${active === href ? 'active' : ''}" data-i18n="${key}">${fallback}</a>`
      )
    ).join('')
      + `<a href="../login.html" class="admin-exit-link" id="admin-exit-mobile" data-i18n="exitAdminPanel">← Back to Khoj Nepal</a>`
      + `<button type="button" class="admin-logout-btn" id="admin-logout-mobile" data-i18n="signOut">Sign Out</button>`;
  }

  document.getElementById('admin-logout')?.addEventListener('click', adminLogout);
  document.getElementById('admin-logout-mobile')?.addEventListener('click', adminLogout);
  document.getElementById('admin-exit')?.addEventListener('click', exitAdminPanel);
  document.getElementById('admin-exit-mobile')?.addEventListener('click', exitAdminPanel);
}

function adminLogout() {
  if (typeof logoutCurrentUser === 'function') logoutCurrentUser();
  window.location.href = 'login.html';
}

/** Leave admin panel and return to the community Sign In screen */
function exitAdminPanel(e) {
  if (e) e.preventDefault();
  if (typeof logoutCurrentUser === 'function') logoutCurrentUser();
  window.location.href = '../login.html';
}

function initAdminPage(active) {
  if (typeof initTheme === 'function') initTheme();
  if (typeof ensureDemoAdmin === 'function') ensureDemoAdmin();
  if (typeof guardAdminAccess === 'function' && !guardAdminAccess()) return false;
  renderAdminNav(active);
  if (typeof applyTranslations === 'function') applyTranslations();
  return true;
}

function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeHtml(status) {
  const cls = {
    pending: 'badge-pending', active: 'badge-active', approved: 'badge-approved',
    resolved: 'badge-resolved', rejected: 'badge-rejected', suspicious: 'badge-suspicious',
    under_review: 'badge-pending', under_investigation: 'badge-pending',
    additional_info: 'badge-info', kyc_submitted: 'badge-info',
    delivered: 'badge-approved', owner_found: 'badge-approved',
    none: 'badge-pending', verified: 'badge-approved'
  };
  const label = claimStatusLabel(status) || status || '—';
  const c = cls[status] || 'badge-pending';
  return `<span class="badge ${c}">${escHtml(label)}</span>`;
}

function kycBadgeHtml(status) {
  const cls = { none: 'badge-pending', pending: 'badge-pending', verified: 'badge-approved', rejected: 'badge-rejected' };
  const label = kycStatusLabel(status) || status || '—';
  const c = cls[status] || 'badge-pending';
  return `<span class="badge ${c}">${escHtml(label)}</span>`;
}

function claimStatusLabel(status) {
  const map = {
    under_review: 'Under Review',
    under_investigation: 'Under Investigation',
    suspicious: 'Suspicious',
    approved: 'Approved',
    rejected: 'Rejected',
    resolved: 'Resolved',
    additional_info: 'Additional Information Required',
    pending: 'Pending',
    kyc_submitted: 'KYC Submitted'
  };
  return map[status] || status || '—';
}

function kycStatusLabel(status) {
  const map = {
    none: 'Not submitted',
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected'
  };
  return map[status] || status || '—';
}

function mergeClaimsForAdmin() {
  return typeof getAllClaims === 'function' ? getAllClaims() : [];
}

function renderAdminDashboard() {
  if (!initAdminPage('dashboard.html')) return;
  const stats = typeof getAdminStats === 'function' ? getAdminStats() : {};
  const setCount = (id, n) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(n ?? 0);
  };
  setCount('stat-pending-posts', stats.pendingPosts);
  setCount('stat-pending-claims', stats.pendingClaims);
  setCount('stat-pending-kyc', stats.pendingKyc);
  setCount('stat-suspicious', stats.suspiciousClaims);

  setCount('attention-post-count', stats.pendingPosts);
  setCount('attention-claim-count', stats.pendingClaims);
  setCount('attention-kyc-count', stats.pendingKyc);
  setCount('attention-suspicious-count', stats.suspiciousClaims);

  const claimsBody = document.getElementById('admin-dash-claims');
  if (claimsBody) {
    const claims = mergeClaimsForAdmin().slice(0, 8);
    claimsBody.innerHTML = claims.length
      ? claims.map(c => `
        <tr>
          <td>${escHtml(c.itemTitle || '—')}</td>
          <td>${escHtml(c.claimantName || c.claimant?.name || '—')}</td>
          <td>${escHtml(claimStatusLabel(c.status))}</td>
          <td>${escHtml(c.submittedDate || '—')}</td>
          <td>${c.isMock
            ? ''
            : `<a href="claims.html?id=${c.id}" class="btn btn-sm btn-primary" data-i18n="review">Review</a>`}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="empty-state" data-i18n="emptyClaims">${typeof t === 'function' ? t('emptyClaims') : 'No claims yet. Claims appear after someone claims a Found item with KYC.'}</td></tr>`;
  }

  const postsBody = document.getElementById('admin-dash-posts');
  if (postsBody) {
    const pending = (typeof getAllUserPosts === 'function' ? getAllUserPosts() : [])
      .filter(p => p.status === 'pending')
      .slice(0, 8);
    postsBody.innerHTML = pending.length
      ? pending.map(p => `
        <tr>
          <td>${escHtml(p.title)}</td>
          <td>${p.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</td>
          <td>${escHtml(p.userName)}</td>
          <td>${escHtml(p.date)}</td>
          <td><a href="posts.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-primary" data-i18n="review">Review</a></td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="empty-state" data-i18n="emptyPosts">${typeof t === 'function' ? t('emptyPosts') : 'No pending posts. New user posts appear here for approval.'}</td></tr>`;
  }

  if (typeof applyTranslations === 'function') applyTranslations();
}

function adminCategoryLabel(categoryId, subcategoryId) {
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const cat = cats.find(c => c.id === categoryId);
  const sub = cat?.subcategories?.find(s => s.id === subcategoryId);
  const catName = cat?.en || categoryId || '—';
  const subName = sub?.en || subcategoryId || '';
  return subName ? `${catName} · ${subName}` : catName;
}

function findPosterForAdmin(post) {
  if (!post) return null;
  const users = typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : [];
  return users.find(u => String(u.id) === String(post.userId || post.ownerId)) || null;
}

function renderAdminPosts() {
  if (!initAdminPage('posts.html')) return;
  const detailId = new URLSearchParams(window.location.search).get('id');
  const listWrap = document.getElementById('admin-posts-list');
  const detailWrap = document.getElementById('admin-post-detail');

  if (detailId && detailWrap) {
    if (listWrap) listWrap.hidden = true;
    detailWrap.hidden = false;
    renderAdminPostDetail(detailId);
    return;
  }

  if (detailWrap) detailWrap.hidden = true;
  if (listWrap) listWrap.hidden = false;
  const body = document.getElementById('admin-posts-body');
  if (!body) return;
  const posts = (typeof getAllUserPosts === 'function' ? getAllUserPosts() : [])
    .filter(p => p.status === 'pending');

  if (!posts.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty-state" data-i18n="emptyPosts">${typeof t === 'function' ? t('emptyPosts') : 'No pending posts. New user posts appear here for approval.'}</td></tr>`;
    return;
  }

  body.innerHTML = posts.map(p => `
    <tr data-post-id="${p.id}">
      <td>${escHtml(p.title)}</td>
      <td>${p.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</td>
      <td>${escHtml(adminCategoryLabel(p.category, p.subcategory))}</td>
      <td>${escHtml(p.userName)}</td>
      <td>${escHtml(p.location || '—')}</td>
      <td>${escHtml(p.date || '—')}</td>
      <td><a href="posts.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-primary">Review</a></td>
    </tr>`).join('');
}

function renderAdminPostDetail(postId) {
  const box = document.getElementById('admin-post-detail');
  if (!box) return;
  const post = (typeof getAllUserPosts === 'function' ? getAllUserPosts() : [])
    .find(p => String(p.id) === String(postId));
  if (!post) {
    box.innerHTML = '<p>Post not found. <a href="posts.html">Back to pending posts</a></p>';
    return;
  }

  const poster = findPosterForAdmin(post);
  const description = post.description || post.descriptionNe || '—';
  const photo = post.image
    ? `<img src="${post.image}" alt="${escHtml(post.title || 'Item')}" class="kyc-admin-img">`
    : '<div class="kyc-preview">No photo uploaded</div>';
  const typeLabel = post.type === 'lost' ? '🔴 Lost' : '🟢 Found';
  const canDecide = post.status === 'pending';

  box.innerHTML = `
    <p><a href="posts.html" class="btn btn-ghost btn-sm">← Back</a></p>
    <div class="review-grid">
      <div class="review-section">
        <h3>Item Photo</h3>
        ${photo}
      </div>
      <div class="review-section">
        <h3>Item Details</h3>
        <p><strong>${escHtml(post.title || '—')}</strong></p>
        <p>${typeLabel} · ${escHtml(adminCategoryLabel(post.category, post.subcategory))}</p>
        <p><strong>Location:</strong> ${escHtml(post.location || '—')}</p>
        <p><strong>Date:</strong> ${escHtml(post.date || post.createdAt || '—')}</p>
        <p><strong>Status:</strong> ${escHtml(post.status || '—')}</p>
      </div>
      <div class="review-section">
        <h3>Description</h3>
        <p style="white-space:pre-wrap">${escHtml(description)}</p>
      </div>
      <div class="review-section">
        <h3>Posted By</h3>
        <p><strong>Name:</strong> ${escHtml(post.userName || poster?.fullName || '—')}</p>
        <p><strong>Phone:</strong> ${escHtml(poster?.mobile || '—')}</p>
        <p><strong>Email:</strong> ${escHtml(poster?.email || '—')}</p>
        <p class="form-note">Use contact details only if you need to verify the report before approving.</p>
      </div>
    </div>
    <div class="review-section mt-16">
      <h3>Admin Notes / Reject Reason</h3>
      <textarea class="form-textarea" id="post-admin-notes" placeholder="Optional note for the file, or reason if rejecting">${escHtml(post.adminNotes || '')}</textarea>
    </div>
    ${canDecide ? `
    <div class="admin-actions" style="margin-top:20px">
      <button type="button" class="btn btn-danger" data-admin-action="reject-post" data-id="${post.id}">❌ Reject Post</button>
      <button type="button" class="btn btn-success" data-admin-action="approve-post" data-id="${post.id}">✅ Approve Post</button>
    </div>` : `
    <p class="form-note mt-16">This post is already <strong>${escHtml(post.status)}</strong>. <a href="posts.html">Back to queue</a></p>`}`;
  if (typeof applyTranslations === 'function') applyTranslations();
}

function renderAdminClaimsList() {
  if (!initAdminPage('claims.html')) return;
  const detailId = new URLSearchParams(window.location.search).get('id');
  const listWrap = document.getElementById('admin-claims-list');
  const detailWrap = document.getElementById('admin-claim-detail');

  if (detailId && detailWrap) {
    if (listWrap) listWrap.hidden = true;
    detailWrap.hidden = false;
    renderAdminClaimDetail(detailId);
    return;
  }

  if (detailWrap) detailWrap.hidden = true;
  if (!listWrap) return;
  listWrap.hidden = false;
  const body = document.getElementById('admin-claims-body');
  if (!body) return;

  const claims = typeof getAllClaims === 'function' ? getAllClaims() : [];
  body.innerHTML = claims.length
    ? claims.map(c => `
      <tr>
        <td>${escHtml(c.itemTitle || '—')}</td>
        <td>${escHtml(c.claimantName || c.claimant?.name || '—')}</td>
        <td>${badgeHtml(c.status)}</td>
        <td>${c.kycFront || c.kycBack ? '<span class="badge badge-info">📄 Submitted</span>' : '<span class="badge badge-pending">—</span>'}</td>
        <td>${escHtml(c.submittedDate || '—')}</td>
        <td><a href="claims.html?id=${c.id}" class="btn btn-sm btn-primary" data-i18n="review">Review</a></td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="empty-state" data-i18n="emptyClaims">${typeof t === 'function' ? t('emptyClaims') : 'No user claims yet. Claims appear after someone claims a Found item with KYC.'}</td></tr>`;
}

function renderAdminClaimDetail(claimId) {
  const claim = typeof getClaimById === 'function' ? getClaimById(claimId) : null;
  const box = document.getElementById('admin-claim-detail');
  if (!box) return;
  if (!claim) {
    box.innerHTML = '<p>Claim not found. <a href="claims.html">Back to claims</a></p>';
    return;
  }

  const post = (typeof getAllUserPosts === 'function'
    ? getAllUserPosts().find(p => String(p.id) === String(claim.postId))
    : null) || (typeof getPostById === 'function' ? getPostById(claim.postId) : null);

  const claimant = claim.claimant || {};
  const front = claim.kycFront
    ? `<img src="${claim.kycFront}" alt="KYC front" class="kyc-admin-img">`
    : '<div class="kyc-preview">No front document</div>';
  const back = claim.kycBack
    ? `<img src="${claim.kycBack}" alt="KYC back" class="kyc-admin-img">`
    : '<div class="kyc-preview">No back document</div>';

  const historyHtml = (claim.history || []).length
    ? `<ul class="claim-audit-list">${claim.history.map(h =>
        `<li><strong>${escHtml(h.date || '')}</strong> — ${escHtml(typeof t === 'function' && h.key ? t(h.key) : (h.key || h.text || ''))}</li>`
      ).join('')}</ul>`
    : `<p class="form-note">${escHtml(claim.submittedDate || '')} — Claim submitted</p>`;

  const claimantUser = (typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : [])
    .find(u => String(u.id) === String(claim.ownerId));
  const userKycVerified = claimantUser && claimantUser.kycStatus === 'verified';

  const approveDisabled = (!userKycVerified && !claim.kycVerified)
    ? 'disabled title="User KYC not verified"'
    : '';

  if (typeof renderSevenDayProgress === 'function') {
    const progress = document.getElementById('claim-progress-admin');
    if (progress) progress.innerHTML = '';
  }

  box.innerHTML = `
    <p><a href="claims.html" class="btn btn-ghost btn-sm">← Back</a></p>
    <div class="review-grid">
      <div class="review-section">
        <h3 data-i18n="itemInfo">Item Information</h3>
        <p><strong>${escHtml(claim.itemTitle || post?.title || '—')}</strong></p>
        <p>${post ? escHtml((post.location || '') + ' · ' + (post.date || '')) : ''}</p>
        ${post?.image ? `<img src="${post.image}" alt="" class="kyc-admin-img">` : ''}
      </div>
      <div class="review-section">
        <h3 data-i18n="claimantInfo">Claimant Information</h3>
        <p><strong>Name:</strong> ${escHtml(claim.claimantName || claimant.name || '—')}</p>
        <p><strong>Phone:</strong> ${escHtml(claimant.phone || '—')}</p>
        <p><strong>Email:</strong> ${escHtml(claimant.email || '—')}</p>
        <p><strong>Address:</strong> ${escHtml(claimant.address || '—')}</p>
      </div>
      <div class="review-section">
        <h3 data-i18n="ownershipInfo">Ownership Evidence</h3>
        <p>${escHtml(claim.ownership || '—')}</p>
        ${claim.proofImage
          ? `<div class="mt-16"><strong data-i18n="claimProofPhoto">${typeof t === 'function' ? t('claimProofPhoto') : 'Ownership proof photo'}</strong>
             <img src="${claim.proofImage}" alt="Proof" class="kyc-admin-img"></div>`
          : `<p class="form-note mt-16">${typeof t === 'function' ? t('noProofPhoto') : 'No optional proof photo submitted.'}</p>`}
      </div>
      <div class="review-section">
        <h3 data-i18n="kycDocs">User KYC Status</h3>
        <p class="form-note">KYC: ${userKycVerified ? '✅ Verified' : (claimantUser ? '🟡 ' + (claimantUser.kycStatus || 'none') : '—')}</p>
      </div>
    </div>
    <div class="review-section mt-16">
      <h3 data-i18n="claimHistory">Claim History</h3>
      ${historyHtml}
    </div>
    <div class="review-section mt-16">
      <h3 data-i18n="investigationNotes">Admin Notes / Request Message</h3>
      <textarea class="form-textarea" id="claim-admin-notes" placeholder="Notes for the file, or message when requesting more information">${escHtml(claim.notes || claim.adminMessage || '')}</textarea>
    </div>
    <div class="admin-actions" style="margin-top:20px">
      <button type="button" class="btn btn-outline" data-admin-action="request-claim-info" data-id="${claim.id}">📋 Request More Information</button>
      <button type="button" class="btn btn-outline" data-admin-action="flag-claim" data-id="${claim.id}">⚠ Flag Suspicious</button>
      <button type="button" class="btn btn-danger" data-admin-action="reject-claim" data-id="${claim.id}">❌ Reject Claim</button>
      <button type="button" class="btn btn-success" data-admin-action="approve-claim" data-id="${claim.id}" ${approveDisabled}>✅ Approve Claim</button>
    </div>
    ${(!userKycVerified && !claim.kycVerified) ? `<p class="form-note mt-16" data-i18n="approveRequiresKyc">Approve Claim stays disabled until user KYC is verified.</p>` : ''}`;
  if (typeof applyTranslations === 'function') applyTranslations();
}

function renderAdminKycVerification() {
  if (!initAdminPage('verification.html')) return;

  const pendingBody = document.getElementById('admin-kyc-users-body');
  if (pendingBody) {
    const pendingUsers = (typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : [])
      .filter(u => u.kycStatus === 'pending');
    pendingBody.innerHTML = pendingUsers.length
      ? pendingUsers.map(u => `
        <tr>
          <td>${escHtml(u.fullName)}</td>
          <td>@${escHtml(u.username)}</td>
          <td>${escHtml(u.kycSubmittedAt || '—')}</td>
          <td>${kycBadgeHtml('pending')}</td>
          <td>
            <button type="button" class="btn btn-sm btn-primary" data-admin-action="view-user-kyc" data-id="${u.id}">View</button>
          </td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="empty-state" data-i18n="emptyKyc">${typeof t === 'function' ? t('emptyKyc') : 'No pending KYC submissions.'}</td></tr>`;
  }

  const allBody = document.getElementById('admin-all-users-kyc-body');
  if (allBody) {
    const allUsers = (typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : [])
      .filter(u => u.role !== 'admin');
    allBody.innerHTML = allUsers.length
      ? allUsers.map(u => `
        <tr>
          <td>${escHtml(u.fullName)}</td>
          <td>@${escHtml(u.username)}</td>
          <td>${kycBadgeHtml(u.kycStatus || 'none')}</td>
          <td><button type="button" class="btn btn-sm btn-ghost" data-admin-action="view-user-kyc" data-id="${u.id}">View</button></td>
        </tr>`).join('')
      : `<tr><td colspan="4" class="empty-state">${typeof t === 'function' ? t('emptyUsers') : 'No users found.'}</td></tr>`;
  }

  const modal = document.getElementById('admin-kyc-modal');
  if (modal) modal.hidden = true;
}

function renderAdminUsers() {
  if (!initAdminPage('users.html')) return;
  const body = document.getElementById('admin-users-body');
  if (!body) return;
  const users = (typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : []);
  body.innerHTML = users.length
    ? users.map(u => `
      <tr>
        <td>${escHtml(u.fullName)}</td>
        <td>@${escHtml(u.username)}</td>
        <td>${escHtml(u.email)}</td>
        <td>${escHtml(u.city || u.district || '—')}</td>
        <td>${u.role === 'admin' ? '<span class="badge badge-info">Admin</span>' : '<span class="badge badge-pending">User</span>'}</td>
        <td>${kycBadgeHtml(u.kycStatus || 'none')}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="empty-state" data-i18n="emptyUsers">${typeof t === 'function' ? t('emptyUsers') : 'No users found.'}</td></tr>`;
}

function renderAdminSuspicious() {
  if (!initAdminPage('suspicious.html')) return;
  const body = document.getElementById('admin-suspicious-body');
  if (!body) return;
  const claims = (typeof getAllClaims === 'function' ? getAllClaims() : [])
    .filter(c => c.status === 'suspicious' || c.investigation === 'suspicious');
  body.innerHTML = claims.length
    ? claims.map(c => `
      <tr>
        <td>${escHtml(c.itemTitle || '—')}</td>
        <td>${escHtml(c.claimantName || c.claimant?.name || '—')}</td>
        <td>${escHtml(c.submittedDate || '—')}</td>
        <td><a href="claims.html?id=${c.id}" class="btn btn-sm btn-danger" data-i18n="review">Review</a></td>
      </tr>`).join('')
    : `<tr><td colspan="4" class="empty-state" data-i18n="emptySuspicious">${typeof t === 'function' ? t('emptySuspicious') : 'No suspicious claims flagged.'}</td></tr>`;
}

function renderAdminRewards() {
  if (!initAdminPage('rewards.html')) return;
  const body = document.getElementById('admin-rewards-body');
  if (!body) return;
  const lang = typeof getLang === 'function' ? getLang() : 'en';
  const users = (typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : [])
    .filter(u => u.role !== 'admin')
    .sort((a, b) => (b.points || 0) - (a.points || 0));
  body.innerHTML = users.length
    ? users.map(u => {
      const level = typeof getUserLevel === 'function'
        ? getUserLevel(u.points || 0)
        : { icon: '🥉', en: 'Bronze Helper', ne: 'कांस्य सहायक' };
      return `<tr>
        <td>${escHtml(u.fullName)}</td>
        <td>@${escHtml(u.username)}</td>
        <td>${u.points || 0}</td>
        <td>${u.itemsReturned || 0}</td>
        <td>${level.icon} ${lang === 'ne' ? level.ne : level.en}</td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="5" class="empty-state" data-i18n="emptyRewards">${typeof t === 'function' ? t('emptyRewards') : 'No registered users with rewards yet.'}</td></tr>`;
}

function renderAdminSettings() {
  if (!initAdminPage('settings.html')) return;
  const admin = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const box = document.getElementById('admin-settings-profile');
  if (box && admin) {
    box.innerHTML = `
      <div class="detail-row"><strong>${escHtml(admin.fullName)}</strong></div>
      <div class="detail-row">@${escHtml(admin.username)}</div>
      <div class="detail-row">${escHtml(admin.email)}</div>
      <div class="detail-row">Role: Admin</div>`;
  }
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  document.getElementById('admin-theme-light')?.classList.toggle('active', theme !== 'dark');
  document.getElementById('admin-theme-dark')?.classList.toggle('active', theme === 'dark');
  const lang = typeof getLang === 'function' ? getLang() : 'en';
  document.getElementById('admin-lang-en')?.classList.toggle('active', lang !== 'ne');
  document.getElementById('admin-lang-ne')?.classList.toggle('active', lang === 'ne');

  document.getElementById('admin-theme-light')?.addEventListener('click', () => {
    if (typeof setTheme === 'function') setTheme('light');
    renderAdminSettings();
  });
  document.getElementById('admin-theme-dark')?.addEventListener('click', () => {
    if (typeof setTheme === 'function') setTheme('dark');
    renderAdminSettings();
  });
  document.getElementById('admin-lang-en')?.addEventListener('click', () => {
    if (typeof setLang === 'function') setLang('en');
    renderAdminSettings();
  });
  document.getElementById('admin-lang-ne')?.addEventListener('click', () => {
    if (typeof setLang === 'function') setLang('ne');
    renderAdminSettings();
  });
}

function renderAdminReportsDeep() {
  if (!initAdminPage('reports.html')) return;
  const body = document.getElementById('admin-reports-body');
  if (body) {
    const suspicious = (typeof getAllClaims === 'function' ? getAllClaims() : [])
      .filter(c => c.status === 'suspicious' || c.investigation === 'suspicious')
      .map(c => ({
        type: 'Fraudulent Claim',
        related: c.itemTitle || '—',
        who: c.claimantName || c.claimant?.name || '—',
        date: c.submittedDate || '—',
        status: 'Open',
        link: `claims.html?id=${c.id}`
      }));
    const pendingPosts = (typeof getAllUserPosts === 'function' ? getAllUserPosts() : [])
      .filter(p => p.status === 'pending')
      .map(p => ({
        type: 'Pending Post Review',
        related: p.title,
        who: p.userName,
        date: p.date,
        status: 'Pending',
        link: 'posts.html'
      }));
    const rows = [...suspicious, ...pendingPosts];
    body.innerHTML = rows.length
      ? rows.map((r, i) => `
        <tr>
          <td>R-${1000 + i}</td>
          <td>${escHtml(r.type)}</td>
          <td>${escHtml(r.related)}</td>
          <td>${escHtml(r.who)}</td>
          <td>${escHtml(r.date)}</td>
          <td>${escHtml(r.status)}</td>
          <td><a href="${r.link}" class="btn btn-sm btn-primary">Review</a></td>
        </tr>`).join('')
      : `<tr><td colspan="7" class="empty-state" data-i18n="emptyReports">${typeof t === 'function' ? t('emptyReports') : 'No open reports. Suspicious claims and pending posts appear here.'}</td></tr>`;
  }
  /* keep existing count cards if present */
  const userPosts = typeof getAllUserPosts === 'function' ? getAllUserPosts() : [];
  const claims = typeof getAllClaims === 'function' ? getAllClaims() : [];
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = String(n); };
  set('r-lost', userPosts.filter(p => p.type === 'lost').length + (typeof getPostsByType === 'function' ? getPostsByType('lost').length : 0));
  set('r-found', userPosts.filter(p => p.type === 'found').length + (typeof getPostsByType === 'function' ? getPostsByType('found').length : 0));
  set('r-delivered',
    userPosts.filter(p => p.status === 'delivered' || p.status === 'owner_found').length +
    (typeof MOCK_POSTS !== 'undefined' ? MOCK_POSTS.filter(p => p.status === 'delivered' || p.status === 'owner_found').length : 0));
  set('r-suspicious', claims.filter(c => c.status === 'suspicious' || c.investigation === 'suspicious').length);
}

function showUserKycModal(userId) {
  const user = (typeof getRegisteredUsers === 'function' ? getRegisteredUsers() : [])
    .find(u => String(u.id) === String(userId));
  const modal = document.getElementById('admin-kyc-modal');
  const content = document.getElementById('admin-kyc-modal-content');
  if (!user || !modal || !content) return;
  content.innerHTML = `
    <h3>${escHtml(user.fullName)} (@${escHtml(user.username)})</h3>
    <p>Status: ${kycStatusLabel(user.kycStatus)}</p>
    <div class="review-grid">
      <div class="review-section">
        <h4>ID Front</h4>
        ${user.kycFront ? `<img src="${user.kycFront}" class="kyc-admin-img" alt="Front">` : '<p>—</p>'}
      </div>
      <div class="review-section">
        <h4>ID Back</h4>
        ${user.kycBack ? `<img src="${user.kycBack}" class="kyc-admin-img" alt="Back">` : '<p>—</p>'}
      </div>
    </div>
    <div class="admin-actions mt-16">
      <button type="button" class="btn btn-success" data-admin-action="approve-user-kyc" data-id="${user.id}">✅ Verify</button>
      <button type="button" class="btn btn-danger" data-admin-action="reject-user-kyc" data-id="${user.id}">❌ Reject</button>
      <button type="button" class="btn btn-ghost" id="admin-kyc-modal-close">Close</button>
    </div>`;
  modal.hidden = false;
  document.getElementById('admin-kyc-modal-close')?.addEventListener('click', () => { modal.hidden = true; });
}

function bindAdminActions() {
  if (document.body.dataset.adminActionsBound) return;
  document.body.dataset.adminActionsBound = '1';
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-admin-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-admin-action');
    const id = btn.getAttribute('data-id');

    if (action === 'approve-post') {
      showConfirm({
        title: typeof t === 'function' ? t('notifConfirmApprovePost') : 'Approve this post?',
        message: typeof t === 'function' ? t('notifConfirmApprovePost') : 'Approve this post?',
        confirmLabel: typeof t === 'function' ? t('approve') : 'Approve',
        onConfirm: function () {
          const notes = document.getElementById('post-admin-notes')?.value || '';
          const post = updateAnyUserPost(id, { status: 'active', adminNotes: notes });
          if (post.ok) {
            showNotification(typeof t === 'function' ? t('notifPostApprovedAdmin') : 'Post approved.', 'success');
            setTimeout(function () { window.location.href = 'posts.html'; }, 1200);
          }
        }
      });
    }
    if (action === 'reject-post') {
      showConfirm({
        title: typeof t === 'function' ? t('notifConfirmRejectPost') : 'Reject this post?',
        message: typeof t === 'function' ? t('notifConfirmRejectPost') : 'Are you sure you want to reject this post?',
        confirmLabel: typeof t === 'function' ? t('reject') : 'Reject',
        danger: true,
        onConfirm: function () {
          const notes = document.getElementById('post-admin-notes')?.value || '';
          const post = updateAnyUserPost(id, { status: 'rejected', adminNotes: notes });
          if (post.ok) {
            showNotification(typeof t === 'function' ? t('notifPostRejectedAdmin') : 'Post rejected.', 'success');
            setTimeout(function () { window.location.href = 'posts.html'; }, 1200);
          }
        }
      });
    }
    if (action === 'approve-claim') {
      showConfirm({
        title: typeof t === 'function' ? t('notifConfirmApproveClaim') : 'Approve this claim?',
        message: typeof t === 'function' ? t('notifConfirmApproveClaim') : 'Approve this claim and mark the item recovered?',
        confirmLabel: typeof t === 'function' ? t('approve') : 'Approve',
        onConfirm: function () {
          const notes = document.getElementById('claim-admin-notes')?.value || '';
          const result = typeof completeClaimRecovery === 'function'
            ? completeClaimRecovery(id, notes)
            : updateClaimById(id, { status: 'approved', investigation: 'resolved', notes, kycVerified: true });
          if (!result.ok) {
            showNotification(result.error || t('notifErrorGeneric'), 'error');
            return;
          }
          showNotification(typeof t === 'function' ? t('notifClaimApprovedAdmin') : 'Claim approved.', 'success');
          setTimeout(function () { window.location.href = 'claims.html'; }, 1200);
        }
      });
    }
    if (action === 'reject-claim') {
      showConfirm({
        title: typeof t === 'function' ? t('notifConfirmRejectClaim') : 'Reject this claim?',
        message: typeof t === 'function' ? t('notifConfirmRejectClaim') : 'Are you sure you want to reject this claim?',
        confirmLabel: typeof t === 'function' ? t('reject') : 'Reject',
        danger: true,
        onConfirm: function () {
          const notes = document.getElementById('claim-admin-notes')?.value || '';
          const claim = getClaimById(id);
          updateClaimById(id, {
            status: 'rejected', investigation: 'resolved', notes,
            history: [...(claim?.history || []), { date: new Date().toISOString().slice(0, 10), key: 'histClaimRejected' }]
          });
          showNotification(typeof t === 'function' ? t('notifClaimRejectedAdmin') : 'Claim rejected.', 'success');
          setTimeout(function () { window.location.href = 'claims.html'; }, 1200);
        }
      });
    }
    if (action === 'flag-claim') {
      showConfirm({
        title: typeof t === 'function' ? t('notifConfirmFlagClaim') : 'Flag as suspicious?',
        message: typeof t === 'function' ? t('notifConfirmFlagClaim') : 'Mark this claim as suspicious?',
        confirmLabel: typeof t === 'function' ? t('flagSuspicious') : 'Flag',
        danger: true,
        onConfirm: function () {
          const notes = document.getElementById('claim-admin-notes')?.value || '';
          const claim = getClaimById(id);
          updateClaimById(id, {
            status: 'suspicious', investigation: 'suspicious', notes,
            history: [...(claim?.history || []), { date: new Date().toISOString().slice(0, 10), key: 'histClaimSuspicious' }]
          });
          showNotification(typeof t === 'function' ? t('notifFlaggedSuspicious') : 'Claim flagged as suspicious.', 'success');
          setTimeout(function () { window.location.href = 'claims.html'; }, 1200);
        }
      });
    }
    if (action === 'request-claim-info') {
      const notes = document.getElementById('claim-admin-notes')?.value.trim()
        || (typeof t === 'function' ? t('defaultRequestMoreInfo') : 'Additional ownership information is required before we can verify this claim.');
      const claim = getClaimById(id);
      updateClaimById(id, {
        status: 'additional_info', investigation: 'normal', adminMessage: notes, notes,
        history: [...(claim?.history || []), { date: new Date().toISOString().slice(0, 10), key: 'histMoreInfoRequested' }]
      });
      showNotification(typeof t === 'function' ? t('notifRequestMoreInfo') : 'Requested more information.', 'success');
      setTimeout(function () { window.location.href = 'claims.html'; }, 1200);
    }
    if (action === 'verify-claim-kyc') {
      const notes = document.getElementById('claim-admin-notes')?.value || '';
      const claim = getClaimById(id);
      updateClaimById(id, {
        kycVerified: true, status: 'under_investigation', investigation: 'normal', notes,
        history: [...(claim?.history || []), { date: new Date().toISOString().slice(0, 10), key: 'histKycVerified' }]
      });
      showNotification(typeof t === 'function' ? t('notifKycVerified') : 'KYC verification updated.', 'success');
      renderAdminClaimDetail(id);
    }
    if (action === 'view-user-kyc') showUserKycModal(id);
    if (action === 'approve-user-kyc') {
      approveUserKyc(id);
      showNotification(typeof t === 'function' ? t('notifKycVerified') : 'KYC verification updated.', 'success');
      const modal = document.getElementById('admin-kyc-modal');
      if (modal) modal.hidden = true;
      renderAdminKycVerification();
    }
    if (action === 'reject-user-kyc') {
      showConfirm({
        title: typeof t === 'function' ? t('notifConfirmRejectKyc') : 'Reject this KYC submission?',
        message: typeof t === 'function' ? t('notifConfirmRejectKyc') : 'Reject this KYC submission?',
        confirmLabel: typeof t === 'function' ? t('reject') : 'Reject',
        danger: true,
        onConfirm: function () {
          rejectUserKyc(id);
          showNotification(typeof t === 'function' ? t('notifClaimRejectedAdmin') : 'Rejected.', 'success');
          const modal = document.getElementById('admin-kyc-modal');
          if (modal) modal.hidden = true;
          renderAdminKycVerification();
        }
      });
    }
  });
}

function initAdminLoginForm() {
  if (typeof initTheme === 'function') initTheme();
  if (typeof ensureDemoAdmin === 'function') ensureDemoAdmin();
  if (typeof applyTranslations === 'function') applyTranslations();

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user && user.role === 'admin') {
    window.location.replace('dashboard.html');
    return;
  }

  const form = document.getElementById('admin-login-form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('admin-identifier')?.value || '';
    const password = document.getElementById('admin-password')?.value || '';
    const errorBox = document.getElementById('admin-login-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (errorBox) errorBox.style.display = 'none';

    if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, true, 'Signing in...');
    if (typeof showPageLoading === 'function') showPageLoading('Signing you in...');

    try {
      const result = typeof loginAdminWithCredentialsAsync === 'function'
        ? await loginAdminWithCredentialsAsync(identifier, password)
        : loginAdminWithCredentials(identifier, password);
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
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (typeof hidePageLoading === 'function') hidePageLoading();
      if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false);
      if (errorBox) {
        errorBox.style.display = '';
        errorBox.textContent = err.message || 'Sign in failed.';
      }
    }
  });

  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
    });
  });
}

bindAdminActions();
