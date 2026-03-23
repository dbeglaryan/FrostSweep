# FrostSweep

A cross-platform file organizer that scans, categorizes, and moves files into organized folders. Built with React, Electron, and Python.

## Features

- **Smart Scanning** — Scan any folder to discover file types, with optional subdirectory recursion
- **Category System** — Define custom categories with extension rules and destination folders
- **Preview Mode** — See exactly what will happen before any files move
- **Dry Run** — Simulate organization without touching files
- **Undo** — Reverse the last organization with one click
- **Duplicate Detection** — Find files with identical names or content (MD5 hash)
- **Filters** — Filter by file size, modification date, extension whitelist/blacklist
- **Statistics** — View file counts, sizes, and category breakdowns after scanning
- **Dark/Light Theme** — Modern UI with theme toggle
- **Cross-Platform** — Windows, macOS, and Linux

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Development Setup

```bash
# Clone the repository
git clone https://github.com/frostsweep/frostsweep.git
cd frostsweep

# Install Python backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install root dependencies (Electron)
npm install
```

### Running in Development

Start all three processes:

```bash
# Terminal 1: Python backend
cd backend && python main.py --port 19542

# Terminal 2: React frontend
cd frontend && npm run dev

# Terminal 3: Electron window
npm run dev:electron
```

Or run the backend and frontend without Electron — open `http://localhost:5173` in your browser.

### Running Tests

```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend type check
cd frontend && npx tsc --noEmit
```

## Architecture

```
React (Vite + Tailwind)  <--HTTP/JSON-->  Python (FastAPI)
         |                                      |
   Electron window                       File operations
   Native dialogs                        Config management
```

- **Frontend**: React + TypeScript + Tailwind CSS, built with Vite
- **Backend**: Python FastAPI serving a local REST API on localhost
- **Desktop**: Electron wraps the frontend and spawns the Python backend
- **Communication**: JSON over HTTP between React and Python

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/config` | Get configuration and categories |
| PUT | `/api/config` | Update configuration |
| POST | `/api/scan` | Scan a directory |
| POST | `/api/preview` | Preview file organization |
| POST | `/api/organize` | Execute file organization |
| POST | `/api/undo` | Undo last organization |
| POST | `/api/duplicates` | Detect duplicate files |
| POST | `/api/categories` | Add a category |
| DELETE | `/api/categories/{name}` | Remove a category |
| POST | `/api/export-log` | Export operation log to CSV |
| GET | `/api/recent-folders` | Get recently used folders |

## Project Structure

```
frostsweep/
├── backend/          Python FastAPI backend
│   ├── core/         Business logic modules
│   ├── tests/        Backend test suite
│   └── main.py       FastAPI application
├── frontend/         React + Vite frontend
│   └── src/
│       ├── api/      API client
│       ├── components/  UI components
│       └── types/    TypeScript types
├── electron/         Electron main process
└── package.json      Root project config
```

## Building for Distribution

```bash
# Build everything
npm run build

# Package as installer (requires PyInstaller for backend)
pip install pyinstaller
cd backend && pyinstaller --onefile --name frostsweep-backend main.py
cd ..
npm run package
```

Installers are output to the `release/` directory.

## License

MIT - see [LICENSE](LICENSE).
