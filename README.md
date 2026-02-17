# 🏪 Grocery Store Management System — نظام بقالتي

> Full-stack POS & store management system: **Spring Boot 3 + Angular 17 + H2/PostgreSQL + JWT**

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| 🛒 **POS** | Product search, barcode scanner, cart, bundles, discounts, customer linking, smart suggestions |
| 📦 **Inventory** | Product CRUD, low-stock alerts, expiry tracking, stock adjustments, audit reports |
| 👥 **Customers** | CRUD, loyalty points, purchase history, behavior profiles, stagnant alerts |
| 📊 **Dashboard** | KPIs, 7-day chart, peak hours heat map, top products, store health score, employee leaderboard |
| 🧾 **Sales History** | Daily sales log, sale detail modal, receipt view |
| 💰 **Expenses** | Track rent/utilities/etc, net profit calculation |
| 🤖 **Smart Procurement** | Reorder suggestions, expiry risk, price optimization |
| 🎁 **Marketing** | Bundle builder, basket suggestions, CRM alerts, WhatsApp integration |
| 🔐 **Security** | JWT auth, role-based access (Manager/Cashier), auth guards |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 21+** & **Maven** (or use the included `mvnw`)
- **Node.js 18+** & **npm**

### 1. Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
Server: `http://localhost:8080` | H2 Console: `http://localhost:8080/h2-console`

### 2. Frontend
```bash
cd frontend
npm install
npm start
```
App: `http://localhost:4200`

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Manager | `admin` | `password` |
| Cashier | _Not seeded by default_ | _Create via API/admin flow_ |

---

## 🌐 Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full Render + Vercel deployment guide.

| Component | Platform | Config File |
|-----------|----------|-------------|
| Backend | Render (Docker) | `render.yaml`, `Dockerfile` |
| Frontend | Vercel | `vercel.json` |

---

## 🗂️ Project Structure

```
├── backend/                    # Spring Boot 3
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/grocery/
│       ├── config/             # Security, JWT, CORS
│       ├── controller/         # REST APIs (9 controllers)
│       ├── entity/             # JPA entities (9 entities)
│       ├── service/            # Business logic (9 services)
│       ├── repository/         # Data access (8 repos)
│       └── dto/                # Request/Response objects
│
├── frontend/                   # Angular 17
│   ├── vercel.json
│   └── src/app/
│       ├── core/               # Services, guards, interceptors
│       ├── shared/             # Reusable components
│       └── modules/            # Feature modules (10 modules)
│
├── render.yaml                 # Render deployment blueprint
└── DEPLOYMENT.md               # Deployment guide
```

---

## 📋 Tech Stack

- **Backend**: Spring Boot 3.2, Spring Security, Spring Data JPA, Flyway, JWT (jjwt), Lombok
- **Database**: H2 (dev) / PostgreSQL (prod)
- **Frontend**: Angular 17, standalone components, CSS custom properties
- **Deploy**: Docker, Render, Vercel
