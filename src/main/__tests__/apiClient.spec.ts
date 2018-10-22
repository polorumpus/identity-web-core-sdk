import 'core-js/shim'
import 'regenerator-runtime/runtime'
import ApiClient, { Events } from '../apiClient'
import { toQueryString } from '../../lib/queryString'
import fetchMock from 'jest-fetch-mock'
import winchanMocker from './winchanMocker'
import { delay } from '../../lib/promise'
import EventManager from '../eventManager'


const clientId = 'zdfuh'

function apiClient(config = {}) {
  const eventManager = new EventManager<Events>()

  return new ApiClient({
    clientId: clientId,
    domain: 'local.reach5.net',
    ...config
  }, eventManager)
}

beforeEach(() => {
  window.location.assign = jest.fn()
  window.fetch = fetchMock
  fetchMock.resetMocks()
  winchanMocker.reset()
})

describe('getSsoData', () => {
  test('with id_token_hint', async () => {
    expect.assertions(2)

    // Given
    const client = apiClient()

    const apiResponse = {
      'name': 'John Doe',
      'email': 'john.doe@example.com',
      'last_login_type': 'password',
      'is_authenticated': true,
      'has_password': true,
      'social_providers': []
    }
    const ssoDataCall = fetchMock.mockResponseOnce(JSON.stringify(apiResponse))

    const idTokenHint = 'idtokencontent'

    // When
    const result = await client.getSsoData({ idTokenHint })

    // Then
    expect(ssoDataCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/sso/data?' + toQueryString({
      'client_id': clientId,
      'id_token_hint': idTokenHint
    }), {
        method: 'GET',
        headers: {}
      })

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })

  test('with login_hint', async () => {
    // Given
    const client = apiClient()

    const apiResponse = {
      'name': 'John Doe',
      'email': 'john.doe@example.com',
      'last_login_type': 'password',
      'is_authenticated': true,
      'has_password': true,
      'social_providers': []
    }
    const ssoDataCall = fetchMock.mockResponseOnce(JSON.stringify(apiResponse))

    const loginHint = 'loginhintcontent'

    // When
    const result = await client.getSsoData({ loginHint })

    // Then
    expect(ssoDataCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/sso/data?' + toQueryString({
      'client_id': clientId,
      'login_hint': loginHint
    }), {
        method: 'GET',
        headers: {}
      })

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })

  test('with sso cookie', async () => {
    const client = apiClient({ sso: true })

    const ssoDataCall = fetchMock.mockResponseOnce(JSON.stringify({
      'name': 'John Doe',
      'email': 'john.doe@example.com',
      'last_login_type': 'password',
      'is_authenticated': true,
      'has_password': true,
      'social_providers': []
    }))

    // When
    const result = await client.getSsoData()

    // Then
    expect(ssoDataCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/sso/data?' + toQueryString({
      'client_id': clientId
    }), {
        method: 'GET',
        headers: {},
        credentials: 'include'
      })

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })

  test('with sso cookie and id_token_hint', async () => {

    const client = apiClient({ sso: true })

    const ssoDataCall = fetchMock.mockResponseOnce(JSON.stringify({
      'name': 'John Doe',
      'email': 'john.doe@example.com',
      'last_login_type': 'password',
      'is_authenticated': true,
      'has_password': true,
      'social_providers': []
    }))

    const idTokenHint = 'idtokencontent'

    // When
    const result = await client.getSsoData({ idTokenHint })

    // Then
    expect(ssoDataCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/sso/data?' + toQueryString({
      'client_id': clientId,
      'id_token_hint': idTokenHint
    }), {
        method: 'GET',
        headers: {},
        credentials: 'include'
      })

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })

  test('take into account only "id_token_hint" and "login_hint" params', async () => {
    // Given
    const client = apiClient()

    const apiResponse = {
      'name': 'John Doe',
      'email': 'john.doe@example.com',
      'last_login_type': 'password',
      'is_authenticated': true,
      'has_password': true,
      'social_providers': []
    }
    const ssoDataCall = fetchMock.mockResponseOnce(JSON.stringify(apiResponse))

    const idTokenHint = 'idtokencontent'

    // When
    const result = await client.getSsoData({
      idTokenHint,
      responseType: 'code',
      redirectUri: 'https://mysite.com/login/callback'
    })

    // Then
    expect(ssoDataCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/sso/data?' + toQueryString({
      'client_id': clientId,
      'id_token_hint': idTokenHint
    }), {
        method: 'GET',
        headers: {}
      })

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })
})

describe('loginFromSession', () => {
  test('with id_token_hint', async () => {
    expect.assertions(1)

    // Given
    const client = apiClient()
    const idTokenHint = 'idtokencontent'

    // When
    await client.loginFromSession({ idTokenHint })

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'id_token_hint': idTokenHint,
        'prompt': 'none'
      })
    )
  })

  test('with code authorization', async () => {
    // Given
    const client = apiClient()
    const redirectUri = 'https://mysite/login/callback'
    const idTokenHint = 'idtokencontent'

    // When
    await client.loginFromSession({
      idTokenHint,
      redirectUri
    })

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'code',
        'scope': 'openid profile email phone',
        'display': 'page',
        'redirect_uri': redirectUri,
        'id_token_hint': idTokenHint,
        'prompt': 'none'
      })
    )
  })

  test('with sso cookie', async () => {
    // Given
    const client = apiClient({ sso: true })

    // When
    await client.loginFromSession()

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'prompt': 'none'
      })
    )
  })

  test('should throw an exception, when sso is disabled, and no id token is sent', async () => {
    // Given
    const client = apiClient({ sso: false })

    // When
    try {
      await client.loginFromSession()
    } catch (e) {
      // Then
      expect(e).toEqual(
        new Error("Cannot call 'loginFromSession' without 'idTokenHint' parameter if SSO is not enabled.")
      )
    }
  })

  test('popup mode is ignored', async () => {
    // Given
    const client = apiClient()
    const idTokenHint = 'idtokencontent'

    // When
    await client.loginFromSession({
      idTokenHint,
      popupMode: true
    })

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'id_token_hint': idTokenHint,
        'prompt': 'none'
      })
    )
  })
})

describe('parseUrlFragment', () => {

  test('with success url', async () => {
    expect.assertions(3)

    // Given
    const client = apiClient()

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    client.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    client.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = client.parseUrlFragment('https://example.com/login/callback#' + [
      `id_token=${idToken}`,
      `access_token=${accessToken}`,
      `expires_in=${expiresIn}`,
      `token_type=${tokenType}`
    ].join('&'))

    await delay(1)

    // Then
    expect(result).toBe(true)
    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
    expect(authenticationFailedHandler).not.toHaveBeenCalled()
  })

  test('with error url', async () => {
    expect.assertions(3)

    // Given
    const client = apiClient()

    const error = 'invalid_grant'
    const errorDescription = 'Invalid email or password'
    const errorUsrMsg = 'Invalid email or password'

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    client.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    client.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = client.parseUrlFragment('https://example.com/login/callback#' + [
      `error=${error}`,
      `error_description=${errorDescription}`,
      `error_usr_msg=${errorUsrMsg}`
    ].join('&'))

    await delay(1)

    // Then
    expect(result).toBe(true)
    expect(authenticatedHandler).not.toHaveBeenCalled()
    expect(authenticationFailedHandler).toHaveBeenCalledWith({
      error,
      errorDescription,
      errorUsrMsg
    })
  })

  test('with url to be ignored', async () => {
    expect.assertions(3)

    // Given
    const client = apiClient()

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    client.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    client.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = client.parseUrlFragment('https://example.com/login/callback#toto=tutu')

    await delay(1)

    // Then
    expect(result).toBe(false)
    expect(authenticatedHandler).not.toHaveBeenCalled()
    expect(authenticationFailedHandler).not.toHaveBeenCalled()
  })
})