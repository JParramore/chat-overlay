console.log('script start')

function init(isLive = true) {
    const { core } = TC_CLASSES
    const { playerControls, videoPlayerOverlay } = TW_CLASSES
    let coreComponents = []

    // Garbage collect extension components
    document.querySelectorAll(`.${core}`).forEach((element) => element.remove())

    let video = document.querySelector(`.${videoPlayerOverlay}`)
    console.log('is live ' + isLive)
    let overlayEl = buildOverlay(isLive)
    video.appendChild(overlayEl)

    let videoControls = document.querySelector(`.${playerControls}`)
    let overlayButtonEl = buildToggleOverlayButton()
    videoControls.prepend(overlayButtonEl)

    coreComponents.push(overlayButtonEl)
    coreComponents.push(overlayEl)

    coreComponents.forEach((element) => element.classList.add(core))
}

function buildOverlay(isLive) {
    const { overlay, chatFrame, overlayVodChat, overlayButtonsContainer } = TC_CLASSES
    const {
        toHide,
        display,
        vodChat,
        chatInputButtonsContainer,
        vodChatListWrapper,
    } = TW_CLASSES

    let container = document.createElement('div')
    container.className = overlay
    // container.style.display = 'none' // TODO: ON FOR PROD

    if (isLive) {
        const channel = window.location.pathname.substr(1)

        let frame = document.createElement('iframe')
        frame.className = chatFrame
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
            let inputButtonsContainer = frameDoc.body.querySelector(
                `.${chatInputButtonsContainer}`
            )
            inputButtonsContainer.classList.add(overlayButtonsContainer)
            let buttons = buildOverlayButtons()
            inputButtonsContainer.prepend(buttons)
        }
        container.appendChild(frame)
    } else {
        elementReady(`.${vodChatListWrapper} ul`, document).then((el) => {
            let wrapper = document.querySelector(`.${vodChatListWrapper}`)
            let clone = wrapper.cloneNode(true)
            clone.classList.add(overlayVodChat)
            observeVodMessage(wrapper)

            let inputButtonsContainer = document.createElement('div')
            inputButtonsContainer.className = overlayButtonsContainer
            let buttons = buildOverlayButtons()
            inputButtonsContainer.appendChild(buttons)

            container.appendChild(clone)
            container.appendChild(inputButtonsContainer)
        })
        
    }
    return container
}

function buildOverlayButtons() {
    let overlayButtons = document.createElement('div')
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
    const { dragButton, dragIcon, buttonContainer } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonContainer

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = dragButton
    coreButton.forEach((className) => button.classList.add(className))
    button.onlick = () => {
        console.log('draggin')
    }

    let icon = document.createElement('i')
    dragIcon.forEach((className) => icon.classList.add(className))
    coreLabel.forEach((className) => icon.classList.add(className))

    button.appendChild(icon)
    container.appendChild(stylesheet)
    container.appendChild(button)

    return container
}

function buildOverlaySettingsButton() {
    const { coreButton, coreLabel } = TW_CLASSES.buttons
    const { settingsButton, settingsIcon, buttonContainer } = TC_CLASSES

    let container = document.createElement('div')
    container.className = buttonContainer

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let button = document.createElement('button')
    button.className = settingsButton
    coreButton.forEach((className) => button.classList.add(className))
    button.onclick = () => {
        console.log('open settings button clicked')
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
    const { overlayButton, overlay, fadeOut } = TC_CLASSES
    const twButtonClasses = TW_CLASSES.buttons.overlayButton

    let container = document.createElement('div')
    container.className = 'tw-tooltip__container tw-relative'
    container.classList.add(overlayButton)

    let button = document.createElement('button')
    button.classList.add(...twButtonClasses)
    button.ariaLabel = 'Chat Overlay'
    button.onclick = () => {
        let overlayEl = document.querySelector(`.${overlay}`)
        const hidden =
            !overlayEl.style.display || overlayEl.style.display === 'none'
        if (hidden) {
            overlayEl.style.display = 'flex'
            // TODO flashFadeIn
        } else {
            overlayEl.style.display = 'none'
        }
    }

    let tooltip = document.createElement('div')
    tooltip.className = 'tw-tooltip tw-tooltip--align-right tw-tooltip--up'
    tooltip.role = 'tooltip'
    tooltip.innerHTML = 'Chat Overlay'

    button.innerHTML = OVERLAY_BTN_SVG
    container.appendChild(button)
    container.appendChild(tooltip)

    return container
}

function waitForVideo() {
    const { playerControls, chatShell, liveChat, vodChat } = TW_CLASSES

    const timeNow = Date.now()
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.log('waitForVideo timed out')
            clearInterval(int)
        }
        let controls = document.querySelector(`.${playerControls}`),
            chat = document.querySelector(`.${chatShell}`)

        if (controls && chat) {
            let isLive = !!document.querySelector(`.${liveChat}`)
            let isVod = !!document.querySelector(`.${vodChat}`)
            console.log('isVod: ' + isVod)
            if (isVod) {
                init(false)
                clearInterval(int)
            } else if (isLive) {
                init()
                clearInterval(int)
            } else {
                console.log('controls and chat found but not live or vod?')
            }
        }
    }, 500)
}

window.onload = () => {
    waitForVideo()
    const { playerControls, liveChat, vodChat } = TW_CLASSES
    let location = window.location.pathname

    setInterval(() => {
        if (location !== window.location.pathname) {
            console.log('location changed')
            location = window.location.pathname
            waitForVideo()
        }
    }, 500)
}

console.log('script end')
