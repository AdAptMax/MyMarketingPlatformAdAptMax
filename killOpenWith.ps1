while ($true) {
    Get-Process | Where-Object { $_.MainWindowTitle -match "Open With" } | Stop-Process -Force
    Start-Sleep -Seconds 2
}
