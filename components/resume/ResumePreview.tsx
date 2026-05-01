"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { ModernTemplate } from "./templates/ModernTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";

const A4_HEIGHT_PX = 1123; // Standard A4 height at 96 DPI

interface ResumePreviewProps {
  data: ResumeData | null;
  template: string;
  accentColor: string;
}

export function ResumePreview({ data, template, accentColor }: ResumePreviewProps) {
  const [scale, setScale] = React.useState(1);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!contentRef.current) return;
    
    // Create a ResizeObserver to continuously monitor content height changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        // If content is taller than A4, scale it down. Otherwise, keep at 1.
        if (height > A4_HEIGHT_PX) {
          setScale(A4_HEIGHT_PX / height);
        } else {
          setScale(1);
        }
      }
    });

    resizeObserver.observe(contentRef.current);
    
    return () => resizeObserver.disconnect();
  }, [data, template]); // Re-run when data or template changes

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-20">
      <div className="animate-spin"><RotateCcw /></div>
      <p className="font-bold uppercase tracking-widest text-xs">Generating Preview...</p>
    </div>
  );

  const renderTemplateContent = () => {
    switch (template) {
      case "Creative":
        return <CreativeTemplate data={data} accentColor={accentColor} />;
      case "Professional":
        return <ProfessionalTemplate data={data} accentColor={accentColor} />;
      case "Minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} />;
      case "Modern":
      default:
        return <ModernTemplate data={data} accentColor={accentColor} />;
    }
  };

  return (
    <div 
      id="resume-preview" 
      className="resume-page w-full bg-white overflow-hidden flex justify-center"
      style={{ height: `${A4_HEIGHT_PX}px` }} 
    >
      <div 
        ref={contentRef}
        className="origin-top w-full"
        style={{ zoom: scale } as React.CSSProperties}
      >
        {renderTemplateContent()}
      </div>
    </div>
  );
}



