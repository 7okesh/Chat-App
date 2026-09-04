// Determine Socket.IO server connection URL
// If accessed via http/https (e.g. Render, Railway, or local Express server), connect to current origin.
// If opened directly from the filesystem (file:///), connect to localhost:8000.
const socketUrl = window.location.protocol.startsWith('http') ? undefined : 'http://localhost:8000';
const socket = io(socketUrl);

// DOM Elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById('message-container');
const placeholder = document.getElementById('chat-placeholder');
const connectionStatus = document.getElementById('connection-status');
const connectionBadge = document.getElementById('connection-badge');
const onlineCountElem = document.getElementById('online-count');
const typingIndicator = document.getElementById('typing-indicator');
const typingText = typingIndicator.querySelector('.typing-text');
const soundToggle = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const joinModal = document.getElementById('join-modal');
const joinForm = document.getElementById('join-form');
const usernameInp = document.getElementById('username-inp');

// Audio setup with mute state
let isMuted = localStorage.getItem('chitchat_muted') === 'true';
const audio = new Audio('ring.mp3');

function updateSoundButton() {
    if (soundIcon) {
        soundIcon.innerText = isMuted ? '🔇' : '🔊';
    }
}
updateSoundButton();

if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('chitchat_muted', isMuted);
        updateSoundButton();
    });
}

function playNotificationSound() {
    if (isMuted || !audio) return;
    audio.currentTime = 0;
    audio.play().catch((err) => {
        // Safe catch for browser autoplay restrictions before initial interaction
        console.debug('Audio play skipped (waiting for user interaction):', err.message);
    });
}

// User state
let currentUsername = localStorage.getItem('chitchat_username') || '';
let isJoined = false;

// Auto-fill saved username in the join modal if available
if (usernameInp && currentUsername) {
    usernameInp.value = currentUsername;
}

// Scroll chat to the newest message
function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Remove welcome placeholder once the conversation begins
function removePlaceholder() {
    if (placeholder && placeholder.parentNode) {
        placeholder.remove();
    }
}

// Format current time as HH:MM AM/PM
function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Append chat messages (left = received, right = sent)
const appendMessage = ({ name, message, position, time = getCurrentTime() }) => {
    removePlaceholder();

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', position);

    const senderElement = document.createElement('span');
    senderElement.classList.add('message-sender');
    senderElement.innerText = name;

    const textElement = document.createElement('div');
    textElement.classList.add('message-text');
    textElement.innerText = message;

    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.innerText = time;

    messageElement.appendChild(senderElement);
    messageElement.appendChild(textElement);
    messageElement.appendChild(timeElement);

    messageContainer.appendChild(messageElement);
    scrollToBottom();

    if (position === 'left') {
        playNotificationSound();
    }
};

// Append system announcements (joins, leaves)
const appendSystemMessage = (message) => {
    removePlaceholder();

    const systemElement = document.createElement('div');
    systemElement.classList.add('message', 'system-message');
    systemElement.innerText = message;

    messageContainer.appendChild(systemElement);
    scrollToBottom();
};

// Backward-compatible append function matching original signature
const append = (message, position) => {
    if (position === 'left') {
        // If it's incoming message formatted as "Name: text"
        const separatorIdx = message.indexOf(':');
        if (separatorIdx !== -1) {
            const sender = message.substring(0, separatorIdx).trim();
            const text = message.substring(separatorIdx + 1).trim();
            appendMessage({ name: sender, message: text, position: 'left' });
            return;
        }
    }
    
    // System notification check
    if (message.includes('joined the chat') || message.includes('left the chat')) {
        appendSystemMessage(message);
    } else {
        appendMessage({ name: position === 'right' ? 'You' : 'User', message, position });
    }
};

// Handle Join Modal Submission
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredName = usernameInp.value.trim();
    if (!enteredName) return;

    currentUsername = enteredName;
    localStorage.setItem('chitchat_username', currentUsername);

    // Hide the join modal
    joinModal.classList.add('hidden');
    isJoined = true;

    // Join room via socket
    socket.emit('new-user-joined', currentUsername);
    messageInput.focus();
});

// Socket.IO Connection Event Listeners
socket.on('connect', () => {
    connectionStatus.innerText = 'Connected';
    connectionBadge.className = 'badge badge-connected';

    // If already joined (e.g. on server reconnect), re-register user
    if (isJoined && currentUsername) {
        socket.emit('new-user-joined', currentUsername);
    }
});

socket.on('disconnect', () => {
    connectionStatus.innerText = 'Disconnected';
    connectionBadge.className = 'badge badge-disconnected';
});

socket.on('connect_error', () => {
    connectionStatus.innerText = 'Reconnecting...';
    connectionBadge.className = 'badge badge-connecting';
});

// Server Event Listeners
socket.on('online-count', (count) => {
    if (onlineCountElem) {
        onlineCountElem.innerText = count;
    }
});

socket.on('user-joined', (data) => {
    const name = typeof data === 'object' ? data.name : data;
    appendSystemMessage(`${name} joined the chat`);
    if (data.userCount && onlineCountElem) {
        onlineCountElem.innerText = data.userCount;
    }
});

socket.on('receive', (data) => {
    const message = data.message;
    const name = data.name || 'User';
    const time = data.time || getCurrentTime();
    appendMessage({ name, message, position: 'left', time });
});

socket.on('left', (data) => {
    const name = typeof data === 'object' ? data.name : data;
    if (name) {
        appendSystemMessage(`${name} left the chat`);
    }
    if (data && data.userCount && onlineCountElem) {
        onlineCountElem.innerText = data.userCount;
    }
});

// Typing indicator management
let typingTimeout;
socket.on('user-typing', (data) => {
    if (typingIndicator && typingText) {
        typingText.innerText = `${data.name} is typing`;
        typingIndicator.classList.remove('hidden');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            typingIndicator.classList.add('hidden');
        }, 3000);
    }
});

socket.on('user-stop-typing', () => {
    if (typingIndicator) {
        typingIndicator.classList.add('hidden');
    }
});

// Input typing events
let isTyping = false;
let stopTypingTimer;

messageInput.addEventListener('input', () => {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing');
    }
    clearTimeout(stopTypingTimer);
    stopTypingTimer = setTimeout(() => {
        isTyping = false;
        socket.emit('stop-typing');
    }, 1200);
});

// Message Send Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    if (!isJoined) {
        joinModal.classList.remove('hidden');
        usernameInp.focus();
        return;
    }

    appendMessage({ name: 'You', message: message, position: 'right' });
    socket.emit('send', message);

    isTyping = false;
    socket.emit('stop-typing');

    messageInput.value = '';
    messageInput.focus();
});