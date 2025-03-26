# AdAptMax System Installation Check
# Scans installed software and downloaded files

# Define output file
$reportFile = "C:\AdAptMax_Installation_Report.txt"

# Clear previous report
if (Test-Path $reportFile) {
    Remove-Item $reportFile -Force
}

# Start Report
$report = @"
====================================================
🔍 AdAptMax Installation Status Report - $(Get-Date)
====================================================
"@

# Function to check installed programs
Function Check-InstalledSoftware {
    param ([string]$softwareName)
    $installed = Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*, `
                                 HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* `
                                 -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like "*$softwareName*" }
    if ($installed) {
        return "✅ Installed"
    } else {
        return "❌ Not Installed"
    }
}

# Function to check if a folder exists
Function Check-Folder {
    param ([string]$folderPath)
    if (Test-Path $folderPath) {
        return "✅ Exists"
    } else {
        return "❌ Not Found"
    }
}

# Check Installed AI Software
$report += "`n`n[🔹 Installed AI & Automation Software]"
$report += "`nPython: $(Check-InstalledSoftware 'Python')"
$report += "`nTensorFlow: $(Check-InstalledSoftware 'TensorFlow')"
$report += "`nPyTorch: $(Check-InstalledSoftware 'PyTorch')"
$report += "`nOpenAI API: $(Check-InstalledSoftware 'OpenAI')"
$report += "`nPower BI: $(Check-InstalledSoftware 'Power BI')"
$report += "`nPostgreSQL (for Supabase): $(Check-InstalledSoftware 'PostgreSQL')"
$report += "`nDocker (for AI Services): $(Check-InstalledSoftware 'Docker')"

# Check Cloud & Security Tools
$report += "`n`n[🔹 Cloud & Security Setup]"
$report += "`nAWS CLI: $(Check-InstalledSoftware 'AWS Command Line Interface')"
$report += "`nAzure CLI: $(Check-InstalledSoftware 'Microsoft Azure CLI')"
$report += "`nGoogle Cloud SDK: $(Check-InstalledSoftware 'Google Cloud SDK')"
$report += "`nQuantum Encryption Software: $(Check-InstalledSoftware 'Kyber')"
$report += "`nFraud Prevention Tools: $(Check-InstalledSoftware 'Fraud Prevention')"

# Check Important Folders
$report += "`n`n[🔹 Key Directories & Files]"
$report += "`nMarketing AI Scripts: $(Check-Folder 'C:\AI\MarketingAutomation')"
$report += "`nSales AI Scripts: $(Check-Folder 'C:\AI\SalesAutomation')"
$report += "`nWorkforce Management AI: $(Check-Folder 'C:\AI\Workforce')"
$report += "`nPOS Integration Files: $(Check-Folder 'C:\AI\POSIntegration')"
$report += "`nBusiness Dashboards: $(Check-Folder 'C:\AI\Dashboards')"
$report += "`nQuantum Security Config: $(Check-Folder 'C:\AI\Security')"

# List all downloaded files in key folders
$report += "`n`n[🔹 Downloaded Files in Important Directories]"
$downloads = Get-ChildItem -Path "C:\Users\Scott\Downloads" -File
$report += "`nDownloads Folder:"
foreach ($file in $downloads) {
    $report += "`n - " + $file.Name
}

$aiFolder = Get-ChildItem -Path "C:\AI" -Recurse -File
$report += "`n`nC:\AI Directory:"
foreach ($file in $aiFolder) {
    $report += "`n - " + $file.FullName
}

# Save the report
$report | Out-File -FilePath $reportFile -Encoding utf8

# Display report
Write-Host "`n🔍 AdAptMax Installation Report Generated!"
Write-Host "📄 Report saved to: $reportFile"
Start-Process notepad.exe $reportFile  # Open the report in Notepad automatically
