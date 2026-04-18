/**
 * Modal Component — Cypress E2E Tests
 */

describe("Modal Component", () => {
  const modalMock = [{
    id: 1, title: "Test Achievement", category: "Academic",
    institution: "SLIIT", level: "University",
    description: "Test description for achievement",
    achievementDate: "2026-01-15", status: "PENDING",
    createdAt: "2026-01-20T10:00:00",
  }];

  beforeEach(() => {
    cy.visitPortfolio(modalMock);
  });

  it("opens delete modal with correct title and message", () => {
    cy.contains("Test Achievement")
      .parents(".achievement-card")
      .contains("button", "Delete").click();

    cy.get("[role=dialog]").should("be.visible");
    cy.contains("Delete Achievement").should("be.visible");
    cy.contains("Test Achievement").should("be.visible");
    cy.contains("This action cannot be undone").should("be.visible");
  });

  it("closes modal when Cancel is clicked", () => {
    cy.contains("Test Achievement")
      .parents(".achievement-card")
      .contains("button", "Delete").click();

    cy.get("[role=dialog]").should("be.visible");
    cy.contains("Keep It").click();
    cy.get("[role=dialog]").should("not.exist");
  });

  it("closes modal when clicking overlay backdrop", () => {
    cy.contains("Test Achievement")
      .parents(".achievement-card")
      .contains("button", "Delete").click();

    cy.get("[role=dialog]").should("be.visible");
    cy.get(".modal-overlay").first().click({ force: true });
    cy.get("[role=dialog]").should("not.exist");
  });

  it("closes modal when Escape key is pressed", () => {
    cy.contains("Test Achievement")
      .parents(".achievement-card")
      .contains("button", "Delete").click();

    cy.get("[role=dialog]").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("[role=dialog]").should("not.exist");
  });

  it("shows loading state when processing", () => {
    cy.intercept("DELETE", "**/api/student/achievements/1", (req) => {
      req.reply({ delay: 2000, statusCode: 200 });
    }).as("slowDelete");

    cy.contains("Test Achievement")
      .parents(".achievement-card")
      .contains("button", "Delete").click();

    cy.contains("Yes, Delete").click();
    cy.contains("Processing...").should("be.visible");
    cy.contains("Yes, Delete").should("not.exist");
  });
});
