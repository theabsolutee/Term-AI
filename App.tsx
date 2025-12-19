
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeStudyMaterial } from './services/geminiService';
import { exportToPdf } from './services/pdfExportService';
import { AnalysisResult, Theme } from './types';
import { 
  CloudArrowUpIcon, 
  SunIcon, 
  MoonIcon, 
  ArrowDownTrayIcon, 
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initial state check for SSR safety and immediate load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Single Source of Truth for Theme application
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeStudyMaterial(base64, file.name);
          setResult(analysis);
        } catch (err: any) {
          setError(err.message || 'An error occurred during analysis.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read the file.');
      setIsAnalyzing(false);
    }
  };

  const handleExport = useCallback(() => {
    if (result) {
      exportToPdf(result, theme);
    }
  }, [result, theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Term <span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            Master Your Studies with <br/><span className="text-indigo-600">AI Precision</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Upload your lecture notes, PDFs, or research papers. We'll extract the core concepts and definitions automatically.
          </p>
        </div>

        {/* Upload Box */}
        {!result && !isAnalyzing && (
          <div className="relative group animate-in zoom-in-95 duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-3xl p-12 text-center transition-all hover:border-indigo-400 dark:hover:border-indigo-500/50">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                  <CloudArrowUpIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your study material here</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">PDF files up to 20MB</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 pointer-events-none">
                  Select File
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                <span>Files are processed temporarily and not stored.</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="relative inline-block mb-8">
              <div className="w-20 h-20 border-4 border-indigo-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SparklesIcon className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Analyzing "{fileName}"</h3>
            <p className="text-slate-500 dark:text-slate-400 animate-pulse">Our AI is extracting key concepts for you...</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">
                  Analysis Complete
                </span>
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{result.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">{result.summary}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setResult(null); setFileName(null); }}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800"
                >
                  Clear
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Export to PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {result.definitions.map((def, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all"
                >
                  <h4 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                    {def.term}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {def.definition}
                  </p>
                  {def.context && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 text-sm italic text-slate-400 dark:text-slate-500">
                      Context: "{def.context}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.definitions.length === 0 && (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">No definitions found in this document.</p>
              </div>
            )}
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
             <div className="p-1 rounded-full bg-red-100 dark:bg-red-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </div>
             <span>{error}</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-100 dark:border-slate-900 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <span className="font-display font-semibold text-slate-900 dark:text-white">Term AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-500">
            <span className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-pointer">Help Center</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-600">© 2024 Term AI Lab. Built for Students.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
