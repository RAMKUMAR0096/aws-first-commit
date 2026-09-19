"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Code2,
  Video,
  CheckSquare,
  Square,
  ChevronDown,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";
import { LearningRoadmap as RoadmapType, RoadmapItem } from "@/lib/mock-data";
import { toast } from "sonner";

interface LearningRoadmapProps {
  roadmap: RoadmapType;
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ roadmap }) => {
  const [openSection, setOpenSection] = useState<"day7" | "day14" | "day30">("day7");
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(
    new Set(["r1"]) // Default initial item completed for demo
  );

  const toggleItemCompletion = (id: string, title: string) => {
    setCompletedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(`Marked "${title}" as pending`);
      } else {
        next.add(id);
        toast.success(`🎉 Completed: "${title}"! Roadmap score updated.`);
      }
      return next;
    });
  };

  const getResourceIcon = (type: RoadmapItem["resourceType"]) => {
    switch (type) {
      case "PROJECT":
        return <Code2 className="h-3.5 w-3.5 text-indigo-400" />;
      case "TUTORIAL":
        return <Video className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  const sections = [
    {
      key: "day7" as const,
      title: "7-Day Sprint Focus",
      subtitle: "Immediate Critical Skill Gaps & Fundamentals",
      items: roadmap.day7,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      accent: "border-l-emerald-500",
    },
    {
      key: "day14" as const,
      title: "14-Day Intermediate Roadmap",
      subtitle: "Hands-on Microservices & Cloud Hands-on Projects",
      items: roadmap.day14,
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      accent: "border-l-indigo-500",
    },
    {
      key: "day30" as const,
      title: "30-Day Mastery & Capstone",
      subtitle: "System Design, Production Deployment & Capstone",
      items: roadmap.day30,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      accent: "border-l-purple-500",
    },
  ];

  // Compute stats
  const allItems = [...roadmap.day7, ...roadmap.day14, ...roadmap.day30];
  const completedCount = allItems.filter((item) => completedItemIds.has(item.id)).length;
  const progressPercent = Math.round((completedCount / (allItems.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              "What Should I Learn?" Actionable Roadmap
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Automated timeline generated exclusively from your identified missing skill gaps.
          </p>
        </div>

        {/* Progress Card */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-300">Roadmap Completion</span>
            <span className="text-sm font-bold text-emerald-400">
              {completedCount} of {allItems.length} Tasks Done ({progressPercent}%)
            </span>
          </div>
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-500"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Accordion Sections */}
      <div className="space-y-4">
        {sections.map((sec) => {
          const isOpen = openSection === sec.key;
          const sectionCompleted = sec.items.filter((i) => completedItemIds.has(i.id)).length;

          return (
            <div
              key={sec.key}
              className={`glass-panel overflow-hidden rounded-2xl border-l-4 ${sec.accent} transition-all`}
            >
              {/* Accordion Trigger Bar */}
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? ("" as any) : sec.key)}
                className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white sm:text-lg">{sec.title}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sec.badgeColor}`}>
                        {sec.items.length} Modules
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{sec.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    {sectionCompleted}/{sec.items.length} Completed
                  </span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Content Panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="border-t border-slate-800/80 p-5 space-y-3 bg-slate-950/40">
                      {sec.items.map((item) => {
                        const isDone = completedItemIds.has(item.id);

                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${
                              isDone
                                ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                                : "border-slate-800 bg-slate-900/60 hover:border-indigo-500/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleItemCompletion(item.id, item.title)}
                                  className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                  {isDone ? (
                                    <CheckSquare className="h-5 w-5 text-emerald-400" />
                                  ) : (
                                    <Square className="h-5 w-5" />
                                  )}
                                </button>
                                <div>
                                  <h4
                                    className={`font-semibold text-sm sm:text-base ${
                                      isDone ? "line-through text-slate-400" : "text-slate-100"
                                    }`}
                                  >
                                    {item.title}
                                  </h4>
                                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                                    {item.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                                <span>~{item.estimatedHours} hrs</span>
                              </div>
                            </div>

                            {/* Target Skill Pills & Resource type */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 pl-8">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-medium text-slate-400">Target Skills:</span>
                                {item.targetSkills.map((sk, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] text-indigo-300 font-medium"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                                {getResourceIcon(item.resourceType)}
                                <span>{item.resourceType}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
