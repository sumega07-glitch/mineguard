# MineGuard Standalone Prototype — User Guide ⛏️

This directory contains the standalone, zero-dependency browser prototype of **MineGuard - Smart Coal Mine Pollution Alert System**.

You can run this prototype on **any computer (Windows, Mac, Linux, Chromebook)** without installing Node.js, Python, npm, or any web server!

---

## 📁 Files Included

| File | Purpose |
| :--- | :--- |
| **`mineguard.html`** | ⭐ **Recommended:** 100% self-contained single-file version. Works anywhere, even offline. |
| **`index.html`** | Standard 3-file entry point (links to `style.css` and `script.js`). |
| **`style.css`** | Industrial high-contrast dark theme and layout rules. |
| **`script.js`** | Sensor simulation engine, trend charts, modals, and CSV export. |
| **`mineguard_project.zip`** | Ready-to-share ZIP file containing all prototype assets. |

---

## 🚀 How to Run in Google Chrome (or Any Browser)

### Method 1: The Easiest Way (Single File)
1. Find the file named **`mineguard.html`**.
2. **Double-click it** to open in Google Chrome (or Microsoft Edge / Firefox / Safari).
3. Everything (styles, scripts, charts, simulation) works immediately!

### Method 2: The 3-File Setup
1. Keep **`index.html`**, **`style.css`**, and **`script.js`** in the **same folder**.
2. Double-click **`index.html`**.
3. It will load `style.css` for styling and `script.js` for functionality.

---

## ⚠️ Important Troubleshooting

### 1. "Chrome is showing text only / raw code instead of the website"
- **Why this happens:** In Windows, saving a file as `index.html` in Notepad often creates **`index.html.txt`** because Windows hides known extensions. Chrome treats `.txt` files as plain text.
- **How to fix:**
  - Turn on **"File name extensions"** in Windows File Explorer (`View` -> `Show` -> `File name extensions`).
  - Rename `index.html.txt` to `index.html`.
  - Or simply double-click **`mineguard.html`** instead.

### 2. "The website is plain white with black text and basic grey buttons"
- **Why this happens:** `style.css` is missing from the folder, or you opened `index.html` from inside a ZIP file without extracting first.
- **How to fix:**
  - Right-click the ZIP file and choose **"Extract All..."**.
  - Open `index.html` from the extracted folder.
  - Or open **`mineguard.html`** directly.

---

## 🎮 Key Features You Can Test

1. **Auto-Simulation:** Click **▶ Resume** or **Step +1** to watch particulate levels fluctuate in real time.
2. **Preset Scenarios:** Test the buttons:
   - *Normal Operations*
   - *Heavy Excavation Dust*
   - *High Wind Dispersion*
   - *Critical Blasting Exceedance*
   - *Water Sprinkler Suppression*
3. **Threshold Settings:** Click **⚙ Settings** to adjust PM2.5 and PM10 warning/critical thresholds.
4. **Download Report:** Click **📥 Download Report** to export a clean, formatted CSV summary file.
5. **Interactive Charts:** Dual-axis particulate trends and zone comparison bars update live as simulation runs.
