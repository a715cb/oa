# UTF-8 编码设置脚本
# 用于确保 Windows 终端使用 UTF-8 编码运行应用和测试

# 设置控制台代码页为 UTF-8 (65001)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# 设置环境变量
$env:PYTHONIOENCODING = "utf-8"
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"

Write-Host "[OK] 终端编码已设置为 UTF-8 (代码页 65001)" -ForegroundColor Green
