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
    if(document.fullscreenElement) {
        const fsElement = document.querySelector(
            ".video-player__overlay"
        );
        chatWrapper.style.display = 'flex';
        fsElement.appendChild(chatWrapper);
    } else {
        chatWrapper.remove();
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
    const clone = node.cloneNode(true);

    if (clone.className && clone.className.startsWith('chat-line')) {
        console.log("chat-line adding")
        clone.className = 'chat-line__message';
        if (chatArea.childElementCount > 100) chatArea.removeChild(chatArea.childNodes[chatArea.childElementCount - 1]);
        chatArea.prepend(clone)
    }
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

    dragChat();
}

// Make chat draggable https://www.w3schools.com/howto/howto_js_draggable.asp
function dragChat() {

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    chatHeader.onmousedown = dragMouseDown;

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
        chatWrapper.style.top = (chatWrapper.offsetTop - pos2) + "px";
        chatWrapper.style.left = (chatWrapper.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

waitForChat();