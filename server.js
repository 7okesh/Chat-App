const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for external origins and cross-origin clients
app.use(cors());

// Serve static frontend assets from root directory
app.use(express.static(path.join(__dirname)));

// Helper to get local Wi-Fi / LAN IPv4 addresses
function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({ name, ip: iface.address });
            }
        }
    }
    return addresses;
}

// Health check endpoint for monitoring & deployment
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        onlineUsers: Object.keys(users).length,
        timestamp: new Date().toISOString()
    });
});

// Explicit route for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io initialization with 50MB buffer support for media (images, docs, videos)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 50 * 1024 * 1024 // 50MB payload limit for file transfers
});

// Active users registry: { [socketId]: { id: string, name: string, joinedAt: Date } }
const users = {};

io.on('connection', (socket) => {
    // Send current online user count immediately upon connection
    socket.emit('online-count', Object.keys(users).length);

    // When a new user joins
    socket.on('new-user-joined', (rawName) => {
        let name = (typeof rawName === 'string') ? rawName.trim() : '';
        if (!name) {
            name = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        // Limit username length
        name = name.substring(0, 30);

        users[socket.id] = {
            id: socket.id,
            name: name,
            joinedAt: new Date()
        };

        const onlineCount = Object.keys(users).length;

        // Notify other clients about the new user
        socket.broadcast.emit('user-joined', {
            name: name,
            userCount: onlineCount
        });

        // Update the joining user with confirmation
        socket.emit('joined-success', {
            name: name,
            userCount: onlineCount
        });

        // Broadcast updated count to all connected clients
        io.emit('online-count', onlineCount);
    });

    // When a standard text message is sent
    socket.on('send', (rawMessage) => {
        const user = users[socket.id];
        if (!user) return;

        let message = '';
        if (typeof rawMessage === 'string') {
            message = rawMessage.trim();
        } else if (rawMessage && typeof rawMessage.message === 'string') {
            message = rawMessage.message.trim();
        }

        // Prevent empty messages or messages exceeding max length
        if (!message) return;
        if (message.length > 2000) {
            message = message.substring(0, 2000);
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        socket.broadcast.emit('receive', {
            message: message,
            name: user.name,
            time: timeStr
        });
    });

    // When a file (image, video, document, or archive) is sent
    socket.on('send-file', (filePayload) => {
        const user = users[socket.id];
        if (!user || !filePayload || !filePayload.data) return;

        const fileName = (typeof filePayload.name === 'string') ? filePayload.name.substring(0, 255) : 'file';
        const fileType = (typeof filePayload.type === 'string') ? filePayload.type : 'application/octet-stream';
        const fileSize = Number(filePayload.size) || 0;
        const caption = (typeof filePayload.caption === 'string') ? filePayload.caption.trim().substring(0, 1000) : '';

        // Enforce max 50MB file size limit
        if (fileSize > 50 * 1024 * 1024) {
            socket.emit('error-msg', 'File size exceeds the 50MB limit.');
            return;
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Broadcast the file to other participants
        socket.broadcast.emit('receive-file', {
            sender: user.name,
            name: fileName,
            type: fileType,
            size: fileSize,
            data: filePayload.data,
            caption: caption,
            time: timeStr
        });
    });

    // User typing indicators
    socket.on('typing', () => {
        const user = users[socket.id];
        if (user) {
            socket.broadcast.emit('user-typing', { name: user.name });
        }
    });

    socket.on('stop-typing', () => {
        const user = users[socket.id];
        if (user) {
            socket.broadcast.emit('user-stop-typing', { name: user.name });
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            const onlineCount = Object.keys(users).length;
            socket.broadcast.emit('left', {
                name: user.name,
                userCount: onlineCount
            });
            io.emit('online-count', onlineCount);
        }
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    const localIps = getLocalIpAddresses();
    console.log(`=======================================================`);
    console.log(` 💬 ChitChat Server running on port ${PORT}`);
    console.log(` 💻 Local:    http://localhost:${PORT}`);
    localIps.forEach(net => {
        console.log(` 📱 Wi-Fi:    http://${net.ip}:${PORT}  (${net.name})`);
    });
    console.log(` 🩺 Health:   http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
});
