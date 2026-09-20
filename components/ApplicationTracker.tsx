"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  Database,
  Lock,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Inbox,
} from "lucide-react";
import { JobApplication } from "@/lib/mock-data";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";

interface ApplicationTrackerProps {
  applications: JobApplication[];
  onAddApplication: (app: Omit<JobApplication, "id">) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: JobApplication["status"]) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
  isLoading: boolean;
  isMockMode?: boolean;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onAddApplication,
  onUpdateStatus,
  onDeleteApplication,
  isLoading,
  isMockMode = false,
}) => {
  const { isSignedIn, isLoaded } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("APPLIED");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Loading State
  if (!isLoaded) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
        <h3 className="font-semibold text-slate-200">Loading your applications...</h3>
      </div>
    );
  }

  // Unauthenticated State Protection
  if (!isSignedIn) {
    return (
      <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-indigo-500/20 shadow-2xl space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Lock className="h-7 w-7" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold text-white sm:text-2xl">
            Authentication Required
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Please sign in to access your personal AWS DynamoDB application tracker. Each user maintains a strictly isolated workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <SignInButton mode="modal">
            <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all cursor-pointer">
              Sign In to Continue
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              Create New Account
            </button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !roleTitle) {
      toast.error("Please fill in Company Name and Role Title.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddApplication({
        companyName,
        roleTitle,
        location: location || "Remote",
        salaryRange: salaryRange || "Not Specified",
        appliedDate: new Date().toISOString().split("T")[0],
        status,
        jobUrl,
        notes,
        matchScore: 82,
      });

      // Clear Form
      setCompanyName("");
      setRoleTitle("");
      setLocation("");
      setSalaryRange("");
      setJobUrl("");
      setNotes("");
      setShowAddForm(false);
    } catch (err: any) {
      toast.error("Failed to add application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && app.status === statusFilter;
  });

  // Calculate statistics exclusively for current user's records
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    offer: applications.filter((a) => a.status === "OFFER").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const getStatusBadge = (st: JobApplication["status"]) => {
    switch (st) {
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "INTERVIEW":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              User Application Tracker
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Authenticated user data stored securely in AWS DynamoDB table{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] text-indigo-300 border border-slate-800">
              CareerCopilotTracker
            </code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? "Cancel Add" : "Log New Application"}</span>
          </button>
        </div>
      </div>

      {/* User Statistics Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-center">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</div>
          <div className="text-xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-center">
          <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Applied</div>
          <div className="text-xl font-bold text-blue-300">{stats.applied}</div>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 text-center">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Interview</div>
          <div className="text-xl font-bold text-indigo-300">{stats.interview}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-center">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Offer</div>
          <div className="text-xl font-bold text-emerald-300">{stats.offer}</div>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-center">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Rejected</div>
          <div className="text-xl font-bold text-rose-300">{stats.rejected}</div>
        </div>
      </div>

      {/* Add New Application Form (Collapsible) */}
      {showAddForm && (
        <form
          onSubmit={handleSubmitForm}
          className="glass-panel rounded-2xl border border-indigo-500/30 p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Add Application to Your AWS DynamoDB Workspace</span>
            </h3>
            <span className="text-xs text-slate-400">Linked automatically to your Clerk account</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon / CloudScale"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role Title *</label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru / Remote"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobApplication["status"])}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="APPLIED">APPLIED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="OFFER">OFFER</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Salary Range / Package</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. ₹8L - ₹11L / yr"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Link / URL</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://company.com/careers/job-123"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Referral details</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spoke with recruiter via LinkedIn..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Application"}
            </button>
          </div>
        </form>
      )}

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, role, or location..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          {["ALL", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Content: Table or Clean Empty State */}
      {isLoading ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
          <h3 className="font-semibold text-slate-200">Loading your applications...</h3>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center border border-slate-800 shadow-xl space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400">
            <Inbox className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-white">No applications yet</h3>
            <p className="text-xs text-slate-400">
              Start tracking your job applications by adding your first application.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Application</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Salary</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-slate-900/40">
                    {/* Company & Role */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 font-bold text-sm">
                          {app.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>{app.companyName}</span>
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-indigo-400"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-slate-300">{app.roleTitle}</div>
                          {app.notes && (
                            <div className="mt-0.5 text-[11px] text-slate-400 italic">
                              "{app.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{app.location}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-5 py-4 text-slate-300">
                      <span className="font-mono text-slate-200">{app.salaryRange || "N/A"}</span>
                    </td>

                    {/* Applied Date */}
                    <td className="px-5 py-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatDate(app.appliedDate)}</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          onUpdateStatus(app.id, e.target.value as JobApplication["status"])
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all focus:outline-none cursor-pointer ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        <option value="APPLIED" className="bg-slate-900 text-white">APPLIED</option>
                        <option value="INTERVIEW" className="bg-slate-900 text-white">INTERVIEW</option>
                        <option value="OFFER" className="bg-slate-900 text-white">OFFER</option>
                        <option value="REJECTED" className="bg-slate-900 text-white">REJECTED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteApplication(app.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No applications match the current filter or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
