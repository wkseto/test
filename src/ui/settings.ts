// Vendor
import ipcRenderer from 'electron'
import settings from 'electron-settings'

import { fetchStashTabs } from '../services/stash-tabs'
import { fetchActiveLeagues } from '../services/active-leagues'

const refreshStashTabs = async () => {
  // @ts-ignore
  const { league, account, sessionId } = settings.get('user')
  if (!league || !account || !sessionId) return;

  const selectedStashIds = settings.get('user.stashIds') || []
  const tabsElement = document.getElementById('tabs')

  try {
    const stashTabs = await fetchStashTabs({ league, account, sessionId })

    const tabsHtml = stashTabs.reduce((acc, stashTab) => {
      // @ts-ignore
      const isSelected = selectedStashIds.includes(stashTab.id)

      return acc + `
      <button
        class="d-flex align-items-center justify-content-left btn btn-${isSelected ? 'success' : 'primary'} btn-block"
        data-id="${stashTab.id}"
        ${!stashTab.isValid && 'disabled'}
      >
        <div class="stash-color" style="background-color: ${stashTab.colorCss}"></div>
        ${stashTab.name}
      </button>      
    `
    }, '')

    tabsElement.innerHTML = `
      <label>Stash tabs to scan</label>
      ${tabsHtml}
    `
  } catch (error) {
    tabsElement.innerHTML = `
      <div class="alert alert-danger">
        <h4 class="alert-heading">Something went wrong 😬</h4>
        <p>${error.options.uri}</p>
        <p>Status: ${error.statusCode}</p>
      </div>
    `
  }
}

document.getElementById('tabs').onclick = (event) => {
  const stashButtonElement = event.srcElement
  // @ts-ignore
  const stashTabId = stashButtonElement.dataset.id
  if (!stashTabId) return

  const selectedStashIds = settings.get('user.stashIds') || []
  // @ts-ignore
  const selectedIndex = selectedStashIds.indexOf(stashTabId)

  if (selectedIndex > -1) {
    // @ts-ignore
    selectedStashIds.splice(selectedIndex, 1)
  } else {
    // @ts-ignore
    selectedStashIds.push(stashTabId)
  }

  // @ts-ignore
  stashButtonElement.classList.toggle('btn-primary')
  // @ts-ignore
  stashButtonElement.classList.toggle('btn-success')
  settings.set('user.stashIds', selectedStashIds)
};

const leagueSelectElement = document.getElementById('league-select');
fetchActiveLeagues().then((activeLeagues) => {
  // @ts-ignore
  activeLeagues.forEach((league) => {
    const leagueOption = document.createElement('option');
    leagueOption.value = league;
    leagueOption.text = league;

    // @ts-ignore
    leagueSelectElement.add(leagueOption)
  })

  // @ts-ignore
  leagueSelectElement.value = settings.get('user.league')
})

// @ts-ignore
leagueSelectElement.onchange = async ({ srcElement: { value } }) => {
  settings.set('user.league', value)
  settings.set('user.stashIds', [])
  refreshStashTabs()
}

const accountInputElement = document.getElementById('account-input')
// @ts-ignore
accountInputElement.value = settings.get('user.account') || ''
// @ts-ignore
accountInputElement.oninput = async ({ srcElement: { value } }) => {
  settings.set('user.account', value)
  refreshStashTabs()
}

const sessionIdInputElement = document.getElementById('session-id-input')
// @ts-ignore
sessionIdInputElement.value = settings.get('user.sessionId') || ''
// @ts-ignore
sessionIdInputElement.oninput = async ({ srcElement: { value } }) => {
  settings.set('user.sessionId', value)
  refreshStashTabs()
}

const RefreshTimeInputElement = document.getElementById('refresh-time-input')
// @ts-ignore
RefreshTimeInputElement.value = settings.get('overlay.refreshTime') || 30
// @ts-ignore
RefreshTimeInputElement.oninput = async ({ srcElement: { value } }) => {
  settings.set('overlay.refreshTime', value)
}

const OverlaySizeSelectElement = document.getElementById('overlay-size-select')
// @ts-ignore
OverlaySizeSelectElement.value = settings.get('overlay.size') || 1
// @ts-ignore
OverlaySizeSelectElement.onchange = async ({ srcElement: { value } }) => {
  settings.set('overlay.size', value)
  // @ts-ignore
  ipcRenderer.send('overlay-size-changed')
}

refreshStashTabs()
