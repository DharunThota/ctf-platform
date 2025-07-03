'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trophy, Flag, Lightbulb, Users, CheckCircle } from 'lucide-react'
import { Challenge } from '@/lib/models/Challenge'
import { UserSession } from '@/lib/models/User'

export default function ChallengePage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [user, setUser] = useState<UserSession | null>(null)
  const [flag, setFlag] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showHints, setShowHints] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    fetchChallenge()
    fetchUser()
  }, [params.id])

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${params.id}`)
      if (response.ok) {
        const challengeData = await response.json()
        setChallenge(challengeData)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching challenge:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flag.trim()) return

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: params.id,
          flag: flag.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.correct) {
          setMessage({ type: 'success', text: `Correct! You earned ${challenge?.points} points!` })
          setFlag('')
          // Refresh challenge data to show it's solved
          fetchChallenge()
          fetchUser()
        } else {
          setMessage({ type: 'error', text: 'Incorrect flag. Try again!' })
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Submission failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success-600 bg-success-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-danger-600 bg-danger-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'text-blue-600 bg-blue-50',
      'text-purple-600 bg-purple-50',
      'text-green-600 bg-green-50',
      'text-red-600 bg-red-50',
      'text-indigo-600 bg-indigo-50'
    ]
    return colors[category.length % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Challenge not found</h1>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isSolved = challenge.solvedBy?.includes(user?.username || '')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(challenge.category)}`}>
                    {challenge.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{challenge.points} points</span>
                  </div>
                </div>
              </div>
              {isSolved && (
                <div className="bg-success-100 text-success-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Solved</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-6">
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {challenge.description}{' '}
                  {challenge.link && (
                    <a href={challenge.link} className="text-blue-600 underline ml-1" target="_blank" rel="noopener noreferrer">
                      Solve this here
                    </a>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{challenge.solvedBy?.length || 0} solves</span>
              </div>
            </div>

            {/* Hints Section */}
            {challenge.hints && challenge.hints.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mb-3"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>{showHints ? 'Hide Hints' : 'Show Hints'}</span>
                </button>
                
                {showHints && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Hints:</h4>
                    <ul className="space-y-1">
                      {challenge.hints.map((hint, index) => (
                        <li key={index} className="text-yellow-700 text-sm">
                          {index + 1}. {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Flag Submission */}
            {!isSolved && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Submit Flag
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {message && (
                    <div className={`px-4 py-3 rounded-lg ${
                      message.type === 'success' 
                        ? 'bg-success-50 border border-success-200 text-success-700'
                        : 'bg-danger-50 border border-danger-200 text-danger-700'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      placeholder="Enter the flag here..."
                      className="flex-1 input-field"
                      disabled={submitting}
                    />
                    <button
                      type="submit"
                      disabled={submitting || !flag.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isSolved && (
              <div className="border-t pt-6">
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="font-medium text-success-800">
                      You have already solved this challenge!
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}