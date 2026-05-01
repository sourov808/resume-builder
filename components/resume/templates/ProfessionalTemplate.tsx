import React from "react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}

export function ProfessionalTemplate({ data, accentColor }: TemplateProps) {
  const styles = {
    container: "bg-white text-zinc-900 font-serif min-h-[1123px] p-8 flex flex-col",
    header: "text-center mb-8 border-b border-zinc-200 pb-8",
    name: "text-5xl font-black uppercase tracking-[0.2em] mb-4",

    role: "text-xl font-bold tracking-widest uppercase italic text-zinc-500",
    sectionTitle: "text-base font-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-900 pb-1 inline-block",
  };


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.name}>{data.name}</h1>
        <p className={styles.role} style={{ color: accentColor }}>{data.target_role}</p>
        <div className="flex justify-center gap-10 mt-6 text-xs font-bold uppercase tracking-[0.2em] opacity-60">
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

      <div className="space-y-8">

        {data.objective && (
          <section>
            <h2 className={styles.sectionTitle} style={{ borderColor: accentColor }}>
              Summary
            </h2>
            <p className="text-base leading-relaxed text-slate-700 font-medium">{data.objective}</p>
          </section>
        )}


        {data.projects && (
          <section>
            <h2 className={styles.sectionTitle} style={{ borderColor: accentColor }}>
              Experience
            </h2>
            <div className="space-y-10">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="font-black text-xl uppercase tracking-tight">{p.title}</h3>
                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{p.technologies}</span>
                  </div>
                  <ul className="space-y-2">
                    {p.highlights?.filter(h => h.trim()).map((h, j) => (
                      <li key={j} className="text-base flex gap-3 text-slate-700 font-medium">
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
              <h2 className={styles.sectionTitle} style={{ borderColor: accentColor }}>
                Skills
              </h2>
              <div className="space-y-4">
                {Object.entries(data.skills).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs font-black uppercase opacity-40 mb-2">{key}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                        <span key={idx} className="text-sm font-bold">{s}{idx < (Array.isArray(val) ? val.filter(item => item.trim()).length : 1) - 1 ? ',' : ''}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </section>
          )}

          {data.education && (
            <section>
              <h2 className={styles.sectionTitle} style={{ borderColor: accentColor }}>
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-black text-base uppercase">{e.degree}</h3>
                    <p className="text-sm font-bold opacity-40">{e.institution}</p>
                    <p className="text-xs font-black mt-1" style={{ color: accentColor }}>{e.year}</p>
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
