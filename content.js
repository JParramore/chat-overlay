let chatWrapper = document.createElement('div');
chatWrapper.className = 'chat-wrapper';
chatWrapper.style.display = 'flex'; // TODO NONE

let chatHeader = document.createElement('div');
chatHeader.className = 'chat-header';
chatWrapper.appendChild(chatHeader);

let chatArea = document.createElement('div');
chatArea.className = 'chat-area';
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

    dragChat();
}

function changedFullscreen(){
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
        //chatWrapper.style.display = 'flex';
    } else {
        // chatWrapper.style.display = 'none';  // TODO NONE UNCOMMENT
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
        const clone = node.cloneNode(true);
        newMessage.appendChild(clone);
    })

    visibleChat.unshift(newMessage)

    if (visibleChat.length > 50) {
        visibleChat.pop();
    }

    chatArea.innerHTML = '';
    visibleChat.forEach(message => chatArea.appendChild(message));

}

function dragChat(){

    chatWrapper.onmouseover = () => {
        chatHeader.style.display = 'block';
    }
    chatWrapper.onmouseout = () => {
        chatHeader.style.display = 'none';
    }

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
      // calculate the new cursor position:
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

