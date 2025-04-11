# Setup Environment for GigGatek Development
# This script installs necessary dependencies using Scoop or WinGet

# Check if Scoop is installed, if not, try to install it
if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
    Write-Host "Scoop is not installed. Attempting to install Scoop..."
    try {
        # Install Scoop
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
    }
    catch {
        Write-Host "Failed to install Scoop. Trying WinGet instead..."
        $useWinGet = $true
    }
}

# Check if WinGet is installed if Scoop installation failed
if ($useWinGet -and -not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "WinGet is not installed. Please install App Installer from the Microsoft Store."
    Write-Host "Visit: https://www.microsoft.com/p/app-installer/9nblggh4nns1"
    exit 1
}

# Function to install a package using either Scoop or WinGet
function Install-Package {
    param (
        [string]$PackageName,
        [string]$ScoopName,
        [string]$WinGetName
    )

    if (-not $useWinGet -and (Get-Command scoop -ErrorAction SilentlyContinue)) {
        Write-Host "Installing $PackageName using Scoop..."
        scoop install $ScoopName
    }
    else {
        Write-Host "Installing $PackageName using WinGet..."
        winget install -e --id $WinGetName
    }
}

# Install PHP
Install-Package -PackageName "PHP" -ScoopName "php" -WinGetName "PHP.PHP"

# Install Python
Install-Package -PackageName "Python" -ScoopName "python" -WinGetName "Python.Python.3"

# Install Node.js (for documentation tools)
Install-Package -PackageName "Node.js" -ScoopName "nodejs" -WinGetName "OpenJS.NodeJS"

# Install Git (if not already installed)
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Install-Package -PackageName "Git" -ScoopName "git" -WinGetName "Git.Git"
}

# Install Composer (PHP package manager)
if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    if (-not $useWinGet -and (Get-Command scoop -ErrorAction SilentlyContinue)) {
        scoop install composer
    }
    else {
        Write-Host "Installing Composer manually..."
        $composerInstaller = "$env:TEMP\composer-setup.php"
        Invoke-WebRequest -Uri https://getcomposer.org/installer -OutFile $composerInstaller
        php $composerInstaller --install-dir=$env:USERPROFILE\scoop\shims --filename=composer
        Remove-Item $composerInstaller
    }
}

# Verify installations
Write-Host "`nVerifying installations..."
$tools = @("php", "python", "node", "git", "composer")
foreach ($tool in $tools) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        $version = & $tool --version
        Write-Host "$tool is installed: $version"
    }
    else {
        Write-Host "$tool is NOT installed or not in PATH" -ForegroundColor Red
    }
}

# Install PHP dependencies using Composer
Write-Host "`nInstalling PHP dependencies..."
if (Test-Path "composer.json") {
    composer install
}
else {
    Write-Host "composer.json not found. Creating a new one..."
    composer init --no-interaction
    composer require phpunit/phpunit
    composer require guzzlehttp/guzzle
}

# Install Node.js dependencies for documentation
Write-Host "`nInstalling documentation tools..."
if (-not (Test-Path "package.json")) {
    # Create package.json
    @"
{
  "name": "giggatek-docs",
  "version": "1.0.0",
  "description": "GigGatek API Documentation",
  "scripts": {
    "docs:dev": "redoc-cli serve docs/api/openapi.yaml --watch",
    "docs:build": "redoc-cli bundle docs/api/openapi.yaml -o docs/api/index.html"
  },
  "dependencies": {
    "redoc-cli": "^0.13.0",
    "swagger-ui-express": "^4.6.0",
    "yaml": "^2.2.1"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8
}

# Install Node.js dependencies
npm install

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
Write-Host "You can now run tests with: .\run_tests.ps1"
Write-Host "You can generate API documentation with: npm run docs:build"
