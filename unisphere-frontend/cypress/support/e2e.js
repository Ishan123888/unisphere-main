Cypress.on("uncaught:exception", () => false);

Cypress.Commands.add("visitPortfolio", (achievements = []) => {
  cy.intercept("GET", "**/api/admin/students**", {
    statusCode: 200,
    body: [{ id: 1, fullName: "Demo Student", email: "student@sliit.lk", degreeProgram: "IT", academicYear: "Year 2" }],
  }).as("getStudents");

  cy.intercept("GET", "**/api/student/achievements/student/1**", {
    statusCode: 200,
    body: achievements,
  }).as("getAchievements");

  cy.intercept("GET", "**/api/admin/students/1/badges**", {
    statusCode: 200, body: [],
  }).as("getBadges");

  cy.intercept("GET", "**/api/session-questions/student/1/results**", {
    statusCode: 200, body: [],
  }).as("getQuizResults");

  cy.visit("/portfolio", {
    onBeforeLoad(win) {
      win.sessionStorage.setItem("currentStudentId", "1");
      win.sessionStorage.setItem("studentName", "Demo Student");
    },
  });

  cy.get(".portfolio-root", { timeout: 10000 }).should("exist");
  cy.wait("@getAchievements");
});
