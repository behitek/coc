import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { analyzeClan } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ClanDetails, WarLogEntry } from '../types';

interface GeminiAdvisorProps {
  clan: ClanDetails;
  warLog: WarLogEntry[];
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ clan, warLog }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    const result = await analyzeClan(clan, warLog);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Bot className="mr-2 text-coc-accent" /> Gemini Clan Advisor
        </h2>
        {!analysis && !isLoading && (
          <button 
            onClick={handleAnalyze}
            className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
          >
            <Sparkles size={16} className="mr-2" /> Run Analysis
          </button>
        )}
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-32 bg-slate-700 rounded w-full"></div>
        </div>
      )}

      {analysis && (
        <div className="prose prose-invert prose-sm max-w-none bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
          <ReactMarkdown>{analysis}</ReactMarkdown>
          <div className="mt-4 flex justify-end">
             <button 
               onClick={() => setAnalysis(null)}
               className="text-xs text-slate-500 hover:text-white underline"
             >
               Clear Analysis
             </button>
          </div>
        </div>
      )}
      
      {!analysis && !isLoading && (
        <div className="text-slate-400 text-sm bg-slate-900/30 p-4 rounded border border-dashed border-slate-700">
            Click "Run Analysis" to let Gemini AI review your member list, war performance, and donation ratios to identify MVPs and potential kicks.
        </div>
      )}
    </div>
  );
};
