console.log('script start')

let isLive = true

function init() {
    const { core } = TC_CLASSES
    const { playerControls, videoPlayerOverlay } = TW_CLASSES
    let coreComponents = []

    // Garbage collect extension components
    document.querySelectorAll(`.${core}`).forEach((element) => element.remove())

    let video = document.querySelector(`.${videoPlayerOverlay}`)
    console.log('is live ' + isLive)
    let overlayEl = buildOverlay()
    video.appendChild(overlayEl)

    let videoControls = document.querySelector(`.${playerControls}`)
    let overlayButtonEl = buildToggleOverlayButton()
    videoControls.prepend(overlayButtonEl)

    coreComponents.push(overlayButtonEl)
    coreComponents.push(overlayEl)

    coreComponents.forEach((element) => element.classList.add(core))
}

function buildOverlay() {
    const {
        overlay,
        overlayFrame,
        overlayVodChat,
        settingsContainer,
    } = TC_CLASSES
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

    let settingsContainerEl = document.createElement('div')
    settingsContainerEl.className = settingsContainer
    let buttons = buildOverlayButtons()
    let settingsEl = buildOverlaySettings()
    settingsContainerEl.appendChild(buttons)
    settingsContainerEl.appendChild(settingsEl)
    container.appendChild(settingsContainerEl)

    return container
}

function buildOverlaySettings() {
    const { settingsWrapper } = TC_CLASSES

    let wrapper = document.createElement('div')
    wrapper.className = settingsWrapper
    wrapper.style.backgroundColor = 'navy'

    settingsElements.sliders.forEach((el) => {
        const { label, min, max, value, input } = el
        const slider = buildSliderSetting(label, min, max, value, input)
        wrapper.appendChild(slider)
    })

    settingsElements.toggles.forEach((el) => {
        const { label, checked, id, onchange } = el
        const toggle = buildToggleSetting(label, checked, id, onchange)
        wrapper.appendChild(toggle)
    })

    return wrapper
}

function buildToggleSetting(text, checked, id, onchange) {
    let container = document.createElement('div')

    let twToggle = document.createElement('div')
    twToggle.className = 'tw-toggle'

    let textEl = document.createElement('div')
    textEl.innerHTML = text

    let input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = checked
    input.className = 'tw-toggle__input'
    input.id = id
    input.setAttribute('data-a-target', 'tw-toggle')
    input.onchange = onchange

    let label = document.createElement('label')
    label.className = 'tw-toggle_button'
    label.setAttribute('for', id)

    twToggle.appendChild(input)
    twToggle.appendChild(label)

    container.appendChild(textEl)
    container.appendChild(twToggle)

    return container
}

function buildSliderSetting(text, min, max, value, input) {
    let container = document.createElement('div')

    let label = document.createElement('div')
    label.innerHTML = text

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
    const { settingsButton, settingsIcon, buttonWrapper } = TC_CLASSES

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
            let isLiveChat = !!document.querySelector(`.${liveChat}`)
            let isVodChat = !!document.querySelector(`.${vodChat}`)
            if (isVodChat) {
                isLive = false
                init(false)
                clearInterval(int)
            } else if (isLiveChat) {
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
