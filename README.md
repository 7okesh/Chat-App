# 💬 ChitChat - Real-Time Socket.IO Chat App

A fast, lightweight, and modern real-time chat application built with **Node.js**, **Express**, and **Socket.IO**.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=google-chrome)](https://7okesh.github.io/Chat-App/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/7okesh/Chat-App/node.js.yml?branch=main&style=for-the-badge&logo=github)](https://github.com/7okesh/Chat-App/actions)

---

## 🌐 Live Demo

- **Live Web App**: [https://7okesh.github.io/Chat-App/](https://7okesh.github.io/Chat-App/)
- **Local Wi-Fi Network**: `http://localhost:8000` (or `http://192.168.1.5:8000` across devices)

![ChitChat Preview](chat.png)

---

## ✨ Features

- ⚡ **Real-Time Bidirectional Messaging**: Low-latency communication powered by Socket.IO.
- 📎 **Media & File Sharing**: Send **images** (PNG, JPG, GIF, WebP), **short videos** (MP4, WebM), and **documents** (PDF, DOCX, XLSX, ZIP, etc.) up to 50MB.
- 👁️ **In-Chat Preview & Lightbox**: Instant inline image viewer with zoom lightbox and video player.
- ⬇️ **One-Click File Downloads**: Receivers can easily view and download any received files with original filenames.
- 📱 **Multi-Device Wi-Fi Chat**: Chat between phones, tablets, and laptops on the same local Wi-Fi network.
- 🎨 **Modern Responsive UI**: Clean chat bubbles, smooth animations, glassmorphism header, drag-and-drop file upload, and mobile layout.
- 👥 **Live Online User Tracking**: Real-time counter of currently connected participants.
- 🔔 **Audio Notifications**: Sound alerts on incoming messages with a 1-click mute/unmute toggle (`ring.mp3`).
- ✍️ **Typing Indicators**: Live indication when someone is typing.
- 🏷️ **Custom Display Name**: Clean join dialog that remembers your username using `localStorage`.
- 🩺 **Health Check API**: Built-in `/health` endpoint for uptime monitoring and active status reporting.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO (50MB buffer support), CORS
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

### 4. Connect Devices

- **On your PC**: Open [http://localhost:8000](http://localhost:8000)
- **On Phone/Other Device (Same Wi-Fi)**: Open your PC's IP address:
  ```
  http://<YOUR_WIFI_IP>:8000
  ```
  *(The exact URL is automatically displayed in your terminal when you start the server, e.g. `http://192.168.1.5:8000`)*

---

## 📁 Project Structure

```
Chat-App/
├── .github/
│   └── workflows/
│       └── node.js.yml      # GitHub CI workflow
├── css/
│   └── style.css            # Responsive styles, media bubbles & theme variables
├── js/
│   └── client.js            # Client-side Socket.IO events, file uploads & UI logic
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
