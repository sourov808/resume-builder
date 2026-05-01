import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}

export function CreativeTemplate({ data, accentColor }: TemplateProps) {
  const styles = {
    container: "bg-white text-slate-900 font-sans min-h-[1123px] flex",
    sidebar: "w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col p-8 gap-8",
    main: "flex-1 p-8 flex flex-col gap-8",
    name: "text-5xl font-black mb-1 uppercase tracking-tight",

    role: "text-base font-bold tracking-[0.2em] uppercase opacity-40 mb-10",
    sectionTitle: "text-sm font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200",
  };


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
          <div className="space-y-4 text-xs font-bold uppercase tracking-widest opacity-60">
            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {data.email}</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {data.phone}</p>
            {data.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {data.location}</p>}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Expertise</h2>
          <div className="space-y-6">
            {Object.entries(data.skills || {}).map(([key, val]) => (
              <div key={key}>
                <p className="text-[10px] font-black uppercase opacity-40 mb-2">{key}</p>
                <div className="space-y-3">
                  {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase">{s}</span>
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
          <p className="text-base font-medium leading-relaxed text-slate-500 italic mt-6">{data.objective}</p>
        </div>
        <section>
          <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Work Experience</h2>
          <div className="space-y-10">
            {data.projects?.map((p, i) => (
              <div key={i} className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100">
                <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-2xl uppercase tracking-tight">{p.title}</h3>
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-50 rounded-full" style={{ color: accentColor }}>{p.technologies}</span>
                </div>
                <ul className="space-y-3">
                  {p.highlights?.filter(h => h.trim()).map((h, j) => (
                    <li key={j} className="text-base font-medium text-slate-600 leading-relaxed">{h}</li>
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
