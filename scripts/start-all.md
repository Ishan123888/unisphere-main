# UniSphere — Complete Setup & Start Guide

---

## First Time Setup (run once)

### Step 1 — Run the setup script
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\setup.ps1"
```
This creates all databases and installs frontend dependencies.

---

## Starting the Project

### Set JAVA_HOME (every new terminal)
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

### Backend Services (each in its own terminal, in this order)

| # | Service | Directory | Port |
|---|---------|-----------|------|
| 1 | Service Discovery | `unisphere-backend\service-discovery\service-discovery` | 8761 |
| 2 | Identity Service | `unisphere-backend\identity-service` | 8082 |
| 3 | Booking Service | `unisphere-backend\booking-service\booking-service` | 8081 |
| 4 | Study Lobby | `unisphere-backend\study-lobby-service` | 8083 |
| 5 | Portfolio Service | `unisphere-backend\academic-protfolio` | 8084 |
| 6 | Marketplace Server | `online-marketplace\server` | 8085 |
| 7 | API Gateway | `unisphere-backend\api-gateway\api-gateway` | 8080 |

Command for each (replace path):
```powershell
.\mvnw.cmd spring-boot:run
```
> Portfolio service uses `.\mvnw` (no `.cmd`)

### Seed Demo Users (after identity-service is up on port 8082)
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\seed-demo-users.ps1"
```
> Run this only once. It registers all demo accounts and activates all tutors.
> Safe to run again — skips accounts that already exist.

### Frontend Apps (each in its own terminal)

```powershell
# Main app — http://localhost:3000
cd unisphere-frontend
npm run dev
```

```powershell
# Marketplace — http://localhost:3001
cd online-marketplace\client
npm run dev
```

---

## Demo Credentials

| Role | Username | Password | Login URL |
|------|----------|----------|-----------|
| Student | `it24100001` | `Student@2026` | http://localhost:3000/login |
| Tutor | `it24100002` | `Tutor@2026` | http://localhost:3000/login |
| Admin (Booking) | `ad00000001` | `Admin@2026` | http://localhost:3000/login |
| Portfolio Admin | `admin` | `admin123` | http://localhost:3000/admin-login |

---

## Service URLs

| Service | URL |
|---------|-----|
| Main Frontend | http://localhost:3000 |
| Marketplace | http://localhost:3001 |
| Eureka Dashboard | http://localhost:8761 |
| API Gateway | http://localhost:8080 |
| Identity API | http://localhost:8082 |
| Booking API | http://localhost:8081 |
| Study Lobby API | http://localhost:8083 |
| Portfolio API | http://localhost:8084 |
| Marketplace API | http://localhost:8085/api/v1 |
