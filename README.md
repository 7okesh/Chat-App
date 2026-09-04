# 💬 ChitChat - Real-Time Socket.IO Chat App

A fast, lightweight, and modern real-time chat application built with **Node.js**, **Express**, and **Socket.IO**.

![ChitChat Preview](chat.png)

---

## ✨ Features

- ⚡ **Real-Time Bidirectional Messaging**: Built with modern Socket.IO v4.
- 🎨 **Modern Responsive UI**: Clean bubble chat interface with smooth animations, glassmorphism header, and mobile-friendly design.
- 👥 **Live Online User Tracking**: Real-time counter of connected participants.
- 🔔 **Audio Notifications**: Sound alerts when receiving incoming messages with a 1-click mute/unmute toggle (`ring.mp3`).
- ✍️ **Typing Indicators**: Live indication when a peer is typing.
- 🏷️ **Custom Display Name**: Clean non-blocking join dialog that remembers your name via `localStorage`.
- 🩺 **Health Check API**: `/health` endpoint for uptime monitoring and cloud deployment health probes.
- 🚀 **Deploy-Ready Anywhere**: Dynamic port binding (`process.env.PORT`) and automatic host resolution (`window.location.origin`).

---

## 🛠️ Local Development

### 1. Prerequisites
Ensure you have **Node.js** (v18 or newer) and **npm** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
- **Production start**:
  ```bash
  npm start
  ```
- **Development with auto-reload (nodemon)**:
  ```bash
  npm run dev
  ```

### 4. Open in Browser
Visit [http://localhost:8000](http://localhost:8000) in multiple tabs or browsers to test chatting in real time!

---

## 🚀 Deployment Guide (100% Production Ready)

This application is configured for deployment on any cloud hosting platform (Render, Railway, Fly.io, Heroku, AWS, etc.).

### Option A: Deploying on Render (Recommended - Free & Easy)
1. Push this repository to your GitHub account (`git push origin main`).
2. Go to [Render.com](https://render.com) and create a free account / log in.
3. Click **"New +"** and select **"Web Service"**.
4. Connect your GitHub repository `Chat-App`.
5. Configure the service:
   - **Name**: `my-chitchat-app` (or your choice)
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Click **"Create Web Service"**.
7. Render will automatically build and launch your application. Once live, open the generated `.onrender.com` link — your chat app will work out of the box with zero configuration!

---

### Option B: Deploying on Railway
1. Go to [Railway.app](https://railway.app) and click **"New Project"**.
2. Select **"Deploy from GitHub repo"** and choose `Chat-App`.
3. Railway automatically detects `server.js` and `package.json` via the included `Procfile`.
4. Generate a public domain under your service settings, and your app is live!

---

### Option C: Deploying via Docker (Optional)
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

---

## 📁 Project Structure

```
Chat-App/
├── .github/
│   └── workflows/
│       └── node.js.yml      # Automated GitHub CI pipeline
├── css/
│   └── style.css            # Responsive chat styles & theme variables
├── js/
│   └── client.js            # Client-side Socket.IO handler & UI events
├── nodeServer/
│   └── index.js             # Backward compatibility stub
├── .gitignore               # Git exclusions (node_modules, logs, env)
├── Procfile                 # Cloud process declaration
├── chat.png                 # App logo
├── index.html               # Main single-page interface
├── package.json             # Root dependencies & scripts
├── ring.mp3                 # Notification sound
├── server.js                # Unified Express + Socket.IO server
└── README.md                # Project documentation
```

---

## 🧪 Testing

Run the automated server and health-check test:
```bash
npm test
```
