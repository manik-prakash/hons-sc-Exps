import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BADGES = [
  { label: '1. Password Hashing (bcrypt)', color: 'bg-red-500' },
  { label: '2. XSS Prevention', color: 'bg-orange-500' },
  { label: '3. CSRF Protection', color: 'bg-green-500' },
  { label: '4. SQLi Prevention', color: 'bg-blue-500' },
  { label: '5. JWT Auth (httpOnly)', color: 'bg-purple-600' },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [csrf, setCsrf] = useState('')
  const [msgInput, setMsgInput] = useState('')
  const [msgError, setMsgError] = useState('')
  const [msgStatus, setMsgStatus] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/dashboard-data', { credentials: 'include' })
      .then(r => {
        if (r.status === 401 || r.redirected) { navigate('/'); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        setUser(d.username)
        setMessages(d.messages)
        setCsrf(d.csrfToken)
      })
  }, [navigate])

  async function handleLogout() {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _csrf: csrf }),
    })
    navigate('/')
  }

  async function handlePost(e) {
    e.preventDefault()
    setMsgError(''); setMsgStatus('')
    const content = msgInput.trim()
    if (!content) { setMsgError('Message cannot be empty.'); return }
    if (content.length > 300) { setMsgError('Max 300 characters.'); return }

    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content, _csrf: csrf }),
    })
    const data = await res.json()
    if (data.error) {
      setMsgError(data.error)
    } else {
      setMsgStatus('Posted!')
      setMsgInput('')
      // Reload messages
      fetch('/api/dashboard-data', { credentials: 'include' })
        .then(r => r.json()).then(d => { setMessages(d.messages); setCsrf(d.csrfToken) })
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Secure App Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, <strong>{user}</strong></p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md transition">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Active Security Features</h3>
          <div className="flex flex-wrap gap-2">
            {BADGES.map(b => (
              <span key={b.label} className={`${b.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>{b.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-1">Post a Message <span className="text-xs text-gray-400">(XSS + CSRF demo)</span></h3>
          <p className="text-xs text-gray-400 mb-3">Try posting <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> — it renders as plain text.</p>
          <form onSubmit={handlePost} className="flex gap-2">
            <input
              type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)}
              placeholder="Type a message..." maxLength={300}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition">
              Post
            </button>
          </form>
          {msgError && <p className="text-red-500 text-sm mt-2">{msgError}</p>}
          {msgStatus && <p className="text-green-600 text-sm mt-2">{msgStatus}</p>}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Message Board</h3>
          {messages.length === 0
            ? <p className="text-gray-400 text-sm">No messages yet.</p>
            : <ul className="space-y-2">
                {messages.map((m, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <strong className="text-gray-900">{m.username}</strong>: {m.content}
                  </li>
                ))}
              </ul>
          }
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Security Info</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong>Hashing:</strong> Password stored as bcrypt hash (saltRounds=12). Never plaintext.</li>
            <li><strong>XSS:</strong> React escapes all output by default + server CSP header blocks inline scripts.</li>
            <li><strong>CSRF:</strong> Every POST requires a signed <code className="bg-gray-100 px-1 rounded">_csrf</code> token. Missing = 403.</li>
            <li><strong>SQLi:</strong> All DB queries use <code className="bg-gray-100 px-1 rounded">?</code> placeholders — injection impossible.</li>
            <li><strong>JWT:</strong> Session token in <code className="bg-gray-100 px-1 rounded">httpOnly</code> cookie — JS cannot read it.</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
