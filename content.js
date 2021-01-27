let chatWrapper = document.createElement('div');
chatWrapper.className = 'chat-wrapper';
chatWrapper.style.display = 'flex'; // TODO NONE

let chatHeader = document.createElement('div');
chatHeader.className = 'chat-header';
chatWrapper.appendChild(chatHeader);

let chatContainer = document.createElement('div');
chatContainer.className = 'chat-container';
chatWrapper.appendChild(chatContainer);

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
        console.log("Looking for chat..")
        chat = document.querySelector('.stream-chat .simplebar-scroll-content');
        if (chat) {
            console.log("Found chat...")
            clearInterval(int);
            init();
        }
    }, 500);
}

function init() {
    
    buildChatObserver();

    const fsElement = document.querySelector(
        ".video-player__overlay"
      );
    fsElement.appendChild(chatWrapper)

    let videoPlayer = document.querySelector('.video-player');
    videoPlayer.addEventListener('fullscreenchange', changedFullscreen, false);

}

function changedFullscreen(){
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
        //chatWrapper.style.display = 'flex';
    } else {
        // chatWrapper.style.display = 'none';  // TODO NONE UNCOMMENT
    };
    console.log("fs state", isFullscreen)
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
            else if (mutation.type === 'attributes') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(chatNode, config);

    // Later, you can stop observing
    //observer.disconnect();
}

function addNewChatMsg(mutation) {
    let newMessage = document.createElement('div');

    mutation.addedNodes.forEach(node => {
        const clone = node.cloneNode(true)
        newMessage.appendChild(clone)
    })

    visibleChat.unshift(newMessage)

    if (visibleChat.length > 50) {
        visibleChat.pop()
    }

    chatContainer.innerHTML = '';

    visibleChat.forEach(message => chatContainer.appendChild(message));

}



waitForChat();

