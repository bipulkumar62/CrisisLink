import { IncidentSeverity, IncidentPriorityScore } from '@/src/types/incident';

export function computeIncidentPriority(
  severity: IncidentSeverity,
  reportsCount: number,
  hasHazardousSpill: boolean = false
): IncidentPriorityScore {
  let score = 50;
  if (severity === 'CRITICAL') score += 30;
  else if (severity === 'HIGH') score += 20;
  else if (severity === 'ACTIVE') score += 10;

  if (reportsCount > 10) score += 8;
  if (hasHazardousSpill) score += 10;

  score = Math.min(100, Math.max(10, score));

  let tier: IncidentPriorityScore['tier'] = 'STANDARD TIER';
  if (score >= 80) tier = 'CRITICAL TIER';
  else if (score >= 65) tier = 'HIGH TIER';
  else if (score >= 45) tier = 'ELEVATED TIER';

  return {
    overall: score,
    tier,
    lifeThreatRisk: score >= 75 ? 'Severe' : score >= 55 ? 'High' : 'Moderate',
    infrastructureRisk: score >= 70 ? 'Severe' : score >= 50 ? 'High' : 'Moderate',
    confidenceScore: Math.min(98, 80 + Math.floor(reportsCount * 1.2)),
    aiConfidenceLabel: score >= 60 ? 'HIGH' : 'MEDIUM',
  };
}
