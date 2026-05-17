import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await login(form)
      if (data && data.token) {
        localStorage.setItem('token', data.token)
        navigate('/dashboard')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input required type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded">{loading ? 'Logging in…' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
