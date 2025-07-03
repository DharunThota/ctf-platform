import { ObjectId } from 'mongodb'

export interface Challenge {
  _id?: ObjectId
  title: string
  description: string
  link: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  flag: string
  hints: string[]
  solvedBy: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ChallengeSubmission {
  _id?: ObjectId
  challengeId: string
  userId: string
  username: string
  submittedFlag: string
  isCorrect: boolean
  submittedAt: Date
}