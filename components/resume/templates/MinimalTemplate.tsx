import React from "react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}

export function MinimalTemplate({ data, accentColor }: TemplateProps) {
  const styles = {
    container: "bg-white text-neutral-900 font-mono min-h-[1123px] p-8 flex flex-col gap-6",
    header: "mb-4",
    name: "text-4xl font-black mb-2 uppercase tracking-tight",
    role: "text-sm font-bold tracking-[0.2em] uppercase text-neutral-400 mb-4",
    sectionTitle: "text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-neutral-200",
  };



  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.name}>{data.name}</h1>
        <p className={styles.role} style={{ color: accentColor }}>{data.target_role}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase opacity-40">
          <span>{data.email}</span>
          <span>{data.phone}</span>
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin.replace('https://', '').replace('www.', '')}</span>}
          {data.portfolio && <span>{data.portfolio.replace('https://', '').replace('www.', '')}</span>}
          {data.github && <span>{data.github.replace('https://', '').replace('www.', '')}</span>}
          {data.twitter && <span>{data.twitter.replace('https://', '').replace('www.', '')}</span>}
        </div>

      </header>

      <div className="space-y-6">
        {data.objective && (
          <section className="relative pl-12">
            <h2 className={styles.sectionTitle}>
              <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
              Summary
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">{data.objective}</p>
          </section>
        )}


        {data.projects && (
          <section className="relative pl-12">
            <h2 className={styles.sectionTitle}>
              <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
              Experience
            </h2>
            <div className="space-y-5">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-lg uppercase tracking-tight text-neutral-800">{p.title}</h3>
                      {p.link && (
                        <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold underline opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest mt-1">
                          [Live Demo]
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-right max-w-[50%] leading-relaxed">{p.technologies}</span>
                  </div>
                  <ul className="space-y-1">
                    {p.highlights?.filter(h => h.trim()).map((h, j) => (
                      <li key={j} className="text-sm flex gap-3 text-neutral-600">
                        <span className="text-sm leading-none mt-0.5" style={{ color: accentColor }}>&bull;</span>
                        {h}
                      </li>
                    ))}
                  </ul>

                </div>
              ))}
            </div>
          </section>

        )}

        <div className="grid grid-cols-2 gap-6 relative pl-12">
          <div className="space-y-6">
            {data.skills && (
              <section>
                <h2 className={styles.sectionTitle}>
                  <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
                  Skills
                </h2>
                <div className="space-y-3">
                  {Object.entries(data.skills).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">{key}</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(val) ? val : []).filter(s => s.trim()).map((s, idx) => (
                          <span key={idx} className="text-[11px] font-semibold text-neutral-700">{s}{idx < (Array.isArray(val) ? val.filter(item => item.trim()).length : 1) - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                    </div>
                  ))}

                </div>
              </section>
            )}

            {data.languages && data.languages.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>
                  <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.languages.filter(l => l.trim()).map((l, i) => (
                    <span key={i} className="text-[11px] font-semibold text-neutral-700">{l}{i < data.languages!.filter(item => item.trim()).length - 1 ? ',' : ''}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {data.education && (
            <section>
              <h2 className={styles.sectionTitle}>
                <span className="w-8 h-px absolute left-0 top-2" style={{ backgroundColor: accentColor }} />
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-black text-sm uppercase text-neutral-800">{e.degree}</h3>
                    <p className="text-xs font-bold opacity-60">{e.institution}</p>
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
