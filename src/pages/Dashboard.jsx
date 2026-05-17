import { useEffect, useState } from 'react'
import { getUsers, getUser, updateUser, deleteUser } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [users, setUsers] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({ full_name: '', address: '', email: '', role: '', password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  function parseJwt(token) {
    try {
      const [, payload] = token.split('.')
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    } catch {
      return null
    }
  }

  async function loadMyProfile() {
    setLoading(true)
    setError(null)
    setStatus(null)
    const token = localStorage.getItem('token')
    const decoded = token ? parseJwt(token) : null
    const id = decoded?.id
    if (!id) {
      setError('Missing authentication token')
      setLoading(false)
      return
    }

    try {
      const data = await getUser(id)
      const user = data.user || data
      setMe(user)
      setSelectedUser(user)
      setEditForm({
        full_name: user.full_name || '',
        address: user.address || '',
        email: user.email || '',
        role: user.role || '',
        password: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    if (!me || me.role !== 'admin') return
    try {
      const data = await getUsers()
      setUsers(data.users || data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadMyProfile()
  }, [])

  useEffect(() => {
    if (me?.role === 'admin') {
      loadUsers()
    }
  }, [me])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  function selectUser(user) {
    setSelectedUser(user)
    setStatus(null)
    setError(null)
    setEditForm({
      full_name: user.full_name || '',
      address: user.address || '',
      email: user.email || '',
      role: user.role || '',
      password: '',
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedUser) return
    setSaving(true)
    setError(null)
    setStatus(null)

    const payload = {
      full_name: editForm.full_name,
      address: editForm.address,
      email: editForm.email,
    }

    if (editForm.password) payload.password = editForm.password
    if (me?.role === 'admin') payload.role = editForm.role

    try {
      const data = await updateUser(selectedUser.id, payload)
      const updated = data.user || data
      setStatus('Profile updated successfully.')
      if (selectedUser.id === me?.id) {
        setMe(updated)
      }
      setSelectedUser(updated)
      if (me?.role === 'admin') {
        loadUsers()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.full_name || user.email}? This cannot be undone.`)) return
    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      await deleteUser(user.id)
      setStatus(`${user.full_name || user.email} deleted.`)
      if (user.id === me?.id) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      loadUsers()
      if (selectedUser?.id === user.id) {
        setSelectedUser(me)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Logged in as {me.full_name} ({me.role})</p>
        </div>
        <button onClick={handleLogout} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Logout</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <section className="space-y-4 rounded border p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Profile editor</h2>
            <span className="text-sm text-gray-500">Selected: {selectedUser?.full_name || selectedUser?.email}</span>
          </div>

          {status && <div className="rounded border border-green-200 bg-green-50 p-3 text-green-700">{status}</div>}
          {saving && <div className="rounded border border-blue-200 bg-blue-50 p-3 text-blue-700">Saving…</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full name</label>
              <input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">New password</label>
              <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2" placeholder="Leave blank to keep current password" />
            </div>
            {me.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2">
                  <option value="trainee">Trainee</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save profile</button>
          </form>
        </section>

        <section className="rounded border p-5 shadow-sm bg-white">
          <h2 className="text-xl font-medium">Profile details</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div><strong>Name:</strong> {selectedUser?.full_name}</div>
            <div><strong>Email:</strong> {selectedUser?.email}</div>
            <div><strong>Address:</strong> {selectedUser?.address || '—'}</div>
            <div><strong>Role:</strong> {selectedUser?.role}</div>
            <div><strong>Created at:</strong> {selectedUser?.created_at || 'N/A'}</div>
          </div>
          {selectedUser?.id !== me.id && me.role === 'admin' && (
            <button onClick={() => handleDelete(selectedUser)} className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete selected user</button>
          )}
        </section>
      </div>

      {me.role === 'admin' && (
        <section className="rounded border p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">All users</h2>
            <button onClick={loadUsers} className="text-sm text-indigo-600 hover:underline">Refresh</button>
          </div>
          {users?.length === 0 && <p className="mt-3 text-sm text-gray-600">No users found.</p>}
          <ul className="mt-4 space-y-3">
            {users?.map((user) => (
              <li key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-600">{user.email} • {user.role}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => selectUser(user)} className="rounded border border-indigo-600 px-3 py-1 text-indigo-600 hover:bg-indigo-50">View/Edit</button>
                  <button onClick={() => handleDelete(user)} className="rounded border border-red-600 px-3 py-1 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
