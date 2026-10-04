# 🏙️ CivicCare — Smart Municipal Grievance Redressal System
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-blue.svg)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
**CivicCare** is an end-to-end municipal grievance and civic issue reporting platform designed for citizens, field workers, and municipal officers. It bridges the gap between citizens and local governance to resolve issues like potholes, garbage accumulation, street light failures, and drainage problems swiftly and transparently.
---
## ✨ Key Features
- 🎤 **Multilingual Real-Time Voice Dictation**:
  - Citizens can speak complaints directly in **English**, **मराठी (Marathi)**, or **हिन्दी (Hindi)**.
  - Automatically transcribes and types spoken words in real time.
- 📍 **Smart GPS with 5-Minute Auto-Off Privacy Timer**:
  - Captures exact geographic coordinates for fast dispatch.
  - Automatically turns off GPS location after 5 minutes of inactivity to protect battery life and user privacy. Includes a live countdown badge.
- 🛡️ **Citizen Privacy & Phone Masking**:
  - Complaints can be filed anonymously or with masked phone numbers (`98230 •••••`).
  - Strict PII protection ensuring phone numbers are only revealed to authorized municipal officers with an audited reason.
- 🔑 **Municipal Officer Security Gatekeeper**:
  - Requires a secure municipal authority passkey (`MAHA-2026`) for administrative access and complaint verification.
- 🗺️ **Interactive Geographic Map**:
  - Powered by Leaflet.js & OpenStreetMap.
  - Visual color-coded pin markers showing grievance clusters and urgency across city wards.
- 👥 **Role-Based Portals**:
  - **Citizen Portal**: File complaints, record voice notes, upload photo evidence, and track live status.
  - **Field Worker Portal**: View assigned tasks, view map locations, and update progress.
  - **Admin / Officer Portal**: Ward analytics, work assignment, and complaint audits.
---
## 🛠️ Tech Stack
- **Frontend**: HTML5, Modern Responsive CSS3 (Glassmorphism & Mobile-first), Vanilla JavaScript (ES6+), Leaflet.js
- **Voice Recognition**: Web Speech API (Multilingual EN / MR / HI)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (Persistent lightweight relational database)
- **Authentication**: bcrypt.js password hashing & Officer Security Key validation
- **File Uploads**: Multer for photo proof handling
---
