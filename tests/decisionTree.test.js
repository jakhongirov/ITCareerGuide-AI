const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./loadModules.js");

const { DecisionTree, studentProfiles } = loadModules();

// One representative input per career, using the EXACT unique
// discriminator skills documented in decisionTree.js's own comments
const careerCases = [
  { career: "Game Developer", skills: ["unity", "c#"], interests: ["game development"] },
  { career: "Firmware Engineer", skills: ["arduino", "c"], interests: ["embedded systems"] },
  { career: "AI/ML Engineer", skills: ["tensorflow", "python"], interests: ["artificial intelligence"] },
  { career: "Data Scientist", skills: ["tensorflow", "python"], interests: ["cloud computing"] },
  { career: "Mobile Developer", skills: ["flutter", "java"], interests: ["mobile apps"] },
  { career: "Cybersecurity Analyst", skills: ["cybersecurity", "linux"], interests: ["networking"] },
  { career: "Database Administrator", skills: ["mongodb", "sql"], interests: ["databases"] },
  { career: "Frontend Developer", skills: ["react", "javascript"], interests: ["web development"] },
  { career: "UX Designer", skills: ["figma"], interests: ["design"] },
];

careerCases.forEach(({ career, skills, interests }) => {
  test(`DecisionTree.classify → recognizes ${career} from its unique skill signature`, () => {
    const result = DecisionTree.classify({ skills, gpa: 3.3, interests });
    assert.equal(result.career, career);
    assert.equal(result.resolvedBy, "decision-tree");
    assert.ok(result.confidence > 0 && result.confidence <= 100);
  });
});

test("DecisionTree.classify → falls back to Software Engineer for generic coding skills", () => {
  const result = DecisionTree.classify({
    skills: ["git", "java"],
    gpa: 3.0,
    interests: [],
  });
  assert.equal(result.career, "Software Engineer");
});

test("DecisionTree.classify → returns an error object for malformed input", () => {
  const result = DecisionTree.classify(null);
  assert.equal(result.career, "Unknown");
  assert.equal(result.resolvedBy, "error");
});

test("DecisionTree.classify → rejects input with wrong types instead of throwing", () => {
  assert.doesNotThrow(() => {
    const result = DecisionTree.classify({ skills: "not-an-array", gpa: "3.5", interests: [] });
    assert.equal(result.resolvedBy, "error");
  });
});

test("DecisionTree.classify → always returns a career that exists in data.js OR 'Unknown'", () => {
  const validCareers = new Set(studentProfiles.map((p) => p.career));
  const result = DecisionTree.classify({ skills: ["python", "sql"], gpa: 3.4, interests: ["data science"] });
  assert.ok(validCareers.has(result.career) || result.career === "Unknown");
});

test("DecisionTree.classify → ambiguous figma+web-skills+design profile resolves via fallback scorer", () => {
  const result = DecisionTree.classify({
    skills: ["figma", "html", "css", "javascript"],
    gpa: 3.1,
    interests: ["design"],
  });
  // Should resolve to either UX Designer or Frontend Developer via the fallback scorer
  assert.ok(["UX Designer", "Frontend Developer"].includes(result.career));
});
