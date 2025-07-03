'use client'
import { useState } from 'react'

export default function SQLiChallengePage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [htmlResponse, setHtmlResponse] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const body = new URLSearchParams({ username, password }).toString()

    const res = await fetch('/api/forward-sqli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const html = await res.text()

    // Extract flag or message using a simple regex
    const flagMatch = html.match(/CTF\{.*?\}/)
    const isSuccess = html.includes('Congratulations')

    if (flagMatch) {
      setHtmlResponse(`✅ Success! Flag: ${flagMatch[0]}`)
    } else if (isSuccess) {
      setHtmlResponse(`✅ Logged in, but no flag found.`)
    } else {
      setHtmlResponse('❌ Login failed. Try again.')
    }
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-2xl font-bold mb-6">Vulnerable Login (SQLi Challenge)</h1>
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="input-field w-full border px-2 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-field w-full border px-2 py-2 rounded"
        />
        <button type="submit" className="btn-primary w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>

      {/* Render only if login response is received */}
      {htmlResponse && (
        <p className="mt-6 text-center text-gray-800 font-mono bg-white border p-4 rounded shadow">
          {htmlResponse}
        </p>
      )}
    </div>
  )
}
