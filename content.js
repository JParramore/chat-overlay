let isLive = true

function init() {
    const { core, overlayButton } = TC_CLASSES
    const { playerControls, videoPlayerOverlay } = TW_CLASSES
    let coreComponents = []

    let video = document.querySelector(`.${videoPlayerOverlay}`)
    let overlayEl = buildOverlay()
    video.appendChild(overlayEl)

    let videoControls = document.querySelector(`.${playerControls}`)
    let overlayButtonEl = buildToggleOverlayButton()
    videoControls.prepend(overlayButtonEl)

    coreComponents.push(overlayButtonEl)
    coreComponents.push(overlayEl)
    coreComponents.forEach((element) => element.classList.add(core))
}

function garbageCollect() {
    document
        .querySelectorAll(`.${TC_CLASSES.core}`)
        .forEach((element) => element.remove())
}

function buildOverlay() {
    const {
        overlay,
        overlayFrame,
        overlayVodChat,
        settingsContainer,
    } = TC_CLASSES
    const { toHide, display, vodChatListWrapper } = TW_CLASSES

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
            toHide.forEach((className) => {
                elementReady(`.${className}`, frameDoc).then((el) =>
                    display.forEach((displayClass) =>
                        el.classList.remove(displayClass)
                    )
                )
            })
            elementReady(`.${settingsContainer}`, document).then((el) => {
                updateThemeStyles()
                updateChatStyles()
                frameDoc.body
                    .querySelector('.chat-input')
                    .classList.add('chat-input__hide')
                addOverlayFunctions(container, el, frameDoc.body)
            })
        }
        container.prepend(frame)
    } else {
        elementReady(`.${vodChatListWrapper} ul`, document).then((el) => {
            let wrapper = document.querySelector(`.${vodChatListWrapper}`)
            let clone = wrapper.cloneNode(true)
            clone.classList.add(overlayVodChat)
            observeVodMessage(wrapper)
            container.prepend(clone)
        })
    }

    let relativeWrapper = document.createElement('div')
    relativeWrapper.style.width = '100%'
    relativeWrapper.style.position = 'relative'

    let settingsContainerEl = document.createElement('div')
    settingsContainerEl.className = settingsContainer

    let buttons = buildOverlayButtons()
    let settingsEl = buildOverlaySettings()

    settingsContainerEl.appendChild(buttons)
    settingsContainerEl.appendChild(settingsEl)
    relativeWrapper.appendChild(settingsContainerEl)
    container.appendChild(relativeWrapper)

    if (!isLive)
        elementReady(`.${overlayVodChat}`, document).then((el) => {
            updateThemeStyles()
            updateChatStyles()
            addOverlayFunctions(container, settingsContainerEl, null)
        })

    return container
}

function buildOverlaySettings() {
    const { settingsWrapper } = TC_CLASSES

    let container = document.createElement('div')
    container.style.paddingTop = '1rem'

    let wrapper = document.createElement('div')
    wrapper.className = settingsWrapper

    container.appendChild(wrapper)

    const sliders = Object.keys(settingsElements.sliders)
    const toggles = Object.keys(settingsElements.toggles)

    sliders.forEach((el) => {
        const { label, min, max, value, input } = settingsElements.sliders[el]
        const slider = buildSliderSetting(label, min, max, value, input)
        wrapper.appendChild(slider)
    })

    toggles.forEach((el) => {
        const { label, checked, id, onchange } = settingsElements.toggles[el]
        const toggle = buildToggleSetting(label, checked, id, onchange)
        wrapper.appendChild(toggle)
    })

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

function buildOverlayButtons() {
    const { overlayButtonsContainer } = TC_CLASSES

    let overlayButtons = document.createElement('div')
    overlayButtons.className = overlayButtonsContainer
    overlayButtons.style.display = 'flex'
    let buttons = []

    let overlaySettingsEl = buildOverlaySettingsButton()
    let dragButtonEl = buildDragButton()
    buttons.push(overlaySettingsEl)
    buttons.push(dragButtonEl)

    buttons.forEach((button) => overlayButtons.appendChild(button))

    return overlayButtons
}

function buildDragButton() {
    const { coreButton, coreLabel } = TW_CLASSES.buttons
    const {
        dragButton,
        dragIcon,
        buttonWrapper,
        overlay,
        overlayFrame,
    } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonWrapper

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = dragButton
    coreButton.forEach((className) => button.classList.add(className))
    button.style.cursor = 'move'

    let icon = document.createElement('i')
    dragIcon.forEach((className) => icon.classList.add(className))
    coreLabel.forEach((className) => icon.classList.add(className))

    button.appendChild(icon)
    container.appendChild(stylesheet)
    container.appendChild(button)

    elementReady(`.${overlay}`, document).then((el) => {
        let frameBody = document.querySelector(`.${overlayFrame}`)
            ? document.querySelector(`.${overlayFrame}`).contentWindow.document
                  .body
            : null
        setDraggable(container, el, frameBody)
    })

    return container
}

function buildOverlaySettingsButton() {
    const { coreButton, coreLabel } = TW_CLASSES.buttons
    const {
        settingsButton,
        settingsIcon,
        buttonWrapper,
        settingsContainer,
        settingsWrapper,
    } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonWrapper

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = settingsButton
    coreButton.forEach((className) => button.classList.add(className))
    button.onclick = () => {
        document.querySelector(`.${settingsWrapper}`).parentElement.className =
            'tc-wrapper-1rem'
        animateShowComponent(`.${settingsContainer}`, `.tc-wrapper-1rem`)
    }

    let icon = document.createElement('i')
    settingsIcon.forEach((className) => icon.classList.add(className))
    coreLabel.forEach((className) => icon.classList.add(className))

    button.appendChild(icon)
    container.appendChild(stylesheet)
    container.appendChild(button)

    return container
}

function buildToggleOverlayButton() {
    const { overlayButton, overlay } = TC_CLASSES
    const twButtonClasses = TW_CLASSES.buttons.overlayButton

    let container = document.createElement('div')
    container.className = 'tw-tooltip__container tw-relative'
    container.classList.add(overlayButton)

    let button = document.createElement('button')
    button.classList.add(...twButtonClasses)
    button.ariaLabel = 'Chat Overlay (o)'
    button.onclick = toggleShowOverlay

    let tooltip = document.createElement('div')
    tooltip.className = 'tw-tooltip tw-tooltip--align-right tw-tooltip--up'
    tooltip.role = 'tooltip'
    tooltip.innerHTML = 'Chat Overlay (o)'

    button.innerHTML = OVERLAY_BTN_SVG
    container.appendChild(button)
    container.appendChild(tooltip)

    return container
}

function toggleShowOverlay() {
    let overlayEl = document.querySelector(`.${TC_CLASSES.overlay}`)
    let overlayBtnEl = document.querySelector(`.${TC_CLASSES.overlayButton}`)
    if (overlayEl && overlayBtnEl) {
        const hidden =
            !overlayEl.style.display || overlayEl.style.display === 'none'
        if (hidden) {
            overlayEl.style.display = 'flex'
            flashFade(overlayEl)
        } else {
            overlayEl.style.display = 'none'
        }
    }
}

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

    chrome.storage.local.set({ overlaySettings: settings })
}

function updateChatStyles() {
    let chat

    if (isLive) {
        let frameDoc = document.querySelector(`.${TC_CLASSES.overlayFrame}`)
            .contentWindow.document
        chat = frameDoc.querySelector(`.${TW_CLASSES.chatScrollableArea}`)
    } else {
        chat = document.querySelector(`.${TC_CLASSES.overlayVodChat} ul`)
    }

    const { opacity, bold, fontSize } = settings.chat
    chat.setAttribute('style', `font-size: ${fontSize}px !important;`)
    chat.style.fontWeight = bold ? 'bold' : 'normal'
    chat.style.opacity = opacity / 100

    chrome.storage.local.set({ overlaySettings: settings })
}

function translateOverlayPosition() {
    const { top, left, width, height } = overlayPosition
    let overlayEl = document.querySelector(`.${TC_CLASSES.overlay}`)
    let buttonEl = document.querySelector(`.${TC_CLASSES.overlayButton}`)

    if (overlayEl && buttonEl) {
        overlayEl.style.top = `${top * 100}%`
        overlayEl.style.left = `${left * 100}%`
        overlayEl.style.height = `${height * 100}%`
        overlayEl.style.width = `${width * 100}%`
    }
}

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

function detectNeedGC() {
    let location = window.location.pathname

    const int = setInterval(() => {
        let overlayButton = document.querySelector(
            `.${TC_CLASSES.overlayButton}`
        )
        if (!overlayButton) {
            garbageCollect()
            console.log('controls gone wait for video')
            clearInterval(int)
            waitForVideo()
        } else if (location !== window.location.pathname) {
            location = window.location.pathname
            console.log('path changed.. wait for video')
            garbageCollect()
            clearInterval(int)
            waitForVideo()
        }
    }, 500)
}

chrome.storage.local.get(['overlaySettings'], function (result) {
    console.dir('got', result)
    if (result && Object.keys(result).length === 0) {
        settings = DEFAULT_SETTINGS
    } else {
        settings = result.overlaySettings
    }
    buildSettingsObjects()
    waitForVideo()
})

document.onkeydown = function (e) {
    if (
        e.key.toLowerCase() === 'o' &&
        e.target.tagName.toLowerCase() === 'body'
    ) {
        toggleShowOverlay()
    }
}

document.onfullscreenchange = translateOverlayPosition
