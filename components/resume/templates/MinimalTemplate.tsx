import React from "react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}

export function MinimalTemplate({ data, accentColor }: TemplateProps) {
  const styles = {
    container: "bg-white text-neutral-900 font-mono min-h-[1123px] p-10 flex flex-col gap-8",
    header: "mb-6",
    name: "text-4xl font-black mb-2 uppercase tracking-tight",
    role: "text-sm font-bold tracking-[0.2em] uppercase text-neutral-400 mb-4",
    sectionTitle: "text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-neutral-200",
  };



  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.name}>{data.name}</h1>
        <p className={styles.role} style={{ color: accentColor }}>{data.target_role}</p>
        <div className="flex gap-6 text-xs font-bold uppercase opacity-40">
          <span>{data.email}</span>
          <span>{data.phone}</span>
          {data.location && <span>{data.location}</span>}
        </div>

      </header>

      <div className="space-y-8">
        {data.objective && (
          <section className="relative pl-12">
            <h2 className={styles.sectionTitle}>
              <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
              Summary
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">{data.objective}</p>
          </section>
        )}


        {data.projects && (
          <section className="relative pl-12">
            <h2 className={styles.sectionTitle}>
              <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
              Experience
            </h2>
            <div className="space-y-8">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-black text-xl uppercase tracking-tight text-neutral-800">{p.title}</h3>
                    <span className="text-xs font-bold opacity-50 uppercase tracking-widest">{p.technologies}</span>
                  </div>
                  <ul className="space-y-2">
                    {p.highlights?.filter(h => h.trim()).map((h, j) => (
                      <li key={j} className="text-base flex gap-3 text-neutral-600">
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

        <div className="grid grid-cols-2 gap-8 relative pl-12">
          {data.skills && (
            <section>
              <h2 className={styles.sectionTitle}>
                <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
                Skills
              </h2>
              <div className="space-y-4">
                {Object.entries(data.skills).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs font-black uppercase opacity-60 mb-1">{key}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                        <span key={idx} className="text-sm font-semibold text-neutral-700">{s}{idx < (Array.isArray(val) ? val.filter(item => item.trim()).length : 1) - 1 ? ',' : ''}</span>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </section>
          )}

          {data.education && (
            <section>
              <h2 className={styles.sectionTitle}>
                <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-black text-base uppercase text-neutral-800">{e.degree}</h3>
                    <p className="text-sm font-bold opacity-60">{e.institution}</p>
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
