import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="p-4 border-b">
        <nav className="max-w-4xl mx-auto flex gap-4">
          <Link to="/" className="font-semibold">Home</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </div>

      <main className="max-w-4xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<div>Welcome to TechSkills Hub frontend. Use the links above.</div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
