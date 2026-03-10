/**
 * Vercel Serverless Proxy  →  AWS API Gateway
 * ─────────────────────────────────────────────
 * Route:  /api/proxy/*
 * Target: AWS_API_BASE_URL  (e.g. https://xxx.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1)
 *
 * The AWS API key is read from AWS_BACKEND_API_KEY and injected server-side.
 * It is NEVER sent to or readable by the browser.
 *
 * Supported methods: GET · POST · PUT · PATCH · DELETE
 */

export default async function handler(req, res) {
  // ── 1. Guard: env vars must be present ──────────────────────────────────────
  const BASE_URL = process.env.AWS_API_BASE_URL;
  const API_KEY  = process.env.AWS_BACKEND_API_KEY;

  if (!BASE_URL || !API_KEY) {
    console.error('[proxy] Missing env vars: AWS_API_BASE_URL or AWS_BACKEND_API_KEY');
    return res.status(500).json({
      error: 'Server misconfiguration',
      detail: 'AWS_API_BASE_URL and AWS_BACKEND_API_KEY must be set in Vercel environment variables.',
    });
  }

  // ── 2. Reconstruct upstream path ────────────────────────────────────────────
  // req.query.path is an array of segments: e.g. ['health'] or ['yearly-totals']
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);

  const upstreamPath = segments.join('/');

  // ── 3. Forward query-string params (strip the internal "path" key) ───────────
  const { path: _drop, ...forwardParams } = req.query;
  const qs = new URLSearchParams(
    Object.entries(forwardParams).map(([k, v]) => [k, String(v)])
  ).toString();

  const targetUrl = `${BASE_URL}/${upstreamPath}${qs ? `?${qs}` : ''}`;

  // ── 4. Build upstream fetch options ─────────────────────────────────────────
  /** @type {RequestInit} */
  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // ✅ API key injected here — server-side only, never reaches the browser
      'x-api-key': API_KEY,
    },
  };

  // Forward request body for mutating methods
  const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (BODY_METHODS.has(req.method) && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  // ── 5. Call AWS and stream response back ────────────────────────────────────
  try {
    console.log(`[proxy] ${req.method} ${targetUrl}`);

    const upstream = await fetch(targetUrl, fetchOptions);

    // Mirror status code
    res.status(upstream.status);

    // Mirror content-type so the client knows what it's receiving
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);

    // Mirror CORS headers from upstream (if any) — optional
    const corsOrigin = upstream.headers.get('access-control-allow-origin');
    if (corsOrigin) res.setHeader('Access-Control-Allow-Origin', corsOrigin);

    // Send the body as-is (text/JSON/binary all work)
    const body = await upstream.text();
    res.send(body);

  } catch (err) {
    console.error('[proxy] Upstream fetch error:', err);
    res.status(502).json({
      error: 'Bad Gateway',
      message: err.message ?? 'Upstream request failed',
    });
  }
}
