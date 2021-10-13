let isLive = true

// build core components and append to tw video player
function init() {
    const { core } = TC_CLASSES
    const { playerControls, videoPlayerOverlay } = TW_CLASSES
    let coreComponents = []

    let video = document.querySelector(`.${videoPlayerOverlay}`)
    let overlayEl = buildOverlay()

    let videoControls = document.querySelector(`.${playerControls}`)
    let overlayButtonEl = buildToggleOverlayButton()
    let settingsEl = buildOverlaySettings()

    video.appendChild(overlayEl)
    video.appendChild(settingsEl)
    videoControls.prepend(overlayButtonEl)

    coreComponents.push(overlayButtonEl)
    coreComponents.push(overlayEl)
    coreComponents.push(settingsEl)
    coreComponents.forEach(element => element.classList.add(core))
}

// sanity check - remove core components on rebuild
function garbageCollect() {
    document
        .querySelectorAll(`.${TC_CLASSES.core}`)
        .forEach(element => element.remove())
}

// build overlay chat container and components
function buildOverlay() {
    const {
        overlay,
        overlayFrame,
        overlayVodChat,
        overlayButtonsContainer,
    } = TC_CLASSES
    const {
        toHide,
        display,
        vodChatListWrapper,
        chatScrollableArea,
    } = TW_CLASSES

    let container = document.createElement('div')
    container.className = overlay
    container.style.display = 'none'

    if (isLive) {
        const channel = window.location.pathname.substr(1)

        let frame = document.createElement('iframe')
        frame.className = overlayFrame
        frame.src = `https://www.twitch.tv/popout/${channel}/chat`
        frame.height = '100%'
        frame.width = '100%'
        frame.onload = function () {
            let frameDoc = this.contentWindow.document
            toHide.forEach(className => {
                elementReady(`.${className}`, frameDoc).then(el =>
                    display.forEach(displayClass =>
                        el.classList.remove(displayClass)
                    )
                )
            })
            elementReady(`.${overlayButtonsContainer}`, document).then(el => {
                updateThemeStyles()
                updateChatStyles()
                translateOverlayPosition()
                frameDoc.body
                    .querySelector('.chat-input')
                    .classList.add('chat-input__hide')
                addOverlayFunctions(container, el, frameDoc.body)
            })
            elementReady(`.${chatScrollableArea}`, frameDoc).then(chatEl => {
                observeLiveChat(chatEl)
            })
        }
        container.prepend(frame)
    } else {
        elementReady(`.${vodChatListWrapper} ul`, document).then(el => {
            let wrapper = document.querySelector(`.${vodChatListWrapper}`)
            let clone = wrapper.cloneNode(true)
            clone.classList.add(overlayVodChat)
            observeVodChat(wrapper)
            container.prepend(clone)
        })
    }

    let buttons = buildOverlayButtons()
    container.appendChild(buttons)

    if (!isLive)
        elementReady(`.${overlayVodChat}`, document).then(el => {
            updateThemeStyles()
            updateChatStyles()
            translateOverlayPosition()
            addOverlayFunctions(container, buttons, null)
        })

    return container
}

// using settingsElements obj build settings
function buildOverlaySettings() {
    const {
        settingsWrapper,
        settingsHeader,
        settingsContainer,
        settingsButtonsContainer,
    } = TC_CLASSES

    let container = document.createElement('div')
    container.className = settingsContainer
    container.style.display = 'none'

    let wrapper = document.createElement('div')
    wrapper.className = settingsWrapper

    let header = document.createElement('div')
    header.className = settingsHeader

    let buttons = document.createElement('div')
    buttons.className = settingsButtonsContainer
    buttons.appendChild(
        buildCloseButton(TW_CLASSES.buttons.clearButton, function () {
            let settings = document.querySelector(`.${settingsContainer}`)
            if (settings) {
                const hidden =
                    !settings.style.display || settings.style.display === 'none'
                if (hidden) {
                    settings.style.display = 'flex'
                } else {
                    settings.style.display = 'none'
                }
            }
        })
    )

    let title = document.createElement('span')
    title.innerHTML = 'Overlay Settings'

    header.appendChild(buttons)
    header.appendChild(title)
    wrapper.appendChild(header)

    const sliders = Object.keys(settingsElements.sliders)
    const toggles = Object.keys(settingsElements.toggles)

    sliders.forEach(el => {
        const { label, min, max, value, input } = settingsElements.sliders[el]
        const slider = buildSliderSetting(label, min, max, value, input)
        wrapper.appendChild(slider)
    })

    toggles.forEach(el => {
        const { label, checked, id, onchange } = settingsElements.toggles[el]
        const toggle = buildToggleSetting(label, checked, id, onchange)
        wrapper.appendChild(toggle)
    })

    container.appendChild(wrapper)

    return container
}

function buildToggleSetting(text, checked, id, onchange) {
    const { settingContainer } = TC_CLASSES

    let container = document.createElement('div')
    container.className = settingContainer

    let twToggle = document.createElement('div')
    twToggle.className = 'tw-toggle'

    let textEl = document.createElement('span')
    textEl.innerHTML = text
    textEl.style.paddingRight = '1rem'
    textEl.style.color = 'white'

    let input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = checked
    input.className = 'tw-toggle__input'
    input.id = id
    input.setAttribute('data-a-target', 'tw-toggle')
    input.onchange = onchange

    let label = document.createElement('label')
    label.className = 'tw-toggle__button'
    label.setAttribute('for', id)

    twToggle.appendChild(input)
    twToggle.appendChild(label)

    container.appendChild(textEl)
    container.appendChild(twToggle)

    return container
}

function buildSliderSetting(text, min, max, value, input) {
    const { settingContainer } = TC_CLASSES

    let container = document.createElement('div')
    container.className = settingContainer

    let label = document.createElement('span')
    label.innerHTML = text
    label.style.color = 'white'
    label.style.paddingRight = '1rem'

    slider = document.createElement('input')
    slider.type = 'range'
    slider.min = min
    slider.max = max
    slider.value = value
    slider.className = 'alpha-slider slider'
    slider.oninput = input

    container.appendChild(label)
    container.appendChild(slider)

    return container
}

// build the settings and drag buttons for the overlay
function buildOverlayButtons() {
    const { overlayButtonsContainer, overlay, overlayFrame } = TC_CLASSES
    const { coreButton } = TW_CLASSES.buttons

    let overlayButtons = document.createElement('div')
    overlayButtons.className = overlayButtonsContainer
    overlayButtons.style.display = 'flex'
    let buttons = []

    let overlaySettingsEl = buildOverlaySettingsButton(coreButton)
    let dragButtonEl = buildDragButton(coreButton, `.${overlay}`)

    buttons.push(overlaySettingsEl)
    buttons.push(dragButtonEl)

    buttons.forEach(button => overlayButtons.appendChild(button))

    return overlayButtons
}

function buildDragButton(buttonClasses, toDragSelector) {
    const { coreLabel } = TW_CLASSES.buttons
    const { dragButton, dragIcon, buttonWrapper, overlayFrame } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonWrapper

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = dragButton
    buttonClasses.forEach(className => button.classList.add(className))
    button.style.cursor = 'move'

    let icon = document.createElement('i')
    dragIcon.forEach(className => icon.classList.add(className))
    coreLabel.forEach(className => icon.classList.add(className))

    button.appendChild(icon)
    container.appendChild(stylesheet)
    container.appendChild(button)

    elementReady(toDragSelector, document).then(el => {
        let frame = document.querySelector(`.${overlayFrame}`)
        setDraggable(container, el, frame)
    })

    return container
}

function buildOverlaySettingsButton(buttonClasses) {
    const { coreLabel } = TW_CLASSES.buttons
    const {
        settingsButton,
        settingsIcon,
        buttonWrapper,
        settingsContainer,
    } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonWrapper

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = settingsButton
    buttonClasses.forEach(className => button.classList.add(className))
    button.onclick = () => {
        let settings = document.querySelector(`.${settingsContainer}`)
        if (settings.style.display === 'none') {
            settings.style.display = 'flex'
        } else {
            settings.style.display = 'none'
        }
    }

    let icon = document.createElement('i')
    settingsIcon.forEach(className => icon.classList.add(className))
    coreLabel.forEach(className => icon.classList.add(className))

    button.appendChild(icon)
    container.appendChild(stylesheet)
    container.appendChild(button)

    return container
}

function buildCloseButton(buttonClasses, closeFunction) {
    const { coreLabel } = TW_CLASSES.buttons
    const { closeButton, closeIcon, buttonWrapper } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonWrapper

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = closeButton
    buttonClasses.forEach(className => button.classList.add(className))
    button.onclick = closeFunction

    let icon = document.createElement('i')
    closeIcon.forEach(className => icon.classList.add(className))
    coreLabel.forEach(className => icon.classList.add(className))

    button.appendChild(icon)
    container.appendChild(stylesheet)
    container.appendChild(button)

    return container
}

function buildToggleOverlayButton() {
    const { overlayButton } = TC_CLASSES
    const twButtonClasses = TW_CLASSES.buttons.overlayButton

    let container = document.createElement('div')
    container.className = 'tw-tooltip__container tw-relative sc-AxjAm ScAttachedTooltipWrapper-v8mg6d-0 dLtTlU'
    container.classList.add(overlayButton)

    let button = document.createElement('button')
    button.classList.add(...twButtonClasses)
    button.ariaLabel = 'Chat Overlay (o)'
    button.onclick = toggleShowOverlay

    let tooltip = document.createElement('div')
    tooltip.className = 'tw-tooltip jouePo ScAttachedTooltip-v8mg6d-1'
    tooltip.setAttribute('data-a-target', 'tw-tooltip-label')
    tooltip.direction = 'tw-tooltip--up'
    tooltip.role = 'tooltip'
    // tooltip.innerHTML = 'Chat Overlay (o)'

    button.innerHTML = OVERLAY_BTN_SVG
    container.appendChild(button)
    container.appendChild(tooltip)

    return container
}

// show or hide the overlay
function toggleShowOverlay() {
    let overlayEl = document.querySelector(`.${TC_CLASSES.overlay}`)
    let settings = document.querySelector(`.${TC_CLASSES.settingsContainer}`)
    let overlayBtnEl = document.querySelector(`.${TC_CLASSES.overlayButton}`)
    if (overlayEl && overlayBtnEl) {
        const hidden =
            !overlayEl.style.display || overlayEl.style.display === 'none'
        if (hidden) {
            overlayEl.style.display = 'flex'
            flashFade(overlayEl)
        } else {
            overlayEl.style.display = 'none'
            settings.style.display = 'none'
        }
    }
}

// animation on element to flash into view
function flashFade(el) {
    let box = document.createElement('div')
    box.className = 'tc-flash-fade'
    el.appendChild(box)

    var fadeEffect = setInterval(function () {
        if (!box.style.opacity) {
            box.style.opacity = 1
        }
        if (box.style.opacity > 0) {
            box.style.opacity -= 0.1
        } else {
            clearInterval(fadeEffect)
            box.remove()
        }
    }, 60)
}

// show/hide overlay elements on mouseover/mouseout
function addOverlayFunctions(overlay, buttons, frame) {
    const { chatInput } = TW_CLASSES

    let input = frame ? frame.querySelector(`.${chatInput}`) : null

    overlay.onmouseover = () => {
        overlay.style.border = '2px solid rgb(145,71,255)'
        overlay.style.resize = 'auto'
        buttons.style.visibility = 'visible'
        if (input) input.classList.remove('chat-input__hide')
    }
    overlay.onmouseout = () => {
        overlay.style.border = '2px solid transparent'
        overlay.style.resize = 'none'
        buttons.style.visibility = 'hidden'
        if (input) input.classList.add('chat-input__hide')
    }
}

// when user makes changes to theme change styles and save to local storage
function updateThemeStyles() {
    let chat, focusdoc, scrollBar

    if (isLive) {
        focusdoc = document.querySelector(`.${TC_CLASSES.overlayFrame}`)
            .contentWindow.document
        chat = focusdoc.querySelector(`.${TW_CLASSES.chatRoom}`)
        scrollBar = focusdoc.querySelector(`.${TW_CLASSES.scrollBar}`)
    } else {
        focusdoc = document
        chat = document.querySelector(`.${TC_CLASSES.overlayVodChat}`)
    }

    const theme = settings.theme
    const darkMode = theme.darkMode

    const { red, green, blue } = darkMode
        ? theme.darkBackground
        : theme.lightBackground

    const alpha = theme.alpha

    chat.setAttribute(
        'style',
        `background-color: rgba(${red},${green},${blue},${
            alpha / 100
        }) !important;`
    )

    if (isLive) {
        if (darkMode) {
            focusdoc.documentElement.classList.remove('tw-root--theme-light')
            focusdoc.documentElement.classList.add('tw-root--theme-dark')
        } else {
            focusdoc.documentElement.classList.remove('tw-root--theme-dark')
            focusdoc.documentElement.classList.add('tw-root--theme-light')
        }
    } else {
        chat.style.color = darkMode ? 'white' : 'black'
    }

    if (scrollBar) scrollBar.style.opacity = alpha / 100

    updateChatStyles()
}

// when user makes changes to theme change styles and save to local storage
function updateChatStyles() {
    let chat

    if (isLive) {
        let frameDoc = document.querySelector(`.${TC_CLASSES.overlayFrame}`)
            .contentWindow.document
        chat = frameDoc.querySelector(`.${TW_CLASSES.chatScrollableArea}`)
    } else {
        chat = document.querySelector(`.${TC_CLASSES.overlayVodChat} ul`)
    }

    const removeBadges = settings.chat.removeBadges
    let badges = chat.querySelectorAll(
        '.chat-badge, a[data-a-target="chat-badge"]'
    )
    badges.forEach(badge =>
        removeBadges
            ? badge.classList.add(TC_CLASSES.chatBadgeHide)
            : badge.classList.remove(TC_CLASSES.chatBadgeHide)
    )

    const darkMode = settings.theme.darkMode
    const { opacity, bold, fontSize, outline } = settings.chat
    chat.setAttribute('style', `font-size: ${fontSize}px !important;`)
    chat.style.fontWeight = bold ? 'bold' : 'normal'
    chat.style.opacity = opacity / 100
    chat.style.textShadow = outline
        ? `1px 1px 1px ${darkMode ? 'black' : 'white'}`
        : 'none'

    chrome.storage.local.set({ overlaySettings: settings })
}

// calculate position as % based on pos over video player size to translate position and dimensions on different sized players
const updateOverlayPosition = () => {
    let overlay = document.querySelector(`.${TC_CLASSES.overlay}`)
    let parent = overlay.parentElement

    const current = {
        top: overlay.offsetTop / parent.offsetHeight,
        left: overlay.offsetLeft / parent.offsetWidth,
        width: overlay.offsetWidth / parent.offsetWidth,
        height: overlay.offsetHeight / parent.offsetHeight,
    }

    // sanity check positions 0 <= pos <= 1
    const satisfies = positions => {
        for (const position of positions) {
            if (position < 0 || position > 1) {
                return false
            }
        }
        return true
    }

    satisfies(Object.values(current))
        ? (settings.position = current)
        : (settings.position = DEFAULT_SETTINGS.position)

    // sanity check border overflowing video player
    if (current.width + current.left > 1)
        settings.position = DEFAULT_SETTINGS.position
    if (current.height + current.top > 1)
        settings.position = DEFAULT_SETTINGS.position

    chrome.storage.local.set({ overlaySettings: settings })
}

// on fullscreen change we need to translate the position of the overlay to a new position based on new video element resolution to maintian ratios
function translateOverlayPosition() {
    const { top, left, width, height } = settings.position
    let overlayEl = document.querySelector(`.${TC_CLASSES.overlay}`)
    let buttonEl = document.querySelector(`.${TC_CLASSES.overlayButton}`)

    if (overlayEl && buttonEl) {
        overlayEl.style.top = `${top * 100}%`
        overlayEl.style.left = `${left * 100}%`
        overlayEl.style.height = `${height * 100}%`
        overlayEl.style.width = `${width * 100}%`
    }
}

// only build overlay on twitch.tv/* pages that have a video player and a chat (these are live/vods)
function waitForVideo() {
    const { playerControls, chatShell, liveChat, vodChat } = TW_CLASSES
    const timeNow = Date.now()
    const int = setInterval(() => {
        if (Date.now() - timeNow > 100000000) {
            console.errpr('timed out: waiting for video')
            clearInterval(int)
        }
        let controls = document.querySelector(`.${playerControls}`),
            chat = document.querySelector(`.${chatShell}`)

        if (controls && chat) {
            let isLiveChat = !!document.querySelector(`.${liveChat}`)
            let isVodChat = !!document.querySelector(`.${vodChat}`)

            if (isVodChat && window.location.pathname.includes('videos')) {
                isLive = false
                init(false)
                clearInterval(int)
                elementReady(`.${TC_CLASSES.overlayButton}`, document).then(
                    detectNeedGC()
                )
            } else if (isLiveChat) {
                isLive = true
                init()
                clearInterval(int)
                elementReady(`.${TC_CLASSES.overlayButton}`, document).then(
                    detectNeedGC()
                )
            }
        }
    }, 500)
}

// when we lose the player controls or location changes we need to wait for video player / chat again
function detectNeedGC() {
    let location = window.location.pathname

    const int = setInterval(() => {
        let overlayButton = document.querySelector(
            `.${TC_CLASSES.overlayButton}`
        )
        if (!overlayButton) {
            garbageCollect()
            clearInterval(int)
            waitForVideo()
        } else if (location !== window.location.pathname) {
            location = window.location.pathname
            garbageCollect()
            clearInterval(int)
            waitForVideo()
        }
    }, 500)
}

// get settings from storage then look for a video / chat to build overlay
chrome.storage.local.get(['overlaySettings'], function (result) {
    if (result && Object.keys(result).length === 0) {
        settings = DEFAULT_SETTINGS
    } else {
        settings = result.overlaySettings
    }
    buildSettingsObjects()
    waitForVideo()

    document.onkeydown = function (e) {
        if (
            e.key.toLowerCase() === 'o' &&
            e.target.tagName.toLowerCase() === 'body'
        ) {
            toggleShowOverlay()
        }
    }

    document.onfullscreenchange = translateOverlayPosition
})
