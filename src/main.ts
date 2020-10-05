import { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron'
import settings from 'electron-settings'
import * as path from 'path'

import { DEVTOOL_OPTIONS } from './constants/dev'
import { OVERLAY_SIZE } from './constants/appConfig'

let overlayWindow: BrowserWindow
let settingsWindow: BrowserWindow
let debug = true //process.argv[2] === 'debug'

function createOverlayWindow() {
  const windowOptions: BrowserWindowConstructorOptions = {
    height: 70,
    width: 450,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
  }

  if (settings.has('overlay.size')) {
    // @ts-ignore:
    const { height, width } = OVERLAY_SIZE[settings.get('overlay.size')]
    windowOptions.height = height
    windowOptions.width = width
  }

  if (settings.has('position')) {
    windowOptions.x = Number(settings.get('position.x'))
    windowOptions.y = Number(settings.get('position.y'))
  }

  overlayWindow = new BrowserWindow(windowOptions)

  overlayWindow.loadFile('./ui/overlay.html')

  overlayWindow.setMenu(null)

  // @ts-ignore:
  overlayWindow.on('closed', () => overlayWindow = null)

  overlayWindow.on('move', () => {
    const [x, y] = overlayWindow.getPosition()
    settings.set('position', { x, y })
  })

  if (debug) {
    overlayWindow.webContents.openDevTools(DEVTOOL_OPTIONS)
  }
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: Number(settings.get('position.x')),
    y: Number(settings.get('position.y')),
    modal: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // settingsWindow.loadFile('./ui/settings.html')
  settingsWindow.loadFile(path.join(__dirname, './ui/settings.html'))

  settingsWindow.setMenu(null)

  settingsWindow.on('closed', () => {
    // @ts-ignore:
    overlayWindow.send('forceChaosRecipeRefresh')
    settingsWindow = null
  })

  if (debug) settingsWindow.webContents.openDevTools(DEVTOOL_OPTIONS)
}

app.on('ready', () => {
  createOverlayWindow()
  createSettingsWindow()
})

app.on('window-all-closed', () => app.quit())

ipcMain.on('overlay-size-changed', () => {
  // @ts-ignore:
  const { height, width } = OVERLAY_SIZE[settings.get('overlay.size')]
  overlayWindow.setBounds({ width, height })
})

ipcMain.on('open-options', () => {
  if (!settingsWindow) {
    createSettingsWindow()
    settingsWindow.show()
  }
})
