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
    "avatarInitial", "reportTimestamp", "dtCareer", "dtConfidence",
    "matchList", "missingSkills", "roadmapList", "recCourses",
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
  { fullName: "Aiman", skillsRaw: "python, sql, tensorflow", skills: ["python", "sql", "tensorflow"], gpa: 3.8, interestLabel: "Artificial Intelligence", interests: ["artificial intelligence"] },
  { fullName: "Mei", skillsRaw: "flutter, java", skills: ["flutter", "java"], gpa: 3.1, interestLabel: "Mobile Development", interests: ["mobile apps"] },
  { fullName: "Ravi", skillsRaw: "html, css, react", skills: ["html", "css", "react"], gpa: 3.0, interestLabel: "Web Development", interests: ["web development"] },
  { fullName: "Sofia", skillsRaw: "unity, c#", skills: ["unity", "c#"], gpa: 3.2, interestLabel: "Game Development", interests: ["game development"] },
  { fullName: "Daniel", skillsRaw: "arduino, c", skills: ["arduino", "c"], gpa: 3.4, interestLabel: "Embedded Systems", interests: ["embedded systems"] },
];

testProfiles.forEach((profile) => {
  test(`results.html inline script runs end-to-end for ${profile.fullName} (${profile.interestLabel}) without throwing`, () => {
    let sandbox;
    assert.doesNotThrow(() => {
      sandbox = runResultsScriptFor(profile);
    });

    // Confirm the summary card was actually populated
    assert.equal(sandbox.document.getElementById("summaryName").textContent, profile.fullName);
    // Confirm a Decision Tree career was written (not stuck on placeholder "—")
    assert.notEqual(sandbox.document.getElementById("dtCareer").textContent, "—");
    // Confirm the match list HTML was generated (not empty)
    assert.ok(sandbox.document.getElementById("matchList").innerHTML.length > 0);
  });
});
