import requestPromise from 'request-promise'

import { LEAGUE_API_URL, FALLBACK_LEAGUE } from '../constants/appConfig'

// TODO: Error catch
export const fetchActiveLeagues = async () => {
  const rawResponse = await requestPromise({
    uri: LEAGUE_API_URL
  })

  const leagues = JSON.parse(rawResponse)

  return leagues.map(({ id }: { id: string }) => id)
}

// TODO: Error catch and typings
export const fetchCurrentLeague = async (leagueSetting: any) => {
  const validLeagues = await fetchActiveLeagues()

  return validLeagues.includes(leagueSetting) ? leagueSetting : FALLBACK_LEAGUE
}
