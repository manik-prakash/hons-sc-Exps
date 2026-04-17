import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

function validate(username, password) {
  if (!username) return 'Username is required.'
  if (!USERNAME_RE.test(username)) return 'Username: 3–20 chars, letters/numbers/underscores only.'
  if (!password) return 'Password is required.'
  if (password.length < 6 || password.length > 72) return 'Password must be 6–72 characters.'
  return null
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [csrf, setCsrf] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/csrf-token').then(r => r.json()).then(d => setCsrf(d.csrfToken))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const err = validate(username.trim(), password)
    if (err) { setError(err); return }

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password, _csrf: csrf }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      fetch('/api/csrf-token').then(r => r.json()).then(d => setCsrf(d.csrfToken))
    } else {
      setStatus('Login successful! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 600)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Secure Coding Demo</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {['Hashing','XSS Prevention','CSRF','SQLi Prevention','JWT Auth'].map((f, i) => (
            <span key={f} className={`text-xs font-bold text-white px-2 py-1 rounded-full ${
              ['bg-red-500','bg-orange-500','bg-green-500','bg-blue-500','bg-purple-600'][i]
            }`}>{f}</span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              autoComplete="username" required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              autoComplete="current-password" required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {status && <p className="text-green-600 text-sm">{status}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition">
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  )
}
