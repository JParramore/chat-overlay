const TC_CLASSES = {
    core: 'tc',
    overlay: 'tc-overlay',
    overlayLive: 'tc-overlay-live',
    overlayVod: 'tc-overlay-vod',
    overlayVodChat: 'tc-overlay-vod-chat',
    overlayButtonsContainer: 'tc-buttons-container',
    overlayButton: 'tc-overlay-button',
    buttonWrapper: 'tc-button-wrapper',
    settingsButton: 'tc-settings-button',
    settingsIcon: ['fas', 'fa-cog'],
    settingsContainer: 'tc-settings-container',
    settingsWrapper: 'tc-settings-wrapper',
    dragButton: 'tc-drag-button',
    dragIcon: ['fa', 'fa-arrows-alt'],
    overlayFrame: 'tc-chat-frame',
    fadeOut: 'tc-fade-out',
}

const TW_CLASSES = {
    videoPlayer: 'video-player',
    videoPlayerOverlay: 'video-player__overlay',
    playerControls: 'player-controls__right-control-group',
    chatShell: 'chat-shell',
    chatInput: 'chat-input',
    chatInputButtonsContainer: 'chat-input__buttons-container',
    liveChat: 'stream-chat',
    vodChat: 'qa-vod-chat',
    vodChatListWrapper: 'video-chat__message-list-wrapper',
    display: ['tw-flex', 'tw-block', 'tw-inline-flex'],
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
    },
    toHide: [
        'channel-leaderboard',
        'community-points-summary',
        'stream-chat-header',
        'community-highlight-stack__scroll-area--disable',
        'community-highlight-stack__backlog-card',
    ],
}

const OVERLAY_BTN_SVG = `<svg class="svg-icon" viewBox="0 0 20 20">
<path fill="none" d="M18.783,13.198H15.73c-0.431,0-0.78-0.35-0.78-0.779c0-0.433,0.349-0.78,0.78-0.78h2.273V3.652H7.852v0.922c0,0.433-0.349,0.78-0.78,0.78c-0.431,0-0.78-0.347-0.78-0.78V2.872c0-0.43,0.349-0.78,0.78-0.78h11.711c0.431,0,0.78,0.35,0.78,0.78v9.546C19.562,12.848,19.214,13.198,18.783,13.198z"></path>
<path fill="none" d="M12.927,17.908H1.217c-0.431,0-0.78-0.351-0.78-0.78V7.581c0-0.43,0.349-0.78,0.78-0.78h11.709c0.431,0,0.78,0.35,0.78,0.78v9.546C13.706,17.557,13.357,17.908,12.927,17.908z M1.997,16.348h10.15V8.361H1.997V16.348z"></path>
</svg>`

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

chrome.storage.sync.get(['overlaySettings'], function (result) {
    console.log('storage GET ' + JSON.stringify(result.overlaySettings))
    if (result && Object.keys(result).length === 0) {
        settings = DEFAULT_SETTINGS
    } else {
        settings = result.overlaySettings
    }
})

const settingsElements = {
    sliders: [
        {
            label: 'Font Size',
            min: 8,
            max: 30,
            value: DEFAULT_SETTINGS.chat.fontSize,
            input: function () {
                console.log(
                    `change font size to ${this.value} and update settings`
                )
            },
        },
        {
            label: 'BG Opacity',
            min: 0,
            max: 100,
            valus: DEFAULT_SETTINGS.theme.alpha * 100,
            input: function () {
                console.log(
                    `change bg opacity to ${
                        this.value / 100
                    } and update settings`
                )
            },
        },
        {
            label: 'Chat Opacity',
            min: 0,
            max: 100,
            valus: DEFAULT_SETTINGS.chat.opacity * 100,
            input: function () {
                console.log(
                    `change chat opacity to ${
                        this.value / 100
                    } and update settings`
                )
            },
        },
    ],
    toggles: [
        {
            label: 'Chunky Chat',
            checked: DEFAULT_SETTINGS.chat.bold,
            id: 'over-chat-settings-embolden',
            onchange: function () {
                console.log(`toggle bold chat ${this.checked}`)
            },
        },
        {
            label: 'Dark Mode',
            checked: DEFAULT_SETTINGS.darkMode,
            id: 'over-chat-settings-dark-mode',
            onchange: function () {
                console.log(`toggle darkmode ${this.checked}`)
            },
        },
    ],
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
            Array.from(doc.querySelectorAll(selector)).forEach((element) => {
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

const observeVodMessage = (twMessageWrapper) => {
    observer = new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach((node) => {
                if (node.matches(`li[class="tw-full-width`)) {
                    let listContainer = document.querySelector(
                        `.${TC_CLASSES.overlayVodChat} ul`
                    )
                    let clone = node.cloneNode(true)
                    listContainer.appendChild(clone)
                    let tcChat = document.querySelector('.tc-overlay-vod-chat')
                    tcChat.scrollTop = tcChat.scrollHeight
                }
            })
        }
    })
    const config = { childList: true, subtree: true }
    observer.observe(twMessageWrapper, config)
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
        if (frame) {
            //frame.onmousemove = elementDrag
            frame.onmouseup = closeDragElement
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

        if (frame) {
            //frame.onmousemove = null
            frame.onmouseup = null
        }
    }
}


const animateShowComponent = (ElSelector, offsetElSelector) => {
    var elem = document.querySelector(ElSelector)
    let offset = document.querySelector(offsetElSelector).offsetHeight
    let isOpen
    
    if (elem.classList.contains('tc-open')){
        isOpen = true
        elem.classList.remove('tc-open')
        elem.classList.add('tc-closed')
    } else {
        isOpen = false    
        elem.classList.remove('tc-closed')
        elem.classList.add('tc-open')
    }

    var pos = 0
    let start = elem.offsetTop
    var id = setInterval(frame, 10)
    let moveDistance = offset
    function frame() {
        if (pos >= moveDistance) {
            clearInterval(id)
        } else {
            pos += 10
            elem.style.top = isOpen ? `${start + pos}px` : `${start - pos}px`
        }
    }
}


// https://stackoverflow.com/a/59093093/14549357
const getNodeHeight = (node) => {
    var height, clone = node.cloneNode(true)
    // hide the meassured (cloned) element
    clone.style.cssText = "position:fixed; top:-9999px; opacity:0;"
    // add the clone to the DOM 
    document.body.appendChild(clone)
    // meassure it
    height = clone.clientHeight
    // cleaup 
    clone.parentNode.removeChild(clone)
    return height
}

// globalThis.overlay = {
//     TW_CLASSES,
//     TC_CLASSES,
//     OVERLAY_BTN_SVG,
//     settings,
//     elementReady,
//     observeVodMessage,
//     setDraggable
// }
