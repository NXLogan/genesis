async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  if (res.status === 401) throw new ApiError(401, 'Non connecté');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const api = {
  get: (path) => request(path),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
};
