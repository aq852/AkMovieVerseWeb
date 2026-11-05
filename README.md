# 🎬 AkMovieVerse Web — Next.js Cinema Portal

High-speed, Edge-cached Web Portal for **AkMovieVerse / TheFlixifyBot**.  
Built with **Next.js 14**, **Tailwind CSS**, and **MongoDB Atlas**.  
Engineered for 100% free deployment on **Vercel**.

---

## 🚀 Features

- **⚡ Blazing-Fast Edge Catalog:** Browse movies, series, and anime with zero latency (Mumbai / Global CDN).
- **🔍 Instant Live Search & Filters:** Filter by Movies, Web Series, 1080p, 4K UHD.
- **🎬 Responsive Cinema Player:** Powered by Artplayer with multi-audio, subtitle selection, playback speed, and pip.
- **📱 1-Tap External Players:** Native launchers for **VLC Player**, **MX Player**, and Android App Chooser.
- **🛡️ 24-Hour Anti-Bot Verification Gateway:** 3-second animated countdown gateway masking raw shortener URLs.
- **📺 M3U Playlist Export:** Universal `.m3u` playlist export for VLC, PotPlayer, Kodi, and smart TVs.

---

## 🛠️ 2-Minute Deployment on Vercel

### 1. Push to your GitHub:
Create a new private/public repository on [GitHub](https://github.com/new) named `AkMovieVerseWeb` (or any name you choose) and push this folder:

```bash
git remote add origin https://github.com/<your-username>/AkMovieVerseWeb.git
git branch -M main
git push -u origin main
```

### 2. Import into Vercel:
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** ➔ Import `AkMovieVerseWeb`.
3. Under **Environment Variables**, add these 3 variables:

| Variable | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Same MongoDB Atlas URI used by your bot |
| `STREAM_URL` | `https://governing-brenna-akforwardbot-ce53cb7b.koyeb.app` | Your Koyeb streaming backend URL |
| `BOT_USERNAME` | `TheFlixifyBot` | Your Telegram Bot username |
| `CHANNEL_URL` | `https://t.me/Akmovieverse` | Your Telegram channel link |

4. Click **Deploy**!
5. In ~30 seconds, your site will be live at `https://akmovieverse.vercel.app` (or custom project name).

---

## 🔗 Connect to Bot on Koyeb

Once deployed on Vercel, go to your **Koyeb Dashboard**:
- Update Environment Variable:
  - `WEB_URL` = `https://your-project.vercel.app`
- Re-deploy Koyeb.

Now all verification links, catalog links, and channel watch buttons in Telegram will automatically route through your ultra-fast Vercel domain!
