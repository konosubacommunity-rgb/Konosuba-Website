export const API_BASE = (import.meta.env.VITE_BOT_API_URL as string) || 'https://konosuba-bot.onrender.com';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getCurrentUser(): { phone: string; username: string } | null {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setSession(token: string, user: { phone: string; username: string }) {
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}

export function formatMoney(n: number) {
  return '$' + Number(n).toLocaleString('en-US');
}

export function formatTime(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export async function apiSignup(phone: string, username: string, password: string, country: string) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, username, password, country }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Signup failed');
  return data;
}

export async function apiLogin(phone: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function apiGetUser(phone: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/user/${phone}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) { clearSession(); throw new Error('unauthorized'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load user');
  return data;
}

export async function apiGetActivities(phone: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/user/${phone}/activity`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return { activities: [] };
  return res.json();
}
