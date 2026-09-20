"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { ScoreGauge } from "@/components/ScoreGauge";
import { FitAnalyzer } from "@/components/FitAnalyzer";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { InterviewPrep } from "@/components/InterviewPrep";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import {
  MOCK_ANALYSIS_RESULT,
  AnalysisResult,
  JobApplication,
} from "@/lib/mock-data";
import { Target, Map, MessageSquareCode, Database, Code2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"analyzer" | "roadmap" | "interview" | "tracker">("analyzer");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  // Fetch authenticated user's applications whenever auth status changes
  useEffect(() => {
    async function loadApps() {
      if (!isSignedIn) {
        setApplications([]);
        return;
      }

      setIsLoadingApps(true);
      try {
        const res = await fetch("/api/applications");
        if (res.status === 401) {
          setApplications([]);
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setApplications(json.data);
          setIsMockMode(json.isMock);
        }
      } catch (err) {
        console.warn("Unable to load user applications.");
      } finally {
        setIsLoadingApps(false);
      }
    }

    loadApps();
  }, [isSignedIn]);

  // Trigger analysis handler
  const handleAnalyze = async (resumeText: string, jobDescription: string, file?: File | null) => {
    setIsLoading(true);
    toast.info("Analyzing resume against job description via Gemini AI...");

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
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.3 },
            });
          } catch {}
        }
      } else {
        throw new Error(json.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast.error(`Analysis failed: ${error.message || "Unable to complete AI analysis."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Mock Data Loader for Candidate Resume/JD Analysis
  const handleLoadMockData = () => {
    setAnalysis(MOCK_ANALYSIS_RESULT);
    toast.success("🚀 Loaded Sample Candidate Profile!", {
      description: "Sample Resume & Job Description loaded for testing.",
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

      if (res.status === 401) {
        toast.error("Please sign in to log job applications.");
        return;
      }

      const json = await res.json();

      if (json.success && json.data) {
        setApplications((prev) => [json.data, ...prev]);
        toast.success(json.message || "Application saved successfully!");
      } else {
        toast.error(json.error || "Error saving application.");
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

      if (res.status === 401) {
        toast.error("Please sign in to update application status.");
        return;
      }

      const json = await res.json();

      if (json.success) {
        toast.success(`Updated status to ${newStatus}`);
        if (newStatus === "OFFER" || newStatus === "INTERVIEW") {
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({ particleCount: 50, spread: 50 });
          } catch {}
        }
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      setApplications((prev) => prev.filter((app) => app.id !== id));
      const res = await fetch(`/api/applications?id=${id}`, { method: "DELETE" });

      if (res.status === 401) {
        toast.error("Please sign in to delete applications.");
        return;
      }

      const json = await res.json();
      if (json.success) {
        toast.info("Application deleted");
      } else {
        toast.error(json.error || "Failed to delete application");
      }
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
        {/* Match Score Radial Banner (Visible only after analysis is submitted) */}
        {analysis && (
          <ScoreGauge
            score={analysis.matchScore}
            matchedCount={analysis.matchedSkills.length}
            partialCount={analysis.partialSkills.length}
            missingCount={analysis.missingSkills.length}
            summary={analysis.summary}
          />
        )}

        {/* Tab Navigation Menu */}
        <div className="flex overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-1.5 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab("analyzer")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap cursor-pointer ${
              activeTab === "roadmap"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Map className="h-4 w-4 text-indigo-400" />
            <span>2. Actionable Roadmap</span>
            {analysis && (
              <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px]">
                {analysis.missingSkills.length} Missing
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm whitespace-nowrap cursor-pointer ${
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
            analysis ? (
              <LearningRoadmap roadmap={analysis.learningRoadmap} />
            ) : (
              <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center border border-slate-800 shadow-xl space-y-3">
                <Target className="h-10 w-10 text-indigo-400 opacity-60 mb-1" />
                <h3 className="text-lg font-bold text-white">No Learning Roadmap Yet</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Please upload your resume and target job description in the <strong>Fit Analyzer & Matrix</strong> tab to generate your custom learning roadmap.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("analyzer")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  Go to Fit Analyzer
                </button>
              </div>
            )
          )}

          {activeTab === "interview" && (
            analysis ? (
              <InterviewPrep questions={analysis.interviewQuestions} />
            ) : (
              <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center border border-slate-800 shadow-xl space-y-3">
                <MessageSquareCode className="h-10 w-10 text-amber-400 opacity-60 mb-1" />
                <h3 className="text-lg font-bold text-white">No Interview Questions Yet</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Please upload your resume and target job description in the <strong>Fit Analyzer & Matrix</strong> tab to generate tailored interview preparation questions.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("analyzer")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  Go to Fit Analyzer
                </button>
              </div>
            )
          )}

          {activeTab === "tracker" && (
            <ApplicationTracker
              applications={applications}
              onAddApplication={handleAddApplication}
              onUpdateStatus={handleUpdateStatus}
              onDeleteApplication={handleDeleteApplication}
              isLoading={isLoadingApps}
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
            <span>Next.js 15 &bull; Clerk Auth &bull; Gemini 1.5 Flash &bull; AWS DynamoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
