$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PushScript = Join-Path $Root "push-to-github.ps1"

Write-Host "Watching $Root"
Write-Host "Changes will be pushed to GitHub after a short pause."
Write-Host "Press Ctrl+C to stop."

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $Root
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

$script:lastChange = Get-Date
$script:pending = $false

$action = {
  $name = $Event.SourceEventArgs.Name
  if ($name -like ".git*") { return }
  if ($name -like "*.tmp") { return }
  $script:lastChange = Get-Date
  $script:pending = $true
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

while ($true) {
  Start-Sleep -Seconds 2
  if (-not $script:pending) { continue }

  $elapsed = (Get-Date) - $script:lastChange
  if ($elapsed.TotalSeconds -lt 8) { continue }

  $script:pending = $false
  try {
    & $PushScript -Message ("Auto update " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
  } catch {
    Write-Host $_.Exception.Message
  }
}
