"use client";

import React from "react";
import confetti from "canvas-confetti";
import { Sparkles, Cpu, Database, Award, ArrowUpRight } from "lucide-react";

interface HeaderProps {
  onLoadMockData: () => void;
  isMockMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadMockData, isMockMode = false }) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 },
      colors: ["#6366f1", "#10b981", "#3b82f6", "#ec4899"],
    });
    onLoadMockData();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-slate-100 via-indigo-200 to-emerald-300 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
                AI Career Copilot
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3 w-3 text-indigo-400" /> Student Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AWS Amplify Ready &bull; Zero-Hallucination Gemini 1.5 Flash Career Engine
            </p>
          </div>
        </div>

        {/* Right Status Badges & Demo Mode Action */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Hackathon Badge */}
          <span className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300 md:inline-flex">
            <Award className="h-3.5 w-3.5 text-emerald-400" />
            Bharat Builds 2026
          </span>

          {/* Gemini Engine Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">AI Engine:</span> Gemini 1.5 Flash
          </div>

          {/* AWS DynamoDB Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Cloud Data:</span> AWS DynamoDB
          </div>

          {/* Load Mock Data Demo Button */}
          <button
            onClick={triggerConfetti}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 active:scale-95"
            title="Instantly load pre-configured student candidate resume & JD for quick judging demo"
          >
            <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
            <span>Load Demo Data</span>
            <ArrowUpRight className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
