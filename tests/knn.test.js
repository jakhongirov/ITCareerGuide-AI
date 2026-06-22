const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./loadModules.js");

const { KNN, studentProfiles } = loadModules();

test("KNN.calculateSimilarity → identical profiles score close to 1.0", () => {
  const profile = studentProfiles[0];
  const score = KNN.calculateSimilarity(
    { skills: profile.skills, gpa: profile.gpa, interests: profile.interests },
    profile
  );
  assert.ok(score > 0.99, `expected ~1.0, got ${score}`);
});

test("KNN.calculateSimilarity → completely different profiles score low", () => {
  const score = KNN.calculateSimilarity(
    { skills: ["unrelated-skill-xyz"], gpa: 0, interests: ["unrelated-interest-xyz"] },
    studentProfiles[0]
  );
  assert.ok(score < 0.2, `expected a low score, got ${score}`);
});

test("KNN.predict → returns a topCareer that exists in the dataset", () => {
  const user = { skills: ["python", "sql"], gpa: 3.5, interests: ["data science"] };
  const result = KNN.predict(user, studentProfiles, 3);
  const validCareers = new Set(studentProfiles.map((p) => p.career));
  assert.ok(validCareers.has(result.topCareer));
});

test("KNN.predict → match percentages sum to ~100 and are sorted descending", () => {
  const user = { skills: ["flutter", "java"], gpa: 3.2, interests: ["mobile apps"] };
  const result = KNN.predict(user, studentProfiles, 3);

  const total = result.matches.reduce((sum, m) => sum + m.matchPercent, 0);
  assert.ok(total >= 99 && total <= 101, `expected ~100%, got ${total}`);

  for (let i = 1; i < result.matches.length; i++) {
    assert.ok(result.matches[i - 1].matchPercent >= result.matches[i].matchPercent);
  }
});

test("KNN.predict → a clear Mobile Developer profile is matched correctly", () => {
  // flutter is a unique skill that only appears in Mobile Developer profiles
  const user = { skills: ["flutter", "java", "git"], gpa: 3.2, interests: ["mobile apps"] };
  const result = KNN.predict(user, studentProfiles, 3);
  assert.equal(result.topCareer, "Mobile Developer");
});

test("KNN.predict → returns exactly K nearest neighbors", () => {
  const user = { skills: ["python"], gpa: 3.0, interests: ["data science"] };
  const result = KNN.predict(user, studentProfiles, 3);
  assert.equal(result.nearestNeighbors.length, 3);
});

test("KNN.getSkillGap → never includes a skill the user already has", () => {
  const user = { skills: ["python", "tensorflow"], gpa: 3.8, interests: ["artificial intelligence"] };
  const gap = KNN.getSkillGap(user, studentProfiles, "AI/ML Engineer");
  assert.ok(!gap.includes("python"));
  assert.ok(!gap.includes("tensorflow"));
});

test("KNN.getSkillGap → returns an empty array for an unknown career", () => {
  const user = { skills: ["python"], gpa: 3.0, interests: [] };
  const gap = KNN.getSkillGap(user, studentProfiles, "Astronaut");
  assert.equal(gap.length, 0);
});

test("KNN.predict → handles a user with empty skills/interests without crashing", () => {
  const user = { skills: [], gpa: 0, interests: [] };
  assert.doesNotThrow(() => KNN.predict(user, studentProfiles, 3));
});
