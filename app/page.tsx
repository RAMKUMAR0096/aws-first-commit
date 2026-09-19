"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { ScoreGauge } from "@/components/ScoreGauge";
import { FitAnalyzer } from "@/components/FitAnalyzer";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { InterviewPrep } from "@/components/InterviewPrep";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import {
  MOCK_ANALYSIS_RESULT,
  MOCK_RESUME_TEXT,
  MOCK_JOB_DESCRIPTION,
  INITIAL_MOCK_APPLICATIONS,
  AnalysisResult,
  JobApplication,
} from "@/lib/mock-data";
import { Target, Map, MessageSquareCode, Database, Sparkles, ExternalLink, Code2 } from "lucide-react";

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult>(MOCK_ANALYSIS_RESULT);
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_MOCK_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<"analyzer" | "roadmap" | "interview" | "tracker">("analyzer");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  // Fetch initial applications on load
  useEffect(() => {
    async function loadApps() {
      try {
        const res = await fetch("/api/applications");
        const json = await res.json();
        if (json.success && json.data) {
          setApplications(json.data);
          setIsMockMode(json.isMock);
        }
      } catch (err) {
        console.warn("Using in-memory initial applications store.");
      }
    }
    loadApps();
  }, []);

  // Trigger analysis handler
  const handleAnalyze = async (resumeText: string, jobDescription: string, file?: File | null) => {
    setIsLoading(true);
    toast.info("Analyzing resume against job description via Gemini 1.5 Flash...");

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("resumeFile", file);
        formData.append("jobDescription", jobDescription);
        res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription }),
        });
      }

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
        setIsMockMode(json.isMock);

        toast.success("✅ AI Gap Analysis Completed!", {
          description: `Calculated Match Score: ${json.data.matchScore}%`,
        });

        if (json.data.matchScore >= 75) {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.3 },
          });
        }
      } else {
        throw new Error(json.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast.error("Analysis error. Displaying high-fidelity demo analysis.");
      setAnalysis(MOCK_ANALYSIS_RESULT);
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Mock Data Loader for Hackathon Judges
  const handleLoadMockData = () => {
    setAnalysis(MOCK_ANALYSIS_RESULT);
    setApplications(INITIAL_MOCK_APPLICATIONS);
    setIsMockMode(true);
    toast.success("🚀 Loaded Full Demo Candidate Profile!", {
      description: "Aarav Sharma (B.Tech Final Year) vs Cloud Engineering Role",
    });
  };

  // Tracker CRUD actions
  const handleAddApplication = async (newApp: Omit<JobApplication, "id">) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApp),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setApplications((prev) => [json.data, ...prev]);
        toast.success(json.message || "Application saved successfully!");
      }
    } catch (err) {
      toast.error("Error saving application.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: JobApplication["status"]) => {
    try {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );

      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Updated status to ${newStatus}`);
        if (newStatus === "OFFER" || newStatus === "INTERVIEW") {
          confetti({ particleCount: 50, spread: 50 });
        }
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      setApplications((prev) => prev.filter((app) => app.id !== id));
      await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
      toast.info("Application deleted");
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#080c14] text-slate-100">
      {/* Top Header */}
      <Header onLoadMockData={handleLoadMockData} isMockMode={isMockMode} />

      {/* Main Content Hub */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Match Score Radial Banner */}
        <ScoreGauge
          score={analysis.matchScore}
          matchedCount={analysis.matchedSkills.length}
          partialCount={analysis.partialSkills.length}
          missingCount={analysis.missingSkills.length}
          summary={analysis.summary}
        />

        {/* Tab Navigation Menu */}
        <div className="flex overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-1.5 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab("analyzer")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap ${
              activeTab === "analyzer"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Target className="h-4 w-4 text-emerald-400" />
            <span>1. Fit Analyzer & Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap ${
              activeTab === "roadmap"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Map className="h-4 w-4 text-indigo-400" />
            <span>2. Actionable Roadmap</span>
            <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px]">
              {analysis.missingSkills.length} Missing
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap ${
              activeTab === "interview"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <MessageSquareCode className="h-4 w-4 text-amber-400" />
            <span>3. Grounded Interview Prep</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap ${
              activeTab === "tracker"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Database className="h-4 w-4 text-purple-400" />
            <span>4. DynamoDB Tracker</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px]">
              {applications.length}
            </span>
          </button>
        </div>

        {/* Tab View Switcher */}
        <div className="pt-2">
          {activeTab === "analyzer" && (
            <FitAnalyzer
              analysis={analysis}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onLoadSampleData={handleLoadMockData}
            />
          )}

          {activeTab === "roadmap" && (
            <LearningRoadmap roadmap={analysis.learningRoadmap} />
          )}

          {activeTab === "interview" && (
            <InterviewPrep questions={analysis.interviewQuestions} />
          )}

          {activeTab === "tracker" && (
            <ApplicationTracker
              applications={applications}
              onAddApplication={handleAddApplication}
              onUpdateStatus={handleUpdateStatus}
              onDeleteApplication={handleDeleteApplication}
              onResetMock={handleLoadMockData}
              isLoading={isLoading}
              isMockMode={isMockMode}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <span>Built for <strong>Bharat Builds Hackathon 2026</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 15 &bull; Tailwind CSS v4 &bull; Gemini 1.5 Flash &bull; AWS DynamoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
