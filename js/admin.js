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
    return false;
  }

  function saveAdminSession() {
    clearAdminSession();
  }

  function clearAdminSession() {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
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
        <div class="admin-donut-ring" style="background:${stops.length ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(rgba(255,255,255,0.08) 0% 100%)'}">
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
        <div class="admin-mini-gauge-ring" style="background:conic-gradient(${accent} 0% ${progress}%, rgba(255,255,255,0.08) ${progress}% 100%)">
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

  function renderAvatar(name, imageData) {
    if (imageData) {
      return `<span class="admin-avatar"><img src="${escapeHtml(imageData)}" alt="${escapeHtml(name)}" /></span>`;
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
      { label: 'Posts', value: postSeries[postSeries.length - 1] || 0, color: '#f59e0b' },
      { label: 'Messages', value: messageSeries[messageSeries.length - 1] || 0, color: '#f43f5e' },
      { label: 'Commerce', value: commerceSeries[commerceSeries.length - 1] || 0, color: '#a855f7' }
    ];

    if (refs.sidebarTotalUsers) refs.sidebarTotalUsers.textContent = `${formatNumber(metrics.totalUsers)} users`;
    if (refs.sidebarLastSync) refs.sidebarLastSync.textContent = getRelativeTime(state.lastLoadedAtMs);

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
        sparkline: renderSparkline(postSeries, '#f59e0b', 'rgba(245,158,11,0.28)')
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
          ${renderGauge(readRate, 'Message Read Rate', `${formatNumber(metrics.unreadMessageCount)} unread messages`, '#f59e0b')}
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
    refs.overviewDashboard = document.getElementById('admin-overview-dashboard');
    refs.sidebarTotalUsers = document.getElementById('admin-sidebar-total-users');
    refs.sidebarLastSync = document.getElementById('admin-sidebar-last-sync');
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
