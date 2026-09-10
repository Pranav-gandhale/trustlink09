import React from "react";
import { Shield, ShieldCheck, AlertTriangle } from "lucide-react";

interface TrustBadgeProps {
  score: number;
  level: "Elite" | "Verified" | "Standard" | "Provisional" | string;
  colorClass: string;
  className?: string;
}

export function TrustBadge({ score, level, colorClass, className = "" }: TrustBadgeProps) {
  // Determine which icon to show based on the score
  let Icon = ShieldCheck;
  if (score < 50) {
    Icon = AlertTriangle;
  } else if (score < 75) {
    Icon = Shield;
  }

  // The colorClass provided by trust-score.ts is typically a Tailwind string like:
  // "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800"
  return (
    <div 
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-300 hover:shadow-lg cursor-default shadow-sm ${colorClass} ${className}`}
      title={`Trust Score: ${score}/100. Calculated based on verified identity, repeat hires, and performance history.`}
    >
      <Icon className="h-5 w-5 fill-current/20" />
      <span className="text-sm font-black tracking-wide flex items-baseline">
        {score} <span className="opacity-90 font-black ml-1 uppercase text-[10px] tracking-wider">{level}</span>
      </span>
      
      {/* Dynamic tooltip on hover for better UX */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center shadow-xl">
        <p className="font-bold mb-1 border-b border-slate-700 pb-1">Trust Score: {score}/100</p>
        <p className="text-slate-300">Based on KYC, completion rate, repeat hires, and dispute history.</p>
        {/* Little triangle arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}
