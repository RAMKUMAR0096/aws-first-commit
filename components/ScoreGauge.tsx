"use client";

import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Info } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  matchedCount: number;
  partialCount: number;
  missingCount: number;
  summary?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  matchedCount,
  partialCount,
  missingCount,
  summary,
}) => {
  const chartData = [
    {
      name: "Match Score",
      value: score,
      fill: score >= 80 ? "#10b981" : score >= 65 ? "#6366f1" : "#f59e0b",
    },
  ];

  const getTierInfo = (s: number) => {
    if (s >= 80) {
      return {
        label: "High Match Readiness",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        badge: "🔥 Interview Ready",
      };
    }
    if (s >= 65) {
      return {
        label: "Strong Candidate Potential",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        badge: "⚡ 1-2 Weeks Prep",
      };
    }
    return {
      label: "Targeted Gap Focus Needed",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      badge: "🎯 Skill Building",
    };
  };

  const tier = getTierInfo(score);

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-5 shadow-xl sm:p-6">
      {/* Background Radial Subtle Glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: score >= 80 ? "#10b981" : score >= 65 ? "#6366f1" : "#f59e0b",
        }}
      />

      <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
        {/* Left Radial Gauge Chart */}
        <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="75%"
              outerRadius="100%"
              barSize={12}
              data={chartData}
              startAngle={225}
              endAngle={-45}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "rgba(30, 41, 59, 0.6)" }}
                dataKey="value"
                cornerRadius={12}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
            >
              {score}%
            </motion.span>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Match Index
            </span>
          </div>
        </div>

        {/* Right Info & Skill Breakdown Metrics */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI Gap Analysis Score
              </span>
              <h2 className="text-xl font-bold text-white sm:text-2xl">{tier.label}</h2>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tier.color}`}
            >
              {tier.badge}
            </span>
          </div>

          {summary && (
            <p className="text-sm leading-relaxed text-slate-300">
              {summary}
            </p>
          )}

          {/* Skill Breakdown Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 sm:gap-3">
            <div className="flex flex-col items-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center sm:p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Matched</span>
              </div>
              <span className="mt-1 text-xl font-bold text-emerald-300">{matchedCount}</span>
              <span className="text-[10px] text-emerald-400/80">Skills verified</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-center sm:p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Partial</span>
              </div>
              <span className="mt-1 text-xl font-bold text-amber-300">{partialCount}</span>
              <span className="text-[10px] text-amber-400/80">Minor gaps</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-center sm:p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Missing</span>
              </div>
              <span className="mt-1 text-xl font-bold text-rose-300">{missingCount}</span>
              <span className="text-[10px] text-rose-400/80">Target roadmap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
