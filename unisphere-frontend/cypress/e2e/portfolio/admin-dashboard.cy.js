/**
 * AdminDashboard — Cypress E2E Tests
 */

const mockPending = [
  {
    id: 1, title: "Best Project", category: "Academic",
    institution: "SLIIT", level: "University",
    description: "Won best project at SLIIT", achievementDate: "2026-01-15",
    status: "PENDING", createdAt: "2026-01-20T10:00:00",
    student: { id: 1, fullName: "Demo Student", email: "student@sliit.lk" },
  },
];

function visitAdminDesk(achievements = mockPending) {
  cy.intercept("GET", "**/api/admin/achievements/pending**", {
    statusCode: 200,
    body: achievements,
  }).as("getPending");

  cy.visit("/admin-desk", {
    onBeforeLoad(win) {
      win.localStorage.setItem("isAdminLoggedIn", "true");
      win.localStorage.setItem("adminId", "1");
      win.localStorage.setItem("adminUsername", "admin");
      win.localStorage.setItem("adminFullName", "System Administrator");
    },
  });

  cy.wait("@getPending");
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    visitAdminDesk();
  });

  it("displays pending achievements", () => {
    cy.contains("Best Project").should("be.visible");
    cy.contains("Demo Student").should("be.visible");
    cy.contains("Pending Review").should("be.visible");
  });

  it("shows student info on each card", () => {
    cy.contains("Demo Student").should("be.visible");
    cy.contains("student@sliit.lk").should("be.visible");
  });

  it("requires comment before approving", () => {
    cy.contains("button", "Approve").click();
    cy.contains("A comment is required before taking action").should("be.visible");
  });

  it("requires comment before rejecting", () => {
    cy.contains("button", "Reject").click();
    cy.contains("A comment is required before taking action").should("be.visible");
  });

  it("shows approve confirmation modal with comment", () => {
    cy.get("textarea.comment-input").type("Excellent work, well documented");
    cy.contains("button", "Approve").click();
    cy.contains("Approve Achievement").should("be.visible");
    cy.contains("This may trigger badge assignment").should("be.visible");
  });

  it("approves achievement successfully", () => {
    cy.intercept("PUT", "**/api/admin/achievements/1/approve**", {
      statusCode: 200,
      body: { id: 1, status: "APPROVED" },
    }).as("approve");

    cy.get("textarea.comment-input").type("Excellent work!");
    cy.contains("button", "Approve").click();
    cy.get(".modal").contains("button", "Approve").click();
    cy.wait("@approve");
  });

  it("rejects achievement successfully", () => {
    cy.intercept("PUT", "**/api/admin/achievements/1/reject**", {
      statusCode: 200,
      body: { id: 1, status: "REJECTED" },
    }).as("reject");

    cy.get("textarea.comment-input").type("Insufficient evidence provided");
    cy.contains("button", "Reject").click();
    cy.get(".modal").contains("button", "Reject").click();
    cy.wait("@reject");
  });

  it("shows suspend confirmation modal", () => {
    cy.contains("button", "Suspend Student").click();
    cy.contains("Suspend Student").should("be.visible");
    cy.contains("They lose access until reinstated").should("be.visible");
  });

  it("shows empty state when no pending achievements", () => {
    visitAdminDesk([]);
    cy.contains("All caught up").should("be.visible");
  });
});
