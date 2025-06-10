# VAPT Web Application

A web-based Vulnerability Assessment and Penetration Testing (VAPT) system that integrates OWASP ZAP and Nikto for scanning target URLs, displaying vulnerability results, and exporting scan reports.

## 🧩 Tech Stack

- **Backend**: Node.js, Express.js, Sequelize ORM, MySQL, OWASP ZAP (Docker)
- **Frontend**: React.js, TailwindCSS, @react-pdf/renderer
- **Tools**: Nikto, OWASP ZAP, Docker Compose

---

## 📦 Project Structure

```
/backend     → Express.js API for scan management and database handling  
/frontend    → React.js frontend for managing and displaying scan results  
/docker      → Docker setup for OWASP ZAP daemon  
```

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js & npm

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Run the backend and OWASP ZAP using Docker Compose:

```bash
docker compose up
```

This will start:
- The Express.js backend server
- OWASP ZAP in daemon mode
- MySQL database

Make sure `.env` file is configured for database connection.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🛠 Features

- 🔍 Perform web vulnerability scanning using OWASP ZAP and Nikto
- 📊 Store and view detailed scan results
- 📂 Export reports as downloadable PDF
- 📁 Modular architecture with RESTful API
- 📈 Display visual charts of scan result summaries

---

## 📄 API Overview

The backend exposes RESTful endpoints such as:

- `POST /zap` – Start ZAP scan
- `POST /nikto` – Start Nikto scan
- `GET /scans` – List all scan reports
- `GET scans/:id` – View scan detail
- `GET /scans/:id/generatepdf` – Export scan result as PDF

---

## ✅ License

MIT License

---

## ✨ Author

Developed by salwaa R
For academic and educational use only.