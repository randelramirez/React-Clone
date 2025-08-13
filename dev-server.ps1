# React Slack Clone - Development Server Launcher (Windows PowerShell)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Title)
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "$Title" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
}

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
        return $connections.Count -gt 0
    }
    catch {
        return $false
    }
}

# Function to kill processes on a port
function Stop-ProcessOnPort {
    param([int]$Port)
    Write-Status "Checking for processes on port $Port..."
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop | Select-Object -ExpandProperty OwningProcess
        if ($processes) {
            Write-Warning "Port $Port is in use. Attempting to free it..."
            foreach ($processId in $processes) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
            
            if (Test-Port $Port) {
                Write-Error "Could not free port $Port. Please manually kill the process using this port."
                return $false
            } else {
                Write-Status "Port $Port is now available."
            }
        } else {
            Write-Status "Port $Port is available."
        }
    }
    catch {
        Write-Status "Port $Port appears to be available."
    }
    return $true
}

# Function to cleanup background processes
function Stop-DevServers {
    Write-Status "Shutting down development servers..."
    
    # Stop any npm processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Status "Development servers stopped."
}

# Set up cleanup on script exit
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-DevServers }

# Main script
try {
    Write-Header "React Slack Clone - Development Server Launcher"

    # Check if we're in the right directory
    if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
        Write-Error "This script must be run from the New directory containing both frontend and backend folders."
        exit 1
    }

    # Check for required commands
    Write-Status "Checking for required dependencies..."

    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Please install Node.js and npm first."
        exit 1
    }

    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js first."
        exit 1
    }

    # Check if MongoDB is running
    Write-Status "Checking MongoDB connection..."
    if (-not (Test-Port 27050)) {
        Write-Warning "MongoDB doesn't appear to be running on port 27050."
        Write-Status "Starting MongoDB using Docker Compose..."
        
        if (Test-Command "docker-compose") {
            Start-Process -FilePath "docker-compose" -ArgumentList "-f", "docker-compose-mongodb.yml", "up", "-d" -Wait -NoNewWindow
        }
        elseif (Test-Command "docker") {
            Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "docker-compose-mongodb.yml", "up", "-d" -Wait -NoNewWindow
        }
        else {
            Write-Error "Docker is not available. Please start MongoDB manually on port 27050."
            exit 1
        }
        
        Write-Status "Waiting for MongoDB to start..."
        Start-Sleep -Seconds 5
    }

    # Free up ports if they're in use
    if (-not (Stop-ProcessOnPort 3001)) { exit 1 }  # Backend port
    if (-not (Stop-ProcessOnPort 5173)) { exit 1 }  # Frontend port (default)
    if (-not (Stop-ProcessOnPort 5174)) { exit 1 }  # Frontend port (alternative)

    # Install dependencies if node_modules don't exist
    if (-not (Test-Path "backend\node_modules")) {
        Write-Status "Installing backend dependencies..."
        Set-Location "backend"
        Start-Process -FilePath "npm" -ArgumentList "install" -Wait -NoNewWindow
        Set-Location ".."
    }

    if (-not (Test-Path "frontend\node_modules")) {
        Write-Status "Installing frontend dependencies..."
        Set-Location "frontend"
        Start-Process -FilePath "npm" -ArgumentList "install" -Wait -NoNewWindow
        Set-Location ".."
    }

    Write-Header "Starting Development Servers"

    # Start backend server
    Write-Status "Starting backend server on http://localhost:3001"
    Set-Location "backend"
    $backendJob = Start-Job -ScriptBlock { npm run dev }
    Set-Location ".."

    # Wait a moment for backend to start
    Start-Sleep -Seconds 3

    # Start frontend server
    Write-Status "Starting frontend server..."
    Set-Location "frontend"
    $frontendJob = Start-Job -ScriptBlock { npm run dev }
    Set-Location ".."

    # Wait for servers to start
    Start-Sleep -Seconds 3

    Write-Header "Development Servers Status"
    Write-Status "Backend: http://localhost:3001"
    Write-Status "Frontend: http://localhost:5173 (or next available port)"
    Write-Status "MongoDB: mongodb://localhost:27050"
    Write-Status ""
    Write-Status "Press Ctrl+C to stop all servers"
    Write-Status ""
    Write-Status "🚀 Your React Slack Clone is ready!"

    # Keep the script running and monitor jobs
    while ($backendJob.State -eq "Running" -or $frontendJob.State -eq "Running") {
        Start-Sleep -Seconds 1
        
        # Check if jobs have output
        if ($backendJob.HasMoreData) {
            Receive-Job $backendJob | Write-Host
        }
        if ($frontendJob.HasMoreData) {
            Receive-Job $frontendJob | Write-Host
        }
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
}
finally {
    # Cleanup
    Stop-DevServers
    
    # Clean up jobs
    if ($backendJob) { Remove-Job $backendJob -Force -ErrorAction SilentlyContinue }
    if ($frontendJob) { Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue }
}
