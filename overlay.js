const TO_HIDE = [
    '.channel-leaderboard',
    '.community-points-summary',
    '.stream-chat-header',
    '.community-highlight-stack__scroll-area--disable',
    '.community-highlight-stack__backlog-card',
    '.chat-input',
    'button[data-a-target="chat-settings"]'
]

let settings = null

const DEFAULT_SETTINGS = {
    open: false,
    darkMode: true,
    theme: {
        darkBackground: {
            red: 31,
            green: 31,
            blue: 35,
        },
        lightBackground: {
            red: 255,
            green: 255,
            blue: 255,
        },
        alpha: 0.25,
    },
    chat: {
        fontSize: 14,
        bold: false,
        opacity: 1.0,
    },
}

// wait until chat area has loaded then init, timeout after 10 seconds
function waitForChat() {
    const timeNow = Date.now()
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.error('Overlay timed out: Failed to find chat in the frame')
            clearInterval(int)
        }
        const chat = document.querySelector('.chat-scrollable-area__message-container')
        if (chat) {
            init()
            clearInterval(int)
        }
    }, 500)
}



function init() {
    getSettingsFromStorage()
    TO_HIDE.forEach(query => displayNoneObserver(document.body, query, query.includes('community-highlight') ? false : true))
}


// Load settings from storage if exists otherwise set default settings
function getSettingsFromStorage() {
    chrome.storage.sync.get(['overlaySettings'], function (result) {
        if (result && Object.keys(result).length === 0) {
            settings = DEFAULT_SETTINGS
        } else {
            settings = result.overlaySettings
        }
        document.body.overlaySettings = settings
        InsertSettings()
    })
}

// Add settings component to chat input container
function InsertSettings() {
    let chatSIContainer = document.querySelector('.chat-input')
    chatSIContainer.classList.add('chat-settings-and-input-container')

    let chatInput = chatSIContainer.querySelector('.chat-input__buttons-container').parentElement
    chatInput.className = 'chat-input-container'

    chatSIContainer.appendChild(buildOverlaySettings())
    updateSettings()
}


// Animate the settings component
function animateShowSettingsComponent() {
    var elem = document.querySelector('.overlay-settings-container')
    var pos = 0
    let start = elem.offsetTop
    var id = setInterval(frame, 10)
    let moveDistance = elem.offsetHeight
    function frame() {
        if (pos >= moveDistance) {
            clearInterval(id)
        } else {
            pos += 10
            elem.style.top = settings.open ? `${start + pos}px` : `${start - pos}px`
        }
    }
    settings.open = start === 0 ? false : true
}


// Build overlay settings component
function buildOverlaySettings() {
    let settingsWrapper = document.createElement('div')
    settingsWrapper.className = 'settings-wrapper'

    let overlaySettingsContainer = document.createElement('div')
    overlaySettingsContainer.className = 'overlay-settings-container'

    let settingsButtonContainer = document.createElement('div')
    settingsButtonContainer.className = 'settings-btn-container'

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let settingsButton = document.createElement('button')
    settingsButton.className = 'settings-button tw-core-button jeBpig tw-core-button--primary  tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium'
    settingsButton.setAttribute('aria-label', 'Overlay Settings')
    settingsButton.onclick = animateShowSettingsComponent

    let label = document.createElement('i')
    label.className = 'fas fa-cog tw-core-button-label xsINH'

    settingsButton.appendChild(label)
    overlaySettingsContainer.appendChild(stylesheet)
    settingsButtonContainer.appendChild(settingsButton)

    let subContainer = document.createElement('div')
    subContainer.className = 'settings-sub-container'

    subContainer.appendChild(buildAlphaSlider())
    subContainer.appendChild(buildOpacitySlider())
    subContainer.appendChild(buildFontSlider())
    subContainer.appendChild(buildBoldChatToggle())
    subContainer.appendChild(buildDarkthemeToggle())

    overlaySettingsContainer.appendChild(subContainer)
    overlaySettingsContainer.appendChild(settingsButtonContainer)

    settingsWrapper.appendChild(overlaySettingsContainer)

    return settingsWrapper
}


// Build the toggle dark mode setting
function buildDarkthemeToggle() {
    let tglContainer = document.createElement('div')
    tglContainer.className = 'setting-container'

    let twToggle = document.createElement('div')
    twToggle.className = 'tw-toggle'

    let text = document.createElement('div')
    text.className = 'setting-label'
    text.innerHTML = 'Dark Mode'

    let input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = settings.darkMode
    input.className = 'tw-toggle__input'
    input.id = 'overlay-chat-settings-dark-mode'
    input.setAttribute('data-a-target', 'tw-toggle')
    input.onchange = function () {
        if (this.checked) {
            settings.darkMode = true
            updateSettings()
        } else {
            settings.darkMode = false
            updateSettings()
        }
    }

    let label = document.createElement('label')
    label.className = 'tw-toggle__button'
    label.setAttribute('for', 'overlay-chat-settings-dark-mode')

    twToggle.appendChild(input)
    twToggle.appendChild(label)

    tglContainer.appendChild(text)
    tglContainer.appendChild(twToggle)

    return tglContainer
}


// Build Chunky Chat toggle setting component
function buildBoldChatToggle() {
    let tglContainer = document.createElement('div')
    tglContainer.className = 'setting-container'

    let twToggle = document.createElement('div')
    twToggle.className = 'tw-toggle'

    let text = document.createElement('div')
    text.className = 'setting-label'
    text.innerHTML = 'Chunky Chat'

    let input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = settings.chat.bold
    input.className = 'tw-toggle__input'
    input.id = 'overlay-chat-settings-embolden'
    input.setAttribute('data-a-target', 'tw-toggle')
    input.onchange = function () {
        if (this.checked) {
            settings.chat.bold = true
            updateSettings()
        } else {
            settings.chat.bold = false
            updateSettings()
        }
    }

    let label = document.createElement('label')
    label.className = 'tw-toggle__button'
    label.setAttribute('for', 'overlay-chat-settings-embolden')

    twToggle.appendChild(input)
    twToggle.appendChild(label)

    tglContainer.appendChild(text)
    tglContainer.appendChild(twToggle)

    return tglContainer
}


// Toggle dark theme on/off
function toggleThemeDark(darkMode) {
    if (darkMode) {
        document.documentElement.classList.remove('tw-root--theme-light')
        document.documentElement.classList.add('tw-root--theme-dark')
    } else {
        document.documentElement.classList.remove('tw-root--theme-dark')
        document.documentElement.classList.add('tw-root--theme-light')
    }
}


// Build font slider setting
function buildFontSlider() {
    let fontSliderContainer = document.createElement('div')
    fontSliderContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'Font Size'

    let fontSlider = document.createElement('input')
    fontSlider.type = 'range'
    fontSlider.min = '8'
    fontSlider.max = '30'
    fontSlider.value = settings.chat.fontSize
    fontSlider.className = 'font-slider slider'
    fontSlider.oninput = function () {
        settings.chat.fontSize = this.value
        updateSettings()
    }

    fontSliderContainer.appendChild(label)
    fontSliderContainer.appendChild(fontSlider)

    return fontSliderContainer
}


// Build alpha slider setting
function buildAlphaSlider() {
    let alphaSliderContainer = document.createElement('div')
    alphaSliderContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'BG Opacity'

    let alphaSlider = document.createElement('input')
    alphaSlider.type = 'range'
    alphaSlider.min = '1'
    alphaSlider.max = '100'
    alphaSlider.value = settings.theme.alpha * 100
    alphaSlider.className = 'alpha-slider slider'
    alphaSlider.oninput = function () {
        settings.theme.alpha = (this.value / 100)
        updateSettings()
    }

    alphaSliderContainer.appendChild(label)
    alphaSliderContainer.appendChild(alphaSlider)

    return alphaSliderContainer
}


// Build opacity slider setting
function buildOpacitySlider() {
    let opacitySliderContainer = document.createElement('div')
    opacitySliderContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'Chat Opacity'

    let opacitySlider = document.createElement('input')
    opacitySlider.type = 'range'
    opacitySlider.min = '1'
    opacitySlider.max = '100'
    opacitySlider.value = settings.chat.opacity * 100
    opacitySlider.className = 'opacity-slider slider'
    opacitySlider.oninput = function () {
        settings.chat.opacity = this.value / 100
        updateSettings()
    }

    opacitySliderContainer.appendChild(label)
    opacitySliderContainer.appendChild(opacitySlider)

    return opacitySliderContainer
}


// Update overlay styles with settings
function updateSettings() {
    let messageContainer = document.querySelector('.chat-scrollable-area__message-container')
    let chatRoom = document.querySelector('.chat-room')
    let messageArea = document.querySelector('.chat-scrollable-area__message-container')
    let chatList = document.querySelector('.chat-list--other')
    let scrollBar = document.querySelector('.simplebar-scrollbar')
    let overlaySettingsContainer = document.querySelector('.overlay-settings-container')

    let darkMode = settings.darkMode
    let { red, green, blue } = darkMode ? settings.theme.darkBackground : settings.theme.lightBackground
    let alpha = settings.theme.alpha
    let { fontSize, bold, opacity } = settings.chat

    toggleThemeDark(darkMode)
    messageContainer.setAttribute('style', `font-size: ${fontSize}px !important`)
    messageContainer.style.fontWeight = bold ? 'bold' : 'normal'
    messageArea.style.opacity = opacity
    scrollBar.style.opacity = alpha
    chatRoom.setAttribute('style', `background-color: rgba(${red},${green},${blue},${alpha}) !important;`)
    overlaySettingsContainer.style.backgroundColor = `rgb(${red},${green},${blue})`

    chrome.storage.sync.set({ 'overlaySettings': settings })
    document.body.overlaySettings = settings
}


// Hide elements we don't want to see on overlay as they appear
function displayNoneObserver(parent, query, stopLooking = true) {
    let observer = new MutationObserver(function (mutationsList, observer) {

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    let element = parent.querySelector(`${query}`)
                    if (element) {
                        element.classList.add(`${query.charAt(0) === '.' ? query.substring(1) : 'class'}_hide`)
                        element.classList.remove('tw-flex')
                        element.classList.remove('tw-block')
                        element.classList.remove('tw-inline-flex')
                        if (stopLooking) observer.disconnect()
                    }
                })
            }
        }
    })
    const config = { attributes: true, childList: true, subtree: true }
    observer.observe(parent, config)
}


waitForChat()