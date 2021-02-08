let overlay = null
let frameBody = null

/** Waits until chat DOM is built and calls init() after */
function waitForVideo() {
    const timeNow = Date.now()
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.log('Could not find video')
            clearInterval(int)
        }
        const video = document.querySelector('.video-player')
        if (video && video.getAttribute('data-a-player-type') === 'site') {
            console.log("found vid: ", video)
            init()
            clearInterval(int)
        }
    }, 500)
}


// DOM content loaded
function init() {
    overlay = buildOverlay()
    let toggleOverlayButton = buildToggleOverlayButton()

    let videoPlayer = document.querySelector('.video-player')
    videoPlayer.toggleOverlayButton = toggleOverlayButton
    observeChannelChange(videoPlayer)

    fsElement = document.querySelector('.video-player__overlay');
    fsElement.appendChild(overlay)

    videoPlayer.addEventListener('fullscreenchange', changedFullscreen, false)
}


// Fullscreen lister function
function changedFullscreen() {
    if (document.fullscreenElement) {
        this.toggleOverlayButton.style.display = 'flex'
    } else {
        this.toggleOverlayButton.style.display = 'none'
        overlay.style.display = 'none'
    }
}


// Build and insert toggle overlay
function buildToggleOverlayButton() {
    let tglWrapper = document.createElement('div')
    tglWrapper.className = 'tgl-overlay-btn-wrapper tw-mg-l-05'

    let toggleOverlayBtn = document.createElement('button')
    toggleOverlayBtn.className = 'toggle-overlay-btn tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--primary tw-inline-flex tw-justify-content-center'
    toggleOverlayBtn.onclick = function () {
        if (!overlay.style.display || overlay.style.display == 'none') {
            overlay.style.display = 'flex'
            flashChatAnimation()
        } else {
            overlay.style.display = 'none'
        }
    }

    let label = document.createElement('div')
    label.className = 'tw-align-items-center tw-core-button-label tw-flex tw-flex-grow-0 tw-core-button-label-text'
    label.innerHTML = 'Overlay'

    toggleOverlayBtn.appendChild(label)
    tglWrapper.appendChild(toggleOverlayBtn) // looping

    let playerControls = document.querySelector('.player-controls__right-control-group')
    playerControls.prepend(tglWrapper)

    return tglWrapper
}


// Fade in transition to make it clear chat has been opened https://stackoverflow.com/a/11293378/14549357
function flashChatAnimation() {
    lerp = function (a, b, u) {
        return (1 - u) * a + u * b
    };

    fade = function (element, property, start, end, duration) {
        var interval = 10
        var steps = duration / interval
        var step_u = 1.0 / steps
        var u = 0.0
        var theInterval = setInterval(function () {
            if (u >= 1.0) { clearInterval(theInterval) }
            var r = parseInt(lerp(start.r, end.r, u))
            var g = parseInt(lerp(start.g, end.g, u))
            var b = parseInt(lerp(start.b, end.b, u))
            var colorname = `rgba( ${r},${g},${b}, 0.25 )`
            el.setAttribute('style', `${property}: ${colorname} !important`)
            u += step_u;
        }, interval);
    };
    if (!frameBody) return
    el = frameBody.querySelector('.chat-room')
    property = 'background-color'
    startColor = { r: 145, g: 71, b: 255 }
    endColor = { r: 31, g: 31, b: 35 }
    fade(el, 'background-color', startColor, endColor, 1000)
}


// Build overlay
function buildOverlay() {
    overlayWrapper = document.createElement('div')
    overlayWrapper.className = 'wrapper overlay-wrapper'

    let video = document.querySelector('video')
    let url = new URL(video.baseURI)
    let slug = url.pathname

    let chatFrame = document.createElement('iframe')
    chatFrame.className = 'chat-frame'
    chatFrame.src = `https://www.twitch.tv${slug}/chat`
    chatFrame.height = '100%'
    chatFrame.width = '100%'
    chatFrame.onload = function () {
        frameBody = this.contentWindow.document.body;
        let dragBox = buildDragElement()
        addOverlayFunctions(overlayWrapper, dragBox, frameBody)
        overlayWrapper.appendChild(dragBox)
    }
    overlayWrapper.appendChild(chatFrame)

    return overlayWrapper
}


function buildDragElement() {
    let dragWrapper = document.createElement('div')
    dragWrapper.className = 'drag-wrapper tw-mg-l-05'
    dragWrapper.style.visibility = 'hidden'

    let stylesheet = document.createElement('link')
    stylesheet.rel = 'stylesheet'
    stylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'

    let dragBtn = document.createElement('button')
    dragBtn.className = 'drag-btn tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--primary tw-inline-flex tw-justify-content-center'

    let label = document.createElement('i')
    label.className = 'fa fa-arrows-alt tw-align-items-center tw-core-button-label tw-flex tw-flex-grow-0'


    dragBtn.appendChild(label)
    dragWrapper.appendChild(stylesheet)
    dragWrapper.appendChild(dragBtn)
    setDraggable(dragWrapper, overlay)

    return dragWrapper
}


function addOverlayFunctions(overlayWrapper, dragBox, frameBody) {
    overlayWrapper.onmouseover = () => {
        overlayWrapper.style.border = '2px solid rgb(145,71,255)'
        overlayWrapper.style.resize = 'auto'
        dragBox.style.visibility = 'visible'
        let chatInput = frameBody.querySelector('.chat-input')
        chatInput.classList.remove('chat-input_hide')

    }
    overlayWrapper.onmouseout = () => {
        overlayWrapper.style.borderStyle = 'hidden'
        overlayWrapper.style.resize = 'none'
        dragBox.style.visibility = 'hidden'
        let chatInput = frameBody.querySelector('.chat-input')
        chatInput.classList.add('chat-input_hide')
    }
}


function setDraggable(draggable, container) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    draggable.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        container.style.top = (container.offsetTop - pos2) + "px";
        container.style.left = (container.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


// Load new overlay for new streamer
function observeChannelChange(videoPlayer) {
    observer = new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.attributeName === 'src') {
                console.log("src change")
                observer.disconnect()
                if (overlay) overlay.remove()
                if (frameBody) frameBody = null
                waitForVideo()
            }
        }

    });
    const config = { attributes: true, subtree: true };
    observer.observe(videoPlayer, config);
}


waitForVideo()