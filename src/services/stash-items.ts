import requestPromise from 'request-promise'

import { fetchStashTabs } from './stash-tabs'
import { RARE_FRAME_TYPE, BASE_URL } from '../constants/appConfig'

export interface StashItem {
  itemLevel: string,
  // TODO: Change to enum
  type: string,
  identified: boolean,
  isRare: boolean
}

const getTypeFrom = ({ icon }: { icon: string }) => {
  if (/\/BodyArmours\//.test(icon)) return 'bodyArmour'
  if (/\/Helmets\//.test(icon)) return 'helmet'
  if (/\/Gloves\//.test(icon)) return 'glove'
  if (/\/Boots\//.test(icon)) return 'boot'
  if (/\/Belts\//.test(icon)) return 'belt'
  if (/\/Amulets\//.test(icon)) return 'amulet'
  if (/\/Rings\//.test(icon)) return 'ring'
  if (/\/OneHandWeapons\//.test(icon)) return 'oneHand'
  if (/\/TwoHandWeapons\//.test(icon)) return 'twoHand'

  return null
}

// TODO: Error catch and typings
const fetchFromStashIndex = async (stashIndex: number,
  { account, league, sessionId }: { account: string, league: string, sessionId: string }) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${BASE_URL}?accountName=${account}&league=${league}&tabIndex=${stashIndex}`),
    headers: {
      Cookie: `POESESSID=${sessionId}`
    }
  })

  const { items: rawItems } = JSON.parse(rawResponse)

  const result: StashItem[] = rawItems.map(rawItem => ({
    itemLevel: rawItem.ilvl,
    type: getTypeFrom(rawItem),
    identified: rawItem.identified,
    isRare: rawItem.frameType === RARE_FRAME_TYPE
  }))

  return result
}

export const fetchStashItems = async (stashIds: string[],
  { account, league, sessionId }: { account: string, league: string, sessionId: string }) => {
  if (!stashIds.length) return []

  const stashTabs = await fetchStashTabs({ league, account, sessionId })

  const stashIndexes = stashTabs.filter(stashTab => stashIds.includes(stashTab.id)).map(stashTab => stashTab.index)

  let stashItems = []
  while (stashIndexes.length) {
    const newStashItems = await fetchFromStashIndex(stashIndexes.shift(), { account, league, sessionId })
    stashItems = stashItems.concat(newStashItems)
  }

  return stashItems
}
