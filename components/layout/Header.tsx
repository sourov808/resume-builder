"use client";

import React from "react";
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  User, 
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HeaderProps {
  step: string;
  setStep: (step: "landing" | "form" | "preview") => void;
  user: SupabaseUser | null;
}

export function Header({ step, setStep, user }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        {step !== "landing" && (
          <button 
            onClick={() => setStep("landing")}
            className="mr-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Landing"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
        )}
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900">ResumeBuilder</span>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6 mr-6 border-r border-slate-200 pr-6">
          <Link href="/history" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 group">
            <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            History
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account</span>
                <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user.email}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Signed out successfully");
                }} 
                className="ml-2 p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/login")} 
              className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
