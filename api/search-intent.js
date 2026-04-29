const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function extractJsonObject(text = '') {
  const raw = String(text || '').trim();
  const parsed = safeJsonParse(raw);
  if (parsed && typeof parsed === 'object') return parsed;
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? safeJsonParse(match[0], null) : null;
}

const FALLBACK_ALIASES = [
  ['capender', 'Carpenter', 'Home Services'],
  ['capenter', 'Carpenter', 'Home Services'],
  ['carpender', 'Carpenter', 'Home Services'],
  ['carpenter', 'Carpenter', 'Home Services'],
  ['wood work', 'Carpenter', 'Home Services'],
  ['woodwork', 'Carpenter', 'Home Services'],
  ['garden', 'General Gardener', 'Gardening & Landscaping'],
  ['gardens', 'General Gardener', 'Gardening & Landscaping'],
  ['gardener', 'General Gardener', 'Gardening & Landscaping'],
  ['lawn', 'Lawn Mower', 'Gardening & Landscaping'],
  ['mowing', 'Lawn Mower', 'Gardening & Landscaping']
];

function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenize(value = '') {
  const stopwords = new Set(['a', 'an', 'and', 'for', 'from', 'i', 'in', 'me', 'my', 'near', 'need', 'of', 'the', 'to', 'with']);
  return normalizeText(value).split(' ').filter((token) => token.length > 1 && !stopwords.has(token));
}

function levenshtein(a = '', b = '') {
  const first = normalizeText(a);
  const second = normalizeText(b);
  if (!first || !second) return Math.max(first.length, second.length);
  const costs = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let i = 1; i <= first.length; i += 1) {
    let previous = i - 1;
    costs[0] = i;
    for (let j = 1; j <= second.length; j += 1) {
      const current = costs[j];
      costs[j] = first[i - 1] === second[j - 1]
        ? previous
        : Math.min(previous + 1, costs[j] + 1, costs[j - 1] + 1);
      previous = current;
    }
  }
  return costs[second.length];
}

function scoreCandidate(candidate = {}, rawQuery = '') {
  const query = normalizeText(rawQuery);
  const queryTokens = tokenize(query);
  const title = normalizeText(candidate.title);
  const service = normalizeText(candidate.service);
  const category = normalizeText(candidate.category);
  const city = normalizeText(candidate.city);
  const province = normalizeText(candidate.province);
  const values = [title, service, category, city, province].filter(Boolean);
  let score = 0;

  FALLBACK_ALIASES.forEach(([alias, aliasService, aliasCategory]) => {
    const normalizedAlias = normalizeText(alias);
    if (!query.includes(normalizedAlias)) return;
    if (service === normalizeText(aliasService) || title === normalizeText(aliasService)) score += 260;
    if (category === normalizeText(aliasCategory)) score += 90;
  });

  values.forEach((value) => {
    if (value === query) score += 220;
    if (query.includes(value) && value.length >= 3) score += 130;
    if (value.includes(query) && query.length >= 3) score += 95;
    const valueTokens = tokenize(value);
    queryTokens.forEach((token) => {
      if (valueTokens.includes(token)) score += 42;
      else if (valueTokens.some((valueToken) => valueToken.startsWith(token) || token.startsWith(valueToken))) score += 26;
      else if (valueTokens.some((valueToken) => levenshtein(token, valueToken) <= 2)) score += 18;
    });
  });

  if (candidate.kind === 'location' && queryTokens.length > 1) score *= 0.55;
  if (candidate.service) score += 16;
  if (candidate.category) score += 8;
  return Math.round(score);
}

function resolveFallbackIntent(query = '', candidates = [], reason = 'fallback') {
  const ranked = candidates
    .map((candidate) => ({ ...candidate, _score: scoreCandidate(candidate, query) }))
    .filter((candidate) => candidate._score > 20)
    .sort((first, second) => Number(second._score || 0) - Number(first._score || 0));
  const bestService = ranked.find((candidate) => candidate.service);
  const bestCategory = ranked.find((candidate) => candidate.category);
  const bestLocation = ranked.find((candidate) => candidate.kind === 'location' || candidate.city || candidate.province);

  const suggestions = [];
  ranked.forEach((candidate) => {
    const title = String(candidate.title || '').trim();
    if (title && !suggestions.includes(title)) suggestions.push(title);
  });

  return {
    query,
    service: String(bestService?.service || '').trim(),
    category: String(bestService?.category || bestCategory?.category || '').trim(),
    city: String(bestLocation?.city || '').trim(),
    province: String(bestLocation?.province || '').trim(),
    suggestions: suggestions.slice(0, 6),
    source: reason
  };
}

function scoreProvider(provider = {}, rawQuery = '', intent = {}) {
  const query = normalizeText([
    rawQuery,
    intent.service,
    intent.category,
    intent.city,
    intent.province
  ].filter(Boolean).join(' '));
  const queryTokens = tokenize(query);
  const fields = [
    provider.name,
    provider.displayName,
    provider.title,
    provider.specialty,
    provider.category,
    provider.primaryCategory,
    provider.city,
    provider.province,
    provider.location,
    provider.bio,
    Array.isArray(provider.services) ? provider.services.join(' ') : ''
  ].map(normalizeText).filter(Boolean);
  let score = 0;

  fields.forEach((field) => {
    if (field === query) score += 260;
    if (query.includes(field) && field.length >= 3) score += 120;
    if (field.includes(query) && query.length >= 3) score += 95;
    const fieldTokens = tokenize(field);
    queryTokens.forEach((token) => {
      if (fieldTokens.includes(token)) score += 36;
      else if (fieldTokens.some((fieldToken) => fieldToken.startsWith(token) || token.startsWith(fieldToken))) score += 24;
      else if (fieldTokens.some((fieldToken) => levenshtein(token, fieldToken) <= 2)) score += 14;
    });
  });

  if (intent.category && fields.some((field) => field.includes(normalizeText(intent.category)))) score += 80;
  if (intent.service && fields.some((field) => field.includes(normalizeText(intent.service)))) score += 100;
  if (intent.city && fields.some((field) => field.includes(normalizeText(intent.city)))) score += 40;
  if (intent.province && fields.some((field) => field.includes(normalizeText(intent.province)))) score += 28;
  score += Math.min(24, Number(provider.rating || 0) * 4);
  return Math.max(0, Math.min(100, Math.round((score / 360) * 100)));
}

function rankProvidersFallback(query = '', providers = [], intent = {}) {
  return providers
    .map((provider) => ({
      uid: String(provider.uid || '').trim(),
      matchPercent: scoreProvider(provider, query, intent),
      reason: 'Local text similarity'
    }))
    .filter((provider) => provider.uid && provider.matchPercent > 10)
    .sort((first, second) => second.matchPercent - first.matchPercent);
}

module.exports = async function searchIntent(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  const body = typeof request.body === 'string' ? safeJsonParse(request.body, {}) : (request.body || {});
  const query = String(body.query || '').trim().slice(0, 160);
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 600) : [];
  const categories = Array.isArray(body.categories) ? body.categories.slice(0, 80) : [];
  const matchingCategory = String(body.matchingCategory || '').trim();
  const providers = Array.isArray(body.providers) ? body.providers.slice(0, 500) : [];

  if (!query) {
    sendJson(response, 400, { error: 'query is required' });
    return;
  }

  if (!apiKey) {
    const fallbackIntent = resolveFallbackIntent(query, candidates, 'missing-groq-key');
    const rankedProviders = rankProvidersFallback(query, providers, fallbackIntent);
    sendJson(response, 200, {
      ...fallbackIntent,
      bestMatches: rankedProviders.slice(0, 3),
      relatedMatches: rankedProviders.slice(3, 36)
    });
    return;
  }

  const prompt = [
    'You map messy marketplace searches to the best WorkLinkUp service/category/location candidates and rank real providers.',
    'Return only compact JSON with keys: query, service, category, city, province, suggestions, bestMatches, relatedMatches.',
    'suggestions must be an array of at most 6 candidate titles from the provided candidates.',
    'bestMatches and relatedMatches must be arrays of objects: {uid, matchPercent, reason}.',
    'matchPercent must be 0-100 and represent nearness to the user search term.',
    'Choose the best service/category/location from the provided candidates. Prefer service/category meaning over location-only matches.',
    'Never invent a service, category, city, or province outside the provided candidates unless it is empty.',
    'Rank bestMatches first by strongest direct service/category/name fit. Rank relatedMatches by matchPercent nearness to the query.',
    'If a query contains both a service and a location, return both. Example: "gardens in harare" should return a gardening service/category and Harare.',
    `User search: ${query}`,
    `Available categories: ${JSON.stringify(categories)}`,
    `Locally matched category: ${matchingCategory}`,
    `Candidates: ${JSON.stringify(candidates)}`,
    `Providers: ${JSON.stringify(providers)}`
  ].join('\n');

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0,
        max_tokens: 400,
        messages: [
          { role: 'system', content: 'You are a precise search intent router. Output JSON only.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!groqResponse.ok) {
      const fallbackIntent = resolveFallbackIntent(query, candidates, 'groq-error');
      const rankedProviders = rankProvidersFallback(query, providers, fallbackIntent);
      sendJson(response, 200, {
        ...fallbackIntent,
        bestMatches: rankedProviders.slice(0, 3),
        relatedMatches: rankedProviders.slice(3, 36)
      });
      return;
    }

    const data = await groqResponse.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const intent = extractJsonObject(content);
    if (!intent) {
      const fallbackIntent = resolveFallbackIntent(query, candidates, 'unreadable-groq-response');
      const rankedProviders = rankProvidersFallback(query, providers, fallbackIntent);
      sendJson(response, 200, {
        ...fallbackIntent,
        bestMatches: rankedProviders.slice(0, 3),
        relatedMatches: rankedProviders.slice(3, 36)
      });
      return;
    }

    sendJson(response, 200, {
      query,
      service: String(intent.service || '').trim(),
      category: String(intent.category || '').trim(),
      city: String(intent.city || '').trim(),
      province: String(intent.province || '').trim(),
      suggestions: Array.isArray(intent.suggestions) ? intent.suggestions.slice(0, 6) : [],
      bestMatches: Array.isArray(intent.bestMatches) ? intent.bestMatches.slice(0, 8) : [],
      relatedMatches: Array.isArray(intent.relatedMatches) ? intent.relatedMatches.slice(0, 60) : [],
      source: 'groq'
    });
  } catch (error) {
    const fallbackIntent = resolveFallbackIntent(query, candidates, 'request-failed');
    const rankedProviders = rankProvidersFallback(query, providers, fallbackIntent);
    sendJson(response, 200, {
      ...fallbackIntent,
      bestMatches: rankedProviders.slice(0, 3),
      relatedMatches: rankedProviders.slice(3, 36)
    });
  }
};
