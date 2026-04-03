# FrostSweep — Website Page Data

---

## 1. TOOL IDENTITY

- **Tool name:** FrostSweep
- **One-line tagline:** Cross-platform file organizer with smart categorization and one-click undo
- **GitHub repo URL:** https://github.com/dbeglaryan/FrostSweep
- **Author:** Daniel Beglaryan (FrostNode)
- **License:** MIT
- **Current version:** 2.0.0
- **Status:** Active

---

## 2. HERO SECTION

- **Large title text:** FrostSweep
- **Typing animation phrases:**
  1. `Scanning 2,847 files across 14 extensions...`
  2. `Moving report.pdf → ~/Documents/PDF/`
  3. `Detected 23 duplicate files by content hash`
  4. `Preview: 156 files would be organized into 7 categories`
  5. `Undo complete — 89 files restored to original locations`
  6. `Filtering by size > 10MB, modified after 2024-01-01`
  7. `Category "3D Models" created → .obj, .fbx, .blend`
  8. `Dry run complete: 341 files analyzed, 0 moved`

- **Tagline:** Scan, categorize, and organize files into clean folder structures. Preview before you move. Undo when you need to. Built with React, Electron, and Python.

- **Stats bar:**
  - `4,800+` Lines of Code
  - `12` API Endpoints
  - `62` Tests Passing
  - `11` UI Components
  - `3` Platforms Supported
  - `5` Core Modules

- **Primary CTA:**
  - Label: `git clone`
  - Command: `git clone https://github.com/dbeglaryan/FrostSweep.git`

- **Secondary CTA:**
  - Label: `Explore Features`
  - Action: scroll to features section

---

## 3. FEATURES (14 cards)

| # | Feature Name | Description | Icon |
|---|-------------|-------------|------|
| 1 | **Smart File Scanning** | Scans any folder to discover all file types, computing total counts, sizes, and per-category breakdowns in a single pass. Supports recursive subdirectory traversal. | ScanSearch |
| 2 | **Custom Category System** | Create, edit, and delete file categories with custom extension rules and destination folder paths. Seven built-in categories included out of the box. | Layers |
| 3 | **Organization Preview** | See exactly where every file would move before touching anything. Full move plan with source paths, destinations, and category tags displayed in the activity log. | Eye |
| 4 | **Dry Run Mode** | Simulate the entire organization operation — logs every move that would happen without actually moving a single file. Safe experimentation. | Terminal |
| 5 | **One-Click Undo** | Reverse the last organization instantly. Files are restored to their original locations with parent directories recreated as needed. | ArchiveRestore |
| 6 | **Duplicate Detection** | Find duplicate files by two methods: same filename across directories, and identical content via MD5 hash comparison with 64KB block reads. | FileSearch |
| 7 | **Six-Dimension Filtering** | Filter by minimum/maximum file size, modified-after/before dates, extension whitelist, and extension blacklist. All filters combine for precise targeting. | ScanSearch |
| 8 | **Extension Selection Grid** | After scanning, toggle individual file types on/off via interactive pills. Search, select all, or deselect all. Selected types become an implicit whitelist filter. | Layers |
| 9 | **Real-Time Activity Log** | Color-coded, timestamped log of every operation — scans, previews, moves, errors. Auto-scrolls, clearable, and exportable to CSV. | FileText |
| 10 | **Scan Statistics Dashboard** | Visual breakdown showing total files, total size, category distribution, and the top 5 largest files discovered during scanning. | Database |
| 11 | **Dark & Light Themes** | Full dark/light theme toggle with CSS custom properties. Dark mode default with a slate/sky color palette. | Eye |
| 12 | **Native Desktop Dialogs** | OS-native folder picker and file save dialogs via Electron IPC. Falls back to browser prompts when running without Electron. | HardDrive |
| 13 | **Path Security** | System-critical directories are blocked from organization. Export paths are validated. CORS restricted to localhost only. Backend binds exclusively to 127.0.0.1. | Shield |
| 14 | **Catch-All Organization** | Files with unknown extensions automatically route to categorized subfolders under "Other Files" — organized by extension name, never silently dropped. | Radar |

---

## 4. USE CASES (5 cards)

### 4.1 Downloads Folder Cleanup
**Description:** Your Downloads folder has 500+ files accumulated over months — PDFs, images, installers, ZIPs, random documents. FrostSweep scans it, shows you the breakdown, and organizes everything into category folders in seconds.
**Command:**
```bash
cd backend && python main.py --port 19542
# Then open http://localhost:5173, select ~/Downloads, click Scan → Organize
```
**Tags:** `file-cleanup` `downloads` `bulk-organize`

### 4.2 Project Asset Sorting
**Description:** A design project directory has hundreds of mixed assets — PSDs, SVGs, PNGs, fonts, 3D models. Create custom categories for each asset type with specific destination folders, preview the plan, then execute.
**Command:**
```bash
# Create categories via the Settings tab, then:
# Select project folder → Scan → Preview → Organize
```
**Tags:** `design-assets` `custom-categories` `project-management`

### 4.3 Duplicate Hunting
**Description:** Multiple backup copies have created duplicate files everywhere. Use the Duplicates tab to find files with identical content (not just names) via MD5 hashing, then decide what to keep.
**Command:**
```bash
# Select folder → Click "Scan for Duplicates" with subdirectories enabled
# Review name duplicates and content duplicates in the report
```
**Tags:** `deduplication` `disk-cleanup` `content-hash`

### 4.4 Selective File Migration
**Description:** Moving to a new machine and need to migrate only files modified in the last 6 months that are larger than 1MB, excluding temporary files. Set date and size filters, blacklist .tmp and .log extensions, then organize.
**Command:**
```bash
# Open Filters panel:
# Min Size: 1 MB | Modified After: 2024-09-01
# Extension Blacklist: .tmp, .log, .cache
# Click Organize
```
**Tags:** `migration` `filtering` `selective-move`

### 4.5 Safe Reorganization with Undo
**Description:** Reorganizing a shared folder but not sure if the new structure works for everyone. Run the organize, review the results, and if it doesn't work out — hit Undo to restore everything to exactly where it was.
**Command:**
```bash
# Organize files → Review results in Activity Log
# Not happy? Click Undo → All files restored
```
**Tags:** `undo` `safe-operations` `reversible`

---

## 5. INSTALLATION / QUICK START

### Clone & Run (Development)
```bash
# Clone the repository
git clone https://github.com/dbeglaryan/FrostSweep.git
cd FrostSweep

# Install Python backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Electron dependencies
npm install
```

### Start Development Servers
```bash
# Terminal 1: Python backend
cd backend && python main.py --port 19542

# Terminal 2: React frontend
cd frontend && npm run dev

# Open http://localhost:5173 in your browser
```

### Start as Desktop App
```bash
# After installing all dependencies:
npm run dev:electron
```

### Build for Distribution
```bash
# Build frontend + electron
npm run build

# Package backend (requires PyInstaller)
pip install pyinstaller
cd backend && pyinstaller --onefile --name frostsweep-backend main.py
cd ..

# Package as installer
npm run package
```

### Run Tests
```bash
# Backend (62 tests)
cd backend && python -m pytest tests/ -v

# Frontend type check
cd frontend && npx tsc --noEmit
```

---

## 6. ARCHITECTURE / PIPELINE

### Phase 1: Electron Shell
**Description:** Electron spawns the Python backend as a child process on a dynamically allocated free port. Creates the BrowserWindow and injects the API URL into the renderer via `dom-ready` event.
**Icon:** HardDrive

### Phase 2: React Frontend
**Description:** Vite-built React SPA with 11 components. Communicates with the backend over HTTP/JSON. Manages UI state, theme, filters, and activity logging. Wraps everything in an ErrorBoundary.
**Icon:** Layers

### Phase 3: FastAPI Backend
**Description:** 12 REST endpoints handling scan, preview, organize, undo, duplicates, categories, config, and log export. Thread-safe global state with mutex lock. Path validation and CORS security on every request.
**Icon:** Cpu

### Phase 4: Core Engine
**Description:** Five Python modules — scanner (file enumeration + stats), organizer (matching + moving + undo), filters (size/date/extension filtering), duplicates (MD5 hashing), config (persistence). Zero external dependencies beyond FastAPI/uvicorn.
**Icon:** Code

### Phase 5: File Operations
**Description:** Files are matched to categories by extension, routed to destination folders, with automatic directory creation and deduplication (rename/skip strategies). All moves are recorded for undo support.
**Icon:** FileOutput

---

## 7. COMPARISON TABLE

| Feature | FrostSweep | File Juggler | DropIt | Organize (CLI) |
|---------|-----------|--------------|--------|----------------|
| Cross-platform desktop app | Yes | Windows only | Windows only | macOS only |
| Custom category system | Yes | Yes | Yes | Yes |
| Preview before moving | Yes | No | No | Yes |
| One-click undo | Yes | No | No | No |
| Duplicate detection (content hash) | Yes | No | No | No |
| Six-dimension filtering | Yes | Partial | Partial | Partial |
| Dark/light theme | Yes | No | No | N/A (CLI) |
| REST API backend | Yes | No | No | No |
| Open source | Yes | No | Yes | Yes |
| Real-time activity log | Yes | Yes | No | No |
| Dry run mode | Yes | No | No | Yes |
| Extension selection grid | Yes | No | No | No |
| Export logs to CSV | Yes | No | No | No |
| Price | Free | $40+ | Free | Free |

---

## 8. SUPPORTED PLATFORMS / INTEGRATIONS

| Platform | Support | Notes |
|----------|---------|-------|
| Windows 10/11 | Full | NSIS installer via electron-builder. System32 blocked from organization. |
| macOS 12+ | Full | DMG packaging. Standard macOS window lifecycle (stays open on close). |
| Linux (Ubuntu, Fedora, Arch) | Full | AppImage packaging. Unix signal handling for graceful shutdown. |
| Browser (no Electron) | Development | Run backend + Vite dev server, open localhost:5173. Falls back to prompt() for dialogs. |

**SVG logos needed:** Windows, macOS, Linux icons (standard platform logos).

---

## 9. INTERACTIVE PREVIEW

**Dashboard mockup description:**

- **Sidebar (left, 200px):** FrostSweep logo (Snowflake icon) + three nav items: Organize (active, highlighted blue), Duplicates, Settings. Theme toggle at bottom.

- **Main content area:**
  - **Top:** Source folder input bar with Browse and Recent buttons. Folder path: `~/Downloads`
  - **Action bar:** Scan (blue), Preview (gray), Organize (green), Undo (amber, disabled), Duplicates (red) buttons. Checkboxes: Subdirectories, Dry Run. Dropdown: Rename Duplicates.
  - **Stats cards (4 across):** Total Files: 847 | Total Size: 2.3 GB | Categories: 7 | Largest: design_final_v3.psd
  - **Extension pills grid:** `.pdf` (selected/blue), `.jpg` (selected), `.png` (selected), `.docx` (selected), `.mp4` (selected), `.zip` (selected), `.exe` (unselected/gray), `.tmp` (unselected)
  - **Category table:** 7 rows showing category name, extensions (editable), destination path (editable), browse/delete buttons
  - **Activity log (bottom):** Dark terminal-style box with timestamped entries:
    ```
    [14:23:01] Scanning ~/Downloads...
    [14:23:02] Found 847 files, 14 extensions
    [14:23:15] Preview: 847 files would be organized
    [14:23:20] Organized 812 files
    [14:23:20]   Error: locked_file.docx: Permission denied
    ```

---

## 10. SEO

- **Page title:** FrostSweep — Cross-Platform File Organizer
- **Meta description:** FrostSweep scans, categorizes, and organizes files with preview, undo, duplicate detection, and smart filtering. Built with React, Electron, and Python. Free and open source.
- **Keywords:** file organizer, file manager, duplicate finder, file categorizer, desktop app, electron app, cross-platform, open source

---

## 11. TECH STACK PILLS

- Python
- FastAPI
- React
- TypeScript
- Tailwind CSS
- Vite
- Electron
- Node.js

---

## 12. PROJECT CARD (for landing page)

- **Short description:** Cross-platform file organizer with smart categorization, duplicate detection, filtering, and one-click undo. Scan any folder, preview the plan, then organize.
- **Status:** Active
- **Lucide icon:** FileOutput
- **Link label:** Explore FrostSweep →
- **Route:** /frostsweep
