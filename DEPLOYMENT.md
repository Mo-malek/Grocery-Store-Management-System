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

## 1️⃣ Backend: Deploy on **Railway** (Recommended)

1. Go to **[railway.app](https://railway.app/)** and sign up (GitHub).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository: `Grocery-Store-Management-System`.
4. Click **Add Variables**:
   - `SPRING_DATASOURCE_URL`: (Paste your Neon connection string)
   - `SPRING_DATASOURCE_USERNAME`: `neondb_owner`
   - `SPRING_DATASOURCE_PASSWORD`: (Paste the password from your Neon connection string)
   - `JWT_SECRET`: (Any random string)
   - `CORS_ALLOWED_ORIGIN`: `https://grocery-frontend.vercel.app` (update this later)
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `PORT`: `8080`
5. Click **Deploy**.

> Railway will auto-detect the `Dockerfile` and build your Spring Boot app.

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
