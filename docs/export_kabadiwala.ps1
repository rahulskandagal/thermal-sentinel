$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir
node build_kabadiwala.js
$name = "FireOrbit_SIH26229_KabadiwalaConnect"
$app = New-Object -ComObject PowerPoint.Application
$p = $app.Presentations.Open("$dir\$name.pptx", $true, $false, $false)
"$name : $($p.Slides.Count) slides"
$p.SaveAs("$dir\$name.pdf", 32)
if (Test-Path "$dir\qa_$name") { Remove-Item -Recurse -Force "$dir\qa_$name" }
$p.Export("$dir\qa_$name", "PNG", 1600, 900)
$p.Close(); $app.Quit()
"done"
