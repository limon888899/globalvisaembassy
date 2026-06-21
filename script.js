// আপনার সুপাবেজ কনফিগারেশন
const SUPABASE_URL = 'https://nrwnsedtvkxkdhmvmoga.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_v9Bas6zol_BdqscwLftaZA_OYnWIuJ3';

// সুপাবেজ ক্লায়েন্ট তৈরি করা
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =========================================================
   Global Visa Tracker - Combined Script
   (Login + Dashboard + Status Check)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
    console.log("Supabase initialized successfully!");
    
    // এখানে আপনার আগের বাকি কোডগুলো (যেমন নেভিগেশন বা ফর্ম হ্যান্ডলিং) থাকবে
});

  /* =========================================================
     SECTION A — Simple page navigation (no real routing/URLs)
     Any element with data-nav="page-id" swaps the visible section.
     ========================================================= */
  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(function (page) {
      page.classList.toggle('is-active', page.id === pageId);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const target = el.getAttribute('data-nav');

      // If this is a country card heading to the status page,
      // pass along which country was selected.
      if (target === 'page-status' && el.dataset.country) {
        applyCountryToStatusPage(el.dataset.country, el.dataset.countryLabel);
      }

      showPage(target);
    });
  });

  /* =========================================================
     SECTION B — Login form (Page 1)
     ========================================================= */
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const userShell = document.getElementById('userShell');
  const passShell = document.getElementById('passShell');
  const toggleEye = document.getElementById('toggleEye');
  const eyeOpen = document.getElementById('eyeOpen');
  const eyeClosed = document.getElementById('eyeClosed');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const formError = document.getElementById('formError');

  function bindFocusEffect(input, shell) {
    if (!input || !shell) return;
    input.addEventListener('focus', () => {
      shell.classList.add('is-focused');
      shell.classList.remove('has-error');
    });
    input.addEventListener('blur', () => {
      shell.classList.remove('is-focused');
    });
  }
  bindFocusEffect(usernameInput, userShell);
  bindFocusEffect(passwordInput, passShell);

  if (toggleEye) {
    toggleEye.addEventListener('click', function () {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      eyeOpen.style.display = isPassword ? 'none' : 'block';
      eyeClosed.style.display = isPassword ? 'block' : 'none';
    });
  }

  function showLoginError(message) {
    formError.textContent = message;
    formError.classList.add('show');
    userShell.classList.add('has-error');
    passShell.classList.add('has-error');
  }
  function clearLoginError() {
    formError.classList.remove('show');
    formError.textContent = '';
    userShell.classList.remove('has-error');
    passShell.classList.remove('has-error');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearLoginError();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showLoginError('Please enter both username/email and password.');
        return;
      }

      loginBtn.disabled = true;
      btnSpinner.classList.add('show');
      loginBtn.querySelector('.btn-text').textContent = 'Signing in...';

      // ---------------------------------------------------------------
      // NOTE: Front-end template only. Replace with a real API call:
      //
      // fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // })
      //   .then(res => res.json())
      //   .then(data => { if (data.success) showPage('page-dashboard'); });
      //
      // Never store or check real passwords in client-side JavaScript.
      // ---------------------------------------------------------------

      setTimeout(() => {
        loginBtn.disabled = false;
        btnSpinner.classList.remove('show');
        loginBtn.querySelector('.btn-text').textContent = 'Sign In';

        console.log('Login attempt:', { username });
        // Demo only — goes straight to the dashboard.
        // Wire this to your real backend response before going live.
        showPage('page-dashboard');
      }, 1000);
    });
  }

  /* =========================================================
     SECTION C — Status check page (Page 3)
     ========================================================= */
  const countryNames = {
    australia: 'Australia',
    usa: 'United States',
    canada: 'Canada',
    italy: 'Italy',
    uk: 'United Kingdom',
    germany: 'Germany'
  };

  function applyCountryToStatusPage(countryKey, fallbackLabel) {
    const countryTag = document.getElementById('countryTag');
    if (!countryTag) return;
    countryTag.textContent = countryNames[countryKey] || fallbackLabel || 'Country';
  }

  // ===========================================================
  // IMPORTANT — read before wiring this up:
  //
  // The status page must NEVER accept a passport number, phone
  // number, or any other identifier typed in by the visitor to
  // look up someone else's case. Status shown here must always
  // come from the currently authenticated session only.
  //
  // Example of how to wire this to a real backend:
  //
  //   fetch('/api/applications/me', { credentials: 'include' })
  //     .then(res => {
  //       if (!res.ok) throw new Error('Not authenticated or no record found');
  //       return res.json();
  //     })
  //     .then(renderApplication)
  //     .catch(showEmptyState);
  //
  // Your backend route /api/applications/me should:
  //   1. Verify the logged-in session/JWT.
  //   2. Look up the application row owned by that exact user ID.
  //   3. Return only that user's own data — never accept a
  //      passport/phone parameter from the client to fetch
  //      someone else's record.
  // ===========================================================

  function renderApplication(data) {
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('applicationSummary').style.display = 'block';
    document.getElementById('timeline').style.display = 'flex';

    document.getElementById('applicantName').textContent = data.applicantName || '—';
    document.getElementById('applicationRef').textContent = data.referenceNumber || '—';
    document.getElementById('visaCategory').textContent = data.visaCategory || '—';
    document.getElementById('submittedDate').textContent = data.submittedDate || '—';

    const badge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    statusText.textContent = data.status || 'Unknown';

    badge.classList.remove('approved', 'rejected');
    if (data.status === 'Approved') badge.classList.add('approved');
    if (data.status === 'Rejected') badge.classList.add('rejected');
  }

  function showEmptyState() {
    const summary = document.getElementById('applicationSummary');
    const timeline = document.getElementById('timeline');
    const empty = document.getElementById('emptyState');
    if (!summary || !timeline || !empty) return;
    summary.style.display = 'none';
    timeline.style.display = 'none';
    empty.style.display = 'block';
  }

  // No backend connected in this template — default to empty state.
  // Once you wire up the fetch() call above, remove this line.
  showEmptyState();

});
