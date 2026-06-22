// ===============================
// AI Career Mentor - Recommendation System
// Member 3
// ===============================
//

const Recommender = (() => {

  // ─────────────────────────────────────────
  //  KNOWLEDGE BASE
  //  Only courses, certificates, projects here.
  //  Skills are NOT stored here anymore —
  //  they are calculated from data.js instead (see getTopSkills below)
  // ─────────────────────────────────────────
  const careerResources = {

    "Software Engineer": {
      courses: [
        "JavaScript Basics",
        "React for Beginners",
        "Git & GitHub Mastery"
      ],
      certificates: [
        "Meta Frontend Developer Certificate",
        "Google IT Automation Certificate"
      ],
      projects: [
        "Portfolio Website",
        "Weather App",
        "Task Manager App"
      ]
    },

    "Data Scientist": {
      courses: [
        "Python for Data Science",
        "Machine Learning Basics",
        "SQL Fundamentals"
      ],
      certificates: [
        "IBM Data Science Certificate",
        "Google Data Analytics Certificate"
      ],
      projects: [
        "Sales Prediction Model",
        "Movie Recommendation System",
        "Data Visualization Dashboard"
      ]
    },

    "AI/ML Engineer": {
      courses: [
        "Deep Learning Specialization",
        "TensorFlow for Beginners"
      ],
      certificates: [
        "DeepLearning.AI Certificate"
      ],
      projects: [
        "Chatbot AI",
        "Image Classification System"
      ]
    },

    "Cybersecurity Analyst": {
      courses: [
        "Cybersecurity Fundamentals",
        "Network Security Basics"
      ],
      certificates: [
        "CompTIA Security+"
      ],
      projects: [
        "Network Scanner Tool",
        "Password Strength Checker"
      ]
    },

    "Frontend Developer": {
      courses: [
        "HTML & CSS Basics",
        "JavaScript Essentials",
        "Responsive Web Design"
      ],
      certificates: [
        "Meta Frontend Developer Certificate"
      ],
      projects: [
        "Personal Portfolio Website",
        "Landing Page Clone",
        "Blog Website"
      ]
    },

    "Mobile Developer": {
      courses: [
        "Flutter & Dart Basics",
        "Mobile App Development with Flutter",
        "Android Development Fundamentals"
      ],
      certificates: [
        "Meta iOS/Android Developer Certificate"
      ],
      projects: [
        "To-Do List Mobile App",
        "Weather Mobile App",
        "Expense Tracker App"
      ]
    },

    "UX Designer": {
      courses: [
        "UI/UX Design Fundamentals",
        "Figma for Beginners",
        "Design Thinking Basics"
      ],
      certificates: [
        "Google UX Design Certificate"
      ],
      projects: [
        "Mobile App Redesign",
        "Website Wireframe & Prototype",
        "Usability Test Case Study"
      ]
    },

    "Database Administrator": {
      courses: [
        "SQL Fundamentals",
        "MongoDB for Beginners",
        "Database Management Systems"
      ],
      certificates: [
        "Oracle Database Certificate"
      ],
      projects: [
        "Library Management Database",
        "E-commerce Database Design",
        "Student Record System"
      ]
    },

    // ⚠️ NEW — added because data.js now includes this career
    "Game Developer": {
      courses: [
        "Unity Game Development Fundamentals",
        "C# Programming for Games",
        "Unreal Engine Basics"
      ],
      certificates: [
        "Unity Certified Programmer"
      ],
      projects: [
        "2D Platformer Game",
        "3D Obstacle Course Game",
        "Mobile Puzzle Game"
      ]
    },

    // ⚠️ NEW — added because data.js now includes this career
    "Firmware Engineer": {
      courses: [
        "Embedded Systems Programming with C",
        "Arduino for Beginners",
        "Real-Time Operating Systems (RTOS) Basics"
      ],
      certificates: [
        "ARM Embedded Systems Certificate"
      ],
      projects: [
        "Smart Home IoT Device",
        "Arduino-Based Weather Station",
        "Embedded Motor Controller"
      ]
    }
  };


  // ─────────────────────────────────────────
  //  GET TOP SKILLS FOR A CAREER
  //  Reads studentProfiles (from data.js) and
  //  counts which skills appear most often
  //  for a given career
  // ─────────────────────────────────────────

  /**
   * @param {String} career  - career name (must match data.js exactly)
   * @param {Array}  dataset - studentProfiles array from data.js
   * @param {Number} topN    - how many top skills to return (default 3)
   * @returns {Array} - e.g. ["python", "sql", "machine learning"]
   */
  function getTopSkills(career, dataset, topN = 3) {
    // Get all profiles matching this career
    const matchingProfiles = dataset.filter(
      p => p.career.toLowerCase() === career.toLowerCase()
    );

    if (matchingProfiles.length === 0) return [];

    // Count how many times each skill appears
    const skillCount = {};
    matchingProfiles.forEach(profile => {
      profile.skills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        skillCount[s] = (skillCount[s] || 0) + 1;
      });
    });

    // Sort by frequency (highest first) and take topN
    return Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([skill]) => skill);
  }


  // ─────────────────────────────────────────
  //  MAIN SUGGEST FUNCTION
  // ─────────────────────────────────────────

  /**
   * Suggests courses, certificates and projects for a given career
   * @param {String} career        - career name (must match data.js exactly)
   * @param {Array}  studentSkills - array of skills the student already has
   * @returns {Object} { career, missingSkills, courses, certificates, projects }
   */
  function suggest(career, studentSkills) {
    const data = careerResources[career];

    if (!data) {
      // Fallback so app.js doesn't crash if career name isn't found
      return {
        career: career,
        missingSkills: [],
        courses: [],
        certificates: [],
        projects: []
      };
    }

    // ⚠️ "studentProfiles" comes from data.js — must be loaded before this file
    const requiredSkills = getTopSkills(career, studentProfiles, 3);

    // Lowercase comparison so "JavaScript" vs "javascript" doesn't cause issues
    const studentSkillsLower = studentSkills.map(s => s.toLowerCase().trim());

    const missingSkills = requiredSkills.filter(
      skill => !studentSkillsLower.includes(skill)
    );

    return {
      career: career,
      requiredSkills: requiredSkills,   // top skills found from data.js
      missingSkills: missingSkills,
      courses: data.courses,
      certificates: data.certificates,
      projects: data.projects
    };
  }

  // Export public function
  return {
    suggest,
    getTopSkills   // exported too, in case it's useful elsewhere
  };

})();
