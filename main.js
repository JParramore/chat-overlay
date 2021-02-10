let overlay = null
let toggleOverlayButton = null
let frameBody = null

/** Waits until chat DOM is built and calls init() after */
function waitForVideo() {
    const timeNow = Date.now()
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            clearInterval(int)
        }
        const video = document.querySelector('.video-player')
        console.log(video)
        if (video && video.getAttribute('data-a-player-type') === 'site') {
            init()
            clearInterval(int)
        }
    }, 500)
}


// DOM content loaded
function init() {
    overlay = buildOverlay()
    toggleOverlayButton = buildToggleOverlayButton()

    let videoPlayer = document.querySelector('.video-player')
    observeChannelChange(videoPlayer)

    let playerControls = document.querySelector('.player-controls__right-control-group')
    playerControls.prepend(toggleOverlayButton)

    fsElement = document.querySelector('.video-player__overlay');
    fsElement.appendChild(overlay)
}


// Build and insert toggle overlay
function buildToggleOverlayButton() {
    let tglWrapper = document.createElement('div')
    tglWrapper.className = 'tgl-overlay-btn-wrapper tw-relative tw-tooltip__container'

    let tooltip = document.createElement('div')
    tooltip.className = 'tw-tooltip tw-tooltip--align-right tw-tooltip--up'
    tooltip.role = 'tooltip'
    tooltip.innerHTML = 'Toggle Overlay'

    let toggleOverlayBtn = document.createElement('button')
    toggleOverlayBtn.className = 'toggle-overlay-btn tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-button-icon tw-button-icon--overlay tw-core-button tw-core-button--overlay tw-justify-content-center'
    toggleOverlayBtn.ariaLabel = 'Toggle Chat Overlay'
    toggleOverlayBtn.onclick = function () {
        if (!overlay.style.display || overlay.style.display == 'none') {
            overlay.style.display = 'flex'
            flashChatAnimation(frameBody.settings.background) // TODO: null when too fast
        } else {
            overlay.style.display = 'none'
        }
    }

    let span = document.createElement('span')
    span.className = 'tw-button-icon__icon'

    let svgContainer = document.createElement('div')
    svgContainer.setAttribute('style', 'width: 2rem; height: 2rem;')

    svgContainer.innerHTML = `<svg class="svg-icon" viewBox="0 0 20 20">
    <path fill="none" d="M18.783,13.198H15.73c-0.431,0-0.78-0.35-0.78-0.779c0-0.433,0.349-0.78,0.78-0.78h2.273V3.652H7.852v0.922
    c0,0.433-0.349,0.78-0.78,0.78c-0.431,0-0.78-0.347-0.78-0.78V2.872c0-0.43,0.349-0.78,0.78-0.78h11.711
    c0.431,0,0.78,0.35,0.78,0.78v9.546C19.562,12.848,19.214,13.198,18.783,13.198z"></path>
    <path fill="none" d="M12.927,17.908H1.217c-0.431,0-0.78-0.351-0.78-0.78V7.581c0-0.43,0.349-0.78,0.78-0.78h11.709
    c0.431,0,0.78,0.35,0.78,0.78v9.546C13.706,17.557,13.357,17.908,12.927,17.908z M1.997,16.348h10.15V8.361H1.997V16.348z"></path>
</svg>`

    toggleOverlayBtn.appendChild(span)
    span.appendChild(svgContainer)

    tglWrapper.appendChild(tooltip)
    tglWrapper.appendChild(toggleOverlayBtn)

    return tglWrapper
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


// Fade in transition to make it clear chat has been opened https://stackoverflow.com/a/11293378/14549357
function flashChatAnimation(backgroundSettings) {
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
            var a = parseInt(lerp(start.a, end.a, u))
            var colorname = `rgba( ${r},${g},${b},${a / 100.0} )`
            el.setAttribute('style', `${property}: ${colorname} !important`)
            u += step_u;
        }, interval);
    };

    el = frameBody.querySelector('.chat-room')
    property = 'background-color'
    let { red, green, blue, alpha } = backgroundSettings
    startColor = { r: 145, g: 71, b: 255, a: 100 }
    endColor = { r: red, g: green, b: blue, a: (alpha * 100.0) }
    fade(el, 'background-color', startColor, endColor, 1000)
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
    dragBtn.style.cursor = 'move'

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
        overlayWrapper.style.border = '2px solid transparent'
        overlayWrapper.style.resize = 'none'
        dragBox.style.visibility = 'hidden'
        let chatInput = frameBody.querySelector('.chat-input')
        chatInput.classList.add('chat-input_hide')
    }
}


function setDraggable(draggable, container) {
    let fsElement = document.querySelector('.video-player__overlay');
    let videoPlayerHeight = null, videoPlayerWidth = null

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    draggable.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        videoPlayerHeight = fsElement.offsetHeight
        videoPlayerWidth = fsElement.offsetWidth

        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        frameBody.onmouseup = closeDragElement;
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
        let offsetTop = container.offsetTop - pos2
        let offsetLeft = container.offsetLeft - pos1
        container.style.top = offsetTop + "px";
        container.style.left = offsetLeft + "px";

        if (container.offsetTop < 0) {
            container.style.top = '0px'
        }
        if (container.offsetLeft < 0) {
            container.style.left = '0px'
        }
        if (container.offsetTop + container.offsetHeight > videoPlayerHeight) {
            container.style.top = `${videoPlayerHeight - container.offsetHeight}px`
        }
        if (container.offsetLeft + container.offsetWidth > videoPlayerWidth) {
            container.style.left = `${videoPlayerWidth - container.offsetWidth}px`
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        frameBody.onmouseup = null;

        document.onmousemove = null;
    }
}


// Load new overlay for new streamer
function observeChannelChange(videoPlayer) {
    observer = new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.attributeName === 'src') {
                observer.disconnect()
                if (overlay) overlay.remove()
                if (toggleOverlayButton) toggleOverlayButton.remove()
                if (frameBody) frameBody = null
                waitForVideo()
            }
        }

    });
    const config = { attributes: true, subtree: true };
    observer.observe(videoPlayer, config);
}


waitForVideo()