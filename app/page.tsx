/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";
import { ResumeData, TEMPLATES, STEPS } from "@/types/resume";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Extracted Components
import { Header } from "@/components/layout/Header";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeForm } from "@/components/builder/ResumeForm";
import { CustomizationPanel } from "@/components/builder/CustomizationPanel";

export default function ResumeBuilder() {
  const [step, setStep] = useState<"landing" | "form" | "preview">("landing");
  const [activeFormStep, setActiveFormStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "",
    target_role: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    objective: "",
    skills: { "Technical Skills": [], "Soft Skills": [] },
    projects: [{ title: "", technologies: "", highlights: [""] }],
    education: [{ degree: "", institution: "", year: "", location: "", is_current: false }],
    languages: [""],
    certifications: [{ name: "", issuer: "", year: "" }],
    awards: [{ title: "", issuer: "", year: "" }],
    is_beginner: false,
    profile_image: ""
  });

  const [hasPracticeProjects, setHasPracticeProjects] = useState(false);
  const [bulkSkills, setBulkSkills] = useState<{ [key: string]: string }>({});
  const [showBulkAdd, setShowBulkAdd] = useState<{ [key: string]: boolean }>({});
  
  const [template, setTemplate] = useState<"Modern" | "Professional" | "Creative" | "Minimal">("Modern");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const editingResume = localStorage.getItem('editing_resume');
    if (editingResume) {
      try {
        const parsed = JSON.parse(editingResume);
        setTimeout(() => {
          setResumeData(parsed.data);
          setTemplate(parsed.template || parsed.template_id || "Modern");
          setAccentColor(parsed.accentColor || parsed.accent_color || "#2563eb");
          setEditingId(parsed.id || null);
          setStep("form");
          setActiveFormStep(0);
        }, 0);
        localStorage.removeItem('editing_resume');
        toast.info("Loaded resume for editing");
      } catch (e) {
        console.error("Error parsing editing_resume", e);
      }
    }

    return () => subscription.unsubscribe();
  }, [router]);

  const saveToCloud = async () => {
    if (!resumeData) return;
    if (!user) {
      router.push("/login");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        data: resumeData,
        template_id: template,
        accent_color: accentColor,
        user_id: user.id,
        ...(editingId ? { id: editingId } : {})
      };

      const { data, error } = await supabase
        .from('resumes')
        .upsert(payload)
        .select('id')
        .single();

      if (error) throw error;
      
      if (data) {
        setEditingId(data.id);
      }

      setSaveStatus("saved");
      toast.success(editingId ? "Updated Successfully" : "Saved to Cloud", {
        description: editingId ? "Your changes have been saved." : "Your resume has been successfully saved to your profile."
      });
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Error saving to cloud:", err);
      toast.error("Save Failed", {
        description: "There was an error saving your resume. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setEditingId(null);
    setStep("form");
    setActiveFormStep(0);
  };

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateResumeData = (path: string, value: any) => {
    setResumeData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: Record<string, any> = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return { ...newData };
    });
  };

  const handleBulkAdd = (category: string) => {
    const skillsToAdd = (bulkSkills[category] || "")
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (skillsToAdd.length === 0) return;

    const currentSkills = Array.isArray(resumeData.skills?.[category]) 
      ? resumeData.skills[category] as string[] 
      : [];
      
    updateResumeData(`skills.${category}`, [...currentSkills, ...skillsToAdd]);
    setBulkSkills(prev => ({ ...prev, [category]: "" }));
    setShowBulkAdd(prev => ({ ...prev, [category]: false }));
    toast.success(`Added ${skillsToAdd.length} skills to ${category}`);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      updateResumeData('profile_image', e.target?.result as string);
      toast.success("Profile image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleSynthesize = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [
            { role: "user", content: `Please refine this resume data and output only the generated JSON: ${JSON.stringify(resumeData)}` }
          ] 
        }),
      });

      const data = await response.json();
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = (data.content as string).match(jsonRegex);
      
      if (match) {
        setResumeData(JSON.parse(match[1]));
      }
      setStep("preview");
    } catch (error) {
      console.error("Error synthesizing:", error);
      setStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const handleSetStep = (newStep: "landing" | "form" | "preview") => {
    if (newStep === "landing") {
      setEditingId(null);
    }
    setStep(newStep);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-700 print:bg-transparent print:min-h-0">
      <div className="print:hidden">
        <Header step={step} setStep={handleSetStep} user={user} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 print:p-0 print:m-0 print:max-w-none">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-24"
            >
              <div className="flex flex-col items-center text-center space-y-10 pt-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest animate-fade-in">
                  <Sparkles className="w-4 h-4" /> Powered by Advanced Agentic AI
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] max-w-4xl">
                  Build Your <span className="text-blue-600">Dream Career</span> With AI.
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                  The first agentic resume builder that doesn&apos;t just format—it architecturally designs your professional story for the modern market.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <button 
                    onClick={handleStart}
                    className="group relative bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200"
                  >
                    Create My Resume <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={scrollToTemplates}
                    className="text-slate-600 font-bold hover:text-slate-900 transition-colors px-10 py-5"
                  >
                    View Templates
                  </button>
                </div>
                <div className="flex flex-wrap justify-center gap-12 pt-12">
                  <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-black text-xs uppercase tracking-widest">ATS Optimized</span>
                  </div>
                  <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="font-black text-xs uppercase tracking-widest">Recruiter Approved</span>
                  </div>
                  <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
                    <span className="font-black text-xs uppercase tracking-widest">Agentic Synthesis</span>
                  </div>
                </div>
              </div>

              <div ref={templatesRef} className="w-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900">Professional Templates</h2>
                  <p className="text-slate-500 mt-2">Expertly crafted layouts approved by recruiters.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {TEMPLATES.map((t) => (
                    <div key={t.id} className="card-standard overflow-hidden group hover:border-blue-600/50 transition-all">
                      <div className="relative aspect-4/5 rounded-t-2xl overflow-hidden bg-slate-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={t.image} 
                          alt={t.label} 
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-slate-900">{t.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-standard w-full max-w-5xl mx-auto flex flex-col md:flex-row overflow-hidden min-h-[70vh]"
            >
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-8">
                <div className="flex flex-col gap-6">
                  {STEPS.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        activeFormStep === idx ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : 
                        activeFormStep > idx ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                      )}>
                        {activeFormStep > idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={cn("text-sm font-semibold", activeFormStep === idx ? "text-slate-900" : "text-slate-500")}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <ResumeForm 
                activeFormStep={activeFormStep}
                setActiveFormStep={setActiveFormStep}
                resumeData={resumeData}
                updateResumeData={updateResumeData}
                hasPracticeProjects={hasPracticeProjects}
                setHasPracticeProjects={setHasPracticeProjects}
                showBulkAdd={showBulkAdd}
                setShowBulkAdd={setShowBulkAdd}
                bulkSkills={bulkSkills}
                setBulkSkills={setBulkSkills}
                handleBulkAdd={handleBulkAdd}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                handleImageUpload={handleImageUpload}
                isLoading={isLoading}
                handleSynthesize={handleSynthesize}
              />
            </motion.div>
          )}

          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col lg:flex-row gap-8 min-h-screen print:min-h-0 print:block print:gap-0"
            >
              <div className="flex-1 card-standard bg-white overflow-hidden flex flex-col order-2 lg:order-1 shadow-lg print:shadow-none print:border-none print:overflow-visible print:rounded-none">
                <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between print:hidden">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Document Preview</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {template} Template
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-12 bg-slate-100 flex justify-center print:p-0 print:bg-transparent print:overflow-visible print:block">
                  <div className="w-full max-w-[800px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] print:shadow-none print:max-w-none">
                    <ResumePreview data={resumeData} template={template} accentColor={accentColor} />
                  </div>
                </div>
              </div>

              <div className="print:hidden">
                <CustomizationPanel 
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  saveToCloud={saveToCloud}
                  isSaving={isSaving}
                  saveStatus={saveStatus}
                  downloadPDF={downloadPDF}
                  setStep={handleSetStep}
                  template={template}
                  setTemplate={setTemplate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
