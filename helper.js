const TC_CLASSES = {
    core: 'tc',
    overlay: 'tc-overlay',
    overlayLive: 'tc-overlay-live',
    overlayVod: 'tc-overlay-vod',
    overlayVodChat: 'tc-overlay-vod-chat',
    overlayButtonsContainer: 'tc-buttons-container',
    overlayButton: 'tc-overlay-button',
    buttonContainer: 'tc-button-container',
    settingsButton: 'tc-settings-button',
    settingsIcon: ['fas', 'fa-cog'],
    dragButton: 'tc-drag-button',
    dragIcon: ['fa', 'fa-arrows-alt'],
    frame: 'tc-chat-frame',
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
            'jeBpig',
            'tw-core-button',
            'tw-core-button--primary',
            'tw-border-bottom-left-radius-medium',
            'tw-border-bottom-right-radius-medium',
            'tw-border-top-left-radius-medium',
            'tw-border-top-right-radius-medium',
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
    if (result && Object.keys(result).length === 0) {
        settings = DEFAULT_SETTINGS
    } else {
        settings = result.overlaySettings
    }
    document.body.overlaySettings = settings
})

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

globalThis.overlay = {
    TW_CLASSES,
    TC_CLASSES,
    OVERLAY_BTN_SVG,
    settings,
    elementReady,
    observeVodMessage,
}
