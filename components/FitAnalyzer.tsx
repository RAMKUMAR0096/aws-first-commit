"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  RefreshCw,
  FileCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AnalysisResult, MOCK_RESUME_TEXT, MOCK_JOB_DESCRIPTION } from "@/lib/mock-data";
import { toast } from "sonner";

interface FitAnalyzerProps {
  analysis: AnalysisResult | null;
  onAnalyze: (resumeText: string, jobDescription: string, file?: File | null) => Promise<void>;
  isLoading: boolean;
  onLoadSampleData: () => void;
}

export const FitAnalyzer: React.FC<FitAnalyzerProps> = ({
  analysis,
  onAnalyze,
  isLoading,
  onLoadSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(MOCK_RESUME_TEXT);
  const [jobDescription, setJobDescription] = useState(MOCK_JOB_DESCRIPTION);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.includes("text")) {
        setSelectedFile(file);
        toast.success(`Uploaded ${file.name}`);
      } else {
        toast.error("Please upload a PDF or Text (.txt) document.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      toast.success(`Selected ${file.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "file" && !selectedFile && !resumeText) {
      toast.error("Please upload your resume file or switch to raw text mode.");
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 10) {
      toast.error("Please paste a valid Job Description.");
      return;
    }

    onAnalyze(resumeText, jobDescription, selectedFile);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="space-y-8">
      {/* Input Section Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Resume Input */}
        <div className="glass-panel flex flex-col justify-between rounded-2xl p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Student Resume</h3>
              </div>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("file")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    activeTab === "file"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    activeTab === "text"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            <div className="mt-4">
              {activeTab === "file" ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-500/10"
                      : selectedFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 hover:bg-slate-900/80"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <FileCheck className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-emerald-300">{selectedFile.name}</span>
                      <span className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for AI extraction
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-1 text-xs text-rose-400 underline hover:text-rose-300"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-200">
                        Drag and drop your resume (PDF/TXT)
                      </p>
                      <p className="text-xs text-slate-400">
                        or click to browse your computer
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste complete resume plain text here..."
                  className="h-[190px] w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              💡 Zero-hallucination parsing strictly reads supplied resume.
            </span>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Use Sample Student Resume
            </button>
          </div>
        </div>

        {/* Right Card: Job Description Input */}
        <div className="glass-panel flex flex-col justify-between rounded-2xl p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Target Job Description</h3>
              </div>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Target Role
              </span>
            </div>

            <div className="mt-4">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste Job Description / Requirements text here..."
                className="h-[190px] w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Supports Cloud, Software, and Data roles.
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Gemini Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-emerald-300" />
                  <span>Analyze Gap Matrix</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Skill Matrix Columns (Matched, Partial, Missing) */}
      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Skill Match & Gap Matrix</span>
                <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs font-normal text-slate-300">
                  Strictly Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                AI audited candidate competencies vs target job requirements.
              </p>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" /> Zero Hallucination Guarantee
            </span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* Column 1: Matched Skills */}
            <motion.div
              variants={itemVariants}
              className="glass-panel flex flex-col rounded-2xl border-t-4 border-t-emerald-500 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <h4 className="font-bold text-white">MATCHED SKILLS</h4>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  {analysis.matchedSkills.length}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 flex-1">
                {analysis.matchedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-medium text-emerald-200 transition-all hover:bg-emerald-500/10"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{skill}</span>
                  </div>
                ))}
                {analysis.matchedSkills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No exact skill matches identified.</p>
                )}
              </div>
            </motion.div>

            {/* Column 2: Partial Skills */}
            <motion.div
              variants={itemVariants}
              className="glass-panel flex flex-col rounded-2xl border-t-4 border-t-amber-500 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  <h4 className="font-bold text-white">PARTIAL MATCHES</h4>
                </div>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                  {analysis.partialSkills.length}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 flex-1">
                {analysis.partialSkills.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-1 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs transition-all hover:bg-amber-500/10"
                  >
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span>{item.skill}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300 pl-5">
                      {item.gap}
                    </p>
                  </div>
                ))}
                {analysis.partialSkills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No partial skill gaps found.</p>
                )}
              </div>
            </motion.div>

            {/* Column 3: Missing Skills */}
            <motion.div
              variants={itemVariants}
              className="glass-panel flex flex-col rounded-2xl border-t-4 border-t-rose-500 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-rose-400">
                  <XCircle className="h-5 w-5" />
                  <h4 className="font-bold text-white">MISSING SKILLS</h4>
                </div>
                <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-400">
                  {analysis.missingSkills.length}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 flex-1">
                {analysis.missingSkills.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs transition-all hover:bg-rose-500/10"
                  >
                    <div className="flex items-center gap-2 font-semibold text-rose-200">
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span>{item.skill}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.priority === "HIGH"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : item.priority === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
                {analysis.missingSkills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Zero missing skills! Perfect candidate fit.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
