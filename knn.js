/**
 * ============================================
 *  KNN ALGORITHM — AI Career Mentor
 *  Written by: Member 1
 *  Algorithm: K-Nearest Neighbors (K=3)
 * ============================================
 *
 * How it works:
 *  1. Takes user input (skills, GPA, interests)
 *  2. Compares user with every profile in dataset
 *  3. Finds 3 most similar profiles (K=3)
 *  4. Votes on career based on those 3 profiles
 *  5. Returns career matches with % and skill gaps
 */

const KNN = (() => {

  // ─────────────────────────────────────────
  //  SIMILARITY FUNCTIONS
  // ─────────────────────────────────────────

  /**
   * Jaccard Similarity — compares two arrays
   * Example: ["python","js"] vs ["python","css"]
   * Intersection = 1 (python), Union = 3 → score = 0.33
   */
  function jaccardSimilarity(arr1, arr2) {
    if (!arr1.length && !arr2.length) return 1;
    if (!arr1.length || !arr2.length) return 0;

    const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
    const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));

    const intersection = [...set1].filter(x => set2.has(x)).length;
    const union = new Set([...set1, ...set2]).size;

    return union === 0 ? 0 : intersection / union;
  }

  /**
   * GPA Similarity — how close two GPAs are
   * Max GPA = 4.0, so difference divided by 4
   * Example: 3.8 vs 3.5 → 1 - (0.3/4) = 0.925
   */
  function gpaSimilarity(gpa1, gpa2) {
    const g1 = parseFloat(gpa1) || 0;
    const g2 = parseFloat(gpa2) || 0;
    return 1 - Math.abs(g1 - g2) / 4.0;
  }

  /**
   * Overall Similarity — weighted combination
   *   Skills:    50% (most important)
   *   Interests: 30% (second most important)
   *   GPA:       20% (least important)
   */
  function calculateSimilarity(user, profile) {
    const skillScore    = jaccardSimilarity(user.skills, profile.skills);
    const interestScore = jaccardSimilarity(user.interests, profile.interests);
    const gpaScore      = gpaSimilarity(user.gpa, profile.gpa);

    return (skillScore * 0.5) + (interestScore * 0.3) + (gpaScore * 0.2);
  }

  // ─────────────────────────────────────────
  //  MAIN KNN PREDICT FUNCTION
  // ─────────────────────────────────────────

  /**
   * Predicts best career matches for a user
   * @param {Object} user      - { skills: [], gpa: 3.5, interests: [] }
   * @param {Array}  dataset   - array of student profiles from data.js
   * @param {Number} k         - number of neighbors (default 3)
   * @returns {Object}         - { topCareer, matches, nearestNeighbors }
   */
  function predict(user, dataset, k = 3) {

    // Step 1: Calculate similarity between user and every profile
    const similarities = dataset.map(profile => ({
      profile,
      similarity: calculateSimilarity(user, profile)
    }));

    // Step 2: Sort from most similar → least similar
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Step 3: Take only top K neighbors
    const kNearest = similarities.slice(0, k);

    // Step 4: Count career votes (weighted by similarity score)
    const careerScores = {};
    kNearest.forEach(({ profile, similarity }) => {
      const career = profile.career;
      if (!careerScores[career]) careerScores[career] = 0;
      careerScores[career] += similarity;
    });

    // Step 5: Add remaining careers from full dataset (with 0 score if not in top K)
    dataset.forEach(profile => {
      if (!careerScores[profile.career]) {
        careerScores[profile.career] = 0;
      }
    });

    // Step 6: Convert scores to percentages
    const totalScore = Object.values(careerScores).reduce((a, b) => a + b, 0);

    const careerMatches = Object.entries(careerScores).map(([career, score]) => ({
      career,
      matchPercent: totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    }));

    // Step 7: Sort by match percentage (highest first)
    careerMatches.sort((a, b) => b.matchPercent - a.matchPercent);

    return {
      topCareer:       careerMatches[0].career,
      matches:         careerMatches,
      nearestNeighbors: kNearest
    };
  }

  // ─────────────────────────────────────────
  //  SKILL GAP ANALYSIS
  // ─────────────────────────────────────────

  /**
   * Finds skills the user is MISSING for their target career
   * Looks at all profiles with that career → collects common skills
   * Returns top 5 most needed missing skills
   *
   * @param {Object} user          - user profile
   * @param {Array}  dataset       - all student profiles
   * @param {String} targetCareer  - career to analyze gap for
   * @returns {Array}              - list of missing skill names
   */
  function getSkillGap(user, dataset, targetCareer) {

    // Get all profiles that have the target career
    const careerProfiles = dataset.filter(
      p => p.career.toLowerCase() === targetCareer.toLowerCase()
    );

    if (careerProfiles.length === 0) return [];

    // Count how often each skill appears in those profiles
    const skillFrequency = {};
    careerProfiles.forEach(profile => {
      profile.skills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        skillFrequency[s] = (skillFrequency[s] || 0) + 1;
      });
    });

    // Find skills user does NOT have
    const userSkillsLower = user.skills.map(s => s.toLowerCase().trim());

    const missingSkills = Object.entries(skillFrequency)
      .filter(([skill]) => !userSkillsLower.includes(skill))
      .sort((a, b) => b[1] - a[1])   // most common missing skill first
      .slice(0, 5)
      .map(([skill]) => skill);

    return missingSkills;
  }

  // ─────────────────────────────────────────
  //  EXPORT PUBLIC FUNCTIONS
  // ─────────────────────────────────────────

  return {
    predict,
    getSkillGap,
    calculateSimilarity  // exported so it can be tested
  };

})();
