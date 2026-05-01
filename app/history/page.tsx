'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Plus,
  Loader2
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ResumeRecord {
  id: string;
  data: any;
  template_id: string;
  accent_color: string;
  created_at: string;
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      fetchHistory(user.id);
    };
    checkUser();
  }, [router]);

  const fetchHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch history: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResumes(resumes.filter(r => r.id !== id));
      toast.success("Resume deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  const handleEdit = (resume: ResumeRecord) => {
    // Store the resume data in localStorage to be picked up by the main page
    localStorage.setItem('editing_resume', JSON.stringify({
      id: resume.id,
      data: resume.data,
      template: resume.template_id,
      accentColor: resume.accent_color
    }));
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Builder
            </Link>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              Resume History
            </h1>
            <p className="text-slate-500 font-medium mt-2">Manage and edit your previously generated resumes.</p>
          </div>

          <Link href="/" className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5" />
            Create New Resume
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No resumes found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">You haven&apos;t generated any resumes yet. Start building one now!</p>
            <Link href="/" className="inline-block mt-8 text-blue-600 font-bold hover:underline">
              Start Building →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div 
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(resume)}
                      className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Resume"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                    {resume.data.name || "Untitled Resume"}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    {resume.data.target_role || "No Role Specified"}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: resume.accent_color }}
                    />
                    {resume.template_id} Template
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(resume.created_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <button 
                    onClick={() => handleEdit(resume)}
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:gap-2 transition-all"
                  >
                    Open <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
