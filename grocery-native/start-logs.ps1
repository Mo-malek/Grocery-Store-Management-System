#!/usr/bin/env pwsh
# Start Expo with full output logging
Set-Location "g:\my-app\grocery-native"
Write-Host "Starting Expo from: $(Get-Location)"
npx expo start --clear
