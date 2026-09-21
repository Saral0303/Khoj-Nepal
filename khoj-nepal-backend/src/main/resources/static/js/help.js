/* Khoj Nepal - Help & How-it-works (frontend only) */

function getHowItWorksSteps() {
  return [
    { n: '01', titleKey: 'hiwStep1Title', bodyKey: 'hiwStep1Body' },
    { n: '02', titleKey: 'hiwStep2Title', bodyKey: 'hiwStep2Body' },
    { n: '03', titleKey: 'hiwStep3Title', bodyKey: 'hiwStep3Body' },
    { n: '04', titleKey: 'hiwStep4Title', bodyKey: 'hiwStep4Body' },
    { n: '05', titleKey: 'hiwStep5Title', bodyKey: 'hiwStep5Body' },
    { n: '06', titleKey: 'hiwStep6Title', bodyKey: 'hiwStep6Body' },
    { n: '07', titleKey: 'hiwStep7Title', bodyKey: 'hiwStep7Body' }
  ];
}

function getHelpTopics() {
  return [
    {
      catKey: 'helpCatStarted',
      items: [
        { q: 'faqWhatIsKhoj', a: 'faqWhatIsKhojA' },
        { q: 'faqCreateAccount', a: 'faqCreateAccountA' },
        { q: 'faqHowSearch', a: 'faqHowSearchA' }
      ]
    },
    {
      catKey: 'helpCatLostFound',
      items: [
        { q: 'faqReportLost', a: 'faqReportLostA' },
        { q: 'faqReportFound', a: 'faqReportFoundA' },
        { q: 'faqImageRequired', a: 'faqImageRequiredA' },
        { q: 'faqHaveInfo', a: 'faqHaveInfoA' }
      ]
    },
    {
      catKey: 'helpCatClaims',
      items: [
        { q: 'faqHowClaim', a: 'faqHowClaimA' },
        { q: 'faqWhyKyc', a: 'faqWhyKycA' },
        { q: 'faqAdminVerify', a: 'faqAdminVerifyA' },
        { q: 'faqVerifyTime', a: 'faqVerifyTimeA' }
      ]
    },
    {
      catKey: 'helpCatRecovery',
      items: [
        { q: 'faqOfficeHandle', a: 'faqOfficeHandleA' },
        { q: 'faqOwnerReceive', a: 'faqOwnerReceiveA' },
        { q: 'faqAfterRecovered', a: 'faqAfterRecoveredA' }
      ]
    },
    {
      catKey: 'helpCatRewards',
      items: [
        { q: 'faqWhatPoints', a: 'faqWhatPointsA' },
        { q: 'faqEarnPoints', a: 'faqEarnPointsA' },
        { q: 'faqRewardLevels', a: 'faqRewardLevelsA' }
      ]
    },
    {
      catKey: 'helpCatSafety',
      items: [
        { q: 'faqFakeClaims', a: 'faqFakeClaimsA' },
        { q: 'faqReportPost', a: 'faqReportPostA' },
        { q: 'faqKycPrivate', a: 'faqKycPrivateA' }
      ]
    }
  ];
}

function renderHowItWorksPage() {
  const root = document.getElementById('how-it-works-root');
  if (!root) return;
  const base = getBasePath();
  const steps = getHowItWorksSteps();
  const from = new URLSearchParams(window.location.search || '').get('from');
  const helpHref = `${base}help.html${from ? `?from=${encodeURIComponent(from)}` : ''}`;

  root.innerHTML = `
    <div class="page-header">
      <h1 data-i18n="howItWorks">${t('howItWorks')}</h1>
      <p class="form-note" data-i18n="howItWorksSub">${t('howItWorksSub')}</p>
    </div>

    <div class="help-card">
      <h3 data-i18n="whatIsKhojTitle">${t('whatIsKhojTitle')}</h3>
      <p data-i18n="whatIsKhojBody">${t('whatIsKhojBody')}</p>
    </div>

    <div class="hiw-timeline" aria-label="${t('howItWorks')}">
      ${steps.map((step, i) => `
        <div class="hiw-step">
          <div class="hiw-step-num">${step.n}</div>
          <div class="hiw-step-body">
            <h3 data-i18n="${step.titleKey}">${t(step.titleKey)}</h3>
            <p data-i18n="${step.bodyKey}">${t(step.bodyKey)}</p>
          </div>
        </div>
        ${i < steps.length - 1 ? '<div class="hiw-arrow" aria-hidden="true">↓</div>' : ''}
      `).join('')}
    </div>

    <div class="help-card hiw-handover-card">
      <h3 data-i18n="hiwHandoverTitle">${t('hiwHandoverTitle')}</h3>
      <ol class="hiw-handover-flow">
        <li data-i18n="hiwHandover1">${t('hiwHandover1')}</li>
        <li data-i18n="hiwHandover2">${t('hiwHandover2')}</li>
        <li data-i18n="hiwHandover3">${t('hiwHandover3')}</li>
        <li data-i18n="hiwHandover4">${t('hiwHandover4')}</li>
        <li data-i18n="hiwHandover5">${t('hiwHandover5')}</li>
      </ol>
      <p class="form-note" data-i18n="hiwHandoverNote">${t('hiwHandoverNote')}</p>
    </div>

    <div class="help-card">
      <h3 data-i18n="whatShouldIDo">${t('whatShouldIDo')}</h3>
      <div class="help-action-grid">
        <a href="${base}post.html?type=lost" class="help-action-link" data-i18n="iLost">${t('iLost')}</a>
        <a href="${base}post.html?type=found" class="help-action-link" data-i18n="iFound">${t('iFound')}</a>
        <a href="${base}found.html" class="help-action-link" data-i18n="wantToClaim">${t('wantToClaim')}</a>
        <a href="${base}lost.html" class="help-action-link" data-i18n="haveInfoAboutItem">${t('haveInfoAboutItem')}</a>
        <a href="${base}help.html#report-problem" class="help-action-link" data-i18n="reportSuspicious">${t('reportSuspicious')}</a>
      </div>
    </div>

    <div class="help-footer-links">
      <a href="${helpHref}" class="btn btn-secondary btn-block" data-i18n="helpSupport">${t('helpSupport')}</a>
    </div>`;
}

function renderHelpSupportPage() {
  const root = document.getElementById('help-support-root');
  if (!root) return;
  const base = getBasePath();
  const topics = getHelpTopics();
  const from = new URLSearchParams(window.location.search || '').get('from');
  const fromQ = from ? `?from=${encodeURIComponent(from)}` : '';
  const howHref = `${base}how-it-works.html${fromQ}`;

  root.innerHTML = `
    <div class="page-header">
      <h1 data-i18n="helpSupport">${t('helpSupport')}</h1>
      <p class="form-note" data-i18n="helpSupportSub">${t('helpSupportSub')}</p>
    </div>

    <div class="help-nav-grid">
      <a href="#help-center" class="help-nav-card"><span data-i18n="helpCenter">${t('helpCenter')}</span><span class="chevron">›</span></a>
      <a href="#faq" class="help-nav-card"><span data-i18n="faqTitle">${t('faqTitle')}</span><span class="chevron">›</span></a>
      <a href="${howHref}" class="help-nav-card"><span data-i18n="howItWorks">${t('howItWorks')}</span><span class="chevron">›</span></a>
      <a href="#report-problem" class="help-nav-card"><span data-i18n="reportProblem">${t('reportProblem')}</span><span class="chevron">›</span></a>
      <a href="#safety" class="help-nav-card"><span data-i18n="safetyTitle">${t('safetyTitle')}</span><span class="chevron">›</span></a>
      <a href="#kyc-help" class="help-nav-card"><span data-i18n="kycHelpTitle">${t('kycHelpTitle')}</span><span class="chevron">›</span></a>
      <a href="#claim-help" class="help-nav-card"><span data-i18n="claimHelpTitle">${t('claimHelpTitle')}</span><span class="chevron">›</span></a>
      <a href="#contact-support" class="help-nav-card"><span data-i18n="contactSupport">${t('contactSupport')}</span><span class="chevron">›</span></a>
    </div>

    <section id="help-center" class="help-section">
      <div class="help-card">
        <h2 data-i18n="helpCenter">${t('helpCenter')}</h2>
        <p class="help-lead" data-i18n="howCanWeHelp">${t('howCanWeHelp')}</p>
        <input type="search" class="form-input" id="help-topic-search" data-i18n-placeholder="searchHelpTopics" placeholder="${t('searchHelpTopics')}" autocomplete="off">
        <div id="help-topic-results" class="help-topic-results"></div>
      </div>
    </section>

    <section id="faq" class="help-section">
      <h2 class="section-title" data-i18n="faqTitle">${t('faqTitle')}</h2>
      ${topics.map(cat => `
        <div class="help-card help-faq-group" data-help-cat="${cat.catKey}">
          <h3 data-i18n="${cat.catKey}">${t(cat.catKey)}</h3>
          <div class="faq-list">
            ${cat.items.map(item => `
              <details class="faq-item" data-help-q="${item.q}" data-help-a="${item.a}">
                <summary data-i18n="${item.q}">${t(item.q)}</summary>
                <p data-i18n="${item.a}">${t(item.a)}</p>
              </details>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </section>

    <section id="kyc-help" class="help-section">
      <div class="help-card">
        <h2 data-i18n="kycHelpTitle">${t('kycHelpTitle')}</h2>
        <p data-i18n="kycHelpIntro">${t('kycHelpIntro')}</p>
        <ul class="help-bullets">
          <li data-i18n="kycHelpWhy">${t('kycHelpWhy')}</li>
          <li data-i18n="kycHelpWhat">${t('kycHelpWhat')}</li>
          <li data-i18n="kycHelpDocs">${t('kycHelpDocs')}</li>
          <li data-i18n="kycHelpPrivacy">${t('kycHelpPrivacy')}</li>
          <li data-i18n="kycHelpAdmin">${t('kycHelpAdmin')}</li>
        </ul>
      </div>
    </section>

    <section id="claim-help" class="help-section">
      <div class="help-card">
        <h2 data-i18n="claimHelpTitle">${t('claimHelpTitle')}</h2>
        <p data-i18n="claimHelpIntro">${t('claimHelpIntro')}</p>
        <ol class="hiw-handover-flow">
          <li data-i18n="claimFlow1">${t('claimFlow1')}</li>
          <li data-i18n="claimFlow2">${t('claimFlow2')}</li>
          <li data-i18n="claimFlow3">${t('claimFlow3')}</li>
          <li data-i18n="claimFlow4">${t('claimFlow4')}</li>
          <li data-i18n="claimFlow5">${t('claimFlow5')}</li>
          <li data-i18n="claimFlow6">${t('claimFlow6')}</li>
          <li data-i18n="claimFlow7">${t('claimFlow7')}</li>
        </ol>
        <p class="form-note" data-i18n="claimHelpNote">${t('claimHelpNote')}</p>
      </div>
    </section>

    <section id="safety" class="help-section">
      <div class="help-card">
        <h2 data-i18n="safetyTitle">${t('safetyTitle')}</h2>
        <p data-i18n="safetyIntro">${t('safetyIntro')}</p>
        <ul class="help-bullets">
          <li data-i18n="safetyTip1">${t('safetyTip1')}</li>
          <li data-i18n="safetyTip2">${t('safetyTip2')}</li>
          <li data-i18n="safetyTip3">${t('safetyTip3')}</li>
          <li data-i18n="safetyTip4">${t('safetyTip4')}</li>
          <li data-i18n="safetyTip5">${t('safetyTip5')}</li>
          <li data-i18n="safetyTip6">${t('safetyTip6')}</li>
          <li data-i18n="safetyTip7">${t('safetyTip7')}</li>
        </ul>
      </div>
    </section>

    <section id="report-problem" class="help-section">
      <div class="help-card">
        <h2 data-i18n="reportProblem">${t('reportProblem')}</h2>
        <p class="form-note" data-i18n="reportProblemDemoNote">${t('reportProblemDemoNote')}</p>
        <form id="report-problem-form" class="help-form">
          <div class="form-group">
            <label for="report-type" data-i18n="problemType">${t('problemType')}</label>
            <select id="report-type" class="form-select" required>
              <option value="">${t('selectOption')}</option>
              <option value="technical">${t('problemTechnical')}</option>
              <option value="incorrect">${t('problemIncorrect')}</option>
              <option value="suspicious">${t('problemSuspicious')}</option>
              <option value="fraud">${t('problemFraud')}</option>
              <option value="account">${t('problemAccount')}</option>
              <option value="kyc">${t('problemKyc')}</option>
              <option value="other">${t('problemOther')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="report-desc" data-i18n="description">${t('description')}</label>
            <textarea id="report-desc" class="form-textarea" rows="4" data-i18n-placeholder="describeProblem" placeholder="${t('describeProblem')}" required></textarea>
          </div>
          <div class="form-group">
            <label data-i18n="optionalScreenshot">${t('optionalScreenshot')}</label>
            <input type="file" id="report-image" class="form-input" accept="image/*">
          </div>
          <button type="submit" class="btn btn-primary btn-block" data-i18n="submitReport">${t('submitReport')}</button>
          <p id="report-problem-success" class="help-success" hidden></p>
        </form>
      </div>
    </section>

    <section id="contact-support" class="help-section">
      <div class="help-card">
        <h2 data-i18n="contactSupport">${t('contactSupport')}</h2>
        <p class="form-note" data-i18n="contactPlaceholderNote">${t('contactPlaceholderNote')}</p>
        <div class="detail-row"><strong data-i18n="supportTeamName">${t('supportTeamName')}</strong></div>
        <div class="detail-row">📧 support@khojnepal.example</div>
        <div class="detail-row">📞 +977-XXXXXXXXXX</div>
        <div class="detail-row">📍 <span data-i18n="officeInfo">${t('officeInfo')}</span></div>
        <div class="help-action-grid mt-16">
          <a href="mailto:support@khojnepal.example" class="btn btn-secondary" data-i18n="contactSupport">${t('contactSupport')}</a>
          <a href="${base}office.html" class="btn btn-outline" data-i18n="viewOfficeDetails">${t('viewOfficeDetails')}</a>
        </div>
      </div>
    </section>`;

  initHelpCenterSearch();
  initReportProblemForm();
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
}

function initHelpCenterSearch() {
  const input = document.getElementById('help-topic-search');
  const box = document.getElementById('help-topic-results');
  if (!input || !box) return;

  const all = [];
  getHelpTopics().forEach(cat => {
    cat.items.forEach(item => all.push({ q: item.q, a: item.a, cat: cat.catKey }));
  });

  const render = (query) => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) {
      box.innerHTML = `<p class="form-note" data-i18n="helpSearchHint">${t('helpSearchHint')}</p>`;
      return;
    }
    const matches = all.filter(item =>
      t(item.q).toLowerCase().includes(q) ||
      t(item.a).toLowerCase().includes(q) ||
      t(item.cat).toLowerCase().includes(q)
    );
    if (!matches.length) {
      box.innerHTML = renderEmptyState('noSearchResults', 'tryAdjustFilters', '🔍');
      return;
    }
    box.innerHTML = matches.map(item => `
      <a href="#faq" class="help-search-result" data-faq="${item.q}">
        <strong data-i18n="${item.q}">${t(item.q)}</strong>
        <span data-i18n="${item.cat}">${t(item.cat)}</span>
      </a>`).join('');
    box.querySelectorAll('.help-search-result').forEach(link => {
      link.addEventListener('click', () => {
        const key = link.dataset.faq;
        const detail = document.querySelector(`details[data-help-q="${key}"]`);
        if (detail) detail.open = true;
      });
    });
  };

  render('');
  input.addEventListener('input', (e) => render(e.target.value));
}

function initReportProblemForm() {
  const form = document.getElementById('report-problem-form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = document.getElementById('report-problem-success');
    if (success) {
      success.hidden = false;
      success.innerHTML = `<strong data-i18n="reportDemoTitle">${t('reportDemoTitle')}</strong><br><span data-i18n="reportDemoBody">${t('reportDemoBody')}</span>`;
    }
    form.reset();
  });
}

function initHelpPages(page) {
  if (page === 'how-it-works') renderHowItWorksPage();
  if (page === 'help') renderHelpSupportPage();
}

window.addEventListener('khoj:langchange', () => {
  if (typeof currentPageName !== 'undefined' && currentPageName === 'how-it-works') renderHowItWorksPage();
  if (typeof currentPageName !== 'undefined' && currentPageName === 'help') renderHelpSupportPage();
});
