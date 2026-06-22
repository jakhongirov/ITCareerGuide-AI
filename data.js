/**
 * ============================================
 *  DATA.JS — Student Profiles Dataset
 *  Fixed & cleaned version (UPDATED)
 * ============================================
 */

const studentProfiles = [

  // ─────────────────────────────────────────
  // SOFTWARE ENGINEER (5)
  // ─────────────────────────────────────────
  {
    skills: ["java", "python", "git", "sql", "linux"],
    gpa: 3.6,
    interests: ["web development", "cloud computing"],
    career: "Software Engineer"
  },
  {
    skills: ["javascript", "nodejs", "git", "sql"],
    gpa: 3.4,
    interests: ["web development", "databases"],
    career: "Software Engineer"
  },
  {
    skills: ["java", "c++", "git", "linux"],
    gpa: 3.7,
    interests: ["cloud computing", "databases"],
    career: "Software Engineer"
  },
  {
    skills: ["python", "javascript", "git", "sql", "nodejs"],
    gpa: 3.5,
    interests: ["web development", "artificial intelligence"],
    career: "Software Engineer"
  },
  {
    skills: ["python", "java", "git", "sql"],
    gpa: 2.9,
    interests: ["web development", "databases"],
    career: "Software Engineer"
  },

  // ─────────────────────────────────────────
  // DATA SCIENTIST (5)
  // ─────────────────────────────────────────
  {
    skills: ["python", "sql", "machine learning", "data analysis", "tensorflow"],
    gpa: 3.8,
    interests: ["data science", "artificial intelligence"],
    career: "Data Scientist"
  },
  {
    skills: ["python", "machine learning", "data analysis"],
    gpa: 3.9,
    interests: ["data science", "artificial intelligence"],
    career: "Data Scientist"
  },
  {
    skills: ["sql", "python", "data analysis", "tensorflow"],
    gpa: 3.7,
    interests: ["data science", "cloud computing"],
    career: "Data Scientist"
  },
  {
    skills: ["python", "machine learning", "sql", "git"],
    gpa: 3.6,
    interests: ["data science", "artificial intelligence"],
    career: "Data Scientist"
  },
  {
    skills: ["python", "sql", "data analysis", "machine learning"],
    gpa: 3.1,
    interests: ["data science", "cloud computing"],
    career: "Data Scientist"
  },

  // ─────────────────────────────────────────
  // FRONTEND DEVELOPER (5)
  // ─────────────────────────────────────────
  {
    skills: ["html", "css", "javascript", "react", "figma"],
    gpa: 3.2,
    interests: ["web development", "design"],
    career: "Frontend Developer"
  },
  {
    skills: ["html", "css", "javascript", "react"],
    gpa: 3.0,
    interests: ["web development", "design"],
    career: "Frontend Developer"
  },
  {
    skills: ["html", "css", "javascript", "figma"],
    gpa: 3.3,
    interests: ["design", "web development"],
    career: "Frontend Developer"
  },
  {
    skills: ["react", "javascript", "html", "css", "git"],
    gpa: 3.1,
    interests: ["web development", "design"],
    career: "Frontend Developer"
  },
  {
    skills: ["html", "css", "javascript", "react"],
    gpa: 3.6,
    interests: ["web development", "design"],
    career: "Frontend Developer"
  },

  // ─────────────────────────────────────────
  // CYBERSECURITY ANALYST (5)
  // ─────────────────────────────────────────
  {
    skills: ["networking", "linux", "cybersecurity", "python"],
    gpa: 3.5,
    interests: ["cybersecurity", "networking"],
    career: "Cybersecurity Analyst"
  },
  {
    skills: ["networking", "cybersecurity", "linux"],
    gpa: 3.4,
    interests: ["cybersecurity", "networking"],
    career: "Cybersecurity Analyst"
  },
  {
    skills: ["linux", "networking", "python", "cybersecurity"],
    gpa: 3.6,
    interests: ["cybersecurity", "cloud computing"],
    career: "Cybersecurity Analyst"
  },
  {
    skills: ["cybersecurity", "networking", "linux", "sql"],
    gpa: 3.3,
    interests: ["cybersecurity", "databases"],
    career: "Cybersecurity Analyst"
  },
  {
    skills: ["networking", "linux", "python"],
    gpa: 3.0,
    interests: ["cybersecurity", "networking"],
    career: "Cybersecurity Analyst"
  },

  // ─────────────────────────────────────────
  // AI/ML ENGINEER (5)
  // ─────────────────────────────────────────
  {
    skills: ["python", "tensorflow", "machine learning", "data analysis", "sql"],
    gpa: 3.9,
    interests: ["artificial intelligence", "data science"],
    career: "AI/ML Engineer"
  },
  {
    skills: ["python", "tensorflow", "machine learning"],
    gpa: 3.8,
    interests: ["artificial intelligence", "data science"],
    career: "AI/ML Engineer"
  },
  {
    skills: ["python", "machine learning", "tensorflow", "git"],
    gpa: 3.7,
    interests: ["artificial intelligence", "cloud computing"],
    career: "AI/ML Engineer"
  },
  {
    skills: ["python", "tensorflow", "data analysis", "machine learning"],
    gpa: 3.9,
    interests: ["artificial intelligence", "data science"],
    career: "AI/ML Engineer"
  },
  {
    skills: ["python", "machine learning", "tensorflow", "data analysis"],
    gpa: 3.2,
    interests: ["artificial intelligence", "data science"],
    career: "AI/ML Engineer"
  },

  // ─────────────────────────────────────────
  // MOBILE DEVELOPER (5)
  // ─────────────────────────────────────────
  {
    skills: ["flutter", "javascript", "java", "git"],
    gpa: 3.2,
    interests: ["mobile apps", "design"],
    career: "Mobile Developer"
  },
  {
    skills: ["flutter", "java", "sql"],
    gpa: 3.1,
    interests: ["mobile apps", "web development"],
    career: "Mobile Developer"
  },
  {
    skills: ["flutter", "javascript", "figma", "git"],
    gpa: 3.0,
    interests: ["mobile apps", "design"],
    career: "Mobile Developer"
  },
  {
    skills: ["java", "flutter", "sql", "git"],
    gpa: 3.3,
    interests: ["mobile apps", "databases"],
    career: "Mobile Developer"
  },
  {
    skills: ["flutter", "java", "git"],
    gpa: 2.8,
    interests: ["mobile apps", "design"],
    career: "Mobile Developer"
  },

  // ─────────────────────────────────────────
  // UX DESIGNER (5)
  // ─────────────────────────────────────────
  {
    skills: ["figma", "html", "css", "javascript"],
    gpa: 3.0,
    interests: ["design", "web development"],
    career: "UX Designer"
  },
  {
    skills: ["figma", "css", "html"],
    gpa: 2.9,
    interests: ["design", "mobile apps"],
    career: "UX Designer"
  },
  {
    skills: ["figma", "html", "css"],
    gpa: 3.1,
    interests: ["design", "web development"],
    career: "UX Designer"
  },
  {
    skills: ["figma", "javascript", "css", "html"],
    gpa: 3.0,
    interests: ["design", "mobile apps"],
    career: "UX Designer"
  },
  {
    skills: ["figma", "html", "css"],
    gpa: 3.4,
    interests: ["design", "web development"],
    career: "UX Designer"
  },

  // ─────────────────────────────────────────
  // DATABASE ADMINISTRATOR (5)
  // ─────────────────────────────────────────
  {
    skills: ["sql", "mongodb", "python", "linux"],
    gpa: 3.4,
    interests: ["databases", "cloud computing"],
    career: "Database Administrator"
  },
  {
    skills: ["sql", "mongodb", "linux"],
    gpa: 3.3,
    interests: ["databases", "networking"],
    career: "Database Administrator"
  },
  {
    skills: ["sql", "mongodb", "python", "git"],
    gpa: 3.5,
    interests: ["databases", "cloud computing"],
    career: "Database Administrator"
  },
  {
    skills: ["sql", "linux", "mongodb", "networking"],
    gpa: 3.2,
    interests: ["databases", "networking"],
    career: "Database Administrator"
  },
  {
    skills: ["sql", "mongodb", "linux"],
    gpa: 3.0,
    interests: ["databases", "networking"],
    career: "Database Administrator"
  },

  // ─────────────────────────────────────────
  // 🎮 GAME DEVELOPER (5 NEW)
  // ─────────────────────────────────────────
  {
    skills: ["unity", "c#", "git", "javascript"],
    gpa: 3.2,
    interests: ["game development", "design"],
    career: "Game Developer"
  },
  {
    skills: ["unreal", "c++", "c#", "git"],
    gpa: 3.0,
    interests: ["game development", "artificial intelligence"],
    career: "Game Developer"
  },
  {
    skills: ["unity", "c#", "python", "git"],
    gpa: 3.4,
    interests: ["game development", "cloud computing"],
    career: "Game Developer"
  },
  {
    skills: ["unreal", "c++", "c#", "sql"],
    gpa: 3.1,
    interests: ["game development", "web development"],
    career: "Game Developer"
  },
  {
    skills: ["unity", "c#", "figma", "git"],
    gpa: 2.9,
    interests: ["game development", "mobile apps"],
    career: "Game Developer"
  },

  // ─────────────────────────────────────────
  // 🔧 FIRMWARE ENGINEER (5 NEW)
  // ─────────────────────────────────────────
  {
    skills: ["c", "assembly", "arduino", "linux"],
    gpa: 3.5,
    interests: ["embedded systems", "iot"],
    career: "Firmware Engineer"
  },
  {
    skills: ["c", "embedded c", "python", "rtos"],
    gpa: 3.3,
    interests: ["embedded systems", "networking"],
    career: "Firmware Engineer"
  },
  {
    skills: ["c", "assembly", "arduino", "git"],
    gpa: 3.6,
    interests: ["hardware", "cloud computing"],
    career: "Firmware Engineer"
  },
  {
    skills: ["assembly", "embedded c", "rtos", "linux"],
    gpa: 3.4,
    interests: ["iot", "cybersecurity"],
    career: "Firmware Engineer"
  },
  {
    skills: ["c", "arduino", "python", "git"],
    gpa: 3.2,
    interests: ["hardware", "artificial intelligence"],
    career: "Firmware Engineer"
  }

];