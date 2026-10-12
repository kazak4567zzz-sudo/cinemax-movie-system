const ALLOWED_ORIGINS = new Set([
  'https://kazak4567zzz-sudo.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://kazak4567zzz-sudo.github.io',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

function json(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request) }
  });
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}

function bytesToHex(bytes) {
  return [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index++) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

async function tokenHash(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

async function createSession(env, userId) {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToBase64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const hash = await tokenHash(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(hash, userId, expiresAt).run();
  return token;
}

async function register(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(request, { message: 'Некорректный запрос.' }, 400); }
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (username.length < 3 || username.length > 30) return json(request, { message: 'Имя должно содержать от 3 до 30 символов.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json(request, { message: 'Введите корректный email.' }, 400);
  if (password.length < 8 || password.length > 128) return json(request, { message: 'Пароль должен содержать от 8 до 128 символов.' }, 400);
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1').bind(email, username).first();
  if (existing) return json(request, { message: 'Email или имя пользователя уже заняты.' }, 409);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await passwordHash(password, salt);
  try {
    const result = await env.DB.prepare('INSERT INTO users (username, email, password_hash, password_salt) VALUES (?, ?, ?, ?)')
      .bind(username, email, bytesToBase64(hash), bytesToBase64(salt)).run();
    const userID = Number(result.meta.last_row_id);
    const token = await createSession(env, userID);
    return json(request, { userID, username, email, token }, 201);
  } catch {
    return json(request, { message: 'Email или имя пользователя уже заняты.' }, 409);
  }
}

async function login(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(request, { message: 'Некорректный запрос.' }, 400); }
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = await env.DB.prepare('SELECT id, username, email, password_hash, password_salt FROM users WHERE email = ? LIMIT 1').bind(email).first();
  if (!user) return json(request, { message: 'Неверный email или пароль.' }, 401);
  const actual = await passwordHash(password, base64ToBytes(user.password_salt));
  if (!safeEqual(actual, base64ToBytes(user.password_hash))) return json(request, { message: 'Неверный email или пароль.' }, 401);
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(new Date().toISOString()).run();
  const token = await createSession(env, user.id);
  return json(request, { userID: user.id, username: user.username, email: user.email, token });
}

async function currentUser(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(request, { message: 'Требуется авторизация.' }, 401);
  const hash = await tokenHash(token);
  const user = await env.DB.prepare(`SELECT u.id, u.username, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? LIMIT 1`)
    .bind(hash, new Date().toISOString()).first();
  if (!user) return json(request, { message: 'Сессия истекла.' }, 401);
  return json(request, { userID: user.id, username: user.username, email: user.email });
}

async function logout(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await tokenHash(token)).run();
  return json(request, { success: true });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
    const path = new URL(request.url).pathname;
    try {
      if (path === '/health' && request.method === 'GET') return json(request, { status: 'healthy' });
      if (path === '/api/auth/register' && request.method === 'POST') return register(request, env);
      if (path === '/api/auth/login' && request.method === 'POST') return login(request, env);
      if (path === '/api/auth/me' && request.method === 'GET') return currentUser(request, env);
      if (path === '/api/auth/logout' && request.method === 'POST') return logout(request, env);
      return json(request, { message: 'Not found' }, 404);
    } catch (error) {
      console.error(error);
      return json(request, { message: 'Временная ошибка сервиса.' }, 500);
    }
  }
};
