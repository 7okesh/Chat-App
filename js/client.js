// Helper: Determine Socket.IO server connection URL
const isGhPages = window.location.hostname.endsWith('github.io');
const ghBanner = document.getElementById('gh-pages-banner');
const customServerInp = document.getElementById('custom-server-inp');
const saveServerBtn = document.getElementById('save-server-btn');

let serverUrl;
if (isGhPages) {
    if (ghBanner) ghBanner.classList.remove('hidden');
    const savedServer = localStorage.getItem('chitchat_server_url');
    if (savedServer) {
        serverUrl = savedServer;
        if (customServerInp) customServerInp.value = savedServer;
    }
} else if (!window.location.protocol.startsWith('http')) {
    // If opened directly from file system (file:///)
    serverUrl = 'http://localhost:8000';
}
// If served from Express (e.g. http://localhost:8000 or http://192.168.1.5:8000), serverUrl is undefined (same origin)

if (saveServerBtn && customServerInp) {
    saveServerBtn.addEventListener('click', () => {
        const url = customServerInp.value.trim();
        if (url) {
            localStorage.setItem('chitchat_server_url', url);
            window.location.reload();
        }
    });
}

// Initialize Socket.io connection
const socket = io(serverUrl);

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

// File Upload DOM Elements
const fileInput = document.getElementById('fileInp');
const attachBtn = document.getElementById('attach-btn');
const attachmentPreviewBar = document.getElementById('attachment-preview-bar');
const attachmentIcon = document.getElementById('attachment-icon');
const attachmentName = document.getElementById('attachment-name');
const attachmentSize = document.getElementById('attachment-size');
const cancelAttachmentBtn = document.getElementById('cancel-attachment-btn');
const sendBtn = document.getElementById('send-btn');
const dragDropOverlay = document.getElementById('drag-drop-overlay');

// Lightbox Elements
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxDownloadLink = document.getElementById('lightbox-download-link');
const closeLightbox = document.getElementById('close-lightbox');

let selectedFile = null;

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
        console.debug('Audio play skipped (waiting for user interaction):', err.message);
    });
}

// User state
let currentUsername = localStorage.getItem('chitchat_username') || '';
let isJoined = false;

if (usernameInp && currentUsername) {
    usernameInp.value = currentUsername;
}

function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function removePlaceholder() {
    if (placeholder && placeholder.parentNode) {
        placeholder.remove();
    }
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format bytes into readable string (KB / MB)
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get file icon based on MIME type or extension
function getFileIcon(type = '', name = '') {
    const ext = name.split('.').pop().toLowerCase();
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf' || ext === 'pdf') return '📕';
    if (ext === 'doc' || ext === 'docx') return '📘';
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return '📗';
    if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar') return '🗂️';
    return '📄';
}

// Update attachment preview bar UI
function updateAttachmentPreview() {
    if (!selectedFile) {
        attachmentPreviewBar.classList.add('hidden');
        return;
    }
    attachmentIcon.innerText = getFileIcon(selectedFile.type, selectedFile.name);
    attachmentName.innerText = selectedFile.name;
    attachmentSize.innerText = formatBytes(selectedFile.size);
    attachmentPreviewBar.classList.remove('hidden');
}

// File Attachment Button click
if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', () => {
        fileInput.click();
    });
}

// File input change handler
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 50 * 1024 * 1024) {
                alert('File size exceeds the 50MB limit.');
                fileInput.value = '';
                return;
            }
            selectedFile = file;
            updateAttachmentPreview();
            messageInput.focus();
        }
    });
}

// Cancel attachment
if (cancelAttachmentBtn) {
    cancelAttachmentBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        updateAttachmentPreview();
    });
}

// Drag & Drop functionality
const chatWrapper = document.querySelector('.chat-wrapper');
if (chatWrapper && dragDropOverlay) {
    ['dragenter', 'dragover'].forEach(eventName => {
        chatWrapper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragDropOverlay.classList.remove('hidden');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        chatWrapper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragDropOverlay.classList.add('hidden');
        }, false);
    });

    chatWrapper.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files[0]) {
            const file = dt.files[0];
            if (file.size > 50 * 1024 * 1024) {
                alert('File size exceeds the 50MB limit.');
                return;
            }
            selectedFile = file;
            updateAttachmentPreview();
            messageInput.focus();
        }
    });
}

// Lightbox functions
function openLightbox(src, name) {
    if (lightboxModal && lightboxImg && lightboxDownloadLink) {
        lightboxImg.src = src;
        lightboxDownloadLink.href = src;
        lightboxDownloadLink.download = name;
        lightboxModal.classList.remove('hidden');
    }
}

if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
        lightboxModal.classList.add('hidden');
    });
}

if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.add('hidden');
        }
    });
}

// Append plain text message
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

// Append rich file message (Image, Short Video, or Document)
const appendFileMessage = ({ sender, name, type, size, data, caption, position, time = getCurrentTime() }) => {
    removePlaceholder();

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', position);

    const senderElement = document.createElement('span');
    senderElement.classList.add('message-sender');
    senderElement.innerText = sender;
    messageElement.appendChild(senderElement);

    // Optional caption
    if (caption) {
        const captionElement = document.createElement('div');
        captionElement.classList.add('message-text');
        captionElement.innerText = caption;
        messageElement.appendChild(captionElement);
    }

    // Media content rendering based on type
    const isImage = type.startsWith('image/');
    const isVideo = type.startsWith('video/');

    if (isImage) {
        const img = document.createElement('img');
        img.src = data;
        img.alt = name;
        img.classList.add('chat-media-image');
        img.title = 'Click to enlarge';
        img.addEventListener('click', () => openLightbox(data, name));
        messageElement.appendChild(img);
    } else if (isVideo) {
        const video = document.createElement('video');
        video.controls = true;
        video.classList.add('chat-media-video');
        const source = document.createElement('source');
        source.src = data;
        source.type = type;
        video.appendChild(source);
        messageElement.appendChild(video);
    } else {
        // Document / Archive / Other file
        const fileCard = document.createElement('div');
        fileCard.classList.add('file-card');

        const iconSpan = document.createElement('span');
        iconSpan.classList.add('file-icon');
        iconSpan.innerText = getFileIcon(type, name);

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('file-details');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('file-name');
        nameSpan.innerText = name;
        nameSpan.title = name;

        const sizeSpan = document.createElement('span');
        sizeSpan.classList.add('file-size');
        sizeSpan.innerText = formatBytes(size);

        detailsDiv.appendChild(nameSpan);
        detailsDiv.appendChild(sizeSpan);
        fileCard.appendChild(iconSpan);
        fileCard.appendChild(detailsDiv);

        messageElement.appendChild(fileCard);
    }

    // Download Button for all files
    const downloadBtn = document.createElement('a');
    downloadBtn.href = data;
    downloadBtn.download = name;
    downloadBtn.classList.add('file-download-btn');
    downloadBtn.innerHTML = `⬇️ Download (${formatBytes(size)})`;
    messageElement.appendChild(downloadBtn);

    // Timestamp
    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.innerText = time;
    messageElement.appendChild(timeElement);

    messageContainer.appendChild(messageElement);
    scrollToBottom();

    if (position === 'left') {
        playNotificationSound();
    }
};

// Append system announcement (join/leave)
const appendSystemMessage = (message) => {
    removePlaceholder();

    const systemElement = document.createElement('div');
    systemElement.classList.add('message', 'system-message');
    systemElement.innerText = message;

    messageContainer.appendChild(systemElement);
    scrollToBottom();
};

// Join Modal submission
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredName = usernameInp.value.trim();
    if (!enteredName) return;

    currentUsername = enteredName;
    localStorage.setItem('chitchat_username', currentUsername);

    joinModal.classList.add('hidden');
    isJoined = true;

    socket.emit('new-user-joined', currentUsername);
    messageInput.focus();
});

// Socket connection listeners
socket.on('connect', () => {
    connectionStatus.innerText = 'Connected';
    connectionBadge.className = 'badge badge-connected';

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

socket.on('receive-file', (data) => {
    appendFileMessage({
        sender: data.sender || 'User',
        name: data.name,
        type: data.type,
        size: data.size,
        data: data.data,
        caption: data.caption,
        position: 'left',
        time: data.time || getCurrentTime()
    });
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

socket.on('error-msg', (msg) => {
    alert(msg);
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

// Form submit handler (Text or File)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!isJoined) {
        joinModal.classList.remove('hidden');
        usernameInp.focus();
        return;
    }

    const message = messageInput.value.trim();

    // If a file is selected to send
    if (selectedFile) {
        const fileToSend = selectedFile;
        const caption = message;

        // Visual feedback
        sendBtn.disabled = true;
        sendBtn.innerText = 'Sending...';

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            const fileData = uploadEvent.target.result;

            socket.emit('send-file', {
                name: fileToSend.name,
                type: fileToSend.type || 'application/octet-stream',
                size: fileToSend.size,
                data: fileData,
                caption: caption
            });

            appendFileMessage({
                sender: 'You',
                name: fileToSend.name,
                type: fileToSend.type || 'application/octet-stream',
                size: fileToSend.size,
                data: fileData,
                caption: caption,
                position: 'right',
                time: getCurrentTime()
            });

            // Reset file and form state
            selectedFile = null;
            fileInput.value = '';
            updateAttachmentPreview();
            messageInput.value = '';
            messageInput.focus();

            sendBtn.disabled = false;
            sendBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <span>Send</span>
            `;
        };

        reader.readAsDataURL(fileToSend);
        return;
    }

    // Standard text message
    if (!message) return;

    appendMessage({ name: 'You', message: message, position: 'right' });
    socket.emit('send', message);

    isTyping = false;
    socket.emit('stop-typing');

    messageInput.value = '';
    messageInput.focus();
});