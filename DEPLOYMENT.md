# Gozmar Dynamics — Complete Deployment Guide

This guide walks you through every step to deploy the Gozmar Dynamics website with PocketBase CMS, Uptime Kuma monitoring, and Google Analytics — all on Coolify.

> **Prerequisites:** You need a Coolify dashboard with at least one connected server. Your domain (`gozmardynamics.com`) DNS is managed on Namecheap.

---

## Architecture Overview

```
                        ┌─────────────────────────────────────┐
                        │           COOLIFY SERVER             │
                        │                                      │
   Visitors ──────────►│  nginx (static website)              │
                        │  PocketBase (CMS database + auth)    │
   Admin ─────────────►│  Uptime Kuma (monitoring)            │
                        │  Traefik proxy (SSL + routing)       │
                        └─────────────────────────────────────┘
                                     ▲
                                     │ source control only
                        ┌────────────┴────────────┐
                        │      GitHub repo         │
                        │  (gozmardynamics-glitch/ │
                        │   Gozmardynamics-Website)│
                        └──────────────────────────┘
```

**Flow:**
- Visitors load the static website → website reads CMS content from PocketBase API
- Admin opens `admin.html` → signs in with PocketBase → edits content → saves to PocketBase
- No GitHub Actions, no content baking, no redeployment for content changes
- GitHub is only for source code changes (auto-deploys via webhook)

---

## Phase 1: Make the GitHub Repository Public

Coolify needs to clone the repository without authentication. The repo is currently private.

1. Go to **https://github.com/gozmardynamics-glitch/Gozmardynamics-Website**
2. Click the **Settings** tab (top of the repo page)
3. Scroll all the way down to the **Danger Zone** section
4. Click **Change repository visibility**
5. Select **Make public**
6. Confirm by typing the repo name

> **Security note:** The repo contains only the public Supabase anon key (safe to expose). No service-role keys or secrets are committed.

---

## Phase 2: Deploy the Website on Coolify

### Step 1 — Create a Project (if you don't have one)

1. Open your **Coolify dashboard**
2. On the left sidebar, click **Projects**
3. Click **+ New Project**
4. Name it: `Gozmar Dynamics`
5. Click **Continue**

### Step 2 — Create the Website Application

1. Open the **Gozmar Dynamics** project
2. Click **+ Create New Resource**
3. Select **Public Repository** (the first option)
4. In the **Repository URL** field, paste:
   ```
   https://github.com/gozmardynamics-glitch/Gozmardynamics-Website.git
   ```
5. Click **Check Repository**
6. Coolify will detect the `main` branch — leave it selected

### Step 3 — Choose the Build Pack

1. Coolify defaults to **Nixpacks** — click it and change to **Dockerfile**
2. **Base Directory:** leave as `/` (files are at the repo root)
3. **Dockerfile Location:** `/Dockerfile`
4. Click **Continue**

### Step 4 — Configure Network Settings

After clicking Continue, you'll see the application configuration page.

1. Find the **Domains** field
2. Click **Generate Domain** (this creates a temporary `sslip.io` URL for testing)
3. Coolify generates something like: `https://xxxxx.yyy.zzz.sslip.io`
4. Copy this URL — you'll need it later
5. Find **Ports Exposes** and set it to: `80`
6. If there is a **Port Mappings** field with `3000:3000` in it, change it to `80:80`

### Step 5 — Deploy

1. Click **Deploy** (top right or bottom of the page)
2. Watch the deployment log — it should show:
   - `Docker ... detected on deployment server`
   - `Starting deployment of gozmardynamics-glitch/Gozmardynamics-Website:main`
   - Build steps (`#1`, `#2`, `#3`...)
   - `Successfully deployed` (or similar success message)
3. Once deployed, open the generated `sslip.io` URL in your browser
4. You should see the Gozmar Dynamics website

> **If the build fails:** Check the deployment log for errors. Common issues:
> - `could not read Username` → the repo is still private (go back to Phase 1)
> - `port already in use` → change Port Mappings to `80:80`
> - `No available server` → the container didn't start; check the app logs

---

## Phase 3: Deploy PocketBase on Coolify

### Step 1 — Create the PocketBase Service

1. Open the **Gozmar Dynamics** project in Coolify
2. Click **+ Create New Resource**
3. In the search box, type **PocketBase**
4. Click the **PocketBase** service card
5. Choose your **server** and **network destination**
6. Coolify creates the service with pre-filled settings (a Docker Compose stack using the official `pocketbase/pocketbase` image)

### Step 2 — Configure the Domain

1. In the PocketBase service page, find the **Domains** field
2. Click **Generate Domain** (creates a temporary `sslip.io` URL)
3. Copy this URL — this is your PocketBase API URL
4. It looks something like: `https://pb-xxxxx.yyy.zzz.sslip.io`
5. Click **Save**

### Step 3 — Verify Persistent Storage

PocketBase stores all data (database, auth, files) in `/pb_data`. This must persist across container restarts.

1. In the PocketBase service, go to **Configuration** tab
2. Check that **Persistent Storage** includes a volume mount for `/pb_data`
3. If it's missing:
   - Go to **Configuration > General**
   - Find the Docker Compose definition
   - Ensure it includes:
     ```yaml
     volumes:
       - pocketbase-data:/pb_data
     ```
   - At the bottom of the compose file, ensure:
     ```yaml
     volumes:
       pocketbase-data:
     ```
4. Click **Save** and **Reload Compose Configuration**

### Step 4 — Deploy PocketBase

1. Click **Deploy**
2. Watch the log — it should pull the `pocketbase/pocketbase` image and start the container
3. PocketBase listens on port **8090** by default
4. Once deployed, the service is live at your generated URL

---

## Phase 4: Configure PocketBase (Collections + Auth)

### Step 1 — Access the PocketBase Admin UI

1. Open your PocketBase URL in a browser and add `/_/` at the end:
   ```
   https://pb-xxxxx.yyy.zzz.sslip.io/_/
   ```
2. On first visit, PocketBase asks you to create an **admin account**
3. Enter an email and password (this is the superuser admin — choose a strong password)
4. Click **Create and login**

> **Important:** Save these credentials safely. This admin account manages the PocketBase server itself. You'll create a separate user account for the CMS login below.

### Step 2 — Create the `cms_content` Collection

1. In the PocketBase admin UI, click **Collections** (left sidebar)
2. Click **New collection**
3. Set **Name** to: `cms_content`
4. Under **Fields**, click **New field**
5. Select **JSON** as the field type
6. Set the field name to: `data`
7. Click **Save**
8. Click **Save** again to create the collection

### Step 3 — Set Collection API Rules

API rules control who can read and write to the collection.

1. Still on the `cms_content` collection settings
2. Under **API Rules**, find **List Rule** and enter:
   ```
   (empty — leave blank for public read access)
   ```
   > Leave the field empty. An empty rule means anyone can read.
3. Under **View Rule**, also leave it empty (public read)
4. Under **Create Rule**, enter:
   ```
   @request.auth.id != ""
   ```
   > This means only authenticated users can create records.
5. Under **Update Rule**, enter:
   ```
   @request.auth.id != ""
   ```
6. Under **Delete Rule**, enter:
   ```
   @request.auth.id != ""
   ```
7. Click **Save**

### Step 4 — Create a CMS Admin User

1. In the PocketBase admin UI, click **Collections** (left sidebar)
2. Find the **users** collection (created by default) and click it
3. Click the **➕** (add record) button
4. Fill in:
   - **Email:** your admin email (e.g. `admin@gozmardynamics.com`)
   - **Password:** a strong password
   - **Password Confirm:** same password
   - **Verified:** check the box
5. Click **Save**

> This is the account you'll use to log in to the Gozmar CMS admin dashboard at `admin.html`.

### Step 5 — Test the API

1. Open your PocketBase URL (without `/_/`) in a browser:
   ```
   https://pb-xxxxx.yyy.zzz.sslip.io/api/collections/cms_content/records
   ```
2. You should see a JSON response like:
   ```json
   {
     "items": [],
     "page": 1,
     "perPage": 30,
     "totalItems": 0,
     "totalPages": 0
   }
   ```
3. If you see an empty `items` array, the collection is working and ready to receive data

---

## Phase 5: Wire the Website to PocketBase

### Step 1 — Get Your PocketBase URL

You copied this in Phase 3, Step 2. It looks like:
```
https://pb-xxxxx.yyy.zzz.sslip.io
```
> Do NOT include `/_/` or any path — just the base URL.

### Step 2 — Update the Config File

1. On your local machine, open: `js/cms-config.js`
2. Set `pocketbaseUrl` to your PocketBase URL:
   ```javascript
   pocketbaseUrl: "https://pb-xxxxx.yyy.zzz.sslip.io",
   ```
3. Leave `collection` as `"cms_content"`
4. Leave `authCollection` as `"users"`
5. Leave `authEnabled` as `true`

### Step 3 — Commit and Push

1. Save the file
2. In your terminal, run:
   ```bash
   git add js/cms-config.js
   git commit -m "Configure PocketBase backend URL"
   git push origin main
   ```

### Step 4 — Set Up Auto-Deploy (GitHub Webhook)

So Coolify automatically redeploys when you push code changes:

1. **In Coolify:**
   - Open the **Gozmardynamics-Website** application
   - Go to **Configuration > Advanced**
   - Find **Auto Deploy** and toggle it **ON**
   - Go to **Configuration > Webhooks**
   - In the **GitHub Webhook Secret** field, enter a long random string (e.g. `gozmar-webhook-secret-2026-xyz`)
   - Click **Save**
   - Copy the **GitHub URL** shown under **Manual Git Webhooks**

2. **In GitHub:**
   - Go to **https://github.com/gozmardynamics-glitch/Gozmardynamics-Website**
   - Click **Settings** (repo settings, not account settings)
   - Click **Webhooks** (left sidebar)
   - Click **Add webhook**
   - **Payload URL:** paste the URL you copied from Coolify
   - **Content type:** select `application/json`
   - **Secret:** paste the same secret you set in Coolify
   - **Which events would you like to trigger this webhook?** → select **Just the push event**
   - **Active:** checked
   - Click **Add webhook**

3. **Test it:**
   - Make a small change (e.g. add a comment to a file), commit, and push
   - Go to Coolify → **Deployments** tab
   - You should see a new webhook-triggered deployment appear automatically

### Step 5 — Verify the CMS Works

1. Wait for Coolify to auto-redeploy (or manually redeploy)
2. Open your website URL and add `/admin.html`:
   ```
   https://xxxxx.yyy.zzz.sslip.io/admin.html
   ```
3. You should see the **Admin sign in** login form
4. Enter the email and password you created in Phase 4, Step 4
5. Click **Sign in**
6. The admin dashboard should appear with all editing tabs
7. Make a small edit (e.g. change a product tagline)
8. Click **Save changes**
9. You should see "Changes saved"
10. Open the main website in a new tab — the change should be live

> **If save fails:** Check that:
> - The PocketBase URL in `cms-config.js` is correct (no trailing slash, no `/_/`)
> - The `cms_content` collection exists with a `data` JSON field
> - The API rules allow authenticated create/update
> - Your user account exists in the `users` collection

---

## Phase 6: Deploy Uptime Kuma on Coolify

### Step 1 — Create the Service

1. Open the **Gozmar Dynamics** project in Coolify
2. Click **+ Create New Resource**
3. In the search box, type **Uptime Kuma**
4. Click the **Uptime Kuma** service card
5. Choose your **server** and **network destination**

### Step 2 — Configure the Domain

1. Find the **Domains** field
2. Click **Generate Domain**
3. Copy the URL (e.g. `https://uptime-xxxxx.yyy.zzz.sslip.io`)
4. Click **Save**

### Step 3 — Deploy

1. Click **Deploy**
2. Wait for the container to start
3. Open the Uptime Kuma URL in your browser
4. Create an admin account (first visit only)
5. Click **+ Add Monitor**
6. Set:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Gozmar Dynamics Website
   - **URL:** your website URL (e.g. `https://xxxxx.yyy.zzz.sslip.io`)
   - **Heartbeat Interval:** 60 (seconds)
7. Click **Save**

> Uptime Kuma will now check your website every 60 seconds and alert you if it goes down. You can configure email, Slack, Discord, or other notifications under **Settings > Notifications**.

---

## Phase 7: Configure Google Analytics

### Step 1 — Create a Google Analytics Property

1. Go to **https://analytics.google.com/**
2. Sign in with your Google account
3. Click **Admin** (gear icon, bottom left)
4. Click **Create Account**
5. Enter account name: `Gozmar Dynamics`
6. Click **Next**
7. Choose **Web** as the platform
8. Enter property name: `Gozmar Dynamics Website`
9. Enter website URL: `https://www.gozmardynamics.com` (use your actual domain)
10. Click **Create**

### Step 2 — Get Your Measurement ID

1. After creating the property, you'll see a **Measurement ID**
2. It looks like: `G-XXXXXXXXXX`
3. Copy this ID

### Step 3 — Add It to the Config

1. On your local machine, open: `js/cms-config.js`
2. Set `gaMeasurementId` to your ID:
   ```javascript
   gaMeasurementId: "G-XXXXXXXXXX",
   ```
3. Save, commit, and push:
   ```bash
   git add js/cms-config.js
   git commit -m "Add Google Analytics measurement ID"
   git push origin main
   ```
4. Coolify will auto-redeploy (if you set up the webhook in Phase 5, Step 4)
5. Google Analytics will start tracking visitors automatically

---

## Phase 8: Configure Your Custom Domain (www.gozmardynamics.com)

> This step requires DNS access on Namecheap. Do this last, after everything works on the `sslip.io` URLs.

### Step 1 — Get Your Coolify Server's Public IP

1. In Coolify, go to **Servers** (left sidebar)
2. Click your server
3. Note the **IP address** shown (this is your server's public IP)

### Step 2 — Configure DNS on Namecheap

1. Log in to **https://www.namecheap.com/**
2. Go to **Domain List** → click **Manage** next to `gozmardynamics.com`
3. Click **Advanced DNS** tab
4. Under **Host Records**, add or edit these records:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | A Record | @ | `YOUR.SERVER.IP` | Automatic |
   | A Record | www | `YOUR.SERVER.IP` | Automatic |

5. Click **Save All Changes** (checkmark icon)
6. Wait for DNS to propagate (5 minutes to 24 hours — usually under 30 minutes)

### Step 3 — Verify DNS Propagation

1. Open **https://dnschecker.org/**
2. Enter: `www.gozmardynamics.com`
3. Select type: **A**
4. Click **Search**
5. Wait until most checkmarks show your server's IP address (green = correct)

### Step 4 — Update Coolify Domains

1. In Coolify, open the **Gozmardynamics-Website** application
2. Go to **Configuration > General**
3. In the **Domains** field, replace the `sslip.io` URL with:
   ```
   https://www.gozmardynamics.com
   ```
4. Click **Save**
5. Click **Deploy**

6. Repeat for the **PocketBase** service:
   - Replace its `sslip.io` URL with: `https://pb.gozmardynamics.com`
   - Save and Deploy
   > **Note:** You'll need to add a DNS A record for `pb` on Namecheap (same IP) before this works.

7. Repeat for the **Uptime Kuma** service:
   - Replace its `sslip.io` URL with: `https://uptime.gozmardynamics.com`
   - Save and Deploy
   > **Note:** Add a DNS A record for `uptime` on Namecheap (same IP).

### Step 5 — Update Config with Final URLs

1. On your local machine, open: `js/cms-config.js`
2. Update `pocketbaseUrl` to the final domain:
   ```javascript
   pocketbaseUrl: "https://pb.gozmardynamics.com",
   ```
3. Save, commit, and push:
   ```bash
   git add js/cms-config.js
   git commit -m "Switch to production domain"
   git push origin main
   ```
4. Coolify will auto-redeploy with the new PocketBase URL

### Step 6 — Verify SSL

1. Open **https://www.gozmardynamics.com** in your browser
2. You should see a lock icon (🔒) in the address bar
3. Coolify's Traefik proxy automatically requests and renews Let's Encrypt SSL certificates
4. If you see a certificate warning, wait 2-3 minutes and refresh — Let's Encrypt needs time to issue the certificate on first request

> **SSL is automatic.** As long as:
> - DNS points to your Coolify server ✓
> - Ports 80 and 443 are open on the server firewall ✓
> - You used `https://` in the Domains field ✓
>
> ...Coolify handles everything else.

---

## Phase 9: Update the PocketBase Admin URL

After switching to the custom domain in Phase 8, your PocketBase admin UI moves:

- **Old URL:** `https://pb-xxxxx.sslip.io/_/`
- **New URL:** `https://pb.gozmardynamics.com/_/`

Update any bookmarks. The data persists — no migration needed.

---

## Quick Reference: All URLs

| Service | Temporary URL (sslip.io) | Production URL |
|---|---|---|
| Website | `https://xxxxx.sslip.io` | `https://www.gozmardynamics.com` |
| Website admin | `https://xxxxx.sslip.io/admin.html` | `https://www.gozmardynamics.com/admin.html` |
| PocketBase API | `https://pb-xxxxx.sslip.io` | `https://pb.gozmardynamics.com` |
| PocketBase admin | `https://pb-xxxxx.sslip.io/_/` | `https://pb.gozmardynamics.com/_/` |
| Uptime Kuma | `https://uptime-xxxxx.sslip.io` | `https://uptime.gozmardynamics.com` |
| Coolify dashboard | (your dashboard URL) | `https://coolify.gozmardynamics.com` (optional) |

---

## Troubleshooting

### Website shows but content is default (not from PocketBase)

1. Check `js/cms-config.js` — is `pocketbaseUrl` set correctly?
2. Open browser DevTools (F12) → Console — are there fetch errors?
3. Is the PocketBase service running in Coolify?
4. Can you access `https://pb.gozmardynamics.com/api/collections/cms_content/records` in a browser?

### Admin login fails ("Sign-in failed")

1. Check that the `users` collection has your admin user
2. Verify the email and password are correct
3. Check that `authCollection` in `cms-config.js` is `"users"`
4. Try logging in at the PocketBase admin UI (`/_/`) to confirm credentials work

### "No available server" error

1. The container didn't start — check **Logs** in Coolify
2. Verify **Ports Exposes** is set to `80`
3. Verify the container is running (not crashed)
4. Check the deployment log for build errors

### Google Analytics not tracking

1. Check that `gaMeasurementId` is set in `js/cms-config.js`
2. Open the website → view page source → search for `googletagmanager`
3. In Google Analytics, go to **Realtime** report — visit your site and check if a user appears
4. GA4 can take 24-48 hours to show data in standard reports

### Coolify can't clone the GitHub repo

1. Verify the repo is **public** (Phase 1)
2. Try the URL without `.git` at the end: `https://github.com/gozmardynamics-glitch/Gozmardynamics-Website`
3. Check that your Coolify server has internet access (it can pull Docker images, so it should work)

### Auto-deploy webhook not triggering

1. Go to GitHub → repo → Settings → Webhooks
2. Check **Recent Deliveries** — is GitHub sending events?
3. Verify the **Secret** matches what you set in Coolify
4. Verify the **Payload URL** is correct
5. Check that **Auto Deploy** is enabled in Coolify (Configuration > Advanced)

---

## Security Checklist

- [ ] GitHub repo is public but contains NO secrets (only the public anon key)
- [ ] PocketBase admin password is strong
- [ ] CMS admin user password is strong
- [ ] PocketBase API rules: public read, authenticated write
- [ ] Server firewall: only ports 22, 80, 443 open
- [ ] Coolify dashboard is behind a password
- [ ] Google Analytics uses the production domain (not the sslip.io URL)
- [ ] Uptime Kuma has a monitor set up for the website
- [ ] DNS records point to the correct server IP

---

## Maintenance

### Updating the website code

```bash
git add .
git commit -m "Description of changes"
git push origin main
```
Coolify will auto-redeploy via the webhook.

### Updating PocketBase

In Coolify → PocketBase service → click **Pull Latest Images & Restart**.

### Backing up PocketBase data

PocketBase data lives in the `/pb_data` volume on the server. To back up:
1. SSH into the server
2. Find the volume: `docker volume ls | grep pocketbase`
3. Copy the data: `docker run --rm -v <volume-name>:/data -v $(pwd):/backup alpine tar czf /backup/pb_data_backup.tar.gz /data`

Alternatively, use PocketBase's built-in backup from the admin UI (`/_/`).

### Checking if everything is running

1. Coolify dashboard → check all services show **Running**
2. Uptime Kuma → check the monitor is **Up**
3. Visit the website → it should load
4. Visit `/admin.html` → login should work
