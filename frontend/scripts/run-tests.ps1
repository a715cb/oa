param(
    [string]$TestFile,
    [string]$Grep,
    [switch]$UI,
    [switch]$Report
)

# 设置 UTF-8 编码
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 >$null
$env:PYTHONIOENCODING = 'utf-8'
$env:LESSCHARSET = 'utf-8'

# 构建命令
$cmd = "npx playwright test"

if ($UI) {
    $cmd += " --ui"
} elseif ($Report) {
    $cmd += " show-report"
} else {
    $cmd += " --project=chromium"
}

if ($TestFile) {
    $cmd += " $TestFile"
}

if ($Grep) {
    $cmd += " --grep `"$Grep`""
}

# 执行命令
Invoke-Expression $cmd
