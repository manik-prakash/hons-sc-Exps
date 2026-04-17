import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

function validate(username, password) {
  if (!username) return 'Username is required.'
  if (!USERNAME_RE.test(username)) return 'Username: 3–20 chars, letters/numbers/underscores only.'
  if (!password) return 'Password is required.'
  if (password.length < 6 || password.length > 72) return 'Password must be 6–72 characters.'
  return null
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [csrf, setCsrf] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/csrf-token').then(r => r.json()).then(d => setCsrf(d.csrfToken))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const err = validate(username.trim(), password)
    if (err) { setError(err); return }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password, _csrf: csrf }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      fetch('/api/csrf-token').then(r => r.json()).then(d => setCsrf(d.csrfToken))
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm text-center">
          <div className="text-6xl text-green-500 mb-4">✓</div>
          <h3 className="text-xl font-bold text-green-600 mb-2">Registration Successful!</h3>
          <p className="text-gray-600 mb-6">Welcome, <strong>{username}</strong>! Your account has been created.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username (3–20 chars)</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password (6–72 chars)</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition">
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
