"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import AuthGate from "@/components/AuthGate";
import { parseHealthExport } from "@/lib/health-export-parser";
import {
  useHealthSummaries,
  saveHealthSummaries,
  deleteHealthData,
} from "@/lib/health-data";
import type { ParseResult } from "@/lib/health-export-parser";

function formatNumber(n: number): string {
  return n.toLocaleString("en-GB");
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function HeartPulseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

const INSTRUCTIONS = [
  { step: 1, text: "Open the Health app on your iPhone" },
  { step: 2, text: 'Tap your profile picture in the top-right corner' },
  { step: 3, text: 'Scroll down and tap "Export All Health Data"' },
  { step: 4, text: 'Tap "Export" and wait for the file to be prepared' },
  { step: 5, text: "Save or AirDrop the .zip file to this device" },
  { step: 6, text: "Upload the .zip file below" },
];

function ExistingDataCard({
  summaries,
  onDelete,
}: {
  summaries: { date: string; steps: number }[];
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const withSteps = summaries.filter((s) => (s.steps ?? 0) > 0);
  const avgSteps = withSteps.length > 0 ? Math.round(withSteps.reduce((a, s) => a + s.steps, 0) / withSteps.length) : 0;
  const dateStart = summaries[0]?.date ?? "";
  const dateEnd = summaries[summaries.length - 1]?.date ?? "";

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <HeartPulseIcon className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Health data connected</h2>
          <p className="text-sm text-stone-500">
            {formatNumber(summaries.length)} days of data ({dateStart} to {dateEnd})
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-stone-400">Average daily steps</p>
        <p className="mt-1 text-2xl font-bold text-stone-900">{formatNumber(avgSteps)}</p>
        <p className="mt-0.5 text-xs text-stone-400">
          Across {formatNumber(withSteps.length)} active days
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-stone-400">
          Upload a newer export to update your data
        </p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs font-medium text-red-500 hover:text-red-600 transition"
          >
            Delete data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-medium text-stone-400 hover:text-stone-500 transition"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Confirm delete"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function HealthSettingsContent() {
  const user = db.useUser();
  const userId = user?.id;
  const { summaries, isLoading } = useHealthSummaries(userId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!userId) return;
      setError("");
      setResult(null);
      setStage("");
      setProgress(0);

      try {
        const parsed = await parseHealthExport(file, (s, pct) => {
          setStage(s);
          setProgress(pct);
        });

        setResult(parsed);
        setSaving(true);
        setStage("Saving to your account...");

        await deleteHealthData(userId);
        await saveHealthSummaries(userId, parsed.summaries);

        setSaving(false);
        setStage("Done");
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStage("");
        setProgress(0);
      }
    },
    [userId]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDelete = async () => {
    if (!userId) return;
    await deleteHealthData(userId);
  };

  const isProcessing = stage !== "" && stage !== "Done";
  const hasExisting = summaries.length > 0 && !result;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          aria-label="Back to settings"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Health Data</h1>
          <p className="mt-0.5 text-stone-600">
            Upload your Apple Health export to track real activity metrics.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* Privacy notice */}
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 px-5 py-4">
          <p className="text-sm leading-relaxed text-teal-800">
            <span className="font-semibold">Privacy first.</span> Your health file
            is processed entirely in your browser. Only daily step counts are
            stored -- the raw file never leaves your device.
          </p>
        </div>

        {/* Existing data */}
        {hasExisting && (
          <ExistingDataCard summaries={summaries} onDelete={handleDelete} />
        )}

        {/* Instructions */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            How to export from iPhone
          </h2>
          <ol className="mt-4 space-y-3">
            {INSTRUCTIONS.map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500">
                  {item.step}
                </span>
                <span className="text-sm text-stone-700 pt-0.5">{item.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Upload area */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Upload your export
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Upload the .zip file from Apple Health (or the .xml inside it).
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
              isDragging
                ? "border-teal-400 bg-teal-50"
                : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100"
            } ${isProcessing || saving ? "pointer-events-none opacity-60" : ""}`}
          >
            <UploadIcon className="h-10 w-10 text-stone-300" />
            <p className="mt-3 text-sm font-medium text-stone-600">
              Drop your file here or tap to browse
            </p>
            <p className="mt-1 text-xs text-stone-400">.zip or .xml</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.xml"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Progress */}
          {(isProcessing || saving) && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">{stage}</span>
                <span className="font-medium text-teal-600">{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {result && !saving && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-medium text-emerald-800">
                Successfully imported {formatNumber(result.totalDays)} days of
                health data
              </p>
              <p className="mt-1 text-sm text-emerald-600">
                {result.dateRange.start} to {result.dateRange.end}
              </p>
              <div className="mt-3 text-center">
                <p className="text-2xl font-bold text-stone-900">
                  {formatNumber(
                    Math.round(
                      result.summaries.reduce((a, s) => a + s.steps, 0) /
                        result.summaries.filter((s) => s.steps > 0).length
                    )
                  )}
                </p>
                <p className="text-xs text-stone-500">Average steps per day</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function HealthSettingsPage() {
  return (
    <AuthGate>
      <HealthSettingsContent />
    </AuthGate>
  );
}
