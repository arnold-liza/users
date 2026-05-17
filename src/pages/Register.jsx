import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', address: '', email: '', password: '', role: 'trainee' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input required value={form.full_name} onChange={e=>setForm({...form, full_name: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input value={form.address} onChange={e=>setForm({...form, address: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input required type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
            <option value="trainee">Trainee</option>
            <option value="trainer">Trainer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded">{loading ? 'Registering…' : 'Register'}</button>
        </div>
      </form>
    </div>
  )
}
