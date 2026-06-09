param(
  [string]$Message = "Update site files"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

if (-not (Test-Path -LiteralPath ".git")) {
  git init
  git branch -M main
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  Write-Host "GitHub remote is not set."
  Write-Host "Run this once, replacing the URL with your repository URL:"
  Write-Host "  git remote add origin https://github.com/USER/REPOSITORY.git"
  exit 1
}

git add index.html study-note-manifest.webmanifest study-note-sw.js study-note-icon.svg CREATE_NEW_FILE_GUIDE.md push-to-github.ps1 watch-and-push.ps1

$changes = git status --porcelain
if (-not $changes) {
  Write-Host "No changes to push."
  exit 0
}

git commit -m $Message
git push -u origin main
