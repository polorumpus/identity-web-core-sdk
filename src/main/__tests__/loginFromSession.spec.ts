import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient, defineWindowProperty, mockPkceValues, mockPkceWindow } from './testHelpers'
import { toQueryString } from '../../utils/queryString'

beforeEach(() => {
  window.fetch = fetchMock as any

  defineWindowProperty('location')
  defineWindowProperty('crypto', mockPkceWindow)
})

test('loginFromSession with implicit flow', async () => {
  const { api, clientId, domain } = createDefaultTestClient({ sso: true })

  await api.loginFromSession()

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        prompt: 'none',
        scope: 'openid profile email phone',
        display: 'page',
      })
  )
})

test('loginFromSession with authorization code flow', async () => {
  const { api, clientId, domain } = createDefaultTestClient({ sso: true })

  const redirectUri = 'https://mysite.com/login/callback'

  await api.loginFromSession({ redirectUri })

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        prompt: 'none',
        scope: 'openid profile email phone',
        display: 'page',
        ...mockPkceValues,
      })
  )
})
