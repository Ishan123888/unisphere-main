/**
 * AchievementList — Cypress E2E Tests
 */

const mockAchievements = [
  {
    id: 1, title: "Best Project", category: "Academic",
    institution: "SLIIT", level: "University",
    description: "Won best project award", achievementDate: "2026-01-15",
    status: "PENDING", createdAt: "2026-01-20T10:00:00",
  },
  {
    id: 2, title: "Sports Champion", category: "Sports",
    institution: "SLIIT", level: "National",
    description: "Won national sports championship", achievementDate: "2025-12-01",
    status: "APPROVED", createdAt: "2026-01-10T10:00:00",
  },
  {
    id: 3, title: "Hackathon Winner", category: "Competition",
    institution: "SLIIT", level: "University",
    description: "Won university hackathon", achievementDate: "2025-11-15",
    status: "REJECTED", createdAt: "2026-01-05T10:00:00",
    adminComment: "Insufficient evidence provided",
  },
];

describe("AchievementList", () => {
  beforeEach(() => {
    cy.visitPortfolio(mockAchievements);
  });

  it("displays all achievements by default", () => {
    cy.contains("Best Project").should("be.visible");
    cy.contains("Sports Champion").should("be.visible");
    cy.contains("Hackathon Winner").should("be.visible");
  });

  it("shows correct status badges", () => {
    cy.contains("Pending").should("be.visible");
    cy.contains("Approved").should("be.visible");
    cy.contains("Rejected").should("be.visible");
  });

  it("filters to show only PENDING achievements", () => {
    cy.contains("button", "Pending").click();
    cy.contains("Best Project").should("be.visible");
    cy.contains("Sports Champion").should("not.exist");
    cy.contains("Hackathon Winner").should("not.exist");
  });

  it("filters to show only APPROVED achievements", () => {
    cy.contains("button", "Approved").click();
    cy.contains("Sports Champion").should("be.visible");
    cy.contains("Best Project").should("not.exist");
  });

  it("filters to show only REJECTED achievements", () => {
    cy.contains("button", "Rejected").click();
    cy.contains("Hackathon Winner").should("be.visible");
    cy.contains("Insufficient evidence provided").should("be.visible");
  });

  it("shows admin comment for rejected achievement", () => {
    cy.contains("Hackathon Winner")
      .parents(".achievement-card")
      .contains("Insufficient evidence provided")
      .should("be.visible");
  });

  it("shows delete confirmation modal", () => {
    cy.contains("Best Project")
      .parents(".achievement-card")
      .contains("button", "Delete").click();
    cy.contains("Delete Achievement").should("be.visible");
    cy.contains("This action cannot be undone").should("be.visible");
  });

  it("cancels delete when Keep It is clicked", () => {
    cy.contains("Best Project")
      .parents(".achievement-card")
      .contains("button", "Delete").click();
    cy.contains("Keep It").click();
    cy.contains("Delete Achievement").should("not.exist");
    cy.contains("Best Project").should("be.visible");
  });

  it("deletes achievement successfully", () => {
    cy.intercept("DELETE", "**/api/student/achievements/1", { statusCode: 200 }).as("deleteAchievement");

    cy.contains("Best Project")
      .parents(".achievement-card")
      .contains("button", "Delete").click();
    cy.contains("Yes, Delete").click();
    cy.wait("@deleteAchievement");
  });

  it("cannot edit or delete APPROVED achievement", () => {
    cy.contains("Sports Champion")
      .parents(".achievement-card").within(() => {
        cy.contains("button", "Edit").should("be.disabled");
        cy.contains("button", "Delete").should("be.disabled");
      });
  });

  it("shows Get Certificate button for approved achievement", () => {
    cy.contains("Sports Champion")
      .parents(".achievement-card")
      .contains("Get Certificate").should("be.visible");
  });

  it("opens edit modal for pending achievement", () => {
    cy.contains("Best Project")
      .parents(".achievement-card")
      .contains("button", "Edit").click();
    cy.contains("Edit Achievement").should("be.visible");
    // Scope to the modal to avoid matching the main form's title input
    cy.get(".modal, [role=dialog]").find("input[name=title]")
      .should("have.value", "Best Project");
  });
});
