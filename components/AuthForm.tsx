"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ChevronRight, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!", {
          description: "Successfully signed in to your account."
        });
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: email.split('@')[0] }
          }
        });
        if (error) throw error;
        toast.info("Verification Required", {
          description: "Please check your email to verify your account.",
          duration: 10000,
        });
        router.push("/login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      toast.error("Authentication Error", {
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-xl"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {mode === "login" ? "Sign in to your account to continue" : "Join us to build your professional resume"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-900 transition-all text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-900 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <button 
            disabled={isLoading}
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Sign Up"}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-8">
          <p className="text-xs font-medium text-slate-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <Link 
              href={mode === "login" ? "/signup" : "/login"}
              className="text-blue-600 font-bold hover:underline underline-offset-4"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
