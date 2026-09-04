# 💬 ChitChat - Real-Time Socket.IO Chat App

A fast, lightweight, and modern real-time chat application built with **Node.js**, **Express**, and **Socket.IO**.

![ChitChat Preview](chat.png)

---

## ✨ Features

- ⚡ **Real-Time Bidirectional Messaging**: Low-latency communication powered by Socket.IO.
- 🎨 **Modern Responsive UI**: Clean chat bubbles, smooth animations, glassmorphism header, and mobile-friendly layout.
- 👥 **Live Online User Tracking**: Real-time counter of currently connected participants.
- 🔔 **Audio Notifications**: Sound alerts on incoming messages with a 1-click mute/unmute toggle (`ring.mp3`).
- ✍️ **Typing Indicators**: Live indication when someone is typing.
- 🏷️ **Custom Display Name**: Clean join dialog that remembers your username using `localStorage`.
- 🩺 **Health Check API**: Built-in `/health` endpoint for uptime monitoring and active status reporting.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO, CORS
- **Frontend**: HTML5, CSS3 (Modern Flexbox & Glassmorphism), Vanilla JavaScript (ES6+)
- **Assets**: Custom chat logo (`chat.png`), Audio notification sound (`ring.mp3`)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
- **Standard start**:
  ```bash
  npm start
  ```
- **Development mode (auto-reload)**:
  ```bash
  npm run dev
  ```

### 4. Open the App
Visit [http://localhost:8000](http://localhost:8000) in your browser. Open multiple tabs or windows to chat in real time!

---

## 📁 Project Structure

```
Chat-App/
├── .github/
│   └── workflows/
│       └── node.js.yml      # GitHub CI workflow
├── css/
│   └── style.css            # Responsive styles & theme variables
├── js/
│   └── client.js            # Client-side Socket.IO events & UI logic
├── nodeServer/
│   └── index.js             # Backward compatibility stub
├── .gitignore               # Ignored files (node_modules, logs)
├── Procfile                 # Process declaration
├── chat.png                 # App logo
├── index.html               # Main chat application interface
├── package.json             # Dependencies & scripts
├── ring.mp3                 # Notification sound
├── server.js                # Unified Express + Socket.IO server
└── README.md                # Project documentation
```
