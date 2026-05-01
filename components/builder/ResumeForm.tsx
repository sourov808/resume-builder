"use client";

import React from "react";
import {
  Plus,
  Trash2,
  X,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/types/resume";

interface ResumeFormProps {
  activeFormStep: number;
  setActiveFormStep: React.Dispatch<React.SetStateAction<number>>;
  resumeData: ResumeData;
  updateResumeData: (path: string, value: unknown) => void;
  hasPracticeProjects: boolean;
  setHasPracticeProjects: React.Dispatch<React.SetStateAction<boolean>>;
  showBulkAdd: Record<string, boolean>;
  setShowBulkAdd: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  bulkSkills: Record<string, string>;
  setBulkSkills: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleBulkAdd: (category: string) => void;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageUpload: (file: File) => void;
  isLoading: boolean;
  handleSynthesize: () => void;
}

// Helper components for the form
const SectionHeader = ({ title, desc }: { title: string; desc: string }) => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
      {title}
    </h2>
    <p className="text-sm text-slate-500 font-medium mt-1">{desc}</p>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 ml-1">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-standard"
    />
  </div>
);

export function ResumeForm({
  activeFormStep,
  setActiveFormStep,
  resumeData,
  updateResumeData,
  hasPracticeProjects,
  setHasPracticeProjects,
  showBulkAdd,
  setShowBulkAdd,
  bulkSkills,
  setBulkSkills,
  handleBulkAdd,
  isDragging,
  setIsDragging,
  handleImageUpload,
  isLoading,
  handleSynthesize,
}: ResumeFormProps) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        {activeFormStep === 0 && (
          <div className="space-y-8">
            <SectionHeader
              title="Contact Information"
              desc="Provide your basic details so employers can reach you."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField
                label="Full Name"
                value={resumeData.name}
                onChange={(v) => updateResumeData("name", v)}
                placeholder="John Doe"
              />
              <InputField
                label="Target Job Title"
                value={resumeData.target_role}
                onChange={(v) => updateResumeData("target_role", v)}
                placeholder="Senior Product Designer"
              />
              <InputField
                label="Email Address"
                value={resumeData.email}
                onChange={(v) => updateResumeData("email", v)}
                placeholder="john.doe@example.com"
              />
              <InputField
                label="Phone Number"
                value={resumeData.phone}
                onChange={(v) => updateResumeData("phone", v)}
                placeholder="+1 (555) 000-0000"
              />
              <InputField
                label="Location"
                value={resumeData.location || ""}
                onChange={(v) => updateResumeData("location", v)}
                placeholder="New York, NY"
              />
              <InputField
                label="LinkedIn URL"
                value={resumeData.linkedin || ""}
                onChange={(v) => updateResumeData("linkedin", v)}
                placeholder="linkedin.com/in/johndoe"
              />
              <div className="md:col-span-2">
                <InputField
                  label="Portfolio URL / Website"
                  value={resumeData.portfolio || ""}
                  onChange={(v) => updateResumeData("portfolio", v)}
                  placeholder="johndoe.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Professional Summary
              </label>
              <textarea
                value={resumeData.objective}
                onChange={(e) => updateResumeData("objective", e.target.value)}
                placeholder="Write a brief overview of your professional background and key achievements..."
                className="textarea-standard"
              />
            </div>
          </div>
        )}

        {activeFormStep === 1 && (
          <div className="space-y-8">
            <SectionHeader
              title="Skills & Expertise"
              desc="Highlight your core competencies and technical skills."
            />
            <div className="space-y-10">
              {Object.entries(resumeData.skills || {}).map(
                ([category, list]) => (
                  <div
                    key={category}
                    className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {category}
                      </label>
                      <button
                        onClick={() =>
                          setShowBulkAdd((prev) => ({
                            ...prev,
                            [category]: !prev[category],
                          }))
                        }
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />{" "}
                        {showBulkAdd[category]
                          ? "Close Bulk Add"
                          : "Bulk Add Skills"}
                      </button>
                    </div>

                    {showBulkAdd[category] ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <textarea
                          value={bulkSkills[category] || ""}
                          onChange={(e) =>
                            setBulkSkills((prev) => ({
                              ...prev,
                              [category]: e.target.value,
                            }))
                          }
                          placeholder="Paste skills separated by commas or new lines (e.g. React, TypeScript, Node.js)"
                          className="textarea-standard min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBulkAdd(category)}
                            className="btn-primary py-2 px-4 text-xs"
                          >
                            Add All
                          </button>
                          <button
                            onClick={() =>
                              setShowBulkAdd((prev) => ({
                                ...prev,
                                [category]: false,
                              }))
                            }
                            className="btn-secondary py-2 px-4 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(list) ? list : []).map((skill, idx) => (
                          <div key={idx} className="group relative">
                            <input
                              value={skill}
                              onChange={(e) => {
                                const newList = [
                                  ...(Array.isArray(list) ? list : []),
                                ];
                                newList[idx] = e.target.value;
                                updateResumeData(`skills.${category}`, newList);
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600 min-w-[140px]"
                            />
                            <button
                              onClick={() => {
                                const newList = (
                                  Array.isArray(list) ? list : []
                                ).filter((_, i) => i !== idx);
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
                            const newList = [
                              ...(Array.isArray(list) ? list : []),
                              "",
                            ];
                            updateResumeData(`skills.${category}`, newList);
                          }}
                          className="px-4 py-2 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-600 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all flex items-center gap-2 bg-white"
                        >
                          <Plus className="w-4 h-4" /> Add One
                        </button>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {activeFormStep === 2 && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <SectionHeader
                title={
                  resumeData.is_beginner
                    ? "Practice & Academic Projects"
                    : "Work Experience"
                }
                desc={
                  resumeData.is_beginner
                    ? "Showcase projects you've built during study or self-learning."
                    : "List your most relevant professional projects and roles."
                }
              />
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors w-full sm:w-auto">
                  <input
                    type="checkbox"
                    checked={resumeData.is_beginner}
                    onChange={(e) => {
                      updateResumeData("is_beginner", e.target.checked);
                      if (!e.target.checked) setHasPracticeProjects(false);
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    I am a beginner / No experience
                  </span>
                </label>
                {(!resumeData.is_beginner ||
                  (resumeData.is_beginner && hasPracticeProjects)) && (
                  <button
                    onClick={() =>
                      updateResumeData("projects", [
                        ...(resumeData.projects || []),
                        { title: "", technologies: "", highlights: [""] },
                      ])
                    }
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />{" "}
                    {resumeData.is_beginner ? "Add Project" : "Add Experience"}
                  </button>
                )}
              </div>
            </div>

            {resumeData.is_beginner && !hasPracticeProjects && (
              <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-lg font-bold text-slate-900">
                    Focus on Projects & Skills
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 font-medium">
                    No worries! Since you&apos;re just starting, our AI will
                    emphasize your **Academic Projects**, **Education**, and
                    **Skills** to make your resume stand out.
                  </p>
                </div>
                <div className="pt-4 border-t border-blue-100 w-full max-w-xs">
                  <label className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-blue-200 rounded-xl cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm group">
                    <input
                      type="checkbox"
                      checked={hasPracticeProjects}
                      onChange={(e) => setHasPracticeProjects(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                      I have practice projects to add
                    </span>
                  </label>
                </div>
              </div>
            )}

            {(!resumeData.is_beginner ||
              (resumeData.is_beginner && hasPracticeProjects)) && (
              <div className="space-y-8">
                {(resumeData.projects || []).map((project, pIdx) => (
                  <div
                    key={pIdx}
                    className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative space-y-6"
                  >
                    <button
                      onClick={() =>
                        updateResumeData(
                          "projects",
                          (resumeData.projects || []).filter(
                            (_, i) => i !== pIdx,
                          ),
                        )
                      }
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <InputField
                        label={
                          resumeData.is_beginner
                            ? "Project Title"
                            : "Company / Role Title"
                        }
                        value={project.title}
                        onChange={(v) => {
                          const newList = [...(resumeData.projects || [])];
                          newList[pIdx].title = v;
                          updateResumeData("projects", newList);
                        }}
                        placeholder={
                          resumeData.is_beginner
                            ? "e.g. Personal Portfolio"
                            : "e.g. Google / Senior Engineer"
                        }
                      />
                      <InputField
                        label="Key Technologies"
                        value={project.technologies}
                        onChange={(v) => {
                          const newList = [...(resumeData.projects || [])];
                          newList[pIdx].technologies = v;
                          updateResumeData("projects", newList);
                        }}
                        placeholder="e.g. React, TypeScript, Node.js"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <input
                        type="checkbox"
                        id={`project-current-${pIdx}`}
                        checked={project.is_current}
                        onChange={(e) => {
                          const newList = [...(resumeData.projects || [])];
                          newList[pIdx].is_current = e.target.checked;
                          updateResumeData("projects", newList);
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <label
                        htmlFor={`project-current-${pIdx}`}
                        className="text-sm font-semibold text-slate-600 cursor-pointer"
                      >
                        {resumeData.is_beginner
                          ? "I am currently working on this project"
                          : "I am currently in this role"}
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {resumeData.is_beginner
                          ? "Project Highlights & Features"
                          : "Achievements & Responsibilities"}
                      </label>
                      {project.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex gap-2">
                          <textarea
                            value={h}
                            onChange={(e) => {
                              const newList = [...(resumeData.projects || [])];
                              newList[pIdx].highlights[hIdx] = e.target.value;
                              updateResumeData("projects", newList);
                            }}
                            className="textarea-standard flex-1 min-h-[60px] py-2"
                            placeholder={
                              resumeData.is_beginner
                                ? "Implemented real-time chat using Socket.io..."
                                : "Managed a team of 5 engineers..."
                            }
                          />
                          <button
                            onClick={() => {
                              const newList = [...(resumeData.projects || [])];
                              newList[pIdx].highlights = newList[
                                pIdx
                              ].highlights.filter((_, i) => i !== hIdx);
                              updateResumeData("projects", newList);
                            }}
                            className="pt-2 text-slate-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newList = [...(resumeData.projects || [])];
                          newList[pIdx].highlights.push("");
                          updateResumeData("projects", newList);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Add Point
                      </button>
                    </div>
                  </div>
                ))}
                {resumeData.is_beginner && (
                  <button
                    onClick={() => setHasPracticeProjects(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Back to Beginner Guide
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeFormStep === 3 && (
          <div className="space-y-12">
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <SectionHeader
                  title="Education"
                  desc="Detail your academic background and degrees."
                />
                <button
                  onClick={() =>
                    updateResumeData("education", [
                      ...(resumeData.education || []),
                      { degree: "", institution: "", year: "", location: "" },
                    ])
                  }
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
              <div className="space-y-6">
                {(resumeData.education || []).map((edu, eIdx) => (
                  <div
                    key={eIdx}
                    className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
                  >
                    <button
                      onClick={() =>
                        updateResumeData(
                          "education",
                          (resumeData.education || []).filter(
                            (_, i) => i !== eIdx,
                          ),
                        )
                      }
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <InputField
                      label="Degree / Certificate"
                      value={edu.degree}
                      onChange={(v) => {
                        const newList = [...(resumeData.education || [])];
                        newList[eIdx].degree = v;
                        updateResumeData("education", newList);
                      }}
                      placeholder="B.S. in Computer Science"
                    />
                    <InputField
                      label="Institution"
                      value={edu.institution}
                      onChange={(v) => {
                        const newList = [...(resumeData.education || [])];
                        newList[eIdx].institution = v;
                        updateResumeData("education", newList);
                      }}
                      placeholder="University of Oxford"
                    />
                    <InputField
                      label="Time Period / Graduation"
                      value={edu.year}
                      onChange={(v) => {
                        const newList = [...(resumeData.education || [])];
                        newList[eIdx].year = v;
                        updateResumeData("education", newList);
                      }}
                      placeholder="2018 - 2022"
                    />
                    <div className="flex flex-col gap-4">
                      <InputField
                        label="Location"
                        value={edu.location}
                        onChange={(v) => {
                          const newList = [...(resumeData.education || [])];
                          newList[eIdx].location = v;
                          updateResumeData("education", newList);
                        }}
                        placeholder="London, UK"
                      />
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={edu.is_current}
                          onChange={(e) => {
                            const newList = [...(resumeData.education || [])];
                            newList[eIdx].is_current = e.target.checked;
                            updateResumeData("education", newList);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          Currently studying here
                        </span>
                      </label>
                    </div>
                    {edu.is_current && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                        <InputField
                          label="Current Year / Semester"
                          value={edu.current_year || ""}
                          onChange={(v) => {
                            const newList = [...(resumeData.education || [])];
                            newList[eIdx].current_year = v;
                            updateResumeData("education", newList);
                          }}
                          placeholder="e.g. 3rd Year / 6th Semester"
                        />
                        <InputField
                          label="Expected Graduation"
                          value={edu.expected_graduation || ""}
                          onChange={(v) => {
                            const newList = [...(resumeData.education || [])];
                            newList[eIdx].expected_graduation = v;
                            updateResumeData("education", newList);
                          }}
                          placeholder="e.g. June 2026"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeFormStep === 4 && (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <SectionHeader
                title="Profile Image"
                desc="Add a professional photo to your resume."
              />
              <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Optional
              </div>
            </div>

            <div className="flex flex-col items-center space-y-8 py-6">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-blue-100">
                  {resumeData.profile_image ? (
                    <img
                      src={resumeData.profile_image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                {resumeData.profile_image && (
                  <button
                    onClick={() => updateResumeData("profile_image", "")}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {!resumeData.profile_image ? (
                <div
                  className={cn(
                    "w-full max-w-xl border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center text-center space-y-4 cursor-pointer",
                    isDragging
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/"))
                      handleImageUpload(file);
                  }}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Drag and drop your photo here
                    </h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      or click to browse from your device
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-4">
                    <span>JPG, PNG, GIF</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Max size 2MB</span>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Image selected
                    successfully
                  </div>
                  <button
                    onClick={() => setActiveFormStep(5)}
                    className="text-blue-600 font-bold text-sm hover:underline"
                  >
                    Continue to next step →
                  </button>
                </div>
              )}

              {!resumeData.profile_image && (
                <div className="flex flex-col items-center gap-4 pt-4">
                  <p className="text-sm text-slate-400 font-medium">
                    Don&apos;t want to add a photo?
                  </p>
                  <button
                    onClick={() => setActiveFormStep(5)}
                    className="btn-secondary px-8 py-3 text-sm flex items-center gap-2"
                  >
                    Skip & Build Without Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeFormStep === 5 && (
          <div className="space-y-10 py-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="max-w-md space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Ready for Optimization?
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Review your information and let our AI optimize the wording for
                maximum professional impact.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveFormStep(4)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back to Check
              </button>
              <button
                onClick={handleSynthesize}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? "Processing..." : "Generate Professional Resume"}{" "}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {activeFormStep < 5 && (
        <div className="p-8 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <button
            onClick={() => setActiveFormStep((s) => Math.max(0, s - 1))}
            disabled={activeFormStep === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setActiveFormStep((s) => Math.min(5, s + 1))}
            className="btn-primary flex items-center gap-2"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
