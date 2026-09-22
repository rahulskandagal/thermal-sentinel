$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir
node build_yfiles.js
$name = "FireOrbit_SIH26162_ThermalSentinel_YFormat"
Get-Process POWERPNT -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1
$app = New-Object -ComObject PowerPoint.Application
$p = $app.Presentations.Open("$dir\$name.pptx", $true, $false, $false)
"$name : $($p.Slides.Count) slides"
$p.SaveAs("$dir\$name.pdf", 32)
if (Test-Path "$dir\qa_$name") { Remove-Item -Recurse -Force "$dir\qa_$name" }
$p.Export("$dir\qa_$name", "PNG", 1600, 900)
$p.Close(); $app.Quit()
"done"
