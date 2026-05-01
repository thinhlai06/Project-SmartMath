$ErrorActionPreference = "Stop"

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $rootPath "backend"
$frontendPath = Join-Path $rootPath "frontend"

if (-not (Test-Path $backendPath)) {
    throw "Cannot find backend folder at: $backendPath"
}

if (-not (Test-Path $frontendPath)) {
    throw "Cannot find frontend folder at: $frontendPath"
}

function Get-PythonExecutable {
    param(
        [string]$BackendDir
    )

    $candidates = @(
        (Join-Path $BackendDir "venv\Scripts\python.exe"),
        (Join-Path $BackendDir ".venv\Scripts\python.exe")
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCmd) {
        return "python"
    }

    $pyCmd = Get-Command py -ErrorAction SilentlyContinue
    if ($pyCmd) {
        return "py -3"
    }

    throw "Python is not available. Please install Python or create backend venv first."
}

$pythonExec = Get-PythonExecutable -BackendDir $backendPath

Write-Host "Starting Smart-MathAI in one terminal..." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop both services." -ForegroundColor Magenta

$backendJob = Start-Job -Name "backend" -ArgumentList $backendPath, $pythonExec -ScriptBlock {
    param($path, $python)
    Set-Location $path

    if ($python -like "py *") {
        $parts = $python.Split(" ", 2)
        & $parts[0] $parts[1] -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --reload-dir app 2>&1
    } else {
        & $python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --reload-dir app 2>&1
    }
}

$frontendJob = Start-Job -Name "frontend" -ArgumentList $frontendPath -ScriptBlock {
    param($path)
    Set-Location $path
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm run dev 2>&1
    } else {
        & "C:\Program Files\nodejs\npm.cmd" run dev 2>&1
    }
}

$jobs = @($backendJob, $frontendJob)

try {
    while ($true) {
        foreach ($job in $jobs) {
            $messages = Receive-Job -Id $job.Id -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
            foreach ($message in $messages) {
                Write-Host "[$($job.Name)] $message"
            }
        }

        $states = $jobs | Select-Object -ExpandProperty State
        if ($states -contains "Failed" -or $states -contains "Stopped") {
            throw "One service stopped unexpectedly."
        }

        if ($states -contains "Completed") {
            throw "One service exited. Stopping the other service."
        }

        Start-Sleep -Milliseconds 300
    }
} finally {
    foreach ($job in $jobs) {
        if ($job.State -eq "Running") {
            Stop-Job -Id $job.Id | Out-Null
        }
        Remove-Job -Id $job.Id -Force -ErrorAction SilentlyContinue | Out-Null
    }
}
