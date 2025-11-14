/**
 * User Service
 * Manages user data and Discogs authentication
 *
 * NOTE: Currently uses in-memory storage (Map).
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 */

import { User, PublicUserData } from '../types/user'
import crypto from 'crypto'

class UserService {
  private users: Map<string, User> = new Map()
  private defaultUserId: string

  constructor() {
    // Create a default user for development
    // In production with real auth, users would be created via registration
    this.defaultUserId = this.createDefaultUser()
  }

  /**
   * Create default demo user
   * This simplifies development - in production, users would register
   */
  private createDefaultUser(): string {
    const defaultUser: User = {
      id: crypto.randomUUID(),
      email: 'demo@spaceistheplace.local',
      createdAt: new Date(),
      discogsAuth: null
    }

    this.users.set(defaultUser.id, defaultUser)
    return defaultUser.id
  }

  /**
   * Get default user (for development without full auth system)
   * TODO: Replace with proper session-based user lookup when auth is implemented
   */
  getDefaultUser(): User | null {
    return this.users.get(this.defaultUserId) || null
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | null {
    return this.users.get(userId) || null
  }

  /**
   * Update user's Discogs authentication data
   * Called after successful OAuth flow
   */
  updateDiscogsAuth(
    userId: string,
    discogsAuth: {
      discogsUsername: string
      accessToken: string
      accessTokenSecret: string
    }
  ): User | null {
    const user = this.users.get(userId)
    if (!user) {
      return null
    }

    // Update user with Discogs auth
    user.discogsAuth = {
      ...discogsAuth,
      linkedAt: new Date()
    }

    this.users.set(userId, user)
    return user
  }

  /**
   * Remove Discogs authentication from user
   * Used for "unlinking" Discogs account
   */
  removeDiscogsAuth(userId: string): User | null {
    const user = this.users.get(userId)
    if (!user) {
      return null
    }

    user.discogsAuth = null
    this.users.set(userId, user)
    return user
  }

  /**
   * Convert User to PublicUserData (safe to expose in API)
   * Strips out sensitive OAuth tokens
   */
  toPublicData(user: User): PublicUserData {
    return {
      id: user.id,
      email: user.email,
      discogs: {
        isLinked: !!user.discogsAuth,
        username: user.discogsAuth?.discogsUsername || null
      }
    }
  }

  /**
   * Get public user data by ID
   * Returns safe data without tokens
   */
  getPublicUserData(userId: string): PublicUserData | null {
    const user = this.getUserById(userId)
    if (!user) {
      return null
    }

    return this.toPublicData(user)
  }
}

// Singleton instance
export const userService = new UserService()
