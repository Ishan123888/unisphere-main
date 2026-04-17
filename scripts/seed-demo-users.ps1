# ============================================================
# UniSphere — Seed Demo Users
# Run AFTER identity-service is running on port 8082
# ============================================================

$API = "http://localhost:8082/auth/register"
$MYSQL = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$DB_PASS = "osloCC@123"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   UniSphere — Seeding Demo Users" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

function Register($body, $label) {
    try {
        $r = Invoke-RestMethod -Uri $API -Method POST -ContentType "application/json" -Body ($body | ConvertTo-Json)
        Write-Host "  ✓ $label — $($r.message)" -ForegroundColor Green
    } catch {
        $msg = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($msg.message -match "already registered") {
            Write-Host "  ~ $label — already exists (skipped)" -ForegroundColor Gray
        } else {
            Write-Host "  ✗ $label — $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Demo Student
Register @{ username="it24100001"; password="Student@2026"; role="STUDENT"; status="ACTIVE"; firstName="Demo"; lastName="Student"; email="student@unisphere.com" } "Student (it24100001)"

# Demo Tutor
Register @{ username="it24100002"; password="Tutor@2026"; role="TUTOR"; status="ACTIVE"; firstName="Demo"; lastName="Tutor"; email="tutor@unisphere.com"; subject="Mathematics"; hourlyRate=1500; sessionType="Online" } "Tutor (it24100002)"

# Demo Admin
Register @{ username="ad00000001"; password="Admin@2026"; role="ADMIN"; status="ACTIVE"; firstName="System"; lastName="Admin"; email="admin@unisphere.com" } "Admin (ad00000001)"

# Sample Tutors
Register @{ username="it24100003"; password="Tutor@2026"; role="TUTOR"; status="ACTIVE"; firstName="Amal"; lastName="Perera"; email="amal@sliit.lk"; subject="Data Structures"; subjects="Data Structures,Algorithms"; hourlyRate=1500; sessionType="Online"; bio="Expert in DSA with 3 years tutoring experience"; yearOfStudy="4TH_YEAR" } "Tutor Amal Perera (it24100003)"

Register @{ username="it24100004"; password="Tutor@2026"; role="TUTOR"; status="ACTIVE"; firstName="Tharaka"; lastName="Silva"; email="tharaka@sliit.lk"; subject="Web Technologies"; subjects="Web Technologies,React,Node.js"; hourlyRate=2000; sessionType="Online"; bio="Full-stack developer and passionate tutor"; yearOfStudy="GRADUATE" } "Tutor Tharaka Silva (it24100004)"

Register @{ username="it24100005"; password="Tutor@2026"; role="TUTOR"; status="ACTIVE"; firstName="Dilki"; lastName="Jayawardena"; email="dilki@sliit.lk"; subject="Database Management"; subjects="Database Management,SQL,MySQL"; hourlyRate=1200; sessionType="Physical"; bio="Database specialist with industry experience"; yearOfStudy="4TH_YEAR" } "Tutor Dilki Jayawardena (it24100005)"

# Force all tutors to ACTIVE status
Write-Host ""
Write-Host "  Activating tutor accounts..." -ForegroundColor Yellow
$sql = "USE unisphere_identity; UPDATE user_credential SET status='ACTIVE' WHERE role='TUTOR';"
$sql | & $MYSQL -u root -p"$DB_PASS" 2>&1 | Where-Object { $_ -notmatch "Warning" }
Write-Host "  ✓ All tutors activated" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Demo accounts ready!" -ForegroundColor Green
Write-Host ""
Write-Host "  Student : it24100001 / Student@2026" -ForegroundColor White
Write-Host "  Tutor   : it24100002 / Tutor@2026" -ForegroundColor White
Write-Host "  Admin   : ad00000001 / Admin@2026" -ForegroundColor White
Write-Host "  Portfolio Admin: admin / admin123" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
