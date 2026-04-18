/**
 * AchievementForm — Cypress E2E Tests
 */

describe("AchievementForm", () => {
  beforeEach(() => {
    cy.visitPortfolio();
  });
  it("shows validation errors when form is submitted empty", () => {
    cy.contains("button", "Submit Achievement").click();
    cy.contains("Title is required").should("be.visible");
    cy.contains("Please select a category").should("be.visible");
    cy.contains("Description is required").should("be.visible");
    cy.contains("Institution name is required").should("be.visible");
    cy.contains("Please select a level").should("be.visible");
    cy.contains("Achievement date is required").should("be.visible");
  });

  it("shows error when title is too short", () => {
    cy.get("input[name=title]").type("AB");
    cy.contains("button", "Submit Achievement").click();
    cy.contains("Title must be at least 3 characters").should("be.visible");
  });

  it("shows error when description is too short", () => {
    cy.get("textarea[name=description]").type("Too short");
    cy.contains("button", "Submit Achievement").click();
    cy.contains("Description must be at least 10 characters").should("be.visible");
  });

  it("clears field error when user starts typing", () => {
    cy.contains("button", "Submit Achievement").click();
    cy.contains("Title is required").should("be.visible");
    cy.get("input[name=title]").type("My Achievement");
    cy.contains("Title is required").should("not.exist");
  });

  it("shows confirmation modal before submitting new achievement", () => {
    cy.get("input[name=title]").type("Best Project Award");
    cy.get("select[name=category]").select("Academic");
    cy.get("input[name=institution]").type("SLIIT");
    cy.get("select[name=level]").select("University");
    cy.get("textarea[name=description]").type("Won best project at SLIIT annual competition");
    cy.get("input[name=achievementDate]").type("2026-01-15");

    cy.contains("button", "Submit Achievement").click();

    cy.contains("Please review your details before submitting").should("be.visible");
    cy.contains("Best Project Award").should("be.visible");
    cy.contains("Academic").should("be.visible");
    cy.contains("SLIIT").should("be.visible");
  });

  it("can cancel the confirmation modal", () => {
    cy.get("input[name=title]").type("Best Project Award");
    cy.get("select[name=category]").select("Academic");
    cy.get("input[name=institution]").type("SLIIT");
    cy.get("select[name=level]").select("University");
    cy.get("textarea[name=description]").type("Won best project at SLIIT annual competition");
    cy.get("input[name=achievementDate]").type("2026-01-15");

    cy.contains("button", "Submit Achievement").click();
    cy.contains("Go Back").click();

    cy.get("input[name=title]").should("have.value", "Best Project Award");
  });

  it("submits achievement successfully", () => {
    cy.intercept("POST", "**/api/student/achievements**", {
      statusCode: 201,
      body: { id: 1, title: "Best Project Award", status: "PENDING" },
    }).as("createAchievement");

    cy.get("input[name=title]").type("Best Project Award");
    cy.get("select[name=category]").select("Academic");
    cy.get("input[name=institution]").type("SLIIT");
    cy.get("select[name=level]").select("University");
    cy.get("textarea[name=description]").type("Won best project at SLIIT annual competition");
    cy.get("input[name=achievementDate]").type("2026-01-15");

    cy.contains("button", "Submit Achievement").click();
    cy.contains("Confirm & Submit").click();

    cy.wait("@createAchievement");
    // Form resets after successful submission
    cy.get("input[name=title]").should("have.value", "");
  });
});
