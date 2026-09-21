$d = Split-Path -Parent $MyInvocation.MyCommand.Path
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$jobs = @(@("mock_phones.html", "phones.png", "1300,760"), @("mock_dash.html", "dash.png", "1500,780"))
foreach ($m in $jobs) {
    $prof = Join-Path $env:TEMP "chrome-shot4"
    if (Test-Path $prof) { Remove-Item -Recurse -Force $prof }
    $url = "file:///" + ($d -replace '\\', '/') + "/" + $m[0]
    Start-Process -FilePath $chrome -ArgumentList @("--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=$($m[2])", "--virtual-time-budget=5000", "--user-data-dir=$prof", "--screenshot=`"$d\$($m[1])`"", "`"$url`"") -Wait -WindowStyle Hidden
    "$($m[1]) " + (Test-Path "$d\$($m[1])")
}
