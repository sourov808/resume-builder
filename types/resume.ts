export interface Project {
  title: string;
  technologies: string;
  highlights: string[];
  is_current?: boolean;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  location: string;
  is_current?: boolean;
  current_year?: string;
  expected_graduation?: string;
}

export interface ResumeData {
  name: string;
  target_role: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  objective?: string;
  skills?: Record<string, string[] | string>;
  languages?: string[];
  certifications?: { name: string; issuer: string; year: string }[];
  awards?: { title: string; issuer: string; year: string }[];
  projects?: Project[];
  education?: Education[];
  profile_image?: string;
  is_beginner?: boolean;
}

export const STEPS = [
  { id: 0, title: "Identity", icon: "User" },
  { id: 1, title: "Skills", icon: "Zap" },
  { id: 2, title: "Experience", icon: "Briefcase" },
  { id: 3, title: "Education", icon: "GraduationCap" },
  { id: 4, title: "Profile Image", icon: "ImagePlus" },
  { id: 5, title: "Ready", icon: "Sparkles" },
];

export const TEMPLATES = [
  { id: "Modern", label: "Modern", desc: "Professional sans-serif layout.", color: "bg-blue-600", image: "/templates/modern.png" },
  { id: "Professional", label: "Professional", desc: "Classic serif executive style.", color: "bg-slate-800", image: "/templates/professional.png" },
  { id: "Creative", label: "Creative", desc: "Clean sidebar design.", color: "bg-indigo-600", image: "/templates/creative.png" },
  { id: "Minimal", label: "Minimal", desc: "Clean mono-spaced aesthetic.", color: "bg-slate-400", image: "/templates/minimal.png" },
] as const;

export const ACCENT_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Black", value: "#0f172a" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Slate", value: "#475569" },
  { name: "Indigo", value: "#4f46e5" },
];
