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

module.exports = async function searchIntent(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: 'GROQ_API_KEY is not configured' });
    return;
  }

  const body = typeof request.body === 'string' ? safeJsonParse(request.body, {}) : (request.body || {});
  const query = String(body.query || '').trim().slice(0, 160);
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 220) : [];

  if (!query) {
    sendJson(response, 400, { error: 'query is required' });
    return;
  }

  const prompt = [
    'You map messy marketplace searches to the best WorkLinkUp service/category/location candidates.',
    'Return only compact JSON with keys: query, service, category, city, province, suggestions.',
    'suggestions must be an array of at most 6 candidate titles from the provided candidates.',
    'Choose the best service/category/location from the provided candidates. Prefer service/category meaning over location-only matches.',
    'Never invent a service, category, city, or province outside the provided candidates unless it is empty.',
    'If a query contains both a service and a location, return both. Example: "gardens in harare" should return a gardening service/category and Harare.',
    `User search: ${query}`,
    `Candidates: ${JSON.stringify(candidates)}`
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
      const details = await groqResponse.text().catch(() => '');
      sendJson(response, 502, { error: 'Groq search intent request failed', details: details.slice(0, 500) });
      return;
    }

    const data = await groqResponse.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const intent = extractJsonObject(content);
    if (!intent) {
      sendJson(response, 502, { error: 'Groq returned an unreadable search intent' });
      return;
    }

    sendJson(response, 200, {
      query,
      service: String(intent.service || '').trim(),
      category: String(intent.category || '').trim(),
      city: String(intent.city || '').trim(),
      province: String(intent.province || '').trim(),
      suggestions: Array.isArray(intent.suggestions) ? intent.suggestions.slice(0, 6) : []
    });
  } catch (error) {
    sendJson(response, 500, { error: 'Search intent failed' });
  }
};
