/**
 * ============================================
 *  DECISION TREE — Career Classification
 *  CareerGuide AI | SOF106 Group Project
 *  Pure JavaScript (no libraries)
 *
 *  Depends on: data.js loaded before this file
 *
 *  HOW IT WORKS:
 *  This Decision Tree was designed by analysing
 *  the dataset and identifying which skills and
 *  interests uniquely identify each career.
 *
 *  Tree structure (15 nodes, 10 careers):
 *  Root → unity/unreal/c#? (Game Developer)
 *    YES → Game Developer
 *    NO  → arduino/assembly/embedded c/rtos?
 *            YES → Firmware Engineer
 *            NO  → tensorflow?
 *                    YES → interest: artificial intelligence?
 *                            YES → AI/ML Engineer
 *                            NO  → Data Scientist
 *                    NO  → flutter?
 *                            YES → Mobile Developer
 *                            NO  → cybersecurity skill/interest?
 *                                    YES → Cybersecurity Analyst
 *                                    NO  → mongodb?
 *                                            YES → Database Administrator
 *                                            NO  → react?
 *                                                    YES → Frontend Developer
 *                                                    NO  → interest: design?
 *                                                            YES → UX Designer
 *                                                            NO  → Software Engineer
 *
 *  For ambiguous profiles (no unique feature
 *  found), a weighted fallback scorer resolves
 *  the prediction using skills + interests + GPA
 *
 *  OUTPUT FORMAT:
 *  {
 *    career: "Data Scientist",
 *    confidence: 85,
 *    resolvedBy: "decision-tree" | "fallback-scorer"
 *  }
 * ============================================
 */


// ─────────────────────────────────────────────
//  SECTION 1 — HELPER FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Returns true if the student has ANY of the
 * target skills or interests in their array.
 */
function hasAny(studentArray, targets) {
  if (!studentArray || !targets) return false;
  const lower = studentArray.map(s => s.toLowerCase());
  return targets.some(t => lower.includes(t.toLowerCase()));
}

/**
 * Returns how many of the targets exist
 * in the student's array.
 */
function countMatches(studentArray, targets) {
  if (!studentArray || !targets) return 0;
  const lower = studentArray.map(s => s.toLowerCase());
  return targets.filter(t => lower.includes(t.toLowerCase())).length;
}


// ─────────────────────────────────────────────
//  SECTION 2 — FALLBACK WEIGHTED SCORER
//  Used only when the Decision Tree cannot
//  find a unique discriminating feature.
//  Scores every career and returns the best.
// ─────────────────────────────────────────────


// ⚡ OPTIMIZATION: studentProfiles never changes at runtime, so the
// expensive career-profile aggregation only needs to run once and
// can be cached for every later call (was previously recalculated
// from scratch on every single fallbackScorer() call).
let _careerProfilesCache = null;

/**
 * Builds a career profile summary from the
 * dataset — top skills, interests, average GPA.
 * Learned directly from studentProfiles (data.js)
 */
function buildCareerProfiles() {
  if (_careerProfilesCache) return _careerProfilesCache; // ⚡ cache hit

  const careerMap = {};

  studentProfiles.forEach(profile => {
    const career = profile.career;
    if (!careerMap[career]) {
      careerMap[career] = {
        skills: {},
        interests: {},
        gpas: [],
        count: 0
      };
    }
    careerMap[career].count++;
    careerMap[career].gpas.push(profile.gpa);
    profile.skills.forEach(s => {
      careerMap[career].skills[s] =
        (careerMap[career].skills[s] || 0) + 1;
    });
    profile.interests.forEach(i => {
      careerMap[career].interests[i] =
        (careerMap[career].interests[i] || 0) + 1;
    });
  });

  const profiles = {};
  Object.keys(careerMap).forEach(career => {
    const d = careerMap[career];
    const avgGpa = d.gpas.reduce((a, b) => a + b, 0) / d.gpas.length;
    profiles[career] = {
      topSkills: Object.entries(d.skills)
        .sort((a, b) => b[1] - a[1])
        .map(e => e[0]),
      topInterests: Object.entries(d.interests)
        .sort((a, b) => b[1] - a[1])
        .map(e => e[0]),
      avgGpa: parseFloat(avgGpa.toFixed(2))
    };
  });

  _careerProfilesCache = profiles; // ⚡ store for next call
  return profiles;
}

/**
 * Scores ONE career against the student input.
 * Skills match  → 50 points
 * Interests     → 35 points
 * GPA proximity → 15 points
 */
function scoreOneCareer(studentInput, careerProfile) {
  // Skills — top 5 most common for this career
  const topSkills = careerProfile.topSkills.slice(0, 5);
  const skillScore =
    (countMatches(studentInput.skills, topSkills) /
      Math.max(topSkills.length, 1)) * 50;

  // Interests — top 3 most common for this career
  const topInterests = careerProfile.topInterests.slice(0, 3);
  const interestScore =
    (countMatches(studentInput.interests, topInterests) /
      Math.max(topInterests.length, 1)) * 35;

  // GPA proximity
  const gpaDiff = Math.abs(studentInput.gpa - careerProfile.avgGpa);
  const gpaScore =
    gpaDiff <= 0.1 ? 15 :
    gpaDiff <= 0.3 ? 10 :
    gpaDiff <= 0.6 ? 5  : 0;

  return parseFloat((skillScore + interestScore + gpaScore).toFixed(1));
}

/**
 * Runs the weighted scorer across a given list
 * of candidate careers and returns the best one.
 * If candidateCareers is empty, scores all 8.
 */
function fallbackScorer(studentInput, candidateCareers) {
  const profiles = buildCareerProfiles();

  // If no candidates specified, score all careers
  const targets = candidateCareers && candidateCareers.length > 0
    ? candidateCareers
    : Object.keys(profiles);

  let best = null;
  let bestScore = -1;
  let secondScore = -1;

  targets.forEach(career => {
    if (!profiles[career]) return;
    const score = scoreOneCareer(studentInput, profiles[career]);
    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      best = career;
    } else if (score > secondScore) {
      secondScore = score;
    }
  });

  // Confidence boost if clearly ahead of 2nd place
  const gap = bestScore - (secondScore === -1 ? 0 : secondScore);
  let confidence = bestScore;
  if (gap >= 20) confidence = Math.min(confidence + 5, 99);
  else if (gap >= 10) confidence = Math.min(confidence + 2, 99);

  return {
    career: best,
    confidence: parseFloat(confidence.toFixed(1)),
    resolvedBy: "fallback-scorer"
  };
}


// ─────────────────────────────────────────────
//  SECTION 3 — MAIN DECISION TREE
//
//  Each node was chosen based on dataset
//  analysis — skills/interests that appear
//  exclusively or dominantly in one career.
//
//  Unique discriminators found in dataset:
//  unity/unreal/c#  → Game Developer (5/5)
//  arduino/assembly/
//  embedded c/rtos  → Firmware Engineer (5/5)
//  flutter          → Mobile Developer (5/5)
//  mongodb          → Database Administrator (5/5)
//  cybersecurity    → Cybersecurity Analyst (4/5)
//  react            → Frontend Developer (4/5)
//  tensorflow       → AI/ML Engineer (5/5) /
//                     Data Scientist (2/5)
//  interest "game development" → Game Developer (5/5)
//  interest "embedded systems" → Firmware Engineer (5/5)
//  interest "cybersecurity"    → Cybersecurity (5/5)
//  interest "design" alone     → UX Designer (5/5)
// ─────────────────────────────────────────────

function runDecisionTree(studentInput) {

  // ── Validate input ───────────────────────
  if (
    !studentInput ||
    !Array.isArray(studentInput.skills) ||
    !Array.isArray(studentInput.interests) ||
    typeof studentInput.gpa !== "number"
  ) {
    console.error("DecisionTree: Invalid input format.");
    return { career: "Unknown", confidence: 0, resolvedBy: "error" };
  }

  const skills    = studentInput.skills;
  const interests = studentInput.interests;

  // ── NODE 1 (ROOT): Has "unity", "unreal",
  //    or "c#"? ──────────────────────────────
  // unity  → 5/5 Game Developer profiles
  // unreal → 4/5 Game Developer profiles
  // c#     → 5/5 Game Developer profiles
  // None of these appear in any other career
  // interest "game development" → 5/5 Game Dev
  // → perfect discriminator
  if (
    hasAny(skills, ["unity", "unreal", "c#"]) ||
    hasAny(interests, ["game development"])
  ) {
    console.log("DecisionTree: unity/unreal/c# or game dev interest → Game Developer");
    return {
      career: "Game Developer",
      confidence: 92,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 2: Has "arduino", "assembly",
  //    "embedded c", or "rtos"? ──────────────
  // These skills appear ONLY in Firmware Engineer
  // profiles across the entire dataset
  // interest "embedded systems" → 5/5 Firmware
  // interest "iot"              → 3/5 Firmware
  // interest "hardware"         → 3/5 Firmware
  // → perfect discriminator
  if (
    hasAny(skills, ["arduino", "assembly", "embedded c", "rtos"]) ||
    hasAny(interests, ["embedded systems", "iot", "hardware"])
  ) {
    console.log("DecisionTree: firmware skills/interests → Firmware Engineer");
    return {
      career: "Firmware Engineer",
      confidence: 91,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 3 (was ROOT): Has "tensorflow"? ─
  // tensorflow appears in 5/5 AI/ML Engineers
  // and 2/5 Data Scientists → separates the
  // AI group from all other careers cleanly
  if (hasAny(skills, ["tensorflow"])) {

    // ── NODE 4: Interest = "artificial intelligence"?
    // 5/5 AI/ML Engineers have this interest
    // Only 3/5 Data Scientists have it
    // This is the best separator between the two
    if (hasAny(interests, ["artificial intelligence"])) {
      console.log("DecisionTree: tensorflow + AI interest → AI/ML Engineer");
      return {
        career: "AI/ML Engineer",
        confidence: 91,
        resolvedBy: "decision-tree"
      };
    } else {
      // Has tensorflow but NOT AI interest
      // → more likely Data Scientist
      console.log("DecisionTree: tensorflow, no AI interest → Data Scientist");
      return {
        career: "Data Scientist",
        confidence: 83,
        resolvedBy: "decision-tree"
      };
    }
  }

  // ── NODE 5: Has "flutter"? ───────────────
  // flutter appears in 5/5 Mobile Developer
  // profiles and ZERO other careers
  // → perfect discriminator
  if (hasAny(skills, ["flutter"])) {
    console.log("DecisionTree: flutter → Mobile Developer");
    return {
      career: "Mobile Developer",
      confidence: 92,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 6: Has "cybersecurity" skill
  //    OR interest "cybersecurity"? ─────────
  // "cybersecurity" as a skill → 4/5 Cybersecurity
  // "cybersecurity" as interest → 5/5 Cybersecurity
  // Neither appears in any other career
  if (
    hasAny(skills, ["cybersecurity"]) ||
    hasAny(interests, ["cybersecurity"])
  ) {
    console.log("DecisionTree: cybersecurity → Cybersecurity Analyst");
    return {
      career: "Cybersecurity Analyst",
      confidence: 90,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 7: Has "mongodb"? ───────────────
  // mongodb appears in 5/5 Database Administrator
  // profiles and ZERO other careers
  // → perfect discriminator
  if (hasAny(skills, ["mongodb"])) {
    console.log("DecisionTree: mongodb → Database Administrator");
    return {
      career: "Database Administrator",
      confidence: 93,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 8: Has "react"? ────────────────
  // react appears in 4/5 Frontend Developer
  // profiles and ZERO other careers
  if (hasAny(skills, ["react"])) {
    console.log("DecisionTree: react → Frontend Developer");
    return {
      career: "Frontend Developer",
      confidence: 88,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 9: Interest = "design" ONLY? ───
  // "design" appears in:
  //   UX Designer     → 5/5
  //   Frontend Dev    → 5/5 (but react already caught those)
  //   Mobile Dev      → 3/5 (but flutter already caught those)
  // At this point in the tree, react and flutter
  // are already eliminated, so "design" interest
  // here points strongly to UX Designer
  if (
    hasAny(interests, ["design"]) &&
    !hasAny(skills, ["react", "flutter"])
  ) {
    // Double-check: does student also have
    // strong web skills? Could be Frontend
    const hasWebSkills = hasAny(skills, ["html", "css", "javascript"]);
    const hasDesignTool = hasAny(skills, ["figma"]);

    if (hasDesignTool && !hasWebSkills) {
      // Figma only, no web skills → UX Designer
      console.log("DecisionTree: figma + design, no web skills → UX Designer");
      return {
        career: "UX Designer",
        confidence: 87,
        resolvedBy: "decision-tree"
      };
    }

    if (hasDesignTool && hasWebSkills) {
      // Has both figma AND web skills + design interest
      // → ambiguous between UX Designer and Frontend
      console.log("DecisionTree: figma + web skills + design → fallback needed");
      return fallbackScorer(studentInput, ["UX Designer", "Frontend Developer"]);
    }

    // Design interest, no figma, no react → UX Designer
    console.log("DecisionTree: design interest, no unique frontend skills → UX Designer");
    return {
      career: "UX Designer",
      confidence: 78,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 10: Has "machine learning"
  //    or "data analysis"? ──────────────────
  // These appear in Data Scientist AND AI/ML
  // but tensorflow was already checked at root.
  // Reaching here means NO tensorflow.
  // machine learning without tensorflow
  // → more likely Data Scientist
  if (hasAny(skills, ["machine learning", "data analysis"])) {
    if (hasAny(interests, ["data science"])) {
      console.log("DecisionTree: ML/data skills + data science interest → Data Scientist");
      return {
        career: "Data Scientist",
        confidence: 82,
        resolvedBy: "decision-tree"
      };
    }
    // Has ML skills but ambiguous interest
    return fallbackScorer(studentInput, ["Data Scientist", "AI/ML Engineer"]);
  }

  // ── NODE 11: Has "networking" or "linux"? ─
  // networking → Cybersecurity (5/5) and DBA (1/5)
  // linux      → Cybersecurity (5/5) and DBA (4/5)
  // At this point cybersecurity keyword is ruled out
  // so linux/networking points to DBA
  if (
    hasAny(skills, ["networking", "linux"]) &&
    hasAny(interests, ["databases", "networking"])
  ) {
    console.log("DecisionTree: networking/linux + db interest → Database Administrator");
    return {
      career: "Database Administrator",
      confidence: 79,
      resolvedBy: "decision-tree"
    };
  }

  // ── NODE 12 (DEFAULT): Software Engineer ─
  // Software Engineer is the most general career.
  // Skills like git, java, python, sql, javascript
  // appear across many careers but dominate here.
  // If no unique discriminator was found above,
  // fall back to weighted scorer across remaining
  // plausible careers.
  const remainingCareers = [
    "Software Engineer",
    "Data Scientist",
    "Frontend Developer",
    "Database Administrator"
  ];

  // Quick check: if strong git + general coding
  // skills with no specialist tool → Software Eng
  if (
    hasAny(skills, ["git", "java", "nodejs", "c++"]) &&
    !hasAny(interests, ["data science", "design", "mobile apps", "cybersecurity", "game development", "embedded systems", "iot", "hardware"])
  ) {
    console.log("DecisionTree: general coding skills → Software Engineer");
    return {
      career: "Software Engineer",
      confidence: 76,
      resolvedBy: "decision-tree"
    };
  }

  // Full fallback — let the scorer decide
  console.log("DecisionTree: no unique feature found → full fallback scorer");
  return fallbackScorer(studentInput, remainingCareers);

}


// ─────────────────────────────────────────────
//  SECTION 4 — PUBLIC API
//  Exposes "DecisionTree.classify()" so it can
//  be called the same way as KNN.predict() and
//  Recommender.suggest() from app.js
// ─────────────────────────────────────────────
const DecisionTree = {
  classify: runDecisionTree,
  // exported for unit testing / optimization re-use
  _internal: { hasAny, countMatches, buildCareerProfiles, scoreOneCareer, fallbackScorer }
};
