# Build both SIH-template decks, export PDFs (portal needs PDF) and slide PNGs for QA.
$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir
node build_sih_template.js
node build_sih_template.js extended
$app = New-Object -ComObject PowerPoint.Application
foreach ($name in @("SIH26162_ThermalSentinel_Idea_6slides", "SIH26162_ThermalSentinel_Idea_extended")) {
    $p = $app.Presentations.Open("$dir\$name.pptx", $true, $false, $false)
    "$name : $($p.Slides.Count) slides"
    $p.SaveAs("$dir\$name.pdf", 32)   # 32 = ppSaveAsPDF
    if (Test-Path "$dir\qa_$name") { Remove-Item -Recurse -Force "$dir\qa_$name" }
    $p.Export("$dir\qa_$name", "PNG", 1600, 900)
    $p.Close()
}
$app.Quit()
"done"
