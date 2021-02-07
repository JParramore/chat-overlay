const TO_HIDE = [
    'channel-leaderboard',
    'community-points-summary',
    'stream-chat-header',
    'community-highlight-stack__scroll-area--disable',
    'community-highlight-stack__backlog-card',
    'chat-input'
]

function waitForChat() {
    const timeNow = Date.now();
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.log('Could not find video')
            clearInterval(int);
        }
        const chat = document.querySelector('.chat-scrollable-area__message-container')
        if (chat) {
            console.log("chat connected")
            init();
            clearInterval(int);
        }
    }, 500);
}

function init() {
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


// TODO FIX
function buildDarkthemeToggle() { 
    let chatRoom = document.querySelector('.chat-room')

    let tglContainer = document.createElement('div')
    tglContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'Dark/Light'

    let tag = document.createElement('label')
    tag.className = 'toggle-button'

    let input = document.createElement('input')
    input.type = 'checkbox'
    input.onchange = function() {
        if (this.checked) {
            console.log(chatRoom.style.backgroundColor)
            chatRoom.setAttribute('style', `background-color: rgb(31,31,35) !important`)
            document.body.style.color = "#FFFFFF !important"
        } else {
            console.log(chatRoom.style.backgroundColor)
            chatRoom.setAttribute('style', `background-color: rgb(255,255,255) !important`)
            document.body.style.color = "rgb(31,31,35) !important"
        }
    }

    let span = document.createElement('span')
    span.className = 'toggle-slider'

    tag.appendChild(input)
    tag.appendChild(span)
    tglContainer.appendChild(label)
    tglContainer.appendChild(tag)

    return tglContainer
}


// Build font slider setting
function buildFontSlider() {
    let messageContainer = document.querySelector('.chat-scrollable-area__message-container')

    let fontSliderContainer = document.createElement('div')
    fontSliderContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'Font'

    let fontSlider = document.createElement('input')
    fontSlider.type = 'range'
    fontSlider.min = '8'
    fontSlider.max = '30'
    fontSlider.value = '12'
    fontSlider.className = 'font-slider slider'
    fontSlider.oninput = function () {
        messageContainer.style.fontSize = `${this.value}px`
    }

    fontSliderContainer.appendChild(label)
    fontSliderContainer.appendChild(fontSlider)

    return fontSliderContainer
}


// Build alpha slider setting
function buildAlphaSlider() {
    let chatRoom = document.querySelector('.chat-room')

    let alphaSliderContainer = document.createElement('div')
    alphaSliderContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'Alpha'

    let alphaSlider = document.createElement('input')
    alphaSlider.type = 'range'
    alphaSlider.min = '1'
    alphaSlider.max = '100'
    alphaSlider.value = '25'
    alphaSlider.className = 'alpha-slider slider'
    alphaSlider.oninput = function () {
        chatRoom.setAttribute('style', `background-color: rgba(31,31,35,${this.value / 100}) !important`)
    }

    alphaSliderContainer.appendChild(label)
    alphaSliderContainer.appendChild(alphaSlider)

    return alphaSliderContainer
}


// Build opacity slider setting
function buildOpacitySlider() {
    let messageArea = document.querySelector('.chat-scrollable-area__message-container')

    let opacitySliderContainer = document.createElement('div')
    opacitySliderContainer.className = 'setting-container'

    let label = document.createElement('div')
    label.className = 'setting-label'
    label.innerHTML = 'Opacity'

    let opacitySlider = document.createElement('input')
    opacitySlider.type = 'range'
    opacitySlider.min = '1'
    opacitySlider.max = '100'
    opacitySlider.value = '25'
    opacitySlider.className = 'opacity-slider slider'
    opacitySlider.oninput = function () {
        messageArea.style.opacity = this.value / 100
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
                        // console.log("found class to hide: " + className, element)
                        element.classList.add(`${className}_hide`)
                        element.classList.remove('tw-flex')
                        element.classList.remove('tw-block')
                        observer.disconnect()
                        // if (stopLooking) observer.disconnect() // necessary?
                    }
                })
            }
        }
    });
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(parent, config);
}


waitForChat()