import React from "react";
import { Mail, Phone, MapPin, Link } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
  accentColor: string;
}

export function ModernTemplate({ data, accentColor }: TemplateProps) {
  const styles = {
    container: "bg-white text-slate-900 font-sans min-h-[1123px] flex flex-col",
    header:
      "bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-center gap-6",
    main: "p-6 grid grid-cols-12 gap-8",
    left: "col-span-8 space-y-6",
    right: "col-span-4 space-y-6",
    name: "text-5xl font-black tracking-tighter uppercase",

    role: "text-xl font-bold tracking-tight opacity-70",
    sectionTitle:
      "text-xl font-black mb-4 uppercase tracking-tight border-b-2 pb-2",
  };

  return (
    <div className={styles.container}>
      <header
        className={styles.header}
        style={{ borderBottom: `8px solid ${accentColor}` }}
      >
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className={styles.name}>{data.name}</h1>
          <p className={styles.role}>{data.target_role}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm font-bold uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" /> {data.email}
          </span>
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" /> {data.phone}
          </span>
          {data.location && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" /> {data.location}
            </span>
          )}
          {data.linkedin && (
            <span className="flex items-center gap-2 break-all">
              <Link className="w-4 h-4 shrink-0" />{" "}
              {data.linkedin.replace("https://", "").replace("www.", "")}
            </span>
          )}
          {data.portfolio && (
            <span className="flex items-center gap-2 break-all">
              <Link className="w-4 h-4 shrink-0" />{" "}
              {data.portfolio.replace("https://", "").replace("www.", "")}
            </span>
          )}
          {data.github && (
            <span className="flex items-center gap-2 break-all">
              <Link className="w-4 h-4 shrink-0" />{" "}
              {data.github.replace("https://", "").replace("www.", "")}
            </span>
          )}
          {data.twitter && (
            <span className="flex items-center gap-2 break-all">
              <Link className="w-4 h-4 shrink-0" />{" "}
              {data.twitter.replace("https://", "").replace("www.", "")}
            </span>
          )}
        </div>
      </header>
      <div className={styles.main}>
        <div className={styles.left}>
          <section>
            <h2
              className={styles.sectionTitle}
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Summary
            </h2>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              {data.objective}
            </p>
          </section>
          <section>
            <h2
              className={styles.sectionTitle}
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Experience
            </h2>
            <div className="space-y-6">
              {data.projects?.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-lg uppercase tracking-tight">
                        {p.title}
                      </h3>
                      {p.link && (
                        <a
                          href={
                            p.link.startsWith("http")
                              ? p.link
                              : `https://${p.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold underline opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest mt-1"
                        >
                          [Live Demo]
                        </a>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-black uppercase px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-right max-w-[50%] leading-relaxed"
                      style={{ color: accentColor }}
                    >
                      {p.technologies}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {p.highlights
                      ?.filter((h) => h.trim())
                      .map((h, j) => (
                        <li
                          key={j}
                          className="flex gap-3 text-sm font-medium text-slate-600"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: accentColor }}
                          />

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
          {data.skills && Object.keys(data.skills).length > 0 && (
            <section>
              <h2
                className={styles.sectionTitle}
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Skills
              </h2>
              <div className="space-y-3">
                {Object.entries(data.skills || {}).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">
                      {key}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(val) ? val : [])
                        .filter((s) => s.trim())
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-slate-100"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.languages && data.languages.length > 0 && (
            <section>
              <h2
                className={styles.sectionTitle}
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.languages
                  .filter((l) => l.trim())
                  .map((l, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-slate-100"
                    >
                      {l}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section>
              <h2
                className={styles.sectionTitle}
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {data.education?.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-black text-sm uppercase">{e.degree}</h3>
                    <p className="text-xs font-bold opacity-40 italic">
                      {e.institution}
                    </p>
                    <p
                      className="text-[10px] font-black mt-1"
                      style={{ color: accentColor }}
                    >
                      {e.year}
                    </p>
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
