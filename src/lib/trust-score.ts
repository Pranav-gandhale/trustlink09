export interface ProviderMetrics {
  isIdentityVerified: boolean;
  isBackgroundChecked: boolean;
  hasCertifications: boolean;
  totalHires: number;
  repeatHireCount: number;
  disputeResolutionRate: number; // 0 to 1
  averageRating: number; // 0 to 5
  responseTimeMinutes: number;
  yearsExperience: number;
}

export function calculateTrustScore(metrics: ProviderMetrics): number {
  let score = 0;

  // 1. Verification Base (Max 40 points)
  if (metrics.isIdentityVerified) score += 15;
  if (metrics.isBackgroundChecked) score += 15;
  if (metrics.hasCertifications) score += 10;

  // 2. Reliability & Performance (Max 40 points)
  // Repeat hire rate is a strong indicator of quality
  const repeatRate = metrics.totalHires > 0 ? metrics.repeatHireCount / metrics.totalHires : 0;
  score += repeatRate * 20;

  // Dispute resolution history
  score += metrics.disputeResolutionRate * 10;

  // Average rating contribution (normalized to 10 points)
  score += (metrics.averageRating / 5) * 10;

  // 3. Experience & Professionalism (Max 20 points)
  // Response time (faster is better, max 10 points)
  const responseTimeScore = Math.max(0, 10 - metrics.responseTimeMinutes / 30);
  score += responseTimeScore;

  // Experience factor (max 10 points)
  const experienceScore = Math.min(10, metrics.yearsExperience * 2);
  score += experienceScore;

  return Math.round(score);
}

export function getTrustLevel(score: number): "Elite" | "Verified" | "Standard" | "Provisional" {
  if (score >= 90) return "Elite";
  if (score >= 75) return "Verified";
  if (score >= 50) return "Standard";
  return "Provisional";
}

export function getTrustColor(score: number): string {
  if (score >= 90) return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
  if (score >= 75) return "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
  if (score >= 50) return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
  return "text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
}