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
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';

interface Project {
  title: string;
  technologies: string;
  highlights: string[];
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  location: string;
}

interface ResumeData {
  name: string;
  target_role: string;
  email: string;
  phone: string;
  location?: string;
  objective?: string;
  skills?: Record<string, string[] | string>;
  languages?: string[];
  certifications?: { name: string; issuer: string; year: string }[];
  projects?: Project[];
  education?: Education[];
}

const STEPS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "final", label: "Synthesis", icon: Sparkles },
];

const TEMPLATES = [
  { id: "Modern", label: "Modern", desc: "Sleek, high-impact design with bold accents.", color: "bg-primary", image: "/templates/modern.png" },
  { id: "Professional", label: "Professional", desc: "Traditional serif-based look for corporate roles.", color: "bg-zinc-800", image: "/templates/professional.png" },
  { id: "Creative", label: "Creative", desc: "Vibrant, unique layout for design & tech.", color: "bg-violet-500", image: "/templates/creative.png" },
  { id: "Minimal", label: "Minimal", desc: "Focused, mono-spaced and distraction-free.", color: "bg-neutral-400", image: "/templates/minimal.png" },
] as const;

const ACCENT_COLORS = [
  { name: "Modern Blue", value: "#1e40af" },
  { name: "Sleek Black", value: "#000000" },
  { name: "Ruby Red", value: "#be123c" },
  { name: "Emerald", value: "#047857" },
  { name: "Royal Purple", value: "#6d28d9" },
  { name: "Amber", value: "#d97706" },
];

export default function ResumeBuilder() {
  const [step, setStep] = useState<"landing" | "form" | "preview">("landing");
  const [activeFormStep, setActiveFormStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "",
    target_role: "",
    email: "",
    phone: "",
    location: "",
    objective: "",
    skills: { "Technical": [] },
    projects: [{ title: "", technologies: "", highlights: [""] }],
    education: [{ degree: "", institution: "", year: "", location: "" }],
    languages: [""],
    certifications: [{ name: "", issuer: "", year: "" }]
  });
  
  const [template, setTemplate] = useState<"Modern" | "Professional" | "Creative" | "Minimal">("Modern");
  const [accentColor, setAccentColor] = useState("#1e40af");
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
      setShowAuthModal(true);
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
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Error saving to cloud:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = () => {
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
    <main className="min-h-screen relative overflow-x-hidden bg-background flex flex-col items-center p-4 md:p-8">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-full h-full bg-primary/5 blur-[120px] rounded-full opacity-30" 
        />
      </div>

      {/* Header / Auth Status */}
      <div className="z-20 w-full max-w-7xl flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-black italic text-xl tracking-tighter">ARCHITECT.</span>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Architect Mode</span>
                <span className="text-xs font-bold">{user.email}</span>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="p-3 glass rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="z-10 w-full flex flex-col items-center py-12"
          >
            <div className="text-center max-w-4xl px-4 mb-24">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass mb-8 border-white/20 shadow-2xl">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-black tracking-[0.2em]">INTELLIGENT RESUME SYNTHESIS</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none text-white uppercase italic">
                Your Career <br/> <span className="text-primary not-italic">Architected.</span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-bold">
                Design ATS-optimized resumes that command attention using high-performance AI synthesis.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleStart} className="w-full sm:w-auto px-12 py-6 bg-primary text-primary-foreground rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl">
                  START BUILDING
                </button>
                <button onClick={scrollToTemplates} className="w-full sm:w-auto px-12 py-6 glass rounded-full font-black text-xl hover:bg-white/10 transition-all">
                  EXPLORE STYLES
                </button>
              </div>
            </div>

            <div ref={templatesRef} className="w-full max-w-7xl px-4 mb-24 scroll-mt-24">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase italic">The Templates</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {TEMPLATES.map((t) => (
                  <div key={t.id} className="glass-card rounded-[2.5rem] p-4 text-center border-white/5 hover:border-primary/50 transition-all cursor-default group overflow-hidden">
                    <div className="relative w-full aspect-[4/5] rounded-[1.5rem] mb-6 shadow-2xl overflow-hidden bg-slate-900">
                      <img 
                        src={t.image} 
                        alt={t.label} 
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="px-4 pb-4">
                      <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">{t.label}</h3>
                      <p className="text-xs text-muted-foreground font-bold opacity-60 leading-relaxed uppercase tracking-widest">{t.desc}</p>
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 w-full max-w-5xl glass-card rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[70vh]"
          >
            <div className="w-full md:w-72 bg-slate-950/50 border-r border-white/10 p-8 flex flex-col gap-8">
              <h3 className="text-2xl font-black italic mb-4">PROGRESS</h3>
              <div className="flex flex-col gap-6">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                      activeFormStep === idx ? "bg-primary border-primary text-primary-foreground scale-110" : 
                      activeFormStep > idx ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-white/5 border-transparent text-muted-foreground"
                    )}>
                      {activeFormStep > idx ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-widest", activeFormStep === idx ? "text-white" : "text-muted-foreground")}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col p-8 md:p-16 relative">
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFormStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    {activeFormStep === 0 && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-primary">Identity</h2>
                          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">The foundation of your profile.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Full Name" value={resumeData.name} onChange={v => updateResumeData('name', v)} placeholder="John Doe" />
                          <InputField label="Target Role" value={resumeData.target_role} onChange={v => updateResumeData('target_role', v)} placeholder="Software Engineer" />
                          <InputField label="Email" value={resumeData.email} onChange={v => updateResumeData('email', v)} placeholder="john@example.com" />
                          <InputField label="Phone" value={resumeData.phone} onChange={v => updateResumeData('phone', v)} placeholder="+1 234 567 890" />
                          <InputField label="Location" value={resumeData.location || ''} onChange={v => updateResumeData('location', v)} placeholder="New York, USA" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Professional Summary (Optional)</label>
                          <textarea 
                            value={resumeData.objective} 
                            onChange={e => updateResumeData('objective', e.target.value)}
                            placeholder="Briefly describe your career goals and key strengths..."
                            className="w-full bg-white/5 border-2 border-white/5 rounded-[1.5rem] px-6 py-4 min-h-[120px] focus:outline-none focus:border-primary font-bold text-white transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {activeFormStep === 1 && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-primary">Expertise</h2>
                          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">What tools do you master?</p>
                        </div>
                        <div className="space-y-6">
                          {Object.entries(resumeData.skills || {}).map(([category, list]) => (
                            <div key={category} className="space-y-4">
                              <label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-4">{category}</label>
                              <div className="flex flex-wrap gap-3">
                                {(Array.isArray(list) ? list : []).map((skill, idx) => (
                                  <div key={idx} className="group relative">
                                    <input 
                                      value={skill}
                                      onChange={e => {
                                        const newList = [...(Array.isArray(list) ? list : [])];
                                        newList[idx] = e.target.value;
                                        updateResumeData(`skills.${category}`, newList);
                                      }}
                                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary min-w-[100px]"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newList = (Array.isArray(list) ? list : []).filter((_, i) => i !== idx);
                                        updateResumeData(`skills.${category}`, newList);
                                      }}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => {
                                    const newList = [...(Array.isArray(list) ? list : []), ""];
                                    updateResumeData(`skills.${category}`, newList);
                                  }}
                                  className="px-4 py-2 rounded-xl border border-dashed border-white/20 hover:border-primary/50 transition-all text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2"
                                >
                                  <Plus className="w-3 h-3" /> Add Skill
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-8 border-t border-white/5 space-y-6">
                          <label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-4">Languages</label>
                          <div className="flex flex-wrap gap-3">
                            {(resumeData.languages || []).map((lang, idx) => (
                              <div key={idx} className="group relative">
                                <input 
                                  value={lang}
                                  onChange={e => {
                                    const newList = [...(resumeData.languages || [])];
                                    newList[idx] = e.target.value;
                                    updateResumeData('languages', newList);
                                  }}
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary"
                                />
                                <button onClick={() => updateResumeData('languages', (resumeData.languages || []).filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                            <button onClick={() => updateResumeData('languages', [...(resumeData.languages || []), ""])} className="px-4 py-2 rounded-xl border border-dashed border-white/20 hover:border-primary/50 transition-all text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100">
                              + Add Language
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFormStep === 2 && (
                      <div className="space-y-8">
                        <div className="flex justify-between items-end">
                          <div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-primary">Experience</h2>
                            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">Your track record of success.</p>
                          </div>
                          <button onClick={() => updateResumeData('projects', [...(resumeData.projects || []), { title: "", technologies: "", highlights: [""] }])} className="px-6 py-3 glass rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Project
                          </button>
                        </div>
                        <div className="space-y-12">
                          {(resumeData.projects || []).map((project, pIdx) => (
                            <div key={pIdx} className="glass-card p-8 rounded-[2.5rem] relative space-y-6">
                              <button 
                                onClick={() => updateResumeData('projects', (resumeData.projects || []).filter((_, i) => i !== pIdx))}
                                className="absolute top-6 right-6 p-2 hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Project/Company Title" value={project.title} onChange={v => {
                                  const newList = [...(resumeData.projects || [])];
                                  newList[pIdx].title = v;
                                  updateResumeData('projects', newList);
                                }} placeholder="e.g. Acme Corp / Resume Builder" />
                                <InputField label="Technologies" value={project.technologies} onChange={v => {
                                  const newList = [...(resumeData.projects || [])];
                                  newList[pIdx].technologies = v;
                                  updateResumeData('projects', newList);
                                }} placeholder="e.g. React, Node.js, AWS" />
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Key Highlights</label>
                                {project.highlights.map((h, hIdx) => (
                                  <div key={hIdx} className="flex gap-4">
                                    <input 
                                      value={h}
                                      onChange={e => {
                                        const newList = [...(resumeData.projects || [])];
                                        newList[pIdx].highlights[hIdx] = e.target.value;
                                        updateResumeData('projects', newList);
                                      }}
                                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary"
                                      placeholder="Improved performance by 20%..."
                                    />
                                    <button onClick={() => {
                                      const newList = [...(resumeData.projects || [])];
                                      newList[pIdx].highlights = newList[pIdx].highlights.filter((_, i) => i !== hIdx);
                                      updateResumeData('projects', newList);
                                    }} className="p-2 hover:text-destructive transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                ))}
                                <button onClick={() => {
                                  const newList = [...(resumeData.projects || [])];
                                  newList[pIdx].highlights.push("");
                                  updateResumeData('projects', newList);
                                }} className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100">+ Add Highlight</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeFormStep === 3 && (
                      <div className="space-y-8">
                        <div className="flex justify-between items-end">
                          <div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-primary">Education</h2>
                            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">Your academic background.</p>
                          </div>
                          <button onClick={() => updateResumeData('education', [...(resumeData.education || []), { degree: "", institution: "", year: "", location: "" }])} className="px-6 py-3 glass rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Education
                          </button>
                        </div>
                        <div className="space-y-8">
                          {(resumeData.education || []).map((edu, eIdx) => (
                            <div key={eIdx} className="glass-card p-8 rounded-[2.5rem] relative grid grid-cols-1 md:grid-cols-2 gap-6">
                              <button 
                                onClick={() => updateResumeData('education', (resumeData.education || []).filter((_, i) => i !== eIdx))}
                                className="absolute top-6 right-6 p-2 hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <InputField label="Degree" value={edu.degree} onChange={v => {
                                const newList = [...(resumeData.education || [])];
                                newList[eIdx].degree = v;
                                updateResumeData('education', newList);
                              }} placeholder="Bachelor of Science in CS" />
                              <InputField label="Institution" value={edu.institution} onChange={v => {
                                const newList = [...(resumeData.education || [])];
                                newList[eIdx].institution = v;
                                updateResumeData('education', newList);
                              }} placeholder="Stanford University" />
                              <InputField label="Year" value={edu.year} onChange={v => {
                                const newList = [...(resumeData.education || [])];
                                newList[eIdx].year = v;
                                updateResumeData('education', newList);
                              }} placeholder="2020 - 2024" />
                              <InputField label="Location" value={edu.location} onChange={v => {
                                const newList = [...(resumeData.education || [])];
                                newList[eIdx].location = v;
                                updateResumeData('education', newList);
                              }} placeholder="Palo Alto, CA" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeFormStep === 4 && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                          <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Ready for Synthesis</h2>
                          <p className="text-muted-foreground font-bold max-w-md mx-auto leading-relaxed">
                            Our AI Architect is standing by to polish your descriptions, optimize for ATS, and synthesize your final professional document.
                          </p>
                        </div>
                        <button 
                          onClick={handleSynthesize}
                          disabled={isLoading}
                          className="px-12 py-6 bg-primary text-primary-foreground rounded-full font-black text-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50"
                        >
                          {isLoading ? "Synthesizing..." : "Architect Resume"} <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {activeFormStep < 4 && (
                <div className="pt-10 flex justify-between items-center border-t border-white/5 bg-slate-950/20 -mx-8 -mb-8 px-16 py-8">
                  <button 
                    onClick={() => setActiveFormStep(s => Math.max(0, s - 1))}
                    disabled={activeFormStep === 0}
                    className="px-8 py-4 glass rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 disabled:opacity-20 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  <button 
                    onClick={() => setActiveFormStep(s => Math.min(4, s + 1))}
                    className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                  >
                    Next Step <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-7xl flex flex-col xl:flex-row gap-12 py-12 px-4 min-h-screen"
          >
            <div className="flex-1 glass-card rounded-[3rem] md:rounded-[4rem] overflow-hidden flex flex-col bg-slate-950/80 shadow-2xl relative order-2 xl:order-1">
              <div className="px-12 py-6 border-b border-white/5 flex items-center justify-between backdrop-blur-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">LIVE ARCHITECT PREVIEW</span>
                </div>
                <div className="glass px-6 py-2 rounded-2xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-xs font-black uppercase tracking-widest">{template}</span>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto p-4 md:p-12 lg:p-20 scrollbar-hide flex justify-center bg-slate-100">
                <div id="resume-content" className="w-full min-w-[320px] max-w-[800px] shadow-2xl">
                  <ResumePreview data={resumeData} template={template} accentColor={accentColor} />
                </div>
              </div>
            </div>

            <div className="w-full xl:w-[380px] flex flex-col gap-8 order-1 xl:order-2">
              <div className="glass-card rounded-[3rem] p-10 space-y-10 bg-white/5 border-white/10">
                <div>
                  <h3 className="font-black text-3xl tracking-tighter mb-2 text-white">RE-SKIN.</h3>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Style Configuration</p>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Accent Theme
                  </p>
                  <div className="grid grid-cols-6 gap-3">
                    {ACCENT_COLORS.map(c => (
                      <button 
                        key={c.value} 
                        onClick={() => setAccentColor(c.value)}
                        title={c.name}
                        className={cn(
                          "w-full aspect-square rounded-full border-2 transition-all hover:scale-125",
                          accentColor === c.value ? "border-white ring-4 ring-white/10" : "border-transparent"
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={saveToCloud}
                    disabled={isSaving}
                    className={cn(
                      "w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all",
                      saveStatus === "saved" ? "bg-emerald-500 text-white" : "glass hover:bg-white/10"
                    )}
                  >
                    {saveStatus === "saved" ? (
                      <>
                        <CheckCircle2 className="w-7 h-7" /> SAVED!
                      </>
                    ) : (
                      <>
                        <Cloud className={cn("w-7 h-7", isSaving && "animate-pulse")} /> {isSaving ? "SAVING..." : "SAVE TO CLOUD"}
                      </>
                    )}
                  </button>
                  <button onClick={() => window.print()} className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                    <Download className="w-7 h-7" /> EXPORT PDF
                  </button>
                  <button onClick={() => setStep("form")} className="w-full py-6 glass hover:bg-white/10 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all">
                    <RotateCcw className="w-7 h-7" /> REFINE DATA
                  </button>
                </div>

                <div className="pt-10 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">SWITCH SYSTEM</p>
                  <div className="grid grid-cols-2 gap-4">
                    {TEMPLATES.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => {
                          setTemplate(t.id);
                          if (t.id === "Creative") setAccentColor("#6d28d9");
                          if (t.id === "Professional") setAccentColor("#000000");
                          if (t.id === "Modern") setAccentColor("#1e40af");
                          if (t.id === "Minimal") setAccentColor("#444444");
                        }} 
                        className={cn("group p-4 glass rounded-[2rem] transition-all border-2 flex flex-col items-center gap-3", template === t.id ? "border-primary bg-primary/20 scale-105 shadow-2xl" : "border-transparent opacity-60 hover:opacity-100")}
                      >
                        <div className="relative w-full h-16 rounded-xl overflow-hidden shadow-inner bg-slate-900">
                          <img src={t.image} alt={t.label} className="w-full h-full object-cover object-top opacity-80" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  );
}

function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: email.split('@')[0] }
          }
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="z-10 w-full max-w-md glass-card rounded-[3rem] p-12 relative overflow-hidden border-primary/20 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{mode === "signin" ? "WELCOME BACK." : "JOIN THE GUILD."}</h3>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Identity Verification Required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Command Center Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary font-bold text-white transition-all" placeholder="name@domain.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Access Credentials</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary font-bold text-white transition-all" placeholder="••••••••" />
              </div>

              {error && <p className="text-destructive text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

              <button disabled={isLoading} type="submit" className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                {isLoading ? "VERIFYING..." : mode === "signin" ? "AUTHORIZE ACCESS" : "INITIALIZE ACCOUNT"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                {mode === "signin" ? "Request New Credentials" : "I have an existing clearance"}
              </button>
            </div>
            
            <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-white transition-colors"><X className="w-6 h-6" /></button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary font-bold text-white transition-all"
      />
    </div>
  );
}

function ResumePreview({ data, template, accentColor }: { data: ResumeData | null, template: string, accentColor: string }) {
  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-10 p-20">
      <Sparkles className="w-12 h-12 animate-pulse" />
      <p className="font-black uppercase tracking-widest text-sm">Synthesizing...</p>
    </div>
  );

  const getTemplateStyles = () => {
    switch (template) {
      case "Creative":
        return {
          container: "bg-white text-slate-900 font-sans min-h-[1123px] flex shadow-2xl",
          sidebar: "w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col p-10 gap-10",
          main: "flex-1 p-12 flex flex-col gap-12",
          name: "text-4xl font-black mb-1 uppercase tracking-tight",
          role: "text-sm font-bold tracking-[0.2em] uppercase opacity-40 mb-10",
          sectionTitle: "text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 after:content-[''] after:h-[1px] after:flex-1",
        };
      case "Professional":
        return {
          container: "bg-white text-zinc-900 font-serif min-h-[1123px] p-16 flex flex-col shadow-2xl",
          header: "text-center mb-12 border-b border-zinc-200 pb-10",
          name: "text-4xl font-black uppercase tracking-[0.2em] mb-4",
          role: "text-lg font-bold tracking-widest uppercase italic text-zinc-500",
          sectionTitle: "text-sm font-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-900 pb-1 inline-block",
        };
      case "Minimal":
        return {
          container: "bg-white text-neutral-900 font-mono min-h-[1123px] p-16 flex flex-col gap-12 shadow-2xl",
          header: "mb-10",
          name: "text-3xl font-black mb-2 uppercase",
          role: "text-xs font-bold tracking-[0.4em] uppercase text-neutral-400 mb-8",
          sectionTitle: "text-[10px] font-black uppercase tracking-[0.5em] mb-8 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-neutral-200",
        };
      default: // Modern
        return {
          container: "bg-white text-slate-900 font-sans min-h-[1123px] flex flex-col shadow-2xl",
          header: "bg-slate-950 text-white p-12 flex flex-col md:flex-row justify-between items-center gap-10",
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
                <span key={i} className="text-[9px] font-black uppercase opacity-60 px-2 py-1 glass-card bg-white border-slate-200">{l}</span>
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
