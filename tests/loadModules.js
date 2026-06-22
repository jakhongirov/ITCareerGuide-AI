// ============================================================
//  loadModules.js — Test helper
//  Loads the plain (non-module) browser JS files used by the
//  AI Career Mentor project into a single Node "vm" sandbox,
//  the same way <script> tags load them into the same global
//  scope in a real browser (data.js → decisionTree.js → knn.js
//  → recommender.js).
// ============================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadModules() {
  const dir = path.join(__dirname, "..");
  const files = ["data.js", "decisionTree.js", "knn.js", "recommender.js"];

  const sandbox = { console };
  vm.createContext(sandbox);

  files.forEach((file) => {
    const code = fs.readFileSync(path.join(dir, file), "utf8");
    // Force every top-level const/function the file declares onto
    // the sandbox's `this`, mimicking how <script> tags attach
    // top-level declarations to the global `window` in a browser.
    vm.runInContext(code, sandbox, { filename: file });
  });

  // Pull out the globals each file is expected to expose
  return {
    sandbox,
    studentProfiles: vm.runInContext("studentProfiles", sandbox),
    KNN: vm.runInContext("KNN", sandbox),
    DecisionTree: vm.runInContext("DecisionTree", sandbox),
    Recommender: vm.runInContext("Recommender", sandbox),
  };
}

module.exports = { loadModules };
