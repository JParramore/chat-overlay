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

let visibleChat = [];
let isFullscreen = false;

/** Waits until chat DOM is built and calls init() after */
function waitForChat() {
    const timeNow = Date.now();
    const int = setInterval(() => {
        if (Date.now() - timeNow > 10000) {
            console.log('Could not find chat')
            clearInterval(int);
        }
        chat = document.querySelector('.stream-chat .simplebar-scroll-content');
        if (chat) {
            clearInterval(int);
            init();
        }
    }, 500);
}

function init() {
    buildChatObserver();

    let videoPlayer = document.querySelector('.video-player');
    videoPlayer.addEventListener('fullscreenchange', changedFullscreen, false);

    addChatFunctions();
}

function changedFullscreen() {
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
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
    let chatNode = document.querySelector('.stream-chat .simplebar-scroll-content');

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                addNewChatMsg(mutation);
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(chatNode, config);

    // TODO stop observing at some point
    //observer.disconnect();
}

function addNewChatMsg(mutation) {
    let newMessage = document.createElement('div');

    mutation.addedNodes.forEach(node => {
        const clone = node.cloneNode(true);
        if (clone.className === 'chat-line__message') newMessage.appendChild(clone);
    })

    if (visibleChat.length > 100) {
        visibleChat.pop();
    }
    visibleChat.unshift(newMessage)

    chatArea.innerHTML = '';
    visibleChat.forEach(message => chatArea.appendChild(message));

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