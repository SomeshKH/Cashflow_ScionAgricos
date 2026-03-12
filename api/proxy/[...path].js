export default async function handler(req, res) {
  const BASE_URL = process.env.AWS_API_BASE_URL;
  const API_KEY = process.env.AWS_BACKEND_API_KEY;

  if (!BASE_URL || !API_KEY) {
    return res.status(500).json({
      error: "Server misconfiguration",
      detail: "AWS_API_BASE_URL and AWS_BACKEND_API_KEY must be set.",
    });
  }

  const rawPath = req.query.path ?? req.query["...path"];

  const segments = Array.isArray(rawPath)
    ? rawPath
    : [rawPath].filter(Boolean);

  const upstreamPath = segments.join("/");

  const forwardParams = { ...req.query };
  delete forwardParams.path;
  delete forwardParams["...path"];

  const qs = new URLSearchParams(
    Object.entries(forwardParams).map(([k, v]) => [k, String(v)])
  ).toString();

  const targetUrl = `${BASE_URL.replace(/\/$/, "")}/${upstreamPath}${qs ? `?${qs}` : ""}`;

  try {
    console.log(`[proxy] ${req.method} ${targetUrl}`);

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
      body: ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
    });

    const body = await upstream.text();
    res.status(upstream.status);

    const ct = upstream.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);

    res.send(body);
  } catch (err) {
    res.status(502).json({
      error: "Bad Gateway",
      message: err.message || "Upstream request failed",
    });
  }
}