# Academic Portfolio — Frontend Testing

## Tool: Cypress

Cypress is an end-to-end testing framework that runs tests in a real browser.
All API calls are intercepted with `cy.intercept()` — no live backend required.

---

## Test Summary

| File | Component | Tests | Status |
|------|-----------|-------|--------|
| `achievement-form.cy.js` | AchievementForm | 7 | ✅ All Pass |
| `achievement-list.cy.js` | AchievementList | 12 | ✅ All Pass |
| `admin-dashboard.cy.js` | AdminDashboard | 9 | ✅ All Pass |
| `modal.cy.js` | Modal | 5 | ✅ All Pass |

**Total: 33 tests — all passing**

---

## Prerequisites

- Node.js 18+
- Frontend running on `http://localhost:3000`
- Cypress installed (already in devDependencies)

---

## How to Run

```powershell
cd unisphere-main\unisphere-frontend
```

### Interactive mode (opens Cypress UI — recommended)
```powershell
npm run cy:open
```
Then: E2E Testing → choose browser → click any test file.

### Headless mode (terminal only)
```powershell
npm run cy:run:portfolio
```

### Run a single file
```powershell
npx cypress run --spec "cypress/e2e/portfolio/achievement-form.cy.js"
npx cypress run --spec "cypress/e2e/portfolio/achievement-list.cy.js"
npx cypress run --spec "cypress/e2e/portfolio/admin-dashboard.cy.js"
npx cypress run --spec "cypress/e2e/portfolio/modal.cy.js"
```

---

## Test Cases

### achievement-form.cy.js — AchievementForm (7 tests)

| # | Test | Description |
|---|------|-------------|
| 1 | shows validation errors when form is submitted empty | All 6 required field errors appear |
| 2 | shows error when title is too short | Error shown when title < 3 characters |
| 3 | shows error when description is too short | Error shown when description < 10 characters |
| 4 | clears field error when user starts typing | Error disappears on input |
| 5 | shows confirmation modal before submitting new achievement | Modal appears with correct summary data |
| 6 | can cancel the confirmation modal | Go Back closes modal, form data preserved |
| 7 | submits achievement successfully | POST API called, form resets after submit |

---

### achievement-list.cy.js — AchievementList (12 tests)

| # | Test | Description |
|---|------|-------------|
| 1 | displays all achievements by default | All 3 mock achievements visible |
| 2 | shows correct status badges | Pending, Approved, Rejected badges shown |
| 3 | filters to show only PENDING achievements | Only pending items visible after filter |
| 4 | filters to show only APPROVED achievements | Only approved items visible after filter |
| 5 | filters to show only REJECTED achievements | Only rejected items visible after filter |
| 6 | shows admin comment for rejected achievement | Admin comment text visible on card |
| 7 | shows delete confirmation modal | Modal opens with correct title and message |
| 8 | cancels delete when Keep It is clicked | Modal closes, item still in list |
| 9 | deletes achievement successfully | DELETE API called successfully |
| 10 | cannot edit or delete APPROVED achievement | Edit and Delete buttons are disabled |
| 11 | shows Get Certificate button for approved achievement | Certificate button visible |
| 12 | opens edit modal for pending achievement | Edit modal opens with pre-filled title |

---

### admin-dashboard.cy.js — AdminDashboard (9 tests)

| # | Test | Description |
|---|------|-------------|
| 1 | displays pending achievements | Achievement title and student name visible |
| 2 | shows student info on each card | Student name and email shown |
| 3 | requires comment before approving | Error shown if no comment entered |
| 4 | requires comment before rejecting | Error shown if no comment entered |
| 5 | shows approve confirmation modal with comment | Modal appears with badge assignment warning |
| 6 | approves achievement successfully | PUT approve API called |
| 7 | rejects achievement successfully | PUT reject API called |
| 8 | shows suspend confirmation modal | Suspend modal with correct message |
| 9 | shows empty state when no pending achievements | "All caught up" message shown |

---

### modal.cy.js — Modal Component (5 tests)

| # | Test | Description |
|---|------|-------------|
| 1 | opens delete modal with correct title and message | Modal visible with correct content |
| 2 | closes modal when Cancel is clicked | Modal disappears on Keep It click |
| 3 | closes modal when clicking overlay backdrop | Click outside closes modal |
| 4 | closes modal when Escape key is pressed | Escape key closes modal |
| 5 | shows loading state when processing | Processing... shown, button disabled |

---

## Test Structure

```
cypress/
├── support/
│   └── e2e.js                          ← visitPortfolio() custom command
└── e2e/
    └── portfolio/
        ├── achievement-form.cy.js
        ├── achievement-list.cy.js
        ├── admin-dashboard.cy.js
        └── modal.cy.js
```

## How Auth is Handled in Tests

- Portfolio page: `sessionStorage.currentStudentId` set via `onBeforeLoad` before page loads
- Admin dashboard: `localStorage.isAdminLoggedIn` set via `onBeforeLoad` before page loads
- No real login flow needed — auth state injected directly
