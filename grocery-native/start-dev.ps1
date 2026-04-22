#!/usr/bin/env pwsh

# Start Expo development server
Set-Location "$PSScriptRoot"
New-Alias npx npx.cmd -Force
npx expo start --clear
