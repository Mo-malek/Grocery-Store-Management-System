# 🚀 FREE Deployment Guide (No Card Required)

Since Render asks for a credit card for blueprints/databases, we will use **Neon** (Free Database) + **Render Manual Web Service** (Free Backend).

---

## 1️⃣ Create Free Database (Neon)

1. Go to **[console.neon.tech/signup](https://console.neon.tech/signup)** (Sign up with GitHub/Google).
2. Create a new **Project**:
   - Name: `grocery-db`
   - Region: Pick closest (e.g., `aws-eu-central-1` or `aws-us-east-1`).
3. Once created, you will see a **Connection String** like:
   `postgres://neondb_owner:...........@ep-restless-....aws.neon.tech/neondb?sslmode=require`
4. **Copy this string** (click the Copy button). This is your `SPRING_DATASOURCE_URL`.

---

## 2️⃣ Deploy Backend (Render - Manual)

1. Go to **[dashboard.render.com](https://dashboard.render.com/)**.
2. Click **New +** → **Web Service** (NOT Blueprint).
3. Connect your repository: `Mo-malek/Grocery-Store-Management-System`.
4. **Configure**:
   - **Name**: `grocery-backend`
   - **Region**: Same as your database if possible.
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
5. **Environment Variables** (Advanced): Add these manually:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | Paste the Neon Connection String (starting with `postgres://...`) |
   | `SPRING_DATASOURCE_USERNAME` | (Leave empty if URL includes it, or extract from URL: `neondb_owner`) |
   | `SPRING_DATASOURCE_PASSWORD` | (Leave empty if URL includes it) |
   | `JWT_SECRET` | Any long random string |
   | `CORS_ALLOWED_ORIGIN` | `https://your-frontend.vercel.app` (update later) |
   | `SPRING_PROFILES_ACTIVE` | `prod` |

6. Click **Create Web Service**.

> **Note**: If Render fails to connect to DB, double-check that the `sslmode=require` is at the end of the URL.

---

## 3️⃣ Deploy Frontend (Vercel)

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Import `Mo-malek/Grocery-Store-Management-System`.
3. **Configure**:
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build -- --configuration production` (should auto-detect).
   - **Output Directory**: `dist/frontend` (should auto-detect).
4. Click **Deploy**.

---

## 4️⃣ Connect Them

1. Once Backend is live on Render, copy its URL (e.g., `https://grocery-backend.onrender.com`).
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables.
3. Add a new variable (if you haven't hardcoded it in `environment.prod.ts` yet):
   - Key: `API_URL` (if your app uses it, otherwise update the file code)
   *Wait, our code uses `environment.prod.ts`. Let's update it manually:*
   - Go to your local code: `frontend/src/environments/environment.prod.ts`
   - Paste the Render URL there.
   - Commit & Push: `git add . && git commit -m "Update API URL" && git push`
   - Vercel will auto-redeploy.

4. Go to Render Dashboard → Environment Variables.
5. Update `CORS_ALLOWED_ORIGIN` with your Vercel URL (e.g., `https://grocery-frontend.vercel.app`).
6. Save Changes (Render will restart).

✅ **Done!** You now have a full stack app for $0/month.
