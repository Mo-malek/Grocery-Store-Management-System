# 🚀 Deployment Guide — نظام بقالتي

Step-by-step instructions to deploy the Grocery Store app on **Render** (backend) + **Vercel** (frontend).

---

## 1️⃣ Backend: Deploy on Render

### Option A: One-Click Blueprint
1. Push your code to a **GitHub** repository
2. Go to [render.com/deploy](https://render.com/deploy)
3. Connect your repo — Render will detect `render.yaml` and auto-create:
   - A free **PostgreSQL** database
   - A **Docker** web service with all env vars pre-wired
4. Click **Apply** and wait for the build (~5 min)

### Option B: Manual Setup
1. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL → Free tier
   - Note the **Internal Database URL**

2. **Create Web Service**
   - Dashboard → New → Web Service → Connect GitHub repo
   - Root Directory: `backend`
   - Runtime: **Docker**
   - Plan: **Free**

3. **Set Environment Variables**

   | Variable | Value |
   |----------|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>:5432/<db>` |
   | `SPRING_DATASOURCE_USERNAME` | From Render DB dashboard |
   | `SPRING_DATASOURCE_PASSWORD` | From Render DB dashboard |
   | `JWT_SECRET` | Any long random string (32+ chars) |
   | `CORS_ALLOWED_ORIGIN` | `https://your-app.vercel.app` |
   | `SPRING_PROFILES_ACTIVE` | `prod` |

4. Deploy and wait for build to complete ✅

---

## 2️⃣ Frontend: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. **Configure**:
   - Framework Preset: **Other**
   - Root Directory: `frontend`
   - Build Command: `npm run build -- --configuration production`
   - Output Directory: `dist/frontend`
3. **Before deploying**, update `frontend/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
       production: true,
       apiUrl: 'https://your-backend-name.onrender.com/api'
   };
   ```
4. Deploy ✅

> The `vercel.json` file already handles SPA routing rewrites.

---

## 3️⃣ Post-Deploy Checklist

- [ ] Update `CORS_ALLOWED_ORIGIN` on Render with your actual Vercel URL
- [ ] Update `environment.prod.ts` with your actual Render backend URL
- [ ] Test login: `admin / admin123` or `cashier1 / cashier123`
- [ ] Verify POS checkout creates a sale
- [ ] Verify dashboard loads with stats

---

## 4️⃣ Environment Variables Reference

| Variable | Where | Description |
|----------|-------|-------------|
| `SPRING_DATASOURCE_URL` | Render | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Render | DB username |
| `SPRING_DATASOURCE_PASSWORD` | Render | DB password |
| `JWT_SECRET` | Render | JWT signing key |
| `CORS_ALLOWED_ORIGIN` | Render | Frontend production URL |
| `SPRING_PROFILES_ACTIVE` | Render | Must be `prod` |

---

## 5️⃣ Sharing with Team

1. Share the **Vercel URL** for the frontend
2. Share the **Render URL** for API testing (e.g. `https://your-backend.onrender.com/api/dashboard/stats`)
3. Default credentials:
   - **Manager**: `admin` / `admin123`
   - **Cashier**: `cashier1` / `cashier123`

> ⚠️ Free tier on Render sleeps after 15 min of inactivity. First request may take ~30 seconds.
