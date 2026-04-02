(function adminConsoleBootstrap() {
  const ADMIN_PIN = '1677';
  const ADMIN_SESSION_KEY = 'worklinkup_admin_session';
  const VIEW_TITLES = {
    overview: 'Overview',
    users: 'Users',
    activity: 'Activity'
  };

  const state = {
    view: 'overview',
    snapshot: null,
    usersSearch: '',
    usersStatus: 'all',
    activitySearch: '',
    activityType: 'all',
    loading: false,
    sidebarOpen: false,
    lastLoadedAtMs: 0
  };

  const refs = {};

  function waitForAuthHelper(timeoutMs = 15000) {
    return new Promise((resolve) => {
      if (window.softGigglesAuth) {
        resolve(window.softGigglesAuth);
        return;
      }

      const startedAt = Date.now();
      const intervalId = window.setInterval(() => {
        if (window.softGigglesAuth || Date.now() - startedAt >= timeoutMs) {
          window.clearInterval(intervalId);
          resolve(window.softGigglesAuth || null);
        }
      }, 120);
    });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(Number(value || 0));
  }

  function formatDateTime(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatShortDate(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getRelativeTime(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return 'Never';

    const deltaMs = Date.now() - timestamp;
    const minutes = Math.round(deltaMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatShortDate(timestamp);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readAdminSession() {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function hasAdminSession() {
    const session = readAdminSession();
    return Boolean(session?.unlockedAt);
  }

  function saveAdminSession() {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        unlockedAt: Date.now()
      }));
    } catch (error) {
      // Ignore storage failures and keep the page usable.
    }
  }

  function clearAdminSession() {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (error) {
      // Ignore storage failures and keep the page usable.
    }
  }

  function setStatus(text, mode = 'default') {
    if (!refs.statusPill) return;
    refs.statusPill.textContent = text;
    refs.statusPill.dataset.state = mode;
  }

  function setSidebarOpen(isOpen) {
    state.sidebarOpen = isOpen;
    if (!refs.sidebar || !refs.mobileBackdrop) return;
    refs.sidebar.classList.toggle('is-open', isOpen);
    refs.mobileBackdrop.hidden = !isOpen;
  }

  function showGate() {
    if (refs.gate) refs.gate.hidden = false;
    if (refs.app) refs.app.hidden = true;
    setSidebarOpen(false);
    if (refs.gateError) refs.gateError.hidden = true;
    if (refs.pinInput) {
      refs.pinInput.value = '';
      window.setTimeout(() => refs.pinInput?.focus(), 60);
    }
  }

  function showApp() {
    if (refs.gate) refs.gate.hidden = true;
    if (refs.app) refs.app.hidden = false;
    setView(state.view);
  }

  function getActivityGroup(type) {
    if (String(type).startsWith('user_') || type === 'profile_deleted') return 'user';
    if (String(type).startsWith('provider_post_')) return 'post';
    if (String(type).startsWith('provider_')) return 'provider';
    if (String(type).startsWith('message_')) return 'message';
    if (String(type).startsWith('cart_') || String(type).startsWith('wishlist_')) return 'cart';
    return 'other';
  }

  function getActivityBadge(type) {
    const group = getActivityGroup(type);
    if (group === 'user') return 'Registration';
    if (group === 'provider') return 'Provider';
    if (group === 'post') return 'Post';
    if (group === 'message') return 'Message';
    if (group === 'cart') return 'Commerce';
    return 'System';
  }

  function setView(view) {
    state.view = VIEW_TITLES[view] ? view : 'overview';
    if (refs.viewTitle) refs.viewTitle.textContent = VIEW_TITLES[state.view];

    document.querySelectorAll('[data-admin-view]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-admin-view') === state.view);
    });

    document.querySelectorAll('[data-admin-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-admin-panel') !== state.view;
    });

    setSidebarOpen(false);
  }

  function renderBreakdown(host, items, emptyCopy) {
    if (!host) return;
    if (!items.length) {
      host.innerHTML = `<div class="admin-list-empty">${escapeHtml(emptyCopy)}</div>`;
      return;
    }

    host.innerHTML = items.slice(0, 6).map((item) => `
      <div class="admin-list-row">
        <span>${escapeHtml(item.label)}</span>
        <strong>${formatNumber(item.total)}</strong>
      </div>
    `).join('');
  }

  function renderRecentUsers(users) {
    if (!refs.recentUsers) return;
    if (!users.length) {
      refs.recentUsers.innerHTML = '<div class="admin-list-empty">No user registrations found yet.</div>';
      return;
    }

    refs.recentUsers.innerHTML = users.map((user) => `
      <div class="admin-list-row admin-list-row-stack">
        <div>
          <strong>${escapeHtml(user.name || 'WorkLinkUp User')}</strong>
          <span>${escapeHtml(user.email || user.phone || user.uid || 'No contact')}</span>
        </div>
        <small>${formatDateTime(user.createdAtMs)}</small>
      </div>
    `).join('');
  }

  function renderActivityPreview(activity) {
    if (!refs.activityPreview) return;
    if (!activity.length) {
      refs.activityPreview.innerHTML = '<div class="admin-list-empty">No activity has been recorded yet.</div>';
      return;
    }

    refs.activityPreview.innerHTML = activity.slice(0, 6).map((eventItem) => `
      <div class="admin-activity-row">
        <div>
          <strong>${escapeHtml(eventItem.title || 'Activity')}</strong>
          <p>${escapeHtml(eventItem.description || 'WorkLinkUp event')}</p>
        </div>
        <small>${getRelativeTime(eventItem.createdAtMs)}</small>
      </div>
    `).join('');
  }

  function renderOverview() {
    const snapshot = state.snapshot;
    if (!snapshot) return;

    const { metrics } = snapshot;
    if (refs.metricTotalUsers) refs.metricTotalUsers.textContent = formatNumber(metrics.totalUsers);
    if (refs.metricNewUsers) refs.metricNewUsers.textContent = `${formatNumber(metrics.newUsersToday)} new today`;
    if (refs.metricProviderCount) refs.metricProviderCount.textContent = formatNumber(metrics.providerCount);
    if (refs.metricProviderRate) refs.metricProviderRate.textContent = `${formatNumber(metrics.providerCompletionRate)}% completion`;
    if (refs.metricActiveUsers) refs.metricActiveUsers.textContent = formatNumber(metrics.activeUsers7d);
    if (refs.metricActiveCarts) refs.metricActiveCarts.textContent = `${formatNumber(metrics.cartCount)} carts in progress`;
    if (refs.metricPostCount) refs.metricPostCount.textContent = formatNumber(metrics.postCount);
    if (refs.metricPostsToday) refs.metricPostsToday.textContent = `${formatNumber(metrics.postsToday)} today`;
    if (refs.metricMessageCount) refs.metricMessageCount.textContent = formatNumber(metrics.messageCount);
    if (refs.metricMessagesToday) refs.metricMessagesToday.textContent = `${formatNumber(metrics.messagesToday)} today`;
    if (refs.metricConversationCount) refs.metricConversationCount.textContent = formatNumber(metrics.conversationCount);
    if (refs.metricUnreadMessages) refs.metricUnreadMessages.textContent = `${formatNumber(metrics.unreadMessageCount)} unread`;
    if (refs.metricCartUnits) refs.metricCartUnits.textContent = formatNumber(metrics.totalCartUnits);
    if (refs.metricWishlistSaves) refs.metricWishlistSaves.textContent = `${formatNumber(metrics.totalWishlistSaves)} wishlist saves`;
    if (refs.sidebarTotalUsers) refs.sidebarTotalUsers.textContent = `${formatNumber(metrics.totalUsers)} users`;
    if (refs.sidebarLastSync) refs.sidebarLastSync.textContent = getRelativeTime(state.lastLoadedAtMs);

    renderBreakdown(refs.categoryBreakdown, snapshot.categoryBreakdown, 'No provider categories found yet.');
    renderBreakdown(refs.provinceBreakdown, snapshot.provinceBreakdown, 'No user location data found yet.');
    renderRecentUsers(snapshot.recentUsers || []);
    renderActivityPreview(snapshot.activity || []);
  }

  function renderUsers() {
    if (!refs.usersBody || !refs.usersTotal) return;
    const users = Array.isArray(state.snapshot?.users) ? state.snapshot.users : [];
    const query = state.usersSearch.trim().toLowerCase();

    const filtered = users.filter((user) => {
      const matchesStatus = state.usersStatus === 'all'
        || (state.usersStatus === 'providers' && user.providerProfileComplete)
        || (state.usersStatus === 'members' && !user.providerProfileComplete);
      if (!matchesStatus) return false;

      if (!query) return true;

      const haystack = [
        user.name,
        user.email,
        user.phone,
        user.providerPublicId,
        user.providerProvince,
        user.city,
        user.primaryCategory,
        user.specialty,
        user.uid
      ].join(' ').toLowerCase();

      return haystack.includes(query);
    });

    refs.usersTotal.textContent = `${formatNumber(filtered.length)} users`;

    if (!filtered.length) {
      refs.usersBody.innerHTML = '<tr><td colspan="7" class="admin-empty-cell">No users match the current filters.</td></tr>';
      return;
    }

    refs.usersBody.innerHTML = filtered.map((user) => `
      <tr>
        <td>
          <div class="admin-table-user">
            <strong>${escapeHtml(user.name || 'WorkLinkUp User')}</strong>
            <span>${escapeHtml(user.providerPublicId || user.uid || 'No ID')}</span>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(user.email || 'No email')}</span>
            <small>${escapeHtml(user.phone || 'No phone')}</small>
          </div>
        </td>
        <td><span class="admin-badge ${user.providerProfileComplete ? 'is-provider' : 'is-member'}">${user.providerProfileComplete ? 'Provider' : 'Member'}</span></td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(user.providerProvince || 'Not set')}</span>
            <small>${escapeHtml(user.city || 'No city')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(user.primaryCategory || 'Not set')}</span>
            <small>${escapeHtml(user.specialty || 'No specialty')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${formatDateTime(user.createdAtMs)}</span>
            <small>${getRelativeTime(user.createdAtMs)}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${formatDateTime(user.lastSeenAtMs || user.updatedAtMs)}</span>
            <small>${getRelativeTime(user.lastSeenAtMs || user.updatedAtMs)}</small>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderActivity() {
    if (!refs.activityBody || !refs.activityTotal) return;
    const activity = Array.isArray(state.snapshot?.activity) ? state.snapshot.activity : [];
    const query = state.activitySearch.trim().toLowerCase();

    const filtered = activity.filter((eventItem) => {
      const group = getActivityGroup(eventItem.type);
      if (state.activityType !== 'all' && group !== state.activityType) return false;

      if (!query) return true;

      const haystack = [
        eventItem.title,
        eventItem.description,
        eventItem.actorName,
        eventItem.actorEmail,
        eventItem.subjectName,
        eventItem.type
      ].join(' ').toLowerCase();

      return haystack.includes(query);
    });

    refs.activityTotal.textContent = `${formatNumber(filtered.length)} events`;

    if (!filtered.length) {
      refs.activityBody.innerHTML = '<tr><td colspan="5" class="admin-empty-cell">No activity matches the current filters.</td></tr>';
      return;
    }

    refs.activityBody.innerHTML = filtered.map((eventItem) => `
      <tr>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(eventItem.title || 'Activity')}</span>
            <small>${escapeHtml(getActivityBadge(eventItem.type))}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(eventItem.actorName || 'Unknown user')}</span>
            <small>${escapeHtml(eventItem.actorEmail || eventItem.actorUid || 'No identifier')}</small>
          </div>
        </td>
        <td>${escapeHtml(eventItem.subjectName || '—')}</td>
        <td>${escapeHtml(eventItem.description || 'WorkLinkUp event')}</td>
        <td>
          <div class="admin-table-stack">
            <span>${formatDateTime(eventItem.createdAtMs)}</span>
            <small>${getRelativeTime(eventItem.createdAtMs)}</small>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderAll() {
    renderOverview();
    renderUsers();
    renderActivity();
  }

  function setLoadingTables(copy) {
    if (refs.usersBody) refs.usersBody.innerHTML = `<tr><td colspan="7" class="admin-empty-cell">${escapeHtml(copy)}</td></tr>`;
    if (refs.activityBody) refs.activityBody.innerHTML = `<tr><td colspan="5" class="admin-empty-cell">${escapeHtml(copy)}</td></tr>`;
  }

  async function loadDashboardData() {
    if (state.loading) return;
    state.loading = true;
    setStatus('Refreshing live data...', 'loading');
    setLoadingTables('Loading live admin data...');
    if (refs.refreshButton) refs.refreshButton.disabled = true;

    try {
      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.getAdminDashboardData !== 'function') {
        throw new Error('Admin data helper did not load.');
      }

      state.snapshot = await authHelper.getAdminDashboardData();
      state.lastLoadedAtMs = Date.now();
      setStatus('Live Firebase data', 'success');
      renderAll();
    } catch (error) {
      setStatus('Could not load admin data', 'error');
      const message = error?.message || 'The admin console could not reach the live data source.';
      setLoadingTables(message);
      if (refs.categoryBreakdown) refs.categoryBreakdown.innerHTML = `<div class="admin-list-empty">${escapeHtml(message)}</div>`;
      if (refs.provinceBreakdown) refs.provinceBreakdown.innerHTML = `<div class="admin-list-empty">${escapeHtml(message)}</div>`;
      if (refs.recentUsers) refs.recentUsers.innerHTML = `<div class="admin-list-empty">${escapeHtml(message)}</div>`;
      if (refs.activityPreview) refs.activityPreview.innerHTML = `<div class="admin-list-empty">${escapeHtml(message)}</div>`;
    } finally {
      state.loading = false;
      if (refs.refreshButton) refs.refreshButton.disabled = false;
    }
  }

  function bindEvents() {
    refs.gateForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const pin = String(refs.pinInput?.value || '').trim();
      const isValid = pin === ADMIN_PIN;

      if (!isValid) {
        if (refs.gateError) refs.gateError.hidden = false;
        refs.pinInput?.focus();
        refs.pinInput?.select();
        return;
      }

      if (refs.gateError) refs.gateError.hidden = true;
      saveAdminSession();
      showApp();
      loadDashboardData();
    });

    document.querySelectorAll('[data-admin-view]').forEach((button) => {
      button.addEventListener('click', () => {
        setView(button.getAttribute('data-admin-view') || 'overview');
      });
    });

    refs.usersSearch?.addEventListener('input', (event) => {
      state.usersSearch = String(event.target.value || '');
      renderUsers();
    });

    refs.usersStatus?.addEventListener('change', (event) => {
      state.usersStatus = String(event.target.value || 'all');
      renderUsers();
    });

    refs.activitySearch?.addEventListener('input', (event) => {
      state.activitySearch = String(event.target.value || '');
      renderActivity();
    });

    refs.activityType?.addEventListener('change', (event) => {
      state.activityType = String(event.target.value || 'all');
      renderActivity();
    });

    refs.refreshButton?.addEventListener('click', () => {
      loadDashboardData();
    });

    refs.lockButton?.addEventListener('click', () => {
      clearAdminSession();
      showGate();
    });

    refs.menuToggle?.addEventListener('click', () => {
      setSidebarOpen(!state.sidebarOpen);
    });

    refs.mobileBackdrop?.addEventListener('click', () => {
      setSidebarOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) {
        setSidebarOpen(false);
      }
    });
  }

  function cacheElements() {
    refs.gate = document.getElementById('admin-gate');
    refs.gateForm = document.getElementById('admin-gate-form');
    refs.gateError = document.getElementById('admin-gate-error');
    refs.pinInput = document.getElementById('admin-pin');
    refs.app = document.getElementById('admin-app');
    refs.sidebar = document.getElementById('admin-sidebar');
    refs.mobileBackdrop = document.getElementById('admin-mobile-backdrop');
    refs.menuToggle = document.getElementById('admin-menu-toggle');
    refs.lockButton = document.getElementById('admin-lock-btn');
    refs.refreshButton = document.getElementById('admin-refresh-btn');
    refs.viewTitle = document.getElementById('admin-view-title');
    refs.statusPill = document.getElementById('admin-status-pill');
    refs.sidebarTotalUsers = document.getElementById('admin-sidebar-total-users');
    refs.sidebarLastSync = document.getElementById('admin-sidebar-last-sync');
    refs.metricTotalUsers = document.getElementById('admin-metric-total-users');
    refs.metricNewUsers = document.getElementById('admin-metric-new-users');
    refs.metricProviderCount = document.getElementById('admin-metric-provider-count');
    refs.metricProviderRate = document.getElementById('admin-metric-provider-rate');
    refs.metricActiveUsers = document.getElementById('admin-metric-active-users');
    refs.metricActiveCarts = document.getElementById('admin-metric-active-carts');
    refs.metricPostCount = document.getElementById('admin-metric-post-count');
    refs.metricPostsToday = document.getElementById('admin-metric-posts-today');
    refs.metricMessageCount = document.getElementById('admin-metric-message-count');
    refs.metricMessagesToday = document.getElementById('admin-metric-messages-today');
    refs.metricConversationCount = document.getElementById('admin-metric-conversation-count');
    refs.metricUnreadMessages = document.getElementById('admin-metric-unread-messages');
    refs.metricCartUnits = document.getElementById('admin-metric-cart-units');
    refs.metricWishlistSaves = document.getElementById('admin-metric-wishlist-saves');
    refs.categoryBreakdown = document.getElementById('admin-category-breakdown');
    refs.provinceBreakdown = document.getElementById('admin-province-breakdown');
    refs.recentUsers = document.getElementById('admin-recent-users');
    refs.activityPreview = document.getElementById('admin-activity-preview');
    refs.usersSearch = document.getElementById('admin-users-search');
    refs.usersStatus = document.getElementById('admin-users-status');
    refs.usersTotal = document.getElementById('admin-users-total');
    refs.usersBody = document.getElementById('admin-users-body');
    refs.activitySearch = document.getElementById('admin-activity-search');
    refs.activityType = document.getElementById('admin-activity-type');
    refs.activityTotal = document.getElementById('admin-activity-total');
    refs.activityBody = document.getElementById('admin-activity-body');
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindEvents();
    setView(state.view);

    if (hasAdminSession()) {
      showApp();
      loadDashboardData();
      return;
    }

    showGate();
  });
}());
