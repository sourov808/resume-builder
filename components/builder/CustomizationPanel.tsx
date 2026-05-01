/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { 
  Palette, 
  Cloud, 
  CheckCircle2, 
  Download, 
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_COLORS, TEMPLATES } from "@/types/resume";

interface CustomizationPanelProps {
  accentColor: string;
  setAccentColor: (color: string) => void;
  saveToCloud: () => Promise<void>;
  isSaving: boolean;
  saveStatus: "idle" | "saved";
  downloadPDF: () => void;
  setStep: (step: "landing" | "form" | "preview") => void;
  template: string;
  setTemplate: (template: "Modern" | "Professional" | "Creative" | "Minimal") => void;
}

export function CustomizationPanel({
  accentColor,
  setAccentColor,
  saveToCloud,
  isSaving,
  saveStatus,
  downloadPDF,
  setStep,
  template,
  setTemplate
}: CustomizationPanelProps) {
  return (
    <div className="w-full lg:w-80 space-y-6 order-1 lg:order-2">
      <div className="card-standard p-6 space-y-8 sticky top-24">
        <div>
          <h3 className="font-bold text-xl text-slate-900">Customization</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">Tailor your look</p>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Palette className="w-4 h-4" /> Accent Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_COLORS.map(c => (
              <button 
                key={c.value} 
                onClick={() => setAccentColor(c.value)}
                className={cn(
                  "w-full aspect-square rounded-full border-2 transition-all",
                  accentColor === c.value ? "border-slate-900 scale-110 shadow-md" : "border-transparent"
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <button 
            onClick={saveToCloud}
            disabled={isSaving}
            className={cn(
              "w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all",
              saveStatus === "saved" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            {saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Saved Successfully
              </>
            ) : (
              <>
                <Cloud className={cn("w-4 h-4", isSaving && "animate-spin")} /> {isSaving ? "Saving..." : "Save to Cloud"}
              </>
            )}
          </button>
          <button onClick={downloadPDF} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={() => setStep("form")} className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Edit Details
          </button>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Switch Template</label>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map(t => (
              <button 
                key={t.id} 
                onClick={() => {
                  setTemplate(t.id);
                  if (t.id === "Creative") setAccentColor("#4f46e5");
                  if (t.id === "Professional") setAccentColor("#0f172a");
                  if (t.id === "Modern") setAccentColor("#2563eb");
                  if (t.id === "Minimal") setAccentColor("#475569");
                }} 
                className={cn(
                  "p-2 rounded-lg border-2 text-[10px] font-bold text-slate-700 flex flex-col items-center gap-2 transition-all", 
                  template === t.id ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-200"
                )}
              >
                <img src={t.image} alt={t.label} className="w-full h-12 object-cover rounded shadow-sm opacity-80" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
