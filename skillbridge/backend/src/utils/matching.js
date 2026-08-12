// Haversine formula to compute distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Compute Match Score (0 - 100) and Reasons
function calculateMatch(worker, gig) {
  let score = 0;
  const reasons = [];

  // 1. Skill Match (40%)
  const gigSkills = gig.skills || [];
  const workerSkills = worker.skills || [];
  let skillScore = 0;
  if (gigSkills.length === 0) {
    skillScore = 40;
    reasons.push('Gig does not require specific skills (40/40)');
  } else {
    const matchingSkills = gigSkills.filter(s => workerSkills.some(ws => ws.toLowerCase() === s.toLowerCase()));
    skillScore = (matchingSkills.length / gigSkills.length) * 40;
    reasons.push(`Skills: Matched ${matchingSkills.length}/${gigSkills.length} required skills (${skillScore.toFixed(0)}/40)`);
  }
  score += skillScore;

  // 2. Location Proximity (20%)
  const distance = calculateDistance(worker.latitude, worker.longitude, gig.latitude, gig.longitude);
  let locationScore = 0;
  if (distance <= 1) {
    locationScore = 20;
    reasons.push(`Location: Extremely close (${distance.toFixed(1)} km) (${locationScore}/20)`);
  } else if (distance <= 3) {
    locationScore = 15;
    reasons.push(`Location: Nearby (${distance.toFixed(1)} km) (${locationScore}/20)`);
  } else if (distance <= 5) {
    locationScore = 10;
    reasons.push(`Location: Moderate distance (${distance.toFixed(1)} km) (${locationScore}/20)`);
  } else if (distance <= 10) {
    locationScore = 5;
    reasons.push(`Location: Within region (${distance.toFixed(1)} km) (${locationScore}/20)`);
  } else {
    locationScore = 0;
    reasons.push(`Location: Far away (${distance.toFixed(1)} km) (0/20)`);
  }
  score += locationScore;

  // 3. Availability (15%)
  // For simplicity, checking if worker availability fits or giving full score if availability exists
  let availabilityScore = 10;
  if (worker.profile && worker.profile.availability) {
    availabilityScore = 15;
    reasons.push(`Availability: Available during standard slots (${availabilityScore}/15)`);
  } else {
    reasons.push(`Availability: Standard availability assumed (10/15)`);
  }
  score += availabilityScore;

  // 4. Rating (10%)
  const avgRating = parseFloat(worker.avg_rating || 0);
  let ratingScore = 0;
  if (avgRating === 0) {
    ratingScore = 8; // Neutral score for fresh workers
    reasons.push(`Rating: No ratings yet (neutral baseline) (${ratingScore}/10)`);
  } else {
    ratingScore = (avgRating / 5) * 10;
    reasons.push(`Rating: Rating is ${avgRating.toFixed(1)}/5.0 (${ratingScore.toFixed(1)}/10)`);
  }
  score += ratingScore;

  // 5. Experience (10%)
  const completedJobs = worker.completed_jobs || 0;
  const experienceScore = Math.min(completedJobs, 5) * 2; // Capped at 5 jobs
  reasons.push(`Experience: Completed ${completedJobs} jobs (${experienceScore}/10)`);
  score += experienceScore;

  // 6. Budget Compatibility (5%)
  const expectedRate = parseFloat(worker.profile && worker.profile.expected_rate ? worker.profile.expected_rate : 0);
  const gigBudget = parseFloat(gig.budget || 0);
  let budgetScore = 5;
  if (expectedRate > 0 && gigBudget > 0) {
    if (expectedRate <= gigBudget) {
      budgetScore = 5;
      reasons.push(`Budget: Budget matches expected rate (${budgetScore}/5)`);
    } else {
      budgetScore = (gigBudget / expectedRate) * 5;
      reasons.push(`Budget: Expected rate slightly higher than budget (${budgetScore.toFixed(1)}/5)`);
    }
  } else {
    reasons.push(`Budget: Flexible rate details (${budgetScore}/5)`);
  }
  score += budgetScore;

  return {
    score: Math.min(Math.round(score), 100),
    distance: parseFloat(distance.toFixed(2)),
    reasons
  };
}

// Compute Opportunity Score (0 - 100)
function calculateOpportunityScore(worker) {
  let score = 50; // base score

  // 1. Profile Completeness (max 15)
  let completeness = 0;
  if (worker.profile && worker.profile.bio) completeness += 5;
  if (worker.profile_image) completeness += 5;
  if (worker.skills && worker.skills.length > 0) completeness += 5;
  score += completeness;

  // 2. Rating (max 15)
  const avgRating = parseFloat(worker.avg_rating || 0);
  if (avgRating > 0) {
    score += (avgRating / 5) * 15;
  } else {
    score += 10; // default for no ratings
  }

  // 3. Completed Jobs (max 10)
  const completedJobs = worker.completed_jobs || 0;
  score += Math.min(completedJobs, 10);

  // 4. Reliability (max 10)
  // Reliability starts at 100% (10 points). In a real system, we would deduct for cancellations.
  score += 10;

  const breakdown = {
    skills: worker.skills ? worker.skills.length * 15 : 0,
    experience: Math.min(completedJobs * 10, 100),
    reliability: 100, // mock reliability
    profileCompleteness: Math.round((completeness / 15) * 100),
    availability: worker.profile && worker.profile.availability ? 90 : 70
  };

  return {
    score: Math.min(Math.round(score), 100),
    breakdown
  };
}

module.exports = {
  calculateDistance,
  calculateMatch,
  calculateOpportunityScore
};
