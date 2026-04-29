(function adminConsoleBootstrap() {
  const ADMIN_PIN = '1677';
  const ADMIN_SESSION_KEY = 'worklinkup_admin_session';
  const ADMIN_DATA_CACHE_KEY = 'worklinkup_admin_dashboard_cache_v1';
  const VIEW_TITLES = {
    dashboard: 'Dashboard',
    users: 'Users',
    providers: 'Providers',
    engagement: 'Engagement',
    messages: 'Messages',
    'admin-activity': 'Admin Activity'
  };
  const VIEW_ROUTES = {
    dashboard: 'dashboard.html',
    users: 'users.html',
    providers: 'providers.html',
    engagement: 'engagement.html',
    messages: 'messages.html',
    'admin-activity': 'admin-activity.html'
  };
  const ADMIN_MOBILE_NAV_ITEMS = [
    { view: 'dashboard', label: 'Home', icon: 'fa-solid fa-chart-line' },
    { view: 'users', label: 'Users', icon: 'fa-solid fa-user-group' },
    { view: 'providers', label: 'Providers', icon: 'fa-solid fa-id-badge' },
    { view: 'engagement', label: 'Stats', icon: 'fa-solid fa-chart-column' },
    { view: 'messages', label: 'Messages', icon: 'fa-solid fa-envelope' },
    { view: 'admin-activity', label: 'Activity', icon: 'fa-solid fa-user-shield' }
  ];

  const state = {
    view: 'dashboard',
    snapshot: null,
    currentAdmin: null,
    usersSearch: '',
    providersSearch: '',
    providersProvince: 'all',
    providersCategory: 'all',
    messagesSearch: '',
    messagesStatus: 'all',
    adminActivityDate: 'all',
    adminActivityAction: 'all',
    adminActivityTarget: '',
    adminActivityPage: 1,
    adminActivityPageSize: 50,
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

  function formatCompactNumber(value) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(Number(value || 0));
  }

  function formatPercent(value, maximumFractionDigits = 0) {
    return `${Number(value || 0).toFixed(maximumFractionDigits)}%`;
  }

  function clampPercent(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
  }

  function buildInitials(value) {
    const initials = String(value || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || 'WU';
  }

  let chartId = 0;

  function nextChartId(prefix = 'admin-chart') {
    chartId += 1;
    return `${prefix}-${chartId}`;
  }

  function getMonthlyBuckets(count = 7) {
    const buckets = [];
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

    for (let index = count - 1; index >= 0; index -= 1) {
      const bucketDate = new Date(firstDayThisMonth.getFullYear(), firstDayThisMonth.getMonth() - index, 1);
      buckets.push({
        key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`,
        label: formatter.format(bucketDate),
        startMs: bucketDate.getTime(),
        endMs: new Date(bucketDate.getFullYear(), bucketDate.getMonth() + 1, 1).getTime()
      });
    }

    return buckets;
  }

  function buildMonthlySeries(items, getTimestamp, buckets, getValue = () => 1) {
    const values = new Array(buckets.length).fill(0);
    const bucketIndexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));

    items.forEach((item) => {
      const timestamp = Number(getTimestamp(item) || 0);
      if (!timestamp) return;

      const date = new Date(timestamp);
      const bucketIndex = bucketIndexByKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (bucketIndex === undefined) return;

      values[bucketIndex] += Number(getValue(item) || 0);
    });

    return values;
  }

  function buildRangeSeries(items, getTimestamp, buckets, getValue = () => 1) {
    return buckets.map((bucket) => items.reduce((sum, item) => {
      const timestamp = Number(getTimestamp(item) || 0);
      if (!timestamp || timestamp < bucket.startMs || timestamp >= bucket.endMs) return sum;
      return sum + Number(getValue(item) || 0);
    }, 0));
  }

  function getSeriesTrend(values) {
    const current = Number(values[values.length - 1] || 0);
    const previous = Number(values[values.length - 2] || 0);
    let delta = 0;

    if (!previous && current) {
      delta = 100;
    } else if (previous) {
      delta = Math.round(((current - previous) / previous) * 100);
    }

    return {
      delta,
      state: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
      label: delta === 0 ? 'Flat vs last month' : `${delta > 0 ? '+' : ''}${delta}% vs last month`
    };
  }

  function getWeekBuckets(count = 7) {
    const buckets = [];
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let index = count - 1; index >= 0; index -= 1) {
      const bucketDate = new Date(now);
      bucketDate.setDate(now.getDate() - index);
      buckets.push({
        key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}-${bucketDate.getDate()}`,
        label: formatter.format(bucketDate),
        startMs: bucketDate.getTime(),
        endMs: bucketDate.getTime() + (24 * 60 * 60 * 1000)
      });
    }

    return buckets;
  }

  function uniqueSortedValues(values) {
    return Array.from(new Set(values
      .map((value) => String(value || '').trim())
      .filter(Boolean)))
      .sort((first, second) => first.localeCompare(second));
  }

  function syncSelectOptions(select, values, allLabel) {
    if (!select) return;

    const currentValue = select.value || 'all';
    const options = [
      `<option value="all">${escapeHtml(allLabel)}</option>`,
      ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    ];
    select.innerHTML = options.join('');
    select.value = values.includes(currentValue) || currentValue === 'all' ? currentValue : 'all';
  }

  function getPeriodStartMs(period) {
    const now = new Date();
    if (period === 'today') {
      now.setHours(0, 0, 0, 0);
      return now.getTime();
    }
    if (period === 'week') {
      now.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 6);
      return now.getTime();
    }
    if (period === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    return 0;
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
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function hasAdminSession() {
    return Boolean(readAdminSession()?.id);
  }

  function saveAdminSession(admin = state.currentAdmin) {
    if (!admin) return;

    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        id: admin.id || '',
        name: admin.name || '',
        email: admin.email || '',
        role: admin.role || 'Admin'
      }));
    } catch (error) {
      // Ignore storage failures and keep the page usable.
    }
  }

  function clearAdminSession() {
    state.currentAdmin = null;
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (error) {
      // Ignore storage failures and keep the page usable.
    }
  }

  function readAdminDataCache() {
    try {
      const raw = localStorage.getItem(ADMIN_DATA_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (!cache || typeof cache !== 'object' || !cache.snapshot) return null;
      return {
        snapshot: cache.snapshot,
        savedAtMs: Number(cache.savedAtMs || 0)
      };
    } catch (error) {
      return null;
    }
  }

  function writeAdminDataCache(snapshot) {
    if (!snapshot) return;
    try {
      localStorage.setItem(ADMIN_DATA_CACHE_KEY, JSON.stringify({
        savedAtMs: Date.now(),
        snapshot
      }));
    } catch (error) {
      // Storage can fail in private mode or if the admin dataset grows too large.
    }
  }

  function renderCachedAdminData() {
    const cache = readAdminDataCache();
    if (!cache?.snapshot) return false;

    state.snapshot = cache.snapshot;
    state.lastLoadedAtMs = cache.savedAtMs || Date.now();
    renderAll();
    setStatus(`Cached data • ${getRelativeTime(state.lastLoadedAtMs)}`, 'default');
    return true;
  }

  function setStatus(text, mode = 'default') {
    if (!refs.statusPill) return;
    refs.statusPill.textContent = text;
    refs.statusPill.dataset.state = mode;
  }

  function setCurrentAdmin(admin) {
    state.currentAdmin = admin || null;
    if (refs.sidebarCurrentAdmin) {
      refs.sidebarCurrentAdmin.textContent = state.currentAdmin?.name || 'Awaiting PIN';
    }
  }

  async function logAdminAction(type, title, description, subject = {}) {
    const currentAdmin = state.currentAdmin;
    if (!currentAdmin) return;

    const authHelper = await waitForAuthHelper().catch(() => null);
    if (!authHelper || typeof authHelper.recordAdminConsoleAction !== 'function') return;

    authHelper.recordAdminConsoleAction({
      type,
      admin: currentAdmin,
      title,
      description,
      subjectUid: subject.uid || '',
      subjectName: subject.name || '',
      sourceRef: subject.sourceRef || '',
      createdAtMs: Date.now()
    }).catch(() => {});
  }

  function setSidebarOpen(isOpen) {
    state.sidebarOpen = isOpen;
    if (!refs.sidebar || !refs.mobileBackdrop) return;
    refs.sidebar.classList.toggle('is-open', isOpen);
    refs.mobileBackdrop.hidden = !isOpen;
    refs.mobileBackdrop.classList.toggle('is-visible', isOpen);
    refs.menuToggle?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('admin-mobile-menu-open', isOpen);
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
    ensureAdminBottomNav();
    setView(state.view);
  }

  function getActivityGroup(type) {
    if (String(type).startsWith('admin_')) return 'admin';
    if (String(type).startsWith('user_') || type === 'profile_deleted') return 'user';
    if (String(type).startsWith('provider_post_')) return 'post';
    if (String(type).startsWith('provider_')) return 'provider';
    if (String(type).startsWith('message_')) return 'message';
    if (String(type).startsWith('cart_') || String(type).startsWith('wishlist_')) return 'cart';
    return 'other';
  }

  function getActivityBadge(type) {
    const group = getActivityGroup(type);
    if (group === 'admin') return 'Admin';
    if (group === 'user') return 'Registration';
    if (group === 'provider') return 'Provider';
    if (group === 'post') return 'Post';
    if (group === 'message') return 'Message';
    if (group === 'cart') return 'Commerce';
    return 'System';
  }

  function getInitialView() {
    const pageView = document.body?.dataset?.adminView || '';
    return VIEW_TITLES[pageView] ? pageView : 'dashboard';
  }

  function syncAdminBottomNav() {
    refs.bottomNav?.querySelectorAll('[data-admin-bottom-view]').forEach((link) => {
      const isActive = link.getAttribute('data-admin-bottom-view') === state.view;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function ensureAdminBottomNav() {
    if (refs.bottomNav || !refs.app) {
      syncAdminBottomNav();
      return;
    }

    const nav = document.createElement('div');
    nav.className = 'admin-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Admin mobile navigation');
    nav.innerHTML = ADMIN_MOBILE_NAV_ITEMS.map((item) => `
      <a href="./${VIEW_ROUTES[item.view]}" class="admin-bottom-nav-link" data-admin-bottom-view="${escapeHtml(item.view)}">
        <i class="${escapeHtml(item.icon)}" aria-hidden="true"></i>
        <span>${escapeHtml(item.label)}</span>
      </a>
    `).join('');

    nav.addEventListener('click', () => {
      setSidebarOpen(false);
    });

    refs.app.appendChild(nav);
    refs.bottomNav = nav;
    syncAdminBottomNav();
  }

  function setView(view) {
    state.view = VIEW_TITLES[view] ? view : 'dashboard';
    if (refs.viewTitle) refs.viewTitle.textContent = VIEW_TITLES[state.view];

    document.querySelectorAll('.admin-nav-link[data-admin-view]').forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('data-admin-view') === state.view);
    });

    document.querySelectorAll('[data-admin-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-admin-panel') !== state.view;
    });

    syncAdminBottomNav();
    setSidebarOpen(false);
  }

  function enhanceAdminResponsiveTables(root = document) {
    root.querySelectorAll?.('.admin-table').forEach((table) => {
      const headings = Array.from(table.querySelectorAll('thead th')).map((heading) => heading.textContent.trim());
      table.querySelectorAll('tbody tr').forEach((row) => {
        Array.from(row.children).forEach((cell, index) => {
          if (!(cell instanceof HTMLElement)) return;
          if (cell.hasAttribute('colspan')) {
            cell.dataset.label = '';
            return;
          }
          cell.dataset.label = headings[index] || '';
        });
      });
    });
  }

  function watchAdminResponsiveTables() {
    enhanceAdminResponsiveTables();
    document.querySelectorAll('.admin-table tbody').forEach((tbody) => {
      const observer = new MutationObserver(() => enhanceAdminResponsiveTables());
      observer.observe(tbody, { childList: true, subtree: true });
    });
  }

  function renderSidebarMetrics() {
    const metrics = state.snapshot?.metrics || {};
    if (refs.sidebarTotalUsers) refs.sidebarTotalUsers.textContent = `${formatNumber(metrics.totalUsers || 0)} users`;
    if (refs.sidebarLastSync) refs.sidebarLastSync.textContent = state.lastLoadedAtMs ? getRelativeTime(state.lastLoadedAtMs) : 'Waiting...';
  }

  function renderSparkline(values, strokeColor, fillColor) {
    const series = values.length ? values : [0, 0];
    const width = 220;
    const height = 76;
    const padding = 8;
    const minimum = Math.min(...series, 0);
    const maximum = Math.max(...series, 1);
    const range = maximum - minimum || 1;
    const points = series.map((value, index) => {
      const x = padding + ((width - (padding * 2)) * index) / Math.max(series.length - 1, 1);
      const y = height - padding - (((value - minimum) / range) * (height - (padding * 2)));
      return { x, y };
    });
    const gradientId = nextChartId('spark');
    const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
    const areaPoints = [
      `${points[0].x},${height - padding}`,
      ...points.map((point) => `${point.x},${point.y}`),
      `${points[points.length - 1].x},${height - padding}`
    ].join(' ');

    return `
      <svg class="admin-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${fillColor}" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <polygon fill="url(#${gradientId})" points="${areaPoints}"></polygon>
        <polyline fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}"></polyline>
      </svg>
    `;
  }

  function renderMetricCard({ label, value, detail, icon, trend, sparkline, modifier = '' }) {
    return `
      <article class="admin-kpi-card ${modifier}">
        <div class="admin-kpi-head">
          <span class="admin-kpi-icon"><i class="${icon}"></i></span>
          <strong class="admin-kpi-trend is-${trend.state}">${escapeHtml(trend.label)}</strong>
        </div>
        <div class="admin-kpi-copy">
          <p>${escapeHtml(label)}</p>
          <h3>${escapeHtml(value)}</h3>
          <small>${escapeHtml(detail)}</small>
        </div>
        ${sparkline}
      </article>
    `;
  }

  function renderGroupedBars(labels, firstValues, secondValues, firstLabel, secondLabel) {
    const maximum = Math.max(1, ...firstValues, ...secondValues);

    const columns = labels.map((label, index) => {
      const firstHeight = Math.max(8, Math.round((Number(firstValues[index] || 0) / maximum) * 100));
      const secondHeight = Math.max(8, Math.round((Number(secondValues[index] || 0) / maximum) * 100));
      return `
        <div class="admin-bars-column">
          <div class="admin-bars-stack">
            <span class="admin-bar admin-bar-primary" style="height:${firstHeight}%"></span>
            <span class="admin-bar admin-bar-secondary" style="height:${secondHeight}%"></span>
          </div>
          <small>${escapeHtml(label)}</small>
        </div>
      `;
    }).join('');

    return `
      <div class="admin-bars-chart">${columns}</div>
      <div class="admin-chart-legend">
        <span><i class="admin-legend-swatch is-primary"></i>${escapeHtml(firstLabel)}</span>
        <span><i class="admin-legend-swatch is-secondary"></i>${escapeHtml(secondLabel)}</span>
      </div>
    `;
  }

  function renderBubbleBars(labels, values, modifier = '') {
    const maximum = Math.max(1, ...values);
    return `
      <div class="admin-bubble-bars ${modifier}">
        ${labels.map((label, index) => {
          const value = Number(values[index] || 0);
          const height = Math.max(10, Math.round((value / maximum) * 100));
          return `
            <div class="admin-bubble-column">
              <span class="admin-bubble-value">${formatNumber(value)}</span>
              <div class="admin-bubble-track">
                <span class="admin-bubble-bar" style="height:${height}%"></span>
              </div>
              <small>${escapeHtml(label)}</small>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderDonut(segments, centerValue, centerLabel) {
    const total = segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0);
    let cursor = 0;
    const stops = segments
      .filter((segment) => Number(segment.value || 0) > 0)
      .map((segment) => {
        const start = (cursor / Math.max(total, 1)) * 100;
        cursor += Number(segment.value || 0);
        const end = (cursor / Math.max(total, 1)) * 100;
        return `${segment.color} ${start}% ${end}%`;
      });

    return `
      <div class="admin-donut-layout">
        <div class="admin-donut-ring" style="background:${stops.length ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(rgba(15,23,42,0.10) 0% 100%)'}">
          <div class="admin-donut-core">
            <strong>${escapeHtml(centerValue)}</strong>
            <span>${escapeHtml(centerLabel)}</span>
          </div>
        </div>
        <div class="admin-donut-legend">
          ${segments.map((segment) => `
            <div class="admin-donut-legend-row">
              <span><i style="background:${segment.color}"></i>${escapeHtml(segment.label)}</span>
              <strong>${formatCompactNumber(segment.value)}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderGauge(value, label, detail, accent) {
    const progress = clampPercent(value);
    return `
      <article class="admin-mini-gauge">
        <div class="admin-mini-gauge-ring" style="background:conic-gradient(${accent} 0% ${progress}%, rgba(15,23,42,0.10) ${progress}% 100%)">
          <div class="admin-mini-gauge-core">
            <strong>${Math.round(progress)}%</strong>
          </div>
        </div>
        <div class="admin-mini-gauge-copy">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(detail)}</strong>
        </div>
      </article>
    `;
  }

  function resolveAdminMediaSrc(value = '') {
    const source = String(value || '').trim();
    if (!source) return '';
    const unescaped = source
      .replace(/&amp;/g, '&')
      .replace(/&#x2F;/g, '/')
      .replace(/&#47;/g, '/');
    if (/^(data:|https?:|blob:|\/)/i.test(unescaped)) return unescaped;
    if (/^image\/[a-z0-9.+-]+;base64,/i.test(unescaped)) return `data:${unescaped}`;
    if (/^[A-Za-z0-9+/=\s]+$/.test(unescaped) && unescaped.replace(/\s+/g, '').length > 160) {
      return `data:image/jpeg;base64,${unescaped.replace(/\s+/g, '')}`;
    }
    const base = window.location.pathname.includes('/pages/admin/') ? '../../' : '';
    const normalizedPath = unescaped.replace(/^\.?\//, '').replace(/^(\.\.\/)+/, '');
    return `${base}${normalizedPath}`;
  }

  function renderAvatar(name, imageData) {
    const imageSrc = resolveAdminMediaSrc(imageData);
    if (imageSrc) {
      return `<span class="admin-avatar"><img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(name)}" /></span>`;
    }

    return `<span class="admin-avatar"><b>${escapeHtml(buildInitials(name))}</b></span>`;
  }

  function renderOverview() {
    const snapshot = state.snapshot;
    if (!snapshot || !refs.overviewDashboard) return;

    const { metrics } = snapshot;
    const users = Array.isArray(snapshot.users) ? snapshot.users : [];
    const providers = Array.isArray(snapshot.providers) ? snapshot.providers : [];
    const posts = Array.isArray(snapshot.posts) ? snapshot.posts : [];
    const messages = Array.isArray(snapshot.messages) ? snapshot.messages : [];
    const carts = Array.isArray(snapshot.carts) ? snapshot.carts : [];
    const activity = Array.isArray(snapshot.activity) ? snapshot.activity : [];
    const categoryBreakdown = Array.isArray(snapshot.categoryBreakdown) ? snapshot.categoryBreakdown : [];
    const provinceBreakdown = Array.isArray(snapshot.provinceBreakdown) ? snapshot.provinceBreakdown : [];
    const recentUsers = Array.isArray(snapshot.recentUsers) ? snapshot.recentUsers : [];
    const monthBuckets = getMonthlyBuckets(7);
    const labels = monthBuckets.map((bucket) => bucket.label);
    const userSeries = buildMonthlySeries(users, (user) => user.createdAtMs, monthBuckets);
    const providerSeries = buildMonthlySeries(providers, (provider) => provider.updatedAtMs || provider.createdAtMs, monthBuckets);
    const postSeries = buildMonthlySeries(posts, (post) => post.createdAtMs, monthBuckets);
    const messageSeries = buildMonthlySeries(messages, (message) => message.createdAtMs, monthBuckets);
    const commerceSeries = buildMonthlySeries(carts, (cartDoc) => cartDoc.updatedAtMs, monthBuckets, (cartDoc) => Number(cartDoc.cartCount || 0) + Number(cartDoc.wishlistCount || 0));
    const activeRate = users.length ? Math.round((Number(metrics.activeUsers7d || 0) / users.length) * 100) : 0;
    const readRate = messages.length ? Math.round(((messages.length - Number(metrics.unreadMessageCount || 0)) / messages.length) * 100) : 0;
    const topProviders = providers
      .slice()
      .sort((first, second) => (
        Number(second.completedJobs || 0) - Number(first.completedJobs || 0)
      ) || (
        Number(second.averageRating || 0) - Number(first.averageRating || 0)
      ))
      .slice(0, 5);
    const provinceMax = Math.max(1, ...provinceBreakdown.map((item) => Number(item.total || 0)));
    const categoryMax = Math.max(1, ...categoryBreakdown.map((item) => Number(item.total || 0)));
    const activityMix = [
      { label: 'Registrations', value: userSeries[userSeries.length - 1] || 0, color: '#22c55e' },
      { label: 'Profiles', value: providerSeries[providerSeries.length - 1] || 0, color: '#38bdf8' },
      { label: 'Posts', value: postSeries[postSeries.length - 1] || 0, color: '#da7756' },
      { label: 'Messages', value: messageSeries[messageSeries.length - 1] || 0, color: '#f43f5e' },
      { label: 'Commerce', value: commerceSeries[commerceSeries.length - 1] || 0, color: '#a855f7' }
    ];

    refs.overviewDashboard.innerHTML = `
      <article class="admin-hero-card">
        <div class="admin-hero-copy">
          <div class="admin-surface-kicker">Live WorkLinkUp pulse</div>
          <h3>Marketplace command centre</h3>
          <p>Registrations, provider growth, conversations, and service demand are being pulled directly from your Firebase data.</p>
          <div class="admin-hero-stats">
            <div class="admin-hero-stat">
              <span>Users onboarded</span>
              <strong>${formatCompactNumber(metrics.totalUsers)}</strong>
              <small>${formatNumber(metrics.newUsersToday)} joined today</small>
            </div>
            <div class="admin-hero-stat">
              <span>Provider completion</span>
              <strong>${formatPercent(metrics.providerCompletionRate)}</strong>
              <small>${formatNumber(metrics.providerCount)} profiles live</small>
            </div>
            <div class="admin-hero-stat">
              <span>Conversation load</span>
              <strong>${formatCompactNumber(metrics.conversationCount)}</strong>
              <small>${formatNumber(metrics.unreadMessageCount)} unread threads</small>
            </div>
          </div>
        </div>
        <div class="admin-hero-orbit">
          <div class="admin-hero-orbit-card">
            <span>Active users</span>
            <strong>${formatCompactNumber(metrics.activeUsers7d)}</strong>
            <small>${formatPercent(activeRate)} of total users were active this week</small>
          </div>
          <div class="admin-hero-orbit-card">
            <span>Market intent</span>
            <strong>${formatCompactNumber(metrics.totalCartUnits + metrics.totalWishlistSaves)}</strong>
            <small>${formatNumber(metrics.cartCount)} carts and ${formatNumber(metrics.totalWishlistSaves)} saves in play</small>
          </div>
        </div>
      </article>

      ${renderMetricCard({
        label: 'Total Users',
        value: formatCompactNumber(metrics.totalUsers),
        detail: `${formatNumber(metrics.newUsersToday)} joined today`,
        icon: 'fa-solid fa-users',
        trend: getSeriesTrend(userSeries),
        sparkline: renderSparkline(userSeries, '#3b82f6', 'rgba(59,130,246,0.28)')
      })}

      ${renderMetricCard({
        label: 'Provider Profiles',
        value: formatCompactNumber(metrics.providerCount),
        detail: `${formatPercent(metrics.providerCompletionRate)} completion rate`,
        icon: 'fa-solid fa-id-badge',
        trend: getSeriesTrend(providerSeries),
        sparkline: renderSparkline(providerSeries, '#22c55e', 'rgba(34,197,94,0.28)')
      })}

      ${renderMetricCard({
        label: 'Published Posts',
        value: formatCompactNumber(metrics.postCount),
        detail: `${formatNumber(metrics.postsToday)} posted today`,
        icon: 'fa-solid fa-image',
        trend: getSeriesTrend(postSeries),
        sparkline: renderSparkline(postSeries, '#da7756', 'rgba(218, 119, 86,0.28)')
      })}

      ${renderMetricCard({
        label: 'Messages Sent',
        value: formatCompactNumber(metrics.messageCount),
        detail: `${formatNumber(metrics.messagesToday)} sent today`,
        icon: 'fa-solid fa-paper-plane',
        trend: getSeriesTrend(messageSeries),
        sparkline: renderSparkline(messageSeries, '#ec4899', 'rgba(236,72,153,0.28)')
      })}

      <section class="admin-visual-card admin-chart-card">
        <div class="admin-card-head">
          <div>
            <span>Growth and engagement</span>
            <h3>Monthly signups vs messages</h3>
          </div>
          <strong>${labels[labels.length - 1]}</strong>
        </div>
        ${renderGroupedBars(labels, userSeries, messageSeries, 'Signups', 'Messages')}
        <div class="admin-mini-gauges">
          ${renderGauge(metrics.providerCompletionRate, 'Provider Completion', `${formatNumber(metrics.providerCount)} profiles live`, '#22c55e')}
          ${renderGauge(readRate, 'Message Read Rate', `${formatNumber(metrics.unreadMessageCount)} unread messages`, '#da7756')}
        </div>
      </section>

      <section class="admin-visual-card admin-mix-card">
        <div class="admin-card-head">
          <div>
            <span>This month</span>
            <h3>Operational mix</h3>
          </div>
          <strong>${formatCompactNumber(activityMix.reduce((sum, item) => sum + Number(item.value || 0), 0))}</strong>
        </div>
        ${renderDonut(activityMix, labels[labels.length - 1], 'live activity')}
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Provider supply</span>
            <h3>Top service categories</h3>
          </div>
        </div>
        <div class="admin-rank-list">
          ${categoryBreakdown.length ? categoryBreakdown.slice(0, 5).map((item) => `
            <div class="admin-rank-row">
              <div class="admin-rank-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <small>${formatNumber(item.total)} providers</small>
              </div>
              <div class="admin-rank-meter">
                <span style="width:${Math.max(10, Math.round((Number(item.total || 0) / categoryMax) * 100))}%"></span>
              </div>
            </div>
          `).join('') : '<div class="admin-list-empty">No provider categories found yet.</div>'}
        </div>
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>User spread</span>
            <h3>Province momentum</h3>
          </div>
        </div>
        <div class="admin-rank-list">
          ${provinceBreakdown.length ? provinceBreakdown.slice(0, 5).map((item) => `
            <div class="admin-rank-row">
              <div class="admin-rank-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <small>${formatNumber(item.total)} users</small>
              </div>
              <div class="admin-rank-meter is-cyan">
                <span style="width:${Math.max(10, Math.round((Number(item.total || 0) / provinceMax) * 100))}%"></span>
              </div>
            </div>
          `).join('') : '<div class="admin-list-empty">No user location data found yet.</div>'}
        </div>
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Provider leaderboard</span>
            <h3>Top providers</h3>
          </div>
        </div>
        <div class="admin-stacked-list">
          ${topProviders.length ? topProviders.map((provider) => `
            <div class="admin-person-row">
              <div class="admin-person-main">
                ${renderAvatar(provider.displayName || provider.providerPublicId || 'Provider', provider.profileImageData)}
                <div class="admin-person-copy">
                  <strong>${escapeHtml(provider.displayName || provider.providerPublicId || 'WorkLinkUp Provider')}</strong>
                  <small>${escapeHtml(provider.primaryCategory || provider.specialty || provider.province || 'Provider profile')}</small>
                </div>
              </div>
              <div class="admin-person-meta">
                <strong>${formatNumber(provider.completedJobs || 0)}</strong>
                <small>${Number(provider.averageRating || 0).toFixed(1)} rating</small>
              </div>
            </div>
          `).join('') : '<div class="admin-list-empty">No provider profiles found yet.</div>'}
        </div>
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Newest accounts</span>
            <h3>Recent signups</h3>
          </div>
        </div>
        <div class="admin-stacked-list">
          ${recentUsers.length ? recentUsers.slice(0, 5).map((user) => `
            <div class="admin-person-row">
              <div class="admin-person-main">
                ${renderAvatar(user.name || 'WorkLinkUp User')}
                <div class="admin-person-copy">
                  <strong>${escapeHtml(user.name || 'WorkLinkUp User')}</strong>
                  <small>${escapeHtml(user.email || user.phone || user.uid || 'No contact')}</small>
                </div>
              </div>
              <div class="admin-person-meta">
                <strong>${getRelativeTime(user.createdAtMs)}</strong>
                <small>${escapeHtml(user.providerProvince || user.city || 'Unknown area')}</small>
              </div>
            </div>
          `).join('') : '<div class="admin-list-empty">No user registrations found yet.</div>'}
        </div>
      </section>

      <section class="admin-visual-card admin-activity-card">
        <div class="admin-card-head">
          <div>
            <span>Live feed</span>
            <h3>Recent activity</h3>
          </div>
        </div>
        <div class="admin-stacked-list">
          ${activity.length ? activity.slice(0, 6).map((eventItem) => `
            <div class="admin-activity-feed-row">
              <div class="admin-activity-badge is-${escapeHtml(getActivityGroup(eventItem.type))}">${escapeHtml(getActivityBadge(eventItem.type))}</div>
              <div class="admin-activity-copy">
                <strong>${escapeHtml(eventItem.title || 'Activity')}</strong>
                <p>${escapeHtml(eventItem.description || 'WorkLinkUp event')}</p>
              </div>
              <small>${getRelativeTime(eventItem.createdAtMs)}</small>
            </div>
          `).join('') : '<div class="admin-list-empty">No activity has been recorded yet.</div>'}
        </div>
      </section>
    `;
  }

  function renderUsers() {
    if (!refs.usersBody || !refs.usersTotal) return;
    const users = Array.isArray(state.snapshot?.users) ? state.snapshot.users : [];
    const members = users
      .filter((user) => !user.providerProfileComplete)
      .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));
    const query = state.usersSearch.trim().toLowerCase();

    const filtered = members.filter((user) => {
      if (!query) return true;

      const haystack = [
        user.name,
        user.email,
        user.phone,
        user.providerProvince,
        user.city,
        user.uid
      ].join(' ').toLowerCase();

      return haystack.includes(query);
    });

    refs.usersTotal.textContent = `${formatNumber(filtered.length)} members`;

    if (!filtered.length) {
      refs.usersBody.innerHTML = '<tr><td colspan="6" class="admin-empty-cell">No users match the current filters.</td></tr>';
      return;
    }

    refs.usersBody.innerHTML = filtered.map((user) => `
      <tr>
        <td>
          <div class="admin-table-user">
            <strong>${escapeHtml(user.name || 'WorkLinkUp User')}</strong>
            <span>${escapeHtml(user.uid || 'No ID')}</span>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(user.email || 'No email')}</span>
            <small>${escapeHtml(user.phone || 'No phone')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(user.providerProvince || 'Not set')}</span>
            <small>${escapeHtml(user.city || 'No city')}</small>
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
        <td>
          <div class="admin-table-stack">
            <span>${formatNumber(Number(user.cartCount || 0))} carts</span>
            <small>${formatNumber(Number(user.wishlistCount || 0))} wishlist saves</small>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderProviders() {
    if (!refs.providersBody || !refs.providersTotal || !refs.providersOverview) return;
    const providers = Array.isArray(state.snapshot?.providers) ? state.snapshot.providers.slice() : [];
    const query = state.providersSearch.trim().toLowerCase();
    const provinceOptions = uniqueSortedValues(providers.map((provider) => provider.province));
    const categoryOptions = uniqueSortedValues(providers.map((provider) => provider.primaryCategory));

    syncSelectOptions(refs.providersProvince, provinceOptions, 'All provinces');
    syncSelectOptions(refs.providersCategory, categoryOptions, 'All categories');

    const filtered = providers
      .filter((provider) => {
        const matchesProvince = state.providersProvince === 'all'
          || String(provider.province || '').trim() === state.providersProvince;
        const matchesCategory = state.providersCategory === 'all'
          || String(provider.primaryCategory || '').trim() === state.providersCategory;
        if (!matchesProvince || !matchesCategory) return false;

        if (!query) return true;

        const haystack = [
          provider.displayName,
          provider.email,
          provider.providerPublicId,
          provider.province,
          provider.city,
          provider.primaryCategory,
          provider.specialty,
          provider.uid
        ].join(' ').toLowerCase();

        return haystack.includes(query);
      })
      .sort((first, second) => Number(second.updatedAtMs || second.createdAtMs || 0) - Number(first.updatedAtMs || first.createdAtMs || 0));

    const totalCompletedJobs = filtered.reduce((sum, provider) => sum + Number(provider.completedJobs || 0), 0);
    const averageRating = filtered.length
      ? (filtered.reduce((sum, provider) => sum + Number(provider.averageRating || 0), 0) / filtered.length).toFixed(1)
      : '0.0';
    const topProviders = filtered
      .slice()
      .sort((first, second) => (
        Number(second.completedJobs || 0) - Number(first.completedJobs || 0)
      ) || (
        Number(second.averageRating || 0) - Number(first.averageRating || 0)
      ))
      .slice(0, 5);
    const supplyByProvince = uniqueSortedValues(filtered.map((provider) => provider.province))
      .map((province) => ({
        label: province,
        total: filtered.filter((provider) => String(provider.province || '').trim() === province).length
      }))
      .sort((first, second) => second.total - first.total)
      .slice(0, 5);
    const provinceMax = Math.max(1, ...supplyByProvince.map((item) => Number(item.total || 0)));

    refs.providersTotal.textContent = `${formatNumber(filtered.length)} providers`;
    refs.providersOverview.innerHTML = `
      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Filtered provider pool</span>
            <h3>Provider snapshot</h3>
          </div>
        </div>
        <div class="admin-stats-row">
          <div class="admin-mini-stat">
            <span>Total providers</span>
            <strong>${formatNumber(filtered.length)}</strong>
          </div>
          <div class="admin-mini-stat">
            <span>Completed jobs</span>
            <strong>${formatNumber(totalCompletedJobs)}</strong>
          </div>
          <div class="admin-mini-stat">
            <span>Average rating</span>
            <strong>${averageRating}</strong>
          </div>
        </div>
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Top providers</span>
            <h3>Best performing providers</h3>
          </div>
        </div>
        <div class="admin-stacked-list">
          ${topProviders.length ? topProviders.map((provider) => `
            <div class="admin-person-row">
              <div class="admin-person-main">
                ${renderAvatar(provider.displayName || provider.providerPublicId || 'Provider', provider.profileImageData)}
                <div class="admin-person-copy">
                  <strong>${escapeHtml(provider.displayName || provider.providerPublicId || 'Provider')}</strong>
                  <small>${escapeHtml(provider.primaryCategory || provider.specialty || provider.province || 'Provider')}</small>
                </div>
              </div>
              <div class="admin-person-meta">
                <strong>${formatNumber(provider.completedJobs || 0)}</strong>
                <small>${Number(provider.averageRating || 0).toFixed(1)} rating</small>
              </div>
            </div>
          `).join('') : '<div class="admin-list-empty">No providers match the current filters.</div>'}
        </div>
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Province filter response</span>
            <h3>Provider spread</h3>
          </div>
        </div>
        <div class="admin-rank-list">
          ${supplyByProvince.length ? supplyByProvince.map((item) => `
            <div class="admin-rank-row">
              <div class="admin-rank-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <small>${formatNumber(item.total)} providers</small>
              </div>
              <div class="admin-rank-meter is-cyan">
                <span style="width:${Math.max(10, Math.round((Number(item.total || 0) / provinceMax) * 100))}%"></span>
              </div>
            </div>
          `).join('') : '<div class="admin-list-empty">No province data is available for this provider filter.</div>'}
        </div>
      </section>
    `;

    if (!filtered.length) {
      refs.providersBody.innerHTML = '<tr><td colspan="7" class="admin-empty-cell">No providers match the current filters.</td></tr>';
      return;
    }

    refs.providersBody.innerHTML = filtered.map((provider) => `
      <tr>
        <td>
          <div class="admin-table-user">
            <strong>${escapeHtml(provider.displayName || provider.providerPublicId || 'Provider')}</strong>
            <span>${escapeHtml(provider.providerPublicId || provider.uid || 'No public ID')}</span>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(provider.email || 'No email')}</span>
            <small>${escapeHtml(provider.whatsappNumber || 'No phone')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(provider.province || 'Not set')}</span>
            <small>${escapeHtml(provider.city || 'No city')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(provider.primaryCategory || 'Not set')}</span>
            <small>${escapeHtml(provider.specialty || 'No specialty')}</small>
          </div>
        </td>
        <td>${formatNumber(provider.completedJobs || 0)}</td>
        <td>${Number(provider.averageRating || 0).toFixed(1)}</td>
        <td>
          <div class="admin-table-stack">
            <span>${formatDateTime(provider.updatedAtMs || provider.createdAtMs)}</span>
            <small>${getRelativeTime(provider.updatedAtMs || provider.createdAtMs)}</small>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderEngagement() {
    if (!refs.engagementDashboard || !refs.engagementTotal) return;
    const users = Array.isArray(state.snapshot?.users) ? state.snapshot.users : [];
    const providers = Array.isArray(state.snapshot?.providers) ? state.snapshot.providers : [];
    const messages = Array.isArray(state.snapshot?.messages) ? state.snapshot.messages : [];
    const posts = Array.isArray(state.snapshot?.posts) ? state.snapshot.posts : [];
    const activity = Array.isArray(state.snapshot?.activity) ? state.snapshot.activity : [];
    const monthBuckets = getMonthlyBuckets(6);
    const weekBuckets = getWeekBuckets(7);
    const memberMonthly = buildMonthlySeries(users.filter((user) => !user.providerProfileComplete), (user) => user.createdAtMs, monthBuckets);
    const providerMonthly = buildMonthlySeries(users.filter((user) => user.providerProfileComplete), (user) => user.createdAtMs, monthBuckets);
    const weeklyEngagement = buildRangeSeries(activity, (eventItem) => eventItem.createdAtMs, weekBuckets);
    const weeklyMessages = buildRangeSeries(messages, (message) => message.createdAtMs, weekBuckets);
    const weeklyTouchpoints = weeklyEngagement.reduce((sum, value) => sum + Number(value || 0), 0);
    const averageDailyTouchpoints = weekBuckets.length ? Math.round(weeklyTouchpoints / weekBuckets.length) : 0;
    const responseLoad = posts.length + messages.length + providers.length;

    refs.engagementTotal.textContent = `${formatNumber(weeklyTouchpoints)} weekly touchpoints`;
    refs.engagementDashboard.innerHTML = `
      <section class="admin-visual-card admin-chart-card">
        <div class="admin-card-head">
          <div>
            <span>Monthly user comparison</span>
            <h3>Members vs providers by month</h3>
          </div>
        </div>
        ${renderGroupedBars(monthBuckets.map((bucket) => bucket.label), memberMonthly, providerMonthly, 'Members', 'Providers')}
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Weekly engagement</span>
            <h3>User touchpoints by day</h3>
          </div>
        </div>
        ${renderBubbleBars(weekBuckets.map((bucket) => bucket.label), weeklyEngagement, 'is-cyan')}
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Weekly messages</span>
            <h3>Conversation activity</h3>
          </div>
        </div>
        ${renderBubbleBars(weekBuckets.map((bucket) => bucket.label), weeklyMessages, 'is-pink')}
      </section>

      <section class="admin-visual-card">
        <div class="admin-card-head">
          <div>
            <span>Engagement summary</span>
            <h3>Interaction signals</h3>
          </div>
        </div>
        <div class="admin-stats-row">
          <div class="admin-mini-stat">
            <span>Active users 7d</span>
            <strong>${formatNumber(state.snapshot?.metrics?.activeUsers7d || 0)}</strong>
          </div>
          <div class="admin-mini-stat">
            <span>Avg daily touchpoints</span>
            <strong>${formatNumber(averageDailyTouchpoints)}</strong>
          </div>
          <div class="admin-mini-stat">
            <span>Response load</span>
            <strong>${formatNumber(responseLoad)}</strong>
          </div>
        </div>
      </section>
    `;
  }

  function renderMessages() {
    if (!refs.messagesBody || !refs.messagesTotal) return;
    const messages = Array.isArray(state.snapshot?.messages) ? state.snapshot.messages.slice() : [];
    const query = state.messagesSearch.trim().toLowerCase();

    const filtered = messages
      .filter((message) => {
        const matchesStatus = state.messagesStatus === 'all'
          || (state.messagesStatus === 'unread' && !Number(message.viewedAtMs || 0))
          || (state.messagesStatus === 'read' && Number(message.viewedAtMs || 0));
        if (!matchesStatus) return false;

        if (!query) return true;

        const haystack = [
          message.fromName,
          message.toName,
          message.text,
          message.conversationId,
          message.fromUid,
          message.toUid
        ].join(' ').toLowerCase();

        return haystack.includes(query);
      })
      .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));

    refs.messagesTotal.textContent = `${formatNumber(filtered.length)} messages`;

    if (!filtered.length) {
      refs.messagesBody.innerHTML = '<tr><td colspan="6" class="admin-empty-cell">No messages match the current filters.</td></tr>';
      return;
    }

    refs.messagesBody.innerHTML = filtered.map((message) => `
      <tr>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(message.fromName || 'Unknown sender')}</span>
            <small>${escapeHtml(message.fromUid || 'No sender ID')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(message.toName || 'Unknown recipient')}</span>
            <small>${escapeHtml(message.toUid || 'No recipient ID')}</small>
          </div>
        </td>
        <td>${escapeHtml(message.conversationId || '—')}</td>
        <td>${escapeHtml(message.text || 'No text')}</td>
        <td><span class="admin-badge ${Number(message.viewedAtMs || 0) ? 'is-read' : 'is-unread'}">${Number(message.viewedAtMs || 0) ? 'Read' : 'Unread'}</span></td>
        <td>
          <div class="admin-table-stack">
            <span>${formatDateTime(message.createdAtMs)}</span>
            <small>${getRelativeTime(message.createdAtMs)}</small>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function setCreateAdminMessage(text, mode = 'default') {
    if (!refs.createAdminMessage) return;
    refs.createAdminMessage.hidden = !text;
    refs.createAdminMessage.textContent = text || '';
    refs.createAdminMessage.dataset.state = mode;
  }

  function setAdminModal(name, isOpen) {
    const modal = name === 'admins' ? refs.adminsModal : refs.createAdminModal;
    if (!modal) return;
    modal.hidden = !isOpen;
    document.body.classList.toggle('admin-mobile-menu-open', Boolean(isOpen || state.sidebarOpen));
    if (isOpen && name === 'create') {
      window.setTimeout(() => refs.createAdminName?.focus(), 60);
    }
  }

  function renderAdminActivity() {
    if (!refs.adminActivityBody || !refs.adminActivityTotal || !refs.adminsList) return;
    const admins = Array.isArray(state.snapshot?.admins) ? state.snapshot.admins : [];
    const adminAudit = Array.isArray(state.snapshot?.adminAudit) ? state.snapshot.adminAudit.slice() : [];
    const actionOptions = uniqueSortedValues(adminAudit.map((entry) => getActivityBadge(entry.type)));
    if (refs.adminActivityAction) syncSelectOptions(refs.adminActivityAction, actionOptions, 'All actions');

    refs.adminsList.innerHTML = admins.length
      ? admins.map((admin) => `
        <div class="admin-person-row">
          <div class="admin-person-main">
            ${renderAvatar(admin.name || 'Admin')}
            <div class="admin-person-copy">
              <strong>${escapeHtml(admin.name || 'Admin')}</strong>
              <small>${escapeHtml(admin.email || admin.role || 'WorkLinkUp admin')}</small>
            </div>
          </div>
          <div class="admin-person-meta">
            <strong>${escapeHtml(admin.role || 'Admin')}</strong>
            <small>${admin.id === state.currentAdmin?.id ? 'Current session' : 'Active'}</small>
          </div>
        </div>
      `).join('')
      : '<div class="admin-list-empty">No admin accounts are available yet.</div>';

    const periodStartMs = getPeriodStartMs(state.adminActivityDate);
    const targetQuery = state.adminActivityTarget.trim().toLowerCase();
    const filtered = adminAudit
      .filter((entry) => {
        if (periodStartMs && Number(entry.createdAtMs || 0) < periodStartMs) return false;
        if (state.adminActivityAction !== 'all' && getActivityBadge(entry.type) !== state.adminActivityAction) return false;
        if (!targetQuery) return true;
        return [
          entry.subjectName,
          entry.subjectUid,
          entry.sourceRef,
          entry.actorName,
          entry.title,
          entry.description
        ].join(' ').toLowerCase().includes(targetQuery);
      })
      .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));

    refs.adminActivityTotal.textContent = `${formatNumber(filtered.length)} actions`;

    const totalPages = Math.max(1, Math.ceil(filtered.length / state.adminActivityPageSize));
    state.adminActivityPage = Math.min(Math.max(1, state.adminActivityPage), totalPages);
    const startIndex = (state.adminActivityPage - 1) * state.adminActivityPageSize;
    const pageItems = filtered.slice(startIndex, startIndex + state.adminActivityPageSize);
    const showingStart = filtered.length ? startIndex + 1 : 0;
    const showingEnd = filtered.length ? startIndex + pageItems.length : 0;

    if (refs.adminActivityPageSummary) {
      refs.adminActivityPageSummary.textContent = `Showing ${formatNumber(showingStart)} to ${formatNumber(showingEnd)}, page ${formatNumber(state.adminActivityPage)} of ${formatNumber(totalPages)} pages`;
    }
    if (refs.adminActivityPrev) refs.adminActivityPrev.disabled = state.adminActivityPage <= 1;
    if (refs.adminActivityNext) refs.adminActivityNext.disabled = state.adminActivityPage >= totalPages;

    if (!filtered.length) {
      refs.adminActivityBody.innerHTML = '<tr><td colspan="5" class="admin-empty-cell">No admin actions have been recorded yet.</td></tr>';
      return;
    }

    refs.adminActivityBody.innerHTML = pageItems.map((entry) => `
      <tr>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(entry.actorName || 'Admin')}</span>
            <small>${escapeHtml(entry.actorEmail || entry.actorUid || 'No identifier')}</small>
          </div>
        </td>
        <td>
          <div class="admin-table-stack">
            <span>${escapeHtml(entry.title || 'Admin action')}</span>
            <small>${escapeHtml(getActivityBadge(entry.type))}</small>
          </div>
        </td>
        <td>${escapeHtml(entry.subjectName || '—')}</td>
        <td>${escapeHtml(entry.description || 'Admin action')}</td>
        <td>
          <div class="admin-table-stack">
            <span>${formatDateTime(entry.createdAtMs)}</span>
            <small>${getRelativeTime(entry.createdAtMs)}</small>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderAll() {
    renderSidebarMetrics();
    renderOverview();
    renderUsers();
    renderProviders();
    renderEngagement();
    renderMessages();
    renderAdminActivity();
  }

  function logCurrentView() {
    if (!state.currentAdmin) return;

    logAdminAction(
      'admin_view_changed',
      'Admin view opened',
      `${state.currentAdmin.name || 'An admin'} opened the ${VIEW_TITLES[state.view] || 'Dashboard'} page.`,
      {
        uid: state.view,
        name: VIEW_TITLES[state.view] || 'Dashboard',
        sourceRef: `admin-view/${VIEW_ROUTES[state.view] || state.view}`
      }
    );
  }

  function setLoadingTables(copy) {
    if (refs.usersBody) refs.usersBody.innerHTML = `<tr><td colspan="6" class="admin-empty-cell">${escapeHtml(copy)}</td></tr>`;
    if (refs.providersBody) refs.providersBody.innerHTML = `<tr><td colspan="7" class="admin-empty-cell">${escapeHtml(copy)}</td></tr>`;
    if (refs.messagesBody) refs.messagesBody.innerHTML = `<tr><td colspan="6" class="admin-empty-cell">${escapeHtml(copy)}</td></tr>`;
    if (refs.adminActivityBody) refs.adminActivityBody.innerHTML = `<tr><td colspan="5" class="admin-empty-cell">${escapeHtml(copy)}</td></tr>`;
  }

  async function loadDashboardData(options = {}) {
    if (state.loading) return;
    const hasRenderedSnapshot = Boolean(state.snapshot);
    const showPlaceholders = options.showPlaceholders ?? !hasRenderedSnapshot;
    state.loading = true;
    setStatus(hasRenderedSnapshot ? 'Updating cached data...' : 'Refreshing live data...', 'loading');
    if (showPlaceholders) setLoadingTables('Loading live admin data...');
    if (refs.refreshButton) refs.refreshButton.disabled = true;

    try {
      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.getAdminDashboardData !== 'function') {
        throw new Error('Admin data helper did not load.');
      }

      state.snapshot = await authHelper.getAdminDashboardData();
      state.lastLoadedAtMs = Date.now();
      writeAdminDataCache(state.snapshot);
      setStatus('Live Firebase data', 'success');
      renderAll();
    } catch (error) {
      const message = error?.message || 'The admin console could not reach the live data source.';
      if (state.snapshot) {
        setStatus(`Offline cache • ${getRelativeTime(state.lastLoadedAtMs)}`, 'default');
      } else {
        setStatus('Could not load admin data', 'error');
        setLoadingTables(message);
        if (refs.overviewDashboard) {
          refs.overviewDashboard.innerHTML = `
            <section class="admin-visual-card admin-overview-placeholder">
              <div class="admin-empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>${escapeHtml(message)}</p>
              </div>
            </section>
          `;
        }
        if (refs.providersOverview) {
          refs.providersOverview.innerHTML = `
            <section class="admin-visual-card admin-overview-placeholder">
              <div class="admin-empty-state">
                <i class="fa-solid fa-user-tie"></i>
                <p>${escapeHtml(message)}</p>
              </div>
            </section>
          `;
        }
        if (refs.engagementDashboard) {
          refs.engagementDashboard.innerHTML = `
            <section class="admin-visual-card admin-overview-placeholder">
              <div class="admin-empty-state">
                <i class="fa-solid fa-chart-column"></i>
                <p>${escapeHtml(message)}</p>
              </div>
            </section>
          `;
        }
      }
    } finally {
      state.loading = false;
      if (refs.refreshButton) refs.refreshButton.disabled = false;
    }
  }

  function bindEvents() {
    refs.gateForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const pin = String(refs.pinInput?.value || '').trim();
      const authHelper = await waitForAuthHelper().catch(() => null);
      let matchedAdmin = null;

      if (authHelper && typeof authHelper.resolveAdminByPin === 'function') {
        matchedAdmin = await authHelper.resolveAdminByPin(pin).catch(() => null);
      }

      if (!matchedAdmin && pin === ADMIN_PIN) {
        matchedAdmin = {
          id: 'primary-admin',
          name: 'Admin 1',
          email: '',
          role: 'Owner',
          pin: ADMIN_PIN
        };
      }

      if (!matchedAdmin) {
        if (refs.gateError) refs.gateError.hidden = false;
        refs.pinInput?.focus();
        refs.pinInput?.select();
        return;
      }

      if (refs.gateError) refs.gateError.hidden = true;
      setCurrentAdmin(matchedAdmin);
      saveAdminSession();
      showApp();
      renderCachedAdminData();
      loadDashboardData({ showPlaceholders: !state.snapshot });
      logCurrentView();
      logAdminAction('admin_login', 'Admin signed in', `${matchedAdmin.name} unlocked the admin console.`, {
        uid: matchedAdmin.id,
        name: matchedAdmin.name,
        sourceRef: `admins/${matchedAdmin.id}`
      });
    });

    document.querySelectorAll('.admin-nav-link[data-admin-view]').forEach((link) => {
      link.addEventListener('click', () => {
        const nextView = link.getAttribute('data-admin-view') || 'dashboard';
        setView(nextView);
      });
    });

    refs.usersSearch?.addEventListener('input', (event) => {
      state.usersSearch = String(event.target.value || '');
      renderUsers();
    });

    refs.providersSearch?.addEventListener('input', (event) => {
      state.providersSearch = String(event.target.value || '');
      renderProviders();
    });

    refs.providersProvince?.addEventListener('change', (event) => {
      state.providersProvince = String(event.target.value || 'all');
      renderProviders();
    });

    refs.providersCategory?.addEventListener('change', (event) => {
      state.providersCategory = String(event.target.value || 'all');
      renderProviders();
    });

    refs.messagesSearch?.addEventListener('input', (event) => {
      state.messagesSearch = String(event.target.value || '');
      renderMessages();
    });

    refs.messagesStatus?.addEventListener('change', (event) => {
      state.messagesStatus = String(event.target.value || 'all');
      renderMessages();
    });

    refs.adminActivityDate?.addEventListener('change', (event) => {
      state.adminActivityDate = String(event.target.value || 'all');
      state.adminActivityPage = 1;
      renderAdminActivity();
    });

    refs.adminActivityAction?.addEventListener('change', (event) => {
      state.adminActivityAction = String(event.target.value || 'all');
      state.adminActivityPage = 1;
      renderAdminActivity();
    });

    refs.adminActivityTarget?.addEventListener('input', (event) => {
      state.adminActivityTarget = String(event.target.value || '');
      state.adminActivityPage = 1;
      renderAdminActivity();
    });

    refs.adminActivityPrev?.addEventListener('click', () => {
      state.adminActivityPage = Math.max(1, state.adminActivityPage - 1);
      renderAdminActivity();
    });

    refs.adminActivityNext?.addEventListener('click', () => {
      state.adminActivityPage += 1;
      renderAdminActivity();
    });

    refs.createAdminOpen?.addEventListener('click', () => {
      setCreateAdminMessage('');
      setAdminModal('create', true);
    });

    refs.adminsOpen?.addEventListener('click', () => {
      setAdminModal('admins', true);
    });

    document.querySelectorAll('[data-admin-modal-close]').forEach((button) => {
      button.addEventListener('click', () => {
        setAdminModal(button.getAttribute('data-admin-modal-close'), false);
      });
    });

    refs.refreshButton?.addEventListener('click', () => {
      loadDashboardData();
      logAdminAction('admin_refresh', 'Dashboard refreshed', `${state.currentAdmin?.name || 'An admin'} refreshed admin data.`, {
        uid: state.currentAdmin?.id || '',
        name: state.currentAdmin?.name || 'Admin',
        sourceRef: 'admin-console/refresh'
      });
    });

    refs.lockButton?.addEventListener('click', () => {
      logAdminAction('admin_locked_console', 'Admin locked console', `${state.currentAdmin?.name || 'An admin'} locked the admin console.`, {
        uid: state.currentAdmin?.id || '',
        name: state.currentAdmin?.name || 'Admin',
        sourceRef: 'admin-console/lock'
      });
      clearAdminSession();
      setCurrentAdmin(null);
      showGate();
    });

    refs.createAdminForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const authHelper = await waitForAuthHelper().catch(() => null);
      if (!authHelper || typeof authHelper.createAdmin !== 'function') {
        setCreateAdminMessage('Admin tools are not available right now.', 'error');
        return;
      }

      const payload = {
        name: String(refs.createAdminName?.value || '').trim(),
        email: String(refs.createAdminEmail?.value || '').trim(),
        pin: String(refs.createAdminPin?.value || '').trim()
      };

      try {
        const createdAdmin = await authHelper.createAdmin(payload, state.currentAdmin);
        refs.createAdminForm.reset();
        setCreateAdminMessage(`Created admin access for ${createdAdmin.name}.`, 'success');
        await loadDashboardData();
      } catch (error) {
        setCreateAdminMessage(error?.message || 'Could not create the admin account.', 'error');
      }
    });

    refs.menuToggle?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setSidebarOpen(!state.sidebarOpen);
    });

    refs.sidebar?.querySelectorAll('.admin-nav-link').forEach((link) => {
      link.addEventListener('click', () => setSidebarOpen(false));
    });

    refs.mobileBackdrop?.addEventListener('click', () => {
      setSidebarOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setAdminModal('create', false);
        setAdminModal('admins', false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) {
        setSidebarOpen(false);
      }
    });

    window.addEventListener('online', () => {
      if (hasAdminSession()) loadDashboardData({ showPlaceholders: false });
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
    refs.overviewDashboard = document.getElementById('admin-overview-dashboard');
    refs.sidebarCurrentAdmin = document.getElementById('admin-sidebar-current-admin');
    refs.sidebarTotalUsers = document.getElementById('admin-sidebar-total-users');
    refs.sidebarLastSync = document.getElementById('admin-sidebar-last-sync');
    refs.usersSearch = document.getElementById('admin-users-search');
    refs.usersTotal = document.getElementById('admin-users-total');
    refs.usersBody = document.getElementById('admin-users-body');
    refs.providersSearch = document.getElementById('admin-providers-search');
    refs.providersProvince = document.getElementById('admin-providers-province');
    refs.providersCategory = document.getElementById('admin-providers-category');
    refs.providersTotal = document.getElementById('admin-providers-total');
    refs.providersOverview = document.getElementById('admin-providers-overview');
    refs.providersBody = document.getElementById('admin-providers-body');
    refs.engagementDashboard = document.getElementById('admin-engagement-dashboard');
    refs.engagementTotal = document.getElementById('admin-engagement-total');
    refs.messagesSearch = document.getElementById('admin-messages-search');
    refs.messagesStatus = document.getElementById('admin-messages-status');
    refs.messagesTotal = document.getElementById('admin-messages-total');
    refs.messagesBody = document.getElementById('admin-messages-body');
    refs.createAdminForm = document.getElementById('admin-create-form');
    refs.createAdminName = document.getElementById('admin-create-name');
    refs.createAdminEmail = document.getElementById('admin-create-email');
    refs.createAdminPin = document.getElementById('admin-create-pin');
    refs.createAdminMessage = document.getElementById('admin-create-message');
    refs.adminsList = document.getElementById('admin-admins-list');
    refs.createAdminOpen = document.getElementById('admin-create-open');
    refs.adminsOpen = document.getElementById('admin-admins-open');
    refs.createAdminModal = document.getElementById('admin-create-modal');
    refs.adminsModal = document.getElementById('admin-admins-modal');
    refs.adminActivityDate = document.getElementById('admin-activity-date-filter');
    refs.adminActivityAction = document.getElementById('admin-activity-action-filter');
    refs.adminActivityTarget = document.getElementById('admin-activity-target-filter');
    refs.adminActivityPageSummary = document.getElementById('admin-activity-page-summary');
    refs.adminActivityPrev = document.getElementById('admin-activity-prev');
    refs.adminActivityNext = document.getElementById('admin-activity-next');
    refs.adminActivityTotal = document.getElementById('admin-admin-activity-total');
    refs.adminActivityBody = document.getElementById('admin-admin-activity-body');

    refs.menuToggle?.setAttribute('aria-controls', 'admin-sidebar');
    refs.menuToggle?.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('DOMContentLoaded', () => {
    state.view = getInitialView();
    cacheElements();
    bindEvents();
    watchAdminResponsiveTables();
    setView(state.view);

    const savedSession = readAdminSession();
    if (savedSession?.id) {
      setCurrentAdmin(savedSession);
      showApp();
      renderCachedAdminData();
      loadDashboardData({ showPlaceholders: !state.snapshot });
      logCurrentView();
      return;
    }

    showGate();
  });
}());
