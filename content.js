let chatWrapper = document.createElement('div');
chatWrapper.className = 'chat-wrapper';
chatWrapper.style.display = 'flex';

let chatHeader = document.createElement('div');
chatHeader.className = 'chat-header';

let closeBtn = document.createElement('button');
closeBtn.className = 'close-button'
closeBtn.innerHTML = 'close';

let chatArea = document.createElement('div');
chatArea.className = 'chat-area';

chatHeader.appendChild(closeBtn);
chatWrapper.appendChild(chatHeader);
chatWrapper.appendChild(chatArea);

let fsElement = null;
let chatObserver = null;
let videoSrcObserver = null;

/** Waits until chat DOM is built and calls init() after */
function waitForChat() {
    const timeNow = Date.now();
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.log('Could not find chat')
            clearInterval(int);
        }
        const chat = document.querySelector('.stream-chat .simplebar-scroll-content');
        if (chat) {
            console.log("chat found");
            clearInterval(int);
            init();
        }
    }, 500);
}

function init() {
    buildChatObserver();
    buildVideoObserver();
    addChatFunctions();
}

function changedFullscreen() {
    if (document.fullscreenElement) {
        fsElement = document.querySelector(
            ".video-player__overlay"
        );
        chatWrapper.style.display = 'flex';
        fsElement.appendChild(chatWrapper);
    } else {
        // chatWrapper.remove();
    };
}

function buildChatObserver() {
    if (chatObserver) chatObserver.disconnect();

    let chatNode = document.querySelector('.stream-chat .simplebar-scroll-content');
    chatObserver = new MutationObserver(function (mutationsList, chatObserver) {

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => addNewChatMsg(node));
            }
        }
    });
    const config = { attributes: true, childList: true, subtree: true };
    chatObserver.observe(chatNode, config);
}

function buildVideoObserver() {
    if (videoSrcObserver) videoSrcObserver.disconnect();

    let videoPlayer = document.querySelector('.video-player');
    videoPlayer.addEventListener('fullscreenchange', changedFullscreen, false);
    videoSrcObserver = new MutationObserver(function (mutationsList, videoSrcObserver) {

        for (const mutation of mutationsList) {
            if (mutation.attributeName === 'src') {
                console.log("src change");
                chatArea.innerHTML = '';
                waitForChat();
            }
            else if (mutation.attributeName === 'data-a-player-type') {
                console.log("player-type changed")
                waitForChat();
            }
        }

    });
    const config = { attributes: true, subtree: true };
    videoSrcObserver.observe(videoPlayer, config);
}

function addNewChatMsg(node) {
    const newChatLine = node.cloneNode(true);

    if (newChatLine.className && newChatLine.className.startsWith('chat-line')) {
        console.log("chat-line adding", newChatLine);
        newChatLine.className = 'chat-line__message';

        const msgLinks = node.getElementsByClassName('link-fragment');
        for (var i = 0; i < msgLinks.length; i++) {
            if (msgLinks[i].host === 'clips.twitch.tv'){

               
                const slug = msgLinks[i].pathname.substring(1);

                let cardLink = newChatLine.getElementsByClassName('chat-card')[0];
                console.log("cl",cardLink);
                if (cardLink){
                    cardLink.onClick = () => console.log("clickedme"); // TODO FIX
                }
            }
        }
        
    

    if (chatArea.childElementCount > 100) chatArea.removeChild(chatArea.childNodes[chatArea.childElementCount - 1]);
    chatArea.prepend(newChatLine);
    }
}


function handleTwitchClip(slug) {
    console.log('twitch clip link');

    let clipOverlay = document.createElement('div');
    clipOverlay.className = 'clip-overlay';
    let clipWrapper = document.createElement('div');
    clipWrapper.className = 'clip-wrapper';
    clipWrapper.appendChild(clipOverlay);

    let clipFrame = document.createElement('iframe');
    clipFrame.className = "clip-frame";
    clipFrame.src = `https://clips.twitch.tv/embed?clip=${slug}&parent=twitch.tv&autoplay=true`;
    clipFrame.width = "100%";
    clipFrame.height = "100%";

    clipWrapper.appendChild(clipFrame);
    setDraggable(clipOverlay, clipWrapper);
    let videoPlayer = document.querySelector('.video-player');
    videoPlayer.appendChild(clipWrapper);
}

function addChatFunctions() {
    chatWrapper.onmouseover = () => {
        chatHeader.style.display = 'flex';
        chatWrapper.style.border = '2px solid grey';
        chatWrapper.style.resize = 'auto';
    }
    chatWrapper.onmouseout = () => {
        chatHeader.style.display = 'none';
        chatWrapper.style.borderStyle = 'hidden';
        chatWrapper.style.resize = 'none';
    }
    closeBtn.addEventListener("click", function () {
        chatWrapper.style.display = 'none';
    });

    setDraggable(chatHeader, chatWrapper);
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

waitForChat();