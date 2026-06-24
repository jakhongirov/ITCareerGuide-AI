// ============================================================
//  integration.test.js
//  Simulates running results.html's real script (KNN +
//  DecisionTree + Recommender + chart data prep) against a
//  fake minimal DOM, for every career, to catch any runtime
//  errors that unit tests alone wouldn't reach (since the real
//  script touches document.getElementById, sessionStorage, etc.)
// ============================================================

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function makeFakeDom() {
  const store = {};
  const elements = {};

  function makeEl() {
    return {
      textContent: "",
      innerHTML: "",
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener() {},
      getContext() {
        return {}; // fake canvas context, Chart is stubbed separately
      },
    };
  }

  const ids = [
    "summaryName", "summarySkills", "summaryInterest", "summaryGpa",
    "avatarInitial", "reportTimestamp", "topMatchCareer", "topMatchScore",
    "dtAgreement", "matchList", "missingSkills", "roadmapList", "recCourses",
    "recCertificates", "recProjects", "skillGapChart",
  ];
  ids.forEach((id) => (elements[id] = makeEl()));

  return {
    document: {
      getElementById: (id) => elements[id] || makeEl(),
      querySelectorAll: () => [],
    },
    sessionStorage: {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => (store[k] = v),
    },
    requestAnimationFrame: (cb) => cb(),
    setTimeout,
    Chart: function FakeChart() {
      this.destroy = () => {};
    },
    console,
  };
}

function runResultsScriptFor(profile) {
  const dir = path.join(__dirname, "..");
  const sandbox = makeFakeDom();
  vm.createContext(sandbox);

  // Seed the "saved profile" the real script expects to find
  sandbox.sessionStorage.setItem("careerMentorProfile", JSON.stringify(profile));

  // Load the same 4 algorithm files, in the same order as the HTML <script> tags
  ["data.js", "decisionTree.js", "knn.js", "recommender.js"].forEach((file) => {
    const code = fs.readFileSync(path.join(dir, file), "utf8");
    vm.runInContext(code, sandbox, { filename: file });
  });

  // Extract just the inline <script> body from results.html
  const html = fs.readFileSync(path.join(dir, "results.html"), "utf8");
  const start = html.indexOf(
    "/* ============================================================\n       RESULTS PAGE LOGIC"
  );
  const end = html.indexOf("</script>", start);
  const inlineScript = html.slice(start, end);

  vm.runInContext(inlineScript, sandbox, { filename: "results.html-inline" });

  return sandbox;
}

const testProfiles = [
  { fullName: "Aiman", skillsDisplay: ["Python", "SQL", "TensorFlow"], skills: ["python", "sql", "tensorflow"], gpa: 3.8, interestsDisplay: ["Artificial Intelligence"], interests: ["artificial intelligence"] },
  { fullName: "Mei", skillsDisplay: ["Flutter", "Java"], skills: ["flutter", "java"], gpa: 3.1, interestsDisplay: ["Mobile Apps"], interests: ["mobile apps"] },
  { fullName: "Ravi", skillsDisplay: ["HTML", "CSS", "React"], skills: ["html", "css", "react"], gpa: 3.0, interestsDisplay: ["Web Development"], interests: ["web development"] },
  { fullName: "Sofia", skillsDisplay: ["Unity", "C#"], skills: ["unity", "c#"], gpa: 3.2, interestsDisplay: ["Game Development"], interests: ["game development"] },
  { fullName: "Daniel", skillsDisplay: ["Arduino", "C"], skills: ["arduino", "c"], gpa: 3.4, interestsDisplay: ["Embedded Systems"], interests: ["embedded systems"] },

  // ⚠️ multi-select interest profiles
  { fullName: "Nadia", skillsDisplay: ["Python", "SQL"], skills: ["python", "sql"], gpa: 3.6, interestsDisplay: ["Artificial Intelligence", "Data Science"], interests: ["artificial intelligence", "data science"] },
  { fullName: "Faiz", skillsDisplay: ["HTML", "CSS", "JavaScript", "Figma"], skills: ["html", "css", "javascript", "figma"], gpa: 3.0, interestsDisplay: ["Web Development", "Design", "Mobile Apps"], interests: ["web development", "design", "mobile apps"] },
];

testProfiles.forEach((profile) => {
  test(`results.html inline script runs end-to-end for ${profile.fullName} (${profile.interestsDisplay.join(", ")}) without throwing`, () => {
    let sandbox;
    assert.doesNotThrow(() => {
      sandbox = runResultsScriptFor(profile);
    });

    // Confirm the summary card was actually populated
    assert.equal(sandbox.document.getElementById("summaryName").textContent, profile.fullName);
    // Confirm the Top Match hero was populated (not stuck on placeholder "—")
    assert.notEqual(sandbox.document.getElementById("topMatchCareer").textContent, "—");
    assert.notEqual(sandbox.document.getElementById("topMatchScore").textContent, "—");
    // Confirm the Decision Tree agreement note was written
    assert.ok(sandbox.document.getElementById("dtAgreement").innerHTML.length > 0);
    // Confirm the match list HTML was generated (not empty)
    assert.ok(sandbox.document.getElementById("matchList").innerHTML.length > 0);
    // Confirm the winning row is visually marked as the top match
    assert.ok(sandbox.document.getElementById("matchList").innerHTML.includes("match-row--top"));
  });
});
