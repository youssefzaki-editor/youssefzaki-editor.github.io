# Youssef Zaki — Video Editor Portfolio

A fast, single-page portfolio built with plain HTML, CSS and JavaScript (no frameworks, no build step).

```
portfolio/
├── index.html        page structure
├── style.css         design (colors, fonts and spacing are variables at the top)
├── script.js         behaviour (video player, filters, menu, animations)
├── content.js        ← ALL editable content lives here
├── .nojekyll         tells GitHub Pages to serve the files as-is
└── assets/
    ├── favicon.svg
    └── covers/       video cover images (720×1280 JPG)
```

---

## Updating the content

Open **`content.js`** in any text editor (Notepad, VS Code). Everything is labelled.

| What | Where in `content.js` |
|---|---|
| Name, title, intro | `name`, `role`, `intro` |
| "Available for projects" pill | `available: true` / `false` |
| Profile photo | `photo` (see below) |
| About text | `about` |
| Email / phone / WhatsApp | `email`, `phoneDisplay`, `phoneLink`, `whatsappMessage` |
| Skills | `skills` list |
| Tools | `tools` list |
| Videos | `videos` list |

### Profile photo
- `assets/profile.jpg` — square 800×800 crop, shown in the round frame at the top (`photo` in `content.js`).
- `assets/profile-portrait.jpg` — 800×1000 crop, shown in the About section (`aboutPhoto`).

To change the photo, replace these two files (same names) — no code changes needed.
If `photo` is set to `""`, the site shows the initials "YZ" instead.

### Publish updates
Run `deploy-portfolio.ps1` (one folder up) — it uploads changed files to GitHub,
makes sure GitHub Pages is on (main branch, root folder), waits for the build and checks the live site.

### Add a video
1. Make sure the Google Drive file is shared as **Anyone with the link → Viewer**.
2. Save a cover image (a frame from the video, 720×1280) into `assets/covers/`.
3. In `content.js`, copy one `{ ... }` block inside `videos: [ ... ]`, paste it, and edit:
   ```js
   {
     title: "My New Reel",
     category: "Reels & Short-Form",          // filter buttons are made from these
     thumbnail: "assets/covers/my-new-reel.jpg",
     videoUrl: "https://drive.google.com/file/d/FILE_ID/view",
     videoType: "drive",                       // drive | instagram | youtube | mp4
     orientation: "vertical",                  // vertical (9:16) | horizontal (16:9)
     duration: "0:45",
   },
   ```
4. To remove a video, delete its whole `{ ... },` block. The order in the list is the order on the page.

Use a new category name (e.g. `"Podcast Editing"`) and a new filter button appears automatically.

---

## Run locally

Double-clicking `index.html` works, but videos play more reliably from a local server:

```powershell
cd portfolio
python -m http.server 8000
```
Then open http://localhost:8000

---

## Publish free with GitHub Pages (browser only, no Git needed)

1. Sign in (or sign up) at https://github.com.
2. Click **+ → New repository**.
   - **Repository name:** `YOUR-USERNAME.github.io` (replace with your exact GitHub username) → site URL becomes `https://YOUR-USERNAME.github.io/`
     *(Any other name also works, e.g. `portfolio` → `https://YOUR-USERNAME.github.io/portfolio/`)*
   - Set it to **Public**, then click **Create repository**.
3. On the new repo page click **uploading an existing file**.
4. Open the `portfolio` folder on your computer, select **everything inside it** (`index.html`, `style.css`, `script.js`, `content.js`, `.nojekyll`, and the `assets` folder) and drag it into the browser.
   - `.nojekyll` is a hidden file. If you can't see it, it's optional — the site works without it.
   - Make sure `index.html` ends up at the top level of the repo, **not** inside a `portfolio/` folder.
5. Click **Commit changes**.
6. Go to **Settings → Pages**. Under **Build and deployment → Source** choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
7. Wait 1–2 minutes and refresh the Pages settings screen. Your public link appears at the top: **"Your site is live at …"**.

### Updating the live site later
Open the file on GitHub (e.g. `content.js`) → pencil icon → edit → **Commit changes**. Or use **Add file → Upload files** to replace files / add new covers. The live site updates in about a minute.

All paths in the site are relative, so it works both at `username.github.io` and `username.github.io/repo-name/`.
