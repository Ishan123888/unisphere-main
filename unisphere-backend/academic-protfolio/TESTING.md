# Academic Portfolio — Test Suite

## Overview

33 unit tests across 5 test classes using JUnit 5 + Mockito.
No database or running server required — all dependencies are mocked.

| Test Class | Tests | What it covers |
|---|---|---|
| `AuthServiceImplTest` | 3 | Admin login — valid, wrong password, not found |
| `AchievementServiceImplTest` | 10 | Create, read, update, delete achievements + validation |
| `AdminServiceImplTest` | 11 | Approve/reject achievements, suspend students, badge auto-assign |
| `SessionServiceImplTest` | 8 | Create, read, update, delete sessions |
| `PortfolioApplicationTests` | 1 | Spring context loads correctly |

---

## Prerequisites

- Java JDK 17
- Maven (or use the included `mvnw` wrapper — no install needed)

---

## How to Run

### Navigate to the portfolio service folder

```powershell
cd unisphere-main\unisphere-backend\academic-protfolio
```

### Set JAVA_HOME (if not already set)

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

### Run all tests

```powershell
.\mvnw test
```

### Run a specific test class

```powershell
.\mvnw test -Dtest=AuthServiceImplTest
.\mvnw test -Dtest=AchievementServiceImplTest
.\mvnw test -Dtest=AdminServiceImplTest
.\mvnw test -Dtest=SessionServiceImplTest
```

### Run with detailed output

```powershell
.\mvnw test -Dsurefire.useFile=false
```

---

## Expected Output

```
Tests run: 33, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## Test Reports

After running, HTML reports are generated at:
```
target\surefire-reports\
```

---

## Test Structure

```
src/test/java/com/unisphere/portfolio/
├── PortfolioApplicationTests.java       ← Spring context test
└── service/
    ├── AuthServiceImplTest.java         ← Admin login tests
    ├── AchievementServiceImplTest.java  ← Achievement CRUD tests
    ├── AdminServiceImplTest.java        ← Admin operations tests
    └── SessionServiceImplTest.java      ← Session CRUD tests
```
