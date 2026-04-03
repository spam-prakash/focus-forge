/**
 * Calculate priority score for a task
 * Formula: (DeadlineFactor × 0.4) + (DifficultyWeight × 0.3) + (MarksWeight × 0.2) + (BacklogPenalty × 0.1)
 */

function calculatePriorityScore (task) {
  // 1. Deadline Factor (0-1, higher = more urgent)
  const now = new Date()
  const hoursLeft = Math.max(0, (task.deadline - now) / (1000 * 60 * 60))
  let deadlineFactor
  
  if (hoursLeft <= 0) deadlineFactor = 1.0
  else if (hoursLeft <= 24) deadlineFactor = 0.9
  else if (hoursLeft <= 72) deadlineFactor = 0.7
  else if (hoursLeft <= 168) deadlineFactor = 0.5
  else deadlineFactor = 0.3
  
  // 2. Difficulty Weight (1-5 → 0-1)
  const difficultyWeight = (task.difficulty - 1) / 4
  
  // 3. Marks Weight (already 0-1)
  const marksWeight = task.marksWeight
  
  // 4. Backlog Penalty (0-1, max 10 backlogs)
  const backlogPenalty = Math.min(task.backlogCount / 10, 1.0)
  
  // Calculate final score
  const priorityScore = (
    (deadlineFactor * 0.4) +
    (difficultyWeight * 0.3) +
    (marksWeight * 0.2) +
    (backlogPenalty * 0.1)
  )
  
  return Math.min(1.0, Math.max(0, priorityScore))
}

function getRecommendation (priorityScore) {
  if (priorityScore >= 0.7) return '⚠️ CRITICAL - Do this NOW';
  if (priorityScore >= 0.5) return '🎯 HIGH - Focus on this today';
  if (priorityScore >= 0.3) return '📌 MEDIUM - Schedule this week';
  return "⏰ LOW - Can wait, but don't forget"
}

module.exports = { calculatePriorityScore, getRecommendation }
