# Deploy API documentation to GitHub Pages
Write-Host "Deploying API Documentation to GitHub Pages" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please run setup_environment.ps1 to install Git" -ForegroundColor Red
    exit 1
}

# Check if the documentation exists
if (-not (Test-Path "docs/api/html/index.html")) {
    Write-Host "Error: Documentation not found at docs/api/html/index.html!" -ForegroundColor Red
    Write-Host "Please run generate_docs.ps1 to generate the documentation" -ForegroundColor Red
    exit 1
}

# Get the current branch
$currentBranch = & git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Check if there are any uncommitted changes
$status = & git status --porcelain
if ($status) {
    Write-Host "Warning: You have uncommitted changes!" -ForegroundColor Yellow
    $continue = Read-Host "Do you want to continue? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Create a temporary branch for deployment
$tempBranch = "docs-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating temporary branch: $tempBranch" -ForegroundColor Yellow
& git checkout -b $tempBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create temporary branch!" -ForegroundColor Red
    exit 1
}

# Copy documentation to the root of the branch
Write-Host "Copying documentation to the root of the branch..." -ForegroundColor Yellow
Copy-Item -Path "docs/api/html/*" -Destination "." -Recurse -Force

# Create a simple index.html file that redirects to the API documentation
$indexHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GigGatek API Documentation</title>
    <meta http-equiv="refresh" content="0;url=index.html">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GigGatek API Documentation</h1>
        <p>Redirecting to the API documentation...</p>
        <p>If you are not redirected automatically, click <a href="index.html">here</a>.</p>
    </div>
</body>
</html>
"@

$indexHtml | Out-File -FilePath "index.html" -Encoding utf8

# Add all files to Git
Write-Host "Adding files to Git..." -ForegroundColor Yellow
& git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to add files to Git!" -ForegroundColor Red
    & git checkout $currentBranch
    & git branch -D $tempBranch
    exit 1
}

# Commit the changes
Write-Host "Committing changes..." -ForegroundColor Yellow
& git commit -m "Deploy API documentation to GitHub Pages"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to commit changes!" -ForegroundColor Red
    & git checkout $currentBranch
    & git branch -D $tempBranch
    exit 1
}

# Check if the gh-pages branch exists
$ghPagesExists = & git show-ref --verify --quiet refs/heads/gh-pages
$ghPagesExists = $LASTEXITCODE -eq 0

if ($ghPagesExists) {
    # Update the gh-pages branch
    Write-Host "Updating gh-pages branch..." -ForegroundColor Yellow
    & git checkout gh-pages
    & git merge $tempBranch --no-ff -m "Merge $tempBranch into gh-pages"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to merge into gh-pages branch!" -ForegroundColor Red
        & git checkout $currentBranch
        & git branch -D $tempBranch
        exit 1
    }
} else {
    # Create the gh-pages branch
    Write-Host "Creating gh-pages branch..." -ForegroundColor Yellow
    & git branch -m gh-pages
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create gh-pages branch!" -ForegroundColor Red
        & git checkout $currentBranch
        & git branch -D $tempBranch
        exit 1
    }
}

# Ask if the user wants to push to GitHub
$push = Read-Host "Do you want to push the gh-pages branch to GitHub? (y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    & git push origin gh-pages --force
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to push to GitHub!" -ForegroundColor Red
        & git checkout $currentBranch
        exit 1
    }
    
    Write-Host "Documentation deployed successfully!" -ForegroundColor Green
    Write-Host "Visit https://khryptorgraphics.github.io/giggatek/ to view the documentation" -ForegroundColor Green
} else {
    Write-Host "Skipping push to GitHub" -ForegroundColor Yellow
    Write-Host "To push manually, run: git push origin gh-pages --force" -ForegroundColor Yellow
}

# Switch back to the original branch
Write-Host "Switching back to $currentBranch branch..." -ForegroundColor Yellow
& git checkout $currentBranch

# Clean up
if ($ghPagesExists) {
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    & git branch -D $tempBranch
}

Write-Host "Done!" -ForegroundColor Green
exit 0
