let overlay = null

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
    videoPlayer.overlay = overlay
    observeChannelChange(videoPlayer)

    videoPlayer.addEventListener('fullscreenchange', changedFullscreen, false)
}


// Fullscreen lister function
function changedFullscreen() {
    fsElement = document.querySelector(
        ".video-player__overlay"
    );
    fsElement.appendChild(this.overlay)
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
        !overlay.style.display || overlay.style.display == 'none' ? overlay.style.display = 'flex' : overlay.style.display = 'none'
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
        let frameBody = this.contentWindow.document.body;
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

    let dragBtn = document.createElement('button')
    dragBtn.className = 'drag-btn tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--primary tw-inline-flex tw-justify-content-center'

    let label = document.createElement('div')
    label.className = 'tw-align-items-center tw-core-button-label tw-flex tw-flex-grow-0 tw-core-button-label-text'
    label.innerHTML = 'Move'

    dragBtn.appendChild(label)
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
                waitForVideo()
            }
        }

    });
    const config = { attributes: true, subtree: true };
    observer.observe(videoPlayer, config);
}


waitForVideo()