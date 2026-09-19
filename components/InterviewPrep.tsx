"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareCode,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  Award,
  BookOpenCheck,
} from "lucide-react";
import { InterviewQuestion } from "@/lib/mock-data";

interface InterviewPrepProps {
  questions: InterviewQuestion[];
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ questions }) => {
  const [filterType, setFilterType] = useState<"ALL" | "TECHNICAL" | "BEHAVIORAL">("ALL");
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set(["iq1"]));

  const toggleCard = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterType === "ALL") return true;
    return q.type === filterType;
  });

  const getDifficultyBadge = (diff: InterviewQuestion["difficulty"]) => {
    switch (diff) {
      case "Hard":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Filters */}
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareCode className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Contextual Interview Prep
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Tailored technical & behavioral interview questions grounded strictly in your resume.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === "ALL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Questions ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("TECHNICAL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === "TECHNICAL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Technical
          </button>
          <button
            type="button"
            onClick={() => setFilterType("BEHAVIORAL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === "BEHAVIORAL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Behavioral
          </button>
        </div>
      </div>

      {/* Grid of Interview Q&A Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedCardIds.has(q.id);

          return (
            <div
              key={q.id}
              className="glass-panel glass-panel-hover flex flex-col justify-between rounded-2xl p-5 shadow-lg"
            >
              <div className="space-y-4">
                {/* Question Type & Difficulty Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                      {q.type}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyBadge(
                        q.difficulty
                      )}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Grounded In Resume
                  </span>
                </div>

                {/* Grounding Context Callout */}
                <div className="flex items-start gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">Resume Context:</span>{" "}
                    {q.contextFromResume}
                  </div>
                </div>

                {/* Main Question Text */}
                <h3 className="font-semibold text-white leading-relaxed text-sm sm:text-base">
                  "{q.question}"
                </h3>
              </div>

              {/* Expandable Model Answer & Key Points */}
              <div className="mt-5 border-t border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => toggleCard(q.id)}
                  className="flex w-full items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpenCheck className="h-4 w-4 text-emerald-400" />
                    {isExpanded ? "Hide Model Answer & Key Points" : "View Recommended STAR Answer"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs">
                        <div>
                          <span className="font-semibold text-emerald-400">STAR Model Answer:</span>
                          <p className="mt-1 leading-relaxed text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                            {q.sampleAnswer}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-300">Key Points to Highlight:</span>
                          <ul className="mt-1.5 space-y-1 text-slate-400 pl-1">
                            {q.keyPointsToCover.map((point, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
