const TC_CLASSES = {
    core: 'tc',
    overlay: 'tc-overlay',
    overlayLive: 'tc-overlay-live',
    overlayVod: 'tc-overlay-vod',
    overlayVodChat: 'tc-overlay-vod-chat',
    overlayButtonsContainer: 'tc-ol-buttons-container',
    settingsButtonsContainer: 'tc-settings-buttons-container',
    overlayButton: 'tc-overlay-button',
    buttonWrapper: 'tc-button-wrapper',
    vodMessage: 'tc-vod-message',
    settingContainer: 'tc-setting',
    settingsHeader: 'tc-settings-header',
    settingsButton: 'tc-settings-button',
    settingsIcon: ['fas', 'fa-cog'],
    settingsContainer: 'tc-settings-container',
    settingsWrapper: 'tc-settings-wrapper',
    dragButton: 'tc-drag-button',
    dragIcon: ['fa', 'fa-arrows-alt'],
    closeButton: 'tc-close-button',
    closeIcon: ['fas', 'fa-times'],
    playIcon: ['fas', 'fa-play-circle'],
    overlayFrame: 'tc-chat-frame',
    fadeOut: 'tc-fade-out',
    overlayClip: 'tc-overlay-clip',
    chatBadgeHide: 'tc-chat-badge-hide',
}

const TW_CLASSES = {
    videoPlayer: 'video-player',
    videoPlayerOverlay: 'video-player__overlay',
    playerControls: 'player-controls__right-control-group',
    chatShell: 'chat-shell',
    chatRoom: 'chat-room',
    chatScrollableArea: 'chat-scrollable-area__message-container',
    chatInput: 'chat-input',
    chatInputButtonsContainer: 'chat-input__buttons-container',
    scrollBar: 'simplebar-scrollbar',
    liveChat: 'stream-chat',
    vodChat: 'qa-vod-chat',
    vodChatListWrapper: 'video-chat__message-list-wrapper',
    backgroundAlt: 'tw-c-background-alt',
    display: ['tw-flex', 'tw-block', 'tw-inline-flex', 'jGtCgK', 'ffqcOp', 'jbKovw'],
    buttons: {
        coreButton: [
            'tw-core-button--primary',
            'tw-border-bottom-left-radius-medium',
            'tw-border-bottom-right-radius-medium',
            'tw-border-top-left-radius-medium',
            'tw-border-top-right-radius-medium',
            'jeBpig',
            'tw-core-button',
            'ScCoreButton-sc-1qn4ixc-0',
            'ScCoreButtonPrimary-sc-1qn4ixc-1',
        ],
        coreLabel: ['tw-core-button-label', 'xsINH'],
        overlayButton: [
            'tw-align-items-center',
            'tw-align-middle',
            'tw-border-bottom-left-radius-medium',
            'tw-border-bottom-right-radius-medium',
            'tw-border-top-left-radius-medium',
            'tw-border-top-right-radius-medium',
            'tw-button-icon',
            'tw-button-icon--overlay',
            'tw-core-button',
            'tw-core-button--overlay',
            'tw-justify-content-center',
        ],
        clearButton: [
            'ScCoreButton-sc-1qn4ixc-0',
            'gqSiKD',
            'tw-button-icon',
            'tw-core-button',
        ],
    },
    toHide: [
        'channel-leaderboard',
        'community-points-summary',
        'stream-chat-header',
        'community-highlight-stack__scroll-area--disable',
        'community-highlight-stack__backlog-card',
        'chat-input',
    ],
}

const OVERLAY_BTN_SVG = `<svg class="svg-icon" viewBox="0 0 20 20">
<path fill="none" d="M18.783,13.198H15.73c-0.431,0-0.78-0.35-0.78-0.779c0-0.433,0.349-0.78,0.78-0.78h2.273V3.652H7.852v0.922c0,0.433-0.349,0.78-0.78,0.78c-0.431,0-0.78-0.347-0.78-0.78V2.872c0-0.43,0.349-0.78,0.78-0.78h11.711c0.431,0,0.78,0.35,0.78,0.78v9.546C19.562,12.848,19.214,13.198,18.783,13.198z"></path>
<path fill="none" d="M12.927,17.908H1.217c-0.431,0-0.78-0.351-0.78-0.78V7.581c0-0.43,0.349-0.78,0.78-0.78h11.709c0.431,0,0.78,0.35,0.78,0.78v9.546C13.706,17.557,13.357,17.908,12.927,17.908z M1.997,16.348h10.15V8.361H1.997V16.348z"></path>
</svg>`

let settings = null
let settingsElements = null

const DEFAULT_SETTINGS = {
    position: {
        top: 0,
        left: 0,
        width: 0.5,
        height: 0.3,
    },
    theme: {
        darkMode: true,
        alpha: 50,
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
    },
    chat: {
        fontSize: 14,
        bold: false,
        opacity: 100,
        outline: false,
        removeBadges: false,
    },
}

const buildSettingsObjects = () => {
    settingsElements = {
        sliders: {
            fontSize: {
                name: 'fontSize',
                type: 'sliders',
                label: 'Font Size',
                min: 8,
                max: 30,
                value: settings.chat.fontSize,
                input: function () {
                    settings.chat.fontSize = this.value
                    updateChatStyles()
                },
            },
            backgroundOpacity: {
                name: 'backgroundOpacity',
                type: 'sliders',
                label: 'BG Opacity',
                min: 1,
                max: 100,
                value: settings.theme.alpha,
                input: function () {
                    settings.theme.alpha = this.value
                    updateThemeStyles()
                },
            },
            chatOpacity: {
                name: 'chatOpacity',
                type: 'sliders',
                label: 'Chat Opacity',
                min: 1,
                max: 100,
                value: settings.chat.opacity,
                input: function () {
                    settings.chat.opacity = this.value
                    updateChatStyles()
                },
            },
        },
        toggles: {
            boldChat: {
                name: 'boldChat',
                type: 'toggles',
                label: 'Chunky Chat',
                checked: settings.chat.bold,
                id: 'over-chat-settings-embolden',
                onchange: function () {
                    settings.chat.bold = this.checked
                    updateChatStyles()
                },
            },
            darkMode: {
                name: 'darkMode',
                type: 'toggles',
                label: 'Dark Mode',
                checked: settings.theme.darkMode,
                id: 'over-chat-settings-dark-mode',
                onchange: function () {
                    settings.theme.darkMode = this.checked
                    updateThemeStyles()
                },
            },
            chatOutline: {
                name: 'chatOutline',
                type: 'toggles',
                label: 'Chat Outline',
                checked: settings.chat.outline,
                id: 'over-chat-settings-outline',
                onchange: function () {
                    settings.chat.outline = this.checked
                    updateChatStyles()
                },
            },
            removeBadges: {
                name: 'removeBadges',
                type: 'toggles',
                label: 'Remove Badges',
                checked: settings.chat.removeBadges,
                id: 'over-chat-settings-badges',
                onchange: function () {
                    settings.chat.removeBadges = this.checked
                    updateChatStyles()
                },
            },
        },
    }
}

// Wait until element exists then resolve on element https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e
const elementReady = (selector, doc) => {
    return new Promise((resolve, reject) => {
        let el = doc.querySelector(selector)
        if (el) {
            resolve(el)
        }
        new MutationObserver((mutationRecords, observer) => {
            // Query for elements matching the specified selector
            Array.from(doc.querySelectorAll(selector)).forEach(element => {
                resolve(element)
                //Once we have resolved we don't need the observer anymore.
                observer.disconnect()
            })
        }).observe(doc.documentElement, {
            childList: true,
            subtree: true,
        })
    })
}

const elementRemoved = (selector, doc) => {
    return new Promise((resolve, reject) => {
        let el = doc.querySelector(selector)
        if (!el) {
            resolve()
        }
        new MutationObserver((mutationRecords, observer) => {
            if (!doc.querySelector(selector)) {
                resolve()
                observer.disconnect()
            }
        }).observe(doc, {
            childList: true,
            subtree: true,
        })
    })
}

let clipObserver = null
const observeLiveChat = chat => {
    if (clipObserver) clipObserver.disconnect()
    clipObserver = new MutationObserver(function (mutationsList, clipObserver) {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach(node => {
                let className = node.className
                let linkFragments = node.querySelectorAll(`.link-fragment`)
                let badges =
                    node.querySelectorAll(
                        '.chat-badge, a[data-a-target="chat-badge"]'
                    ) || []

                if (linkFragments.length > 0)
                    linkClips(node, className, linkFragments)
                if (settings.chat.removeBadges)
                    badges.forEach(badge =>
                        badge.classList.add(`${TC_CLASSES.chatBadgeHide}`)
                    )
            })
        }
    })
    const config = { childList: true }
    clipObserver.observe(chat, config)

    function linkClips(node, className, linkFragments) {
        for (const linkFragment of linkFragments) {
            if (className && linkFragment) {
                if (linkFragment.hostname === 'clips.twitch.tv') {
                    let slug = linkFragment.pathname.substr(1)
                    insertPlayClipButton(node, slug)
                    break
                } else if (linkFragment.hostname === 'www.twitch.tv') {
                    let re = /^[/]\w+(\/clip\/)[a-zA-Z]+$/
                    if (re.test(linkFragment.pathname)) {
                        let slug = linkFragment.pathname.split('/')[3]
                        insertPlayClipButton(node, slug)
                        break
                    }
                }
            }
        }
    }
}

let vodObserver = null
const observeVodChat = twMessageWrapper => {
    let pathname = window.location.pathname
    if (vodObserver) vodObserver.disconnect()
    vodObserver = new MutationObserver(function (mutationsList, vodObserver) {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach(node => {
                if (window.location.pathname !== pathname)
                    vodObserver.disconnect()
                if (node.matches(`li[class="InjectLayout-sc-588ddc-0 gDeqEh`)) addNewMessage(node)
            })
        }
    })
    const config = { childList: true, subtree: true }
    vodObserver.observe(twMessageWrapper, config)

    function addNewMessage(node) {
        let listContainer = document.querySelector(
            `.${TC_CLASSES.overlayVodChat} ul`
        )
        let clone = node.cloneNode(true)
        clone.classList.add(TC_CLASSES.vodMessage)

        let badges =
            clone.querySelectorAll(
                '.chat-badge, a[data-a-target="chat-badge"]'
            ) || []
        if (settings.chat.removeBadges)
            badges.forEach(badge =>
                badge.classList.add(`${TC_CLASSES.chatBadgeHide}`)
            )
        listContainer.appendChild(clone)

        let hasBG = clone.querySelector(`.${TW_CLASSES.backgroundAlt}`)
        if (hasBG) hasBG.classList.remove(TW_CLASSES.backgroundAlt)

        let timeStamp = clone.querySelector('div[data-test-selector="message-timestamp"]') // remove timestamps?
        if (timeStamp) timeStamp.remove()

        let count = listContainer.childNodes.length
        while (count-- > 100) listContainer.firstChild.remove()

        let tcChat = document.querySelector(`.${TW_CLASSES.overlayVodChat}`)
        if (tcChat && tcChat.scrollHeight)
            tcChat.scrollTop = tcChat.scrollHeight
    }
}

const insertPlayClipButton = (node, slug) => {
    let wrapper = document.createElement('div')
    wrapper.style.paddingRight = '0.5rem'

    let button = document.createElement('button')
    TW_CLASSES.buttons.clearButton.forEach(className =>
        button.classList.add(className)
    )
    button.style.height = '100%'
    button.onclick = () => insertClipPlayer(slug)
    button.innerHTML = OVERLAY_BTN_SVG

    wrapper.appendChild(button)
    node.style.display = 'flex'
    node.prepend(wrapper)
}

const insertClipPlayer = slug => {
    let parentVideo = document.querySelector(
        `.${TW_CLASSES.videoPlayerOverlay}`
    )

    let uid = 'uid' + Date.now()
    let wrapper = document.createElement('div')
    wrapper.className = TC_CLASSES.overlayClip
    wrapper.classList.add(TC_CLASSES.core)
    wrapper.id = uid

    let frame = document.createElement('iframe')
    frame.src = `https://clips.twitch.tv/embed?clip=${slug}&parent=twitch.tv&autoplay=true`
    frame.width = '100%'
    frame.height = '100%'
    frame.onload = function () {
        let clipOverlay = this.contentWindow.document.body.querySelector(
            `.${TW_CLASSES.videoPlayerOverlay}`
        )
        clipOverlay.style.opacity = '0.5'
        clipOverlay.querySelector('.top-bar').remove()

        clip = this.contentWindow.document.body.getElementsByTagName('video')[0]
        clip.onended = function () {
            wrapper.remove()
        }
    }

    let buttonsContainer = document.createElement('div')

    let dragBtn = buildDragButton(TW_CLASSES.buttons.clearButton, `#${uid}`)
    let closeBtn = buildCloseButton(TW_CLASSES.buttons.clearButton, function () {
        wrapper.remove()
    })

    buttonsContainer.appendChild(closeBtn)
    buttonsContainer.appendChild(dragBtn)

    buttonsContainer.style.position = 'absolute'
    buttonsContainer.style.top = '1rem'
    buttonsContainer.style.left = '1rem'
    buttonsContainer.style.display = 'none'

    wrapper.onmouseover = () => {
        buttonsContainer.style.display = 'flex'
    }
    wrapper.onmouseout = () => {
        buttonsContainer.style.display = 'none'
    }

    wrapper.appendChild(buttonsContainer)
    wrapper.appendChild(frame)
    parentVideo.prepend(wrapper)
}

const setDraggable = (draggable, container, frame) => {
    let fsElement = document.querySelector('.video-player__overlay')
    let videoPlayerHeight = null,
        videoPlayerWidth = null

    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0
    draggable.onmousedown = dragMouseDown

    container.onmouseup = () => updateOverlayPosition()

    function dragMouseDown(e) {
        videoPlayerHeight = fsElement.offsetHeight
        videoPlayerWidth = fsElement.offsetWidth

        e = e || window.event
        e.preventDefault()
        // get the mouse cursor position at startup:
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag

        let frameBody = frame ? frame.contentWindow.document.body : null
        if (frameBody) {
            frameBody.onmouseup = closeDragElement
        }
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        // calculate the new cursor:
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY

        // set the element's new position:
        let offsetTop = container.offsetTop - pos2
        let offsetLeft = container.offsetLeft - pos1
        container.style.top = offsetTop + 'px'
        container.style.left = offsetLeft + 'px'

        // keep position within edges of videoplayer
        if (container.offsetTop < 0) {
            container.style.top = '0px'
        }
        if (container.offsetLeft < 0) {
            container.style.left = '0px'
        }
        if (container.offsetTop + container.offsetHeight > videoPlayerHeight) {
            container.style.top = `${
                videoPlayerHeight - container.offsetHeight
            }px`
        }
        if (container.offsetLeft + container.offsetWidth > videoPlayerWidth) {
            container.style.left = `${
                videoPlayerWidth - container.offsetWidth
            }px`
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null
        document.onmousemove = null
        updateOverlayPosition()

        let frameBody = frame ? frame.contentWindow.document.body : null
        if (frameBody) {
            frameBody.onmouseup = null
        }
    }
}
