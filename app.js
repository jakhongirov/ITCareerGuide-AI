/**
 * ============================================
 *  APP.JS — AI Career Mentor (Main Logic)
 *  Written by: Member 1
 *  Connects: KNN + DecisionTree + Recommender
 * ============================================
 *
 * This file handles:
 *  - Reading user input from the form
 *  - Calling all 3 algorithms
 *  - Passing results to results.html
 *  - Displaying everything on the results page
 */


// ─────────────────────────────────────────────
//  PAGE DETECTION
//  Runs different logic depending on which
//  page the user is currently on
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'home')    initHomePage();
  if (page === 'results') initResultsPage();
});


// ═════════════════════════════════════════════
//  HOME PAGE — index.html
//  Handles form submission and runs algorithms
// ═════════════════════════════════════════════

function initHomePage() {

  const form = document.getElementById('career-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // ── Step 1: Read user input ──────────────
    const user = collectUserInput();

    // Validate input
    if (user.skills.length === 0) {
      showError('Please select at least one skill.');
      return;
    }
    if (user.interests.length === 0) {
      showError('Please select at least one interest.');
      return;
    }
    if (isNaN(user.gpa) || user.gpa < 0 || user.gpa > 4.0) {
      showError('Please enter a valid GPA between 0.0 and 4.0');
      return;
    }

    // ── Step 2: Run KNN Algorithm ─────────────
    //    Uses dataset from data.js (Member 5)
    const knnResult = KNN.predict(user, studentProfiles, 3);

    // ── Step 3: Run Decision Tree Algorithm ───
    //    Uses decisionTree.js (Member 2)
    const dtResult = (typeof DecisionTree !== 'undefined')
      ? DecisionTree.classify(user)
      : { career: knnResult.topCareer, confidence: 0 };

    // ── Step 4: Run Recommendation System ─────
    //    Uses recommender.js (Member 3)
    const recommendations = (typeof Recommender !== 'undefined')
      ? Recommender.suggest(knnResult.topCareer, user.skills)
      : { courses: [], certificates: [], projects: [] };

    // ── Step 5: Get Skill Gap (from KNN) ──────
    const skillGap = KNN.getSkillGap(user, studentProfiles, knnResult.topCareer);

    // ── Step 6: Bundle all results together ───
    const results = {
      user,
      knnResult,
      dtResult,
      recommendations,
      skillGap,
      timestamp: new Date().toLocaleString()
    };

    // ── Step 7: Save and go to results page ───
    sessionStorage.setItem('careerResults', JSON.stringify(results));
    window.location.href = 'results.html';
  });
}


/**
 * Reads all form inputs and returns user object
 * @returns {Object} { skills, gpa, interests }
 */
function collectUserInput() {
  // Get all checked skill checkboxes
  const skillBoxes = document.querySelectorAll('input[name="skills"]:checked');
  const skills = [...skillBoxes].map(cb => cb.value);

  // Get GPA value
  const gpa = parseFloat(document.getElementById('gpa')?.value) || 0;

  // Update GPA display label if it exists
  const gpaDisplay = document.getElementById('gpa-display');
  if (gpaDisplay) gpaDisplay.textContent = gpa.toFixed(1);

  // Get all checked interest checkboxes
  const interestBoxes = document.querySelectorAll('input[name="interests"]:checked');
  const interests = [...interestBoxes].map(cb => cb.value);

  return { skills, gpa, interests };
}

/**
 * Shows an error message on the form page
 */
function showError(message) {
  const errorDiv = document.getElementById('error-msg');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 4000);
  } else {
    alert(message);
  }
}


// ═════════════════════════════════════════════
//  RESULTS PAGE — results.html
//  Reads stored results and displays everything
// ═════════════════════════════════════════════

function initResultsPage() {

  // Get stored results from sessionStorage
  const stored = sessionStorage.getItem('careerResults');

  if (!stored) {
    // No results found → go back to home
    window.location.href = 'index.html';
    return;
  }

  const results = JSON.parse(stored);
  const { user, knnResult, dtResult, recommendations, skillGap } = results;

  // ── Display each section ─────────────────
  displayTopCareer(knnResult, dtResult);
  displayCareerMatches(knnResult.matches);
  displaySkillGap(user.skills, skillGap, knnResult.topCareer);
  displayRecommendations(recommendations);
  displayNearestNeighbors(knnResult.nearestNeighbors);
  renderCareerChart(knnResult.matches);
}


/**
 * Shows the #1 recommended career at the top
 */
function displayTopCareer(knnResult, dtResult) {
  const el = document.getElementById('top-career');
  if (el) el.textContent = knnResult.topCareer;

  const matchEl = document.getElementById('top-match-percent');
  if (matchEl) matchEl.textContent = knnResult.matches[0].matchPercent + '%';

  // Also show Decision Tree result if available
  const dtEl = document.getElementById('dt-career');
  if (dtEl && dtResult) {
    dtEl.textContent = dtResult.career || '—';
  }
}


/**
 * Renders all career match cards with progress bars
 */
function displayCareerMatches(matches) {
  const container = document.getElementById('career-matches');
  if (!container) return;

  container.innerHTML = '';

  matches.forEach(match => {
    const percent = match.matchPercent;

    // Color coding: green > 60%, yellow > 40%, red otherwise
    const color = percent > 60 ? '#4CAF50'
                : percent > 40 ? '#FFC107'
                :                '#F44336';

    const card = document.createElement('div');
    card.className = 'career-card';
    card.innerHTML = `
      <div class="career-card-header">
        <span class="career-name">${match.career}</span>
        <span class="career-percent" style="color:${color}">${percent}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill"
             style="width:${percent}%; background:${color}; transition: width 1s ease">
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}


/**
 * Shows skills the user has vs skills they are missing
 */
function displaySkillGap(userSkills, missingSkills, targetCareer) {
  // Show user's current skills
  const hasContainer = document.getElementById('skills-have');
  if (hasContainer) {
    hasContainer.innerHTML = '';
    userSkills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag has';
      tag.textContent = '✅ ' + skill;
      hasContainer.appendChild(tag);
    });
  }

  // Show missing skills
  const missingContainer = document.getElementById('skills-missing');
  if (missingContainer) {
    missingContainer.innerHTML = '';

    if (missingSkills.length === 0) {
      missingContainer.innerHTML = '<p>Great! You have all key skills for this career.</p>';
      return;
    }

    const title = document.createElement('p');
    title.textContent = `Skills to learn for ${targetCareer}:`;
    missingContainer.appendChild(title);

    missingSkills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag missing';
      tag.textContent = '❌ ' + skill;
      missingContainer.appendChild(tag);
    });
  }
}


/**
 * Shows course, certificate and project recommendations
 * (Data comes from recommender.js — Member 3)
 */
function displayRecommendations(recommendations) {
  if (!recommendations) return;

  // Courses
  const coursesEl = document.getElementById('rec-courses');
  if (coursesEl && recommendations.courses) {
    coursesEl.innerHTML = '';
    recommendations.courses.forEach(course => {
      const item = document.createElement('div');
      item.className = 'rec-item';
      item.innerHTML = `📚 ${course}`;
      coursesEl.appendChild(item);
    });
  }

  // Certificates
  const certsEl = document.getElementById('rec-certificates');
  if (certsEl && recommendations.certificates) {
    certsEl.innerHTML = '';
    recommendations.certificates.forEach(cert => {
      const item = document.createElement('div');
      item.className = 'rec-item';
      item.innerHTML = `🏆 ${cert}`;
      certsEl.appendChild(item);
    });
  }

  // Projects
  const projectsEl = document.getElementById('rec-projects');
  if (projectsEl && recommendations.projects) {
    projectsEl.innerHTML = '';
    recommendations.projects.forEach(project => {
      const item = document.createElement('div');
      item.className = 'rec-item';
      item.innerHTML = `🛠️ ${project}`;
      projectsEl.appendChild(item);
    });
  }
}


/**
 * Shows the 3 most similar student profiles (KNN neighbors)
 * Helps user understand WHY they got that career recommendation
 */
function displayNearestNeighbors(neighbors) {
  const container = document.getElementById('nearest-neighbors');
  if (!container) return;

  container.innerHTML = '';

  neighbors.forEach((n, index) => {
    const p = n.profile;
    const sim = Math.round(n.similarity * 100);

    const card = document.createElement('div');
    card.className = 'neighbor-card';
    card.innerHTML = `
      <h4>Similar Student #${index + 1}</h4>
      <p><strong>Career:</strong> ${p.career}</p>
      <p><strong>GPA:</strong> ${p.gpa}</p>
      <p><strong>Skills:</strong> ${p.skills.join(', ')}</p>
      <p><strong>Interests:</strong> ${p.interests.join(', ')}</p>
      <p><strong>Similarity:</strong> ${sim}%</p>
    `;
    container.appendChild(card);
  });
}


/**
 * Renders the career match bar chart using Chart.js
 * (Chart.js is loaded in results.html via CDN)
 */
function renderCareerChart(matches) {
  const canvas = document.getElementById('careerChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: matches.map(m => m.career),
      datasets: [{
        label: 'Career Match %',
        data:   matches.map(m => m.matchPercent),
        backgroundColor: matches.map(m =>
          m.matchPercent > 60 ? 'rgba(76, 175, 80, 0.8)'
        : m.matchPercent > 40 ? 'rgba(255, 193, 7, 0.8)'
        :                       'rgba(244, 67, 54, 0.8)'
        ),
        borderColor: matches.map(m =>
          m.matchPercent > 60 ? '#4CAF50'
        : m.matchPercent > 40 ? '#FFC107'
        :                       '#F44336'
        ),
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Career Match Percentage (KNN Result)',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: val => val + '%' }
        }
      }
    }
  });
}
