/**
 * Discogs OAuth 1.0a Client
 * Handles the complete OAuth flow for multi-user authentication
 *
 * SECURITY:
 * - Never logs or exposes consumer secrets or access tokens
 * - Uses HMAC-SHA1 for OAuth signatures
 * - All requests include custom User-Agent header
 */

import crypto from 'crypto'
import axios, { AxiosError } from 'axios'

const DISCOGS_CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY
const DISCOGS_CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET
const DISCOGS_USER_AGENT = process.env.DISCOGS_USER_AGENT || 'SpaceIsThePlace/1.0'

if (!DISCOGS_CONSUMER_KEY || !DISCOGS_CONSUMER_SECRET) {
  console.warn(
    'WARNING: DISCOGS_CONSUMER_KEY and DISCOGS_CONSUMER_SECRET are not set. OAuth flow will not work.'
  )
}

interface RequestTokenResponse {
  oauthToken: string
  oauthTokenSecret: string
  authorizeUrl: string
}

interface AccessTokenResponse {
  accessToken: string
  accessTokenSecret: string
}

interface DiscogsIdentity {
  username: string
  id: number
  resource_url: string
}

export class DiscogsOAuthClient {
  private readonly baseUrl = 'https://api.discogs.com'
  private readonly authorizeUrl = 'https://www.discogs.com/oauth/authorize'

  /**
   * Generate OAuth 1.0a nonce (random string)
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Get current Unix timestamp
   */
  private getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
  }

  /**
   * Generate OAuth 1.0a signature using HMAC-SHA1
   */
  private generateSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret: string = ''
  ): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join('&')

    // Create signature base string
    const signatureBaseString = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(sortedParams)
    ].join('&')

    // Create signing key
    const signingKey = `${this.percentEncode(DISCOGS_CONSUMER_SECRET || '')}&${this.percentEncode(tokenSecret)}`

    // Generate HMAC-SHA1 signature
    const hmac = crypto.createHmac('sha1', signingKey)
    hmac.update(signatureBaseString)
    return hmac.digest('base64')
  }

  /**
   * Percent-encode string according to RFC 3986
   */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
  }

  /**
   * Build OAuth Authorization header
   */
  private buildAuthHeader(params: Record<string, string>): string {
    const headerParams = Object.entries(params)
      .map(([key, value]) => `${this.percentEncode(key)}="${this.percentEncode(value)}"`)
      .join(', ')

    return `OAuth ${headerParams}`
  }

  /**
   * Step 1: Get request token
   * Initiates the OAuth flow by obtaining a request token from Discogs
   */
  async getRequestToken(callbackUrl: string): Promise<RequestTokenResponse> {
    if (!DISCOGS_CONSUMER_KEY || !DISCOGS_CONSUMER_SECRET) {
      throw new Error('OAuth credentials not configured')
    }

    const url = `${this.baseUrl}/oauth/request_token`
    const method = 'GET'

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: DISCOGS_CONSUMER_KEY,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: this.getTimestamp(),
      oauth_callback: callbackUrl
    }

    // Generate signature
    const signature = this.generateSignature(method, url, oauthParams)
    oauthParams.oauth_signature = signature

    // Build authorization header
    const authHeader = this.buildAuthHeader(oauthParams)

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader,
          'User-Agent': DISCOGS_USER_AGENT
        }
      })

      // Parse response (URL-encoded format)
      const params = new URLSearchParams(response.data)
      const oauthToken = params.get('oauth_token')
      const oauthTokenSecret = params.get('oauth_token_secret')

      if (!oauthToken || !oauthTokenSecret) {
        throw new Error('Invalid response from Discogs: missing oauth tokens')
      }

      return {
        oauthToken,
        oauthTokenSecret,
        authorizeUrl: `${this.authorizeUrl}?oauth_token=${oauthToken}`
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        console.error('Discogs OAuth request token error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        })
        throw new Error(
          `Failed to get request token: ${axiosError.response?.status || 'Network error'}`
        )
      }
      throw error
    }
  }

  /**
   * Step 2: Get access token
   * Exchanges the authorized request token for an access token
   */
  async getAccessToken(
    oauthToken: string,
    oauthTokenSecret: string,
    verifier: string
  ): Promise<AccessTokenResponse> {
    if (!DISCOGS_CONSUMER_KEY || !DISCOGS_CONSUMER_SECRET) {
      throw new Error('OAuth credentials not configured')
    }

    const url = `${this.baseUrl}/oauth/access_token`
    const method = 'POST'

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: DISCOGS_CONSUMER_KEY,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: this.getTimestamp(),
      oauth_token: oauthToken,
      oauth_verifier: verifier
    }

    // Generate signature using token secret
    const signature = this.generateSignature(method, url, oauthParams, oauthTokenSecret)
    oauthParams.oauth_signature = signature

    // Build authorization header
    const authHeader = this.buildAuthHeader(oauthParams)

    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: authHeader,
          'User-Agent': DISCOGS_USER_AGENT
        }
      })

      // Parse response
      const params = new URLSearchParams(response.data)
      const accessToken = params.get('oauth_token')
      const accessTokenSecret = params.get('oauth_token_secret')

      if (!accessToken || !accessTokenSecret) {
        throw new Error('Invalid response from Discogs: missing access tokens')
      }

      return {
        accessToken,
        accessTokenSecret
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        console.error('Discogs OAuth access token error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        })
        throw new Error(
          `Failed to get access token: ${axiosError.response?.status || 'Network error'}`
        )
      }
      throw error
    }
  }

  /**
   * Step 3: Get user identity
   * Retrieves the authenticated user's Discogs identity
   */
  async getIdentity(accessToken: string, accessTokenSecret: string): Promise<DiscogsIdentity> {
    if (!DISCOGS_CONSUMER_KEY || !DISCOGS_CONSUMER_SECRET) {
      throw new Error('OAuth credentials not configured')
    }

    const url = `${this.baseUrl}/oauth/identity`
    const method = 'GET'

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: DISCOGS_CONSUMER_KEY,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: this.getTimestamp(),
      oauth_token: accessToken
    }

    // Generate signature using access token secret
    const signature = this.generateSignature(method, url, oauthParams, accessTokenSecret)
    oauthParams.oauth_signature = signature

    // Build authorization header
    const authHeader = this.buildAuthHeader(oauthParams)

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader,
          'User-Agent': DISCOGS_USER_AGENT
        }
      })

      const { username, id, resource_url } = response.data

      if (!username || !id) {
        throw new Error('Invalid identity response from Discogs')
      }

      return {
        username,
        id,
        resource_url
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        console.error('Discogs OAuth identity error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        })
        throw new Error(
          `Failed to get user identity: ${axiosError.response?.status || 'Network error'}`
        )
      }
      throw error
    }
  }
}

export const discogsOAuthClient = new DiscogsOAuthClient()
