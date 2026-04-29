(function homeMetricsBootstrap() {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const ONLINE_WINDOW_MS = 15 * 60 * 1000;

  function escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toMs(value) {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function isOpenOpportunity(job = {}) {
    const status = String(job.status || 'open').trim().toLowerCase();
    return status === 'open' && !toMs(job.completedAtMs) && !String(job.acceptedApplicationUid || '').trim();
  }

  function isCompletedJob(job = {}) {
    const status = String(job.status || '').trim().toLowerCase();
    return Boolean(toMs(job.completedAtMs) || status === 'completed' || status === 'paid');
  }

  function countInWindow(records = [], fieldName = 'createdAtMs', startMs = 0, endMs = Date.now()) {
    return records.filter((record) => {
      const recordMs = toMs(record[fieldName]);
      return recordMs >= startMs && recordMs < endMs;
    }).length;
  }

  function percentageChange(currentValue = 0, previousValue = 0) {
    const current = Number(currentValue || 0);
    const previous = Number(previousValue || 0);
    if (!previous) return current ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  function fasterChange(currentValue = 0, previousValue = 0) {
    const current = Number(currentValue || 0);
    const previous = Number(previousValue || 0);
    if (!previous) return current ? 0 : 0;
    return Math.round(((previous - current) / previous) * 100);
  }

  function formatTrend(change = 0, options = {}) {
    const value = Math.abs(Math.round(Number(change || 0)));
    const direction = Number(change || 0) >= 0 ? 'up' : 'down';
    const suffix = options.suffix || '';
    const label = options.label || '';
    return {
      direction,
      className: direction === 'up' ? 'is-up' : 'is-down',
      icon: direction === 'up' ? '▲' : '▼',
      text: `${value}%${suffix ? ` ${suffix}` : ''}${label ? ` ${label}` : ''}`
    };
  }

  function formatDuration(minutes = 0) {
    const rounded = Math.max(0, Math.round(Number(minutes || 0)));
    if (rounded < 60) return `${rounded || 0} min`;
    const hours = rounded / 60;
    if (hours < 10) return `${Math.round(hours * 10) / 10} hr`;
    return `${Math.round(hours)} hr`;
  }

  function average(values = []) {
    const valid = values.filter((value) => Number.isFinite(Number(value)) && Number(value) >= 0);
    if (!valid.length) return 0;
    return valid.reduce((sum, value) => sum + Number(value), 0) / valid.length;
  }

  function getMonthWindow(offset = 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }

  function renderOpportunityStat(totalJobs = 0, jobs = []) {
    const now = Date.now();
    const currentCount = countInWindow(jobs, 'createdAtMs', now - WEEK_MS, now);
    const previousCount = countInWindow(jobs, 'createdAtMs', now - (WEEK_MS * 2), now - WEEK_MS);
    const trend = formatTrend(percentageChange(currentCount, previousCount));

    document.querySelectorAll('[data-home-available-stats]').forEach((pill) => {
      if (!(pill instanceof HTMLElement)) return;
      pill.classList.toggle('is-up', trend.direction === 'up');
      pill.classList.toggle('is-down', trend.direction === 'down');
      const totalEl = pill.querySelector('[data-home-available-total]');
      const trendEl = pill.querySelector('[data-home-available-trend]');
      const iconEl = pill.querySelector('[data-home-available-trend-icon]');
      if (totalEl) totalEl.textContent = String(totalJobs);
      if (trendEl) trendEl.textContent = `${Math.abs(percentageChange(currentCount, previousCount))}%`;
      if (iconEl) iconEl.textContent = trend.icon;
    });
  }

  function renderHealthCards(cards = []) {
    const markup = cards.map((card) => `
      <article class="home-health-card${card.loading ? ' is-loading' : ''}">
        <span>${escapeHtml(card.label)}</span>
        <strong>${card.loading ? '' : escapeHtml(card.value)}</strong>
        <small class="${escapeHtml(card.trend.className)}">
          <i>${escapeHtml(card.trend.icon)}</i>
          <b>${card.loading ? '' : escapeHtml(card.trend.text)}</b>
        </small>
      </article>
    `).join('');

    document.querySelectorAll('[data-home-market-health]').forEach((host) => {
      if (host instanceof HTMLElement) host.innerHTML = markup;
    });
  }

  function renderLoading() {
    renderHealthCards([
      { label: 'Avg. Response Time', value: '', trend: formatTrend(0), loading: true },
      { label: 'Jobs Completed', value: '', trend: formatTrend(0), loading: true },
      { label: 'Avg. Bids per Job', value: '', trend: formatTrend(0), loading: true },
      { label: 'Providers', value: '', trend: formatTrend(0), loading: true }
    ]);
  }

  async function loadApplicationsForJobs(authHelper, jobs = []) {
    if (!authHelper || typeof authHelper.listJobApplications !== 'function') return new Map();
    const entries = await Promise.all(jobs.map(async (job) => {
      const applications = await authHelper.listJobApplications(job.id).catch(() => []);
      return [job.id, Array.isArray(applications) ? applications : []];
    }));
    return new Map(entries);
  }

  function getFirstResponseMinutes(job = {}, applications = []) {
    const jobCreatedAtMs = toMs(job.createdAtMs);
    if (!jobCreatedAtMs || !applications.length) return null;
    const firstBidAtMs = applications
      .map((application) => toMs(application.createdAtMs || application.updatedAtMs))
      .filter((value) => value >= jobCreatedAtMs)
      .sort((first, second) => first - second)[0];
    if (!firstBidAtMs) return null;
    return (firstBidAtMs - jobCreatedAtMs) / 60000;
  }

  function getBidCount(job = {}, applicationsByJob = new Map()) {
    const applications = applicationsByJob.get(job.id);
    if (Array.isArray(applications)) return applications.length;
    return Math.max(0, Number(job.applicationCount || 0));
  }

  async function update(options = {}) {
    const authHelper = options.authHelper || null;
    if (!authHelper) return;

    const jobs = Array.isArray(options.jobs)
      ? options.jobs
      : await authHelper.listJobPosts({ includeApplicationCounts: true }).catch(() => []);
    const allJobs = Array.isArray(jobs) ? jobs : [];
    const now = Date.now();
    const currentStart = now - WEEK_MS;
    const previousStart = now - (WEEK_MS * 2);
    const currentJobs = allJobs.filter((job) => toMs(job.createdAtMs) >= currentStart && toMs(job.createdAtMs) < now);
    const previousJobs = allJobs.filter((job) => toMs(job.createdAtMs) >= previousStart && toMs(job.createdAtMs) < currentStart);
    const recentJobs = [...currentJobs, ...previousJobs];
    const openJobs = allJobs.filter(isOpenOpportunity);
    const applicationsByJob = await loadApplicationsForJobs(authHelper, recentJobs);

    const currentResponseValues = currentJobs
      .map((job) => getFirstResponseMinutes(job, applicationsByJob.get(job.id) || []))
      .filter((value) => value !== null);
    const previousResponseValues = previousJobs
      .map((job) => getFirstResponseMinutes(job, applicationsByJob.get(job.id) || []))
      .filter((value) => value !== null);
    const currentResponseAverage = average(currentResponseValues);
    const previousResponseAverage = average(previousResponseValues);
    const responseChange = currentResponseValues.length && previousResponseValues.length
      ? fasterChange(currentResponseAverage, previousResponseAverage)
      : 0;
    const responseTrend = formatTrend(responseChange, { suffix: responseChange >= 0 ? 'faster' : 'slower' });

    const completedJobs = allJobs.filter(isCompletedJob);
    const currentMonth = getMonthWindow(0);
    const previousMonth = getMonthWindow(-1);
    const currentMonthCompleted = countInWindow(completedJobs, 'completedAtMs', currentMonth.startMs, currentMonth.endMs);
    const previousMonthCompleted = countInWindow(completedJobs, 'completedAtMs', previousMonth.startMs, previousMonth.endMs);
    const completedTrend = formatTrend(percentageChange(currentMonthCompleted, previousMonthCompleted), { label: 'this month' });

    const openBidTotal = openJobs.reduce((sum, job) => sum + Math.max(0, Number(job.applicationCount || 0)), 0);
    const averageOpenBids = openJobs.length ? openBidTotal / openJobs.length : 0;
    const currentBidsPerJob = currentJobs.length
      ? currentJobs.reduce((sum, job) => sum + getBidCount(job, applicationsByJob), 0) / currentJobs.length
      : 0;
    const previousBidsPerJob = previousJobs.length
      ? previousJobs.reduce((sum, job) => sum + getBidCount(job, applicationsByJob), 0) / previousJobs.length
      : 0;
    const bidTrend = formatTrend(percentageChange(currentBidsPerJob, previousBidsPerJob), {
      suffix: percentageChange(currentBidsPerJob, previousBidsPerJob) < 0 ? 'lower' : 'higher'
    });

    const providers = typeof authHelper.listProviders === 'function'
      ? await authHelper.listProviders().catch(() => [])
      : [];
    const users = typeof authHelper.listUsers === 'function'
      ? await authHelper.listUsers().catch(() => [])
      : [];
    const userByUid = new Map((Array.isArray(users) ? users : []).map((user) => [String(user.uid || ''), user]));
    const verifiedProviders = Array.isArray(providers) ? providers : [];
    const onlineNow = verifiedProviders.filter((provider) => {
      const user = userByUid.get(String(provider.uid || ''));
      return toMs(user?.lastSeenAtMs || provider.lastSeenAtMs) >= now - ONLINE_WINDOW_MS;
    }).length;
    const onlinePreviousWindow = verifiedProviders.filter((provider) => {
      const user = userByUid.get(String(provider.uid || ''));
      const lastSeenAtMs = toMs(user?.lastSeenAtMs || provider.lastSeenAtMs);
      return lastSeenAtMs >= now - (ONLINE_WINDOW_MS * 2) && lastSeenAtMs < now - ONLINE_WINDOW_MS;
    }).length;
    const onlineTrend = formatTrend(percentageChange(onlineNow, onlinePreviousWindow), { label: 'now' });

    renderOpportunityStat(openJobs.length, allJobs);
    renderHealthCards([
      {
        label: 'Avg. Response Time',
        value: currentResponseAverage ? formatDuration(currentResponseAverage) : 'No bids yet',
        trend: responseTrend
      },
      {
        label: 'Jobs Completed',
        value: `${completedJobs.length} Completed`,
        trend: completedTrend
      },
      {
        label: 'Avg. Bids per Job',
        value: `${Math.round(averageOpenBids * 10) / 10} Bids`,
        trend: bidTrend
      },
      {
        label: 'Providers',
        value: `${onlineNow} Online`,
        trend: onlineTrend
      }
    ]);
  }

  window.worklinkHomeMetrics = {
    renderLoading,
    update,
    updateOpportunityStat: renderOpportunityStat
  };
})();
