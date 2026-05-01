import AuthForm from "@/components/AuthForm";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>
      
      <div className="w-full flex flex-col items-center">
        <Link href="/" className="flex items-center gap-3 mb-10 group transition-all">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">ResumeBuilder</span>
        </Link>
        
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
