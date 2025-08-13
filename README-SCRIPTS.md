# Development Server Scripts

This directory contains scripts to easily start both the frontend and backend development servers for the React Slack Clone.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Docker** (for MongoDB)

## Scripts

### 🐧 macOS/Linux: `dev-server.sh`

**Usage:**
```bash
# Navigate to the React-Clone directory
cd /path/to/React-Clone

# Run the script
./dev-server.sh
```

**Features:**
- ✅ Automatically checks for required dependencies
- ✅ Starts MongoDB via Docker Compose if not running
- ✅ Installs npm dependencies if missing
- ✅ Frees up ports if already in use
- ✅ Starts both backend (port 3001) and frontend (port 5173+)
- ✅ Colored output for better visibility
- ✅ Graceful shutdown with Ctrl+C

### 🪟 Windows: `dev-server.ps1`

**Usage:**
```powershell
# Navigate to the React-Clone directory
cd C:\path\to\React-Clone

# Run the script (you may need to enable script execution first)
powershell -ExecutionPolicy Bypass -File .\dev-server.ps1

# Or if execution policy allows:
.\dev-server.ps1
```

**Enable PowerShell Script Execution (if needed):**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

**Features:**
- ✅ Automatically checks for required dependencies
- ✅ Starts MongoDB via Docker Compose if not running
- ✅ Installs npm dependencies if missing
- ✅ Frees up ports if already in use
- ✅ Starts both backend (port 3001) and frontend (port 5173+)
- ✅ Colored output for better visibility
- ✅ Graceful shutdown with Ctrl+C

## What These Scripts Do

1. **Environment Check**: Verifies Node.js, npm, and Docker are installed
2. **MongoDB Setup**: Starts MongoDB container on port 27050 if not running
3. **Port Management**: Frees up ports 3001, 5173, and 5174 if in use
4. **Dependency Installation**: Runs `npm install` in both directories if needed
5. **Server Startup**: 
   - Backend: `npm run dev` (port 3001)
   - Frontend: `npm run dev` (port 5173 or next available)
6. **Monitoring**: Keeps both servers running until you stop with Ctrl+C

## Manual Setup (Alternative)

If you prefer to start servers manually:

### Terminal 1 - MongoDB:
```bash
cd /path/to/React-Clone
docker-compose -f docker-compose-mongodb.yml up -d
```

### Terminal 2 - Backend:
```bash
cd /path/to/React-Clone/backend
npm install  # if first time
npm run dev
```

### Terminal 3 - Frontend:
```bash
cd /path/to/React-Clone/frontend
npm install  # if first time
npm run dev
```

## Access the Application

Once started:
- **Frontend**: http://localhost:5173 (or shown port)
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27050

## Troubleshooting

### Port Already in Use
The scripts automatically handle this, but if you see port conflicts:
- **macOS/Linux**: `lsof -ti:3001 | xargs kill -9`
- **Windows**: `netstat -ano | findstr :3001` then `taskkill /PID <PID> /F`

### MongoDB Not Starting
- Ensure Docker is running
- Check if port 27050 is available
- Try manually: `docker-compose -f docker-compose-mongodb.yml up`

### Permission Denied (macOS/Linux)
```bash
chmod +x dev-server.sh
```

### PowerShell Execution Policy (Windows)
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

## Stopping the Servers

Simply press **Ctrl+C** in the terminal where the script is running. The scripts will automatically:
- Stop both frontend and backend servers
- Keep MongoDB running (use `docker-compose down` to stop it)
- Clean up background processes

---

**Happy coding! 🚀**
