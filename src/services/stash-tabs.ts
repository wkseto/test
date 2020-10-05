import requestPromise from 'request-promise'

import { BASE_URL, VALID_TYPES } from '../constants/appConfig'

export interface StashTab {
  id: string,
  index: number,
  name: string,
  colorCss: string,
  // TODO: Figure out why we filter out standart tab
  isValid: boolean
}

// TODO: Error catch and typings
export const fetchStashTabs = async ({ account, league, sessionId }:
  { account: string, league: string, sessionId: string }) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${BASE_URL}?accountName=${account}&league=${league}&tabs=1`),
    headers: {
      Cookie: `POESESSID=${sessionId}`
    }
  })

  const { tabs } = JSON.parse(rawResponse)

  const result: StashTab[] = tabs.map((tab: any) => ({
    id: tab.id,
    index: tab.i,
    name: tab.n,
    colorCss: `rgb(${tab.colour.r}, ${tab.colour.g}, ${tab.colour.b})`,
    isValid: VALID_TYPES.includes(tab.type)
  }))

  return result
}
