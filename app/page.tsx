"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Download,
  Eye,
  RotateCcw,
  Zap,
  Menu,
  X,
  Palette,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

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
  { id: "final", label: "Finalize", icon: Sparkles },
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
  const [step, setStep] = useState<"landing" | "chat" | "preview">("landing");
  const [currentStepId, setCurrentStepId] = useState("identity");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [template, setTemplate] = useState<"Modern" | "Professional" | "Creative" | "Minimal">("Modern");
  const [accentColor, setAccentColor] = useState("#1e40af");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleStart = () => {
    setStep("chat");
    const initialMessage = "Hello! I'm your AI resume assistant. What's your full name and what role are you targeting? (e.g., Frontend Developer)";
    setMessages([{ role: "assistant", content: initialMessage }]);
  };

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const forceGenerate = async () => {
    const triggerMessage: Message = { role: "user", content: "I'm ready. Please generate the resume JSON now based on the information we have." };
    setMessages((prev) => [...prev, triggerMessage]);
    sendMessage(undefined, triggerMessage);
  };

  const sendMessage = async (e?: React.FormEvent, manualMessage?: Message) => {
    e?.preventDefault();
    const currentInput = manualMessage ? manualMessage.content : input;
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = manualMessage || { role: "user", content: currentInput };
    if (!manualMessage) {
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      const assistantMessage: Message = { role: "assistant", content: data.content };
      setMessages((prev) => [...prev, assistantMessage]);

      const content = data.content.toLowerCase();
      if (content.includes("skill")) setCurrentStepId("skills");
      if (content.includes("experience") || content.includes("project")) setCurrentStepId("experience");
      if (content.includes("education")) setCurrentStepId("education");
      if (content.includes("generate") || content.includes("enough")) setCurrentStepId("final");

      const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = (data.content as string).match(jsonRegex);
      
      let parsedJson = null;
      if (match) {
        try {
          parsedJson = JSON.parse(match[1]);
        } catch (err) {
          console.error("Failed to parse JSON code block", err);
        }
      } 
      
      if (!parsedJson && (data.content.includes("{") && data.content.includes("}"))) {
        try {
          const start = (data.content as string).indexOf("{");
          const end = (data.content as string).lastIndexOf("}") + 1;
          const jsonStr = (data.content as string).substring(start, end);
          parsedJson = JSON.parse(jsonStr);
        } catch (err) {
          console.log("JSON detection fallback failed", err);
        }
      }

      if (parsedJson && parsedJson.name) {
        setResumeData(parsedJson);
        setTimeout(() => setStep("preview"), 1500);
      }
    } catch (error) {
      console.error("Error:", error);
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

      <AnimatePresence mode="wait">
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="z-10 w-full flex flex-col items-center py-12 md:py-24"
          >
            <div className="text-center max-w-4xl px-4 mb-24">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass mb-8 border-white/20 shadow-2xl">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-black tracking-[0.2em]">AI-POWERED RESUME ARCHITECT</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none text-white uppercase italic">
                Architect Your <br/> <span className="text-primary not-italic">Legacy.</span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-bold">
                Professional, ATS-optimized resumes synthesized in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={handleStart} className="w-full sm:w-auto px-12 py-6 bg-primary text-primary-foreground rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl">
                  GET STARTED
                </button>
                <button onClick={scrollToTemplates} className="w-full sm:w-auto px-12 py-6 glass rounded-full font-black text-xl hover:bg-white/10 transition-all">
                  VIEW STYLES
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

        {step === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 w-full max-w-6xl h-[90vh] md:h-[85vh] glass-card rounded-[2rem] md:rounded-[4rem] flex flex-col md:flex-row overflow-hidden shadow-2xl"
          >
            {/* Sidebar Toggle (Mobile) */}
            <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 glass">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-black text-xs uppercase tracking-widest">{currentStepId}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu className="w-6 h-6" /></button>
            </div>

            {/* Sidebar */}
            <div className={cn(
              "fixed md:relative inset-0 md:inset-auto z-40 md:z-auto w-full md:w-80 border-r border-white/10 flex flex-col bg-slate-950 md:bg-white/5 backdrop-blur-3xl transition-transform",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
              <div className="p-10 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-2xl font-black italic">ARCHITECT</h3>
                <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all",
                      currentStepId === s.id ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30" : "bg-white/5 border-transparent text-muted-foreground"
                    )}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black opacity-30 uppercase">STEP 0{idx + 1}</span>
                      <span className="font-bold">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              {messages.length > 5 && !resumeData && (
                <div className="p-8">
                  <button onClick={forceGenerate} className="w-full py-4 glass border-emerald-500/30 text-emerald-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500/10">
                    Force Generate
                  </button>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col relative">
              <div className="px-10 py-8 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="font-black text-xl tracking-tight">CAREER AGENT</h2>
                </div>
                <div className="flex items-center gap-3">
                  {resumeData && (
                    <button onClick={() => setStep("preview")} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                      <Eye className="w-4 h-4" /> PREVIEW NOW
                    </button>
                  )}
                  <button onClick={() => setStep("landing")} className="p-4 glass rounded-2xl"><RotateCcw className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-14 space-y-10 scrollbar-hide">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-6 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center", msg.role === "user" ? "bg-white/10" : "bg-primary text-primary-foreground")}>
                      {msg.role === "user" ? <User className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div className={cn("px-8 py-5 rounded-[2.5rem] shadow-xl", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "glass rounded-tl-none")}>
                      {msg.role === "assistant" && i === messages.length - 1 && !isLoading ? <TypingText text={msg.content} /> : <p className="leading-relaxed text-lg font-bold">{msg.content}</p>}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-6 mr-auto">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse"><Sparkles className="w-6 h-6 text-primary-foreground" /></div>
                    <div className="px-10 py-6 rounded-[2.5rem] glass rounded-tl-none flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 md:p-14 border-t border-white/10 bg-black/20 backdrop-blur-3xl">
                <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer..." className="w-full bg-black/40 border-2 border-white/10 rounded-[2.5rem] px-10 py-7 pr-24 focus:outline-none focus:border-primary text-xl font-bold text-white shadow-2xl" />
                  <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-4 top-4 bottom-4 aspect-square bg-primary text-primary-foreground rounded-3xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-xl">
                    <Send className="w-8 h-8" />
                  </button>
                </form>
              </div>
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
            {/* Preview Window */}
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

            {/* Controls */}
            <div className="w-full xl:w-[380px] flex flex-col gap-8 order-1 xl:order-2">
              <div className="glass-card rounded-[3rem] p-10 space-y-10 bg-white/5 border-white/10">
                <div>
                  <h3 className="font-black text-3xl tracking-tighter mb-2 text-white">RE-SKIN.</h3>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Style Configuration</p>
                </div>

                {/* Color Palette */}
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
                  <button onClick={() => window.print()} className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                    <Download className="w-7 h-7" /> EXPORT PDF
                  </button>
                  <button onClick={() => setStep("chat")} className="w-full py-6 glass hover:bg-white/10 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all">
                    <RotateCcw className="w-7 h-7" /> REFINE CHAT
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
    </main>
  );
}

function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);
  return <p className="leading-relaxed text-lg font-bold">{displayedText}</p>;
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
          container: "bg-white text-slate-900 font-sans min-h-[1123px] flex",
          sidebar: "w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col p-10 gap-10",
          main: "flex-1 p-12 flex flex-col gap-12",
          name: "text-4xl font-black mb-1 uppercase tracking-tight",
          role: "text-sm font-bold tracking-[0.2em] uppercase opacity-40 mb-10",
          sectionTitle: "text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 after:content-[''] after:h-[1px] after:flex-1",
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
                      {p.highlights?.map((h, j) => (
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
                      {(Array.isArray(val) ? val : [val]).map((s, idx) => (
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
                    {(Array.isArray(val) ? val : [val]).map((s, idx) => (
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
              {data.languages?.map((l, i) => (
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
                    {p.highlights?.map((h, j) => (
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
                    {p.highlights?.map((h, j) => (
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
                      {(Array.isArray(val) ? val : [val]).map((s, idx) => (
                        <span key={idx} className="text-xs font-bold">{s}{idx < (Array.isArray(val) ? val.length : 1) - 1 ? ',' : ''}</span>
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
