const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || res.statusText)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export async function register(user) {
  return request('/register', { method: 'POST', body: JSON.stringify(user) })
}

export async function login(creds) {
  return request('/login', { method: 'POST', body: JSON.stringify(creds) })
}

export async function fetchSkills() {
  return request('/skills')
}

export async function getHealth() {
  return request('/health')
}

export async function getUsers() {
  return request('/users')
}

export async function getUser(id) {
  return request(`/users/${id}`)
}

export async function updateUser(id, data) {
  return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' })
}
