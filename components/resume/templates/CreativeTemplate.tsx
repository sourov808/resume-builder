import React from "react";
import { Mail, Phone, MapPin, Link } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}

export function CreativeTemplate({ data, accentColor }: TemplateProps) {
  const styles = {
    container: "bg-white text-slate-900 font-sans min-h-[1123px] flex",
    sidebar: "w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col p-5 gap-6",
    main: "flex-1 p-5 flex flex-col gap-6",
    name: "text-5xl font-black mb-1 uppercase tracking-tight",

    role: "text-base font-bold tracking-[0.2em] uppercase opacity-40 mb-10",
    sectionTitle: "text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200",
  };


  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto overflow-hidden border-4" style={{ borderColor: accentColor }}>
          {data.profile_image ? (
            <img src={data.profile_image} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-400">
              {data.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </div>
        <section>
          <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Contact</h2>
          <div className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-60">
            <p className="flex items-center gap-2 break-all"><Mail className="w-3 h-3 shrink-0" /> {data.email}</p>
            <p className="flex items-center gap-2"><Phone className="w-3 h-3 shrink-0" /> {data.phone}</p>
            {data.location && <p className="flex items-center gap-2"><MapPin className="w-3 h-3 shrink-0" /> {data.location}</p>}
            {data.linkedin && <p className="flex items-center gap-2 break-all"><Link className="w-3 h-3 shrink-0" /> {data.linkedin.replace('https://', '').replace('www.', '')}</p>}
            {data.portfolio && <p className="flex items-center gap-2 break-all"><Link className="w-3 h-3 shrink-0" /> {data.portfolio.replace('https://', '').replace('www.', '')}</p>}
            {data.github && <p className="flex items-center gap-2 break-all"><Link className="w-3 h-3 shrink-0" /> {data.github.replace('https://', '').replace('www.', '')}</p>}
            {data.twitter && <p className="flex items-center gap-2 break-all"><Link className="w-3 h-3 shrink-0" /> {data.twitter.replace('https://', '').replace('www.', '')}</p>}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Expertise</h2>
          <div className="space-y-4">
            {Object.entries(data.skills || {}).map(([key, val]) => (
              <div key={key}>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1">{key}</p>
                <div className="space-y-2">
                  {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase">{s}</span>
                      <div className="w-10 h-1 rounded-full bg-slate-200 overflow-hidden">
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
        <div className="mb-6">
          <h1 className={styles.name} style={{ color: accentColor }}>{data.name}</h1>
          <p className={styles.role}>{data.target_role}</p>
          <p className="text-sm font-medium leading-relaxed text-slate-500 italic mt-4">{data.objective}</p>
        </div>
        <section>
          <h2 className={styles.sectionTitle} style={{ color: accentColor }}>Work Experience</h2>
          <div className="space-y-6">
            {data.projects?.map((p, i) => (
              <div key={i} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100">
                <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                <div className="flex justify-between items-start mb-2 gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-black text-xl uppercase tracking-tight">{p.title}</h3>
                    {p.link && (
                      <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold underline opacity-60 hover:opacity-100 transition-opacity mt-1.5">
                        [Live Demo]
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-50 rounded-full text-right max-w-[50%] leading-relaxed" style={{ color: accentColor }}>{p.technologies}</span>
                </div>
                <ul className="space-y-1.5">
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
