$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir
node build_fireorbit_clean.js
$name = "FireOrbit_SIH26162_ThermalSentinel"
$f = "$dir\fix\$name.pptx"

Get-Process POWERPNT -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1
$app = New-Object -ComObject PowerPoint.Application
$p = $app.Presentations.Open($f, $false, $false, $false)
"$name : $($p.Slides.Count) slides"
$p.SaveAs($f, 24)                     # re-save as a normal PowerPoint file
$p.SaveAs("$dir\fix\$name.pdf", 32)   # PDF for the portal
if (Test-Path "$dir\fix\qa") { Remove-Item -Recurse -Force "$dir\fix\qa" }
$p.Export("$dir\fix\qa", "PNG", 1600, 900)
$p.Close(); $app.Quit()
Start-Sleep 2
python "$dir\scrub_meta.py" $f
"done"
