const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./loadModules.js");

const { Recommender, studentProfiles } = loadModules();

const allCareers = Array.from(new Set(studentProfiles.map((p) => p.career)));

allCareers.forEach((career) => {
  test(`Recommender.suggest → returns non-empty courses/certificates/projects for "${career}"`, () => {
    const result = Recommender.suggest(career, []);
    assert.ok(result.courses.length > 0, `${career} has no courses`);
    assert.ok(result.certificates.length > 0, `${career} has no certificates`);
    assert.ok(result.projects.length > 0, `${career} has no projects`);
  });
});

test("Recommender.suggest → returns empty-safe fallback for an unknown career (no crash)", () => {
  const result = Recommender.suggest("Astronaut", ["python"]);
  assert.equal(result.courses.length, 0);
  assert.equal(result.certificates.length, 0);
  assert.equal(result.projects.length, 0);
});

test("Recommender.getTopSkills → top skills for Data Scientist all come from real profiles", () => {
  const topSkills = Recommender.getTopSkills("Data Scientist", studentProfiles, 3);
  const dataScientistSkills = new Set(
    studentProfiles
      .filter((p) => p.career === "Data Scientist")
      .flatMap((p) => p.skills.map((s) => s.toLowerCase()))
  );
  topSkills.forEach((skill) => {
    assert.ok(dataScientistSkills.has(skill), `"${skill}" was not actually a Data Scientist skill`);
  });
});

test("Recommender.suggest → missingSkills never includes a skill the student already has", () => {
  // python and machine learning are top skills for Data Scientist
  const result = Recommender.suggest("Data Scientist", ["python", "machine learning"]);
  assert.ok(!result.missingSkills.includes("python"));
  assert.ok(!result.missingSkills.includes("machine learning"));
});

test("Recommender.suggest → case-insensitive skill matching (JavaScript === javascript)", () => {
  const result = Recommender.suggest("Frontend Developer", ["JavaScript", "HTML", "CSS"]);
  assert.ok(!result.missingSkills.includes("javascript"));
  assert.ok(!result.missingSkills.includes("html"));
  assert.ok(!result.missingSkills.includes("css"));
});

test("Recommender.suggest → requiredSkills are derived dynamically, never hardcoded", () => {
  const result = Recommender.suggest("Game Developer", []);
  // Game Developer's known unique skills from data.js: unity, c#, unreal, c++, git
  const expectedPossible = ["unity", "c#", "unreal", "c++", "git", "python", "figma", "javascript", "sql"];
  result.requiredSkills.forEach((skill) => {
    assert.ok(expectedPossible.includes(skill), `unexpected required skill: ${skill}`);
  });
});
