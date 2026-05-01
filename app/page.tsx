"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Download,
  RotateCcw,
  Zap,
  X,
  Palette,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Cloud,
  LogOut,
  LogIn,
  FileText,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Project {
  title: string;
  technologies: string;
  highlights: string[];
  is_current?: boolean;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  location: string;
  is_current?: boolean;
}

interface ResumeData {
  name: string;
  target_role: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  objective?: string;
  skills?: Record<string, string[] | string>;
  languages?: string[];
  certifications?: { name: string; issuer: string; year: string }[];
  awards?: { title: string; issuer: string; year: string }[];
  projects?: Project[];
  education?: Education[];
  is_beginner?: boolean;
}

const STEPS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "final", label: "Review", icon: Sparkles },
];

const TEMPLATES = [
  { id: "Modern", label: "Modern", desc: "Professional sans-serif layout.", color: "bg-blue-600", image: "/templates/modern.png" },
  { id: "Professional", label: "Professional", desc: "Classic serif executive style.", color: "bg-slate-800", image: "/templates/professional.png" },
  { id: "Creative", label: "Creative", desc: "Clean sidebar design.", color: "bg-indigo-600", image: "/templates/creative.png" },
  { id: "Minimal", label: "Minimal", desc: "Clean mono-spaced aesthetic.", color: "bg-slate-400", image: "/templates/minimal.png" },
] as const;

const ACCENT_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Black", value: "#0f172a" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Slate", value: "#475569" },
  { name: "Indigo", value: "#4f46e5" },
];

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
    is_beginner: false
  });

  const [bulkSkills, setBulkSkills] = useState<{ [key: string]: string }>({});
  const [showBulkAdd, setShowBulkAdd] = useState<{ [key: string]: boolean }>({});
  
  const [template, setTemplate] = useState<"Modern" | "Professional" | "Creative" | "Minimal">("Modern");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveToCloud = async () => {
    if (!resumeData) return;
    if (!user) {
      router.push("/login");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('resumes').insert({
        data: resumeData,
        template_id: template,
        accent_color: accentColor,
        user_id: user.id
      });
      if (error) throw error;
      setSaveStatus("saved");
      toast.success("Saved to Cloud", {
        description: "Your resume has been successfully saved to your profile."
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
    setStep("form");
    setActiveFormStep(0);
  };

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateResumeData = (path: string, value: string | string[] | any[]) => {
    setResumeData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: Record<string, any> = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
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

  const handleSynthesize = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [
            { role: "system", content: "You are a professional resume architect. Take the provided raw data and refine the professional summary (objective) and project highlights to be high-impact, ATS-optimized, and professional. Return the full JSON including the refinements." },
            { role: "user", content: `Please refine this resume data: ${JSON.stringify(resumeData)}` }
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

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {step !== "landing" && (
            <button 
              onClick={() => setStep("landing")}
              className="mr-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Back to Landing"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
          )}
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">ResumeBuilder</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account</span>
                <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user.email}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Signed out successfully");
                }} 
                className="ml-2 p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/login")} 
              className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="w-full max-w-7xl p-4 md:p-12">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="text-center max-w-3xl mb-24 mt-12">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                  {user ? (
                    <>Welcome back, <span className="text-blue-600">{user.email?.split('@')[0]}</span></>
                  ) : (
                    <>Build a resume that gets you <span className="text-blue-600">hired.</span></>
                  )}
                </h1>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                  {user 
                    ? "You're logged in and ready to create your next career-defining document. Pick up where you left off or start fresh."
                    : "Professional, ATS-optimized resumes designed by AI. Choose a template, enter your details, and download your high-quality resume in minutes."
                  }
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                  <button onClick={handleStart} className="btn-primary w-full sm:w-[200px]">
                    Create My Resume
                  </button>
                  <button onClick={scrollToTemplates} className="btn-secondary w-full sm:w-[200px]">
                    View Templates
                  </button>
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
                      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden border-b border-slate-100">
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
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFormStep}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-10"
                    >
                      {activeFormStep === 0 && (
                        <div className="space-y-8">
                          <SectionHeader title="Contact Information" desc="Provide your basic details so employers can reach you." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <InputField label="Full Name" value={resumeData.name} onChange={v => updateResumeData('name', v)} placeholder="John Doe" />
                            <InputField label="Target Job Title" value={resumeData.target_role} onChange={v => updateResumeData('target_role', v)} placeholder="Senior Product Designer" />
                            <InputField label="Email Address" value={resumeData.email} onChange={v => updateResumeData('email', v)} placeholder="john.doe@example.com" />
                            <InputField label="Phone Number" value={resumeData.phone} onChange={v => updateResumeData('phone', v)} placeholder="+1 (555) 000-0000" />
                            <InputField label="Location" value={resumeData.location || ''} onChange={v => updateResumeData('location', v)} placeholder="New York, NY" />
                            <InputField label="LinkedIn URL" value={resumeData.linkedin || ''} onChange={v => updateResumeData('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                            <div className="md:col-span-2">
                              <InputField label="Portfolio URL / Website" value={resumeData.portfolio || ''} onChange={v => updateResumeData('portfolio', v)} placeholder="johndoe.com" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Professional Summary</label>
                            <textarea 
                              value={resumeData.objective} 
                              onChange={e => updateResumeData('objective', e.target.value)}
                              placeholder="Write a brief overview of your professional background and key achievements..."
                              className="textarea-standard"
                            />
                          </div>
                        </div>
                      )}

                      {activeFormStep === 1 && (
                        <div className="space-y-8">
                          <SectionHeader title="Skills & Expertise" desc="Highlight your core competencies and technical skills." />
                          <div className="space-y-10">
                            {Object.entries(resumeData.skills || {}).map(([category, list]) => (
                              <div key={category} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{category}</label>
                                  <button 
                                    onClick={() => setShowBulkAdd(prev => ({ ...prev, [category]: !prev[category] }))}
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Zap className="w-3 h-3" /> {showBulkAdd[category] ? "Close Bulk Add" : "Bulk Add Skills"}
                                  </button>
                                </div>

                                {showBulkAdd[category] ? (
                                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <textarea 
                                      value={bulkSkills[category] || ""}
                                      onChange={e => setBulkSkills(prev => ({ ...prev, [category]: e.target.value }))}
                                      placeholder="Paste skills separated by commas or new lines (e.g. React, TypeScript, Node.js)"
                                      className="textarea-standard min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={() => handleBulkAdd(category)} className="btn-primary py-2 px-4 text-xs">Add All</button>
                                      <button onClick={() => setShowBulkAdd(prev => ({ ...prev, [category]: false }))} className="btn-secondary py-2 px-4 text-xs">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(list) ? list : []).map((skill, idx) => (
                                      <div key={idx} className="group relative">
                                        <input 
                                          value={skill}
                                          onChange={e => {
                                            const newList = [...(Array.isArray(list) ? list : [])];
                                            newList[idx] = e.target.value;
                                            updateResumeData(`skills.${category}`, newList);
                                          }}
                                          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600 min-w-[140px]"
                                        />
                                        <button 
                                          onClick={() => {
                                            const newList = (Array.isArray(list) ? list : []).filter((_, i) => i !== idx);
                                            updateResumeData(`skills.${category}`, newList);
                                          }}
                                          className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <button 
                                      onClick={() => {
                                        const newList = [...(Array.isArray(list) ? list : []), ""];
                                        updateResumeData(`skills.${category}`, newList);
                                      }}
                                      className="px-4 py-2 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-600 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all flex items-center gap-2 bg-white"
                                    >
                                      <Plus className="w-4 h-4" /> Add One
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeFormStep === 2 && (
                        <div className="space-y-8">
                          <div className="flex justify-between items-end">
                            <SectionHeader title="Work Experience" desc="List your most relevant professional projects and roles." />
                            <button onClick={() => updateResumeData('projects', [...(resumeData.projects || []), { title: "", technologies: "", highlights: [""] }])} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
                              <Plus className="w-4 h-4" /> Add Experience
                            </button>
                          </div>
                          <div className="space-y-8">
                            {(resumeData.projects || []).map((project, pIdx) => (
                              <div key={pIdx} className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative space-y-6">
                                <button 
                                  onClick={() => updateResumeData('projects', (resumeData.projects || []).filter((_, i) => i !== pIdx))}
                                  className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <InputField label="Company / Project Title" value={project.title} onChange={v => {
                                    const newList = [...(resumeData.projects || [])];
                                    newList[pIdx].title = v;
                                    updateResumeData('projects', newList);
                                  }} placeholder="e.g. Google / Resume Builder" />
                                  <InputField label="Key Technologies" value={project.technologies} onChange={v => {
                                    const newList = [...(resumeData.projects || [])];
                                    newList[pIdx].technologies = v;
                                    updateResumeData('projects', newList);
                                  }} placeholder="e.g. React, TypeScript, Node.js" />
                                </div>
                                <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Achievements & Responsibilities</label>
                                  {project.highlights.map((h, hIdx) => (
                                    <div key={hIdx} className="flex gap-2">
                                      <input 
                                        value={h}
                                        onChange={e => {
                                          const newList = [...(resumeData.projects || [])];
                                          newList[pIdx].highlights[hIdx] = e.target.value;
                                          updateResumeData('projects', newList);
                                        }}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
                                        placeholder="Managed a team of 5 engineers to deliver X feature..."
                                      />
                                      <button onClick={() => {
                                        const newList = [...(resumeData.projects || [])];
                                        newList[pIdx].highlights = newList[pIdx].highlights.filter((_, i) => i !== hIdx);
                                        updateResumeData('projects', newList);
                                      }} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                    </div>
                                  ))}
                                  <button onClick={() => {
                                    const newList = [...(resumeData.projects || [])];
                                    newList[pIdx].highlights.push("");
                                    updateResumeData('projects', newList);
                                  }} className="text-xs font-bold text-blue-600 hover:underline">+ Add Point</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeFormStep === 3 && (
                        <div className="space-y-12">
                          <div className="space-y-8">
                            <div className="flex justify-between items-end">
                              <SectionHeader title="Education" desc="Detail your academic background and degrees." />
                              <button onClick={() => updateResumeData('education', [...(resumeData.education || []), { degree: "", institution: "", year: "", location: "" }])} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Education
                              </button>
                            </div>
                            <div className="space-y-6">
                              {(resumeData.education || []).map((edu, eIdx) => (
                                <div key={eIdx} className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                  <button 
                                    onClick={() => updateResumeData('education', (resumeData.education || []).filter((_, i) => i !== eIdx))}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <InputField label="Degree / Certificate" value={edu.degree} onChange={v => {
                                    const newList = [...(resumeData.education || [])];
                                    newList[eIdx].degree = v;
                                    updateResumeData('education', newList);
                                  }} placeholder="B.S. in Computer Science" />
                                  <InputField label="Institution" value={edu.institution} onChange={v => {
                                    const newList = [...(resumeData.education || [])];
                                    newList[eIdx].institution = v;
                                    updateResumeData('education', newList);
                                  }} placeholder="University of Oxford" />
                                  <InputField label="Time Period" value={edu.year} onChange={v => {
                                    const newList = [...(resumeData.education || [])];
                                    newList[eIdx].year = v;
                                    updateResumeData('education', newList);
                                  }} placeholder="2018 - 2022" />
                                  <InputField label="Location" value={edu.location} onChange={v => {
                                    const newList = [...(resumeData.education || [])];
                                    newList[eIdx].location = v;
                                    updateResumeData('education', newList);
                                  }} placeholder="London, UK" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-8 pt-10 border-t border-slate-100">
                            <div className="flex justify-between items-end">
                              <SectionHeader title="Awards & Honors" desc="Highlight your professional recognitions." />
                              <button onClick={() => updateResumeData('awards', [...(resumeData.awards || []), { title: "", issuer: "", year: "" }])} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Award
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                              {(resumeData.awards || []).map((award, aIdx) => (
                                <div key={aIdx} className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative space-y-4">
                                  <button 
                                    onClick={() => updateResumeData('awards', (resumeData.awards || []).filter((_, i) => i !== aIdx))}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <InputField label="Award Title" value={award.title} onChange={v => {
                                    const newList = [...(resumeData.awards || [])];
                                    newList[aIdx].title = v;
                                    updateResumeData('awards', newList);
                                  }} placeholder="Dean's List" />
                                  <InputField label="Issuer" value={award.issuer} onChange={v => {
                                    const newList = [...(resumeData.awards || [])];
                                    newList[aIdx].issuer = v;
                                    updateResumeData('awards', newList);
                                  }} placeholder="University of Oxford" />
                                  <InputField label="Year" value={award.year} onChange={v => {
                                    const newList = [...(resumeData.awards || [])];
                                    newList[aIdx].year = v;
                                    updateResumeData('awards', newList);
                                  }} placeholder="2022" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeFormStep === 4 && (
                        <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-blue-600" />
                          </div>
                          <div className="max-w-md">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Build</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                              Review your information and let our AI optimize the wording for maximum professional impact.
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setActiveFormStep(3)}
                              className="btn-secondary flex items-center gap-2"
                            >
                              <ChevronLeft className="w-5 h-5" /> Back to Check
                            </button>
                            <button 
                              onClick={handleSynthesize}
                              disabled={isLoading}
                              className="btn-primary flex items-center gap-2"
                            >
                              {isLoading ? "Processing..." : "Generate Professional Resume"} <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {activeFormStep < 4 && (
                  <div className="p-8 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <button 
                      onClick={() => setActiveFormStep(s => Math.max(0, s - 1))}
                      disabled={activeFormStep === 0}
                      className="btn-secondary flex items-center gap-2 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button 
                      onClick={() => setActiveFormStep(s => Math.min(4, s + 1))}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col lg:flex-row gap-8 min-h-screen"
            >
              <div className="flex-1 card-standard bg-white overflow-hidden flex flex-col order-2 lg:order-1 shadow-lg">
                <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Document Preview</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {template} Template
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-12 bg-slate-100 flex justify-center">
                  <div id="resume-content" className="w-full max-w-[800px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <ResumePreview data={resumeData} template={template} accentColor={accentColor} />
                  </div>
                </div>
              </div>

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
                    <button onClick={() => window.print()} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function SectionHeader({ title, desc }: { title: string, desc: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
      <p className="text-sm text-slate-500 font-medium mt-1">{desc}</p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-standard"
      />
    </div>
  );
}

function ResumePreview({ data, template, accentColor }: { data: ResumeData | null, template: string, accentColor: string }) {
  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-20">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="font-bold uppercase tracking-widest text-xs">Generating Preview...</p>
    </div>
  );

  const getTemplateStyles = () => {
    switch (template) {
      case "Creative":
        return {
          container: "bg-white text-slate-900 font-sans min-h-[1123px] flex",
          sidebar: "w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col p-10 gap-10",
          main: "flex-1 p-12 flex flex-col gap-12",
          name: "text-4xl font-black mb-1 uppercase tracking-tight",
          role: "text-sm font-bold tracking-[0.2em] uppercase opacity-40 mb-10",
          sectionTitle: "text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200",
        };
      case "Professional":
        return {
          container: "bg-white text-zinc-900 font-serif min-h-[1123px] p-16 flex flex-col",
          header: "text-center mb-12 border-b border-zinc-200 pb-10",
          name: "text-4xl font-black uppercase tracking-[0.2em] mb-4",
          role: "text-lg font-bold tracking-widest uppercase italic text-zinc-500",
          sectionTitle: "text-sm font-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-900 pb-1 inline-block",
        };
      case "Minimal":
        return {
          container: "bg-white text-neutral-900 font-mono min-h-[1123px] p-16 flex flex-col gap-12",
          header: "mb-10",
          name: "text-3xl font-black mb-2 uppercase",
          role: "text-xs font-bold tracking-[0.4em] uppercase text-neutral-400 mb-8",
          sectionTitle: "text-[10px] font-black uppercase tracking-[0.5em] mb-8 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-neutral-200",
        };
      default: // Modern
        return {
          container: "bg-white text-slate-900 font-sans min-h-[1123px] flex flex-col",
          header: "bg-slate-900 text-white p-12 flex flex-col md:flex-row justify-between items-center gap-10",
          main: "p-12 grid grid-cols-12 gap-12",
          left: "col-span-8 space-y-12",
          right: "col-span-4 space-y-12",
          name: "text-5xl font-black tracking-tighter uppercase",
          role: "text-xl font-bold tracking-tight opacity-70",
          sectionTitle: "text-lg font-black mb-6 uppercase tracking-tight border-b-2 pb-2",
        };
    }
  };

  const styles = getTemplateStyles();

  if (template === "Modern") {
    return (
      <div className={styles.container}>
        <header className={styles.header} style={{ borderBottom: `8px solid ${accentColor}` }}>
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h1 className={styles.name}>{data.name}</h1>
            <p className={styles.role}>{data.target_role}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
            <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {data.email}</span>
            <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {data.phone}</span>
            {data.location && <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {data.location}</span>}
          </div>
        </header>
        <div className={styles.main}>
          <div className={styles.left}>
            <section>
              <h2 className={styles.sectionTitle} style={{ borderColor: accentColor, color: accentColor }}>Summary</h2>
              <p className="text-sm font-medium leading-relaxed text-slate-600">{data.objective}</p>
            </section>
            <section>
              <h2 className={styles.sectionTitle} style={{ borderColor: accentColor, color: accentColor }}>Experience</h2>
              <div className="space-y-10">
                {data.projects?.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="font-black text-lg uppercase">{p.title}</h3>
                      <span className="text-[10px] font-black uppercase opacity-40">{p.technologies}</span>
                    </div>
                    <ul className="space-y-2">
                      {p.highlights?.filter(h => h.trim()).map((h, j) => (
                        <li key={j} className="flex gap-3 text-sm font-medium text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className={styles.right}>
            <section>
              <h2 className={styles.sectionTitle} style={{ borderColor: accentColor, color: accentColor }}>Skills</h2>
              <div className="space-y-4">
                {Object.entries(data.skills || {}).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">{key}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                        <span key={idx} className="bg-slate-50 px-2 py-1 rounded-md text-[9px] font-bold uppercase border border-slate-100">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className={styles.sectionTitle} style={{ borderColor: accentColor, color: accentColor }}>Education</h2>
              <div className="space-y-6">
                {data.education?.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-black text-sm uppercase">{e.degree}</h3>
                    <p className="text-xs font-bold opacity-40 italic">{e.institution}</p>
                    <p className="text-[10px] font-black mt-1" style={{ color: accentColor }}>{e.year}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (template === "Creative") {
    return (
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className="w-32 h-32 rounded-full bg-slate-200 mx-auto overflow-hidden border-4" style={{ borderColor: accentColor }}>
            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-400">
              {data.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <section>
            <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Contact</h2>
            <div className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-60">
              <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {data.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {data.phone}</p>
              {data.location && <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {data.location}</p>}
            </div>
          </section>
          <section>
            <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Expertise</h2>
            <div className="space-y-6">
              {Object.entries(data.skills || {}).map(([key, val]) => (
                <div key={key}>
                  <p className="text-[8px] font-black uppercase opacity-40 mb-2">{key}</p>
                  <div className="space-y-2">
                    {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase">{s}</span>
                        <div className="w-12 h-1 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: '80%', backgroundColor: accentColor }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Languages</h2>
            <div className="flex flex-wrap gap-2">
              {data.languages?.filter(l => l.trim()).map((l, i) => (
                <span key={i} className="text-[9px] font-black uppercase opacity-60 px-2 py-1 bg-white border border-slate-200 rounded">{l}</span>
              ))}
            </div>
          </section>
        </div>
        <div className={styles.main}>
          <div className="mb-10">
            <h1 className={styles.name} style={{ color: accentColor }}>{data.name}</h1>
            <p className={styles.role}>{data.target_role}</p>
            <p className="text-sm font-medium leading-relaxed text-slate-500 italic mt-6">{data.objective}</p>
          </div>
          <section>
            <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Work Experience</h2>
            <div className="space-y-10">
              {data.projects?.map((p, i) => (
                <div key={i} className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100">
                  <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xl uppercase tracking-tight">{p.title}</h3>
                    <span className="text-[9px] font-black uppercase px-3 py-1 bg-slate-50 rounded-full" style={{ color: accentColor }}>{p.technologies}</span>
                  </div>
                  <ul className="space-y-2">
                    {p.highlights?.filter(h => h.trim()).map((h, j) => (
                      <li key={j} className="text-sm font-medium text-slate-600 leading-relaxed">{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {template === "Professional" && (
        <header className={styles.header}>
          <h1 className={styles.name}>{data.name}</h1>
          <p className={styles.role} style={{ color: accentColor }}>{data.target_role}</p>
          <div className="flex justify-center gap-10 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
            <span>{data.email}</span>
            <span>&bull;</span>
            <span>{data.phone}</span>
            {data.location && (
              <>
                <span>&bull;</span>
                <span>{data.location}</span>
              </>
            )}
          </div>
        </header>
      )}

      {template === "Minimal" && (
        <header className={styles.header}>
          <h1 className={styles.name}>{data.name}</h1>
          <p className={styles.role} style={{ color: accentColor }}>{data.target_role}</p>
          <div className="flex gap-6 text-[10px] font-bold uppercase opacity-40">
            <span>{data.email}</span>
            <span>{data.phone}</span>
            {data.location && <span>{data.location}</span>}
          </div>
        </header>
      )}

      <div className="space-y-12">
        {data.objective && (
          <section>
            <h2 className={styles.sectionTitle} style={{ color: template === "Minimal" ? undefined : accentColor, borderColor: template === "Professional" ? accentColor : undefined }}>
              {template === "Minimal" && <span className="w-8 h-[1px] bg-neutral-200 absolute left-0" style={{ backgroundColor: accentColor }} />}
              Summary
            </h2>
            <p className={cn("text-sm leading-relaxed", template === "Minimal" ? "text-neutral-500" : "text-slate-700 font-medium")}>{data.objective}</p>
          </section>
        )}

        {data.projects && (
          <section>
            <h2 className={styles.sectionTitle} style={{ color: template === "Minimal" ? undefined : accentColor, borderColor: template === "Professional" ? accentColor : undefined }}>
              Experience
            </h2>
            <div className="space-y-10">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="font-black text-lg uppercase tracking-tight">{p.title}</h3>
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{p.technologies}</span>
                  </div>
                  <ul className="space-y-2">
                    {p.highlights?.filter(h => h.trim()).map((h, j) => (
                      <li key={j} className={cn("text-sm flex gap-3", template === "Minimal" ? "text-neutral-500" : "text-slate-700 font-medium")}>
                        <span className="text-lg leading-none" style={{ color: accentColor }}>&bull;</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-12">
          {data.skills && (
            <section>
              <h2 className={styles.sectionTitle} style={{ color: template === "Minimal" ? undefined : accentColor, borderColor: template === "Professional" ? accentColor : undefined }}>
                Skills
              </h2>
              <div className="space-y-4">
                {Object.entries(data.skills).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">{key}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                        <span key={idx} className="text-xs font-bold">{s}{idx < (Array.isArray(val) ? val.filter(item => item.trim()).length : 1) - 1 ? ',' : ''}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education && (
            <section>
              <h2 className={styles.sectionTitle} style={{ color: template === "Minimal" ? undefined : accentColor, borderColor: template === "Professional" ? accentColor : undefined }}>
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-black text-sm uppercase">{e.degree}</h3>
                    <p className="text-xs font-bold opacity-40">{e.institution}</p>
                    <p className="text-[10px] font-black mt-1" style={{ color: accentColor }}>{e.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <div className={cn("animate-spin", className)}><RotateCcw /></div>;
}
