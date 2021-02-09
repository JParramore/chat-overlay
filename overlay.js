const TO_HIDE = [
    'channel-leaderboard',
    'community-points-summary',
    'stream-chat-header',
    'community-highlight-stack__scroll-area--disable',
    'community-highlight-stack__backlog-card',
    'chat-input'
]

let settings = {
    background: {
        red: 31,
        green: 31,
        blue: 35,
        alpha: 0.25,
    },
    chat: {
        fontSize: 14,
        opacity: 1.0
    }
}


function waitForChat() {
    const timeNow = Date.now();
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            clearInterval(int);
        }
        const chat = document.querySelector('.chat-scrollable-area__message-container')
        if (chat) {
            init();
            clearInterval(int);
        }
    }, 500);
}

function init() {
    document.body.settings = settings
    TO_HIDE.forEach(className => displayNoneObserver(document.body, className))
    insertOverlaySettings()
}

// Build and append overlay settings to overlay
function insertOverlaySettings() {
    let chatSettingsBar = document.querySelector('.chat-input__buttons-container')

    let overlaySettingsContainer = document.createElement('div')
    overlaySettingsContainer.className = "overlay-settings-container"

    let subSettingsContainerOne = document.createElement('div')
    let subSettingsContainerTwo = document.createElement('div')
    subSettingsContainerOne.className = 'settings-sub-container'
    subSettingsContainerTwo.className = 'settings-sub-container'

    subSettingsContainerOne.appendChild(buildAlphaSlider())
    subSettingsContainerOne.appendChild(buildOpacitySlider())

    subSettingsContainerTwo.appendChild(buildFontSlider())
    subSettingsContainerTwo.appendChild(buildDarkthemeToggle())

    overlaySettingsContainer.appendChild(subSettingsContainerOne)
    overlaySettingsContainer.appendChild(subSettingsContainerTwo)

    chatSettingsBar.prepend(overlaySettingsContainer)
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
    input.checked = true
    input.className = 'tw-toggle__input'
    input.id = 'overlay-chat-settings-dark-mode'
    input.setAttribute('data-a-target', 'tw-toggle')
    input.onchange = function () {
        if (this.checked) {
            toggleThemeDark(true)
            let a = settings.background.alpha
            settings.background = { red: 31, green: 31, blue: 35, alpha: a }
            updateSettings()
        } else {
            toggleThemeDark(false)
            let a = settings.background.alpha
            settings.background = { red: 255, green: 255, blue: 255, alpha: a }
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


// Update overlay styles with settings
function updateSettings() {
    let messageContainer = document.querySelector('.chat-scrollable-area__message-container')
    let chatRoom = document.querySelector('.chat-room')
    let messageArea = document.querySelector('.chat-scrollable-area__message-container')

    let { red, green, blue, alpha } = settings.background
    let { fontSize, opacity } = settings.chat

    messageContainer.style.fontSize = `${fontSize}px`
    messageArea.style.opacity = opacity
    chatRoom.setAttribute('style', `background-color: rgba(${red},${green},${blue},${alpha}) !important`)

    document.body.settings = settings
    console.dir(document)
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
    fontSlider.value = '14'
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
    alphaSlider.value = '25'
    alphaSlider.className = 'alpha-slider slider'
    alphaSlider.oninput = function () {
        settings.background.alpha = (this.value / 100)
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
    opacitySlider.value = '25'
    opacitySlider.className = 'opacity-slider slider'
    opacitySlider.oninput = function () {
        settings.chat.opacity = this.value / 100
        updateSettings()
    }

    opacitySliderContainer.appendChild(label)
    opacitySliderContainer.appendChild(opacitySlider)

    return opacitySliderContainer
}


// Hide elements we don't want to see on overlay as they appear
function displayNoneObserver(parent, className, stopLooking = true) {
    let observer = new MutationObserver(function (mutationsList, observer) {

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    let element = parent.querySelector(`.${className}`)
                    if (element) {
                        element.classList.add(`${className}_hide`)
                        element.classList.remove('tw-flex')
                        element.classList.remove('tw-block')
                        observer.disconnect()
                    }
                })
            }
        }
    });
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(parent, config);
}


waitForChat()