let chatWrapper = document.createElement('div');
chatWrapper.className = 'wrapper chat-wrapper';

let chatHeader = document.createElement('div');
chatHeader.className = 'header chat-header';

let alphaSlider = document.createElement('input');
let alphaSliderContainer = document.createElement('div');
alphaSlider.type = 'range';
alphaSlider.min = '1';
alphaSlider.max = '100';
alphaSlider.value = '0';
alphaSlider.className = 'alpha-slider';
alphaSliderContainer.className = 'slider-container';
alphaSliderContainer.appendChild(alphaSlider);

let dragBox = document.createElement('div')
dragBox.className = "drag-box"

chatHeader.appendChild(alphaSliderContainer);
chatHeader.appendChild(dragBox);

let tglChat = document.createElement('button')
tglChat.className = "toggle-chat"
tglChat.innerHTML = "tglchat"

chatWrapper.appendChild(chatHeader);

let chatInput = null;
let fsElement = null;
/** Waits until chat DOM is built and calls init() after */
function waitForVideo() {
    const timeNow = Date.now();
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.log('Could not find video')
            clearInterval(int);
        }
        const video = document.querySelector('.video-player')
        if (video) {
            init();
            clearInterval(int);
        }
    }, 500);
}


function init() {
    console.log("in init")
    let video = document.querySelector('video')
    let url = new URL(video.baseURI)
    let slug = url.pathname

    let chatFrame = document.createElement('iframe')
    chatFrame.className = 'chat-frame'
    chatFrame.src = `https://www.twitch.tv${slug}/chat`
    chatFrame.height = "100%"
    chatFrame.width = "100%"

    chatFrame.onload = function () {
        let frameBody = this.contentWindow.document.body;
        displayNoneObserver(frameBody, 'channel-leaderboard')
        displayNoneObserver(frameBody, 'community-points-summary')
        displayNoneObserver(frameBody, 'stream-chat-header')
        displayNoneObserver(frameBody, 'community-highlight-stack__scroll-area--disable', false)
        displayNoneObserver(frameBody, 'community-highlight-stack__backlog-card', false)
        displayNoneObserver(frameBody, 'chat-input')
        chatInput = frameBody.querySelector('.chat-input')
        addChatFunctions()
        buildToggleButton()

    }

    chatWrapper.appendChild(chatFrame)
    chatWrapper.style.display = 'flex'; // remove
    document.body.appendChild(chatWrapper); // todo remove for fs 

}

function buildToggleButton() {
    let playerControls = document.querySelector('.player-controls__right-control-group')

    playerControls.prepend(tglChat)
}

function displayNoneObserver(parent, className, stopLooking = true) {
    let observer = new MutationObserver(function (mutationsList, observer) {

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    let element = parent.querySelector(`.${className}`)
                    if (element) {
                        console.log("found class to hide: " + className, element)
                        element.classList.add(`${className}_hide`)
                        element.classList.remove('tw-flex')
                        element.classList.remove('tw-block')
                        if (stopLooking) observer.disconnect()
                    }
                })
            }
        }
    });
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(parent, config);
}



function addChatFunctions() {
    chatWrapper.onmouseover = () => {
        chatHeader.style.display = 'flex';
        chatWrapper.style.border = '2px solid grey';
        chatWrapper.style.resize = 'auto';
        chatInput.classList.remove('chat-input_hide');
    }
    chatWrapper.onmouseout = () => {
        chatHeader.style.display = 'none';
        chatWrapper.style.borderStyle = 'hidden';
        chatWrapper.style.resize = 'none';
        chatInput.classList.add('chat-input_hide');
    }
    
    tglChat.onclick = function () {
        chatWrapper.style.display == 'none' ? chatWrapper.style.display = 'flex' : chatWrapper.style.display = 'none'
    };

    alphaSlider.oninput = function () {
        console.log(this.value);
    }

    setDraggable(dragBox, chatWrapper);
}

// Make chat draggable https://www.w3schools.com/howto/howto_js_draggable.asp
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

waitForVideo();

