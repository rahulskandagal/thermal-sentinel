$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir
python fill_template.py
$name = "FireOrbit_SIH26162_ThermalSentinel_OfficialTemplate"
Get-Process POWERPNT -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1
$app = New-Object -ComObject PowerPoint.Application
$p = $app.Presentations.Open("$dir\$name.pptx", $false, $false, $false)
"$name : $($p.Slides.Count) slides"
$p.SaveAs("$dir\$name.pptx", 24)
$p.SaveAs("$dir\$name.pdf", 32)
if (Test-Path "$dir\qa") { Remove-Item -Recurse -Force "$dir\qa" }
$p.Export("$dir\qa", "PNG", 1600, 900)
$p.Close(); $app.Quit()
Start-Sleep 2
python "$dir\..\scrub_meta.py" "$dir\$name.pptx"
"done"
