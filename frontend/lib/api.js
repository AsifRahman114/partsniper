// lib/api.js
// ------------------------------------------------------------
// Thin fetch wrapper for the PartSniper API. Uses relative
// /api/* paths (proxied to the backend via next.config.js
// rewrites), so requests are same-origin from the browser's
// perspective and cookies (the httpOnly JWT) flow naturally.
// ------------------------------------------------------------

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message = (body && body.error) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: (path, data) => request(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError };
